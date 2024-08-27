import React from 'react';
import { useNavigate } from 'react-router-dom';

function Employee() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome, Employee</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Employee;
