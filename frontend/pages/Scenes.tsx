import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Scene } from '../types';

interface ScenesProps {
  scenes: Scene[];
  onAddScene: (scene: Scene) => void;
}

export const Scenes: React.FC<ScenesProps> = ({ scenes, onAddScene }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneCategory, setNewSceneCategory] = useState('Indoor');
  const [newSceneDescription, setNewSceneDescription] = useState('');
  
  const categories = ['Indoor', 'Outdoor', 'Fantasy', 'Sci-Fi', 'Urban', 'Nature'];

  const handleCreateScene = () => {
    if (!newSceneName || !newSceneDescription) return;

    const newScene: Scene = {
        id: `s-${Date.now()}`,
        name: newSceneName,
        category: newSceneCategory,
        description: newSceneDescription,
        thumbnail: `https://picsum.photos/seed/${newSceneName.replace(/\s/g, '')}/400/300` // Mock thumbnail
    };

    onAddScene(newScene);
    setIsModalOpen(false);
    setNewSceneName('');
    setNewSceneDescription('');
    setNewSceneCategory('Indoor');
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Scenes</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Curated environments for your stories.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-500/10"
        >
            <Icons.Plus size={18} />
            <span>New Scene</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene) => (
            <div key={scene.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm cursor-default">
                <div className="h-48 overflow-hidden relative">
                    <img src={scene.thumbnail} alt={scene.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 shadow-sm">
                        {scene.category}
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{scene.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">{scene.description}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsModalOpen(false)}
        >
            <div 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 z-50"
                >
                    <Icons.X size={20} />
                </button>
                
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Create Scene</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Define a reusable environment.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Scene Name</label>
                        <input 
                            type="text" 
                            value={newSceneName}
                            onChange={(e) => setNewSceneName(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Cyberpunk Alley"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Category</label>
                        <select
                            value={newSceneCategory}
                            onChange={(e) => setNewSceneCategory(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Visual Description</label>
                        <textarea
                            value={newSceneDescription}
                            onChange={(e) => setNewSceneDescription(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none h-24"
                            placeholder="Describe the environment in detail for the AI..."
                        />
                    </div>

                    <button 
                        onClick={handleCreateScene}
                        disabled={!newSceneName || !newSceneDescription}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Scene
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};