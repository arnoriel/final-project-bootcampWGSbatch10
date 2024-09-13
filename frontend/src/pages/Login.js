import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cek apakah user sudah login saat pertama kali halaman di-load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      if (role === 'superadmin') {
        navigate('/superadmin');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://10.10.101.78:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        if (data.role === 'superadmin') {
          navigate('/superadmin');
        } else if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  // Function to navigate to the Leave page
  const handleLeaveClick = () => {
    navigate('/leave');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        {error && (
          <div className="danger-card">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="auth-form">
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
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
          <p>
            <a href="/forgot">Forgot Password?</a>
          </p>
        </form>
        
        {/* New button for Leave page */}
        <button className="leave-button" onClick={handleLeaveClick}>
          Apply for Leave
        </button>
      </div>
    </div>
  );
}

export default Login;
