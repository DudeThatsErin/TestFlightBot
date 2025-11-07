import { NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';

export async function GET() {
  try {
    const builds = await prisma.testflightBuild.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        buildNumber: true,
        status: true,
        testflightUrl: true,
        lastCheckedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(builds);
  } catch (error) {
    console.error('Error fetching public TestFlight builds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TestFlight builds' },
      { status: 500 }
    );
  }
}
