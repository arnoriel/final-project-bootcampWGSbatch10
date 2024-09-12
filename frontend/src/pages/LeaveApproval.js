import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css'

const LeaveApproval = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const role = localStorage.getItem('role'); // Fetch the role from local storage

    useEffect(() => {
        if (role === 'admin' || role === 'superadmin') {
            fetchLeaveRequests();
        }
    }, [role]);

    const fetchLeaveRequests = async () => {
        try {
            const response = await axios.get(`http://10.10.101.193:5000/api/leave-requests?role=${role}`);
            setLeaveRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            alert('Failed to fetch leave requests. Please try again.');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://10.10.101.193:5000/api/leave-requests/${id}?role=${role}`, { status: newStatus });
            alert(`Leave request ${newStatus.toLowerCase()} successfully!`);
            fetchLeaveRequests(); // Refresh the leave requests
        } catch (error) {
            console.error('Error updating leave request:', error);
            alert('Failed to update leave request. Please try again.');
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content">
            <h2>Leave Approval</h2>
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
        </div>
        </div>
    );
};

export default LeaveApproval;
