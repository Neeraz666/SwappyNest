import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();

  console.log("ProtectedRoute - isAuth:", isAuth, "loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("Authenticated, rendering protected content");
  return children;
};

export default ProtectedRoute;