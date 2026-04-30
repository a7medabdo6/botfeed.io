# Analytics Dashboard

**Priority:** High | **Effort:** Medium (3 weeks) | **Category:** Reporting

## Summary

Comprehensive analytics beyond the current dashboard widgets — conversation metrics, agent performance, and customer engagement insights.

## Key Features

- **Conversation metrics:** total, open, resolved, avg resolution time, first-reply time
- **Agent performance:** messages per agent, response time, satisfaction score
- **Engagement:** busiest hours heatmap, messages by day/week/month
- **Campaign analytics:** delivery rate, open rate, reply rate per campaign
- **Export:** CSV/PDF export for all reports
- **Date range picker** with presets (today, 7d, 30d, custom)

## Technical Notes

- New `GET /api/analytics/*` endpoints with aggregation pipelines (MongoDB)
- Cache heavy aggregations in Redis with TTL
- Frontend: new `/analytics` route with chart components (recharts or chart.js)
- Permission: `view.analytics`
