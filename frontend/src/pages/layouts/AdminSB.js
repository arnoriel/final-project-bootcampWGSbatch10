// frontend/src/pages/layouts/AdminSB.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function AdminSB() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/admin-dashboard">Dashboard</Link></li>
        <li><Link to="/manage-employees">Manage Employees</Link></li>
      </ul>
    </div>
  );
}

export default AdminSB;
