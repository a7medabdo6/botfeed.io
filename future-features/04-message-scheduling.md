# Message Scheduling

**Priority:** Low | **Effort:** Low (1 week) | **Category:** Inbox

## Summary

Allow agents to compose a message and schedule it for a specific date/time. Useful for follow-ups and timezone-aware outreach.

## Key Features

- "Schedule" button next to "Send" in chat input
- Date/time picker with timezone display
- Scheduled messages queue visible per conversation
- Cancel or edit scheduled messages before they send
- Badge indicator showing pending scheduled messages

## Technical Notes

- New `ScheduledMessage` model: `{ contact_id, waba_id, content, type, scheduled_at, status }`
- Cron job (similar to campaign scheduler) processes due messages every minute
- Frontend: `ScheduleModal` component, `scheduledMessageApi` RTK Query endpoints
- Reuses existing message-sending service for actual delivery
