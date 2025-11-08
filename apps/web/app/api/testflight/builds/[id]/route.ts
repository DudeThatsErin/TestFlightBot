import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE /api/testflight/builds/[id] - Delete a TestFlight build
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if build exists
    const existingBuild = await prisma.testflightBuild.findUnique({
      where: { id },
    });

    if (!existingBuild) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Delete the build (logs will be deleted automatically due to cascade)
    await prisma.testflightBuild.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting TestFlight build:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
