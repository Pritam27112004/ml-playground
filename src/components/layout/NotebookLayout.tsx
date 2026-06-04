import React from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type { AlgorithmType } from '../../store/usePlaygroundStore';
import { Notebook, Compass, Activity, Play, RefreshCw, Zap } from 'lucide-react';

interface NotebookLayoutProps {
  children: React.ReactNode;
}

export const NotebookLayout: React.FC<NotebookLayoutProps> = ({ children }) => {
  const { selectedAlgorithm, setAlgorithm, resetModel, runState } = usePlaygroundStore();

  const algorithms: { id: AlgorithmType; label: string; icon: any }[] = [
    { id: 'linear-regression', label: 'Linear Regression', icon: Compass },
    { id: 'logistic-regression', label: 'Logistic Regression', icon: Activity },
    { id: 'svm', label: 'Support Vector Machine', icon: Zap },
    { id: 'decision-tree', label: 'Decision Tree', icon: Notebook },
    { id: 'kmeans', label: 'K-Means Clustering', icon: Play },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4 md:p-8">
      {/* Top Title Notebook Header */}
      <header className="w-full max-w-7xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 flex items-center gap-2">
            <span className="relative">
              <span className="relative z-10 font-handwritten text-pen-blue text-5xl rotate-[-2deg] inline-block">
                ML Playground
              </span>
              <span className="absolute -left-2 right-2 bottom-1 h-5 bg-highlighter-yellow/60 -rotate-1 rounded-sm z-0" />
            </span>
            <span className="text-gray-400 font-light text-2xl hidden md:inline ml-2">
              interactive ml notebook
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => resetModel()}
            className="notebook-btn px-4 py-2 bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50 text-sm md:text-base"
          >
            <RefreshCw size={16} className={`${runState === 'running' ? 'animate-spin' : ''}`} />
            Reset Notebook
          </button>
        </div>
      </header>

      {/* Main Binder/Notebook Body */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 relative">
        {/* Navigation Tabs (Designed as notebook side tabs or top tabs) */}
        <nav className="flex flex-row md:flex-col gap-2 w-full md:w-64 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            const isActive = selectedAlgorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => setAlgorithm(algo.id)}
                className={`notebook-btn w-auto md:w-full text-left px-4 py-3 flex items-center gap-3 transition-all shrink-0 whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-pen-blue text-white translate-x-0 md:translate-x-2 border-pen-blue shadow-none'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                <Icon size={18} />
                <span>{algo.label}</span>
              </button>
            );
          })}

          {/* Notebook Sticky Note */}
          <div className="hidden md:block mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm font-handwritten text-gray-700 text-sm -rotate-2 relative">
            <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-200 rounded-bl-lg" />
            <p className="font-bold mb-1 text-pen-orange">💡 Study Tip:</p>
            <p className="leading-relaxed">
              Click the <b className="text-pen-blue">Play</b> button to see the model learn in real time. Adjust the slider values to speed up or slow down training!
            </p>
          </div>
        </nav>

        {/* Notebook Page Box with Spiral Binders */}
        <main className="flex-1 notebook-container notebook-page-margin bg-paper-bg min-h-[600px] p-6 pl-16 md:pl-20 relative">
          
          {/* Notebook Left Spiral Binders */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-around py-8 pointer-events-none z-20">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex items-center h-8">
                {/* Punch Hole */}
                <div className="w-3.5 h-3.5 rounded-full bg-gray-300 border border-gray-400 shadow-inner ml-4" />
                {/* Spiral Metal Loops */}
                <div className="w-10 h-5 rounded-full border-t-4 border-r-4 border-b-4 border-gray-400 bg-transparent -ml-2 -mt-0.5 shadow-sm opacity-80 rotate-[-12deg]" />
              </div>
            ))}
          </div>

          {/* Actual Page Content */}
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
