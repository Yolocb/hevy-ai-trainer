# Agent Specification Summary

This document provides a concise reference for all five agents in the Hevy AI Trainer system.

---

## Agent A: Hevy API Architect

**Name**: Hevy API Architect

**Role**: Design and implement the official Hevy API integration layer

**Responsibilities**:
- Read and interpret Hevy API documentation
- Define TypeScript data models for all Hevy entities (Workout, Exercise, Routine, Folder)
- Implement HTTP client with authentication, pagination, rate limiting, retries
- Provide clean methods: `getWorkouts()`, `getExerciseTemplates()`, `getRoutineFolders()`, `createRoutine()`
- Handle all API errors gracefully

**Skills & Technologies**:
- REST API design and consumption
- TypeScript for type-safe models
- Axios HTTP client
- Bearer token authentication
- Pagination handling

**Typical Inputs**:
- API key, base URL, timeout config
- Date ranges for workout queries
- Routine payloads for creation

**Typical Outputs**:
- Arrays of `Workout` objects
- Arrays of `ExerciseTemplate` objects
- Arrays of `RoutineFolder` objects
- Created `Routine` objects

**Files**:
- `src/agents/hevy-api-architect/models.ts`
- `src/agents/hevy-api-architect/client.ts`
- `src/agents/hevy-api-architect/config.ts`

---

## Agent B: Training Logic & Routine Planner

**Name**: Training Logic & Routine Planner

**Role**: Implement fitness science and routine generation logic

**Responsibilities**:
- Analyze one year of workout history
- Calculate per-exercise stats: volume, frequency, top sets, last performed
- Filter exercises by muscle group (arms, shoulders, chest)
- Categorize exercises (compound vs isolation)
- Apply hypertrophy principles: 3-4 sets × 6-12 reps
- Plan ~60 minute sessions with 6-8 exercises
- Apply progressive overload (2.5% weight increase)
- Ensure routines fit time constraints

**Skills & Technologies**:
- Exercise programming knowledge
- Hypertrophy training principles
- Algorithmic planning under constraints
- TypeScript for type safety

**Typical Inputs**:
- Array of `Workout` objects (12 months history)
- Array of `ExerciseTemplate` objects
- Training config (target duration, sets, reps, rest periods, focus muscles)

**Typical Outputs**:
- `PlannedRoutine` object with:
  - Title (formatted with today's date)
  - Array of `PlannedExercise` objects
  - Total estimated duration
  - Training notes

**Files**:
- `src/agents/training-planner/analyzer.ts`
- `src/agents/training-planner/planner.ts`
- `src/agents/training-planner/rules.ts`

---

## Agent C: Routine Payload & Hevy Integration Agent

**Name**: Routine Payload & Hevy Integration Agent

**Role**: Transform planned routines to Hevy API format and publish them

**Responsibilities**:
- Map internal `PlannedRoutine` to Hevy's `CreateRoutineRequest` JSON format
- Ensure routine name = current date (YYYY-MM-DD)
- Create or reuse dedicated routine folder ("AI Routines")
- Validate payloads match Hevy API schema
- Call Hevy API via Agent A's client
- Handle errors and log routine IDs
- Support dry-run mode

**Skills & Technologies**:
- JSON mapping and validation
- TypeScript type transformations
- Error handling and logging

**Typical Inputs**:
- `PlannedRoutine` from Agent B
- Folder name (default: "AI Routines")
- Dry-run flag

**Typical Outputs**:
- `CreateRoutineRequest` payload (validated JSON)
- Created `Routine` object from Hevy API
- Console logs with routine ID and status

**Files**:
- `src/agents/hevy-integration/mapper.ts`
- `src/agents/hevy-integration/publisher.ts`

---

## Agent D: App Orchestrator & UX Agent

**Name**: App Orchestrator & UX Agent

**Role**: Build CLI interface and coordinate all agents

**Responsibilities**:
- Load configuration from files and environment variables
- Parse CLI arguments (--dry-run, --duration, --folder)
- Initialize Agent A (Hevy API client)
- Orchestrate workflow:
  1. Fetch workout history (Agent A)
  2. Fetch exercise templates (Agent A)
  3. Build statistics (Agent B)
  4. Filter for target muscles (Agent B)
  5. Categorize exercises (Agent B)
  6. Plan routine (Agent B)
  7. Publish routine (Agent C)
- Display progress messages and results
- Handle errors with helpful messages

**Skills & Technologies**:
- Application architecture
- CLI design and argument parsing
- Node.js process management
- TypeScript coordination

**Typical Inputs**:
- Command-line arguments
- Config files (`config/default.json`)
- Environment variables (`.env`)

**Typical Outputs**:
- Console output with progress indicators
- Success/error messages
- Created routine summary

**Files**:
- `src/agents/orchestrator/cli.ts`
- `src/agents/orchestrator/config.ts`
- `src/index.ts` (main entry point)

---

## Agent E: Testing & Refactoring Agent

**Name**: Testing & Refactoring Agent

**Role**: Ensure quality, maintainability, and code health

**Responsibilities**:
- Write unit tests for Agent B (planning logic)
- Write unit tests for Agent C (mapping logic)
- Write integration tests (mock Hevy API)
- Test training rules: hypertrophy ranges, time constraints, progressive overload
- Test payload validation
- Continuous refactoring for clarity and modularity
- Ensure agents remain decoupled

**Skills & Technologies**:
- Test-driven development (TDD)
- Jest testing framework
- TypeScript type checking
- Code quality practices

**Typical Inputs**:
- Code from all agents
- Test requirements and edge cases

**Typical Outputs**:
- Test suites (`*.test.ts` files)
- Test coverage reports
- Refactoring recommendations
- Bug fixes

**Files**:
- `src/tests/planner.test.ts`
- `src/tests/mapper.test.ts`
- `jest.config.js` (test configuration)

---

## Inter-Agent Dependencies

```
Agent D (Orchestrator)
  ├─> Agent A (API Client)
  │     └─> Used by Agent C
  ├─> Agent B (Planner)
  └─> Agent C (Publisher)
        └─> Uses Agent A's client

Agent E (Testing)
  └─> Tests all agents
```

**Key Principles**:
- Agents communicate through well-defined TypeScript interfaces
- No circular dependencies
- Each agent can be tested independently
- Orchestrator is the only agent that imports others directly

---

## Agent Task Execution Example

**User command**: `npm run dev`

```
┌─────────────────────────────────────────────────────────────┐
│ Agent D: Load config, parse CLI, initialize Agent A client  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ Agent A: Fetch last 12 months of workouts from Hevy API     │
│ Agent A: Fetch all exercise templates from Hevy API         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ Agent B: Build exercise statistics from workout history     │
│ Agent B: Filter exercises for arms, shoulders, chest        │
│ Agent B: Categorize exercises by type and muscle group      │
│ Agent B: Plan today's routine (6-8 exercises, ~60 min)      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ Agent C: Map planned routine to Hevy API JSON format        │
│ Agent C: Validate payload structure                         │
│ Agent C: Ensure "AI Routines" folder exists (via Agent A)   │
│ Agent C: Create routine in Hevy (via Agent A)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ Agent D: Display success message with routine ID            │
│ Agent D: Log routine details and Hevy app location          │
└─────────────────────────────────────────────────────────────┘
```

**Duration**: ~10-20 seconds (depends on API latency and history size)

---

## Configuration Reference

Each agent can be configured:

**Agent A** (API):
```json
{
  "hevy": {
    "baseUrl": "https://api.hevyapp.com/v1",
    "timeout": 30000,
    "retries": 3
  }
}
```
Plus: `HEVY_API_KEY` environment variable

**Agent B** (Planning):
```json
{
  "training": {
    "targetSessionMinutes": 60,
    "sessionsPerWeek": 3,
    "focusMuscles": ["arms", "shoulders", "chest"],
    "hypertrophy": {
      "setsPerExercise": [3, 4],
      "repsRange": [6, 12],
      "restCompound": 120,
      "restIsolation": 90,
      "progressiveOverload": 2.5
    },
    "exerciseCount": [6, 8],
    "historyMonths": 12
  }
}
```

**Agent C** (Publishing):
- `--folder` CLI flag (default: "AI Routines")
- `--dry-run` CLI flag (default: false)

**Agent D** (Orchestration):
- `--duration` CLI flag (overrides config)
- `--date` CLI flag (future: for non-today routines)

---

## Success Criteria

Each agent should:

✅ **Be independently testable**: Mock dependencies, test in isolation
✅ **Have clear inputs/outputs**: Well-defined TypeScript interfaces
✅ **Handle errors gracefully**: Throw meaningful errors, log useful info
✅ **Be configurable**: Support user customization without code changes
✅ **Be documented**: Clear comments and architecture docs
✅ **Be maintainable**: Single responsibility, readable code

---

## Future Extensions

Potential new agents:
- **Agent F: Nutrition Advisor** - Calculate calories and macros
- **Agent G: Progress Tracker** - Visualize strength gains over time
- **Agent H: Deload Planner** - Schedule recovery weeks
- **Agent I: Exercise Substitutor** - Suggest alternatives for missing equipment

---

This specification provides everything needed to understand, build, test, and extend the Hevy AI Trainer multi-agent system. 🤖💪
