#!/bin/bash
echo "=== Testing API Endpoints ==="
echo ""

echo "1. Health Check:"
curl -s http://localhost:3000/api/health
echo -e "\n"

echo "2. Get Config:"
curl -s http://localhost:3000/api/config | head -c 500
echo -e "\n...\n"

echo "3. Test endpoint:"
curl -s http://localhost:3000/api/test
echo -e "\n"

echo "4. Stats endpoint (requires Hevy API key):"
curl -s http://localhost:3000/api/stats 2>&1 | head -c 300
echo -e "\n...\n"

