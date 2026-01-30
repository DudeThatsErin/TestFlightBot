import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/commands/[id] - Get specific command
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const command = await prisma.discordCommand.findUnique({
      where: { id: params.id },
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
    });

    if (!command) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    return NextResponse.json(command);
  } catch (error) {
    console.error('Error fetching command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/commands/[id] - Update command
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if command exists
    const existingCommand = await prisma.discordCommand.findUnique({
      where: { id: params.id },
    });

    if (!existingCommand) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingCommand.name) {
      const nameExists = await prisma.discordCommand.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Command with this name already exists' },
          { status: 409 }
        );
      }
    }

    const command = await prisma.discordCommand.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        enabled,
        permissions: JSON.stringify(permissions ?? []),
        cooldown: cooldown || 0,
        guildOnly: guildOnly ?? false,
        ownerOnly: ownerOnly ?? false,
        nsfw: nsfw ?? false,
        aliases: JSON.stringify(aliases ?? []),
        usage,
        examples: JSON.stringify(examples ?? []),
        updatedById: session.user.id,
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

    return NextResponse.json(command);
  } catch (error) {
    console.error('Error updating command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/commands/[id] - Delete command
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if command exists
    const existingCommand = await prisma.discordCommand.findUnique({
      where: { id: params.id },
    });

    if (!existingCommand) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    await prisma.discordCommand.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Command deleted successfully' });
  } catch (error) {
    console.error('Error deleting command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
