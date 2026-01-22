/**
 * Shared types across frontend and API
 */

export enum CharacterStatus {
  PREPARING = 'PREPARING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export enum SceneCategory {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
  FANTASY = 'FANTASY',
  SCIFI = 'SCIFI',
  URBAN = 'URBAN',
  NATURE = 'NATURE',
}

export enum GenerationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

export enum JobType {
  GENERATE_IMAGE = 'GENERATE_IMAGE',
  TRAIN_CHARACTER = 'TRAIN_CHARACTER',
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

// Domain Models
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  status: CharacterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  category: SceneCategory;
  thumbnailUrl: string | null;
  isSystem: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  userId: string;
  characterId: string;
  sceneId: string;
  promptText: string;
  style: string;
  mood: string;
  shot: string;
  action: string;
  imageUrl: string | null;
  status: GenerationStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  generationId: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  coverImageUrl?: string;
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  coverImageUrl?: string;
}

export interface CreateSceneRequest {
  name: string;
  description: string;
  category: SceneCategory;
  thumbnailUrl?: string;
}

export interface CreateGenerationRequest {
  characterId: string;
  sceneId: string;
  action: string;
  style: 'photorealistic' | 'cinematic' | 'illustration' | 'anime';
  mood: string;
  shot: 'close-up' | 'portrait' | 'full-body' | 'wide-angle';
}

export interface GenerationWithRelations extends Generation {
  character: Pick<Character, 'id' | 'name' | 'coverImageUrl'>;
  scene: Pick<Scene, 'id' | 'name' | 'thumbnailUrl'>;
}

// Queue Job Payloads
export interface GenerationJobPayload {
  generationId: string;
  character: {
    id: string;
    name: string;
    description: string;
  };
  scene: {
    id: string;
    name: string;
    description: string;
  };
  controls: {
    action: string;
    style: 'photorealistic' | 'cinematic' | 'illustration' | 'anime';
    mood: string;
    shot: 'close-up' | 'portrait' | 'full-body' | 'wide-angle';
  };
}

export interface JobCallbackPayload {
  jobId: string;
  status: 'success' | 'failed';
  imageUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}
