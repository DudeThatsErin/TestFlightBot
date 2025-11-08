import { NextResponse } from 'next/server';

// Simple endpoint to fix pending builds without authentication for now
export async function GET() {
  try {
    // Import prisma dynamically to avoid initialization issues
    const { prisma } = await import('@windsurf/database');
    
    // Update all PENDING builds to ACTIVE
    const result = await prisma.testflightBuild.updateMany({
      where: { status: 'PENDING' },
      data: { 
        status: 'ACTIVE',
        lastCheckedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: `Updated ${result.count} pending builds to ACTIVE`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error fixing pending builds:', error);
    return NextResponse.json({ 
      error: 'Failed to fix pending builds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
