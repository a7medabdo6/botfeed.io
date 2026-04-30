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

export function CustomNode(props: any) {
  switch (props.data.nodeType) {
    case "condition":
      return <ConditionNode {...props} />;
    case "assign_chatbot":
      return <AssignChatbotNode {...props} />;
    case "delay":
      return <DelayNode {...props} />;
    case "trigger":
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
