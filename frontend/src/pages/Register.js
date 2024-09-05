import React, { useState } from 'react';
import './Auth.css'; // Tambahkan CSS untuk styling

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    division: '',
    images: null,
    role: 'employee'
  });

  const handleRegisterChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm({
        ...form,
        [name]: files[0]
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('phone', form.phone);
    formData.append('division', form.division);
    formData.append('image', form.images);
    formData.append('role', form.role);

    try {
      const response = await fetch('http://10.10.101.169:5000/api/register', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="Enter your name" 
            value={form.name} 
            onChange={handleRegisterChange} 
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Enter your email" 
            value={form.email} 
            onChange={handleRegisterChange} 
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleRegisterChange} 
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input 
            type="text" 
            name="phone" 
            placeholder="Enter your phone number" 
            value={form.phone} 
            onChange={handleRegisterChange} 
            required
          />
        </div>
        <div className="form-group">
          <label>Division</label>
          <input 
            type="text" 
            name="division" 
            placeholder="Enter your division" 
            value={form.division} 
            onChange={handleRegisterChange} 
            required
          />
        </div>
        <div className="form-group">
          <label>Profile Image</label>
          <input 
            type="file" 
            name="images" 
            accept="image/*" 
            onChange={handleRegisterChange} 
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select 
            name="role" 
            value={form.role} 
            onChange={handleRegisterChange}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>
    </div>
  );
}

export default Register;
