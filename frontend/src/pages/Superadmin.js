// frontend/src/pages/Superadmin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuperadminSB from './layouts/SuperadminSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Superadmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <SuperadminSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Superadmin</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Superadmin;
