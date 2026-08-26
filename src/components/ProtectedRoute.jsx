import React from 'react';
import { useAuth } from '@clerk/react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
