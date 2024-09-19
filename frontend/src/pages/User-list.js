import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(6); // Default rows per page

    useEffect(() => {
        const fetchUsersAndStatus = async () => {
            try {
                const [usersResponse, statusResponse] = await Promise.all([
                    axios.get('http://10.10.101.34:5000/api/users'),
                    axios.get('http://10.10.101.34:5000/api/users/status')
                ]);

                const usersData = usersResponse.data;
                const statusData = statusResponse.data;

                const usersWithStatus = usersData.map(user => {
                    const statusInfo = statusData.find(status => status.id === user.id);
                    return { ...user, status: statusInfo ? statusInfo.status : 'offline' };
                });

                const filteredUsers = usersWithStatus.filter(user => user.role !== 'superadmin');

                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users or status:', error);
            }
        };

        fetchUsersAndStatus();
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to the first page on search
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const filteredUsers = users
        .filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (a.status === 'online' && b.status !== 'online') return -1;
            if (a.status !== 'online' && b.status === 'online') return 1;
            return 0;
        });

    // Calculate paginated data
    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1); // Reset to the first page when rows per page changes
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <h2>User List</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
                />
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="rows-per-page">Rows per page:</label>
                    <select
                        id="rows-per-page"
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value={6}>6</option>
                        <option value={11}>11</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <table>
                    <tbody>
                        {currentUsers.length > 0 ? currentUsers.map((user) => (
                            <tr key={user.id} className="align-middle">
                                <td style={{ width: '100px' }}>
                                    <img
                                        src={`http://10.10.101.34:5000${user.images}`}
                                        alt={user.name}
                                        width="100"
                                        height="100"
                                        className="me-3"
                                        style={{ objectFit: 'cover',  cursor: 'pointer' }}
                                        onClick={() => handleUserClick(user)}
                                    />
                                </td>
                                <td>
                                    <span
                                        style={{ cursor: 'pointer', color: 'black' }}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <strong>{user.name}</strong> | {user.department}
                                        <p>{user.email}</p>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: user.status === 'online' ? 'lime' : 'gray',
                                            borderRadius: '50%',
                                            marginRight: '5px'
                                        }}></span>
                                        <span>{user.status}</span>
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>

                {selectedUser && (
                    <div
                        className={`modal fade ${showDetailModal ? 'show d-block' : ''}`}
                        tabIndex="-1"
                        style={{ backgroundColor: showDetailModal ? 'rgba(0,0,0,0.5)' : '' }}
                        onClick={() => setShowDetailModal(false)}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">User Information</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body d-flex">
                                    <img src={`http://10.10.101.34:5000${selectedUser.images}`} alt={selectedUser.name} style={{ width: '150px', height: '150px', objectFit: 'cover', marginRight: '20px' }} />
                                    <div>
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                        <p><strong>Department:</strong> {selectedUser.department}</p>
                                        <p><strong>Division:</strong> {selectedUser.division}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
