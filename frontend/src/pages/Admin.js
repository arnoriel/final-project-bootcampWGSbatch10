import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import Header from './layouts/Header';
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import AttendanceChart from '../components/AttendanceChart';
import axios from 'axios'; // Import axios
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode untuk memecahkan token

function Admin() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token); // Decode token untuk mendapatkan role
      const { role } = decoded;

      if (role !== 'admin') {
        navigate('/login', { replace: true });
        return;
      }

      // Ambil data user dan leave requests jika role adalah Admin
      axios.get('http://10.10.101.34:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setName(response.data.name);

        // Setelah mendapatkan nama Admin, gunakan nama ini untuk mengambil leave request
        return axios.get('http://10.10.101.34:5000/api/leave-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { role: 'admin', superior_name: response.data.name } // Kirim superior_name sebagai query
        });
      })
      .then(response => {
        setLeaveRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching leave requests:', error);
        setError('Failed to load leave requests.');
      })
      .finally(() => setLoading(false));

    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login', { replace: true });
    }

    // Cegah user kembali ke halaman setelah logout dengan menonaktifkan tombol back
    window.history.replaceState(null, null, window.location.href);
    const handlePopState = () => {
      if (!localStorage.getItem('token')) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleStatusChange = (id, newStatus) => {
    const token = localStorage.getItem('token');

    axios.put(`http://10.10.101.34:5000/api/leave-requests/${id}`, { status: newStatus }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { role: 'admin' }
    })
    .then(response => {
      setLeaveRequests(prevRequests =>
        prevRequests.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    })
    .catch(error => {
      console.error('Error updating leave request status:', error);
      setError('Failed to update leave request status.');
    });
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="main-content">
        <h2>Welcome, {name}</h2>
        <br />
        <div className="card" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd' }}>
          <div className="card-body">
            <h3>Leave Requests</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : leaveRequests.length > 0 ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.email}</td>
                      <td>{request.leave_type}</td>
                      <td>{request.reason}</td>
                      <td>{request.status}</td>
                      <td>
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(request.id, 'Approved')}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm ms-2" onClick={() => handleStatusChange(request.id, 'Declined')}>
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No pending leave requests found.</p>
            )}
          </div>
        </div>

             {/* Attendance Charts */}
        <div className="card mt-4">
          <div className="card-body">
            <h3>Attendance Overview</h3>
            <AttendanceChart period="today" />
            <AttendanceChart period="yesterday" />
            <AttendanceChart period="last_week" />
            <AttendanceChart period="last_month" />
            <AttendanceChart period="last_year" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;
