# API (Express) — DigitalOcean / Docker
FROM node:22-bookworm-slim

# Use HTTPS for GitHub so npm/git deps work without SSH keys (e.g. libsignal-node via ssh://).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git \
    && rm -rf /var/lib/apt/lists/* \
    && git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
    && git config --global url."https://github.com/".insteadOf "git@github.com:"

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
