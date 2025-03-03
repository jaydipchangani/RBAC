import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../contexts/PermissionContext';
import { ProtectedRouteProps } from '../types/types';


export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const PermissionRoute: React.FC<ProtectedRouteProps> = ({ 
  module, 
  action, 
  element 
}) => {
  const { isAuthenticated } = useAuth();
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasPermission(module, action)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{element}</>;
};

// Component for routes that require specific permissions with Outlet
export const PermissionOutlet: React.FC<{ module: string; action: string }> = ({ 
  module, 
  action 
}) => {
  const { isAuthenticated } = useAuth();
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasPermission(module, action)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};