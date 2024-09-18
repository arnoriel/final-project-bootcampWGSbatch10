import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

const Index = () => {
  const [appName, setAppName] = useState(''); // Default value

  // Fetch app name from the settings table
  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const response = await fetch('http://10.10.101.34:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          const appSetting = data.find((setting) => setting.id === 1); // Assuming the app name is in the first setting
          const appName = appSetting ? appSetting.name : 'DefaultAppName';
          setAppName(appName);

          // Set the document title dynamically
          document.title = appName;
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchAppName();
  }, []); // Empty array to run this effect only once when the component is mounted

  return <App />;
};

root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);

reportWebVitals();
