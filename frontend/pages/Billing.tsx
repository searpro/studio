import React from 'react';
import { Icons } from '../components/Icons';

export const Billing: React.FC = () => {
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 pb-24">
       <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Icons.CreditCard className="text-zinc-900 dark:text-white" size={24} />
        </div>
        <div>
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Billing & Plans</h1>
           <p className="text-zinc-500 dark:text-zinc-400">Manage your subscription and usage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10">
                <Icons.Zap size={140} />
            </div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    Current Plan
                </div>
                <h2 className="text-4xl font-bold mb-2">Studio Pro</h2>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-indigo-200">/month</span>
                </div>
                
                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-indigo-100">
                        <Icons.CheckMark size={16} />
                        <span>Unlimited Character Assets</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100">
                        <Icons.CheckMark size={16} />
                        <span>4K Ultra-Res Exports</span>
                    </div>
                     <div className="flex items-center gap-2 text-indigo-100">
                        <Icons.CheckMark size={16} />
                        <span>Priority Generation Queue</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                        Manage Subscription
                    </button>
                </div>
            </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-center space-y-6">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Icons.History size={18} className="text-zinc-400" />
                Monthly Usage
            </h3>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Fast Generations</span>
                    <span className="font-medium text-zinc-900 dark:text-white">450 / 1000</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[45%]" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Storage</span>
                    <span className="font-medium text-zinc-900 dark:text-white">12.5GB / 50GB</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[25%]" />
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Cycle resets on Oct 1, 2023</p>
            </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white">Invoice History</h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {[
                { date: 'Sep 01, 2023', amount: '$29.00', status: 'Paid', id: 'INV-2023-009' },
                { date: 'Aug 01, 2023', amount: '$29.00', status: 'Paid', id: 'INV-2023-008' },
                { date: 'Jul 01, 2023', amount: '$29.00', status: 'Paid', id: 'INV-2023-007' },
            ].map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                            <Icons.FileText size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white">{inv.date}</p>
                            <p className="text-xs text-zinc-500">{inv.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="font-medium text-zinc-900 dark:text-white">{inv.amount}</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">
                            {inv.status}
                        </span>
                        <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                            <Icons.Download size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};