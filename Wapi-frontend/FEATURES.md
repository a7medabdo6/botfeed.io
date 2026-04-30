# Wapi — Feature Overview

A comprehensive WhatsApp Business platform for customer engagement, automation, and e-commerce.

---

## Authentication & Onboarding

| Feature | Description |
|---------|-------------|
| **Login / Register** | Email/phone authentication with role-based access. Supports demo mode credentials. |
| **OTP Verification** | Email-based OTP flow for account verification during registration. |
| **Password Recovery** | Forgot password → OTP verification → reset password flow. |
| **Workspace Switcher** | Users can create, select, edit, and delete workspaces. A workspace must be selected before accessing the main app. Each workspace operates as an isolated environment. |

---

## Dashboard

Real-time overview of key metrics: message volume, active conversations, subscription status, and quick-action cards. Acts as the home screen after login.

**Route:** `/dashboard`

---

## Inbox / Live Chat

Full-featured conversational inbox powered by WebSocket for real-time updates.

- Send and receive text, images, documents, audio, video, location, and contacts
- Assign conversations to agents or teams
- Tag conversations and contacts inline
- Internal notes visible only to agents
- AI-powered reply suggestions
- Chat search and filtering by status, assignment, or tags
- Unread count badges and notification sounds

**Route:** `/chat`

---

## Chat Theme

Customize the look and feel of the chat interface — bubble colors, backgrounds, and preset themes.

**Route:** `/chat_theme`

---

## WhatsApp Connection

### Connect WABA

Onboarding wizard to connect a WhatsApp Business Account:

- **Cloud API (Official):** Embedded signup via Meta, API key and webhook configuration
- **Baileys (Unofficial):** QR code scan to connect a regular WhatsApp number
- Step-by-step setup guide with validation

**Route:** `/connect_waba`

### Manage Phone Numbers

List all connected WhatsApp numbers with per-number settings, status monitoring, and configuration.

**Routes:** `/manage_waba`, `/manage_waba/[id]`

---

## Message Templates

Create, edit, and manage WhatsApp-approved message templates.

- Visual template editor with header (text/image/video/document), body, footer, and buttons
- Variable placeholders with sample values
- Sync templates from Meta
- **Template Library:** Browse and clone pre-built templates (`/templates?tab=explore`)
- Per-phone-number template management

**Routes:** `/templates`, `/templates/[id]/create`, `/templates/[id]/edit/[templateId]`

---

## Campaigns (Broadcast)

Send bulk WhatsApp messages to contact segments using approved templates.

- Campaign creation wizard: select audience, template, schedule
- Real-time delivery tracking (sent, delivered, read, failed)
- Campaign statistics and analytics

**Routes:** `/campaigns`, `/campaigns/create`

---

## Automation

### Flow Builder

Visual drag-and-drop automation builder with node types:

- **Triggers:** Message received, keyword match, contact joined
- **Actions:** Send text, buttons, list menu, media, location
- **Logic:** Delay, conditions, branching
- List view of all flows with enable/disable toggle

**Routes:** `/flow_builder`, `/flow_builder/builder`, `/flow_builder/builder/[id]`

### Keyword Actions

Create automations that trigger on specific keywords or patterns in incoming messages.

**Routes:** `/keyword_action`, `/keyword_action/create`, `/keyword_action/[id]/edit`

### Default Action (Message Bots)

Configure fallback behavior when no automation matches:

- Off-hours auto-replies
- Routing rules
- Working hours configuration
- WABA-level bot settings

**Route:** `/default_action`

### Reply Materials

Reusable content blocks for quick replies and automation responses:

- Quick reply snippets
- Chatbot training data
- Sequences (multi-step drip messages)
- Catalog links and template references

**Route:** `/reply_materials`

---

## AI Features

### AI Configuration (Setup)

Configure AI capabilities for the platform:

- Model selection and API key management
- AI assistant settings
- Configuration summary dashboard

**Route:** `/ai_config`

### WhatsApp Business Calling (AI Voice)

AI-powered voice calling agents for WhatsApp Business:

- Create and configure call agents with prompts and behavior rules
- Call log history with recordings and transcriptions
- Agent performance tracking

**Routes:** `/whatsapp_calling/agents`, `/whatsapp_calling/logs`

---

## Contacts (CRM)

Centralized contact management system.

- Contact list with search, filters, and pagination
- Contact profiles with conversation history
- Import contacts via CSV/Excel with progress tracking
- Export contacts
- Custom fields (columns) for extended contact data
- Segment contacts by tags, fields, or activity

**Route:** `/contacts`

### Custom Fields

Define additional data fields for contacts beyond the defaults (name, email, phone).

**Route:** `/columns`

### Import Jobs

Track and manage bulk contact import operations with status and error reporting.

**Route:** `/import_jobs`

---

## Tags

Create and manage tags for organizing contacts and conversations. Tags can be applied inline from the chat inbox or from the contacts page.

**Route:** `/tags`

---

## Media Library

Central repository for uploaded media assets (images, documents, audio, video) that can be reused across messages, templates, and campaigns.

**Route:** `/media`

---

## Teams & Agents

### Teams

Create teams with specific permissions and assign agents to them. Manage team status and access control.

**Routes:** `/teams`, `/teams/create`, `/teams/[id]/edit`

### Agents

Manage support agents — create agent accounts, assign them to phone numbers or teams, and control what they can access.

**Routes:** `/agents`, `/agents/create`, `/agents/[id]/edit`

### Agent Tasks (Tickets)

Lightweight ticketing system for agents:

- Task list with status tracking (open, in progress, completed)
- Create and assign tasks to agents
- Comments and activity log per task
- Agent-specific task views

**Routes:** `/tasks`, `/tasks/edit/[taskId]`

---

## E-Commerce

### Orders

View and manage orders received via WhatsApp commerce integrations. Track order status and send status update messages using templates.

**Route:** `/orders`

### Order Auto-Messages

Configure automated messages triggered by order lifecycle events (e.g., order confirmed, shipped, delivered).

**Route:** `/orders/auto-message`

### Catalogues

Manage product catalogs synced with WhatsApp Commerce:

- Browse catalog overview
- Add, edit, and remove products
- Sync with Meta commerce catalog

**Routes:** `/catalogues`, `/catalogues/manage`, `/catalogues/manage/add`, `/catalogues/manage/edit/[id]`

### Webhooks (Commerce)

Manage incoming webhooks from e-commerce platforms (Shopify, WooCommerce, etc.) and map them to WhatsApp message templates.

**Routes:** `/webhooks`, `/webhooks/map_template/[id]`

---

## Form Builder

Design and publish WhatsApp Flows (Meta Flows) — interactive multi-step forms within WhatsApp.

- Visual form designer
- Publish/unpublish forms
- View submissions with statistics

**Routes:** `/form_builder`, `/form_builder/create`, `/form_builder/[id]/edit`, `/form_builder/[id]/submissions`

---

## Tools

### Website Widget

Generate an embeddable WhatsApp chat widget for any website:

- Integration code generator
- Widget list and per-widget configuration (colors, position, welcome message)

**Routes:** `/tools/widget`, `/tools/widgets`, `/tools/widgets/config/[id]`

### Link Generator / Short Links

Create WhatsApp deep links and QR codes for marketing:

- Custom pre-filled message links
- Short link management with click tracking

**Routes:** `/tools/link-generator`, `/tools/links`, `/tools/links/config/[id]`

---

## Subscriptions & Billing

Manage subscription plans and payments:

- View available plans with feature comparison
- Subscribe via Stripe, Razorpay, PayPal, or manual payment
- Usage tracking against plan limits
- Trial period management
- Subscription guard prompts unsubscribed users to upgrade

**Route:** `/subscriptions`

---

## Developer / API

API key management for external integrations. Includes an embedded API documentation viewer.

**Route:** `/developer`

---

## Account & Profile

- Edit profile information (name, email, phone, avatar)
- Change password

**Routes:** `/account_profile`, `/manage_profile`

---

## Landing Page & Marketing

### Landing Page

Public-facing marketing page with dynamic content from the backend: hero section, feature highlights, pricing table, FAQ, and testimonials.

**Route:** `/landing`

### Product Pages

Dedicated marketing pages for individual features:

- AI Support Agent
- WhatsApp Business Calling
- Flow Builder
- Shared Team Inbox
- Broadcast & Bulk Messages
- Instagram & Facebook Messenger

**Route:** `/product/*`

### Dynamic CMS Pages

Public pages rendered by slug with SEO metadata, powered by the backend page API.

**Route:** `/page/[slug]`

---

## Platform Capabilities

| Capability | Description |
|------------|-------------|
| **Role-Based Access Control** | Permissions enforced per route and per UI element via `RoleGuard` and `usePermissions`. |
| **Feature Guards** | Baileys (unofficial) workspaces automatically hide unsupported features like templates, campaigns, orders, and catalogues. |
| **Subscription Guard** | Trial expiry modal nudges users to upgrade. |
| **Maintenance Mode** | Global guard that shows a maintenance page when enabled. |
| **Multi-language (i18n)** | English, Arabic, and Spanish with RTL support. |
| **Theme & Currency** | Dark/light mode toggle, multi-currency display. |
| **Real-time Updates** | Socket.IO integration for live message delivery, read receipts, and presence. |
| **PWA Support** | Manifest and meta tags for installable web app experience. |
