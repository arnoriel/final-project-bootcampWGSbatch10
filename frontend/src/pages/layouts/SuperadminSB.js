// frontend/src/pages/layouts/SuperadminSB.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function SuperadminSB() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/superadmin-dashboard">Dashboard</Link></li>
        <li><Link to="/manage-admins">Manage Admins</Link></li>
        <li><Link to="/manage-employees">Manage Employees</Link></li>
      </ul>
    </div>
  );
}

export default SuperadminSB;
