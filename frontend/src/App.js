// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import Register from './pages/Register';
import Login from './pages/Login';
import Forgot from './pages/Forgot';
import Superadmin from './pages/Superadmin';
import Admin from './pages/Admin';
import Employee from './pages/Employee';
import Welcome from './pages/Welcome';
import ManageAdmins from './pages/Manage-admins';
import ManageEmployees from './pages/Manage-employees';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/superadmin" element={<Superadmin />} />
        <Route path="/admin" element={<Admin />} />
       
        <Route path="/employee" element={<Employee />} />
        <Route 
          path="/manageadmins" 
          element={
            <ProtectedRoute role="superadmin">
              <ManageAdmins />
            </ProtectedRoute>
          } 
        />
        <Route path="/manageemployees" element={<ManageEmployees />} />
      </Routes>
    </Router>
  );
}

export default App;
