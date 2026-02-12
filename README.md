# Hevy AI Trainer 🏋️‍♂️🤖

A multi-agent AI system that generates personalized, hypertrophy-focused workout routines integrated with the Hevy Fitness App.

## ⚠️ Important: Bring Your Own API Keys

This application requires TWO API keys that you must provide:

1. **Anthropic API Key** - For AI-powered workout generation
   - Get yours at: https://console.anthropic.com/
   - Used for intelligent routine planning

2. **Hevy API Key** - For publishing workouts to Hevy app
   - Get yours at: https://hevyapp.com/developers
   - Required for Hevy integration

**Your API keys are stored locally and never shared.** You can configure them either through:
- The web UI configuration panel (recommended)
- The `.env` file in the project root

## Features

### 🎨 **6 Immersive Themes**
Choose from stunning visual themes:
- **LOTR** - Medieval fantasy with golden tones
- **Terminator** - Sci-fi tech terminal aesthetic
- **Cyberpunk** - Neon pink/cyan street style
- **Viking** - Ice blue Nordic warrior theme
- **Matrix** - Digital green code aesthetic
- **Samurai** - Japanese red/pink warrior style

### 🤖 **AI-Powered Routine Generation**
- 📊 Analyzes your last 12 months of Hevy workout history
- 🎯 Focuses on specific muscle groups (configurable)
- 💪 Generates hypertrophy-optimized routines (3-4 sets × 6-12 reps)
- ⏱️ Plans ~1 hour training sessions
- 📈 Applies progressive overload based on your history
- 🗓️ Names routines with current date (YYYY-MM-DD)
- 📁 Organizes routines in dedicated "AI Routines" folder
- 🚀 Publishes directly to Hevy app

### ⚙️ **Full Configuration Control**
Edit all training parameters through the beautiful web UI:
- API timeout and retries
- Target session duration
- Sessions per week
- Exercise count ranges
- Sets and reps ranges
- Rest periods for compound and isolation exercises
- Focus muscle groups

## Prerequisites

- Node.js 18+ and npm
- Hevy PRO account
- **Anthropic API key** (for AI generation)
- **Hevy API key** (for publishing to Hevy)

## Installation

1. **Clone or download the project:**
   ```bash
   cd hevy-ai-trainer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys** (Option 1 - Environment Variables):

   Edit `.env` and add your keys:
   ```
   ANTHROPIC_API_KEY=sk-ant-your_key_here
   HEVY_API_KEY=your_hevy_key_here
   ```

5. **OR configure through the Web UI** (Option 2 - Recommended):

   Start the server and use the configuration panel to enter your API keys securely.

## Usage

### 🌐 **Web UI (Recommended)**

Start the web interface:

```bash
npm run web
```

Then open your browser to: **http://localhost:3000**

**Web UI Features:**
- 📊 Dashboard with training statistics
- 🔑 Secure API key configuration panel
- 🎨 6 beautiful themes to choose from
- 🎯 One-click routine generation
- 👁️ Preview routines before publishing
- 🚀 Publish directly to Hevy
- 📱 Mobile-responsive design

### 💻 **Command Line Interface**

#### Basic Usage

Generate and publish today's routine:

```bash
npm run dev
```

### Dry Run Mode

Preview the routine without publishing to Hevy:

```bash
npm run dev -- --dry-run
```

### Custom Options

```bash
# Custom session duration (in minutes)
npm run dev -- --duration 75

# Custom folder name
npm run dev -- --folder "My Custom Routines"

# Combine options
npm run dev -- --dry-run --duration 90 --folder "Advanced Training"
```

### Build for Production

```bash
npm run build
npm start
```

## Configuration

### Web UI Configuration (Recommended)

Click the "Configuration" button in the web interface to access the settings panel where you can configure:

- **API Keys** - Anthropic and Hevy API keys
- **Hevy API Settings** - Timeout, retries, page size
- **Training Parameters** - Session duration, weekly frequency
- **Hypertrophy Settings** - Sets, reps, rest periods
- **Muscle Groups** - Select which muscles to focus on

Changes are saved to `config/default.json`.

### Manual Configuration

Edit `config/default.json` to customize training parameters:

```json
{
  "hevy": {
    "baseUrl": "https://api.hevyapp.com/v1",
    "timeout": 30000,
    "retries": 3,
    "pageSize": 100
  },
  "training": {
    "targetSessionMinutes": 60,
    "sessionsPerWeek": 3,
    "focusMuscles": ["chest", "shoulders", "biceps", "triceps", "lats", "upper_back"],
    "hypertrophy": {
      "setsPerExercise": [3, 4],
      "repsRange": [6, 12],
      "restCompound": 120,
      "restIsolation": 90
    },
    "exerciseCount": [6, 8],
    "historyMonths": 12
  }
}
```

## Security & Privacy

- ✅ API keys are stored locally on your machine
- ✅ Keys can be set via environment variables (`.env`) or config file
- ✅ `.env` file is in `.gitignore` - never committed to Git
- ✅ No telemetry or data collection
- ✅ Your workout data stays between you, Hevy, and Anthropic APIs

**For Public Repositories:**
- Never commit your `.env` file
- Never commit `config/default.json` if it contains API keys
- Use `.env.example` as a template for others

## Project Structure

```
hevy-ai-trainer/
├── src/
│   ├── agents/
│   │   ├── hevy-api-architect/      # Agent A: API client & models
│   │   │   ├── client.ts            # Hevy API HTTP client
│   │   │   ├── models.ts            # TypeScript data models
│   │   │   └── config.ts            # API configuration
│   │   ├── training-planner/        # Agent B: Training logic
│   │   │   ├── analyzer.ts          # Workout history analysis
│   │   │   ├── planner.ts           # Routine planning engine
│   │   │   └── rules.ts             # Hypertrophy rules & constraints
│   │   ├── hevy-integration/        # Agent C: API integration
│   │   │   ├── mapper.ts            # Payload mapping
│   │   │   └── publisher.ts         # Routine publishing
│   │   └── orchestrator/            # Agent D: Coordination
│   │       ├── cli.ts               # Main orchestrator
│   │       └── config.ts            # Config management
│   ├── tests/                       # Agent E: Quality assurance
│   │   ├── planner.test.ts
│   │   └── mapper.test.ts
│   └── index.ts                     # Application entry point
├── config/
│   └── default.json                 # Configuration file
├── .env                             # Environment variables (API key)
└── package.json
```

## Agent Responsibilities

### Agent A: Hevy API Architect
- Designs and implements Hevy API client
- Handles authentication, pagination, rate limiting
- Manages data models for workouts, exercises, and routines
- Provides clean interface for other agents

### Agent B: Training Logic & Routine Planner
- Analyzes workout history (volume, frequency, progression)
- Filters exercises by muscle group
- Categorizes exercises (compound vs isolation)
- Plans routines following hypertrophy principles
- Ensures sessions fit time constraints
- Applies progressive overload

### Agent C: Routine Payload & Hevy Integration
- Maps internal routine structure to Hevy API format
- Validates payloads before sending
- Manages routine folders
- Handles API errors and logging
- Publishes routines to Hevy

### Agent D: App Orchestrator & UX
- Coordinates all agents
- Provides CLI interface
- Manages configuration
- Displays progress and results
- Handles dry-run mode

### Agent E: Testing & Refactoring
- Unit tests for core logic
- Integration tests for API mapping
- Validates hypertrophy rules
- Ensures code quality
- Continuous refactoring

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Example Output

```
🤖 Hevy AI Trainer - Multi-Agent System
=========================================

📥 Agent A: Fetching workout history...
   Date range: 2025-02-11 to 2026-02-11
   ✓ Fetched 143 workouts

📥 Agent A: Fetching exercise templates...
   ✓ Fetched 487 exercise templates

📊 Agent B: Analyzing workout history...
   ✓ Analyzed 52 unique exercises

🎯 Agent B: Filtering for arms, shoulders, chest...
   ✓ Found 28 relevant exercises

📂 Agent B: Categorizing exercises...
   ✓ Chest Compounds: 4
   ✓ Shoulder Compounds: 3
   ✓ Chest Isolation: 6
   ✓ Shoulder Isolation: 5
   ✓ Triceps: 7
   ✓ Biceps: 3

🧠 Agent B: Planning today's routine...
   ✓ Planned 7 exercises

🚀 Agent C: Publishing routine to Hevy...

============================================================
📋 ROUTINE: AI Routine 2026-02-11
============================================================
⏱️  Estimated Duration: 58 minutes
🏋️  Exercises: 7
📝 Notes: AI-generated hypertrophy routine focusing on arms, shoulders, chest. Progressive overload applied.

1. 🔥 Bench Press (Barbell)
   4 sets × 9 reps
   Target: 102.5 kg
   Rest: 120s
   Last performed: 2/8/2026

2. 🔥 Overhead Press (Barbell)
   3 sets × 9 reps
   Target: 62.5 kg
   Rest: 120s
   Last performed: 2/9/2026

[... more exercises ...]

📁 Using folder: AI Routines (ID: abc123)

🚀 Publishing routine to Hevy...

✅ SUCCESS!
Routine ID: xyz789
Title: AI Routine 2026-02-11
Folder: AI Routines
Created: 2026-02-11T14:30:00.000Z

🎉 Your routine is now available in the Hevy app!

✅ All agents completed successfully!
```

## Troubleshooting

### API Key Issues
```
Error: Anthropic API key not configured
Error: Hevy API key not configured
```
**Solution:** Add your API keys through the web UI configuration panel or in the `.env` file.

### No Workout History
```
Warning: Found 0 relevant exercises
```
**Solution:** Ensure you have workout history in Hevy for the configured time period (default: 12 months) with exercises that match your selected muscle groups.

### Rate Limiting
If you encounter rate limiting errors, the client will automatically retry with exponential backoff.

### Configuration Not Saving
**Solution:** Ensure the `config` directory exists and has write permissions.

## Multi-Agent Architecture

This application uses a specialized multi-agent architecture where each agent has a distinct role:

### Agent A: Hevy API Architect
- Designs and implements Hevy API client
- Handles authentication, pagination, rate limiting
- Manages data models for workouts, exercises, and routines
- Provides clean interface for other agents

### Agent B: Training Logic & Routine Planner
- Analyzes workout history (volume, frequency, progression)
- Filters exercises by muscle group
- Categorizes exercises (compound vs isolation)
- Plans routines following hypertrophy principles
- Ensures sessions fit time constraints
- Applies progressive overload

### Agent C: Routine Payload & Hevy Integration
- Maps internal routine structure to Hevy API format
- Validates payloads before sending
- Manages routine folders
- Handles API errors and logging
- Publishes routines to Hevy

### Agent D: App Orchestrator & UX
- Coordinates all agents
- Provides CLI and Web UI interfaces
- Manages configuration
- Displays progress and results
- Handles dry-run mode

### Agent E: Testing & Refactoring
- Unit tests for core logic
- Integration tests for API mapping
- Validates hypertrophy rules
- Ensures code quality
- Continuous refactoring

## Development

This project uses:
- **TypeScript** for type safety
- **Express.js** for the web server
- **Axios** for HTTP requests
- **Jest** for testing
- **dotenv** for environment variables
- **date-fns** for date handling

## Contributing

Feel free to submit issues or pull requests! When contributing:

1. Never commit API keys or `.env` files
2. Test changes locally first
3. Follow the existing code style
4. Update documentation as needed

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the [Hevy Fitness App](https://www.hevyapp.com/)
- Uses the official Hevy API
- Powered by [Anthropic Claude](https://www.anthropic.com/) for AI generation
- Inspired by science-based hypertrophy training principles

---

**Ready to get started?**

1. Get your API keys:
   - Anthropic: https://console.anthropic.com/
   - Hevy: https://hevyapp.com/developers

2. Install and configure:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your keys
   ```

3. Start the web UI:
   ```bash
   npm run web
   ```

4. Open http://localhost:3000 and start generating AI-powered workouts!
