import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get('http://10.10.101.169:5000/api/attendance');
                setAttendanceData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
                setError('Failed to fetch attendance data');
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <Sidebar />
            <div className='main-content'>
            <h1>Attendance</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((entry) => (
                        <tr key={entry.user_id}>
                            <td>{entry.name}</td>
                            <td>{entry.time_in ? new Date(entry.time_in).toLocaleString() : '-'}</td>
                            <td>{entry.time_out ? new Date(entry.time_out).toLocaleString() : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default Attendance;