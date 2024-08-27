// frontend/src/pages/Employee.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeSB from './layouts/EmployeeSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Employee() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div>
      <EmployeeSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Employee</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Employee;
