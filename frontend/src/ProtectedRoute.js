// frontend/src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem('role'); // Retrieve the role from localStorage

  if (userRole !== role) {
    return <Navigate to="/login" />; // Redirect to login if the user is not authorized
  }

  return children; // Render the children (the protected component)
};

export default ProtectedRoute;
