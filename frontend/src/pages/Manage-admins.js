import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SuperadminSB from './layouts/SuperadminSB';
import './layouts/MainContent.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        phone: '',
        division: '',
        image: null,
    });
    const [editingAdmin, setEditingAdmin] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        division: '',
        image: null,
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Use ref to access the file input element
    const newAdminImageRef = useRef(null);

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

    const handleInputChange = (e, setState) => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleImageChange = (e, setState) => {
        setState(prevState => ({ ...prevState, image: e.target.files[0] }));
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
            resetNewAdminForm();
            setShowAddModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const updateAdmin = async () => {
        const formData = new FormData();
        formData.append('name', editingAdmin.name);
        formData.append('email', editingAdmin.email);
        formData.append('phone', editingAdmin.phone);
        formData.append('division', editingAdmin.division);
        formData.append('image', editingAdmin.image);

        try {
            await axios.put(`http://localhost:5000/api/admins/${editingAdmin.id}`, formData);
            fetchAdmins();
            resetEditingAdminForm();
            setShowUpdateModal(false);
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
        setEditingAdmin({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            division: admin.division,
            image: null,
        });
        setShowUpdateModal(true);
    };

    const resetNewAdminForm = () => {
        setNewAdmin({ name: '', email: '', phone: '', division: '', image: null });
        if (newAdminImageRef.current) {
            newAdminImageRef.current.value = null; // Clear the file input
        }
    };

    const resetEditingAdminForm = () => {
        setEditingAdmin({ id: null, name: '', email: '', phone: '', division: '', image: null });
    };

    return (
        <div>
            <SuperadminSB />
            <div className="main-content">
                <h2>Manage Admins</h2>
                <button className="btn btn-primary mb-4" onClick={() => setShowAddModal(true)}>
                    Add Admin
                </button>

                {/* Modal Add Admin */}
                <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showAddModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Admin</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={newAdmin.name}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newAdmin.email}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="division"
                                    placeholder="Division"
                                    value={newAdmin.division}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                    ref={newAdminImageRef} // Add the ref here
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={addAdmin}>
                                    Add Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Update Admin */}
                <div className={`modal fade ${showUpdateModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showUpdateModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Admin</h5>
                                <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={editingAdmin.name}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={editingAdmin.email}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={editingAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="text"
                                    name="division"
                                    placeholder="Division"
                                    value={editingAdmin.division}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={updateAdmin}>
                                    Update Admin
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
                                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(admin)}>
                                    Edit
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteAdmin(admin.id)}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default ManageAdmins;
