/**
 * API Service - Client for the Studio API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

// Token storage
let authToken: string | null = localStorage.getItem('authToken');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json();

  if (!json.success || json.error) {
    throw new Error(json.error?.message || 'API request failed');
  }

  return json.data as T;
}

// ============ Auth ============

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  setAuthToken(result.token);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(result.token);
  return result;
}

export function logout() {
  setAuthToken(null);
}

export async function getMe(): Promise<User> {
  return apiRequest<User>('/api/auth/me');
}

// ============ Characters ============

export interface Character {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  status: 'PREPARING' | 'READY' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export async function getCharacters(): Promise<Character[]> {
  return apiRequest<Character[]>('/api/characters');
}

export async function getCharacter(id: string): Promise<Character> {
  return apiRequest<Character>(`/api/characters/${id}`);
}

export async function createCharacter(data: {
  name: string;
  description: string;
}): Promise<Character> {
  return apiRequest<Character>('/api/characters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCharacter(
  id: string,
  data: { name?: string; description?: string }
): Promise<Character> {
  return apiRequest<Character>(`/api/characters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  await apiRequest<void>(`/api/characters/${id}`, {
    method: 'DELETE',
  });
}

// ============ Scenes ============

export interface Scene {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  isSystem: boolean;
  createdAt: string;
}

export async function getScenes(): Promise<Scene[]> {
  return apiRequest<Scene[]>('/api/scenes');
}

export async function getScene(id: string): Promise<Scene> {
  return apiRequest<Scene>(`/api/scenes/${id}`);
}

export async function createScene(data: {
  name: string;
  description: string;
  category: string;
}): Promise<Scene> {
  return apiRequest<Scene>('/api/scenes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ Generations ============

export interface Generation {
  id: string;
  characterId: string;
  sceneId: string;
  action: string;
  style: 'photorealistic' | 'cinematic' | 'illustration' | 'anime';
  mood: string;
  shot: 'close-up' | 'portrait' | 'full-body' | 'wide-angle';
  promptText: string;
  imageUrl: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  createdAt: string;
  character?: Character;
  scene?: Scene;
}

export async function getGenerations(): Promise<Generation[]> {
  return apiRequest<Generation[]>('/api/generations');
}

export async function getGeneration(id: string): Promise<Generation> {
  return apiRequest<Generation>(`/api/generations/${id}`);
}

export interface CreateGenerationParams {
  characterId: string;
  sceneId: string;
  action: string;
  style: 'photorealistic' | 'cinematic' | 'illustration' | 'anime';
  mood: string;
  shot: 'close-up' | 'portrait' | 'full-body' | 'wide-angle';
}

export async function createGeneration(data: CreateGenerationParams): Promise<Generation> {
  return apiRequest<Generation>('/api/generations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteGeneration(id: string): Promise<void> {
  await apiRequest<void>(`/api/generations/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Poll for generation completion
 */
export async function pollGeneration(
  id: string,
  onUpdate?: (generation: Generation) => void,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<Generation> {
  for (let i = 0; i < maxAttempts; i++) {
    const generation = await getGeneration(id);
    
    if (onUpdate) {
      onUpdate(generation);
    }

    if (generation.status === 'COMPLETE' || generation.status === 'FAILED') {
      return generation;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Generation timed out');
}

/**
 * Create generation and poll until complete
 */
export async function generateImage(
  params: CreateGenerationParams,
  onUpdate?: (generation: Generation) => void
): Promise<Generation> {
  const generation = await createGeneration(params);
  
  if (onUpdate) {
    onUpdate(generation);
  }

  return pollGeneration(generation.id, onUpdate);
}
