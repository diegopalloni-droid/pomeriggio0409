import React from 'react';
import { useAppContext } from './context/AppContext';
import { Login } from './components/Login';
import { MagazzinoPage } from './components/MagazzinoPage';
import { ForzaVenditaPage } from './components/ForzaVenditaPage';
import { ResponsabilePage } from './components/ResponsabilePage';
import { Header } from './components/Header';
import { UserRole } from './types';

const App: React.FC = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (user.role) {
      case UserRole.MAGAZZINO:
        return <MagazzinoPage />;
      case UserRole.FORZA_VENDITA:
        return <ForzaVenditaPage />;
      case UserRole.RESPONSABILE:
        return <ResponsabilePage />;
      default:
        return (
          <div className="text-center p-8 bg-red-900/50 text-red-400 rounded-lg">
            <h3 className="font-bold">Error</h3>
            <p>Invalid user role assigned. Please contact support.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
