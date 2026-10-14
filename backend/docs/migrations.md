# Database migrations

This project uses [TypeORM](https://typeorm.io) with PostgreSQL. In development,
`TypeOrmModule.forRoot` in `src/app.module.ts` runs with `synchronize: true`
(auto-sync the schema from entities), but that is disabled in production
(`synchronize: process.env.NODE_ENV !== 'production'`). Production (and any
long-lived environment) needs real, versioned **migrations** instead, so
schema changes are reviewable, repeatable, and reversible.

This repo does not have the migration CLI wired up yet. This doc covers both
the one-time setup and the day-to-day commands once it's in place.

## Why not just use `synchronize: true` everywhere?

`synchronize` compares entities to the DB and alters tables to match on every
boot. It's convenient locally but dangerous anywhere with real data — it can
silently drop columns/tables when an entity changes, with no way to review
the change beforehand or roll it back. Migrations are explicit SQL (or
query-builder) steps you write once, commit, and run deliberately.

## One-time setup

### 1. A standalone `DataSource` for the CLI

The TypeORM CLI needs a `DataSource` instance it can import directly — it
doesn't go through Nest's DI container. Create `src/database/data-source.ts`:

```ts
import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Message } from '../messages/entities/message.entity.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'jabber-chat',
  entities: [User, Message],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
```

Then have `app.module.ts` reuse the same options instead of duplicating the
connection config:

```ts
import { dataSourceOptions } from './database/data-source.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    MessagesModule,
  ],
  // ...
})
export class AppModule {}
```

### 2. Why run the CLI against the *compiled* data source

This project is ESM + `moduleResolution: nodenext` with
`emitDecoratorMetadata`. Tools like `ts-node`/`tsx` can run TypeScript
directly, but they don't reliably emit the decorator metadata TypeORM needs to
infer column types from bare `@Column()` declarations (we rely on that for
plain `string`/`number` columns). `tsc` (via `nest build`) does emit it
correctly, so the reliable approach is: **build first, then point the
TypeORM CLI at the compiled `dist/database/data-source.js`.**

Generated migration *files* are still written as TypeScript into
`src/database/migrations/`, so they stay human-reviewable and
source-controlled — only the schema-diffing step runs against the build.

### 3. npm scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "migration:create": "typeorm migration:create",
    "migration:generate": "npm run build && typeorm migration:generate -d dist/database/data-source.js --esm",
    "migration:run": "npm run build && typeorm migration:run -d dist/database/data-source.js",
    "migration:revert": "npm run build && typeorm migration:revert -d dist/database/data-source.js",
    "migration:show": "npm run build && typeorm migration:show -d dist/database/data-source.js"
  }
}
```

`--esm` tells TypeORM to write the generated migration file with ESM
`import`/`export` syntax (matching `"type": "module"` in `package.json`)
instead of its CommonJS default.

### 4. First migration

Once the DB schema is empty (or only contains tables you're fine recreating),
turn `synchronize` off and generate the initial migration from the entities:

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
```

This connects to the DB, diffs it against `entities: [User, Message]`, and
writes a timestamped file like
`src/database/migrations/1739999999999-InitialSchema.ts` containing the
`CREATE TABLE` statements (and FK/index/unique constraints) in `up()`, and
their `DROP` counterparts in `down()`.

## Day-to-day usage

### Changing the schema

1. Edit the entity (e.g. add a column to `src/messages/entities/message.entity.ts`).
2. Generate a migration describing the diff:
   ```bash
   npm run migration:generate -- src/database/migrations/AddSomeColumn
   ```
3. **Read the generated SQL.** Auto-generated migrations are a good starting
   point, not a guarantee — check nullability, defaults, and anything that
   touches existing data before committing.
4. Apply it locally:
   ```bash
   npm run migration:run
   ```
5. Commit the migration file alongside the entity change.

### Hand-written migrations

For changes that aren't a schema diff — backfilling data, renaming a column
without losing data, anything `generate` can't infer — scaffold an empty file
instead and write `up()`/`down()` yourself:

```bash
npm run migration:create -- src/database/migrations/BackfillDisplayNames
```

### Running migrations

```bash
npm run migration:run       # applies all pending migrations, in order
npm run migration:revert    # reverts the most recently applied migration
npm run migration:show      # lists migrations and whether each has been run
```

In deployed environments, run `migration:run` as an explicit step before the
app starts (e.g. in the deploy pipeline / container entrypoint) — never rely
on `synchronize` there.

### Rules of thumb

- One migration per logical schema change. Don't bundle unrelated changes.
- Never edit a migration that has already been applied anywhere outside your
  own machine — add a new migration instead. Editing history breaks anyone
  else's `migration:run`.
- Always implement `down()` so a bad migration can be rolled back.
- Keep `synchronize: false` everywhere except possibly a throwaway local DB —
  once migrations exist, they're the source of truth for schema, not the
  entities directly.
