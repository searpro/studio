import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Character, CharacterStatus } from '../types';
import * as api from '../services/apiService';

interface CharactersProps {
    characters: Character[];
    onAddCharacter: (c: Character) => void;
    onRefresh?: () => void;
}

export const Characters: React.FC<CharactersProps> = ({ characters, onAddCharacter, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCharName, setNewCharName] = useState('');
    const [newCharDescription, setNewCharDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateCharacter = async () => {
        if (!newCharName) return;

        setUploading(true);
        setError('');

        try {
            const created = await api.createCharacter({
                name: newCharName,
                description: newCharDescription || `A distinct character named ${newCharName} with unique visual traits.`,
            });

            // Map to frontend type
            const newChar: Character = {
                id: created.id,
                name: created.name,
                status: created.status === 'READY' ? CharacterStatus.READY
                    : created.status === 'PREPARING' ? CharacterStatus.PREPARING
                        : CharacterStatus.FAILED,
                createdAt: new Date(created.createdAt).getTime(),
                coverImage: created.coverImageUrl || 'https://picsum.photos/seed/' + created.id + '/300/300',
                description: created.description,
            };

            onAddCharacter(newChar);
            setIsModalOpen(false);
            setNewCharName('');
            setNewCharDescription('');

            // Refresh after a delay to get updated status
            if (onRefresh) {
                setTimeout(onRefresh, 2000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create character');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Characters</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your visual identities.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-500/10"
                >
                    <Icons.Plus size={18} />
                    <span>New Character</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {characters.map((char) => (
                    <div key={char.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
                        <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 relative">
                            <img src={char.coverImage} alt={char.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            {char.status === CharacterStatus.PREPARING && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <Icons.Spinner className="text-indigo-600 dark:text-indigo-500 animate-spin mb-2" />
                                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Preparing...</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-zinc-900 dark:text-white">{char.name}</h3>
                                {char.status === CharacterStatus.READY && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Created {new Date(char.createdAt).toLocaleDateString()}</p>
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

                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Create Character</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Upload photos to define a consistent visual identity.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Character Name</label>
                                <input
                                    type="text"
                                    value={newCharName}
                                    onChange={(e) => setNewCharName(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Neo"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">Description</label>
                                <textarea
                                    value={newCharDescription}
                                    onChange={(e) => setNewCharDescription(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors min-h-[80px] resize-none"
                                    placeholder="Describe the character's appearance... e.g. 'A young woman with silver hair, blue eyes, wearing a futuristic jacket'"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleCreateCharacter}
                                disabled={!newCharName || uploading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Icons.Spinner className="animate-spin" size={18} />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    "Create Character"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};