# Multi-Channel: Instagram DM + Facebook Messenger

**Priority:** Very High | **Effort:** High (6-8 weeks) | **Category:** Platform Expansion

## Summary

Unify Instagram DMs and Facebook Messenger into the same inbox alongside WhatsApp. One agent view for all messaging channels.

## Key Features

- Connect Instagram Business account via Meta OAuth
- Connect Facebook Page via Meta OAuth
- All messages appear in the unified inbox with channel badge (WA/IG/FB)
- Send text, images, quick replies, and templates per channel
- Channel-specific features: IG story replies, FB persistent menu
- Contact merging: link same customer across channels
- Per-channel analytics

## Technical Notes

- Meta Graph API for both IG and FB Messenger
- New `Channel` model: `{ type: 'whatsapp'|'instagram'|'messenger', credentials, workspace_id }`
- Abstract message service layer: `sendMessage(channel, contact, content)`
- Webhook handlers for IG and FB under `/webhook/instagram` and `/webhook/messenger`
- Frontend: channel selector in connect flow, channel badge on conversation cards
- Inbox filtering by channel
