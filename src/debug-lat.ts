/**
 * Debug script specifically for Lat Pulldown weights
 */

import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';

dotenv.config();

async function debugLatPulldown() {
  console.log('\n🔍 DEBUG: Analyzing Lat Pulldown (Latzug) weights\n');
  console.log('='.repeat(60));

  const config = createHevyConfig();
  const client = new HevyApiClient(config);

  // Fetch last 3 months for detailed analysis
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  const workouts = await client.getAllWorkouts(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  console.log(`\n📊 Analyzing ${workouts.length} recent workouts for Lat Pulldown\n`);

  let latPulldownFound = false;

  for (const workout of workouts) {
    const workoutDate = new Date(workout.start_time).toLocaleDateString();

    for (const exercise of workout.exercises) {
      // Check if this is lat pulldown (Latzug)
      if (exercise.title.toLowerCase().includes('latzug') ||
          exercise.title.toLowerCase().includes('lat') ||
          exercise.exercise_template_id === '6A6C31A5') {

        latPulldownFound = true;
        console.log(`\n📅 Workout: ${workout.title} (${workoutDate})`);
        console.log(`💪 Exercise: ${exercise.title}`);
        console.log(`   Template ID: ${exercise.exercise_template_id}`);
        console.log(`   Sets:`);

        exercise.sets.forEach((set, idx) => {
          if (set.type === 'normal') {
            const volume = (set.weight_kg || 0) * (set.reps || 0);
            console.log(`      Set ${idx + 1}: ${set.weight_kg}kg × ${set.reps} reps = ${volume} volume`);
          }
        });
      }
    }
  }

  if (!latPulldownFound) {
    console.log('⚠️  No Lat Pulldown exercises found in recent workouts');
  }

  console.log('\n' + '='.repeat(60));
}

debugLatPulldown().catch(console.error);
