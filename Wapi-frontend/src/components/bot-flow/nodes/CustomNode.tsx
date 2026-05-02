/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ButtonMessageNode } from "./ButtonMessageNode";
import { ConditionNode } from "./ConditionNode";
import { DelayNode } from "./DelayNode";
import { GenericNode } from "./GenericNode";
import { ListMessageNode } from "./ListMessageNode";
import { LocationNode } from "./LocationNode";
import { MediaMessageNode } from "./MediaMessageNode";
import { TextMessageNode } from "./TextMessageNode";
import { TriggerNode } from "./TriggerNode";
import { AssignChatbotNode } from "./AssignChatbotNode";
import { QuickReplyNode } from "./QuickReplyNode";
import { SendTemplateNode } from "./SendTemplateNode";
import { CallToActionNode } from "./CallToActionNode";
import { GoogleSheetsNode } from "./GoogleSheetsNode";
import { CalendarEventNode } from "./CalendarEventNode";
import { AIAgentNode } from "./AIAgentNode";
import { AgentChatModelNode } from "./AgentChatModelNode";
import { AgentGoogleCalendarToolNode } from "./AgentGoogleCalendarToolNode";
import { AgentGoogleSheetsToolNode } from "./AgentGoogleSheetsToolNode";
import { AgentMemoryNode } from "./AgentMemoryNode";

export function CustomNode(props: any) {
  switch (props.data.nodeType) {
    case "condition":
      return <ConditionNode {...props} />;
    case "assign_chatbot":
      return <AssignChatbotNode {...props} />;
    case "ai_agent":
      return <AIAgentNode {...props} />;
    case "agent_chat_model":
      return <AgentChatModelNode {...props} />;
    case "agent_memory":
      return <AgentMemoryNode {...props} />;
    case "agent_tool_google_calendar":
    case "agent_tool_google_calendar_list":
    case "agent_tool_google_calendar_create":
    case "agent_tool_google_calendar_delete":
      return <AgentGoogleCalendarToolNode {...props} />;
    case "agent_tool_google_sheets":
    case "agent_tool_google_sheets_read":
    case "agent_tool_google_sheets_append":
    case "agent_tool_google_sheets_update":
      return <AgentGoogleSheetsToolNode {...props} />;
    case "delay":
      return <DelayNode {...props} />;
    case "google_sheets":
      return <GoogleSheetsNode {...props} />;
    case "calendar_event":
      return <CalendarEventNode {...props} />;
    case "trigger":
    case "widget_trigger":
      return <TriggerNode {...props} />;
    case "text_message":
    case "send-message":
      return <TextMessageNode {...props} />;
    case "button_message":
      return <ButtonMessageNode {...props} />;
    case "quick_reply":
      return <QuickReplyNode {...props} />;
    case "send_template":
      return <SendTemplateNode {...props} />;
    case "call_to_action":
      return <CallToActionNode {...props} />;
    case "list-message":
    case "list_message":
      return <ListMessageNode {...props} />;
    case "media_message":
      return <MediaMessageNode {...props} />;
    case "location":
      return <LocationNode {...props} />;
    default:
      return <GenericNode {...props} />;
  }
}
