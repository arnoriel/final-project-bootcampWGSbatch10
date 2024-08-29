// frontend/src/pages/Admin.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama

function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Jika token tidak ada, arahkan ke login
    if (!token) {
      navigate('/login', { replace: true });
    }

    // Cegah user kembali ke halaman setelah logout dengan menonaktifkan tombol back
    window.history.replaceState(null, null, window.location.href);
    window.addEventListener('popstate', () => {
      if (!localStorage.getItem('token')) {
        navigate('/login', { replace: true });
      }
    });

    // Cleanup event listener saat komponen unmount
    return () => {
      window.removeEventListener('popstate', () => {});
    };
  }, [navigate]);

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h1>Welcome, Admin</h1>
      </div>
    </div>
  );
}

export default Admin;
