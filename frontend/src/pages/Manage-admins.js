import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
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
        department: '',  // Tambahkan department di sini
        image: null,
    });
    const [editingAdmin, setEditingAdmin] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        division: '',
        department: '',  // Tambahkan department di sini
        image: null,
    });
    const [errors, setErrors] = useState({
        email: '',
        phone: '',
        duplicateEmail: false,
        duplicatePhone: false,
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
    const [deleteError, setDeleteError] = useState('');
    const [editError, setEditError] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, [searchQuery, currentPage, rowsPerPage]);

    const fetchAdmins = async () => {
        try {
            let response;

            if (searchQuery) {
                response = await axios.get('http://10.10.101.34:5000/api/search', {
                    params: {
                        query: searchQuery,
                        role: 'admin' // Menambahkan role admin
                    }
                });
                setAdmins(response.data || []);
            } else {
                response = await axios.get('http://10.10.101.34:5000/api/admins', {
                    params: {
                        page: currentPage,
                        limit: rowsPerPage
                    }
                });

                setAdmins(response.data.admins || []);
                setTotalPages(Math.ceil(response.data.total / rowsPerPage));
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
            setAdmins([]);
        }
    };

    const checkDuplicate = async (field, value, currentEmail = '', currentPhone = '') => {
        try {
            // Jika email/phone yang dimasukkan adalah milik sendiri, jangan cek duplikat
            if ((field === 'email' && value === currentEmail) || (field === 'phone' && value === currentPhone)) {
                return false;  // Tidak dianggap sebagai duplikat
            }

            const response = await axios.post('http://10.10.101.34:5000/api/check-duplicate', {
                email: field === 'email' ? value : '',
                phone: field === 'phone' ? value : ''
            });

            return response.data.exists;  // Return apakah ada duplikat
        } catch (error) {
            console.error('Error checking duplicate:', error);
            return false;
        }
    };

    const handleInputChange = async (e, setState, currentEmail = '', currentPhone = '') => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }));

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrors(prevErrors => ({ ...prevErrors, email: 'Email should be in format user@domain.com' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, email: '' }));
                const isDuplicate = await checkDuplicate('email', value, currentEmail); // Kirim currentEmail untuk validasi
                if (isDuplicate) {
                    setErrors(prevErrors => ({ ...prevErrors, duplicateEmail: 'Email already registered' }));
                } else {
                    setErrors(prevErrors => ({ ...prevErrors, duplicateEmail: '' }));
                }
            }
        }

        if (name === 'phone') {
            const phoneStartsWith = value.startsWith('0') || value.startsWith('+62');
            const phoneLengthValid = value.length >= 11 && value.length <= 13;
            const phoneRegex = /^[0-9]+$/;

            if (!phoneStartsWith) {
                setErrors(prevErrors => ({ ...prevErrors, phone: 'Phone should start with 0 or +62' }));
            } else if (!phoneLengthValid) {
                setErrors(prevErrors => ({ ...prevErrors, phone: 'Phone should be between 11 and 13 digits' }));
            } else if (!phoneRegex.test(value.replace('+62', ''))) {
                setErrors(prevErrors => ({ ...prevErrors, phone: 'Phone should contain only digits' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, phone: '' }));
                const isDuplicate = await checkDuplicate('phone', value, currentPhone); // Kirim currentPhone untuk validasi
                if (isDuplicate) {
                    setErrors(prevErrors => ({ ...prevErrors, duplicatePhone: 'Phone already registered' }));
                } else {
                    setErrors(prevErrors => ({ ...prevErrors, duplicatePhone: '' }));
                }
            }
        }
    };

    const isFormValid = () => {
        // Check that all fields are filled and no errors exist
        return (
            newAdmin.name &&
            newAdmin.email &&
            newAdmin.phone &&
            newAdmin.department &&
            newAdmin.division &&
            newAdmin.image &&
            !errors.email &&
            !errors.phone &&
            !errors.duplicateEmail &&
            !errors.duplicatePhone
        );
    };

    const handleImageChange = (e, setState) => {
        const file = e.target.files[0];

        if (file) {
            // Check if the file type is an image (jpg, jpeg, png)
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                setErrors(prevErrors => ({ ...prevErrors, image: 'Only JPG, JPEG, and PNG formats are allowed' }));
                setState(prevState => ({ ...prevState, image: null, imagePreview: null }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setState(prevState => ({ ...prevState, image: file, imagePreview: reader.result }));
                setErrors(prevErrors => ({ ...prevErrors, image: '' })); // Clear any previous errors
            };
            reader.readAsDataURL(file);
        } else {
            setState(prevState => ({ ...prevState, image: null, imagePreview: null }));
            setErrors(prevErrors => ({ ...prevErrors, image: '' })); // Reset errors when no file is selected
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
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
        formData.append('department', newAdmin.department);  // Tambahkan department di sini
        formData.append('role', 'admin');
        formData.append('image', newAdmin.image);

        try {
            await axios.post('http://10.10.101.34:5000/api/register', formData);
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
        formData.append('department', editingAdmin.department);  // Tambahkan department di sini
        formData.append('image', editingAdmin.image);

        try {
            await axios.put(`http://10.10.101.34:5000/api/admins/${editingAdmin.id}`, formData);
            fetchAdmins();
            resetEditingAdminForm();
            setShowUpdateModal(false);
            setEditError('');  // Reset error message
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setEditError('Cannot edit user while online');
            } else {
                console.error(error);
            }
        }
    };

    const deleteAdmin = async (id) => {
        try {
            await axios.delete(`http://10.10.101.34:5000/api/admins/${id}`);
            fetchAdmins();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteClick = (admin) => {
        setAdminToDelete(admin);
        setShowDeleteModal(true);
        setDeleteError('');
    };

    const confirmDeleteAdmin = async () => {
        if (adminToDelete) {
            try {
                await axios.delete(`http://10.10.101.34:5000/api/admins/${adminToDelete.id}`);
                fetchAdmins();
                setShowDeleteModal(false);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    setDeleteError('Cannot delete user while online');
                } else {
                    console.error('Error deleting employee:', error);
                }
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
            department: admin.department,  // Tambahkan department di sini
            image: admin.images,
            imagePreview: `http://10.10.101.34:5000${admin.images}`,
        });
        setShowUpdateModal(true);
        setCurrentModal('update');
    };

    const handleShowDetails = (admin) => {
        setSelectedAdmin(admin);
        setShowDetailModal(true);
    };

    const resetNewAdminForm = () => {
        setNewAdmin({ name: '', email: '', phone: '', division: '', department: '', image: null });
        if (newAdminImageRef.current) newAdminImageRef.current.value = null;
    };

    const resetEditingAdminForm = () => {
        setEditingAdmin({ id: null, name: '', email: '', phone: '', division: '', department: '', image: null });
        if (editAdminImageRef.current) editAdminImageRef.current.value = null;
    };

    const handleCancel = (modalType) => {
        setCurrentModal(modalType);
        setShowDiscardModal(true);

        // Reset error messages
        setDeleteError('');
        setEditError('');
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

    const departments = {
        IT: ['System Administration', 'IT Support Management', 'Data Security'],
        HR: ['Recruitment & Talent Acquisition', 'Payroll & Benefits Administration', 'Employee Relations', 'Training & Development'],
        Finance: ['Accounting & Reporting', 'Budgeting & Forecasting', 'Tax Compliance', 'Accounts Payable & Receivable'],
        Operations: ['Project Management', 'Supply Chain Management', 'Vendor & Contract Management'],
        Legal: ['Corporate Compliance', 'Contracts & Negotiations', 'Risk Management']
    };

    const handleDepartmentChange = (e, setAdmin) => {
        const { name, value } = e.target;
        setAdmin(prevState => ({
            ...prevState,
            [name]: value,
            division: ''  // Reset division when department changes
        }));
    };

    const isDivisionDisabled = (admin) => !admin.department;

    return (
        <div>
            <Header />
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

                {/* Modal add Admin */}
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

                                <label>Email {errors.email && <span className="text-danger">{errors.email}</span>} {errors.duplicateEmail && <span className="text-danger">{errors.duplicateEmail}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="user@example.com"
                                    value={newAdmin.email}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className={`form-control mb-2 ${errors.email || errors.duplicateEmail ? 'is-invalid' : ''}`}
                                />

                                <label>Phone {errors.phone && <span className="text-danger">{errors.phone}</span>} {errors.duplicatePhone && <span className="text-danger">{errors.duplicatePhone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className={`form-control mb-2 ${errors.phone || errors.duplicatePhone ? 'is-invalid' : ''}`}
                                />

                                <label>Department</label>
                                <select
                                    name="department"
                                    value={newAdmin.department}
                                    onChange={(e) => handleDepartmentChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                >
                                    <option value="">Select Department</option>
                                    {Object.keys(departments).map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                <label>Division</label>
                                <select
                                    name="division"
                                    value={newAdmin.division}
                                    onChange={(e) => handleInputChange(e, setNewAdmin)}
                                    className="form-control mb-2"
                                    disabled={isDivisionDisabled(newAdmin)}
                                >
                                    <option value="">Select Division</option>
                                    {newAdmin.department &&
                                        departments[newAdmin.department].map((div) => (
                                            <option key={div} value={div}>{div}</option>
                                        ))
                                    }
                                </select>
                                <label>Image</label>
                                {newAdmin.imagePreview && (  // Show image preview
                                    <div className="mb-2">
                                        <img src={newAdmin.imagePreview} alt="Preview" width="100" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setNewAdmin)}
                                    className={`form-control mb-2 ${errors.image ? 'is-invalid' : ''}`}
                                    ref={newAdminImageRef}
                                />
                                {errors.image && <span className="text-danger">{errors.image}</span>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('add')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={addAdmin} disabled={!isFormValid()}>Add Admin</button>
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
                                {editError && (
                                    <div className="alert alert-danger">
                                        {editError}
                                    </div>
                                )}
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={editingAdmin.name}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin, editingAdmin.email, editingAdmin.phone)} // Kirim currentEmail dan currentPhone
                                    className="form-control mb-2"
                                />
                                <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>} {errors.duplicateEmail && <span className="text-danger">{errors.duplicateEmail}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={editingAdmin.email}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin, editingAdmin.email, editingAdmin.phone)} // Kirim currentEmail dan currentPhone
                                    className={`form-control mb-2 ${errors.email || errors.duplicateEmail ? 'is-invalid' : ''}`}
                                />

                                <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}  {errors.duplicatePhone && <span className="text-danger">{errors.duplicatePhone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={editingAdmin.phone}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin, editingAdmin.email, editingAdmin.phone)} // Kirim currentEmail dan currentPhone
                                    className={`form-control mb-2 ${errors.phone || errors.duplicatePhone ? 'is-invalid' : ''}`}
                                />


                                <label>Department</label>
                                <select
                                    name="department"
                                    value={editingAdmin.department}
                                    onChange={(e) => handleDepartmentChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                >
                                    <option value="">Select Department</option>
                                    {Object.keys(departments).map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                <label>Division</label>
                                <select
                                    name="division"
                                    value={editingAdmin.division}
                                    onChange={(e) => handleInputChange(e, setEditingAdmin)}
                                    className="form-control mb-2"
                                    disabled={isDivisionDisabled(editingAdmin)}
                                >
                                    <option value="">Select Division</option>
                                    {editingAdmin.department &&
                                        departments[editingAdmin.department].map((div) => (
                                            <option key={div} value={div}>{div}</option>
                                        ))
                                    }
                                </select>

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
                                {errors.image && <span className="text-danger">{errors.image}</span>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('update')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={updateAdmin} disabled={errors.email || errors.phone || errors.duplicateEmail || errors.duplicatePhone}>Update Admin</button>
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
                                {deleteError && (
                                    <div className="alert alert-danger d-flex justify-content-between">
                                        <span>{deleteError}</span>
                                        <button type="button" className="btn-close btn-sm" onClick={() => setDeleteError('')}></button>
                                    </div>
                                )}
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
                                    <img src={`http://10.10.101.34:5000${selectedAdmin.images}`} alt={selectedAdmin.name} style={{ width: '150px', height: '150px', objectFit: 'cover', marginRight: '20px' }} />
                                    <div>
                                        <p><strong>Name:</strong> {selectedAdmin.name}</p>
                                        <p><strong>Email:</strong> {selectedAdmin.email}</p>
                                        <p><strong>Phone:</strong> {selectedAdmin.phone}</p>
                                        <p><strong>Deparment:</strong> {selectedAdmin.department}</p>
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
                                        src={`http://10.10.101.34:5000${admin.images}`}
                                        alt={admin.name}
                                        width="100"
                                        height="100"
                                        className="me-3"
                                        style={{ objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => handleShowDetails(admin)}
                                    />
                                </td>
                                <td>
                                    <span onClick={() => handleShowDetails(admin)} style={{ cursor: 'pointer', color: 'black' }}>
                                        <strong>{admin.name}</strong> | {admin.department}
                                        <p>{admin.email}</p>
                                    </span>
                                </td>
                                <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={() => handleEditClick(admin)}>
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