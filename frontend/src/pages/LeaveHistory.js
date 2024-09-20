import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const LeaveHistory = () => {
    const [leaveHistory, setLeaveHistory] = useState([]);

    useEffect(() => {
        fetchLeaveHistory();
    }, []);

    const fetchLeaveHistory = async () => {
        try {
            const response = await axios.get('http://10.10.101.34:5000/api/leave-history'); // Ganti dengan URL API yang benar
            setLeaveHistory(response.data);
        } catch (error) {
            console.error('Error fetching leave history:', error);
            alert('Failed to fetch leave history. Please try again.');
        }
    };

    // Format untuk tanggal (hari, tanggal/bulan/tahun)
    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options); // Menggunakan locale 'id-ID' untuk format Indonesia
    };

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <h2>Leave History</h2>
                {leaveHistory.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Leave Type</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveHistory.map((leave) => (
                                <tr key={leave.id}>
                                    <td>{leave.name}</td>
                                    <td>{leave.email}</td>
                                    <td>{leave.leave_type}</td>
                                    <td>{leave.reason}</td>
                                    <td>{leave.status}</td>
                                    <td>{formatDate(leave.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No leave history found.</p>
                )}
            </div>
        </div>
    );
};

export default LeaveHistory;
