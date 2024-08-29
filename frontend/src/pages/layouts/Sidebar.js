import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Menyediakan informasi tentang lokasi saat ini
  const role = localStorage.getItem('role'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  // Menentukan apakah path saat ini sama dengan path yang diinginkan
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-title">MyOffice</div>
      <ul>
        <li>
          <Link to={role === 'superadmin' ? '/superadmin' : '/admin'} className={isActive(role === 'superadmin' ? '/superadmin' : '/admin') ? 'active' : ''}>
            Dashboard
          </Link>
        </li>
        {role === 'superadmin' && (
          <li>
            <Link to="/manageadmins" className={isActive('/manageadmins') ? 'active' : ''}>
              Manage Admins
            </Link>
          </li>
        )}
        <li>
          <Link to="/manageemployees" className={isActive('/manageemployees') ? 'active' : ''}>
            Manage Employees
          </Link>
        </li>
      </ul>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Sidebar;
