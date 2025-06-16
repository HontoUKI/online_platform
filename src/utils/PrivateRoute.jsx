import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const session = JSON.parse(localStorage.getItem('session'));
  const access_token = session?.access_token;

  if (!access_token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
