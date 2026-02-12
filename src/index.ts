/**
 * Main entry point for Hevy AI Trainer
 */

import * as dotenv from 'dotenv';
import { main } from './agents/orchestrator/cli';

// Load environment variables
dotenv.config();

// Run the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
