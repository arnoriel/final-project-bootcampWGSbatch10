import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';
import './Attendance.css';  // Import CSS untuk modal

// Tambahkan logika menghitung total jam kerja secara live
const calculateWorkTime = (user, isLive = false) => {
    const loginTime = new Date(user.login_at);
    const logoutTime = user.logout_at ? new Date(user.logout_at) : new Date();  // Jika user belum logout, gunakan waktu saat ini
  
    const diffInMs = logoutTime - loginTime;
    const hours = Math.floor(diffInMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffInMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffInMs / 1000) % 60);
  
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
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
  
      // Jika ada user yang dipilih dan user belum logout, mulai hitung live
      if (selectedUser && !selectedUser.logout_at) {
        intervalId = setInterval(() => {
          setLiveWorkTime(calculateWorkTime(selectedUser, true));  // Perbarui waktu kerja secara live
        }, 1000);  // Update setiap detik
      }
  
      return () => {
        clearInterval(intervalId);  // Hentikan interval saat komponen di-unmount atau user logout
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
        setAttendanceData(response.data);
      } catch (err) {
        setError('Failed to fetch attendance data');
      }
    };
  
    const handleUserClick = (record) => {
      setSelectedUser(record);
      if (record.logout_at) {
        setLiveWorkTime(calculateWorkTime(record));  // Jika sudah logout, hitung sekali saja
      } else {
        setLiveWorkTime(calculateWorkTime(record, true));  // Jika belum logout, hitung secara live
      }
    };
  
    const closeModal = () => {
      setSelectedUser(null);  // Tutup modal
      setLiveWorkTime('');    // Reset waktu kerja live
    };
  
    const renderAttendanceRows = () => {
      const filteredData = attendanceData.filter(record => record.user_id !== 1);
  
      if (filteredData.length === 0) {
        return (
          <tr>
            <td colSpan="3">No attendance records found.</td>
          </tr>
        );
      }
  
      return filteredData.map((record) => (
        <tr key={record.user_id} onClick={() => handleUserClick(record)}>
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
              {renderAttendanceRows()}
            </tbody>
          </table>
  
          {/* Modal untuk menampilkan jam kerja user */}
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
