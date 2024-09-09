import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const Errorlog = () => {
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  const fetchErrorLogs = async () => {
    try {
      const response = await axios.get('http://10.10.101.193:5000/api/error-logs');
      setErrorLogs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch error logs');
      setLoading(false);
    }
  };

  const renderErrorLogs = () => {
    if (errorLogs.length === 0) {
      return <p>No error logs found.</p>;
    }

    return errorLogs.map((log) => (
      <tr key={log.id}>
        <td>{log.created_at}</td>
        <td>{log.error_message}</td>
        <td>{log.endpoint}</td>
        <td>{log.stack_trace}</td>
      </tr>
    ));
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h2>Error Logs</h2>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p>Loading error logs...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Error Message</th>
                <th>Endpoint</th>
                <th>Stack Trace</th>
              </tr>
            </thead>
            <tbody>{renderErrorLogs()}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Errorlog;
