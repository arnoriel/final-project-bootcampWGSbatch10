import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import axios from 'axios'; // Import axios

function Superadmin() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Jika token tidak ada, arahkan ke login
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Fetch nama pengguna dari backend
    axios.get('http://192.168.0.104:5000/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setName(response.data.name);
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      navigate('/login', { replace: true });
    });

    // Fetch leave requests for approval
    axios.get('http://192.168.0.104:5000/api/leave-requests', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { role: 'superadmin' } // Menyesuaikan role admin
    })
    .then(response => {
      setLeaveRequests(response.data);
    })
    .catch(error => {
      console.error('Error fetching leave requests:', error);
    });

    // Cleanup
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

    axios.put(`http://192.168.0.104:5000/api/leave-requests/${id}`, { status: newStatus }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { role: 'superadmin' } // Role admin
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
        <h3>Leave Requests</h3>
        <ul>
        {leaveRequests.length > 0 ? (
                <table className="table">
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
                                    <button className="btn btn-success" onClick={() => handleStatusChange(request.id, 'Approved')}>
                                        Approve
                                    </button>
                                    <button className="btn btn-danger ms-2" onClick={() => handleStatusChange(request.id, 'Declined')}>
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
        </ul>
      </div>
    </div>
  );
}

export default Superadmin;
