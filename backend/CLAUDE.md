# Backend context

NestJS 12 API for Jabber Chat. TypeORM + PostgreSQL. **ESM throughout**:
`package.json` has `"type": "module"`, `tsconfig.json` uses
`module`/`moduleResolution: nodenext` — every relative import needs an
explicit `.js` extension (even in `.ts` files), e.g.
`import { User } from './entities/user.entity.js'`.

## Layout

- `src/users/entities/user.entity.ts`, `src/messages/entities/message.entity.ts`
  — the only two entities. `UsersModule`/`MessagesModule` just register them
  via `TypeOrmModule.forFeature`; no services/controllers exist yet.
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
- `User` <-> `Message` is a directed pair of `ManyToOne`/`OneToMany`
  (`sender`/`sentMessages`, `recipient`/`receivedMessages`), not a
  conversation/thread model — one-to-one DMs only so far, no group chat
  entity exists.
- Both entities import each other, so relation property types use
  `import type { Relation } from 'typeorm'` + `Relation<X>` wrapper, not the
  bare class. Without that, the compiled ESM output throws
  `ReferenceError: Cannot access 'X' before initialization` from the
  circular import at decorator-evaluation time. Keep this pattern for any
  new entity that references `User` or `Message`.

## DB connection

Dev defaults (in `data-source.ts` / `app.module.ts`, overridable via
`DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` env vars) point at
the user's existing local `postgres:17` Docker container
(user/password `postgres`/`postgres`, database `jabber-chat`) — there is
**no** Postgres service in the root `docker-compose.yml` (deliberately left
empty; the user runs their own Postgres container outside this repo).

## Stack notes from the repo root README

Frontend is Angular (`frontend/CLAUDE.md` has its own Angular/TS
conventions). Root `README.md` lists the intended stack as
Angular/PostgreSQL/GraphQL, but the actual backend is NestJS + REST so far —
no GraphQL module exists yet.
