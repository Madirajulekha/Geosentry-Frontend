import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('authToken'); // Replace with real token check
  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
