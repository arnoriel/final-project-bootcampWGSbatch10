import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem('role'); // Retrieve the role from localStorage

  // Jika role yang diteruskan adalah array, periksa apakah userRole ada dalam array tersebut
  if (Array.isArray(role) ? !role.includes(userRole) : userRole !== role) {
    return <Navigate to="/login" replace />; // Redirect to login if the user is not authorized
  }

  return children; // Render the children (the protected component)
};

export default ProtectedRoute;
