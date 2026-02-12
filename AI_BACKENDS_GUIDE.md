# AI Backend Services Guide

## Overview

Hevy AI Trainer now supports **5 different AI backend services** for workout generation. You only need to configure **one** of these services to use AI-powered features.

## Supported AI Providers

1. **Anthropic Claude** - Advanced reasoning and long context
2. **OpenAI GPT** - Industry-leading language models
3. **Google Gemini** - Google's latest multimodal AI
4. **Azure OpenAI** - Enterprise-grade OpenAI with Azure infrastructure
5. **Custom Proxy** - Connect to your own AI backend

---

## Quick Start

### Via Web UI (Recommended)

1. Open http://localhost:3000
2. Click **"Configuration"** button (top right)
3. Scroll to **"🤖 AI Backend Services"** section
4. Select your preferred AI provider from the dropdown
5. Fill in the required fields for your chosen provider
6. Click **"💾 Save Configuration"**

### Via Environment Variables

Edit `.env` file:
```bash
# Select your provider
AI_PROVIDER=openai

# Add your API key
OPENAI_API_KEY=sk-your-key-here
```

---

## Provider Details

### 1. Anthropic Claude

**Best for**: Advanced reasoning, long context understanding, ethical AI

**Get API Key**: https://console.anthropic.com/

**Configuration**:
- **API Key**: Starts with `sk-ant-api03-`
- **Model Options**:
  - `claude-opus-4-6` - Most capable (Default)
  - `claude-sonnet-4` - Balanced performance
  - `claude-haiku-4` - Fastest responses

**Example (.env)**:
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Pricing**: Pay-per-use, starting at $15/million tokens

**Environment Variables**:
- `ANTHROPIC_API_KEY` - Your Anthropic API key

---

### 2. OpenAI GPT

**Best for**: General-purpose AI, wide ecosystem, reliable performance

**Get API Key**: https://platform.openai.com/api-keys

**Configuration**:
- **API Key**: Starts with `sk-`
- **Model Options**:
  - `gpt-4-turbo` - Most capable (Default)
  - `gpt-4` - Standard GPT-4
  - `gpt-3.5-turbo` - Fast and affordable

**Example (.env)**:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

**Pricing**: Pay-per-use, starting at $0.50/million tokens (GPT-3.5)

**Environment Variables**:
- `OPENAI_API_KEY` - Your OpenAI API key

---

### 3. Google Gemini

**Best for**: Multimodal AI, Google ecosystem integration, competitive pricing

**Get API Key**: https://makersuite.google.com/app/apikey

**Configuration**:
- **API Key**: Starts with `AIza`
- **Model Options**:
  - `gemini-pro` - Balanced (Default)
  - `gemini-ultra` - Most capable

**Example (.env)**:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaYour-Key-Here
```

**Pricing**: Free tier available, then pay-per-use

**Environment Variables**:
- `GEMINI_API_KEY` - Your Google Gemini API key

---

### 4. Azure OpenAI

**Best for**: Enterprise deployments, compliance requirements, Azure ecosystem

**Get API Key**: https://portal.azure.com → Azure OpenAI resource

**Configuration**:
- **API Key**: Your Azure API key
- **Endpoint**: `https://your-resource.openai.azure.com`
- **Deployment Name**: Your deployment name (e.g., `gpt-4`)

**Example (.env)**:
```bash
AI_PROVIDER=azure
AZURE_API_KEY=your-azure-key
AZURE_ENDPOINT=https://your-resource.openai.azure.com
AZURE_DEPLOYMENT=gpt-4
```

**Pricing**: Based on Azure pricing model, reserved capacity available

**Environment Variables**:
- `AZURE_API_KEY` - Your Azure OpenAI API key
- `AZURE_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_DEPLOYMENT` - Your deployment name

**Note**: Requires Azure subscription and Azure OpenAI service provisioning.

---

### 5. Custom Proxy

**Best for**: Custom AI backends, self-hosted models, middleware requirements

**Configuration**:
- **Proxy URL**: Your proxy endpoint (e.g., `http://localhost:8080/api`)
- **Proxy API Key**: Authentication key (optional)

**Example (.env)**:
```bash
AI_PROVIDER=proxy
PROXY_URL=http://localhost:8080/api
PROXY_API_KEY=your-proxy-key
```

**Request Format**:
The application sends POST requests:
```json
{
  "prompt": "Workout generation prompt...",
  "model": "claude-opus-4-6",
  "max_tokens": 4096
}
```

**Expected Response**:
```json
{
  "response": "AI-generated workout routine..."
}
```

**Environment Variables**:
- `PROXY_URL` - Your proxy endpoint URL
- `PROXY_API_KEY` - Authentication key (optional)

See [PROXY_SETUP.md](PROXY_SETUP.md) for detailed proxy implementation guide.

---

## Configuration Priority

Settings are loaded in this order (highest to lowest priority):

1. **Environment Variables** (`.env` file)
2. **Config File** (`config/default.json`)
3. **Default Values** (hardcoded)

This allows you to:
- Use `.env` for development/testing
- Use config file for persistent settings
- Override via environment for production deployments

---

## Switching Between Providers

You can switch AI providers at any time:

1. Open Configuration in the web UI
2. Select a different provider from the dropdown
3. Fill in the new provider's credentials
4. Save configuration
5. The app will immediately use the new provider

**Note**: Only the selected provider needs to be configured. You can leave other providers' fields empty.

---

## Security Best Practices

### ✅ Do:
- Store API keys in `.env` file (not committed to Git)
- Use the web UI to configure keys (they're masked in responses)
- Rotate API keys regularly
- Use different keys for development and production
- Monitor API usage through provider dashboards

### ❌ Don't:
- Commit API keys to version control
- Share API keys in screenshots or logs
- Use production keys for testing
- Store keys in plain text outside `.env` or config files

---

## Troubleshooting

### "AI backend not configured"
**Cause**: No AI provider has been selected or configured.

**Solution**:
1. Open Configuration
2. Select an AI provider
3. Enter valid credentials for that provider
4. Save configuration

### "Invalid API key"
**Cause**: The API key format is incorrect or the key is expired.

**Solution**:
1. Verify the key starts with the correct prefix:
   - Anthropic: `sk-ant-api03-`
   - OpenAI: `sk-`
   - Gemini: `AIza`
2. Check if the key is still active in the provider's dashboard
3. Generate a new key if needed

### "Rate limit exceeded"
**Cause**: Too many requests to the AI provider.

**Solution**:
- Wait a few minutes before retrying
- Check your API usage limits
- Consider upgrading your provider plan
- Switch to a different provider temporarily

### Configuration not saving
**Cause**: File permissions or server errors.

**Solution**:
1. Check browser console (F12) for JavaScript errors
2. Check server terminal for backend errors
3. Verify `config/default.json` is writable
4. Restart the server: `npm run web`

---

## Cost Comparison

| Provider | Free Tier | Starting Price | Best For |
|----------|-----------|----------------|----------|
| **Anthropic Claude** | Trial credits | $15/M tokens | Advanced reasoning |
| **OpenAI GPT** | Trial credits | $0.50/M tokens (3.5) | General purpose |
| **Google Gemini** | Yes (limited) | Varies | Multimodal tasks |
| **Azure OpenAI** | No | Based on Azure | Enterprise |
| **Custom Proxy** | N/A | Your costs | Self-hosted |

*Prices as of February 2026. Check provider websites for current pricing.*

---

## API Request Format

When the app calls your configured AI provider, it sends a workout generation prompt with:

- **Workout history** from Hevy app (last 12 months)
- **User preferences** (target muscles, sets, reps, rest periods)
- **Progressive overload** strategy
- **Exercise categorization** (compound vs isolation)

The AI returns a structured workout plan optimized for hypertrophy and your specific training history.

---

## Environment Variables Reference

```bash
# AI Provider Selection
AI_PROVIDER=                    # anthropic | openai | gemini | azure | proxy

# Anthropic Claude
ANTHROPIC_API_KEY=              # sk-ant-api03-...

# OpenAI GPT
OPENAI_API_KEY=                 # sk-...

# Google Gemini
GEMINI_API_KEY=                 # AIza...

# Azure OpenAI
AZURE_API_KEY=                  # Your Azure key
AZURE_ENDPOINT=                 # https://your-resource.openai.azure.com
AZURE_DEPLOYMENT=               # gpt-4

# Custom Proxy
PROXY_URL=                      # http://localhost:8080/api
PROXY_API_KEY=                  # Your proxy key

# Hevy Integration
HEVY_API_KEY=                   # Required for workout publishing
```

---

## Web UI Configuration

The configuration UI automatically shows only the fields relevant to your selected provider:

1. **Select Provider** → Dropdown reveals provider-specific fields
2. **Fill Credentials** → Only the selected provider's fields
3. **Save** → Configuration persists to `config/default.json`
4. **Test** → Click "Generate" to test AI integration

**API keys are masked** in the UI and API responses for security (`***xxxx` format).

---

## Migration from Single Provider

If you're upgrading from the previous Anthropic-only version:

1. Your existing Anthropic key is preserved
2. Select "Anthropic Claude" from the provider dropdown
3. Your key will appear (masked)
4. No action needed if you want to continue using Anthropic
5. Or select a different provider and configure it

---

## Need Help?

- **Documentation**: See individual provider's official docs
- **Troubleshooting**: Check server logs: `npm run web`
- **Configuration**: Inspect `config/default.json`
- **API Issues**: Test keys in provider's playground first

---

## Summary

- **5 AI providers supported** (Anthropic, OpenAI, Gemini, Azure, Proxy)
- **Only one provider needed** - choose what works best for you
- **Easy switching** - change providers anytime in settings
- **Secure** - keys stored locally, masked in responses
- **Flexible** - environment variables or config file
- **Cost-effective** - choose based on your budget and needs

Configure your preferred AI backend and start generating optimized workouts! 💪🤖
