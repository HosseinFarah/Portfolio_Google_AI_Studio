
import React, { useState, useEffect } from 'react';
import { dbService } from './services/dataService';
import { AdminPanel } from './components/AdminPanel';
import { PublicView } from './components/PublicView';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Simple Hash Router Implementation
const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  
  // Initialize admin state from localStorage (client-side persistence of "logged in" state)
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('portfolio_isAdmin') === 'true';
  });
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Increment visit on mount, but only if not in admin area
  useEffect(() => {
    if(!window.location.hash.includes('admin') && !window.location.hash.includes('login')) {
        dbService.incrementVisit();
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Redirect if already logged in and trying to access login
  useEffect(() => {
    if (currentRoute.includes('login') && isAdmin) {
        window.location.hash = '#/admin';
    }
  }, [currentRoute, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const success = await dbService.login(adminUser, adminPass);

        if (success) {
          setIsAdmin(true);
          localStorage.setItem('portfolio_isAdmin', 'true');
          toast.success('Login Successful');
          window.location.hash = '#/admin';
          setCurrentRoute('#/admin');
        } else {
          toast.error('Invalid Credentials');
        }
    } catch (error) {
        toast.error('Connection Error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('portfolio_isAdmin');
    setAdminUser('');
    setAdminPass('');
    window.location.hash = '#/';
  };

  // Safe Navigation Helper
  const navigateHome = (e: React.MouseEvent) => {
      e.preventDefault();
      window.location.hash = '#/';
  };

  // Routing Logic
  const isLoginRoute = currentRoute.includes('login');
  const isAdminRoute = currentRoute.includes('admin');

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151'
        },
      }} />
      
      {/* Login Screen */}
      {isLoginRoute && !isAdmin ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 font-sans">
          <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
            <div className="mb-4">
              <label className="text-gray-400 text-sm block mb-1">Email / User</label>
              <input 
                type="text" 
                value={adminUser} 
                onChange={e => setAdminUser(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white focus:border-primary focus:outline-none"
                placeholder="email@gmail.com"
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm block mb-1">Password</label>
              <input 
                type="password" 
                value={adminPass} 
                onChange={e => setAdminPass(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white focus:border-primary focus:outline-none"
                placeholder="Password"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-6 bg-gray-900 p-3 rounded border border-gray-700">
               <input type="checkbox" id="login-captcha" required className="w-5 h-5 accent-primary cursor-pointer" />
               <label htmlFor="login-captcha" className="text-sm text-gray-300 select-none cursor-pointer">I am not a robot</label>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-primary hover:bg-blue-600 disabled:bg-blue-800 text-white p-2 rounded transition-colors font-semibold shadow-lg flex justify-center">
              {isLoading ? 'Checking...' : 'Login'}
            </button>
            <a href="#/" onClick={navigateHome} className="block text-center mt-6 text-sm text-gray-400 hover:text-white transition-colors">
              &larr; Back to Home
            </a>
          </form>
        </div>
      ) : isAdminRoute && isAdmin ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <PublicView />
      )}
    </>
  );
};

export default App;
