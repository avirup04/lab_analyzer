import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Beaker, Sun, Moon, Menu, X, LogOut, User, Home, Activity } from 'lucide-react';

export default function Layout() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    } else {
      setUserData(null);
    }
  }, [location]);

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
    setIsMenuOpen(false); // Close menu on logout
    navigate('/login');
  };

  const getFirstName = (fullName) => fullName ? fullName.split(' ')[0] : 'Researcher';

  return (
    // Added 'flex flex-col' here to enable the sticky footer
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 py-4 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400 font-bold text-xl tracking-tight">
            <Beaker size={28} />
            <span>LabAnalyzer</span>
          </Link>
          
          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Home</Link>
            <Link to="/lab-analyzer" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition">Workspace</Link>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>

            {userData ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm">
                  <User size={16} />
                  Hi, <strong>{getFirstName(userData.name)}</strong>
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-600 transition text-sm">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Register</Link>
              </div>
            )}

            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors">
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top duration-200 z-50">
            <div className="flex flex-col p-6 space-y-4 font-bold uppercase tracking-widest text-xs text-slate-500">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                <Home size={18} /> Home
              </Link>
              <Link to="/lab-analyzer" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-indigo-600 dark:text-cyan-400">
                <Activity size={18} /> Workspace
              </Link>

              <hr className="border-slate-100 dark:border-slate-800" />

              {userData ? (
                <div className="space-y-4">
                    <div className="px-3 py-2 text-slate-400">
                        Logged in as: <span className="text-slate-900 dark:text-white block mt-1">{userData.name}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl">Login</Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center p-3 bg-indigo-600 text-white rounded-xl">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Added 'flex-grow w-full' here so the main content pushes the footer down */}
      <main className="grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* --- UNIVERSAL FOOTER --- */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wide">
            Copyright &copy; 2026 Avirup. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}