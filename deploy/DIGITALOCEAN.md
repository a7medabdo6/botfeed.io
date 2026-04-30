# Deploy on DigitalOcean (Docker Compose)

## Prerequisites

- A **Droplet** (Ubuntu 22.04+) with Docker and Docker Compose plugin installed.
- DNS **A** (and **AAAA** if you use IPv6) records:
  - `botfeed.io` → Droplet IP  
  - `www.botfeed.io` → Droplet IP (optional but included in Caddyfile)  
  - `api.botfeed.io` → Droplet IP  

## Secrets

`docker-compose.yml` loads **`deploy/env/wapi-api.env.production.example`** and **`deploy/env/wapi-frontend.env.production.example`** (files in git) so `docker compose up` works right after clone.

**On the server**, edit those two files and replace every `CHANGE_ME` (do not commit real secrets back to GitHub if you use placeholders in the tracked examples).

Generate strong values, for example:

```bash
openssl rand -base64 48   # JWT_SECRET / SESSION_SECRET
openssl rand -base64 32   # NEXTAUTH_SECRET
```

- **API file** — set `JWT_SECRET`, `SESSION_SECRET`, `ENCRYPTION_KEY` (exactly **32 ASCII characters** for the default AES-256-CBC helper), `GOOGLE_*`, admin password, payment keys. **MongoDB:** Compose sets `MONGODB_URI=mongodb://mongo:27017/wapi` for the `api` service; use Atlas only if you remove the `mongo` service and set `MONGODB_URI` yourself.
- **Frontend file** — set `NEXTAUTH_SECRET` and optional OAuth client IDs for NextAuth.

**Optional (gitignored secrets):** copy to `wapi-api/.env.production` and `Wapi-frontend/.env.production`, fill them in, then change `env_file` in `docker-compose.yml` to point at those paths instead of `deploy/env/*.example`.

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
