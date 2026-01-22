import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Characters } from './pages/Characters';
import { Scenes } from './pages/Scenes';
import { Create } from './pages/Create';
import { Gallery } from './pages/Gallery';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { INITIAL_CHARACTERS, MOCK_SCENES } from './constants';
import { Character, CharacterStatus, Scene } from './types';
import * as api from './services/apiService';

// Convert API types to frontend types
function mapApiCharacter(c: api.Character): Character {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    coverImage: c.coverImageUrl || 'https://picsum.photos/seed/' + c.id + '/300/300',
    status: c.status === 'READY' ? CharacterStatus.READY
      : c.status === 'PREPARING' ? CharacterStatus.PREPARING
        : CharacterStatus.FAILED,
    createdAt: new Date(c.createdAt).getTime(),
  };
}

function mapApiScene(s: api.Scene): Scene {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    thumbnail: s.thumbnailUrl || 'https://picsum.photos/seed/' + s.id + '/400/300',
  };
}

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apiCharacters, apiScenes, apiGenerations] = await Promise.all([
          api.getCharacters(),
          api.getScenes(),
          api.getGenerations(),
        ]);

        setCharacters(apiCharacters.map(mapApiCharacter));
        setScenes(apiScenes.map(mapApiScene));
        setGeneratedImages(
          apiGenerations
            .filter(g => g.imageUrl)
            .map(g => g.imageUrl!)
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to mock data if API fails
        setCharacters(INITIAL_CHARACTERS);
        setScenes(MOCK_SCENES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Theme Management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAddCharacter = (newChar: Character) => {
    setCharacters(prev => [newChar, ...prev]);
  };

  const handleAddScene = (newScene: Scene) => {
    setScenes(prev => [newScene, ...prev]);
  };

  const handleImageGenerated = (url: string) => {
    setGeneratedImages(prev => [url, ...prev]);
  };

  const refreshCharacters = async () => {
    try {
      const apiCharacters = await api.getCharacters();
      setCharacters(apiCharacters.map(mapApiCharacter));
    } catch (error) {
      console.error('Failed to refresh characters:', error);
    }
  };

  const refreshScenes = async () => {
    try {
      const apiScenes = await api.getScenes();
      setScenes(apiScenes.map(mapApiScene));
    } catch (error) {
      console.error('Failed to refresh scenes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <Sidebar theme={theme} toggleTheme={toggleTheme} user={user} onLogout={logout} />
      <main className="flex-1 overflow-x-hidden relative">
        <Routes>
          <Route path="/" element={<Dashboard characters={characters} scenes={scenes} recentImages={generatedImages} />} />
          <Route path="/characters" element={<Characters characters={characters} onAddCharacter={handleAddCharacter} onRefresh={refreshCharacters} />} />
          <Route path="/scenes" element={<Scenes scenes={scenes} onAddScene={handleAddScene} />} />
          <Route path="/create" element={<Create characters={characters} scenes={scenes} onImageGenerated={handleImageGenerated} />} />
          <Route path="/gallery" element={<Gallery images={generatedImages} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<AuthenticatedApp />} />
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;