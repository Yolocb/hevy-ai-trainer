/**
 * AGENT B: Training Logic & Routine Planner
 *
 * Hypertrophy training rules and constraints
 */

export interface HypertrophyRules {
  setsPerExercise: [number, number]; // [min, max]
  repsRange: [number, number]; // [min, max]
  restCompound: number; // seconds
  restIsolation: number; // seconds
  progressiveOverload: number; // percentage increase
}

export interface TrainingConfig {
  targetSessionMinutes: number;
  sessionsPerWeek: number;
  focusMuscles: string[];
  hypertrophy: HypertrophyRules;
  exerciseCount: [number, number];
  historyMonths: number;
}

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  targetSessionMinutes: 60,
  sessionsPerWeek: 3,
  focusMuscles: ['arms', 'shoulders', 'chest'],
  hypertrophy: {
    setsPerExercise: [3, 4],
    repsRange: [6, 12],
    restCompound: 120, // 2 minutes
    restIsolation: 90, // 1.5 minutes
    progressiveOverload: 2.5, // 2.5% increase
  },
  exerciseCount: [6, 8],
  historyMonths: 12,
};

export class HypertrophyRules {
  /**
   * Estimate exercise duration based on sets and rest periods
   */
  static estimateExerciseDuration(
    sets: number,
    isCompound: boolean,
    rules: HypertrophyRules
  ): number {
    const avgSetDuration = 45; // seconds per set (including actual lifting time)
    const restTime = isCompound ? rules.restCompound : rules.restIsolation;

    // Total = (set duration * num sets) + (rest * (num sets - 1))
    return (avgSetDuration * sets) + (restTime * (sets - 1));
  }

  /**
   * Calculate progressive overload target weight
   */
  static calculateTargetWeight(lastWeight: number, rules: HypertrophyRules): number {
    return Math.round((lastWeight * (1 + rules.progressiveOverload / 100)) * 2) / 2; // Round to nearest 0.5kg
  }

  /**
   * Validate if a routine fits within time constraints
   */
  static validateSessionDuration(
    exerciseDurations: number[],
    targetMinutes: number,
    tolerancePercent: number = 15
  ): boolean {
    const totalSeconds = exerciseDurations.reduce((sum, d) => sum + d, 0);
    const totalMinutes = totalSeconds / 60;
    const maxMinutes = targetMinutes * (1 + tolerancePercent / 100);

    return totalMinutes <= maxMinutes;
  }

  /**
   * Check if exercise count is within acceptable range
   */
  static validateExerciseCount(count: number, range: [number, number]): boolean {
    return count >= range[0] && count <= range[1];
  }

  /**
   * Determine if an exercise is compound based on name
   */
  static isCompoundExercise(exerciseName: string): boolean {
    const name = exerciseName.toLowerCase();
    const compoundKeywords = [
      'press',
      'squat',
      'deadlift',
      'row',
      'pull-up',
      'chin-up',
      'dip',
    ];

    return compoundKeywords.some((keyword) => name.includes(keyword));
  }
}
