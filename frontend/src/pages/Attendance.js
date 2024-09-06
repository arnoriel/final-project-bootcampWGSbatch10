import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('today'); // Default filter is 'today'

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

  // Function to filter attendance based on the selected filter
  useEffect(() => {
    const filterAttendance = () => {
      const now = new Date();

      let filteredData;
      switch (filter) {
        case 'today':
          filteredData = attendance.filter((user) => {
            const signInDate = new Date(user.signin_at);
            return signInDate.toDateString() === now.toDateString();
          });
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          filteredData = attendance.filter((user) => {
            const signInDate = new Date(user.signin_at);
            return signInDate.toDateString() === yesterday.toDateString();
          });
          break;
        case 'last-week':
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          filteredData = attendance.filter((user) => {
            const signInDate = new Date(user.signin_at);
            return signInDate >= lastWeek && signInDate <= now;
          });
          break;
        case 'last-month':
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          filteredData = attendance.filter((user) => {
            const signInDate = new Date(user.signin_at);
            return signInDate >= lastMonth && signInDate <= now;
          });
          break;
        case 'last-year':
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          filteredData = attendance.filter((user) => {
            const signInDate = new Date(user.signin_at);
            return signInDate >= lastYear && signInDate <= now;
          });
          break;
        default:
          filteredData = attendance;
          break;
      }
      setFilteredAttendance(filteredData);
    };

    filterAttendance();
  }, [attendance, filter]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h2>Attendance List</h2>
        {error && <p>{error}</p>}

        {/* Filter selection */}
        <div className="filter-buttons">
          <button onClick={() => setFilter('today')}>Today</button>
          <button onClick={() => setFilter('yesterday')}>Yesterday</button>
          <button onClick={() => setFilter('last-week')}>Last Week</button>
          <button onClick={() => setFilter('last-month')}>Last Month</button>
          <button onClick={() => setFilter('last-year')}>Last Year</button>
        </div>

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
            {filteredAttendance.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatTime(user.signin_at)}</td>
                <td>{user.logout_at ? formatTime(user.logout_at) : 'N/A'}</td>
                <td>{user.logout_at ? 'Logged Out' : 'Still Online'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
