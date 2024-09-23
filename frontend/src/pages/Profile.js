import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';
import './Profile.css'; // Import the new CSS file for profile-specific styles

function Profile() {
    const [user, setUser] = useState({ name: '', image: '', role: '', password: '' });
    const [editMode, setEditMode] = useState(false); // Controls whether the form is in edit mode
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.get('http://10.10.101.34:5000/api/user', {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          .then((response) => {
            setUser({
              name: response.data.name,
              image: response.data.images ? `http://10.10.101.34:5000${response.data.images}` : '/assets/default.jpg',
            });
          })
          .catch((error) => {
            console.error('Error fetching profile:', error);
          });
        }
      }, []);      

    const handleUpdate = () => {
        const token = localStorage.getItem('token');
        const updatedData = { name: user.name, image: user.image, password: newPassword };

        axios.put('http://10.10.101.34:5000/api/user/update', updatedData, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                alert('Profile updated successfully');
                setEditMode(false);
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
            });
    };

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <h2>User Profile</h2>
                <img src={user.image} alt="User Profile" className="profile-image" />
                {editMode ? (
                    <>
                        {user.role === 'superadmin' && (
                            <>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                />
                                <label>Image URL:</label>
                                <input
                                    type="text"
                                    value={user.image}
                                    onChange={(e) => setUser({ ...user, image: e.target.value })}
                                />
                            </>
                        )}
                        <label>Password:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                        />
                        <button onClick={handleUpdate}>Save Changes</button>
                    </>
                ) : (
                    <>
                        <p>Name: {user.name}</p>
                        {user.role !== 'employee' && (
                            <button onClick={() => setEditMode(true)}>Edit Profile</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;
