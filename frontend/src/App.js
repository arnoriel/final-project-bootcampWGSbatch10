// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Superadmin from './pages/Superadmin';
import Admin from './pages/Admin';
import Employee from './pages/Employee';
import Welcome from './pages/Welcome'; // Import halaman Welcome

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} /> {/* Ubah rute "/" ke halaman Welcome */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin" element={<Superadmin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee" element={<Employee />} />
      </Routes>
    </Router>
  );
}

export default App;
