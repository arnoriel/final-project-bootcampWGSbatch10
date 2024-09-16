import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css'; // Mengimpor CSS custom

const Leave = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [leaveType, setLeaveType] = useState('Choose Leave Type');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('Pending');
    const [admins, setAdmins] = useState([]); // State untuk menyimpan data admin dan superadmin
    const [selectedSuperior, setSelectedSuperior] = useState(''); // State untuk menyimpan superior yang dipilih

    // Mengambil data admin dan superadmin dari backend
    useEffect(() => {
        axios.get('http://192.168.0.104:5000/api/users?role=admin,superadmin')
            .then(response => {
                setAdmins(response.data); // Simpan data admin dan superadmin di state
            })
            .catch(error => {
                console.error('Error fetching admins:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const superiorEmail = admins.find(admin => admin.name === selectedSuperior)?.email; // Cari email berdasarkan superior yang dipilih

        const leaveRequestData = {
            name,
            email,
            leave_type: leaveType,
            reason,
            status,
            superior_name: selectedSuperior, // Masukkan superior yang dipilih
            superior_email: superiorEmail // Masukkan email superior
        };

        try {
            const response = await axios.post('http://192.168.0.104:5000/api/leave-request', leaveRequestData);
            alert('Leave request submitted successfully!');
            // Clear form fields after submission
            setName('');
            setEmail('');
            setLeaveType('Choose Leave Type');
            setReason('');
            setStatus('Pending');
            setSelectedSuperior(''); // Reset superior
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
                        ></textarea>
                    </div>
                    <div className="form-group mb-3">
                        <label>Select Superior</label>
                        <select
                            className="form-select"
                            value={selectedSuperior}
                            onChange={(e) => setSelectedSuperior(e.target.value)}
                            required
                        >
                            <option value="">Choose Superior</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.name}>
                                    {admin.name} ({admin.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Leave;
