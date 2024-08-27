// frontend/src/pages/Admin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSB from './layouts/AdminSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <AdminSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Admin</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Admin;
