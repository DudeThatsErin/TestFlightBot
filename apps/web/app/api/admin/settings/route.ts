import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

// Get the path to the .env.local file
const envPath = join(process.cwd(), '.env.local');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read current environment variables (don't expose sensitive values)
    const settings = {
      DISCORD_TOKEN: process.env.DISCORD_TOKEN ? '***HIDDEN***' : '',
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
      DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || '',
      DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
      DISCORD_ANNOUNCEMENT_CHANNEL_ID: process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID || '',
      DISCORD_BOT_PREFIX: process.env.DISCORD_BOT_PREFIX || '!',
      DISCORD_BOT_AVATAR_URL: process.env.DISCORD_BOT_AVATAR_URL || '',
      DISCORD_BOT_STATUS: process.env.DISCORD_BOT_STATUS || 'online',
      DISCORD_BOT_ACTIVITY: process.env.DISCORD_BOT_ACTIVITY || 'Monitoring TestFlight',
      DISCORD_BOT_ACTIVITY_TYPE: process.env.DISCORD_BOT_ACTIVITY_TYPE || 'WATCHING',
      TESTFLIGHT_CHECK_INTERVAL: process.env.TESTFLIGHT_CHECK_INTERVAL || '300000',
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();

    // Read existing .env.local file
    let envContent = '';
    try {
      envContent = await readFile(envPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, start with empty content
      envContent = '';
    }

    // Parse existing env variables
    const envVars = new Map<string, string>();
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars.set(key.trim(), valueParts.join('=').replace(/^["']|["']$/g, ''));
        }
      }
    }

    // Update with new settings (only if not hidden)
    Object.entries(settings).forEach(([key, value]) => {
      if (value && value !== '***HIDDEN***') {
        envVars.set(key, value as string);
      }
    });

    // Ensure required variables exist
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    requiredVars.forEach(key => {
      if (!envVars.has(key)) {
        switch (key) {
          case 'DATABASE_URL':
            envVars.set(key, 'postgresql://username:password@localhost:5432/testflight_monitor');
            break;
          case 'NEXTAUTH_SECRET':
            envVars.set(key, 'your-secret-key-here');
            break;
          case 'NEXTAUTH_URL':
            envVars.set(key, 'http://localhost:3000');
            break;
        }
      }
    });

    // Generate new .env.local content
    const newEnvContent = Array.from(envVars.entries())
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');

    // Write updated .env.local file
    await writeFile(envPath, newEnvContent, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully. Please restart the application for changes to take effect.' 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
