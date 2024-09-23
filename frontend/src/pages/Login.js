import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode untuk memecahkan token
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk fitur show password
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [appInformation, setAppInformation] = useState(''); // Default value for version

  // Cek apakah user sudah login saat pertama kali halaman di-load
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode token untuk mendapatkan role
        const { role } = decoded;

        if (role === 'superadmin') {
          navigate('/superadmin');
        } else if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } catch (err) {
        console.error('Invalid token');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://10.10.101.34:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        // Decode token untuk mendapatkan role
        const decoded = jwtDecode(data.token);
        const { role } = decoded;

        if (role === 'superadmin') {
          navigate('/superadmin');
        } else if (role === 'admin') {
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

  // Fetch app Information
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://10.10.101.34:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          const appSetting = data.find((setting) => setting.id === 1); // Assuming the settings have id = 1
          setAppInformation(appSetting ? appSetting.information : '');
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

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
            <div className="label-container">
              <label>Password</label>
              <span
                className="show-hide-password"
                onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'} // Show or hide password
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

         {/* New Information Card */}
          <div className="info-card">
        <p>Information</p>
        <h5>{appInformation}</h5>
        </div>
      </div>
    </div>
  );
}

export default Login;
