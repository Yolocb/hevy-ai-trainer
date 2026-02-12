/**
 * Web UI Server for Hevy AI Trainer
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';
import { WorkoutAnalyzer } from './agents/training-planner/analyzer';
import { RoutinePlanner } from './agents/training-planner/planner';
import { RoutinePublisher } from './agents/hevy-integration/publisher';
import { loadConfig } from './agents/orchestrator/config';
import { PlannedRoutine } from './agents/training-planner/planner';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Get API keys from environment variables or config file
 * Priority: Environment variables > Config file
 */
function getApiKeys() {
  const config = loadConfig();
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || (config as any).anthropicApiKey || '',
    hevyApiKey: process.env.HEVY_API_KEY || (config as any).hevyApiKey || ''
  };
}

app.use(cors());
app.use(express.json());

// Store last generated routine for preview
let lastGeneratedRoutine: PlannedRoutine | null = null;
let generationInProgress = false;

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Test endpoint to verify routes work
 */
app.get('/api/test', (req: Request, res: Response) => {
  console.log('TEST ENDPOINT HIT!');
  res.json({ test: 'success', hevy: { a: 1 }, training: { b: 2 } });
});

/**
 * Get training statistics
 */
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const { hevyApiKey } = getApiKeys();

    if (!hevyApiKey) {
      return res.status(400).json({
        error: 'Hevy API key not configured. Please add it in Settings or .env file.'
      });
    }

    const config = createHevyConfig(hevyApiKey);
    const client = new HevyApiClient(config);
    const analyzer = new WorkoutAnalyzer();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const workouts = await client.getAllWorkouts(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const templates = await client.getAllExerciseTemplates();
    const stats = analyzer.buildExerciseStats(workouts, templates);

    const trainingConfig = loadConfig();
    const filtered = analyzer.filterArmsShouldersChest(stats, trainingConfig.training.focusMuscles);

    const summary = {
      totalWorkouts: workouts.length,
      totalExercises: stats.size,
      focusedExercises: filtered.length,
      lastWorkout: workouts[0]?.start_time,
      muscleGroups: trainingConfig.training.focusMuscles,
    };

    res.json(summary);
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate a new routine (preview mode)
 */
app.post('/api/generate', async (req: Request, res: Response) => {
  if (generationInProgress) {
    return res.status(429).json({ error: 'Generation already in progress' });
  }

  generationInProgress = true;

  try {
    const { hevyApiKey, anthropicApiKey } = getApiKeys();

    if (!hevyApiKey) {
      generationInProgress = false;
      return res.status(400).json({
        error: 'Hevy API key not configured. Please add it in Settings.'
      });
    }

    if (!anthropicApiKey) {
      generationInProgress = false;
      return res.status(400).json({
        error: 'Anthropic API key not configured. Please add it in Settings to use AI generation.'
      });
    }

    const config = createHevyConfig(hevyApiKey);
    const client = new HevyApiClient(config);
    const analyzer = new WorkoutAnalyzer();
    const planner = new RoutinePlanner();
    const trainingConfig = loadConfig();

    // Fetch data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - trainingConfig.training.historyMonths);

    const workouts = await client.getAllWorkouts(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const templates = await client.getAllExerciseTemplates();

    // Analyze and plan
    const stats = analyzer.buildExerciseStats(workouts, templates);
    const filtered = analyzer.filterArmsShouldersChest(stats, trainingConfig.training.focusMuscles);
    const categorized = analyzer.categorizeExercises(filtered);
    const routine = planner.planTodayRoutine(categorized, trainingConfig.training);

    lastGeneratedRoutine = routine;

    res.json({
      routine: {
        title: routine.title,
        exercises: routine.exercises.map(ex => ({
          name: ex.exerciseName,
          isCompound: ex.isCompound,
          progressionStrategy: ex.progressionStrategy,
          sets: ex.sets,
          notes: ex.notes,
          estimatedDuration: Math.round(ex.estimatedDurationSeconds / 60)
        })),
        totalMinutes: routine.totalEstimatedMinutes,
        notes: routine.notes
      }
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    generationInProgress = false;
  }
});

/**
 * Publish the last generated routine to Hevy
 */
app.post('/api/publish', async (req: Request, res: Response) => {
  try {
    if (!lastGeneratedRoutine) {
      return res.status(400).json({ error: 'No routine to publish. Generate one first.' });
    }

    const { hevyApiKey } = getApiKeys();

    if (!hevyApiKey) {
      return res.status(400).json({
        error: 'Hevy API key not configured. Please add it in Settings.'
      });
    }

    const config = createHevyConfig(hevyApiKey);
    const client = new HevyApiClient(config);
    const publisher = new RoutinePublisher(client);

    const routine = await publisher.publish(lastGeneratedRoutine, {
      dryRun: false,
      folderName: 'AI Routines'
    });

    res.json({
      success: true,
      routineId: routine?.id,
      title: routine?.title,
      createdAt: routine?.created_at
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get current configuration
 */
app.get('/api/config', (req: Request, res: Response) => {
  try {
    const config = loadConfig();

    // Load API keys from environment variables if available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || (config as any).anthropicApiKey || '';
    const hevyApiKey = process.env.HEVY_API_KEY || (config as any).hevyApiKey || '';

    // Explicitly create response object
    // Note: In production, you should NEVER send API keys to the client
    // This is only for local development where users provide their own keys
    const responseObj = {
      anthropicApiKey: anthropicApiKey ? '***' + anthropicApiKey.slice(-4) : '', // Mask key except last 4 chars
      hevyApiKey: hevyApiKey ? '***' + hevyApiKey.slice(-4) : '', // Mask key except last 4 chars
      hevy: {
        baseUrl: config.hevy.baseUrl,
        timeout: config.hevy.timeout,
        retries: config.hevy.retries,
        pageSize: config.hevy.pageSize
      },
      training: config.training
    };
    res.json(responseObj);
  } catch (error: any) {
    console.error('Config error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update configuration
 */
app.put('/api/config', async (req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const configPath = path.join(process.cwd(), 'config', 'default.json');
    const currentConfig = loadConfig();

    // Merge updates with current config
    const updatedConfig: any = {
      hevy: {
        ...currentConfig.hevy,
        ...(req.body.hevy || {})
      },
      training: {
        ...currentConfig.training,
        ...(req.body.training || {}),
        hypertrophy: {
          ...currentConfig.training.hypertrophy,
          ...(req.body.training?.hypertrophy || {})
        }
      }
    };

    // Store API keys if provided (only in config file, not in environment)
    if (req.body.anthropicApiKey) {
      updatedConfig.anthropicApiKey = req.body.anthropicApiKey;
    }
    if (req.body.hevyApiKey) {
      updatedConfig.hevyApiKey = req.body.hevyApiKey;
    }

    // Write to file
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error: any) {
    console.error('Config update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files AFTER API routes
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Hevy AI Trainer Web UI`);
  console.log(`================================`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`💪 Open browser to start training!\n`);
});
