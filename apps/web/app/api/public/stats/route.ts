import { NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';

// GET /api/public/stats - Get public TestFlight build statistics (no auth required)
export async function GET() {
  try {
    // Get counts for each status from public builds only
    const [total, active, expired] = await Promise.all([
      prisma.testflightBuild.count({ where: { isPublic: true } }),
      prisma.testflightBuild.count({ where: { status: 'ACTIVE', isPublic: true } }),
      prisma.testflightBuild.count({ where: { status: 'EXPIRED', isPublic: true } }),
    ]);

    return NextResponse.json({
      total,
      active,
      expired,
    });
  } catch (error) {
    console.error('Error fetching public TestFlight stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
