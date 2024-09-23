import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const [appName, setAppName] = useState(''); // Default value for app name
  const [appGreeting, setAppGreeting] = useState(''); // Default value for greeting
  const [appVersion, setAppVersion] = useState(''); // Default value for version

  // Fetch app name, greeting, and version from the settings table
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://10.10.101.34:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          const appSetting = data.find((setting) => setting.id === 1); // Assuming the settings have id = 1
          setAppName(appSetting ? appSetting.name : ''); 
          setAppGreeting(appSetting ? appSetting.greeting : ''); // Set greeting
          setAppVersion(appSetting ? appSetting.version : ''); // Set version
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);
  
  return (
    <div className="welcome-container">
      <div className="welcome-overlay"></div>
      <div className="welcome-content">
        <h1>Welcome to {appName}</h1>
        <p>{appGreeting}</p> {/* Display the greeting */}
        <div className="welcome-buttons">
          <Link to="/login" className="welcome-button">Login</Link>
        </div>
      </div>

      {/* Footer displaying the app version */}
      <footer className="welcome-footer">
        <p>{appVersion}</p> {/* Display the app version */}
      </footer>
    </div>
  );
}

export default Welcome;
