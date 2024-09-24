import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; // Import the CSS file
import { FaUser, FaSignOutAlt, FaRegUserCircle } from 'react-icons/fa'; // Import icons

function Header() {
  const [user, setUser] = useState({ name: '', images: '' });
  const [dateTime, setDateTime] = useState({ date: '', time: '' });
  const [dropdownVisible, setDropdownVisible] = useState(false); // For dropdown visibility
  const [showLogoutModal, setShowLogoutModal] = useState(false); // For showing logout modal
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref for dropdown

  // Function to update time and date
  useEffect(() => {
    const updateDateTime = () => {
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = currentDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setDateTime({ date, time });
    };

    updateDateTime(); // Initial call
    const intervalId = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (token) {
      axios.get('http://10.10.101.34:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser({
          name: response.data.name,
          images: response.data.images ? `http://10.10.101.34:5000${response.data.images}` : '/assets/default.jpg', // Make sure the path to default.jpg is correct
        });
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }, []);  

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to handle logout
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

  return (
    <header className="header-container">
      <div className="datetime-container">
        <span className="date">{dateTime.date}</span>
        <span className="time">{dateTime.time}</span>
      </div>
      <div className="user-info">
        <img 
          src={user.images || '/assets/default.jpg'} // Fallback to default image
          alt="User" 
          className="user-image" 
          onClick={() => setDropdownVisible(!dropdownVisible)} // Toggle dropdown visibility
        />
        <span 
          className="user-name" 
          onClick={() => setDropdownVisible(!dropdownVisible)} // Toggle dropdown visibility
        >
          {user.name}
        </span>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <Link to="/profile" className="dropdown-item">
              <FaRegUserCircle className="dropdown-icon" /> Profile
            </Link>
            <button 
              onClick={() => setShowLogoutModal(true)} // Open logout modal
              className="dropdown-item"
            >
              <FaSignOutAlt className="dropdown-icon" /> Logout
            </button>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-logout">
            <div className="modal-content">
              <h5>Confirm Logout</h5>
              <p>Are you sure you want to log out?</p>
              <button 
                onClick={() => setShowLogoutModal(false)} // Close modal
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout} // Proceed to logout
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
