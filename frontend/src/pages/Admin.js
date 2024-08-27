// frontend/src/pages/Admin.js
import React from 'react';
import AdminSB from './layouts/AdminSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Admin() {
  return (
    <div>
      <AdminSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Admin</h1>
        {/* Tombol Logout dihapus dari sini */}
      </div>
    </div>
  );
}

export default Admin;
