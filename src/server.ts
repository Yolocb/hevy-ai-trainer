/**
 * Web UI Server for Hevy AI Trainer
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
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
    aiProvider: config.aiProvider || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || config.anthropicApiKey || '',
    anthropicModel: config.anthropicModel || 'claude-opus-4-6',
    openaiApiKey: process.env.OPENAI_API_KEY || config.openaiApiKey || '',
    openaiModel: config.openaiModel || 'gpt-4-turbo',
    geminiApiKey: process.env.GEMINI_API_KEY || config.geminiApiKey || '',
    geminiModel: config.geminiModel || 'gemini-pro',
    azureApiKey: process.env.AZURE_API_KEY || config.azureApiKey || '',
    azureEndpoint: config.azureEndpoint || '',
    azureDeployment: config.azureDeployment || '',
    proxyUrl: process.env.PROXY_URL || config.proxyUrl || '',
    proxyApiKey: process.env.PROXY_API_KEY || config.proxyApiKey || '',
    hevyApiKey: process.env.HEVY_API_KEY || config.hevyApiKey || ''
  };
}

/**
 * Call AI backend via proxy or direct Anthropic API
 */
async function callAIBackend(prompt: string): Promise<string> {
  const { anthropicApiKey, proxyUrl, proxyApiKey } = getApiKeys();

  // If proxy is configured, use it
  if (proxyUrl) {
    const headers: any = {
      'Content-Type': 'application/json'
    };

    // Add proxy API key to headers if configured
    if (proxyApiKey) {
      headers['Authorization'] = `Bearer ${proxyApiKey}`;
    }

    const response = await axios.post(proxyUrl, {
      prompt: prompt,
      model: 'claude-opus-4-6',
      max_tokens: 4096
    }, { headers });

    return response.data.response || response.data.content || JSON.stringify(response.data);
  } else {
    // For now, return error if no proxy configured and no Anthropic SDK
    throw new Error('AI backend not configured. Please configure a proxy URL in settings, or install Anthropic SDK for direct access.');
  }
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
    const keys = getApiKeys();
    const { hevyApiKey, aiProvider, anthropicApiKey, openaiApiKey, geminiApiKey, azureApiKey, proxyUrl } = keys;

    // Extract theme from request body
    const theme = req.body?.theme || 'lotr';

    if (!hevyApiKey) {
      generationInProgress = false;
      return res.status(400).json({
        error: 'Hevy API key not configured. Please add it in Settings.'
      });
    }

    // Check if at least one AI backend is configured
    const hasAIBackend = anthropicApiKey || openaiApiKey || geminiApiKey || azureApiKey || proxyUrl;
    if (!hasAIBackend) {
      generationInProgress = false;
      return res.status(400).json({
        error: 'AI backend not configured. Please configure an AI provider in Settings to use AI generation.'
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
    const routine = planner.planTodayRoutine(categorized, trainingConfig.training, theme);

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
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || config.anthropicApiKey || '';
    const hevyApiKey = process.env.HEVY_API_KEY || config.hevyApiKey || '';
    const proxyUrl = process.env.PROXY_URL || config.proxyUrl || '';
    const proxyApiKey = process.env.PROXY_API_KEY || config.proxyApiKey || '';
    const openaiApiKey = process.env.OPENAI_API_KEY || config.openaiApiKey || '';
    const geminiApiKey = process.env.GEMINI_API_KEY || config.geminiApiKey || '';
    const azureApiKey = process.env.AZURE_API_KEY || config.azureApiKey || '';

    // Explicitly create response object
    // Note: In production, you should NEVER send API keys to the client
    // This is only for local development where users provide their own keys
    const responseObj = {
      aiProvider: config.aiProvider || '',

      // Anthropic
      anthropicApiKey: anthropicApiKey ? '***' + anthropicApiKey.slice(-4) : '',
      anthropicModel: config.anthropicModel || 'claude-opus-4-6',

      // OpenAI
      openaiApiKey: openaiApiKey ? '***' + openaiApiKey.slice(-4) : '',
      openaiModel: config.openaiModel || 'gpt-4-turbo',

      // Gemini
      geminiApiKey: geminiApiKey ? '***' + geminiApiKey.slice(-4) : '',
      geminiModel: config.geminiModel || 'gemini-pro',

      // Azure
      azureApiKey: azureApiKey ? '***' + azureApiKey.slice(-4) : '',
      azureEndpoint: config.azureEndpoint || '',
      azureDeployment: config.azureDeployment || '',

      // Proxy
      proxyUrl: proxyUrl,
      proxyApiKey: proxyApiKey ? '***' + proxyApiKey.slice(-4) : '',

      // Hevy
      hevyApiKey: hevyApiKey ? '***' + hevyApiKey.slice(-4) : '',

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
    if (req.body.aiProvider !== undefined) {
      updatedConfig.aiProvider = req.body.aiProvider;
    }

    // Anthropic
    if (req.body.anthropicApiKey !== undefined) {
      updatedConfig.anthropicApiKey = req.body.anthropicApiKey;
    }
    if (req.body.anthropicModel !== undefined) {
      updatedConfig.anthropicModel = req.body.anthropicModel;
    }

    // OpenAI
    if (req.body.openaiApiKey !== undefined) {
      updatedConfig.openaiApiKey = req.body.openaiApiKey;
    }
    if (req.body.openaiModel !== undefined) {
      updatedConfig.openaiModel = req.body.openaiModel;
    }

    // Gemini
    if (req.body.geminiApiKey !== undefined) {
      updatedConfig.geminiApiKey = req.body.geminiApiKey;
    }
    if (req.body.geminiModel !== undefined) {
      updatedConfig.geminiModel = req.body.geminiModel;
    }

    // Azure
    if (req.body.azureApiKey !== undefined) {
      updatedConfig.azureApiKey = req.body.azureApiKey;
    }
    if (req.body.azureEndpoint !== undefined) {
      updatedConfig.azureEndpoint = req.body.azureEndpoint;
    }
    if (req.body.azureDeployment !== undefined) {
      updatedConfig.azureDeployment = req.body.azureDeployment;
    }

    // Proxy
    if (req.body.proxyUrl !== undefined) {
      updatedConfig.proxyUrl = req.body.proxyUrl;
    }
    if (req.body.proxyApiKey !== undefined) {
      updatedConfig.proxyApiKey = req.body.proxyApiKey;
    }

    // Hevy
    if (req.body.hevyApiKey !== undefined) {
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
