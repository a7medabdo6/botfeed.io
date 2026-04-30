# Internal Team Chat

**Priority:** Medium | **Effort:** Medium (2 weeks) | **Category:** Collaboration

## Summary

A lightweight internal messaging system for agent-to-agent communication — discuss cases, escalate, or share context without leaving the platform.

## Key Features

- Direct messages between agents
- Team channels (per-team group chat)
- @mention agents to notify them
- Share a customer conversation link in internal chat
- Unread count badge in sidebar
- File/image sharing

## Technical Notes

- New `InternalMessage` model: `{ channel_id, sender_id, content, type, created_at }`
- New `Channel` model: `{ type: 'direct'|'team', members[], workspace_id }`
- Real-time via existing Socket.IO (new namespace or room prefix)
- Frontend: new `/internal-chat` route or slide-over panel
- Permission: available to all agents by default
