import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Beaker, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Toggle Dark Mode class on the HTML body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400 font-bold text-xl tracking-tight">
          <Beaker size={28} />
          <span>LabAnalyzer</span>
        </Link>
        
        <div className="flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Home</Link>
          <Link to="/lab-analyzer" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Workspace</Link>
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div> {/* Divider */}
          
          <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition">Login</Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm transition">
            Register
          </Link>

          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Page Content renders here */}
      <main className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}