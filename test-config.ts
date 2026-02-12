import { loadConfig } from './src/agents/orchestrator/config';

const config = loadConfig();
console.log('=== Full Config ===');
console.log(JSON.stringify(config, null, 2));
console.log('\n=== Config.hevy ===');
console.log(JSON.stringify(config.hevy, null, 2));
console.log('\n=== Config.training ===');
console.log(JSON.stringify(config.training, null, 2));
