import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDiscordConfig, setDiscordConfig, type DiscordConfig } from '@/lib/discord-config';

// Force Node.js runtime for file system operations
export const runtime = 'nodejs';

// GET /api/discord/config - Get Discord configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getDiscordConfig();
    
    // Return config with masked tokens for security
    return NextResponse.json({
      botToken: config.botToken ? '••••••••••••••••••••••••' : '',
      clientId: config.clientId ? '••••••••••••••••••••••••' : '',
      guildId: config.guildId || '',
      hasToken: !!config.botToken,
      hasClientId: !!config.clientId,
      hasGuildId: !!config.guildId
    });
  } catch (error) {
    console.error('Error getting Discord config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/discord/config - Update Discord configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { botToken, clientId, guildId } = body;

    // Validate required fields
    if (!botToken || !clientId) {
      return NextResponse.json(
        { error: 'Bot Token and Client ID are required' },
        { status: 400 }
      );
    }

    // Get current config to preserve existing values if not updating
    const currentConfig = getDiscordConfig();
    
    const newConfig: DiscordConfig = {
      botToken: botToken === '••••••••••••••••••••••••' ? currentConfig.botToken : botToken,
      clientId: clientId === '••••••••••••••••••••••••' ? currentConfig.clientId : clientId,
      guildId: guildId || ''
    };

    const success = setDiscordConfig(newConfig);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Discord configuration updated successfully',
      hasToken: !!newConfig.botToken,
      hasClientId: !!newConfig.clientId,
      hasGuildId: !!newConfig.guildId
    });
  } catch (error) {
    console.error('Error updating Discord config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
