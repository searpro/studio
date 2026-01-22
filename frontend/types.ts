export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum CharacterStatus {
  PREPARING = 'PREPARING',
  READY = 'READY'
}

export interface Character {
  id: string;
  name: string;
  coverImage: string;
  status: CharacterStatus;
  createdAt: number;
  description: string; // Used internally for the prompt to simulate consistency
}

export interface Scene {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
}

export interface GenerationConfig {
  style: 'Photorealistic' | 'Cinematic' | 'Illustration' | 'Anime';
  mood: 'Happy' | 'Serious' | 'Dramatic' | 'Cyberpunk' | 'Ethereal';
  shot: 'Close-up' | 'Portrait' | 'Full body' | 'Wide angle';
  customInput?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  characterId: string;
  sceneId: string;
  config: GenerationConfig;
  timestamp: number;
}