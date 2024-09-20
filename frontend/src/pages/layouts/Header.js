import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Header.css'; // Import the CSS file

function Header() {
  const [user, setUser] = useState({ name: '', images: '' });
  const [dateTime, setDateTime] = useState({ date: '', time: '' });

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
          images: response.data.images ? `http://10.10.101.34:5000${response.data.images}` : '', // Use provided image URL or fallback to default
        });
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }, []);

  return (
    <header className="header-container">
      <div className="datetime-container">
        <span className="date">{dateTime.date}</span>
        <span className="time">{dateTime.time}</span>
      </div>
      <div className="user-info">
        <img 
          src={user.images || '/assets/default.jpg'} // Fallback to default image in assets
          alt="User" 
          className="user-image" 
        />
        <span className="user-name">{user.name}</span>
      </div>
    </header>
  );
}

export default Header;
