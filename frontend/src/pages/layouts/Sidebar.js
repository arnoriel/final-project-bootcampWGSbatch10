import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Menyediakan informasi tentang lokasi saat ini
  const role = localStorage.getItem('role'); 

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
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
