import React from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome, Admin</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Admin;
