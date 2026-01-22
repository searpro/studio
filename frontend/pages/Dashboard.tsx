import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Character, Scene } from '../types';

interface DashboardProps {
  characters: Character[];
  scenes: Scene[];
  recentImages: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ characters, scenes, recentImages }) => {
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Welcome Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back, Creator.</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl">
          Your studio is ready. Build new assets or jump straight into creation.
        </p>
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
              <Icons.Characters className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{characters.length}</span>
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-200">Active Characters</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">Ready for generation</p>
          </div>
        </div>

        {/* Stats Card 2 - Scenes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
              <Icons.Scenes className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{scenes.length}</span>
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-200">Available Scenes</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">Curated environments</p>
          </div>
        </div>

        {/* Create Action */}
        <Link to="/create" className="group bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden transition-transform hover:scale-[1.02] shadow-lg shadow-indigo-500/20">
           <div className="absolute top-0 right-0 p-8 opacity-10">
                <Icons.Create size={100} color="white" />
           </div>
           <div className="flex justify-between items-start z-10">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icons.Create className="text-white" size={24} />
            </div>
          </div>
          <div className="z-10">
            <h3 className="font-bold text-white text-lg">Create New Image</h3>
            <p className="text-sm text-indigo-100">Assemble a new scene</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Recent Generations</h2>
            <Link to="/gallery" className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">View All</Link>
        </div>
        
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentImages.slice(0, 4).map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 dark:bg-zinc-900">
                <img src={src} alt="Recent" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
            No images generated yet.
          </div>
        )}
      </div>
    </div>
  );
};