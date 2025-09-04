import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, setError, loading } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    login(email, password);
  };
  
  const handleInputChange = () => {
      if(error) setError(null);
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        <h1 className="text-7xl font-bold text-center gradient-text">
          CGS
        </h1>
        <p className="text-center text-slate-400">Please sign in to continue</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300 block mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
              className="w-full px-4 py-2 text-white bg-black/20 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-start transition-all"
              placeholder="your-email@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300 block mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
              className="w-full px-4 py-2 text-white bg-black/20 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-start transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md border border-red-500/30">
              {error}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 font-bold text-white bg-gradient-to-r from-sky-500 to-violet-500 rounded-lg hover:shadow-lg hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};