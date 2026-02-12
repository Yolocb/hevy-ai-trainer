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
  anthropicApiKey?: string;
  hevyApiKey?: string;
  proxyUrl?: string;
  proxyApiKey?: string;
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
      anthropicApiKey: config.anthropicApiKey,
      hevyApiKey: config.hevyApiKey,
      proxyUrl: config.proxyUrl,
      proxyApiKey: config.proxyApiKey,
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
