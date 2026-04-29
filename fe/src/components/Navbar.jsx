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
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to={isAuthenticated ? (user.type === 'admin' ? '/admin/dashboard' : '/client/dashboard') : '/'}
              className="text-2xl font-bold text-primary-600"
            >
              EspaceCall
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-neutral-700 hidden sm:block">
                  Bonjour, <span className="font-medium">{user.name}</span>
                </span>
                <Button onClick={logout} variant="outline" size="small" className="whitespace-nowrap">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                {/* These links remain for unauthenticated users */}
                <Link to="/repair" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Nouvelle Réparation</Link>
                <Link to="/track" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Suivre</Link>
                <Link to="/booking" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Rendez-vous</Link>

                {/* Login/Signup visible when not authenticated */}
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" size="small">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <Button size="small">Inscription</Button>
                </Link>

                {/* Mobile version - Hamburger or simplified login */}
                {/* For simplicity, this example just uses the same buttons but you might want a mobile menu here */}
                <Link to="/login" className="sm:hidden">
                  <Button size="small">Login</Button>
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