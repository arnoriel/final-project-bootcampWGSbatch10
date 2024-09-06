import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://10.10.101.169:5000/api/attendance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAttendance(response.data);
      } catch (err) {
        setError('Failed to fetch attendance data');
      }
    };

    fetchAttendance();
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h2>Attendance List</h2>
        {error && <p>{error}</p>}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Signed In At</th>
              <th>Time Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatTime(user.signin_at)}</td>
                <td>
                  {user.logout_at ? formatTime(user.logout_at) : 'N/A'}
                </td>
                <td>
                  {user.logout_at ? 'Logged Out' : 'Still Online'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
