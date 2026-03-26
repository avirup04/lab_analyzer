import React, { useState } from 'react';
import { Activity, Beaker, TrendingUp, Calculator, Thermometer, Droplets, ArrowRight, ChevronLeft } from 'lucide-react';
import MolarExtinctionCalc from '../components/MolarExtinctionCalc';

export default function Workspace() {
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    { 
      id: 'molar_curve', 
      title: 'Molar Extinction (Standard Curve)', 
      desc: 'Determine ε by plotting absorbance against known concentrations.', 
      icon: <TrendingUp className="text-indigo-500" size={32} />,
      color: 'border-indigo-500' 
    },
    { 
      id: 'kinetics', 
      title: 'Enzyme Kinetics', 
      desc: 'Calculate Vmax and Km using Michaelis-Menten parameters.', 
      icon: <Activity className="text-emerald-500" size={32} />,
      color: 'border-emerald-500' 
    },
    { 
      id: 'opt_ph', 
      title: 'Optimal pH Finder', 
      desc: 'Analyze enzyme activity across different pH levels.', 
      icon: <Droplets className="text-cyan-500" size={32} />,
      color: 'border-cyan-500' 
    },
    { 
      id: 'opt_temp', 
      title: 'Optimal Temperature', 
      desc: 'Identify the peak thermal stability for your protein sample.', 
      icon: <Thermometer className="text-orange-500" size={32} />,
      color: 'border-orange-500' 
    },
    { 
      id: 'unit', 
      title: 'Unit Converter', 
      desc: 'Convert between Molarity, mg/mL, and percent solutions.', 
      icon: <Calculator className="text-amber-500" size={32} />,
      color: 'border-amber-500' 
    },
  ];

  // Find the details of the module that is currently open
  const selectedModule = modules.find(m => m.id === activeModule);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* --- DYNAMIC HEADER --- */}
      <header className="animate-in fade-in slide-in-from-top-4 duration-500">
        {!activeModule ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Research Workspace</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Select a computational module to begin your analysis.</p>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-cyan-400 hover:underline mb-2"
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedModule.title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{selectedModule.desc}</p>
          </div>
        )}
      </header>

      {/* --- MODULE GRID (Only shows if no module is active) --- */}
      {!activeModule && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`text-left p-6 bg-white dark:bg-slate-900 border-b-4 ${mod.color} rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group`}
            >
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 w-fit rounded-xl group-hover:scale-110 transition-transform">
                {mod.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">{mod.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {mod.desc}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-cyan-400">
                Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* --- ACTIVE TOOL AREA --- */}
      {activeModule && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 md:p-8">
            {activeModule === 'molar_curve' ? (
              <MolarExtinctionCalc />
            ) : (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Calculator size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Module Under Construction</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  We are currently calibrating the algorithms for {selectedModule.title}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}