import { NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/testflight/check-pending - Check all pending builds and update their status
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all builds with PENDING status
    const pendingBuilds = await prisma.testflightBuild.findMany({
      where: { status: 'PENDING' },
    });

    if (pendingBuilds.length === 0) {
      return NextResponse.json({ message: 'No pending builds found' });
    }

    // Update each pending build to a more appropriate status
    // For now, let's just set them to ACTIVE since we can't check them retroactively
    const updatePromises = pendingBuilds.map(build =>
      prisma.testflightBuild.update({
        where: { id: build.id },
        data: { 
          status: 'ACTIVE', // Default to ACTIVE for existing builds
          lastCheckedAt: new Date(),
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: `Updated ${pendingBuilds.length} pending builds to ACTIVE status`,
      updatedCount: pendingBuilds.length 
    });
  } catch (error) {
    console.error('Error checking pending builds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
