// frontend/src/pages/layouts/EmployeeSB.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function EmployeeSB() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/employee-dashboard">Dashboard</Link></li>
        <li><Link to="/my-profile">My Profile</Link></li>
        <li><Link to="/attendance">Attendance</Link></li>
      </ul>
    </div>
  );
}

export default EmployeeSB;
