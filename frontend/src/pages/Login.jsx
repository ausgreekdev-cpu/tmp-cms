import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96 dark:shadow-gray-900/50">
        <h1 className="text-2xl font-bold mb-1 dark:text-white">TMP CMS</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Sign in to Traffic Management Plans</p>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3.5 py-2.5 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400" />
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-60 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">Demo: admin@tmpcms.com / admin123</p>
      </div>
    </div>
  );
}
