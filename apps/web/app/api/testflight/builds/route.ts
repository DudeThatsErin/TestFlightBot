import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simplified function to check TestFlight URL status
async function checkTestFlightStatus(url: string) {
  const startTime = Date.now();
  
  try {
    // For now, let's just validate the URL format and assume it's ACTIVE
    // We can make this more sophisticated later
    if (!url.includes('testflight.apple.com/join/')) {
      return {
        status: 'ERROR' as const,
        message: 'Invalid TestFlight URL format',
        responseTime: Date.now() - startTime,
        httpStatus: null,
        errorDetails: 'URL must contain testflight.apple.com/join/',
      };
    }

    // For now, just return ACTIVE for valid TestFlight URLs
    // TODO: Implement actual HTTP checking later
    return {
      status: 'ACTIVE' as const,
      message: 'TestFlight URL appears valid',
      responseTime: Date.now() - startTime,
      httpStatus: 200,
      errorDetails: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'ERROR' as const,
      message: 'Failed to validate TestFlight URL',
      responseTime,
      httpStatus: null,
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// GET /api/testflight/builds - List all TestFlight builds
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const builds = await prisma.testflightBuild.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        updatedBy: {
          select: { name: true, email: true },
        },
        logs: {
          orderBy: { checkedAt: 'desc' },
          take: 5, // Get last 5 logs
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(builds);
  } catch (error) {
    console.error('Error fetching TestFlight builds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/testflight/builds - Create new TestFlight build
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, testflightUrl, notes } = body;

    // Validate required fields
    if (!name || !testflightUrl) {
      return NextResponse.json(
        { error: 'Name and TestFlight URL are required' },
        { status: 400 }
      );
    }

    // Validate TestFlight URL format
    if (!testflightUrl.includes('testflight.apple.com/join/')) {
      return NextResponse.json(
        { error: 'Invalid TestFlight URL format' },
        { status: 400 }
      );
    }

    // Generate unique version and build number since we removed those fields from the form
    // Use timestamp to ensure uniqueness
    const timestamp = Date.now();
    const defaultVersion = '1.0.0';
    const defaultBuildNumber = timestamp.toString();

    // Check if build already exists with same URL
    const existingBuild = await prisma.testflightBuild.findFirst({
      where: { testflightUrl },
    });

    if (existingBuild) {
      return NextResponse.json(
        { error: 'A build with this TestFlight URL already exists' },
        { status: 409 }
      );
    }

    // For now, let's just create the build as ACTIVE to avoid any issues
    // We can add the status checking back later once everything is working
    const build = await prisma.testflightBuild.create({
      data: {
        name,
        version: defaultVersion,
        buildNumber: defaultBuildNumber,
        testflightUrl,
        notes,
        status: 'ACTIVE', // Default to ACTIVE for now
        lastCheckedAt: new Date(),
        isPublic: true, // Make builds public by default
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(build, { status: 201 });
  } catch (error) {
    console.error('Error creating TestFlight build:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
