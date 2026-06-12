import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ClientLayout = () => {
  const location = useLocation();

  const clientNavLinks = [
    { path: '/client/dashboard', label: 'Mes Réparations', icon: '🔧' },
    { path: '/client/repair', label: 'Nouvelle Réparation', icon: '📝' },
    { path: '/client/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <div className="flex">
      {/* Client Sidebar/Permanent Menu */}
      <aside className="w-64 bg-secondary-900 text-white p-6 min-h-screen sticky top-16 hidden md:block">
        <nav className="space-y-2">
          {clientNavLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center p-3 rounded-lg text-lg font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-primary-700/50 text-neutral-200'
              }`}
            >
              <span className="mr-3 text-xl">{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area for client pages */}
      <div className="flex-1">
        <Outlet /> {/* This is where nested client routes will render */}
      </div>
    </div>
  );
};

export default ClientLayout;