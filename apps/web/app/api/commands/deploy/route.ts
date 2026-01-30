import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDiscordConfigWithFallback } from '@/lib/discord-config';

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
    } catch {
      return [];
    }
  }
  return [];
}

// Force Node.js runtime to avoid Edge runtime compatibility issues
export const runtime = 'nodejs';

// POST /api/commands/deploy - Deploy commands to Discord
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getDiscordConfigWithFallback();
    const discordToken = config.botToken;
    const clientId = config.clientId;
    const guildId = config.guildId;

    if (!discordToken || !clientId) {
      return NextResponse.json(
        { error: 'Discord configuration missing. Please configure Bot Token and Client ID in the Settings tab.' },
        { status: 500 }
      );
    }

    // Fetch enabled commands from database
    const commands = await prisma.discordCommand.findMany({
      where: { enabled: true },
      include: {
        options: {
          include: {
            choices: true,
          },
          orderBy: { order: 'asc' },
        },
        responses: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Convert database commands to Discord API format
    const discordCommands = commands.map(command => {
      const permissions = asStringArray(command.permissions);

      return ({
        name: command.name,
        description: command.description,
        options: command.options.map(option => {
          const channelTypes = asStringArray(option.channelTypes);

          return ({
        name: option.name,
        description: option.description,
        type: getDiscordOptionType(option.type),
        required: option.required,
        choices: option.choices.length > 0 ? option.choices.map(choice => ({
          name: choice.name,
          value: choice.value,
        })) : undefined,
        min_value: option.minValue,
        max_value: option.maxValue,
        min_length: option.minLength,
        max_length: option.maxLength,
        autocomplete: option.autocomplete,
        channel_types: channelTypes.length > 0 ? channelTypes.map(type => parseInt(type)) : undefined,
      });
        }),
        default_member_permissions: permissions.length > 0 ? 
          permissions.reduce((acc, perm) => acc | getDiscordPermission(perm), 0).toString() : 
          undefined,
        dm_permission: !command.guildOnly,
        nsfw: command.nsfw,
      });
    });

    // Use native fetch instead of Discord.js REST client
    const baseUrl = 'https://discord.com/api/v10';
    const url = guildId 
      ? `${baseUrl}/applications/${clientId}/guilds/${guildId}/commands`
      : `${baseUrl}/applications/${clientId}/commands`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${discordToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordCommands),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Discord API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      message: `Successfully deployed ${discordCommands.length} commands to Discord`,
      scope: guildId ? 'guild' : 'global',
      commands: result,
    });
  } catch (error) {
    console.error('Error deploying commands:', error);
    return NextResponse.json({ error: 'Failed to deploy commands' }, { status: 500 });
  }
}

// Helper function to convert database option types to Discord API types
function getDiscordOptionType(type: string): number {
  const typeMap: Record<string, number> = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11,
  };
  return typeMap[type] || 3; // Default to STRING
}

// Helper function to convert permission strings to Discord permission bits
function getDiscordPermission(permission: string): number {
  const permissionMap: Record<string, number> = {
    CREATE_INSTANT_INVITE: 1 << 0,
    KICK_MEMBERS: 1 << 1,
    BAN_MEMBERS: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNELS: 1 << 4,
    MANAGE_GUILD: 1 << 5,
    ADD_REACTIONS: 1 << 6,
    VIEW_AUDIT_LOG: 1 << 7,
    PRIORITY_SPEAKER: 1 << 8,
    STREAM: 1 << 9,
    VIEW_CHANNEL: 1 << 10,
    SEND_MESSAGES: 1 << 11,
    SEND_TTS_MESSAGES: 1 << 12,
    MANAGE_MESSAGES: 1 << 13,
    EMBED_LINKS: 1 << 14,
    ATTACH_FILES: 1 << 15,
    READ_MESSAGE_HISTORY: 1 << 16,
    MENTION_EVERYONE: 1 << 17,
    USE_EXTERNAL_EMOJIS: 1 << 18,
    VIEW_GUILD_INSIGHTS: 1 << 19,
    CONNECT: 1 << 20,
    SPEAK: 1 << 21,
    MUTE_MEMBERS: 1 << 22,
    DEAFEN_MEMBERS: 1 << 23,
    MOVE_MEMBERS: 1 << 24,
    USE_VAD: 1 << 25,
    CHANGE_NICKNAME: 1 << 26,
    MANAGE_NICKNAMES: 1 << 27,
    MANAGE_ROLES: 1 << 28,
    MANAGE_WEBHOOKS: 1 << 29,
    MANAGE_EMOJIS_AND_STICKERS: 1 << 30,
    USE_APPLICATION_COMMANDS: 1 << 31,
  };
  return permissionMap[permission] || 0;
}
