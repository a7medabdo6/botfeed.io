# Drip / Sequence Campaigns

**Priority:** High | **Effort:** Medium (3 weeks) | **Category:** Marketing Automation

## Summary

Multi-step message sequences triggered by contact events with configurable delays, conditions, and exit rules.

## Key Features

- **Triggers:** contact created, tag added, form submitted, order placed, manual enrollment
- **Steps:** send template, send text, wait (delay), condition branch, add tag, assign agent
- **Visual sequence builder** (reuse flow builder node UI)
- **Exit conditions:** replied, unsubscribed, tag removed, sequence completed
- **Per-contact tracking:** which step each contact is on, pause/resume
- **Analytics:** drop-off per step, completion rate, reply rate

## Technical Notes

- Extends existing sequence queue (Redis + BullMQ)
- New `Sequence` model with `steps[]` array and `SequenceEnrollment` per contact
- Worker processes next step based on `next_run_at` timestamp
- Frontend: `/sequences` route, reuse flow builder node components
- Permission: `manage.sequences`
