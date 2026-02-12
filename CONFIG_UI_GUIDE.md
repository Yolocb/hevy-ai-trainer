# Configuration UI Guide

## Overview

The Hevy AI Trainer web UI now includes a comprehensive **Configuration Panel** that allows you to view and modify all training parameters directly from the browser, without manually editing the `config/default.json` file.

## Features

### 1. **Collapsible Configuration Panel**
- Located between the stats dashboard and the main routine generation panel
- Click the header to expand/collapse the configuration section
- Starts collapsed by default for a cleaner interface

### 2. **Four Configuration Sections**

#### A. Hevy API Settings
Configure how the app communicates with the Hevy API:
- **API Timeout**: Request timeout in milliseconds (5000-120000ms)
- **Max Retries**: Number of retry attempts for failed requests (1-10)
- **Page Size**: Number of items fetched per page (10-500)

#### B. Training Parameters
Core workout session settings:
- **Target Session**: Desired workout duration in minutes (30-120)
- **Sessions Per Week**: Planned training frequency (1-7)
- **History Months**: How far back to analyze workout data (1-24)
- **Min/Max Exercises**: Range of exercises per routine (3-15 each)

#### C. Hypertrophy Settings
Fine-tune the muscle growth optimization:
- **Min/Max Sets**: Set range per exercise (1-10 each)
- **Min/Max Reps**: Rep range for hypertrophy (1-30 each)
- **Rest Compound**: Rest time for compound exercises (30-300 seconds)
- **Rest Isolation**: Rest time for isolation exercises (30-300 seconds)

#### D. Focus Muscle Groups
Visual muscle group selector with clickable chips:
- **Available groups**: chest, shoulders, biceps, triceps, lats, upper_back, lower_back, quads, hamstrings, glutes, calves, abs, forearms
- Click chips to toggle selection (active chips are highlighted)
- Selected groups determine which exercises appear in routines

### 3. **Action Buttons**

#### Save Configuration
- Validates all inputs before saving
- Checks that min values don't exceed max values
- Ensures at least one muscle group is selected
- Writes changes to `config/default.json`
- Shows success/error alerts
- Refreshes stats to reflect new settings

#### Reset to Current
- Reverts all form fields to the currently saved configuration
- Useful for undoing unsaved changes
- No API call required

### 4. **Theme Integration**

The configuration panel fully supports both themes:

**LOTR Theme:**
- ⚙ Training Configuration
- Medieval fantasy styling
- Success: "⚔ Configuration saved successfully!"
- Error: "⚠ The path is blocked:"

**Terminator Theme:**
- ◉ SYSTEM CONFIGURATION
- Futuristic cyber styling with scan lines
- Success: "✓ CONFIGURATION UPDATED. NEW PARAMETERS ACTIVE."
- Error: "⚠ ERROR:"

### 5. **Form Validation**

The UI includes client-side validation:
- Min/max range checks (min ≤ max)
- Required field validation
- At least one muscle group must be selected
- Numeric bounds enforcement
- User-friendly error messages

## Usage

### Accessing the Configuration Panel

1. Start the web server:
   ```bash
   npm run web
   ```

2. Open browser to: `http://localhost:3000`

3. Click on the "⚙ Training Configuration" header to expand the panel

### Modifying Settings

1. **Update any fields** you want to change
2. **Toggle muscle groups** by clicking the chips
3. Click **"💾 Save Configuration"** to persist changes
4. Changes are immediately written to `config/default.json`
5. Generate a new routine to see the effects

### Resetting Changes

If you make changes but want to revert:
1. Click **"🔄 Reset to Current"**
2. All fields return to the saved values
3. No API call is made

## API Endpoints

The configuration feature uses two endpoints:

### GET /api/config
Returns the current configuration:
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

### PUT /api/config
Updates the configuration:
- **Request Body**: Partial or full configuration object
- **Validation**: Server validates ranges and requirements
- **Response**: Returns updated configuration
- **Side Effect**: Writes to `config/default.json`

## Technical Details

### Frontend Components

**CSS Classes:**
- `.config-panel` - Main container with glass morphism effect
- `.config-section` - Individual configuration category
- `.config-field` - Input field wrapper
- `.muscle-chip` - Muscle group selector buttons
- `.config-actions` - Button container

**JavaScript Functions:**
- `toggleConfigPanel()` - Show/hide configuration panel
- `loadConfiguration()` - Fetch and populate current config
- `renderMuscleSelector()` - Build muscle group chips
- `saveConfiguration()` - Validate and save changes
- `resetConfiguration()` - Revert to saved values
- `showConfigAlert()` - Display feedback messages

### Backend Implementation

**File**: `src/server.ts`

**New Endpoint**:
```typescript
app.put('/api/config', async (req, res) => {
  // Reads current config
  // Merges with request body
  // Validates structure
  // Writes to config/default.json
  // Returns updated config
});
```

**Updated Endpoint**:
```typescript
app.get('/api/config', (req, res) => {
  // Now returns full config instead of partial
  // Includes both hevy and training sections
});
```

## Best Practices

1. **Test changes incrementally**: Modify one section at a time
2. **Start with defaults**: The included defaults are science-based
3. **Muscle group selection**: More groups = more exercise variety
4. **History months**: 12 months provides good trend analysis
5. **Set/rep ranges**: [3-4] sets × [6-12] reps is optimal for hypertrophy
6. **Rest times**: 90-120 seconds balances recovery and session duration

## Troubleshooting

### Configuration won't save
- Check browser console for errors
- Ensure all required fields have values
- Verify min values are ≤ max values
- Confirm at least one muscle group is selected

### Stats don't update after save
- Stats refresh automatically after 500ms
- If not, refresh the page manually
- Check that HEVY_API_KEY is set in `.env`

### Changes not reflected in routines
- Configuration changes affect *new* routines only
- Click "⚔ Forge New Quest" to generate with new settings
- Previous routines keep their original settings

## Example Workflows

### Focus on Upper Body Only
1. Expand configuration panel
2. In "Focus Muscle Groups", select: chest, shoulders, biceps, triceps, lats, upper_back
3. Deselect all lower body groups
4. Save configuration
5. Generate routine

### Quick 45-Minute Sessions
1. Set "Target Session" to 45 minutes
2. Set "Min Exercises" to 5, "Max Exercises" to 6
3. Optionally reduce rest times to 60s compound, 45s isolation
4. Save configuration
5. Generate routine

### Higher Volume Training
1. Set "Min Sets" to 4, "Max Sets" to 5
2. Set "Min Reps" to 8, "Max Reps" to 15
3. Increase "Target Session" to 75 minutes
4. Save configuration
5. Generate routine

## Architecture

```
┌─────────────────────────────────────────┐
│         Web UI (index.html)             │
│  ┌────────────────────────────────────┐ │
│  │   Configuration Panel              │ │
│  │   - Form inputs                    │ │
│  │   - Muscle group selector          │ │
│  │   - Save/Reset buttons             │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │ PUT /api/config
               ▼
┌─────────────────────────────────────────┐
│       Express Server (server.ts)        │
│  ┌────────────────────────────────────┐ │
│  │   PUT /api/config endpoint         │ │
│  │   - Validates input                │ │
│  │   - Merges with current config     │ │
│  │   - Writes to file system          │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │ fs.writeFile()
               ▼
┌─────────────────────────────────────────┐
│      config/default.json                │
│      - Persisted configuration          │
│      - Loaded on server start           │
│      - Used by all agents               │
└─────────────────────────────────────────┘
```

## Future Enhancements

Potential additions for future versions:
- Import/export configuration profiles
- Preset templates (beginner, intermediate, advanced)
- Configuration history with rollback
- Real-time validation as you type
- Configuration comparison tool
- Per-routine configuration overrides
- Dark/light theme independent of LOTR/Terminator themes

## Summary

The Configuration UI provides a user-friendly way to customize the Hevy AI Trainer without touching JSON files. All settings from `config/default.json` are now accessible via the web interface, with proper validation, theme integration, and persistent storage.

**Key Benefits:**
- No manual file editing required
- Visual muscle group selection
- Immediate validation and feedback
- Theme-aware styling
- Persistent storage to disk
- Full control over training parameters

Open `http://localhost:3000` and start customizing your AI-powered training!
