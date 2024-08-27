// frontend/src/pages/Welcome.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  return (
    <div className="welcome-container">
      <h1>MyOffice</h1>
      <p>Login Here to Start.</p>
      <div className="welcome-buttons">
        <Link to="/login" className="welcome-button">Login</Link>
        {/* <Link to="/register" className="welcome-button">Register</Link> */}
      </div>
    </div>
  );
}

export default Welcome;
