# AI Proxy Configuration Guide

## Overview

The Hevy AI Trainer now supports using a local AI proxy instead of direct Anthropic API access. This is useful if you:
- Have your own AI backend infrastructure
- Use a proxy service for API management
- Need custom authentication or routing

## Configuration Options

You can configure the AI backend in **two ways**:

### Option 1: Via Web UI (Recommended)

1. Open http://localhost:3000
2. Click **"Configuration"** button (top right)
3. Scroll to **"🔌 AI Proxy Configuration"** section
4. Enter your settings:
   - **AI Proxy URL**: The full endpoint URL (e.g., `http://localhost:8080/api/chat`)
   - **AI Proxy API Key**: Your authentication key for the proxy (optional)
5. Click **"💾 Save Configuration"**
6. Close the config panel and test by generating a workout

### Option 2: Via Environment Variables

Edit the `.env` file:

```bash
# AI Proxy Configuration
PROXY_URL=http://localhost:8080/api/chat
PROXY_API_KEY=your-proxy-api-key-here
```

Save the file and restart the server:
```bash
npm run web
```

## How It Works

### Proxy Priority

The application checks for AI backend configuration in this order:

1. **Proxy URL** (from UI config or .env)
   - If configured, all AI requests go through your proxy
   - Proxy API key is sent as `Authorization: Bearer <key>` header

2. **Anthropic API Key** (from UI config or .env)
   - Fallback option for direct Anthropic API access
   - Not currently implemented (requires @anthropic-ai/sdk)

### Request Format

When using a proxy, the application sends POST requests with this format:

```json
{
  "prompt": "Your workout generation prompt...",
  "model": "claude-opus-4-6",
  "max_tokens": 4096
}
```

### Expected Response

Your proxy should return a JSON response with one of these formats:

**Format 1** (preferred):
```json
{
  "response": "AI-generated workout routine text..."
}
```

**Format 2** (alternative):
```json
{
  "content": "AI-generated workout routine text..."
}
```

**Format 3** (fallback):
Any JSON response - the entire object will be stringified.

## Security Notes

- ✅ Proxy credentials are stored locally in `config/default.json`
- ✅ API keys are masked in UI responses (`***xxxx`)
- ✅ Config files are in `.gitignore` (not committed to GitHub)
- ⚠️ Never share your proxy credentials publicly
- ⚠️ Use HTTPS for proxy URLs in production environments

## Validation

The application validates that **at least one** AI backend is configured:
- Either **Proxy URL** is set
- Or **Anthropic API Key** is set

If neither is configured, you'll see:
```
⚠ AI backend not configured. Please add either a Proxy URL or Anthropic API key in Settings.
```

## Testing Your Configuration

After configuring the proxy:

1. Refresh http://localhost:3000
2. Click **"⚔ Forge New Quest"** (Generate button)
3. Check for errors in:
   - Browser console (F12)
   - Server terminal output
4. If successful, you'll see: "The Council convenes... Forging your legendary routine..."

## Example Proxy Implementations

### Example 1: Node.js Express Proxy

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { prompt, model, max_tokens } = req.body;

  // Verify API key
  const providedKey = req.headers.authorization?.replace('Bearer ', '');
  if (providedKey !== process.env.EXPECTED_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Call your AI backend
  const response = await axios.post('https://your-ai-backend.com/api', {
    prompt,
    model,
    max_tokens
  });

  res.json({ response: response.data.text });
});

app.listen(8080);
```

### Example 2: Python Flask Proxy

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/api/chat', methods=['POST'])
def chat():
    # Verify API key
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header.replace('Bearer ', '') != 'your-key':
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json

    # Call your AI backend
    response = requests.post('https://your-ai-backend.com/api', json={
        'prompt': data['prompt'],
        'model': data['model'],
        'max_tokens': data['max_tokens']
    })

    return jsonify({'response': response.json()['text']})

if __name__ == '__main__':
    app.run(port=8080)
```

## Troubleshooting

### Error: "AI backend not configured"
- Check that **Proxy URL** field is filled in Settings
- Or check that **Anthropic API Key** is filled
- Verify changes were saved (click "Save" button)

### Error: "Network Error" or "Connection Refused"
- Verify your proxy server is running
- Check the proxy URL is correct (including port)
- Test proxy endpoint with curl:
  ```bash
  curl -X POST http://localhost:8080/api/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer your-key" \
    -d '{"prompt":"test","model":"claude-opus-4-6","max_tokens":100}'
  ```

### Error: "401 Unauthorized"
- Verify **Proxy API Key** matches your proxy's expected key
- Check if your proxy requires authentication
- Review proxy server logs for authentication errors

### No Error But No Response
- Check browser console (F12) for JavaScript errors
- Review server terminal for backend errors
- Verify your proxy returns the expected JSON format

## Configuration Storage

Settings are stored in:
```
C:\Users\D043877\VSCode\hevy-ai-trainer\config\default.json
```

Example configuration:
```json
{
  "hevy": { ... },
  "training": { ... },
  "proxyUrl": "http://localhost:8080/api/chat",
  "proxyApiKey": "your-proxy-api-key"
}
```

## Environment Variables

Alternatively, use `.env` file:
```
PROXY_URL=http://localhost:8080/api/chat
PROXY_API_KEY=your-proxy-api-key
```

**Priority**: Environment variables override config file settings.

---

**Need Help?**
- Check server logs in the terminal
- Review browser console (F12 → Console tab)
- Test your proxy endpoint independently
- Verify JSON request/response formats match expectations

---

**Security Reminder**: Keep your proxy credentials secure and never commit them to version control!
