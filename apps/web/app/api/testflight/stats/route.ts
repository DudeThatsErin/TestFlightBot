import { NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/testflight/stats - Get TestFlight build statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts for each status
    const [total, active, expired, errors] = await Promise.all([
      prisma.testflightBuild.count(),
      prisma.testflightBuild.count({ where: { status: 'ACTIVE' } }),
      prisma.testflightBuild.count({ where: { status: 'EXPIRED' } }),
      prisma.testflightBuild.count({ where: { status: 'ERROR' } }),
    ]);

    return NextResponse.json({
      total,
      active,
      expired,
      errors,
    });
  } catch (error) {
    console.error('Error fetching TestFlight stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
