import cron from 'node-cron';

let jobsStarted = false;

export function startBackgroundJobs() {
  if (jobsStarted) {
    console.log('Background jobs already started');
    return;
  }

  console.log('Starting background jobs...');

  // Check TestFlight builds every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running TestFlight build check...');
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/testflight/check-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('TestFlight check completed:', result.message);
      } else {
        console.error('TestFlight check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error running TestFlight check:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  jobsStarted = true;
  console.log('✓ Background jobs started - TestFlight builds will be checked every 5 minutes');
}

export function stopBackgroundJobs() {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  jobsStarted = false;
  console.log('Background jobs stopped');
}
