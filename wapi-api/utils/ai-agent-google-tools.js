import { buildApiEndpoint, formatRequestHeaders } from './ai-utils.js';

const MAX_TOOL_ROUNDS = 8;

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

/**
 * OpenAI-compatible chat completions with tool loop (n8n-style agent).
 * @param {object} params
 * @param {Array} params.tools - OpenAI tool definitions
 * @param {(name: string, rawArgs: string) => Promise<{ok:boolean, result?:object, error?:string}>} params.dispatchTool
 */
export async function runGoogleToolsChatAgent({
  userId,
  model,
  apiKey,
  systemPrompt,
  userMessage,
  inputData,
  tools,
  dispatchTool
}) {
  if (!modelSupportsOpenAiStyleTools(model)) {
    const err = new Error(
      'AI Agent requires an AI model with request format "OpenAI" (e.g. OpenAI, Groq, Mistral, OpenRouter). Google native / Anthropic native formats are not supported yet.'
    );
    err.code = 'UNSUPPORTED_MODEL_FORMAT';
    throw err;
  }

  if (!Array.isArray(tools) || !tools.length) {
    throw new Error('No tools configured for this AI Agent.');
  }

  const cfg = { ...(model.config && typeof model.config === 'object' ? model.config : {}) };
  const temperature = typeof cfg.temperature === 'number' ? cfg.temperature : 0.4;
  const max_tokens = typeof cfg.max_tokens === 'number' ? cfg.max_tokens : 1200;

  const ctxBlock = [
    `Channel: WhatsApp. Customer phone: ${inputData.senderNumber || 'unknown'}.`,
    `Server time (ISO): ${new Date().toISOString()}.`,
    'Use tools when you need real calendar or sheet data, or to create/write. Then answer briefly in the same language as the customer.'
  ].join('\n');

  const messages = [
    {
      role: 'system',
      content: `${systemPrompt || 'You are a helpful assistant.'}\n\n${ctxBlock}`
    },
    { role: 'user', content: String(userMessage || '') }
  ];

  const apiEndpoint = buildApiEndpoint(model, apiKey);
  const headers = formatRequestHeaders(model, apiKey);
  const toolLog = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const body = {
      model: model.model_id,
      messages,
      tools,
      tool_choice: 'auto',
      temperature,
      max_tokens
    };

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

      for (const tc of toolCalls) {
        const fn = tc.function;
        const name = fn?.name;
        const rawArgs = fn?.arguments || '{}';
        const dispatched = await dispatchTool(name, rawArgs);
        toolLog.push({ name, ok: dispatched.ok, error: dispatched.error || null });
        const payload = dispatched.ok ? dispatched.result : { error: dispatched.error || 'Tool failed' };
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(payload)
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
