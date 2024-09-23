import React, { useState, useEffect } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ name: '', version: '', status: '', greeting: '', information: '' });
  const [originalForm, setOriginalForm] = useState({}); // To store the initial form data for comparison
  const [isChanged, setIsChanged] = useState(false); // To control the button's state
  const [notification, setNotification] = useState(''); // To show the "Settings Changed" notification

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://10.10.101.34:5000/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const setting = data[0];
          const initialData = {
            name: setting.name,
            version: setting.version,
            status: setting.status,
            greeting: setting.greeting || '',
            information: setting.information || '',
          };
          setSettings(data);
          setForm(initialData);
          setOriginalForm(initialData); // Store original data for comparison
        }
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleInputChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);

    // Check if the form has been changed compared to the original
    const isFormChanged = Object.keys(updatedForm).some((key) => updatedForm[key] !== originalForm[key]);
    setIsChanged(isFormChanged); // Enable the button only if the form is changed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const settingId = settings[0]?.id; // Assuming you want to update the first (or only) setting
      await fetch(`http://10.10.101.34:5000/settings/${settingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      fetchSettings(); // Refresh settings list after submit
      setIsChanged(false); // Disable the button after successful update
      setNotification('Settings Changed'); // Show success notification
      setTimeout(() => setNotification(''), 3000); // Hide the notification after 3 seconds
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main-content">
        <h1>Update Settings</h1>
        {notification && <p className="notification">{notification}</p>} {/* Notification message */}
        {settings.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="version">Version</label>
              <input
                name="version"
                placeholder="Version"
                value={form.version}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <input
                name="status"
                placeholder="Status"
                value={form.status}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="greeting">Greeting</label>
              <input
                name="greeting"
                placeholder="Greeting"
                value={form.greeting}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="information">Information</label>
              <input
                name="information"
                placeholder="Information"
                value={form.information}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={!isChanged}>
                Update Setting
              </button>
            </div>
          </form>
        ) : (
          <p>Loading settings...</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
