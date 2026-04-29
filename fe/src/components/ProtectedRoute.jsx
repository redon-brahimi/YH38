import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can return a loading spinner here
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    // For admin routes, redirect to admin login. For client routes, redirect to client login.
    const loginPath = adminOnly ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If it's an admin-only route, check the user type/role
  if (adminOnly && user?.type !== 'admin') {
    // If a non-admin tries to access an admin route, send them to the homepage.
    toast.error("Accès non autorisé.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;