import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaTrophy, FaClock, FaPercent, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [performancePeriod, setPerformancePeriod] = useState('week'); // week, month, quarter
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Age: '',
    Gender: ''
  });

  useEffect(() => {
    fetchData();
  }, [performancePeriod]);

  const fetchData = async () => {
    try {
      const [statsRes, matchesRes] = await Promise.all([
        api.get(`/members/${user.MEID}/stats`),
        api.get(`/matches/member/${user.MEID}?status=history&period=${performancePeriod}`)
      ]);

      setStats(statsRes.data.stats);

      // Calculate performance data for chart
      const matches = matchesRes.data.matches || [];
      const chartData = calculatePerformanceData(matches, performancePeriod);
      setPerformanceData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceData = (matches, period) => {
    if (matches.length === 0) return [];

    const sortedMatches = [...matches].sort((a, b) =>
      new Date(a.DateOfMatch) - new Date(b.DateOfMatch)
    );

    // Group matches by day
    const matchesByDay = {};
    sortedMatches.forEach(match => {
      const dateKey = new Date(match.DateOfMatch).toDateString();
      if (!matchesByDay[dateKey]) {
        matchesByDay[dateKey] = [];
      }
      matchesByDay[dateKey].push(match);
    });

    // Calculate cumulative win rate at the end of each day
    let cumulativeWins = 0;
    let cumulativeTotal = 0;
    const dailyData = [];

    Object.keys(matchesByDay).sort((a, b) => new Date(a) - new Date(b)).forEach(dateKey => {
      const dayMatches = matchesByDay[dateKey];

      // Count wins and total for this day
      dayMatches.forEach(match => {
        cumulativeTotal++;
        if (match.WinnerMEID === user.MEID) {
          cumulativeWins++;
        }
      });

      // Calculate win rate at end of day
      const winRate = ((cumulativeWins / cumulativeTotal) * 100).toFixed(1);
      const date = new Date(dateKey);

      let dateLabel;
      if (period === 'week') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'month') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      dailyData.push({
        date: dateLabel,
        winRate: parseFloat(winRate),
        matchesOnDay: dayMatches.length
      });
    });

    return dailyData;
  };

  const handleOpenEditModal = () => {
    setEditForm({
      FirstName: user?.FirstName || '',
      LastName: user?.LastName || '',
      Email: user?.Email || '',
      Phone: user?.Phone || '',
      Age: user?.Age || '',
      Gender: user?.Gender || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/members/${user.MEID}`, editForm);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        updateUser(response.data.member);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-left">
            <div className="avatar-container" onClick={handleOpenEditModal}>
              <img
                src={user?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.UserName}`}
                alt={user?.UserName}
                className="profile-avatar-large"
              />
              <div className="avatar-overlay">
                <span>Edit Profile</span>
              </div>
            </div>
            <h2 className="profile-username">{user?.UserName}</h2>
            <p className="profile-fullname">{user?.FirstName} {user?.LastName}</p>
          </div>

          <div className="profile-right">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <FaBirthdayCake className="info-icon" />
                <div>
                  <span className="info-label">Age</span>
                  <span className="info-value">{user?.Age} years</span>
                </div>
              </div>

              <div className="profile-info-item">
                <FaVenusMars className="info-icon" />
                <div>
                  <span className="info-label">Gender</span>
                  <span className="info-value">{user?.Gender}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.Email}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <FaPhone className="info-icon" />
                <div>
                  <span className="info-label">Phone</span>
                  <span className="info-value">{user?.Phone}</span>
                </div>
              </div>

              <div className="profile-info-item highlight">
                <FaTrophy className="info-icon" />
                <div>
                  <span className="info-label">UTR Rating</span>
                  <span className="info-value utr">{user?.UTR?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card wins">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>{stats?.wins || 0}</h3>
              <p>Total Wins</p>
            </div>
          </div>

          <div className="stat-card losses">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats?.losses || 0}</h3>
              <p>Total Losses</p>
            </div>
          </div>

          <div className="stat-card matches">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>{stats?.totalMatches || 0}</h3>
              <p>Total Matches</p>
            </div>
          </div>

          <div className="stat-card winrate">
            <div className="stat-icon">
              <FaPercent />
            </div>
            <div className="stat-content">
              <h3>{stats?.winRate || 0}%</h3>
              <p>Win Rate</p>
            </div>
          </div>
        </div>

        {/* Performance History */}
        <div className="performance-section">
          <div className="section-header">
            <h2>Performance History</h2>
            <div className="period-selector">
              <button
                className={`period-btn ${performancePeriod === 'week' ? 'active' : ''}`}
                onClick={() => setPerformancePeriod('week')}
              >
                This Week
              </button>
              <button
                className={`period-btn ${performancePeriod === 'month' ? 'active' : ''}`}
                onClick={() => setPerformancePeriod('month')}
              >
                This Month
              </button>
              <button
                className={`period-btn ${performancePeriod === 'quarter' ? 'active' : ''}`}
                onClick={() => setPerformancePeriod('quarter')}
              >
                This Quarter
              </button>
            </div>
          </div>

          <div className="chart-container">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: '#667eea', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Win Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No match data available for this period</p>
                <p className="no-data-sub">Play some matches to see your performance!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>&times;</button>
            </div>
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="FirstName">First Name</label>
                  <input
                    type="text"
                    id="FirstName"
                    name="FirstName"
                    value={editForm.FirstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="LastName">Last Name</label>
                  <input
                    type="text"
                    id="LastName"
                    name="LastName"
                    value={editForm.LastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Email">Email</label>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    value={editForm.Email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="Phone">Phone</label>
                  <input
                    type="tel"
                    id="Phone"
                    name="Phone"
                    value={editForm.Phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Age">Age</label>
                  <input
                    type="number"
                    id="Age"
                    name="Age"
                    value={editForm.Age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="Gender">Gender</label>
                  <select
                    id="Gender"
                    name="Gender"
                    value={editForm.Gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
