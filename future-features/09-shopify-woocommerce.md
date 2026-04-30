# Shopify / WooCommerce Deep Integration

**Priority:** High | **Effort:** Medium (3 weeks) | **Category:** E-Commerce

## Summary

One-click install for Shopify and WooCommerce that syncs products, orders, and customers — with order history visible in the chat sidebar.

## Key Features

- **Shopify:** OAuth app install flow, webhook auto-registration
- **WooCommerce:** API key pairing, webhook setup wizard
- Product sync to WhatsApp catalogues
- Order events auto-trigger messages (confirmed, shipped, delivered)
- Order history panel in contact chat sidebar
- Abandoned cart recovery: auto-send reminder after configurable delay

## Technical Notes

- New `Integration` model: `{ workspace_id, platform, credentials, sync_status }`
- Shopify: use Shopify Admin API + webhooks
- WooCommerce: use REST API v3 + webhooks
- Reuses existing order and catalogue models
- Frontend: `/integrations` route with platform cards and setup wizards
