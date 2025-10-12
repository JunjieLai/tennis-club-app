import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrophy } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    UserName: '',
    Email: '',
    MPassword: '',
    confirmPassword: '',
    Phone: '',
    Age: '',
    Gender: 'Male',
    UTR: '',
    Signature: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.MPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.UTR < 0 || formData.UTR > 16) {
      toast.error('UTR must be between 0 and 16');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <FaTrophy className="auth-icon" />
          <h2>Join Tennis Club</h2>
          <p>Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              maxLength="10"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="MPassword"
                value={formData.MPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Age</label>
              <input
                type="number"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Gender</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="input-group">
              <label>UTR (0-16)</label>
              <input
                type="number"
                name="UTR"
                value={formData.UTR}
                onChange={handleChange}
                min="0"
                max="16"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Signature (Optional)</label>
            <input
              type="text"
              name="Signature"
              value={formData.Signature}
              onChange={handleChange}
              maxLength="50"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
