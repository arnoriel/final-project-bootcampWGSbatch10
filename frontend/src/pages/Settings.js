import React, { useState, useEffect } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ name: '', version: '', status: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://10.10.101.34:5000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data); // Set the settings data
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await fetch(`http://10.10.101.34:5000/settings/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setIsEdit(false);
        setEditId(null);
      } else {
        // Add new setting logic (optional, if you want to allow adding)
      }
      setForm({ name: '', version: '', status: '' });
      fetchSettings(); // Refresh settings list after submit
      setShowModal(false); // Close modal after submission
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (setting) => {
    setForm({ name: setting.name, version: setting.version, status: setting.status });
    setIsEdit(true);
    setEditId(setting.id);
    setShowModal(true); // Open modal for editing
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ name: '', version: '', status: '' });
    setIsEdit(false);
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main-content">
        <h1>Settings</h1>
        <ul className="settings-list">
          {settings.length > 0 ? (
            settings.map((setting) => (
              <li key={setting.id}>
                <span>{setting.name}</span> - <span>{setting.version}</span> - <span>{setting.status}</span>
                <button type="button" className="btn btn-primary" onClick={() => handleEdit(setting)}>Edit</button>
              </li>
            ))
          ) : (
            <p>No settings found</p>
          )}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">{isEdit ? 'Edit Setting' : 'Add Setting'}</h2>
                <button type="button" className="btn-close" onClick={closeModal}>X</button>
              </div>
              <div className="modal-body">
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
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      {isEdit ? 'Update Setting' : 'Add Setting'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
