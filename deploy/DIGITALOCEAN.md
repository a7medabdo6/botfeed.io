# Deploy on DigitalOcean (Docker Compose)

## Prerequisites

- A **Droplet** (Ubuntu 22.04+) with Docker and Docker Compose plugin installed.
- DNS **A** (and **AAAA** if you use IPv6) records:
  - `botfeed.io` → Droplet IP  
  - `www.botfeed.io` → Droplet IP (optional but included in Caddyfile)  
  - `api.botfeed.io` → Droplet IP  

## Secrets

On the server, copy the examples and edit (do not commit real secrets to git):

```bash
cp deploy/env/wapi-api.env.production.example wapi-api/.env.production
cp deploy/env/wapi-frontend.env.production.example Wapi-frontend/.env.production
```

Generate strong values, for example:

```bash
openssl rand -base64 48   # JWT_SECRET / SESSION_SECRET
openssl rand -base64 32   # NEXTAUTH_SECRET
```

- **`wapi-api/.env.production`** — set `JWT_SECRET`, `SESSION_SECRET`, `ENCRYPTION_KEY` (exactly **32 ASCII characters** for the default AES-256-CBC helper), `GOOGLE_*`, admin password, payment keys. **MongoDB:** Compose sets `MONGODB_URI=mongodb://mongo:27017/wapi` for the `api` service; add your own `MONGODB_URI` only if you run the API **without** the bundled `mongo` container (e.g. Atlas).
- **`Wapi-frontend/.env.production`** — set `NEXTAUTH_SECRET` and optional OAuth client IDs for NextAuth.

## Google OAuth (API Calendar integration)

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client (Web):

- **Authorized JavaScript origins:** `https://botfeed.io`, `https://www.botfeed.io`
- **Authorized redirect URIs:** `https://api.botfeed.io/api/google/callback`

Match `GOOGLE_REDIRECT_URI` in `wapi-api/.env.production` exactly.

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Start

From the repository root (where `docker-compose.yml` is):

```bash
docker compose up -d --build
```

Caddy obtains **Let’s Encrypt** certificates automatically once DNS points to this host.

## Rebuild frontend after API URL changes

`NEXT_PUBLIC_*` values are baked in at **image build** time. After changing API URLs:

```bash
docker compose build web --no-cache && docker compose up -d web
```
