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
    const [editingAdminId, setEditingAdminId] = useState(null); // State untuk menyimpan ID admin yang sedang di-edit
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
            resetForm();
            setShowModal(false); // Tutup modal setelah menambahkan admin
        } catch (error) {
            console.error(error);
        }
    };

    const updateAdmin = async () => {
        const formData = new FormData();
        formData.append('name', newAdmin.name);
        formData.append('email', newAdmin.email);
        formData.append('phone', newAdmin.phone);
        formData.append('division', newAdmin.division);
        formData.append('image', newAdmin.image);

        try {
            await axios.put(`http://localhost:5000/api/admins/${editingAdminId}`, formData);
            fetchAdmins();
            resetForm();
            setShowModal(false); // Tutup modal setelah mengupdate admin
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

    const handleEditClick = (admin) => {
        setNewAdmin({
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            division: admin.division,
            image: null, // Kosongkan image, user bisa upload ulang jika ingin mengganti
        });
        setEditingAdminId(admin.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setNewAdmin({ name: '', email: '', phone: '', division: '', image: null });
        setEditingAdminId(null);
    };

    return (
        <div>
            <SuperadminSB />
            <div className="main-content">
                <h2>Manage Admins</h2>
                <button className="btn btn-primary mb-4" onClick={() => setShowModal(true)}>
                    Add Admin
                </button>

                {/* Modal Bootstrap */}
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingAdminId ? 'Update Admin' : 'Add New Admin'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
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
                                <button type="button" className="btn btn-primary" onClick={editingAdminId ? updateAdmin : addAdmin}>
                                    {editingAdminId ? 'Update Admin' : 'Add Admin'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ul className="list-group">
                    {admins.map((admin) => (
                        <li key={admin.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <img src={`http://localhost:5000${admin.images}`} alt={admin.name} width="50" className="me-3" />
                                <div>
                                    <p className="mb-1 fw-bold">{admin.name} | {admin.division}</p>
                                    <p className="mb-0">{admin.email}</p>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(admin)}>Update</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAdmin(admin.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManageAdmins;
