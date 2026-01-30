# Check-in (2026-01-29)

## What I accomplished today

### TestFlightBot
- Implemented Discord -> DB user mapping so builds created from Discord are attributed to the invoking Discord user.
- Began migration from Supabase/Postgres to Prisma + SQLite.
- Updated schema and code to work around SQLite connector limitations by storing structured fields (arrays/objects) as JSON text in string columns.
- Updated environment examples so local development can point `DATABASE_URL` at a shared SQLite database file.

## What I’m working on next

### TestFlightBot
- Update Node to v24.0+ Whatever the latest version is
- Get Prisma generation working end-to-end (`npm run db:generate`) with SQLite schema + updated code.
- Run `npm run db:push` to create/update the SQLite DB file.
- Restart `npm run dev` and verify:
  - public read endpoints work,
  - `/testflight add` from Discord creates a build with correct `createdById`,
  - monitor job can write status + logs without DB errors.

## Blockers / notes
- Prisma SQLite connector does not support `Json` fields or `enum` definitions in the current setup; structured data must be stored as JSON strings.
- Ensure `apps/web/.env.local` and `apps/discord-bot/.env` both point to the same SQLite database file.
