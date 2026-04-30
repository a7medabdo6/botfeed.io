# Knowledge Base / Help Center

**Priority:** Medium | **Effort:** Medium (3 weeks) | **Category:** Self-Service

## Summary

A public-facing help center with articles and categories that agents can reference in chat and the AI bot uses for auto-replies.

## Key Features

- Article editor with rich text and media
- Categories and subcategories
- Full-text search
- Public URL per article (shareable in chat)
- Agent sidebar: search and insert article link in one click
- AI bot uses articles as context for automated responses
- Analytics: most viewed articles, search queries with no results

## Technical Notes

- New models: `Article` (title, slug, body, category_id, status) and `ArticleCategory`
- Public routes: `/help/:slug` (no auth required)
- Backend: CRUD endpoints under `/api/articles`
- Frontend: `/knowledge-base` management route + public reader layout
- Integrates with AI copilot as RAG data source
