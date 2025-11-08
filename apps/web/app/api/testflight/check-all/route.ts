import { NextResponse } from 'next/server';
import { prisma } from '@windsurf/database';

// Force Node.js runtime for external HTTP requests
export const runtime = 'nodejs';

// POST /api/testflight/check-all - Check all TestFlight builds and update their status
export async function POST() {
  try {
    console.log('Starting TestFlight build check...');

    // Get all builds that need checking
    const builds = await prisma.testflightBuild.findMany({
      where: {
        // Check all builds, but prioritize ones that haven't been checked recently
        OR: [
          { lastCheckedAt: null },
          { 
            lastCheckedAt: {
              lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
            }
          }
        ]
      },
      orderBy: { lastCheckedAt: 'asc' }
    });

    console.log(`Found ${builds.length} builds to check`);

    if (builds.length === 0) {
      return NextResponse.json({ 
        message: 'No builds need checking',
        checkedCount: 0 
      });
    }

    const results = [];
    let checkedCount = 0;
    let errorCount = 0;

    // Check each build
    for (const build of builds) {
      try {
        const status = await checkTestFlightBuild(build.testflightUrl);
        
        // Update the build in the database
        await prisma.testflightBuild.update({
          where: { id: build.id },
          data: {
            status: status,
            lastCheckedAt: new Date(),
          }
        });

        // Log the check
        await prisma.testflightBuildLog.create({
          data: {
            buildId: build.id,
            status: status,
            message: `Automatic check: ${status}`,
            checkedAt: new Date(),
          }
        });

        results.push({
          id: build.id,
          name: build.name,
          status: status,
          url: build.testflightUrl
        });

        checkedCount++;
        console.log(`✓ Checked ${build.name}: ${status}`);

      } catch (error) {
        console.error(`✗ Error checking ${build.name}:`, error);
        errorCount++;
        
        // Still update lastCheckedAt to avoid repeatedly checking broken URLs
        await prisma.testflightBuild.update({
          where: { id: build.id },
          data: {
            lastCheckedAt: new Date(),
            status: 'ERROR'
          }
        });

        results.push({
          id: build.id,
          name: build.name,
          status: 'ERROR',
          url: build.testflightUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Add a small delay to avoid overwhelming TestFlight servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`TestFlight check complete: ${checkedCount} checked, ${errorCount} errors`);

    return NextResponse.json({
      message: `Checked ${checkedCount} builds (${errorCount} errors)`,
      checkedCount,
      errorCount,
      results
    });

  } catch (error) {
    console.error('Error in TestFlight check job:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Function to check a single TestFlight build
async function checkTestFlightBuild(testflightUrl: string): Promise<'ACTIVE' | 'EXPIRED' | 'NOT_FOUND' | 'ERROR'> {
  try {
    // Make a HEAD request to check if the TestFlight URL is accessible
    const response = await fetch(testflightUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      },
      // Don't follow redirects automatically so we can check the response
      redirect: 'manual'
    });

    // TestFlight URLs typically:
    // - Return 200 if the build is active and available
    // - Return 404 if the build doesn't exist
    // - Return 302/301 if redirecting (could be expired or moved)
    
    if (response.status === 200) {
      return 'ACTIVE';
    } else if (response.status === 404) {
      return 'NOT_FOUND';
    } else if (response.status >= 300 && response.status < 400) {
      // Check if it's redirecting to an error page
      const location = response.headers.get('location');
      if (location && (location.includes('expired') || location.includes('unavailable'))) {
        return 'EXPIRED';
      }
      return 'ACTIVE'; // Assume active if redirecting to unknown location
    } else {
      return 'ERROR';
    }

  } catch (error) {
    console.error('Error checking TestFlight URL:', error);
    return 'ERROR';
  }
}
