import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Importing all the necessary components
import Login from './pages/Login';
import Forgot from './pages/Forgot';
import Superadmin from './pages/Superadmin';
import Admin from './pages/Admin';
import Employee from './pages/Employee';
import Welcome from './pages/Welcome';
import ManageAdmins from './pages/Manage-admins';
import ManageEmployees from './pages/Manage-employees';
import UserList from './pages/User-list';
import Attendance from './pages/Attendance';
import ErrorLog from './pages/Errorlog';
import Leave from './pages/Leave'; // Import the Leave component
import LeaveApproval from './pages/LeaveApproval';
import LeaveHistory from './pages/LeaveHistory';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
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
        <Route
          path="/manageemployees"
          element={
            <ProtectedRoute role={["superadmin", "admin"]}>
              <ManageEmployees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-list"
          element={
            <ProtectedRoute role={["superadmin", "admin", "employee"]}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/error-log"
          element={
            <ProtectedRoute role="superadmin">
              <ErrorLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute role={["superadmin", "admin", "employee"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route path="/leave" element={<Leave />} />
        <Route
          path="/leave-approval"
          element={
            <ProtectedRoute role={["superadmin", "admin"]}>
              <LeaveApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-history"
          element={
            <ProtectedRoute role={["superadmin", "admin", "employee"]}>
              <LeaveHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
