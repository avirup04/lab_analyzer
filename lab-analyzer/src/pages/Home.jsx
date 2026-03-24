import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
        Precision <span className="text-indigo-600 dark:text-cyan-400">Bio-CS</span> Analytics
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
        Automate your standard curves, calculate Molar Extinction Coefficients, and analyze Enzyme Kinetics with our specialized laboratory dashboard.
      </p>
      <Link to="/lab-analyzer" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1">
        Open Lab Workspace
      </Link>
    </div>
  );
}