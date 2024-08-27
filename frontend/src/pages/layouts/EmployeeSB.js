// frontend/src/pages/layouts/EmployeeSB.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function EmployeeSB() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/employee-dashboard">Dashboard</Link></li>
        <li><Link to="/manage-employees">Manage Employees</Link></li>
      </ul>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default EmployeeSB;
