#!/bin/bash
echo "=== Testing API Key Validation ==="
echo ""

echo "1. Testing /api/generate without Anthropic key:"
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" 2>&1 | grep -o "error.*" | head -c 150
echo -e "\n"

echo "2. Testing config update with new API keys:"
curl -s -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "anthropicApiKey": "test-key-12345",
    "hevyApiKey": "test-hevy-key",
    "hevy": {"timeout": 30000, "retries": 3, "pageSize": 100},
    "training": {"targetSessionMinutes": 60, "sessionsPerWeek": 3, "focusMuscles": ["chest"]}
  }' | jq '.success'
echo ""

echo "3. Verifying keys are saved (should be masked):"
curl -s http://localhost:3000/api/config | jq -r '.anthropicApiKey, .hevyApiKey'
echo ""

