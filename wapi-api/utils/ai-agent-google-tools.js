import { buildApiEndpoint, formatRequestHeaders } from './ai-utils.js';

const MAX_TOOL_ROUNDS = 12;
/** Max characters per tool message back to the model (avoids context blowups from huge Sheets reads). */
const MAX_TOOL_MESSAGE_CHARS = 12000;

function extractAssistantText(msg) {
  const c = msg?.content;
  if (c == null) return '';
  if (typeof c === 'string') return c.trim();
  if (Array.isArray(c)) {
    return c
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && typeof part.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }
  return String(c).trim();
}

function modelSupportsOpenAiStyleTools(model) {
  const rf = (model.request_format || 'openai').toLowerCase();
  return rf === 'openai';
}

function truncateToolJson(str) {
  const s = String(str);
  if (s.length <= MAX_TOOL_MESSAGE_CHARS) return s;
  const cut = MAX_TOOL_MESSAGE_CHARS - 80;
  return `${s.slice(0, cut)}\n...[truncated ${s.length - cut} chars]`;
}

function serializeToolPayload(payload) {
  try {
    return truncateToolJson(JSON.stringify(payload));
  } catch {
    return '{"error":"Failed to serialize tool result"}';
  }
}

function buildContextBlock(inputData) {
  const contact = inputData?.contact && typeof inputData.contact === 'object' ? inputData.contact : {};
  const name =
    [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
    String(contact.name || contact.full_name || '').trim();
  const lines = [
    `Channel: WhatsApp. Customer phone: ${inputData?.senderNumber || 'unknown'}.`,
    name ? `Contact name (if known): ${name}.` : null,
    inputData?.contactId ? `Contact id: ${inputData.contactId}.` : null,
    `Server time (ISO): ${new Date().toISOString()}.`,
    'Use tools when you need real calendar or sheet data, or to create/write. If multiple tools are called in one turn, combine insights before replying.',
    'After tools succeed, answer briefly in the same language as the customer. If a tool returns an error field, explain it simply and suggest what to try next.'
  ].filter(Boolean);
  return lines.join('\n');
}

/**
 * OpenAI-compatible chat completions with tool loop (n8n-style agent).
 * @param {object} params
 * @param {Array} params.tools - OpenAI tool definitions
 * @param {string} [params.extraSystemPrompt] - Appended after chatbot system prompt (per-flow instructions)
 * @param {(name: string, rawArgs: string) => Promise<{ok:boolean, result?:object, error?:string}>} params.dispatchTool
 */
export async function runGoogleToolsChatAgent({
  userId,
  model,
  apiKey,
  systemPrompt,
  extraSystemPrompt,
  userMessage,
  inputData,
  tools,
  dispatchTool,
  conversationHistory
}) {
  if (!modelSupportsOpenAiStyleTools(model)) {
    const err = new Error(
      'AI Agent requires an AI model with request format "OpenAI" (e.g. OpenAI, Groq, Mistral, OpenRouter). Google native / Anthropic native formats are not supported yet.'
    );
    err.code = 'UNSUPPORTED_MODEL_FORMAT';
    throw err;
  }

  const hasTools = Array.isArray(tools) && tools.length > 0;

  const cfg = { ...(model.config && typeof model.config === 'object' ? model.config : {}) };
  const temperature = typeof cfg.temperature === 'number' ? cfg.temperature : 0.4;
  const max_tokens = typeof cfg.max_tokens === 'number' ? cfg.max_tokens : 1200;

  const ctxBlock = buildContextBlock(inputData || {});
  const flowExtra = String(extraSystemPrompt || '').trim();
  const systemContent = [
    systemPrompt || 'You are a helpful assistant.',
    flowExtra ? `Flow-specific instructions:\n${flowExtra}` : '',
    ctxBlock
  ]
    .filter(Boolean)
    .join('\n\n');

  const history = Array.isArray(conversationHistory) ? conversationHistory : [];

  const messages = [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: String(userMessage || '') }
  ];

  const apiEndpoint = buildApiEndpoint(model, apiKey);
  const headers = formatRequestHeaders(model, apiKey);
  const toolLog = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const body = {
      model: model.model_id,
      messages,
      temperature,
      max_tokens
    };
    if (hasTools) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.error?.message || errData.message || `Chat API failed (${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const msg = choice?.message;
    if (!msg) {
      throw new Error('Empty response from chat model');
    }

    const toolCalls = msg.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const assistantMsg = {
        role: 'assistant',
        tool_calls: toolCalls
      };
      const c0 = msg.content;
      if (c0 !== undefined && c0 !== null && c0 !== '') {
        assistantMsg.content = c0;
      }
      messages.push(assistantMsg);

      const toolResults = await Promise.all(
        toolCalls.map(async (tc) => {
          const fn = tc.function;
          const name = fn?.name;
          const rawArgs = fn?.arguments || '{}';
          const dispatched = await dispatchTool(name, rawArgs);
          const payload = dispatched.ok ? dispatched.result : { error: dispatched.error || 'Tool failed' };
          return { tc, name, dispatched, payload };
        })
      );

      for (const { tc, name, dispatched, payload } of toolResults) {
        toolLog.push({ name, ok: dispatched.ok, error: dispatched.error || null });
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: serializeToolPayload(payload)
        });
      }
      continue;
    }

    const text = extractAssistantText(msg);
    return { text, toolLog };
  }

  throw new Error('Too many tool rounds');
}

export { modelSupportsOpenAiStyleTools };
