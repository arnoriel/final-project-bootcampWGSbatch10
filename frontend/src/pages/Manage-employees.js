import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
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

  useEffect(() => {
      fetchEmployees();
  }, [searchQuery, currentPage, rowsPerPage]);

  const fetchEmployees = async () => {
    try {
        let response;

        if (searchQuery) {
            response = await axios.get('http://localhost:5000/api/search', {
                params: {
                    query: searchQuery,
                    role: 'employee' // Menambahkan role employee
                }
            });
            setEmployees(response.data || []);
        } else {
            response = await axios.get('http://localhost:5000/api/employees', {
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
          await axios.post('http://localhost:5000/api/register', formData);
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
      formData.append('department', editingEmployee.department);  // Tambahkan department di sini
      formData.append('image', editingEmployee.image);

      try {
          await axios.put(`http://localhost:5000/api/employees/${editingEmployee.id}`, formData);
          fetchEmployees();
          resetEditingEmployeeForm();
          setShowUpdateModal(false);
      } catch (error) {
          console.error(error);
      }
  };

  const deleteEmployee = async (id) => {
      try {
          await axios.delete(`http://localhost:5000/api/employees/${id}`);
          fetchEmployees();
      } catch (error) {
          console.error(error);
      }
  };

  const handleDeleteClick = (employee) => {
      setEmployeeToDelete(employee);
      setShowDeleteModal(true);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${employeeToDelete.id}`);
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
          imagePreview: `http://localhost:5000${employee.images}`,
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

  return (
    <div>
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
                            <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>}</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="user@example.com"
                                value={newEmployee.email}
                                onChange={(e) => handleInputChange(e, setNewEmployee)}
                                className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                            />
                            <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={newEmployee.phone}
                                onChange={(e) => handleInputChange(e, setNewEmployee)}
                                className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
                            />
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={newEmployee.department}
                                onChange={(e) => handleInputChange(e, setNewEmployee)}
                                className="form-control mb-2"
                            />
                            <label>Division</label>
                            <input
                                type="text"
                                name="division"
                                placeholder="Division"
                                value={newEmployee.division}
                                onChange={(e) => handleInputChange(e, setNewEmployee)}
                                className="form-control mb-2"
                            />
                            <label>Image</label>
                            {newEmployee.imagePreview && (  // Preview image
                                <div className="mb-2">
                                    <img src={newEmployee.imagePreview} alt="Preview" width="100" />
                                </div>
                            )}
                            <input
                                type="file"
                                name="image"
                                onChange={(e) => handleImageChange(e, setNewEmployee)}
                                className="form-control"
                                ref={newEmployeeImageRef}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => handleCancel('add')}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={addEmployee} disabled={errors.email || errors.phone}>Add Employee</button>
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
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={editingEmployee.name}
                                onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                className="form-control mb-2"
                            />
                            <label>Email  {errors.email && <span className="text-danger">{errors.email}</span>}</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={editingEmployee.email}
                                onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                            />
                            <label>Phone  {errors.phone && <span className="text-danger">{errors.phone}</span>}</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={editingEmployee.phone}
                                onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
                            />
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                value={editingEmployee.department}
                                onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                className="form-control mb-2"
                            />
                            <label>Division</label>
                            <input
                                type="text"
                                name="division"
                                placeholder="Division"
                                value={editingEmployee.division}
                                onChange={(e) => handleInputChange(e, setEditingEmployee)}
                                className="form-control mb-2"
                            />
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

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => handleCancel('update')}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={updateEmployee} disabled={errors.email || errors.phone}>Update Employee</button>
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
              <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this employee?</p>
                                <p><strong>{employeeToDelete?.name}</strong></p>
                                {deleteError && (
                                    <div className="alert alert-danger">
                                        {deleteError}
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
                                    <h5 className="modal-title">employee Information</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body d-flex">
                                    <img src={`http://localhost:5000${selectedEmployee.images}`} alt={selectedEmployee.name} style={{ width: '150px', height: '150px', objectFit: 'cover', marginRight: '20px' }} />
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
                                        src={`http://localhost:5000${employee.images}`}
                                        alt={employee.name}
                                        width="70"
                                        className="me-3"
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