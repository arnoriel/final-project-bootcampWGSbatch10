import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const LeaveHistory = () => {
    const [leaveHistory, setLeaveHistory] = useState([]);  // Initialize as an empty array
    const [searchParams, setSearchParams] = useState({
        name: '',
        leave_type: '',
        created_at: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);  // Default to 6 items per page

    useEffect(() => {
        fetchLeaveHistory();
    }, [searchParams, currentPage, itemsPerPage]);  // Fetch on search params, page, or rows per page change

    const fetchLeaveHistory = async () => {
        try {
            const { name, leave_type, created_at } = searchParams;
            const queryParams = new URLSearchParams({ name, leave_type, created_at }).toString();
            const response = await axios.get(`http://10.10.101.34:5000/api/leave-history?${queryParams}`);
            setLeaveHistory(response.data || []);  // Ensure an empty array is set if no data is returned
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

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);  // Reset to the first page whenever the number of rows is changed
    };

    // Format for displaying date (day, month, year)
    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = leaveHistory.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination control
    const totalPages = Math.ceil(leaveHistory.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
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
                        />
                    </div>
                </form>

                {/* Rows per page selection */}
                <div className="form-group">
                    <label htmlFor="itemsPerPage">Show rows:</label>
                    <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="6">6</option>
                        <option value="11">11</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>

                {/* Leave History Table */}
                {currentItems.length > 0 ? (
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
                            {currentItems.map((leave) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                className={index + 1 === currentPage ? 'active' : ''}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveHistory;
