// frontend/src/pages/Superadmin.js
import React from 'react';
import SuperadminSB from './layouts/SuperadminSB'; // import sidebar yang sudah dibuat
import './layouts/MainContent.css'; // import CSS untuk konten utama

function Superadmin() {
  return (
    <div>
      <SuperadminSB /> {/* Memanggil Sidebar */}
      <div className="main-content">
        <h1>Welcome, Superadmin</h1>
        {/* Tombol Logout dihapus dari sini */}
      </div>
    </div>
  );
}

export default Superadmin;
