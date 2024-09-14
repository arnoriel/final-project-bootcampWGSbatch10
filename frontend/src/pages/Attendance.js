import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const calculateWorkTime = (user, isLive = false) => {
    const loginTime = new Date(user.login_at);
    const logoutTime = user.logout_at ? new Date(user.logout_at) : new Date();
    const diffInMs = logoutTime.getTime() - loginTime.getTime();
    const hours = Math.floor(diffInMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffInMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffInMs / 1000) % 60);
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};

const formatDateToLocalString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [period, setPeriod] = useState('today');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    const [liveWorkTime, setLiveWorkTime] = useState('');

    useEffect(() => {
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

    const fetchAttendanceData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://192.168.0.104:5000/api/attendance`, {
                params: { period, search, page, limit },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const dataWithLocalTime = response.data.attendance.map(record => ({
                ...record,
                login_at: formatDateToLocalString(record.login_at),
                logout_at: record.logout_at ? formatDateToLocalString(record.logout_at) : null,
            }));
            setAttendanceData(dataWithLocalTime);
            setTotal(response.data.total);
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

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value));
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    const filteredData = attendanceData.filter(record => record.user_id !== 1);

    return (
        <div>
            <Sidebar />
            <div className='main-content'>
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
                                    <td>{record.login_at}</td>
                                    <td>{record.logout_at ? record.logout_at : 'Still logged in'}</td>
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
