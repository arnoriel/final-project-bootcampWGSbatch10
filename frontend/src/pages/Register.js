import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    division: '',
    images: null,
    role: 'employee' // Set default role ke 'employee'
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
    formData.append('role', form.role); // Tambahkan role ke formData

    try {
      const response = await fetch('http://localhost:5000/api/register', {
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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleRegisterChange} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleRegisterChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleRegisterChange} />
        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleRegisterChange} />
        <input type="text" name="division" placeholder="Division" value={form.division} onChange={handleRegisterChange} />
        <input type="file" name="images" accept="image/*" onChange={handleRegisterChange} />
        
        {/* Pilihan Role */}
        <select name="role" value={form.role} onChange={handleRegisterChange}>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
