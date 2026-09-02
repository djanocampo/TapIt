import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTapIt } from '../../store';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['admin', 'user'],
  redirectPath,
}) => {
  const { currentRole, currentUser, isAuthenticated } = useTapIt();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to={redirectPath || '/login'} replace state={{ from: location }} />;
  }

  // If user role is not permitted (e.g. Djan / User attempting to access /admin)
  if (!allowedRoles.includes(currentRole)) {
    if (currentRole === 'user') {
      return <Navigate to="/dashboard" replace state={{ from: location, unauthorized: true }} />;
    }
    return <Navigate to={redirectPath || '/login'} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
