// Initialize background jobs when the server starts
import { startBackgroundJobs } from './jobs';

// Auto-start background jobs when this module is imported
if (typeof window === 'undefined') { // Only run on server side
  console.log('Initializing TestFlight Bot background services...');
  
  // Start background jobs after a short delay to ensure everything is loaded
  setTimeout(() => {
    try {
      startBackgroundJobs();
      console.log('✓ TestFlight Bot background services initialized');
    } catch (error) {
      console.error('✗ Failed to initialize background services:', error);
    }
  }, 2000); // 2 second delay
}

export {};
