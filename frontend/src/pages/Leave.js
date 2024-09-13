import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css'; // Mengimpor CSS custom

const Leave = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [leaveType, setLeaveType] = useState('Choose Leave Type');
    const [reason, setReason] = useState('');
    const [superior, setSuperior] = useState('');
    const [superiors, setSuperiors] = useState([]);
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        const fetchSuperiors = async () => {
            try {
                const response = await axios.get('http://10.10.101.78:5000/api/superiors');
                setSuperiors(response.data);
            } catch (error) {
                console.error('Error fetching superiors:', error);
                alert('Failed to fetch superiors. Please try again.');
            }
        };

        fetchSuperiors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const leaveRequestData = {
            name,
            email,
            leave_type: leaveType,
            reason,
            superior,
            status,
        };

        try {
            const response = await axios.post('http://10.10.101.78:5000/api/leave-request', leaveRequestData);
            alert('Leave request submitted successfully!');
            // Clear form fields after submission
            setName('');
            setEmail('');
            setLeaveType('Choose Leave Type');
            setReason('');
            setSuperior('');
            setStatus('Pending');
        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert('Failed to submit leave request. Please try again.');
        }
    };

    return (
        <div className="container leave-container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Leave Request</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Leave Type</label>
                        <select
                            className="form-select"
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            required
                        >
                            <option value="Choose Leave Type" disabled>Choose Leave Type</option> {/* Placeholder */}
                            <option value="Sick">Sick</option>
                            <option value="Leave">Leave</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div className="form-group mb-3">
                        <label>Reason</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="form-group mb-4">
                        <label>Superior</label>
                        <select
                            className="form-select"
                            value={superior}
                            onChange={(e) => setSuperior(e.target.value)}
                            required
                        >
                            <option value="">Select Superior</option>
                            {superiors.length > 0 ? (
                                superiors.map(sup => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))
                            ) : (
                                <option value="">No superiors available</option>
                            )}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Leave;
