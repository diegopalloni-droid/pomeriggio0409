import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';

export const Header: React.FC = () => {
  const { user, logout } = useAppContext();

  return (
    <header className="bg-black/20 backdrop-blur-lg shadow-lg border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-200">
          Welcome, <span className="text-brand-start capitalize">{user?.username}</span>
        </h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-brand-start transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </header>
  );
};