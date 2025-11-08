import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH /api/commands/[id]/toggle - Toggle command enabled status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled field must be a boolean' },
        { status: 400 }
      );
    }

    // Check if command exists
    const existingCommand = await prisma.discordCommand.findUnique({
      where: { id: params.id },
    });

    if (!existingCommand) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    const command = await prisma.discordCommand.update({
      where: { id: params.id },
      data: {
        enabled,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(command);
  } catch (error) {
    console.error('Error toggling command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
