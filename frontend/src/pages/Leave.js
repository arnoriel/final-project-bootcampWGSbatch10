import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css'; // Custom CSS

const Leave = () => { 
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); // Email sekarang bisa diisi secara manual
    const [leaveType, setLeaveType] = useState('Choose Leave Type');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('Pending');
    const [admins, setAdmins] = useState([]);
    const [selectedSuperior, setSelectedSuperior] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false); // Track if user has submitted
    const [errorMessage, setErrorMessage] = useState('');

    // Check if leave was submitted today
    useEffect(() => {
        const lastSubmitDate = localStorage.getItem('leaveSubmitDate');
        const today = new Date().toLocaleDateString();

        if (lastSubmitDate === today) {
            setIsSubmitted(true);
            setErrorMessage('You have Submitted today.');
        }
    }, []);

    // Fetch admins and superadmins
    useEffect(() => {
        axios.get('http://10.10.101.34:5000/api/users?role=admin,superadmin')
            .then(response => {
                const filteredAdmins = response.data.filter(user => user.role !== 'employee');
                setAdmins(filteredAdmins);
            })
            .catch(error => {
                console.error('Error fetching admins:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Find the superior's email based on the selected superior's name
        const superiorEmail = admins.find(admin => admin.name === selectedSuperior)?.email;

        const leaveRequestData = {
            name,
            email,
            leave_type: leaveType,
            reason,
            status,
            superior_name: selectedSuperior,
            superior_email: superiorEmail,
        };

        try {
            const response = await axios.post('http://10.10.101.34:5000/api/leave-request', leaveRequestData);
            alert('Leave request submitted successfully!');

            // Store the current date in localStorage after successful submission
            const today = new Date().toLocaleDateString();
            localStorage.setItem('leaveSubmitDate', today);
            setIsSubmitted(true); // Disable button

            // Reset form fields
            setName('');
            setEmail(''); // Reset email to allow for future requests
            setLeaveType('Choose Leave Type');
            setReason('');
            setStatus('Pending');
            setSelectedSuperior('');
        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert('Failed to submit leave request. Please try again.');
        }
    };

    const isSuperiorDisabled = (admin) => {
        return admin.email === email; // Disable if admin's email matches the user's email
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
                            disabled={isSubmitted}
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
                            disabled={isSubmitted}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Leave Type</label>
                        <select
                            className="form-select"
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            required
                            disabled={isSubmitted}
                        >
                            <option value="Choose Leave Type" disabled>Choose Leave Type</option>
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
                            disabled={isSubmitted}
                        ></textarea>
                    </div>
                    <div className="form-group mb-3">
                        <label>Select Superior</label>
                        <select
                            className="form-select"
                            value={selectedSuperior}
                            onChange={(e) => setSelectedSuperior(e.target.value)}
                            required
                            disabled={isSubmitted}
                        >
                            <option value="">Choose Superior</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.name} disabled={isSuperiorDisabled(admin)}>
                                    {admin.name} ({admin.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitted}
                    >
                        {isSubmitted ? 'You have Submitted today.' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Leave;
