import { NextResponse } from 'next/server';
import { startBackgroundJobs } from '@/lib/jobs';

// Force Node.js runtime for cron jobs
export const runtime = 'nodejs';

// POST /api/jobs/start - Start background jobs
export async function POST() {
  try {
    startBackgroundJobs();
    return NextResponse.json({ 
      message: 'Background jobs started successfully',
      jobs: ['TestFlight build checker (every 5 minutes)']
    });
  } catch (error) {
    console.error('Error starting background jobs:', error);
    return NextResponse.json({ 
      error: 'Failed to start background jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/jobs/start - Check if jobs are running
export async function GET() {
  return NextResponse.json({ 
    message: 'Background jobs endpoint available',
    status: 'ready'
  });
}
