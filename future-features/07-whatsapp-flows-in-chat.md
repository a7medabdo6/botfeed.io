# WhatsApp Flows in Chat

**Priority:** Medium | **Effort:** Medium (2 weeks) | **Category:** Automation

## Summary

Allow agents to send a WhatsApp Flow (built in Form Builder) directly within a conversation. The submission appears inline in the chat thread.

## Key Features

- "Send Flow" button in chat toolbar
- Pick from published forms
- Flow submission renders as a structured card in chat
- Auto-tag or trigger automation based on flow responses
- Submission data linked to the contact profile

## Technical Notes

- Extends existing Form Builder and chat infrastructure
- New message type `flow_response` in the Message model
- Frontend: `SendFlowModal` component in chat, `FlowResponseCard` for rendering
- Backend: link `Submission` to `Message` via `message_id` field
