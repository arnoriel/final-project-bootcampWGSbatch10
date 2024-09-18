import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const [appName, setAppName] = useState(''); // Default value

  // Fetch app name from the settings table
  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const response = await fetch('http://10.10.101.34:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          const appSetting = data.find((setting) => setting.id === 1); // Assuming the app name is in the first setting
          setAppName(appSetting ? appSetting.name : ''); 
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchAppName();
  }, []);
  
  return (
    <div className="welcome-container">
      <div className="welcome-overlay"></div>
      <div className="welcome-content">
        <h1>Welcome to {appName}</h1>
        <p>Your workspace, simplified.</p>
        <div className="welcome-buttons">
          <Link to="/login" className="welcome-button">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
