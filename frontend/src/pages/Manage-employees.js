import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import './layouts/MainContent.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Pagination from 'react-bootstrap/Pagination';

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        phone: '',
        division: '',
        department: '',  // Tambahkan department di sini
        image: null,
    });
    const [editingEmployee, setEditingEmployee] = useState({
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
        phone: ''
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [currentModal, setCurrentModal] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const newEmployeeImageRef = useRef(null);
    const editEmployeeImageRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPageOptions = [6, 11, 25, 50, 100];
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [editError, setEditError] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, [searchQuery, currentPage, rowsPerPage]);

    const fetchEmployees = async () => {
        try {
            let response;

            if (searchQuery) {
                response = await axios.get('http://10.10.101.34:5000/api/search', {
                    params: {
                        query: searchQuery,
                        role: 'employee' // Menambahkan role employee
                    }
                });
                setEmployees(response.data || []);
            } else {
                response = await axios.get('http://10.10.101.34:5000/api/employees', {
                    params: {
                        page: currentPage,
                        limit: rowsPerPage
                    }
                });

                setEmployees(response.data.employees || []);
                setTotalPages(Math.ceil(response.data.total / rowsPerPage));
            }

        } catch (error) {
            console.error('Error fetching employee data:', error);
            setEmployees([]);
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
            newEmployee.name &&
            newEmployee.email &&
            newEmployee.phone &&
            newEmployee.department &&
            newEmployee.division &&
            newEmployee.image &&
            !errors.email &&
            !errors.phone &&
            !errors.duplicateEmail &&
            !errors.duplicatePhone
        );
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
        setCurrentPage(1);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const addEmployee = async () => {
        if (errors.email || errors.phone) return;

        const formData = new FormData();
        formData.append('name', newEmployee.name);
        formData.append('email', newEmployee.email);
        formData.append('phone', newEmployee.phone);
        formData.append('division', newEmployee.division);
        formData.append('department', newEmployee.department);  // Tambahkan department di sini
        formData.append('role', 'employee');
        formData.append('image', newEmployee.image);

        try {
            await axios.post('http://10.10.101.34:5000/api/register', formData);
            fetchEmployees();
            resetNewEmployeeForm();
            setShowAddModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const updateEmployee = async () => {
        if (errors.email || errors.phone) return;

        const formData = new FormData();
        formData.append('name', editingEmployee.name);
        formData.append('email', editingEmployee.email);
        formData.append('phone', editingEmployee.phone);
        formData.append('division', editingEmployee.division);
        formData.append('department', editingEmployee.department);
        formData.append('image', editingEmployee.image);

        try {
            await axios.put(`http://10.10.101.34:5000/api/employees/${editingEmployee.id}`, formData);
            fetchEmployees();
            resetEditingEmployeeForm();
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

    const deleteEmployee = async (id) => {
        try {
            await axios.delete(`http://10.10.101.34:5000/api/employees/${id}`);
            fetchEmployees();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setShowDeleteModal(true);
        setDeleteError('');
    };

    const confirmDeleteEmployee = async () => {
        if (employeeToDelete) {
            try {
                await axios.delete(`http://10.10.101.34:5000/api/employees/${employeeToDelete.id}`);
                fetchEmployees();
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

    const handleEditClick = (employee) => {
        setEditingEmployee({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            division: employee.division,
            department: employee.department,  // Tambahkan department di sini
            image: employee.images,
            imagePreview: `http://10.10.101.34:5000${employee.images}`,
        });
        setShowUpdateModal(true);
        setCurrentModal('update');
    };

    const handleShowDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };

    const resetNewEmployeeForm = () => {
        setNewEmployee({ name: '', email: '', phone: '', division: '', department: '', image: null });
        if (newEmployeeImageRef.current) newEmployeeImageRef.current.value = null;
    };

    const resetEditingEmployeeForm = () => {
        setEditingEmployee({ id: null, name: '', email: '', phone: '', division: '', department: '', image: null });
        if (editEmployeeImageRef.current) editEmployeeImageRef.current.value = null;
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
            resetNewEmployeeForm();
            setShowAddModal(false);
        } else if (currentModal === 'update') {
            resetEditingEmployeeForm();
            setShowUpdateModal(false);
        }
    };


    const closeDiscardModal = () => {
        setShowDiscardModal(false);
    };

    const departments = {
        IT: ['Software Development', 'Network Engineering', 'Technical Support'],
        UIUX: ['User Interface Design', 'User Experience Research', 'Prototyping'],
        Marketing: ['Content Creation', 'SEO', 'Social Media Management'],
        Sales: ['Business Development', 'Account Management', 'Lead Generation'],
        CS: ['Customer Service', 'Technical Support', 'Client Onboarding']
    };

    const handleDepartmentChange = (e, setAdmin) => {
        const { name, value } = e.target;
        setAdmin(prevState => ({
            ...prevState,
            [name]: value,
            division: ''  // Reset division when department changes
        }));
    };

    const isDivisionDisabled = (employee) => !employee.department;

    return (
        <div>
            <Header />
            <Sidebar />
            <div className="main-content">
                <h2>Manage Employees</h2>
                <button className="btn btn-primary mb-4" onClick={() => { setShowAddModal(true); setCurrentModal('add'); }}>
                    Add Employee
                </button>
                <input
                    type="text"
                    placeholder="Search by name, email, phone, or division"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="form-control mb-4"
                />

                {/* Modal Add Employee */}
                <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showAddModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Employee</h5>
                                <button type="button" className="btn-close" onClick={() => handleCancel('add')}></button>
                            </div>
                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={newEmployee.name}
                                    onChange={(e) => handleInputChange(e, setNewEmployee)}
                                    className="form-control mb-2"
                                />

                                <label>Email {errors.email && <span className="text-danger">{errors.email}</span>} {errors.duplicateEmail && <span className="text-danger">{errors.duplicateEmail}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="user@example.com"
                                    value={newEmployee.email}
                                    onChange={(e) => handleInputChange(e, setNewEmployee)}
                                    className={`form-control mb-2 ${errors.email || errors.duplicateEmail ? 'is-invalid' : ''}`}
                                />

                                <label>Phone {errors.phone && <span className="text-danger">{errors.phone}</span>} {errors.duplicatePhone && <span className="text-danger">{errors.duplicatePhone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={newEmployee.phone}
                                    onChange={(e) => handleInputChange(e, setNewEmployee)}
                                    className={`form-control mb-2 ${errors.phone || errors.duplicatePhone ? 'is-invalid' : ''}`}
                                />

                                <label>Department</label>
                                <select
                                    name="department"
                                    value={newEmployee.department}
                                    onChange={(e) => handleDepartmentChange(e, setNewEmployee)}
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
                                    value={newEmployee.division}
                                    onChange={(e) => handleInputChange(e, setNewEmployee)}
                                    className="form-control mb-2"
                                    disabled={isDivisionDisabled(newEmployee)}
                                >
                                    <option value="">Select Division</option>
                                    {newEmployee.department &&
                                        departments[newEmployee.department].map((div) => (
                                            <option key={div} value={div}>{div}</option>
                                        ))
                                    }
                                </select>

                                <label>Image</label>
                                {newEmployee.imagePreview && (  // Show image preview
                                    <div className="mb-2">
                                        <img src={newEmployee.imagePreview} alt="Preview" width="100" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setNewEmployee)}
                                    className={`form-control mb-2 ${errors.image ? 'is-invalid' : ''}`}
                                    ref={newEmployeeImageRef}
                                />
                                {errors.image && <span className="text-danger">{errors.image}</span>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('add')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={addEmployee} disabled={!isFormValid()}>Add Employee</button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Modal Update Employee */}
                <div className={`modal fade ${showUpdateModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showUpdateModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Employee</h5>
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
                                    value={editingEmployee.name}
                                    onChange={(e) => handleInputChange(e, setEditingEmployee, editingEmployee.email, editingEmployee.phone)} // Kirim currentEmail dan currentPhone
                                    className="form-control mb-2"
                                />
                                <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>} {errors.duplicateEmail && <span className="text-danger">{errors.duplicateEmail}</span>}</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={editingEmployee.email}
                                    onChange={(e) => handleInputChange(e, setEditingEmployee, editingEmployee.email, editingEmployee.phone)} // Kirim currentEmail dan currentPhone
                                    className={`form-control mb-2 ${errors.email || errors.duplicateEmail ? 'is-invalid' : ''}`}
                                />

                                <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}  {errors.duplicatePhone && <span className="text-danger">{errors.duplicatePhone}</span>}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={editingEmployee.phone}
                                    onChange={(e) => handleInputChange(e, setEditingEmployee, editingEmployee.email, editingEmployee.phone)} // Kirim currentEmail dan currentPhone
                                    className={`form-control mb-2 ${errors.phone || errors.duplicatePhone ? 'is-invalid' : ''}`}
                                />

                                <label>Department</label>
                                <select
                                    name="department"
                                    value={editingEmployee.department}
                                    onChange={(e) => handleDepartmentChange(e, setEditingEmployee)}
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
                                    value={editingEmployee.division}
                                    onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                    className="form-control mb-2"
                                    disabled={isDivisionDisabled(editingEmployee)}
                                >
                                    <option value="">Select Division</option>
                                    {editingEmployee.department &&
                                        departments[editingEmployee.department].map((div) => (
                                            <option key={div} value={div}>{div}</option>
                                        ))
                                    }
                                </select>

                                <label>Profile Picture</label>
                                {editingEmployee.imagePreview && (
                                    <div className="mt-2">
                                        <img src={editingEmployee.imagePreview} alt="Preview" className="img-thumbnail" style={{ maxWidth: '200px' }} />
                                    </div>
                                )}

                                <label>Change Profile Picture (Optional)</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleImageChange(e, setEditingEmployee)}
                                    className="form-control"
                                    ref={editEmployeeImageRef}
                                />
                                {errors.image && <span className="text-danger">{errors.image}</span>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => handleCancel('update')}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={updateEmployee} disabled={errors.email || errors.phone || errors.duplicateEmail || errors.duplicatePhone}>Update Employee</button>
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

                {/* Modal Confirm Delete */}
                <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : '' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this employee?</p>
                                <p><strong>{employeeToDelete?.name}</strong></p>
                                {deleteError && (
                                    <div className="alert alert-danger d-flex justify-content-between">
                                        <span>{deleteError}</span>
                                        <button type="button" className="btn-close btn-sm" onClick={() => setDeleteError('')}></button>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDeleteEmployee}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>


                {selectedEmployee && (
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
                                    <h5 className="modal-title">Employee Information</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body d-flex">
                                    <img src={`http://10.10.101.34:5000${selectedEmployee.images}`} alt={selectedEmployee.name} style={{ width: '150px', height: '150px', objectFit: 'cover', marginRight: '20px' }} />
                                    <div>
                                        <p><strong>Name:</strong> {selectedEmployee.name}</p>
                                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                                        <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
                                        <p><strong>Deparment:</strong> {selectedEmployee.department}</p>
                                        <p><strong>Division:</strong> {selectedEmployee.division}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h5>Employee Lists</h5>

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
                        {employees.length > 0 ? employees.map((employee, index) => (
                            <tr key={employee.id} className="align-middle">
                                <td style={{ width: '100px' }}>
                                    <img
                                        src={`http://10.10.101.34:5000${employee.images}`}
                                        alt={employee.name}
                                        width="100"
                                        height="100"
                                        className="me-3"
                                        style={{ objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => handleShowDetails(employee)}
                                    />
                                </td>
                                <td>
                                    <span onClick={() => handleShowDetails(employee)} style={{ cursor: 'pointer', color: 'black' }}>
                                        <strong>{employee.name}</strong> | {employee.department}
                                        <p>{employee.email}</p>
                                    </span>
                                </td>
                                <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                                    <button
                                        className="btn btn-primary me-2"
                                        onClick={() => handleEditClick(employee)}
                                    >
                                        Edit
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteClick(employee)}>Delete</button>
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
export default ManageEmployees;