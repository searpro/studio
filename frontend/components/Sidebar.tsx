import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icons } from './Icons';

interface User {
  id: string;
  email: string;
  name: string;
}

interface SidebarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ theme, toggleTheme, user, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Icons.Dashboard },
    { name: 'Create', path: '/create', icon: Icons.Create },
    { name: 'Characters', path: '/characters', icon: Icons.Characters },
    { name: 'Scenes', path: '/scenes', icon: Icons.Scenes },
    { name: 'Gallery', path: '/gallery', icon: Icons.Gallery },
  ];

  const bottomItems = [
    { name: 'Billing', path: '/billing', icon: Icons.CreditCard },
    { name: 'Settings', path: '/settings', icon: Icons.Settings },
  ];

  return (
    <aside className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 flex md:flex-col z-50 transition-colors duration-300">
      <div className="hidden md:flex items-center gap-3 px-6 py-8">
        <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
          <span className="font-bold text-white text-lg">S</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Studio</span>
      </div>

      <nav className="flex-1 flex md:flex-col justify-around md:justify-start md:px-4 md:gap-2 overflow-x-auto md:overflow-visible">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="hidden md:inline">{item.name}</span>
          </NavLink>
        ))}

        <div className="hidden md:block my-2 border-t border-zinc-100 dark:border-zinc-800"></div>

        <div className="hidden md:block">
          <span className="px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">Account</span>
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="hidden md:flex flex-col gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all duration-200 w-full"
        >
          {theme === 'dark' ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
          >
            <Icons.Settings size={20} />
            <span>Sign Out</span>
          </button>
        )}

        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-white">{user?.name || 'Creator'}</span>
            <span className="text-xs text-zinc-500">{user?.email || 'Pro Plan'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};