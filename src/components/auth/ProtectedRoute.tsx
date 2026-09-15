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

  // Security: Prevent privilege escalation from client-side localStorage tampering.
  // Only grant admin access if currentUser genuinely possesses the admin role.
  const isGenuineAdmin = currentUser.role === 'admin' || currentUser.id === 'usr_admin_001';
  const verifiedRole: UserRole = (currentRole === 'admin' && isGenuineAdmin) ? 'admin' : 'user';

  // If user role is not permitted (e.g. Admin accessing /dashboard, or User accessing /admin)
  if (!allowedRoles.includes(verifiedRole)) {
    if (verifiedRole === 'admin') {
      return <Navigate to="/admin" replace state={{ from: location, unauthorized: true }} />;
    }
    if (verifiedRole === 'user') {
      return <Navigate to="/dashboard" replace state={{ from: location, unauthorized: true }} />;
    }
    return <Navigate to={redirectPath || '/login'} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
