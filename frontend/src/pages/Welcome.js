import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  return (
    <div className="welcome-container">
      <div className="welcome-overlay"></div>
      <div className="welcome-content">
        <h1>Welcome to MyOffice</h1>
        <p>Your workspace, simplified.</p>
        <div className="welcome-buttons">
          <Link to="/login" className="welcome-button">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
