import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperadminSB from './layouts/SuperadminSB'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        phone: '',
        division: '',
        password: '',
        image: null,
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admins');
            setAdmins(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin({ ...newAdmin, [name]: value });
    };

    const handleImageChange = (e) => {
        setNewAdmin({ ...newAdmin, image: e.target.files[0] });
    };

    const addAdmin = async () => {
        const formData = new FormData();
        formData.append('name', newAdmin.name);
        formData.append('email', newAdmin.email);
        formData.append('phone', newAdmin.phone);
        formData.append('division', newAdmin.division);
        formData.append('password', newAdmin.password);
        formData.append('role', 'admin');
        formData.append('image', newAdmin.image);

        try {
            await axios.post('http://localhost:5000/api/register', formData);
            fetchAdmins();
            setNewAdmin({ name: '', email: '', phone: '', division: '', password: '', image: null });
        } catch (error) {
            console.error(error);
        }
    };

    const updateAdmin = async (id) => {
        const formData = new FormData();
        formData.append('name', newAdmin.name);
        formData.append('email', newAdmin.email);
        formData.append('phone', newAdmin.phone);
        formData.append('division', newAdmin.division);
        formData.append('image', newAdmin.image);

        try {
            await axios.put(`http://localhost:5000/api/admins/${id}`, formData);
            fetchAdmins();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteAdmin = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admins/${id}`);
            fetchAdmins();
        } catch (error) {
            console.error(error);
        }
    };

return (
    <div>
        <h2>Manage Admins</h2>
        <SuperadminSB />
      <div className="main-content">
        <div>
            <input type="text" name="name" placeholder="Name" value={newAdmin.name} onChange={handleInputChange} />
            <input type="email" name="email" placeholder="Email" value={newAdmin.email} onChange={handleInputChange} />
            <input type="text" name="phone" placeholder="Phone" value={newAdmin.phone} onChange={handleInputChange} />
            <input type="text" name="division" placeholder="Division" value={newAdmin.division} onChange={handleInputChange} />
            <input type="password" name="password" placeholder="Password" value={newAdmin.password} onChange={handleInputChange} />
            <input type="file" name="image" onChange={handleImageChange} />
            <button onClick={addAdmin}>Add Admin</button>
        </div>

        <ul>
            {admins.map(admin => (
                <li key={admin.id}>
                    <img src={`http://localhost:5000${admin.images}`} alt={admin.name} width="50" />
                    <p>{admin.name} - {admin.email}</p>
                    <button onClick={() => updateAdmin(admin.id)}>Update</button>
                    <button onClick={() => deleteAdmin(admin.id)}>Delete</button>
                </li>
            ))}
        </ul>
    </div>
    </div>
);
};

export default ManageAdmins;
