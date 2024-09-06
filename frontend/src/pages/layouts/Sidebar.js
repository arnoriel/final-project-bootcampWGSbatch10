import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  // State untuk mengelola tampilan modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://10.10.101.169:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Menambahkan Bearer token di Authorization header
        },
      });
  
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  

  const isActive = (path) => location.pathname === path;

  // Fungsi untuk menampilkan modal logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Fungsi untuk menutup modal logout
  const closeModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">MyOffice</div>
      <ul>
        <li>
          <Link
            to={role === 'superadmin' ? '/superadmin' : '/admin'}
            className={isActive(role === 'superadmin' ? '/superadmin' : '/admin') ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        {role === 'superadmin' && (
          <>
            <li>
              <Link to="/manageadmins" className={isActive('/manageadmins') ? 'active' : ''}>
                Manage Admins
              </Link>
            </li>
            <li>
              <Link to="/error-log" className={isActive('/error-log') ? 'active' : ''}>
                Error Log
              </Link>
            </li>
          </>
        )}
        {(role === 'superadmin' || role === 'admin') && (
          <li>
            <Link to="/manageemployees" className={isActive('/manageemployees') ? 'active' : ''}>
              Manage Employees
            </Link>
          </li>
        )}
        {(role === 'superadmin' || role === 'admin' || role === 'employee') && (
          <>
            <li>
              <Link to="/employee-list" className={isActive('/employee-list') ? 'active' : ''}>
                Employee List
              </Link>
            </li>
            <li>
              <Link to="/attendance" className={isActive('/attendance') ? 'active' : ''}>
                Attendance
              </Link>
            </li>
          </>
        )}
      </ul>
      <button onClick={handleLogoutClick} className="logout-button">
        Logout
      </button>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to log out?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
