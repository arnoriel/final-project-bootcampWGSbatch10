import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const calculateWorkTime = (user, isLive = false) => {
    const loginTime = new Date(user.login_at_original); // Use the original login date
    const logoutTime = user.logout_at_original ? new Date(user.logout_at_original) : new Date(); // Use the original logout date or current time if live
    const diffInMs = logoutTime.getTime() - loginTime.getTime();
    const hours = Math.floor(diffInMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffInMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffInMs / 1000) % 60);
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};

const formatDateToLocalString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [allAttendanceData, setAllAttendanceData] = useState([]);
    const [period, setPeriod] = useState('today');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [liveWorkTime, setLiveWorkTime] = useState('');
    const [allPage, setAllPage] = useState(1);
    const [allLimit, setAllLimit] = useState(10);
    const [allTotal, setAllTotal] = useState(0);

    useEffect(() => {
        setAttendanceData([]); // Reset the data when the period changes
        fetchAttendanceData();
    }, [period, search, page, limit]);

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

    useEffect(() => {
        fetchAttendanceData();
    }, [period, search, page, limit]);

    useEffect(() => {
        fetchAllAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://10.10.101.34:5000/api/attendance`, {
                params: { period, search, page, limit },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const dataWithLocalTime = response.data.attendance.map(record => ({
                ...record,
                login_at_original: new Date(record.login_at),
                logout_at_original: record.logout_at ? new Date(record.logout_at) : null,
                login_at: formatDateToLocalString(record.login_at),
                logout_at: record.logout_at ? formatDateToLocalString(record.logout_at) : null,
            }));

            setAttendanceData(dataWithLocalTime);
            setTotal(response.data.total);
        } catch (err) {
            setError('Failed to fetch attendance data');
        }
    };

    const fetchAllAttendanceData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://10.10.101.34:5000/api/attendance`, {
                params: { period: 'all', search: '', page: 1, limit: 1000 },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const dataWithLocalTime = response.data.attendance.map(record => ({
                ...record,
                login_at_original: new Date(record.login_at),
                logout_at_original: record.logout_at ? new Date(record.logout_at) : null,
                login_at: formatDateToLocalString(record.login_at),
                logout_at: record.logout_at ? formatDateToLocalString(record.logout_at) : null,
            }));

            setAllAttendanceData(dataWithLocalTime);
            setAllTotal(response.data.total);
        } catch (err) {
            setError('Failed to fetch all attendance data');
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

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value));
        setPage(1);
    };

    const handleAllLimitChange = (e) => {
        setAllLimit(parseInt(e.target.value));
        setAllPage(1);
    };

    const totalPages = Math.ceil(total / limit);
    const totalAllPages = Math.ceil(allTotal / allLimit);

    const filteredData = attendanceData.filter(record => record.user_id !== 1);

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <h2>Attendance Records</h2>
                <div className="search-pagination">
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={search}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <div className="period-buttons">
                    <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')}>Today</button>
                    <button className={period === 'yesterday' ? 'active' : ''} onClick={() => setPeriod('yesterday')}>Yesterday</button>
                    <button className={period === 'last_week' ? 'active' : ''} onClick={() => setPeriod('last_week')}>Last Week</button>
                    <button className={period === 'last_month' ? 'active' : ''} onClick={() => setPeriod('last_month')}>Last Month</button>
                    <button className={period === 'last_year' ? 'active' : ''} onClick={() => setPeriod('last_year')}>Last Year</button>
                </div>
                <p>Rows per page:
                    <select className="rows-per-page" value={limit} onChange={handleLimitChange}>
                        <option value={10}>10 rows</option>
                        <option value={20}>20 rows</option>
                        <option value={50}>50 rows</option>
                    </select>
                </p>
                {error && <p className="error-message">{error}</p>}

                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Name | Department</th>
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
                                    <td style={{ cursor: 'pointer' }}>{record.name} | {record.department}</td>
                                    <td style={{ cursor: 'pointer' }}>{record.login_at}</td>
                                    <td style={{ cursor: 'pointer' }}>{record.logout_at ? record.logout_at : 'Still logged in'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Next
                    </button>
                </div>

                {selectedUser && (
                    <div className="modal show" onClick={(e) => { if (e.target.classList.contains('modal')) closeModal(); }}>
                        <div className="modal-dialog-centered">
                            <div className="modal-content">
                                <h2>{selectedUser.name}'s Work Time</h2>
                                <p>Total Work Time: {selectedUser.logout_at ? calculateWorkTime(selectedUser) : liveWorkTime}</p>
                                <button className="close-button" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Attendance Data */}
                <h2>All Attendance Data</h2>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Login Time</th>
                            <th>Logout Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allAttendanceData
                            .filter(record => record.role !== 'superadmin')  // Filter out superadmin
                            .length === 0 ? (
                            <tr>
                                <td colSpan="3">No attendance records found.</td>
                            </tr>
                        ) : (
                            allAttendanceData
                                .filter(record => record.department !== 'superadmin')  // Filter out superadmin
                                .map((record) => (
                                    <tr key={record.user_id} onClick={() => handleUserClick(record)}>
                                        <td style={{ cursor: 'pointer' }}>{record.name} | {record.department}</td>
                                        <td style={{ cursor: 'pointer' }}>{record.login_at}</td>
                                        <td style={{ cursor: 'pointer' }}>{record.logout_at ? record.logout_at : 'Still logged in'}</td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default Attendance;
