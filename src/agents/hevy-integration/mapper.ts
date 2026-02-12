/**
 * AGENT C: Routine Payload & Hevy Integration Agent
 *
 * Maps planned routines to Hevy API payloads
 */

import { CreateRoutineRequest, RoutineExercise, RoutineSet } from '../hevy-api-architect/models';
import { PlannedRoutine, PlannedExercise } from '../training-planner/planner';

export class RoutineMapper {
  /**
   * Convert planned routine to Hevy API create routine request
   */
  mapToHevyPayload(
    plannedRoutine: PlannedRoutine,
    folderId?: string | null
  ): CreateRoutineRequest {
    const exercises: RoutineExercise[] = plannedRoutine.exercises.map((ex) =>
      this.mapExercise(ex)
    );

    return {
      title: plannedRoutine.title,
      folder_id: folderId || null,
      notes: plannedRoutine.notes,
      exercises,
    };
  }

  /**
   * Map a planned exercise to Hevy routine exercise format
   */
  private mapExercise(exercise: PlannedExercise): RoutineExercise {
    const sets: RoutineSet[] = exercise.sets.map((set) => ({
      type: set.type,
      reps: set.reps,
      weight_kg: set.targetWeight || null,
      distance_meters: null,
      duration_seconds: null,
    }));

    return {
      exercise_template_id: exercise.exerciseTemplateId,
      superset_id: null,
      notes: exercise.notes || '',
      sets,
    };
  }

  /**
   * Validate that the payload is correctly structured
   */
  validatePayload(payload: CreateRoutineRequest): boolean {
    if (!payload.title || payload.title.trim().length === 0) {
      throw new Error('Routine title is required');
    }

    if (!payload.exercises || payload.exercises.length === 0) {
      throw new Error('Routine must have at least one exercise');
    }

    for (const exercise of payload.exercises) {
      if (!exercise.exercise_template_id) {
        throw new Error('Each exercise must have an exercise_template_id');
      }

      if (!exercise.sets || exercise.sets.length === 0) {
        throw new Error('Each exercise must have at least one set');
      }
    }

    return true;
  }
}
