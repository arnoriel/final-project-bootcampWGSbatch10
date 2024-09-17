// frontend/src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if no token is present
  }

  try {
    const decodedToken = jwtDecode(token); // Decode the token
    const userRole = decodedToken.role; // Get the role from the decoded token

    // Jika role yang diteruskan adalah array, periksa apakah userRole ada dalam array tersebut
    if (Array.isArray(role) ? !role.includes(userRole) : userRole !== role) {
      return <Navigate to="/login" replace />; // Redirect to login if the user is not authorized
    }

    return children; // Render the children (the protected component)
  } catch (error) {
    console.error('Error decoding token:', error);
    return <Navigate to="/login" replace />; // Redirect to login if token is invalid
  }
};

export default ProtectedRoute;
