# Chat Auto-Assignment Rules

**Priority:** High | **Effort:** Low (1-2 weeks) | **Category:** Workflow

## Summary

Automatically assign incoming conversations to agents based on configurable rules: round-robin, least-busy, skill-based, or by working hours availability.

## Key Features

- Assignment strategies: round-robin, least-active-conversations, random
- Skill-based routing: assign based on tags or contact attributes
- Working hours awareness: skip offline agents
- Max concurrent chat limit per agent
- Fallback to unassigned queue if no agent is available
- Override: manual assignment always takes priority

## Technical Notes

- New `AssignmentRule` model: `{ workspace_id, strategy, max_chats, fallback, filters }`
- Assignment logic runs in `whatsapp-webhook.controller.js` on new conversation
- Tracks agent load via `Session` model (active conversations count)
- Frontend: settings page under Default Action or a new route `/assignment-rules`
