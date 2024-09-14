// frontend/src/pages/Employee.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import axios from 'axios'; // Import axios

function Employee() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Jika token tidak ada, arahkan ke login
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Fetch nama pengguna dari backend
    axios.get('http://192.168.0.104:5000/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setName(response.data.name);
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      // Jika ada error (misalnya token tidak valid), arahkan ke login
      navigate('/login', { replace: true });
    });

    // Cegah user kembali ke halaman setelah logout dengan menonaktifkan tombol back
    window.history.replaceState(null, null, window.location.href);
    const handlePopState = () => {
      if (!localStorage.getItem('token')) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listener saat komponen unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h2>Welcome, {name}</h2>
      </div>
    </div>
  );
}

export default Employee;
