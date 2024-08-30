import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [currentModal, setCurrentModal] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);


    // Use ref to access the file input element
    const newAdminImageRef = useRef(null);
    const editAdminImageRef = useRef(null);

    useEffect(() => {
        fetchAdmins();
    }, [searchQuery]);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/search', {
                params: { query: searchQuery }
            });
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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setState(prevState => ({ ...prevState, image: file, imagePreview: reader.result })); // Set preview
            };
            reader.readAsDataURL(file);
        } else {
            setState(prevState => ({ ...prevState, image: null, imagePreview: null }));
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
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
            image: admin.images,
            imagePreview: `http://localhost:5000${admin.images}`, // Set initial image preview
        });
        setShowUpdateModal(true);
        setCurrentModal('update');
    };

    const handleShowDetails = (admin) => {
        setSelectedAdmin(admin);
        setShowDetailModal(true);
    };

    const resetNewAdminForm = () => {
        setNewAdmin({ name: '', email: '', phone: '', division: '', image: null });
        if (newAdminImageRef.current) {
            newAdminImageRef.current.value = null;
        }
    };

    const resetEditingAdminForm = () => {
        setEditingAdmin({ id: null, name: '', email: '', phone: '', division: '', image: null });
        if (editAdminImageRef.current) {
            editAdminImageRef.current.value = null;
        }
    };

    const handleCancel = (modalType) => {
        setCurrentModal(modalType);
        setShowDiscardModal(true);
    };

    const confirmDiscardChanges = () => {
        setShowDiscardModal(false);
        if (currentModal === 'add') {
            resetNewAdminForm();
            setShowAddModal(false);
        } else if (currentModal === 'update') {
            resetEditingAdminForm();
            setShowUpdateModal(false);
        }
    };

    const closeDiscardModal = () => {
        setShowDiscardModal(false);
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <h2>Manage Admins</h2>
                <button className="btn btn-primary mb-4" onClick={() => { setShowAddModal(true); setCurrentModal('add'); }}>
                    Add Admin
                </button>
                <input
                    type="text"
                    placeholder="Search by name, email, phone, or division"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="form-control mb-4"
                />

                {/* Modal Add Admin */}
                <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showAddModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Admin</h5>
                                <button type="button" className="btn-close" onClick={() => handleCancel('add')}></button>
                            </div>
                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={newAdmin.name}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newAdmin.email}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Division</label>
                                <input
                                    type="text"
                                    name="division"
                                    placeholder="Division"
                                    value={newAdmin.division}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Image</label>
                                {newAdmin.imagePreview && (  // Tambahkan ini untuk preview image
                                    <div className="mb-2">
                                        <img src={newAdmin.imagePreview} alt="Preview" width="100" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                    ref={newAdminImageRef}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('add')}>
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
                                <button type="button" className="btn-close" onClick={() => handleCancel('update')}></button>
                            </div>
                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={editingAdmin.name}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={editingAdmin.email}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={editingAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Division</label>
                                <input
                                    type="text"
                                    name="division"
                                    placeholder="Division"
                                    value={editingAdmin.division}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                />
                                <label>Profie Picture</label>
                                {editingAdmin.imagePreview && (
                                    <div className="mb-2">
                                        <img src={editingAdmin.imagePreview} alt="Preview" width="100" />
                                    </div>
                                )}
                                <label>Update Image (optional if needed)</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                    ref={editAdminImageRef}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('update')}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={updateAdmin}>
                                    Update Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedAdmin && (
                    <div
                        className={`modal fade ${showDetailModal ? 'show d-block' : ''}`}
                        tabIndex="-1"
                        style={{ backgroundColor: showDetailModal ? 'rgba(0,0,0,0.5)' : '' }}
                        onClick={() => setShowDetailModal(false)}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Admin Information</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body d-flex">
                                    <img src={`http://localhost:5000${selectedAdmin.images}`} alt={selectedAdmin.name} style={{ width: '150px', height: '150px', objectFit: 'cover', marginRight: '20px' }} />
                                    <div>
                                        <p><strong>Name:</strong> {selectedAdmin.name}</p>
                                        <p><strong>Email:</strong> {selectedAdmin.email}</p>
                                        <p><strong>Phone:</strong> {selectedAdmin.phone}</p>
                                        <p><strong>Division:</strong> {selectedAdmin.division}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Modal Discard Changes Confirmation */}
                <div className={`modal fade ${showDiscardModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDiscardModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Discard Changes?</h5>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to discard the changes?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeDiscardModal}>
                                    No
                                </button>
                                <button type="button" className="btn btn-primary" onClick={confirmDiscardChanges}>
                                    Yes, Discard Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ul className="list-group">
                    {admins.map((admin) => (
                        <li key={admin.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <img
                                    src={`http://localhost:5000${admin.images}`}
                                    alt={admin.name}
                                    width="50"
                                    className="me-3"
                                    onClick={() => handleShowDetails(admin)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div onClick={() => handleShowDetails(admin)} style={{ cursor: 'pointer' }}>
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
