import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Forgot() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setError('');
      } else {
        setError(data.message);
        setMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {message && (
          <div className="success-card">
            {message}
          </div>
        )}
        {error && (
          <div className="danger-card">
            {error}
          </div>
        )}
        <form onSubmit={handleForgotPassword} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="auth-button">Reset Password</button>
          <p>
            <a href="/login">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Forgot;
