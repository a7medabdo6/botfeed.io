# Customer Portal / Ticket Tracker

**Priority:** Medium | **Effort:** Medium (3 weeks) | **Category:** Customer Experience

## Summary

A self-service portal where end-customers can view their conversation history, track ticket status, and browse form submissions.

## Key Features

- Magic link or OTP-based login (no password)
- View open and resolved conversations
- Track ticket/task status
- View form submission history
- Start a new conversation from the portal
- Branded per workspace (logo, colors)

## Technical Notes

- Separate Next.js route group or standalone micro-frontend
- Auth: magic link via WhatsApp message or email OTP
- Backend: new `/api/portal/*` endpoints with contact-scoped auth middleware
- Read-only access to existing Message, Task, and Submission models
- Frontend: lightweight responsive UI (mobile-first, since users come from WhatsApp links)
