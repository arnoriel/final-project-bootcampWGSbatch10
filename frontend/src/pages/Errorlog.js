import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';

const ErrorLogsPage = () => {
    const [errorLogs, setErrorLogs] = useState([]);

    useEffect(() => {
        const fetchErrorLogs = async () => {
            try {
                const response = await axios.get('http://10.10.101.34:5000/api/error-logs');
                setErrorLogs(response.data);
            } catch (error) {
                console.error('Failed to fetch error logs:', error);
            }
        };

        fetchErrorLogs();
    }, []);

    return (
        <div>
            <Header />
            <Sidebar />
            <div className='main-content'>
                <h2>Error Logs</h2>
                {errorLogs.length === 0 ? (
                    <p>No error logs available.</p>
                ) : (
                    <table className='error-logs-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Message</th>
                                <th>Stack Trace</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errorLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.id}</td>
                                    <td>{log.message}</td>
                                    <td>{log.stack_trace}</td>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ErrorLogsPage;
