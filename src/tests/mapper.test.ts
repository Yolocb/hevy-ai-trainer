/**
 * AGENT E: Testing & Refactoring Agent
 *
 * Tests for routine mapper (Agent C)
 */

import { RoutineMapper } from '../agents/hevy-integration/mapper';
import { PlannedRoutine } from '../agents/training-planner/planner';

describe('Agent C: Routine Mapper', () => {
  const mapper = new RoutineMapper();

  it('should map planned routine to Hevy payload', () => {
    const plannedRoutine: PlannedRoutine = {
      title: 'AI Routine 2026-02-11',
      totalEstimatedMinutes: 60,
      notes: 'Test routine',
      exercises: [
        {
          exerciseTemplateId: 'bench_press',
          exerciseName: 'Bench Press',
          isCompound: true,
          estimatedDurationSeconds: 600,
          sets: [
            { type: 'normal', reps: 8, targetWeight: 100, restSeconds: 120 },
            { type: 'normal', reps: 8, targetWeight: 100, restSeconds: 120 },
            { type: 'normal', reps: 8, targetWeight: 100, restSeconds: 120 },
          ],
        },
      ],
    };

    const payload = mapper.mapToHevyPayload(plannedRoutine);

    expect(payload.title).toBe('AI Routine 2026-02-11');
    expect(payload.notes).toBe('Test routine');
    expect(payload.exercises.length).toBe(1);
    expect(payload.exercises[0].exercise_template_id).toBe('bench_press');
    expect(payload.exercises[0].sets.length).toBe(3);
    expect(payload.exercises[0].sets[0].weight_kg).toBe(100);
    expect(payload.exercises[0].sets[0].reps).toBe(8);
  });

  it('should validate payload structure', () => {
    const validPayload = {
      title: 'Test Routine',
      notes: 'Notes',
      folder_id: null,
      exercises: [
        {
          exercise_template_id: 'test_ex',
          superset_id: null,
          notes: '',
          sets: [{ type: 'normal' as const, reps: 10, weight_kg: 50, distance_meters: null, duration_seconds: null, rpe: null }],
        },
      ],
    };

    expect(() => mapper.validatePayload(validPayload)).not.toThrow();
  });

  it('should throw error for invalid payload', () => {
    const invalidPayload = {
      title: '',
      notes: '',
      folder_id: null,
      exercises: [],
    };

    expect(() => mapper.validatePayload(invalidPayload)).toThrow();
  });

  it('should require exercise_template_id', () => {
    const invalidPayload = {
      title: 'Test',
      notes: '',
      folder_id: null,
      exercises: [
        {
          exercise_template_id: '',
          superset_id: null,
          notes: '',
          sets: [{ type: 'normal' as const, reps: 10, weight_kg: 50, distance_meters: null, duration_seconds: null, rpe: null }],
        },
      ],
    };

    expect(() => mapper.validatePayload(invalidPayload)).toThrow();
  });
});
