import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const adminNavLinks = [
    { path: '/admin/dashboard', label: 'Tableau de Bord', icon: '📊' },
    { path: '/admin/repairs', label: 'Réparations', icon: '🔧' },
    { path: '/admin/stock', label: 'Gestion de Stock', icon: '📦' },
    { path: '/admin/orders', label: 'Commandes', icon: '🛒' },
    // Add other admin links here as they are created
  ];

  return (
    <div className="flex">
      {/* Admin Sidebar/Permanent Menu */}
      <aside className="w-64 bg-secondary-900 text-white p-6 min-h-screen sticky top-16 hidden md:block">
        <nav className="space-y-2">
          {adminNavLinks.map(link => (
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

      {/* Main content area for admin pages */}
      <div className="flex-1">
        <Outlet /> {/* This is where nested admin routes will render */}
      </div>
    </div>
  );
};

export default AdminLayout;