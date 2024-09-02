import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Pagination from 'react-bootstrap/Pagination';

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
    const [errors, setErrors] = useState({
        email: '',
        phone: ''
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [currentModal, setCurrentModal] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const newAdminImageRef = useRef(null);
    const editAdminImageRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPageOptions = [6, 11, 25, 50, 100];
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, [searchQuery, currentPage, rowsPerPage]);

    const fetchAdmins = async () => {
        try {
            let response;

            if (searchQuery) {
                response = await axios.get('http://localhost:5000/api/search', {
                    params: {
                        query: searchQuery
                    }
                });
                setAdmins(response.data || []); // Tambahkan fallback [] jika data kosong
            } else {
                response = await axios.get('http://localhost:5000/api/admins', {
                    params: {
                        page: currentPage,
                        limit: rowsPerPage
                    }
                });

                setAdmins(response.data.admins || []); // Tambahkan fallback [] jika data kosong
                setTotalPages(Math.ceil(response.data.total / rowsPerPage));
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
            setAdmins([]); // Set data kosong jika terjadi error
        }
    };


    const handleInputChange = (e, setState) => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }));

        if (name === 'email') {
            if (!value.includes('@')) {
                setErrors(prevErrors => ({ ...prevErrors, email: 'Email should be user@example.com' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, email: '' }));
            }
        }

        if (name === 'phone') {
            if (!value.startsWith('0') && !value.startsWith('+62')) {
                setErrors(prevErrors => ({ ...prevErrors, phone: 'Phone should be started with format 0 or +62' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, phone: '' }));
            }
        }
    };

    const handleImageChange = (e, setState) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setState(prevState => ({ ...prevState, image: file, imagePreview: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            setState(prevState => ({ ...prevState, image: null, imagePreview: null }));
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when rows per page changes
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const addAdmin = async () => {
        if (errors.email || errors.phone) return;

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
        if (errors.email || errors.phone) return;

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

    const handleDeleteClick = (admin) => {
        setAdminToDelete(admin);
        setShowDeleteModal(true);
    };

    const confirmDeleteAdmin = async () => {
        if (adminToDelete) {
            try {
                await axios.delete(`http://localhost:5000/api/admins/${adminToDelete.id}`);
                fetchAdmins();  // Refresh daftar admin
                setShowDeleteModal(false);  // Tutup modal setelah delete
            } catch (error) {
                console.error('Error deleting admin:', error);
            }
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
            imagePreview: `http://localhost:5000${admin.images}`,
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
        if (newAdminImageRef.current) newAdminImageRef.current.value = null;
    };

    const resetEditingAdminForm = () => {
        setEditingAdmin({ id: null, name: '', email: '', phone: '', division: '', image: null });
        if (editAdminImageRef.current) editAdminImageRef.current.value = null;
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
                                <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="user@example.com"
                                    value={newAdmin.email}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                                />
                                <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
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
                                    className="form-control"
                                    ref={newAdminImageRef}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('add')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={addAdmin} disabled={errors.email || errors.phone}>Add Admin</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Update Admin */}
                <div className={`modal fade ${showUpdateModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showUpdateModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Admin</h5>
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
                                <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={editingAdmin.email}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                                />
                                <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={editingAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
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
                                <label>Profile Picture</label>
                                {editingAdmin.imagePreview && (
                                    <div className="mt-2">
                                        <img src={editingAdmin.imagePreview} alt="Preview" className="img-thumbnail" style={{ maxWidth: '200px' }} />
                                    </div>
                                )}
                                <label>Change Profile Picture (Optional)</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setEditingAdmin)}
                                    className="form-control"
                                    ref={editAdminImageRef}
                                />

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('update')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={updateAdmin} disabled={errors.email || errors.phone}>Update Admin</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Discard Changes */}
                <div className={`modal fade ${showDiscardModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDiscardModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Discard Changes</h5>
                                <button type="button" className="btn-close" onClick={closeDiscardModal}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to discard the changes?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeDiscardModal}>No</button>
                                <button type="button" className="btn btn-primary" onClick={confirmDiscardChanges}>Yes</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Delete Confirmation */}
                <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this admin?</p>
                                <p><strong>{adminToDelete?.name}</strong></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDeleteAdmin}>Delete</button>
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
                <h5>Admin Lists</h5>

                <div className="mb-4">
                    <label>Rows per page: </label>
                    <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="form-select d-inline w-auto">
                        {rowsPerPageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <table className="table">
                    <tbody>
                        {admins.length > 0 ? admins.map((admin, index) => (
                            <tr key={admin.id} className="align-middle">
                                <td style={{ width: '100px' }}>
                                    <img
                                        src={`http://localhost:5000${admin.images}`}
                                        alt={admin.name}
                                        width="70"
                                        className="me-3"
                                        onClick={() => handleShowDetails(admin)}
                                    />
                                </td>
                                <td>
                                    <span onClick={() => handleShowDetails(admin)} style={{ cursor: 'pointer', color: 'black' }}>
                                        <strong>{admin.name}</strong> | {admin.division}
                                        <p>{admin.email}</p>
                                    </span>
                                </td>
                                <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={() => handleEditClick(admin)}
                                    >
                                        Edit
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteClick(admin)}>Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <Pagination className="justify-content-center">
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        </div>
    );
};

export default ManageAdmins;
