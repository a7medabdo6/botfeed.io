# Quick Replies / Canned Responses

**Priority:** High | **Effort:** Low (1 week) | **Category:** Agent Productivity

## Summary

A searchable quick-reply palette accessible via `/` shortcut directly in the chat input. Agents can insert pre-written responses with variable placeholders instantly.

## Key Features

- `/` shortcut in chat input opens a searchable popup
- Variable insertion: `{{contact.name}}`, `{{contact.email}}`, `{{agent.name}}`
- Categorize snippets by topic (billing, shipping, greeting, etc.)
- Personal vs shared snippets (agent-level and team-level)
- Usage analytics: most-used snippets, search-with-no-result tracking

## Technical Notes

- Extends existing Reply Materials infrastructure
- Frontend: new `QuickReplyPalette` component triggered by `/` keydown in chat input
- Backend: new `GET /api/reply-materials/quick` endpoint with search/pagination
- Store recently used snippets in localStorage for faster access
