# Jabber Chat

A group chat app: password-protected channels, realtime messaging over WebSocket, JWT auth. NestJS + TypeORM + PostgreSQL backend, Angular (signals) frontend.

## Features

- **Auth** — register, login, `GET /auth/me`, JWT-based (`backend/src/auth`).
- **Channels** — create a password-protected channel, assign/join an existing one by ID + password, list your channels (`backend/src/channels`).
- **Messaging** — message history over REST, new messages pushed live over a Socket.IO gateway (`join_channel` / `send_message` events, `backend/src/messages/messages.gateway.ts`); content is encrypted at rest.
- **Dashboard UI** — left panel with your channel list + create/assign modal, header showing the current channel (with copy-channel-id), live-scrolling message view (`frontend/src/app/dashboard`).

See `backend/CLAUDE.md` and `frontend/CLAUDE.md` for the architecture and coding conventions in depth.

## Running it

### Local dev

Needs your own Postgres running (see `backend/.env.example` for connection vars) plus a `backend/.env` with `JWT_SECRET` set.
```
cd backend && npm run start:dev
cd frontend && npm start
```

### Docker

```
docker compose up --build
```
Frontend on `http://localhost:8080`, backend on `http://localhost:3000`. There is no Postgres service in `docker-compose.yml` — the backend connects to your own Postgres container running on the host (`DB_HOST=host.docker.internal`), using the credentials from `backend/.env`.

### Images on GHCR

`.github/workflows/create_image.yml` builds and pushes both images to GitHub Container Registry on every push to `master` (or manually via `workflow_dispatch`):
- `ghcr.io/wiotrek/jabber-chat-backend:latest`
- `ghcr.io/wiotrek/jabber-chat-frontend:latest`

Pull an image:
```
docker pull ghcr.io/wiotrek/jabber-chat-backend:latest
```
If the package is private, log in first:
```
docker login ghcr.io -u <github-username>
```

## Agents

Project-specific Claude Code subagents live in `.claude/agents/`. Invoke one by name: `@<name> <request>`.

- **`@code-reviewer`** — reviews a PR or the current diff for correctness, security, and this repo's backend/frontend conventions; posts findings as a PR comment.
- **`@stylizer`** — styles new or existing UI (buttons, inputs, modals, cards) in HTML/SCSS to match the dashboard's dark design system.
- **`@otis`** — keeps this README in sync with what the app actually does; run it after a feature, Dockerfile/workflow, or new agent lands.

## Contributing

Create a Pull Request from the gh CLI:
```
gh pr create --base master --head {current-branch}
```
Then ask `@code-reviewer` to review it.
