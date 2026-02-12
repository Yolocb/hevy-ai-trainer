/**
 * Debug script to inspect raw API data structure
 */

import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';

dotenv.config();

async function inspectData() {
  console.log('\n🔍 DEBUG: Inspecting Hevy API data structure\n');

  const config = createHevyConfig();
  const client = new HevyApiClient(config);

  // Fetch data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1); // Just 1 month

  const workouts = await client.getAllWorkouts(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  const templates = await client.getAllExerciseTemplates();

  console.log('📊 Sample Workout Data:');
  console.log(JSON.stringify(workouts[0], null, 2).slice(0, 1500));

  console.log('\n\n📊 Sample Exercise Template Data:');
  console.log(JSON.stringify(templates.slice(0, 3), null, 2));
}

inspectData().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
