# TestFlight Monitor

A comprehensive TestFlight monitoring system built with Next.js, Discord bot integration, and PostgreSQL. Monitor TestFlight builds automatically and get notified when builds become available or expire.

## Features

- 🤖 **Discord Bot Integration**: Manage TestFlight URLs via Discord commands
- 🔄 **Automatic Monitoring**: Checks TestFlight URLs every 5-6 minutes
- 📊 **Admin Dashboard**: Modern web interface with TanStack Table for managing builds
- 🔐 **Secure Authentication**: NextAuth.js with 2FA support using TOTP
- 📧 **Email Notifications**: Built-in email functionality
- 🗄️ **PostgreSQL Database**: Robust data storage with Prisma ORM
- 🚀 **Vercel Ready**: Optimized for Vercel deployment

## Architecture

This is a Turborepo monorepo containing:

### Apps
- `apps/web`: Next.js web application with admin dashboard
- `apps/discord-bot`: Discord bot with Sapphire Framework

### Packages
- `packages/database`: Shared Prisma database schema and client
- `packages/tsconfig`: Shared TypeScript configurations
- `packages/config`: Shared ESLint configurations

## Tech Stack

- **Frontend**: Next.js 13, React, TailwindCSS, Radix UI
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with 2FA (TOTP)
- **Discord Bot**: Discord.js with Sapphire Framework
- **Monitoring**: Node-cron for scheduled checks
- **Deployment**: Vercel (web app), any Node.js host (bot)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Discord bot token and server setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DudeThatsErin/TestFlightBot.git
   cd TestFlightBot
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/testflight_monitor"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Discord Bot
   DISCORD_TOKEN="your-discord-bot-token"
   DISCORD_CLIENT_ID="your-discord-client-id"
   DISCORD_GUILD_ID="your-discord-guild-id"
   DISCORD_CHANNEL_ID="your-discord-channel-id"
   
   # Email Configuration
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourdomain.com"
   
   # Admin Panel
   ADMIN_PANEL_SECRET="unique-admin-panel-secret-path"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   ```

5. **Create an admin user**
   
   You'll need to manually create an admin user in your database or use the signup process and then update the user role to `ADMIN` or `SUPER_ADMIN`.

### Development

Run the development servers:

```bash
# Start all services
npm run dev

# Or start individual services
npm run dev --filter=web      # Web app only
npm run dev --filter=discord-bot  # Discord bot only
```

### Build

```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=web
npm run build --filter=discord-bot
```

## Discord Bot Setup

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

2. **Set up bot permissions**
   - In the OAuth2 > URL Generator section
   - Select "bot" and "applications.commands" scopes
   - Select necessary permissions (Send Messages, Use Slash Commands, etc.)
   - Use the generated URL to invite the bot to your server

3. **Configure environment variables**
   - Set `DISCORD_TOKEN` to your bot token
   - Set `DISCORD_CLIENT_ID` to your application ID
   - Set `DISCORD_GUILD_ID` to your server ID
   - Set `DISCORD_CHANNEL_ID` to the channel where notifications should be sent

## Admin Panel Access

The admin panel is accessible at a unique URL defined by the `ADMIN_PANEL_SECRET` environment variable:
```
https://yourdomain.com/dashboard
```

Only users with `ADMIN` or `SUPER_ADMIN` roles can access the dashboard.

## Discord Commands

- `/testflight add` - Add a new TestFlight URL to monitor
- `/testflight list` - List all monitored TestFlight builds
- `/testflight remove` - Remove a TestFlight build from monitoring
- `/testflight status` - Check the status of a specific build

## Deployment

### Vercel (Web App)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Discord Bot Deployment

Deploy the Discord bot to any Node.js hosting service:

- Railway
- Render
- DigitalOcean App Platform
- AWS EC2
- Google Cloud Run

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
