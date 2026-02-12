/**
 * AGENT E: Testing & Refactoring Agent
 *
 * Tests for training planner logic
 */

import { WorkoutAnalyzer } from '../agents/training-planner/analyzer';
import { RoutinePlanner } from '../agents/training-planner/planner';
import { DEFAULT_TRAINING_CONFIG } from '../agents/training-planner/rules';
import { Workout, ExerciseTemplate } from '../agents/hevy-api-architect/models';

describe('Agent B: Training Planner', () => {
  describe('WorkoutAnalyzer', () => {
    const analyzer = new WorkoutAnalyzer();

    it('should build exercise stats from workouts', () => {
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          title: 'Chest Day',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-01T11:00:00Z',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
          exercises: [
            {
              id: 'ex1',
              exercise_template_id: 'bench_press',
              sets: [
                { id: 's1', set_number: 1, set_type: 'normal', weight_kg: 100, reps: 8 },
                { id: 's2', set_number: 2, set_type: 'normal', weight_kg: 100, reps: 8 },
              ],
            },
          ],
        },
      ];

      const mockTemplates: ExerciseTemplate[] = [
        {
          id: '1',
          title: 'Bench Press',
          exercise_template_id: 'bench_press',
          muscle_group: 'Chest',
          other_muscles: ['Triceps', 'Shoulders'],
          type: 'weight_reps',
          is_custom: false,
        },
      ];

      const stats = analyzer.buildExerciseStats(mockWorkouts, mockTemplates);

      expect(stats.size).toBe(1);
      expect(stats.get('bench_press')?.totalSets).toBe(2);
      expect(stats.get('bench_press')?.totalVolume).toBe(1600); // 100kg * 8 reps * 2 sets
    });

    it('should filter exercises for arms, shoulders, chest', () => {
      const mockStats = new Map([
        [
          'bench_press',
          {
            exerciseTemplateId: 'bench_press',
            exerciseName: 'Bench Press',
            totalSets: 10,
            totalVolume: 8000,
            frequency: 5,
            muscleGroup: 'Chest',
            otherMuscles: [],
          },
        ],
        [
          'squat',
          {
            exerciseTemplateId: 'squat',
            exerciseName: 'Squat',
            totalSets: 10,
            totalVolume: 10000,
            frequency: 5,
            muscleGroup: 'Legs',
            otherMuscles: [],
          },
        ],
      ]);

      const filtered = analyzer.filterArmsShouldersChest(mockStats, ['chest']);

      expect(filtered.length).toBe(1);
      expect(filtered[0].exerciseName).toBe('Bench Press');
    });
  });

  describe('RoutinePlanner', () => {
    const planner = new RoutinePlanner();

    it('should generate routine within time constraints', () => {
      const mockCategories = {
        chestCompound: [
          {
            exerciseTemplateId: 'bench_press',
            exerciseName: 'Bench Press',
            totalSets: 20,
            totalVolume: 10000,
            frequency: 10,
            topSet: { weight: 100, reps: 8, date: new Date() },
          },
        ],
        shoulderCompound: [
          {
            exerciseTemplateId: 'overhead_press',
            exerciseName: 'Overhead Press',
            totalSets: 15,
            totalVolume: 6000,
            frequency: 8,
            topSet: { weight: 60, reps: 8, date: new Date() },
          },
        ],
        chestIsolation: [],
        shoulderIsolation: [],
        triceps: [],
        biceps: [],
        other: [],
      };

      const routine = planner.planTodayRoutine(mockCategories, DEFAULT_TRAINING_CONFIG);

      expect(routine.exercises.length).toBeGreaterThan(0);
      expect(routine.totalEstimatedMinutes).toBeLessThanOrEqual(75); // 60 min + 25% tolerance
      expect(routine.title).toContain('AI Routine');
      expect(routine.title).toMatch(/\d{4}-\d{2}-\d{2}/); // Date format
    });

    it('should apply hypertrophy rep ranges', () => {
      const mockCategories = {
        chestCompound: [
          {
            exerciseTemplateId: 'bench_press',
            exerciseName: 'Bench Press',
            totalSets: 20,
            totalVolume: 10000,
            frequency: 10,
            topSet: { weight: 100, reps: 8, date: new Date() },
          },
        ],
        shoulderCompound: [],
        chestIsolation: [],
        shoulderIsolation: [],
        triceps: [],
        biceps: [],
        other: [],
      };

      const routine = planner.planTodayRoutine(mockCategories, DEFAULT_TRAINING_CONFIG);
      const exercise = routine.exercises[0];

      expect(exercise.sets.length).toBeGreaterThanOrEqual(3);
      expect(exercise.sets.length).toBeLessThanOrEqual(4);

      exercise.sets.forEach((set) => {
        expect(set.reps).toBeGreaterThanOrEqual(6);
        expect(set.reps).toBeLessThanOrEqual(12);
      });
    });
  });
});
