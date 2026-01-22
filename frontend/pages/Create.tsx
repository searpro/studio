import React, { useState } from 'react';
import { Character, CharacterStatus, GenerationConfig, Scene, GenerationStatus } from '../types';
import { Icons } from '../components/Icons';
import * as api from '../services/apiService';

interface CreateProps {
    characters: Character[];
    scenes: Scene[];
    onImageGenerated: (url: string) => void;
}

export const Create: React.FC<CreateProps> = ({ characters, scenes, onImageGenerated }) => {
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
    const [config, setConfig] = useState<GenerationConfig>({
        style: 'Photorealistic',
        mood: 'Serious',
        shot: 'Portrait',
        customInput: ''
    });

    const [genStatus, setGenStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Map frontend values to API values
    const mapStyle = (style: string): 'photorealistic' | 'cinematic' | 'illustration' | 'anime' => {
        const map: Record<string, 'photorealistic' | 'cinematic' | 'illustration' | 'anime'> = {
            'Photorealistic': 'photorealistic',
            'Cinematic': 'cinematic',
            'Illustration': 'illustration',
            'Anime': 'anime',
        };
        return map[style] || 'photorealistic';
    };

    const mapShot = (shot: string): 'close-up' | 'portrait' | 'full-body' | 'wide-angle' => {
        const map: Record<string, 'close-up' | 'portrait' | 'full-body' | 'wide-angle'> = {
            'Close-up': 'close-up',
            'Portrait': 'portrait',
            'Full body': 'full-body',
            'Wide angle': 'wide-angle',
        };
        return map[shot] || 'portrait';
    };

    const handleGenerate = async () => {
        if (!selectedChar || !selectedScene) return;

        setGenStatus(GenerationStatus.LOADING);
        setResultImage(null);
        setStatusMessage('Creating generation request...');

        try {
            const generation = await api.generateImage(
                {
                    characterId: selectedChar.id,
                    sceneId: selectedScene.id,
                    action: config.customInput || 'standing naturally',
                    style: mapStyle(config.style),
                    mood: config.mood.toLowerCase(),
                    shot: mapShot(config.shot),
                },
                (update) => {
                    // Update status message based on generation status
                    if (update.status === 'PENDING') {
                        setStatusMessage('Queued for processing...');
                    } else if (update.status === 'PROCESSING') {
                        setStatusMessage('Generating image with AI...');
                    }
                }
            );

            if (generation.status === 'COMPLETE' && generation.imageUrl) {
                setResultImage(generation.imageUrl);
                setGenStatus(GenerationStatus.SUCCESS);
                onImageGenerated(generation.imageUrl);
            } else {
                throw new Error('Generation failed');
            }
        } catch (error) {
            console.error(error);
            setGenStatus(GenerationStatus.ERROR);
            setStatusMessage('');
        }
    };

    const isReady = selectedChar && selectedScene;

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">

            {/* LEFT PANEL: Controls */}
            <div className="w-full md:w-[480px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-y-auto custom-scrollbar">
                <div className="p-6 md:p-8 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Icons.Create className="text-indigo-600 dark:text-indigo-500" />
                            Studio
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Assemble your generation.</p>
                    </div>

                    {/* 1. Character Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">1. Character</label>
                            {selectedChar && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedChar.name} Selected</span>}
                        </div>

                        {characters.length === 0 ? (
                            <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-center text-zinc-500 text-sm">
                                No characters ready. Go to Characters tab.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {characters.map(char => (
                                    <button
                                        key={char.id}
                                        disabled={char.status !== CharacterStatus.READY}
                                        onClick={() => setSelectedChar(char)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all text-left bg-zinc-100 dark:bg-zinc-800
                                    ${selectedChar?.id === char.id
                                                ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                                            }
                                    ${char.status !== CharacterStatus.READY ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                    >
                                        <img src={char.coverImage} className="w-full h-full object-cover" alt={char.name} />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                            <span className="text-xs font-bold text-white block truncate">{char.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Scene Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">2. Scene</label>
                            {selectedScene && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedScene.name} Selected</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {scenes.map(scene => (
                                <button
                                    key={scene.id}
                                    onClick={() => setSelectedScene(scene)}
                                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left
                                ${selectedScene?.id === scene.id
                                            ? 'bg-zinc-100 dark:bg-zinc-800 border-indigo-600 dark:border-indigo-500'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <img src={scene.thumbnail} className="w-10 h-10 rounded-md object-cover" alt="" />
                                    <div className="min-w-0">
                                        <span className="block text-sm font-medium text-zinc-900 dark:text-white truncate">{scene.name}</span>
                                        <span className="block text-xs text-zinc-500">{scene.category}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Custom Instruction */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">3. Action & Details</label>
                        <textarea
                            value={config.customInput}
                            onChange={(e) => setConfig({ ...config, customInput: e.target.value })}
                            placeholder="Describe what is happening... e.g. 'Sitting at a desk reading a futuristic map'"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* 4. Controls */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">4. Direction</label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <span className="text-xs text-zinc-500">Style</span>
                                <select
                                    value={config.style}
                                    onChange={(e) => setConfig({ ...config, style: e.target.value as any })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {['Photorealistic', 'Cinematic', 'Illustration', 'Anime'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-xs text-zinc-500">Shot</span>
                                <select
                                    value={config.shot}
                                    onChange={(e) => setConfig({ ...config, shot: e.target.value as any })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {['Close-up', 'Portrait', 'Full body', 'Wide angle'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-xs text-zinc-500">Mood</span>
                            <div className="flex flex-wrap gap-2">
                                {['Happy', 'Serious', 'Dramatic', 'Cyberpunk'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setConfig({ ...config, mood: m as any })}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                    ${config.mood === m
                                                ? 'bg-zinc-200 dark:bg-zinc-100 text-zinc-900 border-zinc-200 dark:border-zinc-100'
                                                : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!isReady || genStatus === GenerationStatus.LOADING}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2
                    ${isReady
                                ? 'bg-indigo-600 hover:bg-indigo-500 translate-y-0'
                                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {genStatus === GenerationStatus.LOADING ? (
                            <>
                                <Icons.Spinner className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Icons.Create size={20} />
                                Generate Image
                            </>
                        )}
                    </button>
                    {genStatus === GenerationStatus.ERROR && (
                        <p className="text-red-500 text-sm text-center">Generation failed. Please try again.</p>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Preview */}
            <div className="flex-1 bg-zinc-100 dark:bg-black flex items-center justify-center p-6 md:p-12 relative transition-colors duration-300">
                {resultImage ? (
                    <div className="relative max-w-2xl w-full aspect-square rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
                        <img src={resultImage} alt="Generated" className="w-full h-full object-contain bg-white dark:bg-zinc-900" />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <a href={resultImage} download={`studio-gen-${Date.now()}.png`} className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2 rounded-lg transition-colors">
                                <Icons.Download size={20} />
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 max-w-sm">
                        <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {genStatus === GenerationStatus.LOADING ? (
                                <Icons.Spinner className="text-indigo-600 dark:text-indigo-500 animate-spin" size={32} />
                            ) : (
                                <Icons.Create className="text-zinc-400 dark:text-zinc-700" size={32} />
                            )}
                        </div>
                        <h2 className="text-zinc-500 dark:text-zinc-500 font-medium">
                            {genStatus === GenerationStatus.LOADING
                                ? (statusMessage || "Assembling your scene...")
                                : "Select a character and scene to start generating."}
                        </h2>
                    </div>
                )}
            </div>

        </div>
    );
};