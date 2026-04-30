# AI Copilot for Agents

**Priority:** Very High | **Effort:** High (4-6 weeks) | **Category:** AI / Differentiator

## Summary

A full AI assistant panel alongside the chat that summarizes conversations, drafts replies, detects sentiment, and suggests next-best actions.

## Key Features

- **Conversation summary:** one-click summary of the entire thread
- **Reply drafting:** AI generates a response based on context + knowledge base
- **Sentiment detection:** flag angry/frustrated contacts with visual indicator
- **Next-best action:** suggest tag, assign to team, send template, escalate
- **Real-time translation:** translate incoming messages inline (leverages i18n infra)
- **Knowledge base grounding:** answers sourced from reply materials + help articles
- **Tone adjustment:** make reply more formal, friendly, or concise

## Technical Notes

- Backend: `POST /api/ai/copilot` with action types (summarize, draft, translate, sentiment)
- Uses existing AI config (model selection, API keys from `/ai_config`)
- Context window: last N messages + contact profile + reply materials as RAG context
- Frontend: `CopilotPanel` component in chat sidebar (collapsible)
- Streaming responses via SSE or chunked transfer
