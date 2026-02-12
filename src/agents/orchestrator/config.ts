/**
 * AGENT D: App Orchestrator & UX Agent
 *
 * Configuration management
 */

import * as fs from 'fs';
import * as path from 'path';
import { TrainingConfig, DEFAULT_TRAINING_CONFIG } from '../training-planner/rules';

export interface AppConfig {
  hevy: {
    baseUrl: string;
    timeout: number;
    retries: number;
    pageSize: number;
  };
  training: TrainingConfig;

  // AI Provider Selection
  aiProvider?: string;

  // Anthropic
  anthropicApiKey?: string;
  anthropicModel?: string;

  // OpenAI
  openaiApiKey?: string;
  openaiModel?: string;

  // Google Gemini
  geminiApiKey?: string;
  geminiModel?: string;

  // Azure OpenAI
  azureApiKey?: string;
  azureEndpoint?: string;
  azureDeployment?: string;

  // Custom Proxy
  proxyUrl?: string;
  proxyApiKey?: string;

  // Hevy
  hevyApiKey?: string;
}

export function loadConfig(): AppConfig {
  const configPath = path.join(__dirname, '../../../config/default.json');

  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configFile);

    return {
      hevy: config.hevy,
      training: {
        ...DEFAULT_TRAINING_CONFIG,
        ...config.training,
        hypertrophy: {
          ...DEFAULT_TRAINING_CONFIG.hypertrophy,
          ...config.training.hypertrophy,
        },
      },
      aiProvider: config.aiProvider,
      anthropicApiKey: config.anthropicApiKey,
      anthropicModel: config.anthropicModel,
      openaiApiKey: config.openaiApiKey,
      openaiModel: config.openaiModel,
      geminiApiKey: config.geminiApiKey,
      geminiModel: config.geminiModel,
      azureApiKey: config.azureApiKey,
      azureEndpoint: config.azureEndpoint,
      azureDeployment: config.azureDeployment,
      proxyUrl: config.proxyUrl,
      proxyApiKey: config.proxyApiKey,
      hevyApiKey: config.hevyApiKey,
    };
  } catch (error) {
    console.warn('⚠️  Could not load config file, using defaults');
    return {
      hevy: {
        baseUrl: 'https://api.hevyapp.com/v1',
        timeout: 30000,
        retries: 3,
        pageSize: 100,
      },
      training: DEFAULT_TRAINING_CONFIG,
    };
  }
}

export interface CliOptions {
  dryRun?: boolean;
  date?: string;
  duration?: number;
  folderName?: string;
}

export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--date':
        options.date = args[++i];
        break;
      case '--duration':
        options.duration = parseInt(args[++i], 10);
        break;
      case '--folder':
        options.folderName = args[++i];
        break;
    }
  }

  return options;
}
