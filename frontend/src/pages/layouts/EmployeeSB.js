// frontend/src/pages/layouts/EmployeeSB.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function EmployeeSB() {
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
      {/* Title at the top of the sidebar */}
      <div className="sidebar-title">
        MyOffice
      </div>
      
      <ul>
        <li><Link to="/employee-dashboard">Dashboard</Link></li>
        <li><Link to="/attendance">Attendance</Link></li>
      </ul>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default EmployeeSB;
