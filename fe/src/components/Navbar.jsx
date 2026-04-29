import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Button from './Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              EspaceCall
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/repair" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Nouvelle Réparation</Link>
                <Link to="/track" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Suivre</Link>
                {isAuthenticated && user?.type === 'admin' && <Link to="/admin/dashboard" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard Admin</Link>}
                {isAuthenticated && user?.type === 'client' && <Link to="/client/dashboard" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Mes Réparations</Link>}
                <Link to="/booking" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Rendez-vous</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-neutral-700 hidden sm:block">
                  Bonjour, <span className="font-medium">{user.name}</span>
                </span>
                <Button onClick={logout} variant="outline" size="small">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="small">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="small">Inscription</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;