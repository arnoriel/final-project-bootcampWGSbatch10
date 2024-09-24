import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const LeaveHistory = () => {
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [searchParams, setSearchParams] = useState({
        name: '',
        leave_type: '',
        created_at: ''
    });

    // Fetch leave history when searchParams change
    useEffect(() => {
        fetchLeaveHistory();
    }, [searchParams]);

    const fetchLeaveHistory = async () => {
        try {
            const { name, leave_type, created_at } = searchParams;
            const queryParams = new URLSearchParams({ name, leave_type, created_at }).toString();
            const response = await axios.get(`http://10.10.101.34:5000/api/leave-history?${queryParams}`);
            setLeaveHistory(response.data);
        } catch (error) {
            console.error('Error fetching leave history:', error);
            alert('Failed to fetch leave history. Please try again.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const handleClearSearch = () => {
        setSearchParams({
            name: '',
            leave_type: '',
            created_at: ''
        });
    };

    // Format for displaying date (day, month, year)
    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <h2>Leave History</h2>

                {/* Search form */}
                <form className="search-form">
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={searchParams.name}
                            onChange={handleSearchChange}
                            placeholder="Search by name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="leave_type">Leave Type:</label>
                        <select
                            id="leave_type"
                            name="leave_type"
                            value={searchParams.leave_type}
                            onChange={handleSearchChange}
                        >
                            <option value="">All</option>
                            <option value="Leave">Leave</option>
                            <option value="Sick">Sick</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
        <br></br>
                    <div className="form-group">
                        <label htmlFor="created_at">Date Search:</label>
                        <input
                            type="date"
                            id="created_at"
                            name="created_at"
                            value={searchParams.created_at}
                            onChange={handleSearchChange}
                            placeholder=''
                        />
                    </div>

                </form>

                {/* Leave History Table */}
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
