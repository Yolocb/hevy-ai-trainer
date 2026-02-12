/**
 * AGENT C: Routine Payload & Hevy Integration Agent
 *
 * Publishes routines to Hevy API
 */

import { HevyApiClient } from '../hevy-api-architect/client';
import { Routine, CreateRoutineRequest } from '../hevy-api-architect/models';
import { PlannedRoutine } from '../training-planner/planner';
import { RoutineMapper } from './mapper';

export interface PublishOptions {
  dryRun?: boolean;
  folderName?: string;
}

export class RoutinePublisher {
  private client: HevyApiClient;
  private mapper: RoutineMapper;

  constructor(client: HevyApiClient) {
    this.client = client;
    this.mapper = new RoutineMapper();
  }

  /**
   * Publish a planned routine to Hevy
   */
  async publish(
    plannedRoutine: PlannedRoutine,
    options: PublishOptions = {}
  ): Promise<Routine | null> {
    const { dryRun = false, folderName = 'AI Routines' } = options;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ROUTINE: ${plannedRoutine.title}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`⏱️  Estimated Duration: ${plannedRoutine.totalEstimatedMinutes} minutes`);
    console.log(`🏋️  Exercises: ${plannedRoutine.exercises.length}`);
    console.log(`📝 Notes: ${plannedRoutine.notes}\n`);

    // Print routine details
    plannedRoutine.exercises.forEach((ex, idx) => {
      const compound = ex.isCompound ? '🔥 ' : '💪 ';
      console.log(`${idx + 1}. ${compound}${ex.exerciseName}`);

      // Show progression strategy
      const strategyEmoji = {
        'pyramid': '📈',
        'reverse-pyramid': '📉',
        'wave': '〰️',
        'flat': '➖'
      }[ex.progressionStrategy || 'flat'];

      const strategyName = {
        'pyramid': 'Pyramid (ascending)',
        'reverse-pyramid': 'Reverse Pyramid',
        'wave': 'Wave Loading',
        'flat': 'Flat Load'
      }[ex.progressionStrategy || 'flat'];

      console.log(`   ${strategyEmoji} ${strategyName}`);
      console.log(`   ${ex.sets.length} sets:`);

      // Display each set with individual weight/reps
      ex.sets.forEach((set, setIdx) => {
        const weight = set.targetWeight ? `${set.targetWeight}kg` : 'BW';
        console.log(`      Set ${setIdx + 1}: ${weight} × ${set.reps} reps (rest: ${set.restSeconds}s)`);
      });

      if (ex.notes) {
        console.log(`   📝 ${ex.notes}`);
      }
      console.log();
    });

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - Routine not sent to Hevy API\n');
      return null;
    }

    try {
      // Map to Hevy payload (folder will be null for now)
      const payload: CreateRoutineRequest = this.mapper.mapToHevyPayload(
        plannedRoutine,
        null  // No folder support via API yet
      );

      // Validate payload
      this.mapper.validatePayload(payload);

      // Create routine
      console.log('🚀 Publishing routine to Hevy...');
      const routine = await this.client.createRoutine(payload);

      console.log(`\n✅ SUCCESS!`);
      console.log(`Routine ID: ${routine.id}`);
      console.log(`Title: ${routine.title}`);
      console.log(`Folder: ${folderName}`);
      console.log(`Created: ${routine.created_at}`);
      console.log(`\n🎉 Your routine is now available in the Hevy app!\n`);

      return routine;
    } catch (error: any) {
      console.error(`\n❌ ERROR: Failed to publish routine`);
      console.error(`Message: ${error.message}`);
      if (error.status) {
        console.error(`Status: ${error.status}`);
      }
      console.error();
      throw error;
    }
  }

  /**
   * Publish multiple routines (for weekly planning)
   */
  async publishMultiple(
    routines: PlannedRoutine[],
    options: PublishOptions = {}
  ): Promise<Routine[]> {
    const published: Routine[] = [];

    for (const routine of routines) {
      const result = await this.publish(routine, options);
      if (result) {
        published.push(result);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return published;
  }
}
