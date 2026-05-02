import {
  runCalendarCreateTool,
  runCalendarDeleteTool,
  runCalendarListTool,
  runSheetsAppendTool,
  runSheetsReadTool,
  runSheetsUpdateTool
} from './google-flow-tool-runner.js';

function normTargetHandle(h) {
  if (!h || h === 'default' || h === 'target') return 'tgt';
  return h;
}

function toolSuffix(nodeId, index) {
  const s = String(nodeId || index).replace(/[^a-z0-9]/gi, '');
  return (s.slice(-10) || `t${index}`).toLowerCase();
}

const CAL_CREATE_HINT =
  ' Put the customer WhatsApp number (and name if known) in the description so you can find the booking later.';

/**
 * Build OpenAI tools + dispatcher from flow graph (n8n-style wiring into ai_agent).
 * Falls back to legacy flat parameters on the agent node if no tool edges exist.
 */
export async function resolveAiAgentFromFlow(flow, agentNode, userId) {
  const agentId = agentNode.id;
  const incoming = flow.connections.filter((c) => c.target === agentId);
  const pAgent = agentNode.parameters || {};

  let chatbotId = null;
  let memoryConfig = null;

  for (const c of incoming) {
    const handle = normTargetHandle(c.targetHandle);
    const src = flow.nodes.find((n) => n.id === c.source);
    if (!src) continue;

    if (handle === 'model-in' && src.type === 'agent_chat_model') {
      chatbotId = src.parameters?.chatbot_id || null;
    }

    if (handle === 'memory-in' && src.type === 'agent_memory') {
      const mp = src.parameters || {};
      memoryConfig = {
        windowSize: Number(mp.window_size) || 20,
        sessionHours: Number(mp.session_hours) || 24
      };
    }
  }

  if (!chatbotId && pAgent.chatbot_id) {
    chatbotId = pAgent.chatbot_id;
  }

  const tools = [];
  const handlers = new Map();
  let bindIndex = 0;

  for (const c of incoming) {
    if (normTargetHandle(c.targetHandle) !== 'tool-in') continue;
    const src = flow.nodes.find((n) => n.id === c.source);
    if (!src) continue;
    const p = src.parameters || {};

    if (src.type === 'agent_tool_google_calendar') {
      const suf = toolSuffix(src.id, bindIndex);
      const gacc = p.google_account_id;
      const cal = p.calendar_db_id;
      if (p.tool_calendar_list) {
        const name = `calendar_list_${suf}`;
        tools.push({
          type: 'function',
          function: {
            name,
            description: `List upcoming Google Calendar events for linked calendar resource ${suf}. Use for schedule / appointment questions.`,
            parameters: {
              type: 'object',
              properties: {
                time_min: { type: 'string', description: 'ISO 8601 lower bound (optional)' },
                time_max: { type: 'string', description: 'ISO 8601 upper bound (optional)' },
                max_results: { type: 'integer', description: '1–50, default 10' }
              }
            }
          }
        });
        handlers.set(name, async (args) => {
          const r = await runCalendarListTool({
            userId,
            googleAccountId: gacc,
            calendarDbId: cal,
            timeMin: args.time_min,
            timeMax: args.time_max,
            maxResults: args.max_results
          });
          if (!r.ok) return r;
          return { ok: true, result: { events: r.events, summary_text: r.text } };
        });
      }
      if (p.tool_calendar_create) {
        const name = `calendar_create_${suf}`;
        tools.push({
          type: 'function',
          function: {
            name,
            description: `Create an event on Google Calendar resource ${suf}.${CAL_CREATE_HINT}`,
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                description: { type: 'string' },
                start_iso: { type: 'string' },
                end_iso: { type: 'string' }
              },
              required: ['summary', 'start_iso']
            }
          }
        });
        handlers.set(name, async (args) => {
          const r = await runCalendarCreateTool({
            userId,
            googleAccountId: gacc,
            calendarDbId: cal,
            summary: args.summary,
            description: args.description,
            startIso: args.start_iso,
            endIso: args.end_iso
          });
          if (!r.ok) return r;
          return { ok: true, result: { message: r.message } };
        });
      }
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_calendar_list') {
      const suf = toolSuffix(src.id, bindIndex);
      const gacc = p.google_account_id;
      const cal = p.calendar_db_id;
      const name = `calendar_list_${suf}`;
      tools.push({
        type: 'function',
        function: {
          name,
          description: `List upcoming Google Calendar events (resource ${suf}).`,
          parameters: {
            type: 'object',
            properties: {
              time_min: { type: 'string', description: 'ISO 8601 lower bound (optional)' },
              time_max: { type: 'string', description: 'ISO 8601 upper bound (optional)' },
              max_results: { type: 'integer', description: '1–50, default 10' }
            }
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runCalendarListTool({
          userId,
          googleAccountId: gacc,
          calendarDbId: cal,
          timeMin: args.time_min,
          timeMax: args.time_max,
          maxResults: args.max_results
        });
        if (!r.ok) return r;
        return { ok: true, result: { events: r.events, summary_text: r.text } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_calendar_create') {
      const suf = toolSuffix(src.id, bindIndex);
      const gacc = p.google_account_id;
      const cal = p.calendar_db_id;
      const name = `calendar_create_${suf}`;
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Create a Google Calendar event (resource ${suf}).${CAL_CREATE_HINT}`,
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              description: { type: 'string' },
              start_iso: { type: 'string' },
              end_iso: { type: 'string' }
            },
            required: ['summary', 'start_iso']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runCalendarCreateTool({
          userId,
          googleAccountId: gacc,
          calendarDbId: cal,
          summary: args.summary,
          description: args.description,
          startIso: args.start_iso,
          endIso: args.end_iso
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_calendar_delete') {
      const suf = toolSuffix(src.id, bindIndex);
      const gacc = p.google_account_id;
      const cal = p.calendar_db_id;
      const name = `calendar_delete_${suf}`;
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Delete a Google Calendar event by ID (resource ${suf}).`,
          parameters: {
            type: 'object',
            properties: {
              event_id: { type: 'string', description: 'Google Calendar event id' }
            },
            required: ['event_id']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runCalendarDeleteTool({
          userId,
          googleAccountId: gacc,
          calendarDbId: cal,
          eventId: args.event_id
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_sheets') {
      const suf = toolSuffix(src.id, bindIndex);
      const name = `sheets_append_${suf}`;
      const gacc = p.google_account_id;
      const sheet = p.sheet_db_id;
      const tab = p.sheet_tab_name || 'Sheet1';
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Append one row to Google Sheet resource ${suf} (values left-to-right).`,
          parameters: {
            type: 'object',
            properties: {
              row_values: {
                type: 'array',
                items: { type: 'string' },
                description: 'Cell values A, B, C…'
              }
            },
            required: ['row_values']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runSheetsAppendTool({
          userId,
          googleAccountId: gacc,
          sheetDbId: sheet,
          sheetTabName: tab,
          rowValues: args.row_values
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_sheets_read') {
      const suf = toolSuffix(src.id, bindIndex);
      const name = `sheets_read_${suf}`;
      const gacc = p.google_account_id;
      const sheet = p.sheet_db_id;
      const tab = p.sheet_tab_name || 'Sheet1';
      const defaultRange = `${tab}!A1:Z200`;
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Read values from Google Sheet ${suf}. Optional range in A1 notation; default ${defaultRange}.`,
          parameters: {
            type: 'object',
            properties: {
              range_a1: {
                type: 'string',
                description: `A1 range, e.g. ${defaultRange} or Sheet1!A1:D10`
              }
            }
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runSheetsReadTool({
          userId,
          googleAccountId: gacc,
          sheetDbId: sheet,
          sheetTabName: tab,
          rangeA1: args.range_a1 || p.sheets_read_range_a1
        });
        if (!r.ok) return r;
        return { ok: true, result: { values: r.values, summary_text: r.text, range: r.range } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_sheets_append') {
      const suf = toolSuffix(src.id, bindIndex);
      const name = `sheets_append_${suf}`;
      const gacc = p.google_account_id;
      const sheet = p.sheet_db_id;
      const tab = p.sheet_tab_name || 'Sheet1';
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Append one row to Google Sheet resource ${suf}.`,
          parameters: {
            type: 'object',
            properties: {
              row_values: { type: 'array', items: { type: 'string' }, description: 'Cell values left to right' }
            },
            required: ['row_values']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runSheetsAppendTool({
          userId,
          googleAccountId: gacc,
          sheetDbId: sheet,
          sheetTabName: tab,
          rowValues: args.row_values
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
      bindIndex += 1;
    }

    if (src.type === 'agent_tool_google_sheets_update') {
      const suf = toolSuffix(src.id, bindIndex);
      const name = `sheets_update_${suf}`;
      const gacc = p.google_account_id;
      const sheet = p.sheet_db_id;
      const tab = p.sheet_tab_name || 'Sheet1';
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Update a full row on Google Sheet ${suf} (row 1 = header).`,
          parameters: {
            type: 'object',
            properties: {
              row_number: { type: 'integer', description: '1-based sheet row index' },
              row_values: { type: 'array', items: { type: 'string' }, description: 'New cell values for the row' }
            },
            required: ['row_number', 'row_values']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runSheetsUpdateTool({
          userId,
          googleAccountId: gacc,
          sheetDbId: sheet,
          sheetTabName: tab,
          rowNumber: args.row_number,
          rowValues: args.row_values
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
      bindIndex += 1;
    }
  }

  // Legacy: single-node ai_agent with embedded tool flags (no tool-in edges)
  if (!tools.length && pAgent.google_account_id) {
    const gacc = pAgent.google_account_id;
    const cal = pAgent.calendar_db_id;
    const sheet = pAgent.sheet_db_id;
    const tab = pAgent.sheet_tab_name || 'Sheet1';
    if (pAgent.tool_calendar_list) {
      const name = 'google_calendar_list_events';
      tools.push({
        type: 'function',
        function: {
          name,
          description: "List upcoming events on the business's linked Google Calendar.",
          parameters: {
            type: 'object',
            properties: {
              time_min: { type: 'string' },
              time_max: { type: 'string' },
              max_results: { type: 'integer' }
            }
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runCalendarListTool({
          userId,
          googleAccountId: gacc,
          calendarDbId: cal,
          timeMin: args.time_min,
          timeMax: args.time_max,
          maxResults: args.max_results
        });
        if (!r.ok) return r;
        return { ok: true, result: { events: r.events, summary_text: r.text } };
      });
    }
    if (pAgent.tool_calendar_create) {
      const name = 'google_calendar_create_event';
      tools.push({
        type: 'function',
        function: {
          name,
          description: `Create a Google Calendar event.${CAL_CREATE_HINT}`,
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              description: { type: 'string' },
              start_iso: { type: 'string' },
              end_iso: { type: 'string' }
            },
            required: ['summary', 'start_iso']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runCalendarCreateTool({
          userId,
          googleAccountId: gacc,
          calendarDbId: cal,
          summary: args.summary,
          description: args.description,
          startIso: args.start_iso,
          endIso: args.end_iso
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
    }
    if (pAgent.tool_sheets_append) {
      const name = 'google_sheets_append_row';
      tools.push({
        type: 'function',
        function: {
          name,
          description: 'Append a row to the linked Google Sheet.',
          parameters: {
            type: 'object',
            properties: {
              row_values: { type: 'array', items: { type: 'string' } }
            },
            required: ['row_values']
          }
        }
      });
      handlers.set(name, async (args) => {
        const r = await runSheetsAppendTool({
          userId,
          googleAccountId: gacc,
          sheetDbId: sheet,
          sheetTabName: tab,
          rowValues: args.row_values
        });
        if (!r.ok) return r;
        return { ok: true, result: { message: r.message } };
      });
    }
  }

  async function dispatchTool(name, rawArgs) {
    let args = {};
    try {
      args = typeof rawArgs === 'string' && rawArgs.trim() ? JSON.parse(rawArgs) : rawArgs || {};
    } catch (e) {
      return { ok: false, error: `Invalid tool arguments JSON: ${e.message}` };
    }
    const fn = handlers.get(name);
    if (!fn) {
      return { ok: false, error: `Unknown tool: ${name}` };
    }
    try {
      return await fn(args);
    } catch (e) {
      return { ok: false, error: e.message || String(e) };
    }
  }

  return { chatbotId, tools, dispatchTool, memoryConfig };
}
