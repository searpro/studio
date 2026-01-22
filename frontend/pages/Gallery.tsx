import React from 'react';
import { Icons } from '../components/Icons';

interface GalleryProps {
  images: string[];
}

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Gallery</h1>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Icons.History size={16} />
            {images.length} Generations
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
            <Icons.Gallery className="text-zinc-400 dark:text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500">Your creative library is empty.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((src, idx) => (
                <div key={idx} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                    <img src={src} alt={`Gen ${idx}`} className="w-full h-auto block hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <a href={src} download={`studio-${idx}.png`} className="p-3 bg-white rounded-full text-black hover:bg-zinc-200">
                            <Icons.Download size={20} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};