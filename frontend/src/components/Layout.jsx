import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/tmps', label: 'TMPs', icon: '📋' },
  { to: '/projects', label: 'Projects', icon: '🏗️' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/sites', label: 'Sites', icon: '📍' },
];

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleDark = () => {
    const isDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
  };

  return (
    <div className="flex min-h-screen">
      <nav className="w-60 bg-sidebar text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <h1 className="text-lg font-bold">TMP CMS</h1>
          <p className="text-xs text-gray-400 mt-1">Traffic Management Plans</p>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}>
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}>
                <span>🔧</span> Users
              </NavLink>
              <NavLink to="/settings/email"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}>
                <span>📧</span> Email
              </NavLink>
            </>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-400">
          <div className="mb-1 text-sm text-gray-300">{user?.name}</div>
          <div className="text-xs capitalize mb-2">{user?.role}</div>
          <div className="flex gap-2">
            <button onClick={toggleDark} className="border border-gray-700 px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-gray-800 transition-colors">
              🌓
            </button>
            <button onClick={handleLogout} className="border border-gray-700 px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-gray-800 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
