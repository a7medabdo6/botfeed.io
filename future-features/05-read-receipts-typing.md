# Read Receipts & Typing Indicators

**Priority:** Medium | **Effort:** Low (1 week) | **Category:** Inbox UX

## Summary

Surface message delivery/read status per message bubble and show a "typing..." indicator when the contact is composing a message.

## Key Features

- Per-message status icons: sent, delivered, read (single/double/blue check)
- Typing indicator bubble when contact is typing
- Agent typing indicator sent to WhatsApp (so the contact sees it too)
- Status updates in real-time via existing Socket.IO

## Technical Notes

- WhatsApp Cloud API already sends status webhooks — store and emit via socket
- Update `Message` model to track `status` field (sent/delivered/read)
- Frontend: status icon component on each message bubble
- Typing: emit socket event on agent keydown (debounced), listen for contact typing webhook
