import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperadminSB from './layouts/SuperadminSB'; // Import sidebar
import './layouts/MainContent.css'; // Import CSS untuk konten utama
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        phone: '',
        division: '',
        image: null,
    });

    const [showModal, setShowModal] = useState(false); // State untuk mengontrol modal

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
        formData.append('role', 'admin');
        formData.append('image', newAdmin.image);

        try {
            await axios.post('http://localhost:5000/api/register', formData);
            fetchAdmins();
            setNewAdmin({ name: '', email: '', phone: '', division: '', image: null });
            setShowModal(false); // Tutup modal setelah menambahkan admin
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
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    Add Admin
                </button>

                {/* Modal Bootstrap */}
                <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Admin</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={newAdmin.name}
                                    onChange={handleInputChange}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newAdmin.email}
                                    onChange={handleInputChange}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newAdmin.phone}
                                    onChange={handleInputChange}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="division"
                                    placeholder="Division"
                                    value={newAdmin.division}
                                    onChange={handleInputChange}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                    className="form-control mb-2"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={addAdmin}>
                                    Add Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ul>
                    {admins.map((admin) => (
                        <li key={admin.id}>
                            <img src={`http://localhost:5000${admin.images}`} alt={admin.name} width="50" />
                            <p>
                                {admin.name} - {admin.email}
                            </p>
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
