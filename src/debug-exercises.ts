/**
 * Debug script to see what exercises are in your Hevy history
 */

import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';

dotenv.config();

async function debugExercises() {
  console.log('\n🔍 DEBUG: Analyzing your Hevy exercise history\n');
  console.log('='.repeat(60));

  const config = createHevyConfig();
  const client = new HevyApiClient(config);

  // Fetch data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  console.log(`📥 Fetching workouts from ${startDate.toISOString().split('T')[0]}...`);
  const workouts = await client.getAllWorkouts(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  console.log(`📥 Fetching exercise templates...`);
  const templates = await client.getAllExerciseTemplates();
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  console.log(`\n✅ Found ${workouts.length} workouts and ${templates.length} exercise templates\n`);

  // Analyze exercises directly from workouts
  const exerciseCount = new Map<string, { name: string; count: number; sets: number; muscle: string }>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const templateId = exercise.exercise_template_id;
      const template = templateMap.get(templateId);
      const name = exercise.title || template?.title || `Unknown (ID: ${templateId})`;
      const muscle = template?.primary_muscle_group || 'Unknown';

      if (!exerciseCount.has(templateId)) {
        exerciseCount.set(templateId, { name, count: 0, sets: 0, muscle });
      }

      const stats = exerciseCount.get(templateId)!;
      stats.count++;
      stats.sets += exercise.sets.filter((s) => s.type === 'normal').length;
    }
  }

  // Sort by frequency
  const sorted = Array.from(exerciseCount.values()).sort((a, b) => b.count - a.count);

  console.log('📊 Your most frequent exercises:\n');

  sorted.slice(0, 20).forEach((stat, idx) => {
    console.log(`${idx + 1}. ${stat.name}`);
    console.log(`   Muscle: ${stat.muscle}`);
    console.log(`   Workouts: ${stat.count}`);
    console.log(`   Total sets: ${stat.sets}`);
    console.log();
  });

  // Analyze muscle group distribution
  const muscleGroups = new Map<string, number>();
  for (const stat of exerciseCount.values()) {
    const muscle = stat.muscle || 'Unknown';
    muscleGroups.set(muscle, (muscleGroups.get(muscle) || 0) + stat.count);
  }

  console.log('='.repeat(60));
  console.log('\n💪 Your muscle group distribution:\n');

  Array.from(muscleGroups.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([muscle, count]) => {
      console.log(`   ${muscle}: ${count} exercise instances`);
    });

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Update config/default.json focusMuscles based on this data!\n');
}

debugExercises().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
