import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

// GET /api/commands - List all commands
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commands = await prisma.discordCommand.findMany({
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
        createdBy: {
          select: { name: true, email: true },
        },
        updatedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(commands);
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/commands - Create new command
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      enabled,
      permissions,
      cooldown,
      guildOnly,
      ownerOnly,
      nsfw,
      aliases,
      usage,
      examples,
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Check if command already exists
    const existingCommand = await prisma.discordCommand.findUnique({
      where: { name },
    });

    if (existingCommand) {
      return NextResponse.json(
        { error: 'Command with this name already exists' },
        { status: 409 }
      );
    }

    const command = await prisma.discordCommand.create({
      data: {
        name,
        description,
        category,
        enabled: enabled ?? true,
        permissions: permissions || [],
        cooldown: cooldown || 0,
        guildOnly: guildOnly ?? false,
        ownerOnly: ownerOnly ?? false,
        nsfw: nsfw ?? false,
        aliases: aliases || [],
        usage,
        examples: examples || [],
        createdById: session.user.id,
      },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
        responses: true,
      },
    });

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    console.error('Error creating command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
