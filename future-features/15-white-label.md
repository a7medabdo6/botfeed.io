# White-Label / Reseller Mode

**Priority:** Very High | **Effort:** High (4-6 weeks) | **Category:** Revenue / Growth

## Summary

Allow agencies and resellers to offer Wapi under their own brand with custom domain, logo, colors, and email sender identity.

## Key Features

- Custom domain mapping (CNAME-based)
- Per-workspace branding: logo (light/dark), favicon, primary color, app name
- Custom email sender (SMTP or SendGrid subuser)
- Remove "Powered by Wapi" branding
- Reseller dashboard: manage client workspaces, billing, usage
- Custom pricing: resellers set their own plan prices
- Sub-account provisioning API

## Technical Notes

- Extend `Setting` model with branding fields (already partially exists)
- Custom domain: reverse proxy config or Vercel/Cloudflare domain mapping
- New `Reseller` model: `{ user_id, brand, domain, smtp_config, commission }`
- Admin panel: reseller management section
- Frontend: dynamic theme from workspace settings (already uses CSS variables)
- Email: configurable transport per workspace in mail utility
