import { Character, CharacterStatus, Scene } from './types';

export const MOCK_SCENES: Scene[] = [
  {
    id: 's1',
    name: 'Modern Loft',
    category: 'Indoor',
    description: 'a spacious modern loft apartment with large windows, natural light, and minimalist furniture',
    thumbnail: 'https://picsum.photos/seed/loft/400/300'
  },
  {
    id: 's2',
    name: 'Neon Street',
    category: 'Cyberpunk',
    description: 'a rainy futuristic street at night with neon signs, wet pavement, and cyberpunk aesthetics',
    thumbnail: 'https://picsum.photos/seed/neon/400/300'
  },
  {
    id: 's3',
    name: 'Podcast Studio',
    category: 'Indoor',
    description: 'a professional podcast recording studio with acoustic foam, microphones, and warm lighting',
    thumbnail: 'https://picsum.photos/seed/podcast/400/300'
  },
  {
    id: 's4',
    name: 'Golden Hour Beach',
    category: 'Outdoor',
    description: 'a serene beach during golden hour with soft waves and warm sunlight',
    thumbnail: 'https://picsum.photos/seed/beach/400/300'
  },
  {
    id: 's5',
    name: 'Corporate Office',
    category: 'Indoor',
    description: 'a sleek high-rise corporate office with glass walls and city views',
    thumbnail: 'https://picsum.photos/seed/office/400/300'
  },
  {
    id: 's6',
    name: 'Enchanted Forest',
    category: 'Fantasy',
    description: 'a mystical forest with ancient trees, glowing moss, and magical atmosphere',
    thumbnail: 'https://picsum.photos/seed/forest/400/300'
  }
];

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Aria',
    status: CharacterStatus.READY,
    createdAt: Date.now() - 10000000,
    coverImage: 'https://picsum.photos/seed/aria/300/300',
    description: 'a young woman with silver hair, blue eyes, wearing a futuristic jacket'
  },
  {
    id: 'c2',
    name: 'Marcus',
    status: CharacterStatus.READY,
    createdAt: Date.now() - 5000000,
    coverImage: 'https://picsum.photos/seed/marcus/300/300',
    description: 'a bearded man in his 30s with glasses, wearing a casual flannel shirt'
  }
];
