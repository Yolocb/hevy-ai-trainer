/**
 * AGENT A: Hevy API Architect
 *
 * HTTP client for Hevy API with authentication, pagination, and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  HevyConfig,
  Workout,
  ExerciseTemplate,
  RoutineFolder,
  Routine,
  CreateRoutineRequest,
  CreateRoutineFolderRequest,
  PaginatedResponse,
  ApiError,
} from './models';

export class HevyApiClient {
  private client: AxiosInstance;
  private config: HevyConfig;

  constructor(config: HevyConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError): never {
    const apiError: ApiError = {
      message: error.message,
      status: error.response?.status || 500,
      code: error.code,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      apiError.message = data.message || data.error || apiError.message;
    }

    console.error(`[Hevy API Error] ${apiError.status}: ${apiError.message}`);
    throw apiError;
  }

  /**
   * Fetch workouts with pagination support
   * @param startDate ISO date string (e.g., "2025-02-11")
   * @param endDate ISO date string
   * @param page Page number (default: 1)
   */
  async getWorkouts(
    startDate?: string,
    endDate?: string,
    page: number = 1
  ): Promise<PaginatedResponse<Workout>> {
    const params: any = { page };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await this.client.get<PaginatedResponse<Workout>>('/workouts', {
      params,
    });

    return response.data;
  }

  /**
   * Fetch all workouts for a date range (handles pagination automatically)
   */
  async getAllWorkouts(startDate?: string, endDate?: string): Promise<Workout[]> {
    const allWorkouts: Workout[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getWorkouts(startDate, endDate, page);
      const workouts = response.workouts || [];
      allWorkouts.push(...workouts);

      hasMore = page < response.page_count;
      page++;

      // Safety: prevent infinite loops
      if (page > 100) {
        console.warn('[Hevy API] Stopped pagination at page 100');
        break;
      }
    }

    return allWorkouts;
  }

  /**
   * Fetch exercise templates (all available exercises)
   */
  async getExerciseTemplates(page: number = 1): Promise<PaginatedResponse<ExerciseTemplate>> {
    const response = await this.client.get<PaginatedResponse<ExerciseTemplate>>(
      '/exercise_templates',
      { params: { page } }
    );
    return response.data;
  }

  /**
   * Fetch all exercise templates (handles pagination)
   */
  async getAllExerciseTemplates(): Promise<ExerciseTemplate[]> {
    const allTemplates: ExerciseTemplate[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getExerciseTemplates(page);
      const templates = response.exercise_templates || [];
      allTemplates.push(...templates);

      hasMore = page < response.page_count;
      page++;

      if (page > 50) {
        console.warn('[Hevy API] Stopped exercise template pagination at page 50');
        break;
      }
    }

    return allTemplates;
  }

  /**
   * Fetch routine folders
   */
  async getRoutineFolders(page: number = 1): Promise<PaginatedResponse<RoutineFolder>> {
    const response = await this.client.get<PaginatedResponse<RoutineFolder>>(
      '/routine_folders',
      { params: { page } }
    );
    return response.data;
  }

  /**
   * Fetch all routine folders
   */
  async getAllRoutineFolders(): Promise<RoutineFolder[]> {
    const allFolders: RoutineFolder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getRoutineFolders(page);
      const folders = response.routine_folders || [];
      allFolders.push(...folders);

      hasMore = page < response.page_count;
      page++;

      if (page > 20) break;
    }

    return allFolders;
  }

  /**
   * Create a new routine folder
   */
  async createRoutineFolder(request: CreateRoutineFolderRequest): Promise<RoutineFolder> {
    const response = await this.client.post<RoutineFolder>('/routine_folders', request);
    return response.data;
  }

  /**
   * Create a new routine
   */
  async createRoutine(request: CreateRoutineRequest): Promise<Routine> {
    const response = await this.client.post<any>('/routines', { routine: request });
    const routine = Array.isArray(response.data.routine) ? response.data.routine[0] : (response.data.routine || response.data);
    console.log(`[Hevy API] Created routine: ${routine.title} (ID: ${routine.id})`);
    return routine;
  }

  /**
   * Find or create a routine folder by name
   */
  async ensureRoutineFolder(folderName: string): Promise<RoutineFolder> {
    const folders = await this.getAllRoutineFolders();
    const existing = folders.find((f) => f.title === folderName);

    if (existing) {
      console.log(`[Hevy API] Using existing folder: ${folderName} (ID: ${existing.id})`);
      return existing;
    }

    console.log(`[Hevy API] Creating new folder: ${folderName}`);
    return await this.createRoutineFolder({ title: folderName });
  }
}
