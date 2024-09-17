import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import axios from 'axios'; // Import axios
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode untuk memecahkan token

function Superadmin() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token); // Decode token untuk mendapatkan role
      const { role } = decoded;

      if (role !== 'superadmin') {
        // Jika role bukan superadmin, arahkan ke halaman login
        navigate('/login', { replace: true });
        return;
      }

      // Ambil data user dan leave requests jika role adalah superadmin
      axios.get('http://10.10.101.34:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setName(response.data.name);

        // Setelah mendapatkan nama superadmin, gunakan nama ini untuk mengambil leave request
        axios.get('http://10.10.101.34:5000/api/leave-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { role: 'superadmin', superior_name: response.data.name } // Kirim superior_name sebagai query
        })
        .then(response => {
          setLeaveRequests(response.data);
        })
        .catch(error => {
          console.error('Error fetching leave requests:', error);
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        navigate('/login', { replace: true });
      });
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
      params: { role: 'superadmin' }
    })
    .then(response => {
      setLeaveRequests(prevRequests =>
        prevRequests.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    })
    .catch(error => {
      console.error('Error updating leave request status:', error);
    });
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <h2>Welcome, {name}</h2>
        <br></br>
        <div className="card" style={{ width: '80%', padding: '10px' }}>
          <div className="card-body">
          <h3>Leave Requests</h3>
            {leaveRequests.length > 0 ? (
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
      </div>
    </div>
  );
}

export default Superadmin;
