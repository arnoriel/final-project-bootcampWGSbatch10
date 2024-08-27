import React from 'react';
import { useNavigate } from 'react-router-dom';

function Superadmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome, Superadmin</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Superadmin;
