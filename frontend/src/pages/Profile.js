import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';
import './Profile.css'; // Import the new CSS file for profile-specific styles

function Profile() {
    const [user, setUser] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        department: '', 
        division: '', 
        image: '' 
    });
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Extract user ID from the token
            const { id } = JSON.parse(atob(token.split('.')[1]));

            axios.get(`http://10.10.101.34:5000/api/user/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            .then((response) => {
                setUser({
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone,
                    department: response.data.department,
                    division: response.data.division,
                    image: response.data.image || '/default-avatar.png', // Default avatar if no image
                });
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
            });
        } else {
            navigate('/login');  // Redirect to login if no token
        }
    }, [navigate]);

    const handlePasswordChange = () => {
        const token = localStorage.getItem('token');
        
        axios.post('http://10.10.101.34:5000/api/user/change-password', { newPassword }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            alert('Password changed successfully');
            setNewPassword('');
        })
        .catch((error) => {
            console.error('Error changing password:', error);
        });
    };

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <div className="profile-card">
                    {/* <img src={user.image} alt="User Profile" className="profile-image"></img> */}
                    <h2>{user.name}</h2>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                    <p>Department: {user.department}</p>
                    <p>Division: {user.division}</p>

                    {/* Form for changing password */}
                    <div className="password-change">
                        <h3>Change Password</h3>
                        <label>New Password:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                        <button onClick={handlePasswordChange}>Change Password</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
