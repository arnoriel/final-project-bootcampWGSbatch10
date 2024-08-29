import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Pastikan Anda memiliki file CSS untuk styling

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // Mendapatkan peran dari localStorage

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
        <li><Link to={role === 'superadmin' ? '/superadmin' : '/admin'}>Dashboard</Link></li>
        {/* Link ini hanya akan muncul jika perannya superadmin */}
        {role === 'superadmin' && (
          <li><Link to="/manageadmins">Manage Admins</Link></li>
        )}
        <li><Link to="/manageemployees">Manage Employees</Link></li>
      </ul>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Sidebar;
