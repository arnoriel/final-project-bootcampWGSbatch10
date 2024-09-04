import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import { Table } from 'react-bootstrap';

const ErrorLog = () => {
    const [errorLogs, setErrorLogs] = useState([]);

    useEffect(() => {
        // Fetch error logs from the server
        axios.get('/api/error-logs')
            .then(response => {
                setErrorLogs(response.data);
            })
            .catch(error => {
                console.error('Error fetching error logs:', error);
            });
    }, []);

    return (
        <div>
            <Sidebar />
            <div className='main-content'>
            <h2>Error Logs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Error Message</th>
                        <th>Endpoint</th>
                        <th>Stack Trace</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {errorLogs.map(log => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.error_message}</td>
                            <td>{log.endpoint}</td>
                            <td>{log.stack_trace}</td>
                            <td>{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
        </div>
    );
};

export default ErrorLog;
