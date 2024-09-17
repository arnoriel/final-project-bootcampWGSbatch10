import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faUser, faClipboardList, faHistory, faUserClock } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode untuk decode token

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('');

  // Ambil status collapse dari localStorage
  const [collapsed, setCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.role); // Ambil role dari token yang telah di-decode
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Simpan status collapse ke localStorage setiap kali berubah
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://10.10.101.34:5000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => setShowLogoutModal(true);
  const closeModal = () => setShowLogoutModal(false);

  const toggleCollapse = () => {
    // Update collapsed state
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-title">
            MyOffice
          </div>
        )}
        <button onClick={toggleCollapse} className="collapse-btn">
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          {/* Link dashboard untuk setiap role */}
          <Link to={role === 'superadmin' ? '/superadmin' : role === 'admin' ? '/admin' : '/employee'} 
                className={isActive(role === 'superadmin' ? '/superadmin' : role === 'admin' ? '/admin' : '/employee') ? 'active' : ''}>
            <FontAwesomeIcon icon={faClipboardList} className="fa-icon" />
            {!collapsed && 'Dashboard'}
          </Link>
        </li>
        {role === 'superadmin' && (
          <>
            <li>
              <Link to="/manageadmins" className={isActive('/manageadmins') ? 'active' : ''}>
                <FontAwesomeIcon icon={faUser} className="fa-icon" />
                {!collapsed && 'Manage Admins'}
              </Link>
            </li>
            <li>
              <Link to="/error-log" className={isActive('/error-log') ? 'active' : ''}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" />
                {!collapsed && 'Error Log'}
              </Link>
            </li>
          </>
        )}
        {(role === 'superadmin' || role === 'admin') && (
          <li>
            <Link to="/manageemployees" className={isActive('/manageemployees') ? 'active' : ''}>
              <FontAwesomeIcon icon={faUser} className="fa-icon" />
              {!collapsed && 'Manage Employees'}
            </Link>
          </li>
        )}
        {/* Tampilkan Leave History hanya untuk admin atau superadmin */}
        {(role === 'superadmin' || role === 'admin') && (
          <li>
            <Link to="/leave-history" className={isActive('/leave-history') ? 'active' : ''}>
              <FontAwesomeIcon icon={faHistory} className="fa-icon" />
              {!collapsed && 'Leave History'}
            </Link>
          </li>
        )}
        {(role === 'superadmin' || role === 'admin' || role === 'employee') && (
          <>
            <li>
              <Link to="/attendance" className={isActive('/attendance') ? 'active' : ''}>
                <FontAwesomeIcon icon={faUserClock} className="fa-icon" />
                {!collapsed && 'Attendance'}
              </Link>
            </li>
            <li>
              <Link to="/employee-list" className={isActive('/employee-list') ? 'active' : ''}>
                <FontAwesomeIcon icon={faUser} className="fa-icon" />
                {!collapsed && 'Employee List'}
              </Link>
            </li>
          </>
        )}
      </ul>
      <button onClick={handleLogoutClick} className="logout-button">
        <FontAwesomeIcon icon={faSignOutAlt} className="fa-icon" />
        {!collapsed && 'Logout'}
      </button>

      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h5>Confirm Logout</h5>
            <p>Are you sure you want to log out?</p>
            <button onClick={closeModal}>Cancel</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
