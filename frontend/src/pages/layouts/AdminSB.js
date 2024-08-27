// frontend/src/pages/layouts/AdminSB.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function AdminSB() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hapus token dan role dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Arahkan ke halaman login
    navigate('/login', { replace: true }); // replace: true untuk mencegah kembali ke halaman sebelumnya
  };

  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/admin-dashboard">Dashboard</Link></li>
        <li><Link to="/manage-employees">Manage Employees</Link></li>
      </ul>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default AdminSB;
