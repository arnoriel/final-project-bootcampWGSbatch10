// frontend/src/pages/Employee.js
import React from 'react';
import EmployeeSB from './layouts/EmployeeSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Employee() {
  return (
    <div>
      <EmployeeSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Employee</h1>
        {/* Tombol Logout dihapus dari sini */}
      </div>
    </div>
  );
}

export default Employee;
