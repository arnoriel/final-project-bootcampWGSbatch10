import React, { useEffect, useState } from 'react';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';

const Errorlog = () => {
    const [errorLogs, setErrorLogs] = useState([]);

    useEffect(() => {
        // Fetch error logs from backend
        const fetchErrorLogs = async () => {
            try {
                const response = await fetch('http://10.10.101.193:5000/api/error-logs');
                const data = await response.json();
                setErrorLogs(data);
            } catch (error) {
                console.error('Error fetching error logs:', error);
            }
        };

        fetchErrorLogs();
    }, []);

    return (
        <div>
            <Sidebar />
            <div className='main-content'>
            <h1>Error Logs</h1>
            <table>
                <thead>
                    <tr>
                        <th>Error Message</th>
                        <th>Endpoint</th>
                        <th>Stack Trace</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {errorLogs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.error_message}</td>
                            <td>{log.endpoint}</td>
                            <td>{log.stack_trace}</td>
                            <td>{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default Errorlog;
