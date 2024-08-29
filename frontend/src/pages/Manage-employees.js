import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './layouts/Sidebar';
import './layouts/MainContent.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageEmployees = () => {
    return (
      <div>
        <Sidebar />
        <div className="main-content">
          <h5>Manage Employees Page (Incoming)</h5>
          </div>
        </div>
    );
  };
  
  export default ManageEmployees;