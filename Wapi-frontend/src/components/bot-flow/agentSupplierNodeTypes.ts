/** n8n-style nodes wired into AI Agent (not part of main trigger chain). */
export const AGENT_SUPPLIER_NODE_TYPES = [
  "agent_chat_model",
  "agent_tool_google_calendar",
  "agent_tool_google_calendar_list",
  "agent_tool_google_calendar_create",
  "agent_tool_google_calendar_delete",
  "agent_tool_google_sheets",
  "agent_tool_google_sheets_read",
  "agent_tool_google_sheets_append",
  "agent_tool_google_sheets_update",
  "agent_memory",
] as const;

export type AgentSupplierNodeType = (typeof AGENT_SUPPLIER_NODE_TYPES)[number];

export const AGENT_SUPPLIER_NODE_TYPE_SET = new Set<string>(AGENT_SUPPLIER_NODE_TYPES);

export function isAgentGoogleCalendarToolNodeType(nt: string | undefined): boolean {
  if (!nt) return false;
  return (
    nt === "agent_tool_google_calendar" ||
    nt === "agent_tool_google_calendar_list" ||
    nt === "agent_tool_google_calendar_create" ||
    nt === "agent_tool_google_calendar_delete"
  );
}

export function isAgentGoogleSheetsToolNodeType(nt: string | undefined): boolean {
  if (!nt) return false;
  return (
    nt === "agent_tool_google_sheets" ||
    nt === "agent_tool_google_sheets_read" ||
    nt === "agent_tool_google_sheets_append" ||
    nt === "agent_tool_google_sheets_update"
  );
}
