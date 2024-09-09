import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://10.10.101.193:5000/api/attendance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data); // Logging data for debugging
      setAttendanceData(response.data);
    } catch (err) {
      setError('Failed to fetch attendance data');
    }
  };
  
  const renderAttendance = () => {
    if (attendanceData.length === 0) {
      return <p>No attendance records found.</p>;
    }
  
    return attendanceData.map((record) => (
      <tr key={record.user_id}>
        <td>{record.name}</td>
        <td>{new Date(record.login_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td> 
        <td>{record.logout_at ? new Date(record.logout_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Still logged in'}</td>
      </tr>
    ));
  };  

  return (
    <div>
        <Sidebar />
        <div className='main-content'>
      <h2>Attendance Records</h2>
      {error && <p className="error-message">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Login Time</th>
            <th>Logout Time</th>
          </tr>
        </thead>
        <tbody>{renderAttendance()}</tbody>
      </table>
    </div>
    </div>
  );
};

export default Attendance;
