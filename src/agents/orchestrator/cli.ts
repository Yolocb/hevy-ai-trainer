/**
 * AGENT D: App Orchestrator & UX Agent
 *
 * Main CLI application orchestrator
 */

import { HevyApiClient } from '../hevy-api-architect/client';
import { createHevyConfig } from '../hevy-api-architect/config';
import { WorkoutAnalyzer } from '../training-planner/analyzer';
import { RoutinePlanner } from '../training-planner/planner';
import { RoutinePublisher } from '../hevy-integration/publisher';
import { loadConfig, parseCliArgs, CliOptions } from './config';

export class AppOrchestrator {
  private client: HevyApiClient;
  private analyzer: WorkoutAnalyzer;
  private planner: RoutinePlanner;
  private publisher: RoutinePublisher;

  constructor() {
    // Initialize Hevy API client
    const hevyConfig = createHevyConfig();
    this.client = new HevyApiClient(hevyConfig);

    // Initialize agents
    this.analyzer = new WorkoutAnalyzer();
    this.planner = new RoutinePlanner();
    this.publisher = new RoutinePublisher(this.client);
  }

  /**
   * Main entry point - orchestrates the entire flow
   */
  async run(options: CliOptions = {}): Promise<void> {
    const config = loadConfig();

    console.log('\n🤖 Hevy AI Trainer - Multi-Agent System');
    console.log('=========================================\n');

    try {
      // Step 1: Fetch workout history
      console.log('📥 Agent A: Fetching workout history...');
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - config.training.historyMonths);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`   Date range: ${startDateStr} to ${endDateStr}`);

      const workouts = await this.client.getAllWorkouts(startDateStr, endDateStr);
      console.log(`   ✓ Fetched ${workouts.length} workouts\n`);

      // Step 2: Fetch exercise templates
      console.log('📥 Agent A: Fetching exercise templates...');
      const exerciseTemplates = await this.client.getAllExerciseTemplates();
      console.log(`   ✓ Fetched ${exerciseTemplates.length} exercise templates\n`);

      // Step 3: Analyze workout history
      console.log('📊 Agent B: Analyzing workout history...');
      const stats = this.analyzer.buildExerciseStats(workouts, exerciseTemplates);
      console.log(`   ✓ Analyzed ${stats.size} unique exercises\n`);

      // Step 4: Filter for focus muscles
      console.log(`🎯 Agent B: Filtering for ${config.training.focusMuscles.join(', ')}...`);
      const filteredStats = this.analyzer.filterArmsShouldersChest(
        stats,
        config.training.focusMuscles
      );
      console.log(`   ✓ Found ${filteredStats.length} relevant exercises\n`);

      // Step 5: Categorize exercises
      console.log('📂 Agent B: Categorizing exercises...');
      const categorized = this.analyzer.categorizeExercises(filteredStats);
      console.log(`   ✓ Chest Compounds: ${categorized.chestCompound.length}`);
      console.log(`   ✓ Shoulder Compounds: ${categorized.shoulderCompound.length}`);
      console.log(`   ✓ Chest Isolation: ${categorized.chestIsolation.length}`);
      console.log(`   ✓ Shoulder Isolation: ${categorized.shoulderIsolation.length}`);
      console.log(`   ✓ Triceps: ${categorized.triceps.length}`);
      console.log(`   ✓ Biceps: ${categorized.biceps.length}\n`);

      // Step 6: Plan today's routine
      console.log('🧠 Agent B: Planning today\'s routine...');

      // Apply CLI overrides
      const trainingConfig = { ...config.training };
      if (options.duration) {
        trainingConfig.targetSessionMinutes = options.duration;
      }

      const plannedRoutine = this.planner.planTodayRoutine(categorized, trainingConfig);
      console.log(`   ✓ Planned ${plannedRoutine.exercises.length} exercises\n`);

      // Step 7: Publish to Hevy
      console.log('🚀 Agent C: Publishing routine to Hevy...');
      await this.publisher.publish(plannedRoutine, {
        dryRun: options.dryRun || false,
        folderName: options.folderName || 'AI Routines',
      });

      console.log('✅ All agents completed successfully!\n');
    } catch (error: any) {
      console.error('❌ Application error:', error.message);
      throw error;
    }
  }
}

/**
 * CLI entry point
 */
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseCliArgs(args);

  console.log('Starting Hevy AI Trainer...\n');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No routines will be created in Hevy\n');
  }

  const orchestrator = new AppOrchestrator();
  await orchestrator.run(options);
}
