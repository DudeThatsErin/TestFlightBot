# TestFlight Monitor - Project Status & TODO

## Project Overview

A comprehensive TestFlight monitoring system that tracks TestFlight links and notifies users via Discord when builds become available or expire. Includes a web dashboard for managing and viewing TestFlight build statuses.

---

## ✅ What's Been Completed

### Architecture & Setup
- [x] **Turborepo monorepo structure** with `apps/` and `packages/` workspaces
- [x] **Shared database package** (`packages/database`) with Prisma ORM
- [x] **Shared TypeScript configs** (`packages/tsconfig`)
- [x] **Shared ESLint configs** (`packages/config`)
- [x] **Husky git hooks** configured
- [x] **Environment configuration** with `.env.example` files

### Database Schema (Prisma)
- [x] **User model** - Authentication with 2FA support, roles (USER, ADMIN, SUPER_ADMIN)
- [x] **Session model** - JWT refresh tokens, IP tracking
- [x] **TestflightBuild model** - Name, version, build number, URL, status, notes, public flag
- [x] **TestflightBuildLog model** - Check history with response times, HTTP status, errors
- [x] **DiscordCommand model** - Dynamic command management from database
- [x] **DiscordCommandOption/Choice/Response models** - Full command customization

### Discord Bot (`apps/discord-bot`)
- [x] **Sapphire Framework** setup with Discord.js
- [x] **Bot entry point** with proper intents and partials
- [x] **TestFlight monitoring service** - Cron-based checking every 5 minutes
- [x] **Status detection** - Parses TestFlight pages for availability
- [x] **Discord notifications** - Embeds with status changes, emojis, colors
- [x] **Slash commands implemented:**
  - `/testflight add` - Add new TestFlight URL to monitor
  - `/testflight list` - List all monitored builds
  - `/testflight remove` - Remove a build from monitoring
  - `/testflight status` - Check status of specific build
- [x] **Additional commands:** `ping`, `post`, `search`, `website`, `manage-commands`, `dynamic-command`

### Web Application (`apps/web`)
- [x] **Next.js 14** with App Router
- [x] **NextAuth.js authentication** with credentials provider
- [x] **2FA (TOTP) support** in sign-in flow
- [x] **Role-based access control** (ADMIN, SUPER_ADMIN)
- [x] **Dark/Light theme** with ThemeProvider
- [x] **Global header component** with navigation

#### Public Pages

- [x] **Home page** (`/`) - Public TestFlight status dashboard
- [x] **Stats cards** - Active, expired, total links
- [x] **SharedTestFlightTable** - Searchable, sortable, filterable table with TanStack Table

#### Admin Dashboard
- [x] **Dashboard** (`/dashboard`) - Admin overview with stats cards
- [x] **Add TestFlight dialog** - Modal to add new builds
- [x] **TestFlight table** - Full CRUD with admin actions (view, delete)
- [x] **Auto-refresh** - Table refreshes every 30 seconds

#### Settings Page (`/dashboard/settings`)
- [x] **Discord bot configuration** - Token, client ID, guild ID, channel IDs
- [x] **Bot customization** - Prefix, avatar URL, status, activity type/message
- [x] **Announcement channel** - Separate channel for TestFlight notifications
- [x] **Monitoring interval** - Configurable check frequency

#### Commands Page (`/dashboard/commands`)
- [x] **DataTable component** - Reusable table with sorting, search, pagination
- [x] **Command list** - View all Discord commands
- [x] **Refresh commands** - Scan filesystem for commands
- [x] **Deploy to Discord** - Push commands to Discord API
- [x] **Toggle enable/disable** - Per-command control

### API Routes
- [x] `/api/auth/[...nextauth]` - NextAuth.js handler
- [x] `/api/testflight/builds` - CRUD for TestFlight builds
- [x] `/api/testflight/stats` - Dashboard statistics
- [x] `/api/testflight/check-all` - Trigger manual check
- [x] `/api/testflight/check-pending` - Check pending builds
- [x] `/api/public/testflight` - Public builds endpoint
- [x] `/api/public/stats` - Public statistics
- [x] `/api/admin/settings` - Bot settings management
- [x] `/api/commands/*` - Command management endpoints
- [x] `/api/discord/*` - Discord integration

### UI Components
- [x] **SharedTestFlightTable** - Reusable table for public/admin views
- [x] **AddTestFlightDialog** - Modal for adding builds
- [x] **DataTable** - Generic reusable data table
- [x] **UI primitives** - Button, Input, Card, Badge, Select, etc.
- [x] **PasswordInput** - Show/hide password toggle
- [x] **ThemeToggle** - Dark/light mode switch

## 🚧 What's In Progress / Partially Complete

### Discord Bot
- [x] **User mapping** - Builds created via Discord are mapped to the invoking Discord user
- [ ] **Bot customization from settings** - Settings page exists but bot doesn't read from API
- [ ] **Dynamic check interval** - Currently hardcoded to 5 minutes in cron

### Database
- [ ] **SQLite migration** - Prisma schema + code updates to run on SQLite instead of Supabase/Postgres (in progress)

### Web Application
- [ ] **Edit TestFlight link** - Can add/delete but no edit functionality

## ❌ What's Not Yet Implemented

### High Priority

- [ ] **Edit TestFlight link** - Update existing build details
- [ ] **Manual status check** - Button to trigger immediate check on a build
- [ ] **Build details page** - View full history/logs for a specific build
- [ ] **Email notifications** - Schema mentions email but not implemented

### Medium Priority
- [ ] **User management page** - Admin can manage other users
- [ ] **Audit logging** - Track who made what changes
- [ ] **Build categories/tags** - Organize builds by app type
- [ ] **Favorites/Watchlist** - Users can mark builds to watch
- [ ] **Notification preferences** - Per-user notification settings
- [ ] **Discord webhook integration** - Alternative to bot for notifications
- [ ] **Rate limiting** - Protect API endpoints

### Low Priority / Nice to Have
- [ ] **Build expiration predictions** - Estimate when builds will expire
- [ ] **Historical charts** - Visualize build status over time
- [ ] **API documentation** - OpenAPI/Swagger docs
- [ ] **Mobile app** - React Native companion app
- [ ] **Browser extension** - Quick access to build statuses
- [ ] **Slack integration** - Alternative to Discord
- [ ] **RSS feed** - Subscribe to build updates
- [ ] **Public API** - Allow third-party integrations

### Testing & DevOps
- [ ] **Unit tests** - Jest/Vitest for components and utilities
- [ ] **Integration tests** - API route testing
- [ ] **E2E tests** - Playwright/Cypress for full flows
- [ ] **CI/CD pipeline** - GitHub Actions for testing and deployment
- [ ] **Docker configuration** - Containerized deployment
- [ ] **Production deployment guide** - Vercel + bot hosting setup

---

## 🐛 Known Issues / Bugs

1. **SQLite + Prisma compatibility** - SQLite connector requires JSON/enums to be stored as strings (JSON text)
2. **Settings persistence** - Settings page saves to API but bot may not reload them
3. **No error handling UI** - API errors don't show user-friendly messages in some places
4. **Commands page backup file** - `page_backup.tsx` should be cleaned up

---

## 📁 Project Structure

```
TestFlightBot/
├── apps/
│   ├── discord-bot/          # Discord bot with Sapphire Framework
│   │   └── src/
│   │       ├── commands/     # Slash commands
│   │       ├── services/     # TestFlight monitoring service
│   │       └── index.ts      # Bot entry point
│   └── web/                  # Next.js web application
│       ├── app/              # App Router pages
│       │   ├── api/          # API routes
│       │   ├── auth/         # Auth pages
│       │   └── dashboard/    # Admin dashboard
│       ├── components/       # React components
│       └── lib/              # Utilities
├── packages/
│   ├── database/             # Prisma schema & client
│   ├── tsconfig/             # Shared TS configs
│   └── config/               # Shared ESLint configs
├── package.json              # Root package with workspaces
└── turbo.json                # Turborepo configuration
```

---

## 🚀 Next Steps (Recommended Order)

1. **Fix Discord user mapping** - Link Discord users to database users
2. **Add edit functionality** - Allow editing existing TestFlight builds
3. **Add build details page** - View logs and history for each build
4. **Connect bot to settings API** - Bot reads config from database
5. **Add manual check button** - Trigger immediate status check
6. **Implement password reset** - Forgot password flow
7. **Add unit tests** - Start with critical components
8. **Set up CI/CD** - GitHub Actions for automated testing
9. **Production deployment** - Deploy to Vercel + Railway/Render

---

## 📝 Development Notes

### Running the Project
```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development servers
npm run dev
```

### Environment Variables
See `apps/web/.env.example` for required variables:
- `DATABASE_URL` - SQLite file URL (dev)
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `DISCORD_TOKEN` - Discord bot token
- `DISCORD_CLIENT_ID` - Discord application ID
- `DISCORD_GUILD_ID` - Discord server ID
- `DISCORD_CHANNEL_ID` - Notification channel ID

---

*Last updated: Project analysis completed*
