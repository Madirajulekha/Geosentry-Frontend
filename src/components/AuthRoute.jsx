// components/AuthRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const isAuth = !!localStorage.getItem('authToken');

  // If authenticated, prevent access to /login or /register
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
};

export default AuthRoute;
