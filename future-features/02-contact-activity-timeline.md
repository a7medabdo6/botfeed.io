# Contact Notes & Activity Timeline

**Priority:** Medium | **Effort:** Low (1 week) | **Category:** CRM

## Summary

A unified timeline on the contact profile showing all interactions: messages, tag changes, agent assignments, campaign sends, form submissions, and manual notes.

## Key Features

- Chronological activity feed on contact detail page
- Manual notes with rich text (agents can add context)
- Auto-logged events: tag added/removed, assigned to agent, campaign sent, order placed
- Filter timeline by event type
- Pin important notes to the top

## Technical Notes

- New `ContactActivity` model: `{ contact_id, type, data, created_by, created_at }`
- Log events from existing controllers (tag, assignment, campaign, order)
- Frontend: new `ActivityTimeline` component in contact sidebar
- Notes: simple CRUD with `POST /api/contacts/:id/notes`
