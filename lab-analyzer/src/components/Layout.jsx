import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Beaker, Sun, Moon, Menu, X, LogOut, User } from 'lucide-react';

export default function Layout() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null); // This stores the logged-in user
  
  const navigate = useNavigate();
  const location = useLocation(); // This watches for URL changes

  // 1. SYNC USER DATA: Every time the URL changes, check if someone logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    } else {
      setUserData(null);
    }
  }, [location]); // Re-runs every time you move to a new page

  // 2. DARK MODE LOGIC
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserData(null);
    navigate('/login');
  };

  // Helper to get only the First Name (e.g., "Avirup" from "Avirup Mukherjee")
  const getFirstName = (fullName) => fullName ? fullName.split(' ')[0] : 'Researcher';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 py-4 shadow-sm relative">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400 font-bold text-xl tracking-tight">
            <Beaker size={28} />
            <span>LabAnalyzer</span>
          </Link>
          
          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Home</Link>
            <Link to="/lab-analyzer" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Workspace</Link>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>

            {/* CONDITIONAL RENDERING: Login/Reg VS Welcome/Logout */}
            {userData ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm">
                  <User size={16} />
                  Hi, <strong>{getFirstName(userData.name)}</strong>
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 transition text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Register
                </Link>
              </div>
            )}

            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* MOBILE TOGGLE (Omitted for brevity, but same logic applies) */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
               {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}