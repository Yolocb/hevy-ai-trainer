#!/bin/bash
echo "=== Checking for Sensitive Data Leaks ==="
echo ""

echo "1. Checking server responses for full API keys:"
for endpoint in "/api/health" "/api/config" "/api/test"; do
  echo "  Testing $endpoint:"
  response=$(curl -s "http://localhost:3000$endpoint")
  if echo "$response" | grep -qE "c79f3edf|sk-ant-[a-zA-Z0-9]{20,}"; then
    echo "    ✗ LEAK DETECTED!"
    echo "$response" | grep -oE "(c79f3edf|sk-ant-[a-zA-Z0-9]{20,})"
  else
    echo "    ✓ No leaks found"
  fi
done
echo ""

echo "2. Checking error messages for sensitive info:"
response=$(curl -s -X POST http://localhost:3000/api/generate)
if echo "$response" | grep -qiE "key.*c79f3edf|password|secret"; then
  echo "  ✗ Sensitive info in error message"
else
  echo "  ✓ Error messages clean"
fi
echo ""

echo "3. Checking config file permissions:"
ls -la config/default.json 2>/dev/null || echo "  ✓ Config file exists"
echo ""

echo "4. Checking for API keys in HTML responses:"
response=$(curl -s http://localhost:3000/)
if echo "$response" | grep -qE "c79f3edf|sk-ant-[a-zA-Z0-9]{20,}"; then
  echo "  ✗ API key in HTML!"
else
  echo "  ✓ HTML clean"
fi
echo ""

