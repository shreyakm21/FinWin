//app\analytics\page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type AnalyticsTile = {
  title: string;
  description: string;
  emoji: string;
  route: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
};

const ANALYTICS_TILES: AnalyticsTile[] = [
  {
    title: 'Overview',
    description: 'Quick snapshot of income, spending, and balance',
    emoji: '📊',
    route: '/analytics/overview',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-600/20',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Spending',
    description: 'Where your money goes and top expense categories',
    emoji: '💸',
    route: '/analytics/spending',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-600/20',
    borderColor: 'border-red-500/30',
  },
  {
    title: 'Income & Cashflow',
    description: 'Money coming in and net cash movement',
    emoji: '💰',
    route: '/analytics/income',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-600/20',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'Trends',
    description: 'Monthly patterns and balance over time',
    emoji: '📈',
    route: '/analytics/trends',
    gradientFrom: 'from-purple-500/20',
    gradientTo: 'to-purple-600/20',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Insights',
    description: 'Personalised observations and behaviour insights',
    emoji: '🧠',
    route: '/analytics/insights',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-600/20',
    borderColor: 'border-amber-500/30',
  },
  {
    title: 'Compare',
    description: 'Compare financial data across different periods',
    emoji: '🆚',
    route: '/analytics/compare',
    gradientFrom: 'from-cyan-500/20',
    gradientTo: 'to-cyan-600/20',
    borderColor: 'border-cyan-500/30',
  },
];

const AnalyticsHubPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Analytics Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose the type of analytics you want to explore
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANALYTICS_TILES.map((tile) => (
            <button
              key={tile.title}
              onClick={() => router.push(tile.route)}
              className={`relative group text-left p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/50 hover:-translate-y-1 ${tile.borderColor} bg-gradient-to-br ${tile.gradientFrom} ${tile.gradientTo} backdrop-blur-sm hover:backdrop-blur-md`}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                {/* Emoji Icon */}
                <div className="text-4xl mb-4">{tile.emoji}</div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tile.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {tile.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 inline-flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsHubPage;
