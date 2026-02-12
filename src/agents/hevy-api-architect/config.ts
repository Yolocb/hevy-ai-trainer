/**
 * AGENT A: Hevy API Architect
 *
 * Configuration helper for Hevy API client
 */

import { HevyConfig } from './models';

export function createHevyConfig(apiKey?: string, baseUrl?: string): HevyConfig {
  const key = apiKey || process.env.HEVY_API_KEY;

  if (!key) {
    throw new Error(
      'HEVY_API_KEY is required. Set it in .env file or pass as parameter.'
    );
  }

  return {
    apiKey: key,
    baseUrl: baseUrl || process.env.HEVY_API_BASE_URL || 'https://api.hevyapp.com/v1',
    timeout: 30000,
    retries: 3,
  };
}
