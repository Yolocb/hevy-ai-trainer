/**
 * Quick test to create a routine
 */

import * as dotenv from 'dotenv';
import { HevyApiClient } from './agents/hevy-api-architect/client';
import { createHevyConfig } from './agents/hevy-api-architect/config';

dotenv.config();

async function testCreateRoutine() {
  const config = createHevyConfig();
  const client = new HevyApiClient(config);

  try {
    console.log('1. Fetching existing folders...\n');
    const folders = await client.getAllRoutineFolders();
    console.log(`Found ${folders.length} folders:`);
    folders.forEach(f => console.log(`  - ${f.title} (ID: ${f.id})`));

    let folderId = '';
    if (folders.length > 0) {
      folderId = folders[0].id;
      console.log(`\nUsing existing folder: ${folders[0].title} (${folderId})`);
    } else {
      console.log('\n2. Creating new folder...');
      try {
        const newFolder = await client.createRoutineFolder({ title: 'AI Routines' });
        folderId = newFolder.id;
        console.log(`Created folder: ${newFolder.title} (${folderId})`);
      } catch (folderError: any) {
        console.log(`Folder creation failed: ${folderError.message}`);
        console.log('Trying without folder...');
      }
    }

    // Try to create a routine
    console.log('\n3. Creating test routine...\n');

    const testPayload = {
      title: 'Test Routine ' + new Date().toISOString().split('T')[0],
      routine_folder_id: folderId || 'default',  // Try routine_folder_id instead
      notes: 'Test routine from API',
      exercises: [
        {
          exercise_template_id: 'FBF92739',  // Your incline chest press
          superset_id: null,
          notes: '',
          sets: [
            { type: 'normal', reps: 10, weight_kg: 50, distance_meters: null, duration_seconds: null }
          ]
        }
      ]
    };

    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const routine = await client.createRoutine(testPayload as any);
    console.log('\n✅ SUCCESS! Routine created:', routine.id);
    console.log('Title:', routine.title);
  } catch (error: any) {
    console.log('\n❌ Final Error:', error.message, error.status);
  }
}

testCreateRoutine();
