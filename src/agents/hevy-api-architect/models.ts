/**
 * AGENT A: Hevy API Architect
 *
 * Data models based on Hevy API specification
 * References:
 * - Official Hevy API docs
 * - Hevy MCP server implementations
 */

// ============= Core Models =============

export interface HevyConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

export interface ExerciseTemplate {
  id: string;
  title: string;
  type: 'weight_reps' | 'time' | 'distance_duration' | 'weighted_bodyweight' | 'reps_only';
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
  equipment: string;
  is_custom: boolean;
}

export interface WorkoutExercise {
  index: number;
  title: string;
  exercise_template_id: string;
  superset_id?: string | null;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  index: number;
  type: 'normal' | 'warmup' | 'failure' | 'dropset';
  weight_kg?: number | null;
  reps?: number | null;
  distance_meters?: number | null;
  duration_seconds?: number | null;
  rpe?: number | null;
  custom_metric?: any | null;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  exercises: WorkoutExercise[];
}

export interface RoutineFolder {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  exercise_template_id: string;
  superset_id?: string | null;
  notes?: string;
  sets: RoutineSet[];
}

export interface RoutineSet {
  type: 'normal' | 'warmup' | 'failure' | 'dropset';
  weight_kg?: number | null;
  reps?: number | null;
  distance_meters?: number | null;
  duration_seconds?: number | null;
}

export interface Routine {
  id: string;
  title: string;
  folder_id?: string | null;
  notes?: string;
  exercises: RoutineExercise[];
  created_at: string;
  updated_at: string;
}

// ============= API Response Types =============

export interface PaginatedResponse<T> {
  page: number;
  page_count: number;
  workouts?: T[];
  routines?: T[];
  exercise_templates?: T[];
  routine_folders?: T[];
}

export interface CreateRoutineRequest {
  title: string;
  folder_id?: string | null;
  notes?: string;
  exercises: RoutineExercise[];
}

export interface CreateRoutineFolderRequest {
  title: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
