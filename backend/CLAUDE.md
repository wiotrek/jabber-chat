# Backend context

NestJS 12 API for Jabber Chat. TypeORM + PostgreSQL. **ESM throughout**:
`package.json` has `"type": "module"`, `tsconfig.json` uses
`module`/`moduleResolution: nodenext` — every relative import needs an
explicit `.js` extension (even in `.ts` files), e.g.
`import { User } from './entities/user.entity.js'`.

## Layout

- `src/users/entities/user.entity.ts`, `src/messages/entities/message.entity.ts`,
  `src/channels/entities/channel.entity.ts` — the three entities. `UsersModule`
  also provides `UsersService` (find/create); `MessagesModule` just registers
  the entity, no service/controller yet.
- `src/channels/` — `ChannelsService`/`ChannelsController` behind
  `@UseGuards(JwtAuthGuard)`: `POST /channels/create` (name + password, creator
  becomes the sole member), `GET /channels` (the caller's channels), and
  `GET /channels/:id` (that channel's messages, membership-checked). There is
  no join/invite endpoint yet, so a channel can't have more than one member
  in practice even though `Channel` supports it.
- `src/auth/` — JWT auth (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`).
  `AuthController` exposes `POST /auth/register`, `POST /auth/login`,
  `GET /auth/me` (guarded). `JwtStrategy.validate()` looks the user back up
  by id on every request (not just trusting the payload) and returns a
  `PublicUser` (see below), which lands on `request.user` — read it with the
  `@CurrentUser()` decorator. Protect a route with `@UseGuards(JwtAuthGuard)`.
  Requires `JWT_SECRET` env (no default — throws on boot if unset);
  `JWT_EXPIRES_IN` defaults to `1h`. No refresh tokens yet, access token only.
- `src/users/user.presenter.ts` — `toPublicUser(user)` strips the password
  hash before a `User` leaves the API. Always send a `User` through this
  (or reuse `AuthService`'s results) rather than returning the entity raw.
- `main.ts` has a global `ValidationPipe({ whitelist: true,
  forbidNonWhitelisted: true })` — DTOs need `class-validator` decorators to
  have any effect, and unknown body fields are rejected with 400.
- `src/database/data-source.ts` — standalone `DataSource` for the TypeORM
  CLI, exports `dataSourceOptions` which `app.module.ts` also consumes via
  `TypeOrmModule.forRoot(dataSourceOptions)`. Keep connection config in this
  one place, don't duplicate it.
- `src/database/migrations/` — committed migrations. `synchronize` is
  **always false** now; schema changes go through migrations only. See
  `docs/migrations.md` for the full workflow (generate/run/revert, why the
  CLI runs against the compiled `dist/` output, rules of thumb).
- `src/common/crypto/encrypted-column.transformer.ts` — generic TypeORM
  `ValueTransformer`, AES-256-GCM. Used as `Message.content`'s transformer so
  message bodies are encrypted at rest. Key comes from
  `MESSAGE_ENCRYPTION_KEY` env (base64, 32 bytes); required in production,
  deterministic dev fallback otherwise. Server-side ("at rest") encryption
  only, not E2EE — the server can read plaintext in memory.

## Entity conventions already in place

- `User.password` is `select: false` and must **never** be assigned
  directly. Set it via `await user.setPassword(plainPassword)` (hashes with
  bcrypt, 12 rounds) and check it via `user.comparePassword(plainPassword)`.
  There is deliberately no `@BeforeInsert`/`@BeforeUpdate` auto-hash hook —
  that pattern re-hashes on every unrelated save unless you track dirty
  state, which has silently corrupted passwords in other codebases.
- `Message` belongs to a `Channel` (`channelId`/`channel`,
  `ManyToOne`/`OneToMany` against `Channel.messages`) and has a sender
  (`senderId`/`user`, `ManyToOne`/`OneToMany` against `User.messages`) — group
  chat, not a one-to-one DM model. `User` <-> `Channel` is `ManyToMany`
  through a `channel_users` join table.
- `Channel.password` follows the same pattern as `User.password` —
  `select: false`, never assigned directly, set via
  `await channel.setPassword(plainPassword)` and checked via
  `channel.comparePassword(plainPassword)` (bcrypt, 12 rounds).
- All three entities import each other, so relation property types use
  `import type { Relation } from 'typeorm'` + `Relation<X>` wrapper, not the
  bare class. Without that, the compiled ESM output throws
  `ReferenceError: Cannot access 'X' before initialization` from the
  circular import at decorator-evaluation time. Keep this pattern for any
  new entity that references `User`, `Message`, or `Channel`.

## DB connection

Dev defaults (in `data-source.ts` / `app.module.ts`, overridable via
`DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` env vars) point at
the user's existing local `postgres:17` Docker container
(user/password `postgres`/`postgres`, database `jabber-chat`) — there is
**no** Postgres service in the root `docker-compose.yml` (deliberately left
empty; the user runs their own Postgres container outside this repo).

## Environment / tooling gotchas

- The user's default Node (pinned in `~/.zshrc`, not something to change) is
  v22.14.0, which is actually *below* what `@angular-devkit/schematics`
  (a transitive dep of `@nestjs/cli`/`@nestjs/schematics`) declares support
  for. On that version, `nest build`/`nest start` can crash with
  `ERR_REQUIRE_CYCLE_MODULE: Cannot require() ES Module .../ora/index.js in
  a cycle` — `ora@9+` is ESM-only and something in `@angular-devkit`
  `require()`s it. Fixed via a `package.json` `"overrides": { "ora":
  "5.4.1" }` (a CJS version already used elsewhere in the tree by
  `@nestjs/mau`'s `inquirer`). If `nest build` ever throws that error again
  after a dependency bump, check whether this override got dropped.
- Nothing loads `.env` automatically (no `dotenv`/`@nestjs/config` wired
  up) — `.env.example` documents the vars, but you must export them into the
  actual process env yourself (or add a loader) for local runs.

## Stack notes from the repo root README

Frontend is Angular (`frontend/CLAUDE.md` has its own Angular/TS
conventions). Root `README.md` lists the intended stack as
Angular/PostgreSQL/GraphQL, but the actual backend is NestJS + REST so far —
no GraphQL module exists yet.
