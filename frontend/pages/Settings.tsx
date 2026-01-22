import React, { useState } from 'react';
import { Icons } from '../components/Icons';

export const Settings: React.FC = () => {
    const [name, setName] = useState('Creator');
    const [email, setEmail] = useState('creator@studio.ai');
    const [notifications, setNotifications] = useState({
        email: true,
        browser: false,
        marketing: false
    });

    const toggleNotify = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 pb-24">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <Icons.Settings className="text-zinc-900 dark:text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your account preferences.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Icons.CheckMark className="text-indigo-500" size={20} />
                        Profile
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Icons.Bell className="text-indigo-500" size={20} />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-white">Email Notifications</p>
                                <p className="text-sm text-zinc-500">Receive updates about your generations.</p>
                            </div>
                            <button
                                onClick={() => toggleNotify('email')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800"></div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-white">Browser Push Notifications</p>
                                <p className="text-sm text-zinc-500">Get notified when a character is ready.</p>
                            </div>
                            <button
                                onClick={() => toggleNotify('browser')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.browser ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.browser ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="border-t border-zinc-100 dark:border-zinc-800"></div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-white">Product Updates</p>
                                <p className="text-sm text-zinc-500">News about new features and styles.</p>
                            </div>
                            <button
                                onClick={() => toggleNotify('marketing')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.marketing ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Icons.Shield className="text-indigo-500" size={20} />
                        Security
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white">API Key</p>
                            <p className="text-sm text-zinc-500">Managed via Environment Variables.</p>
                        </div>
                        <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono text-zinc-500">
                            sk-••••••••••••
                        </div>
                    </div>
                    <div className="border-t border-zinc-100 dark:border-zinc-800"></div>
                    <button className="text-red-500 text-sm font-medium hover:text-red-600">Delete Account</button>
                </div>
            </div>
        </div>
    );
};