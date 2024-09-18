import React, { useState, useEffect } from 'react';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const About = () => {
  const [setting, setSetting] = useState(null);

  useEffect(() => {
    fetchAppDetails();
  }, []);

  const fetchAppDetails = async () => {
    const response = await fetch('http://10.10.101.34:5000/settings/1');
    const data = await response.json();
    setSetting(data);
  };

  return (
    <div>
        <Sidebar />
        <div className='main-content'>
      <h1>About the App</h1>
      {setting ? (
        <div>
          <p>Name: {setting.name}</p>
          <p>Version: {setting.version}</p>
          <p>Status: {setting.status}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </div>
  );
};

export default About;
