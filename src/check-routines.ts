/**
 * Check existing routines to find folder IDs
 */

import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';

dotenv.config();

async function checkRoutines() {
  const config = createHevyConfig();
  const client = new HevyApiClient(config);

  try {
    console.log('📥 Fetching your routines...\n');
    const response = await client['client'].get('/routines');
    console.log('Routines response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.log('Error:', error.message);
  }
}

checkRoutines();
