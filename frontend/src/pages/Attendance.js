import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const calculateWorkTime = (user, isLive = false) => {
  // Parsing tanggal sesuai dengan ISO format untuk menghindari masalah timezone
  const loginTime = new Date(user.login_at);
  // Pastikan logout_time diambil sesuai atau jika live, gunakan waktu saat ini
  const logoutTime = user.logout_at ? new Date(user.logout_at) : new Date();

  // Perhitungan selisih waktu
  const diffInMs = logoutTime.getTime() - loginTime.getTime(); // Mendapatkan selisih dalam milidetik
  const hours = Math.floor(diffInMs / 1000 / 60 / 60);
  const minutes = Math.floor((diffInMs / 1000 / 60) % 60);
  const seconds = Math.floor((diffInMs / 1000) % 60);

  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};

// Convert UTC or server time to local time string
const formatDateToLocalString = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // Convert to local time string based on user's device timezone
};

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [period, setPeriod] = useState('today');
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [liveWorkTime, setLiveWorkTime] = useState('');

  useEffect(() => {
      fetchAttendanceData();
  }, [period]);

  useEffect(() => {
      let intervalId;

      if (selectedUser && !selectedUser.logout_at) {
          intervalId = setInterval(() => {
              setLiveWorkTime(calculateWorkTime(selectedUser, true));
          }, 1000);
      }

      return () => {
          clearInterval(intervalId);
      };
  }, [selectedUser]);

  const fetchAttendanceData = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://10.10.101.193:5000/api/attendance?period=${period}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          // Ensure that login and logout times are converted to local timezone on frontend
          const dataWithLocalTime = response.data.map(record => ({
              ...record,
              login_at: formatDateToLocalString(record.login_at),
              logout_at: record.logout_at ? formatDateToLocalString(record.logout_at) : null,
          }));
          setAttendanceData(dataWithLocalTime);
      } catch (err) {
          setError('Failed to fetch attendance data');
      }
  };

  const handleUserClick = (record) => {
      setSelectedUser(record);
      if (record.logout_at) {
          setLiveWorkTime(calculateWorkTime(record));
      } else {
          setLiveWorkTime(calculateWorkTime(record, true));
      }
  };

  const closeModal = () => {
      setSelectedUser(null);
      setLiveWorkTime('');
  };

  const filteredData = attendanceData.filter(record => record.user_id !== 1);

  return (
      <div>
          <Sidebar />
          <div className='main-content'>
              <h2>Attendance Records</h2>
              <div className="period-buttons">
                  <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')}>Today</button>
                  <button className={period === 'yesterday' ? 'active' : ''} onClick={() => setPeriod('yesterday')}>Yesterday</button>
                  <button className={period === 'last_week' ? 'active' : ''} onClick={() => setPeriod('last_week')}>Last Week</button>
                  <button className={period === 'last_month' ? 'active' : ''} onClick={() => setPeriod('last_month')}>Last Month</button>
                  <button className={period === 'last_year' ? 'active' : ''} onClick={() => setPeriod('last_year')}>Last Year</button>
              </div>
              {error && <p className="error-message">{error}</p>}

              <table className="table">
                  <thead>
                      <tr>
                          <th>User Name</th>
                          <th>Login Time</th>
                          <th>Logout Time</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredData.length === 0 ? (
                          <tr>
                              <td colSpan="3">No attendance records found.</td>
                          </tr>
                      ) : (
                          filteredData.map((record) => (
                              <tr key={record.user_id} onClick={() => handleUserClick(record)}>
                                  <td>{record.name}</td>
                                  <td>{record.login_at}</td> {/* Login time already converted */}
                                  <td>{record.logout_at ? record.logout_at : 'Still logged in'}</td> {/* Logout time already converted */}
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>

              {selectedUser && (
                  <div className="modal show" onClick={(e) => { if (e.target.classList.contains('modal')) closeModal(); }}>
                      <div className="modal-content">
                          <h2>{selectedUser.name}'s Work Time</h2>
                          <p>Total Work Time: {selectedUser.logout_at ? calculateWorkTime(selectedUser) : liveWorkTime}</p>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Attendance;