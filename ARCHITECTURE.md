# Multi-Agent Architecture Documentation

## Overview

Hevy AI Trainer implements a **specialized multi-agent system** where each agent has a clearly defined role, responsibilities, and communication interface. This architecture promotes:

- **Separation of Concerns**: Each agent focuses on one domain
- **Maintainability**: Changes to one agent don't affect others
- **Testability**: Each agent can be tested independently
- **Extensibility**: New agents can be added without modifying existing ones
- **Clarity**: Code organization mirrors the problem domain

---

## Agent Descriptions

### Agent A: Hevy API Architect

**Location**: `src/agents/hevy-api-architect/`

**Role**: The sole interface between our application and the Hevy API.

**Core Responsibilities**:
- Define all data models based on Hevy API specification
- Implement authenticated HTTP client with error handling
- Handle pagination for large result sets
- Manage API rate limiting and retries
- Abstract away API complexity from other agents

**Key Files**:
- `models.ts`: TypeScript interfaces for all Hevy entities
- `client.ts`: HTTP client with methods like `getAllWorkouts()`, `createRoutine()`
- `config.ts`: Configuration helper for API credentials

**Technologies**:
- Axios for HTTP requests
- TypeScript for type safety
- Bearer token authentication

**Inputs**: API configuration (key, base URL, timeout)

**Outputs**: Typed Hevy data objects (Workouts, Exercises, Routines)

**Example Usage**:
```typescript
const client = new HevyApiClient(config);
const workouts = await client.getAllWorkouts('2025-01-01', '2026-01-01');
const templates = await client.getAllExerciseTemplates();
```

---

### Agent B: Training Logic & Routine Planner

**Location**: `src/agents/training-planner/`

**Role**: The "brain" that understands fitness science and plans optimal training.

**Core Responsibilities**:
- Analyze workout history to extract exercise statistics
- Calculate volume, frequency, and progression metrics
- Filter exercises by muscle group
- Categorize exercises (compound vs isolation, muscle targets)
- Apply hypertrophy training principles (sets, reps, rest periods)
- Plan routines that fit time constraints
- Apply progressive overload based on historical performance

**Key Files**:
- `analyzer.ts`: Builds stats from workout history, filters and categorizes exercises
- `planner.ts`: Core routine planning logic
- `rules.ts`: Hypertrophy rules and constraint validation

**Training Principles**:
- **Hypertrophy range**: 6-12 reps per set
- **Volume**: 3-4 sets per exercise
- **Rest periods**: 2 min for compounds, 1.5 min for isolation
- **Progressive overload**: 2.5% weight increase from last performance
- **Time constraint**: Target 60 minutes ±15% tolerance

**Inputs**:
- Workout history (from Agent A)
- Exercise templates (from Agent A)
- Training configuration (sets, reps, rest, target muscles)

**Outputs**: `PlannedRoutine` object with exercises, sets, reps, weights, timing

**Example Usage**:
```typescript
const analyzer = new WorkoutAnalyzer();
const stats = analyzer.buildExerciseStats(workouts, templates);
const filtered = analyzer.filterArmsShouldersChest(stats);
const categorized = analyzer.categorizeExercises(filtered);

const planner = new RoutinePlanner();
const routine = planner.planTodayRoutine(categorized, config);
```

---

### Agent C: Routine Payload & Hevy Integration Agent

**Location**: `src/agents/hevy-integration/`

**Role**: Translate internal routine representations to Hevy API format and publish.

**Core Responsibilities**:
- Map `PlannedRoutine` to Hevy's `CreateRoutineRequest` format
- Validate payloads match Hevy API schema
- Manage routine folders (find or create)
- Handle API errors during routine creation
- Log routine IDs and success/failure
- Support dry-run mode for testing

**Key Files**:
- `mapper.ts`: Transforms internal models to Hevy API JSON
- `publisher.ts`: Publishes routines via Agent A's client

**Inputs**: `PlannedRoutine` from Agent B, folder name

**Outputs**: Created `Routine` object from Hevy API, or null in dry-run

**Example Usage**:
```typescript
const mapper = new RoutineMapper();
const payload = mapper.mapToHevyPayload(plannedRoutine, folderId);
mapper.validatePayload(payload); // Throws if invalid

const publisher = new RoutinePublisher(client);
const routine = await publisher.publish(plannedRoutine, {
  dryRun: false,
  folderName: 'AI Routines'
});
```

---

### Agent D: App Orchestrator & UX Agent

**Location**: `src/agents/orchestrator/`

**Role**: Coordinate all agents and provide the user interface.

**Core Responsibilities**:
- Load and parse configuration files
- Parse CLI arguments and options
- Orchestrate the full workflow:
  1. Initialize Agent A (API client)
  2. Fetch data via Agent A
  3. Analyze and plan via Agent B
  4. Publish via Agent C
- Display progress and results to user
- Handle errors and provide helpful messages
- Support dry-run and custom parameters

**Key Files**:
- `cli.ts`: Main orchestration logic and CLI entry point
- `config.ts`: Configuration loading and CLI parsing

**Workflow**:
```
1. Load config + parse CLI args
2. Initialize HevyApiClient (Agent A)
3. Fetch workouts + templates (Agent A)
4. Build exercise stats (Agent B)
5. Filter for target muscles (Agent B)
6. Categorize exercises (Agent B)
7. Plan today's routine (Agent B)
8. Publish routine (Agent C)
9. Display success message
```

**Inputs**: CLI arguments, config files, environment variables

**Outputs**: Console output with progress and results

**Example Usage**:
```bash
npm run dev -- --dry-run --duration 75 --folder "My Routines"
```

---

### Agent E: Testing & Refactoring Agent

**Location**: `src/tests/`

**Role**: Ensure quality and maintain code health.

**Core Responsibilities**:
- Write unit tests for core logic (Agent B planning, Agent C mapping)
- Write integration tests for API interactions (Agent A)
- Validate training rules (hypertrophy ranges, time constraints)
- Test edge cases (empty history, missing exercises)
- Continuous code quality improvement
- Ensure agents remain decoupled

**Key Files**:
- `planner.test.ts`: Tests for Agent B
- `mapper.test.ts`: Tests for Agent C
- (Future) `integration.test.ts`: End-to-end tests

**Testing Strategy**:
- **Unit tests**: Test each agent's logic in isolation
- **Integration tests**: Test agent interactions
- **Mock external APIs**: Use test data for Hevy API responses
- **Coverage goals**: >80% for core logic

**Example Tests**:
```typescript
describe('RoutinePlanner', () => {
  it('should generate routine within time constraints', () => {
    const routine = planner.planTodayRoutine(mockCategories, config);
    expect(routine.totalEstimatedMinutes).toBeLessThanOrEqual(75);
  });

  it('should apply hypertrophy rep ranges', () => {
    const routine = planner.planTodayRoutine(mockCategories, config);
    routine.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        expect(set.reps).toBeGreaterThanOrEqual(6);
        expect(set.reps).toBeLessThanOrEqual(12);
      });
    });
  });
});
```

---

## Agent Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent D: Orchestrator                     │
│                    (CLI & Coordination)                      │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
               ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Agent A    │ │   Agent B    │ │   Agent C    │
    │  API Client  │ │   Planner    │ │  Publisher   │
    └──────┬───────┘ └──────────────┘ └───────┬──────┘
           │                                   │
           │         Hevy API Data             │
           └───────────────┬───────────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │  Hevy API    │
                   │  (External)  │
                   └──────────────┘
```

**Data Flow**:
1. Orchestrator requests workout history from Agent A
2. Agent A fetches from Hevy API and returns typed data
3. Orchestrator passes data to Agent B for analysis
4. Agent B returns planned routine
5. Orchestrator passes routine to Agent C for publishing
6. Agent C uses Agent A's client to create routine in Hevy
7. Orchestrator displays results to user

---

## Design Principles

### 1. Single Responsibility
Each agent has ONE primary job. Agent A only handles API communication. Agent B only handles training logic. This makes the code easier to understand and modify.

### 2. Dependency Injection
Agents receive their dependencies via constructor parameters:
```typescript
const publisher = new RoutinePublisher(client); // Client injected
```
This makes testing easier and components more reusable.

### 3. Strong Typing
TypeScript interfaces define all data contracts between agents. No ambiguity about what data looks like.

### 4. Configuration Over Code
Training parameters (sets, reps, muscles) live in config files, not hardcoded. Users can customize without touching code.

### 5. Fail Fast
Validation happens early. Agent C validates payloads before sending to API. Agent D validates API keys on startup.

### 6. Observable Progress
Each agent logs its progress. Users can see exactly what's happening at each step.

---

## Extending the System

### Adding a New Agent

Example: Add "Agent F: Nutrition Advisor"

1. **Create agent directory**:
   ```
   src/agents/nutrition-advisor/
   ├── calculator.ts
   └── recommender.ts
   ```

2. **Define responsibilities**:
   - Calculate caloric needs based on training volume
   - Recommend protein targets
   - Suggest meal timing

3. **Wire into orchestrator**:
   ```typescript
   const nutritionAdvisor = new NutritionAdvisor();
   const recommendations = nutritionAdvisor.calculate(routine, userProfile);
   console.log(`Nutrition advice: ${recommendations}`);
   ```

4. **Add tests**:
   ```typescript
   src/tests/nutrition.test.ts
   ```

### Modifying an Existing Agent

Example: Add "legs" to focus muscles in Agent B

1. Update `config/default.json`:
   ```json
   "focusMuscles": ["arms", "shoulders", "chest", "legs"]
   ```

2. Add leg categorization in `analyzer.ts`:
   ```typescript
   const categories = {
     // ... existing categories
     squats: [] as ExerciseStats[],
     legIsolation: [] as ExerciseStats[],
   };
   ```

3. Update planner to select leg exercises:
   ```typescript
   this.selectExercises(categorized.squats, 1, config, selectedExercises, 'legs');
   ```

4. Add tests for leg exercise selection

---

## Benefits of This Architecture

✅ **Maintainability**: Clear boundaries make changes localized
✅ **Testability**: Each agent can be tested in isolation
✅ **Reusability**: Agents can be used in different contexts
✅ **Clarity**: Code structure mirrors problem domain
✅ **Collaboration**: Different developers can work on different agents
✅ **Evolution**: Easy to add features without breaking existing code

---

## Summary

This multi-agent architecture turns a complex problem (AI fitness planning + API integration) into manageable, specialized components. Each agent is an expert in its domain, and the orchestrator coordinates them to deliver a seamless user experience.

**Agent A** knows APIs. **Agent B** knows fitness. **Agent C** knows integration. **Agent D** knows coordination. **Agent E** knows quality.

Together, they build intelligent training routines. 🤖💪
