import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    FirstName: user.FirstName,
    LastName: user.LastName,
    UserName: user.UserName,
    Phone: user.Phone,
    Age: user.Age,
    Gender: user.Gender,
    UTR: user.UTR,
    Signature: user.Signature || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container profile-page">
      <h1>My Profile</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label>First Name</label>
              <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="input-group">
            <label>Username</label>
            <input type="text" name="UserName" value={formData.UserName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" name="Phone" value={formData.Phone} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Age</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Gender</label>
              <select name="Gender" value={formData.Gender} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="input-group">
              <label>UTR</label>
              <input type="number" name="UTR" value={formData.UTR} onChange={handleChange} step="0.1" required />
            </div>
          </div>
          <div className="input-group">
            <label>Signature</label>
            <input type="text" name="Signature" value={formData.Signature} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
