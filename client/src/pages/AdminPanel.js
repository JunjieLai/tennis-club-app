import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUsers, FaTrophy, FaChartBar, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [finishedMatches, setFinishedMatches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');
  const [filterMinUTR, setFilterMinUTR] = useState('');
  const [filterMaxUTR, setFilterMaxUTR] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [scores, setScores] = useState({
    set1p1: '', set1p2: '',
    set2p1: '', set2p2: '',
    set3p1: '', set3p2: ''
  });
  const [statsPeriod, setStatsPeriod] = useState('week');
  const [matchStats, setMatchStats] = useState({ total: 0, pending: 0, finished: 0, dailyData: [] });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'matches') {
      fetchFinishedMatches();
    } else if (activeTab === 'members') {
      fetchAnalytics();
    } else if (activeTab === 'activity') {
      fetchAnalytics();
      fetchChallenges();
      fetchMatchStats('week');
    }
  }, [activeTab, currentPage, searchQuery, filterGender, filterMinAge, filterMaxAge, filterMinUTR, filterMaxUTR, statsPeriod]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(filterGender && { gender: filterGender }),
        ...(filterMinAge && { minAge: filterMinAge }),
        ...(filterMaxAge && { maxAge: filterMaxAge }),
        ...(filterMinUTR && { minUTR: filterMinUTR }),
        ...(filterMaxUTR && { maxUTR: filterMaxUTR })
      });

      const response = await api.get(`/members?${params}`);
      setUsers(response.data.members || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFinishedMatches = async () => {
    try {
      const response = await api.get('/matches/finished');
      setFinishedMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching finished matches:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/members/analytics/stats');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges');
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/members/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openGradeModal = (match) => {
    setSelectedMatch(match);
    setShowGradeModal(true);
    setScores({ set1p1: '', set1p2: '', set2p1: '', set2p2: '', set3p1: '', set3p2: '' });
  };

  const handleGradeMatch = async (e) => {
    e.preventDefault();

    if (!scores.set1p1 || !scores.set1p2) {
      toast.error('At least set 1 scores are required');
      return;
    }

    try {
      await api.put(`/matches/${selectedMatch.MAID}/grade`, {
        MEID1Set1Score: parseInt(scores.set1p1),
        MEID2Set1Score: parseInt(scores.set1p2),
        MEID1Set2Score: scores.set2p1 ? parseInt(scores.set2p1) : null,
        MEID2Set2Score: scores.set2p2 ? parseInt(scores.set2p2) : null,
        MEID1Set3Score: scores.set3p1 ? parseInt(scores.set3p1) : null,
        MEID2Set3Score: scores.set3p2 ? parseInt(scores.set3p2) : null
      });

      toast.success('Match graded successfully!');
      setShowGradeModal(false);
      fetchFinishedMatches();
    } catch (error) {
      toast.error('Failed to grade match');
    }
  };

  const fetchMatchStats = async (period) => {
    try {
      const response = await api.get(`/matches/stats?period=${period}`);
      setMatchStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching match stats:', error);
    }
  };


  const getChallengeStats = () => {
    const total = challenges.length;
    const wait = challenges.filter(c => c.State === 'Wait').length;
    const accept = challenges.filter(c => c.State === 'Accept').length;
    const reject = challenges.filter(c => c.State === 'Reject').length;

    return {
      total,
      wait,
      accept,
      reject,
      waitPercent: total > 0 ? ((wait / total) * 100).toFixed(1) : 0,
      acceptPercent: total > 0 ? ((accept / total) * 100).toFixed(1) : 0,
      rejectPercent: total > 0 ? ((reject / total) * 100).toFixed(1) : 0
    };
  };

  const COLORS = ['#667eea', '#f59e0b', '#10b981', '#ef4444'];

  const genderData = analytics ? [
    { name: 'Male', value: analytics.gender.male },
    { name: 'Female', value: analytics.gender.female }
  ] : [];

  const ageData = analytics ? [
    { name: '0-12', value: analytics.age.child },
    { name: '13-18', value: analytics.age.teen },
    { name: '19-50', value: analytics.age.adult },
    { name: '51+', value: analytics.age.elder }
  ] : [];

  const utrData = analytics ? [
    { name: 'Low (0-4.9)', value: analytics.utrLevel.low },
    { name: 'Mid (5-8.9)', value: analytics.utrLevel.mid },
    { name: 'High (9+)', value: analytics.utrLevel.high }
  ] : [];

  const challengeStats = getChallengeStats();

  const challengeData = [
    { name: 'Wait', value: challengeStats.wait },
    { name: 'Accept', value: challengeStats.accept },
    { name: 'Reject', value: challengeStats.reject }
  ];

  const dailyMatchData = matchStats.dailyData || [];

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchMatchStats(statsPeriod);
    }
  }, [statsPeriod, activeTab]);

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Admin Panel</h1>

        <div className="tabs">
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FaUsers /> User Management
          </button>
          <button className={`tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            <FaTrophy /> Match Grading
          </button>
          <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
            <FaUsers /> Member Analysis
          </button>
          <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            <FaChartBar /> Activity Analysis
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-btn" onClick={() => setSearchQuery('')}>
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="filters">
                <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input type="number" placeholder="Min Age" value={filterMinAge} onChange={(e) => setFilterMinAge(e.target.value)} />
                <input type="number" placeholder="Max Age" value={filterMaxAge} onChange={(e) => setFilterMaxAge(e.target.value)} />
                <input type="number" placeholder="Min UTR" step="0.1" value={filterMinUTR} onChange={(e) => setFilterMinUTR(e.target.value)} />
                <input type="number" placeholder="Max UTR" step="0.1" value={filterMaxUTR} onChange={(e) => setFilterMaxUTR(e.target.value)} />
              </div>
            </div>

            <div className="user-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>UTR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.MEID}>
                      <td>
                        <div className="user-cell">
                          <img src={user.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.UserName}`} alt={user.UserName} />
                          <div>
                            <div className="username">{user.UserName}</div>
                            <div className="fullname">{user.FirstName} {user.LastName}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.Email}</td>
                      <td>{user.Age}</td>
                      <td>{user.Gender}</td>
                      <td><span className="utr-badge">{user.UTR.toFixed(1)}</span></td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteUser(user.MEID)}>
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </div>
          </div>
        )}

        {/* Match Grading Tab */}
        {activeTab === 'matches' && (
          <div className="tab-content">
            <h2>Matches Awaiting Grading</h2>
            {finishedMatches.length === 0 ? (
              <p className="no-data">No matches awaiting grading</p>
            ) : (
              <div className="match-list">
                {finishedMatches.map(match => (
                  <div key={match.MAID} className="match-card" onClick={() => openGradeModal(match)}>
                    <div className="match-players">
                      <div className="player">
                        <img src={match.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player1?.UserName}`} alt="" />
                        <span>{match.Player1?.UserName}</span>
                      </div>
                      <span className="vs">VS</span>
                      <div className="player">
                        <img src={match.Player2?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player2?.UserName}`} alt="" />
                        <span>{match.Player2?.UserName}</span>
                      </div>
                    </div>
                    <div className="match-date">
                      {new Date(match.DateOfMatch).toLocaleDateString()}
                    </div>
                    <button className="grade-btn">Grade Match</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Member Analysis Tab */}
        {activeTab === 'members' && analytics && (
          <div className="tab-content">
            <h2>Member Statistics</h2>

            <div className="stats-grid">
              <div className="stat-box">
                <h3>{analytics.totalMembers}</h3>
                <p>Total Members</p>
              </div>
              <div className="stat-box">
                <h3>{analytics.avgUTR}</h3>
                <p>Average UTR</p>
              </div>
              <div className="stat-box">
                <h3>{analytics.avgAge}</h3>
                <p>Average Age</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-box">
                <h3>Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>Age Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>UTR Level Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={utrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#764ba2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Activity Analysis Tab */}
        {activeTab === 'activity' && analytics && (
          <div className="tab-content">
            <h2>Week Performance</h2>

            <div className="stats-grid">
              <div className="stat-box">
                <h3>{matchStats.total}</h3>
                <p>Total Matches</p>
              </div>
              <div className="stat-box">
                <h3>{matchStats.pending}</h3>
                <p>Pending Matches</p>
              </div>
              <div className="stat-box">
                <h3>{matchStats.finished}</h3>
                <p>Awaiting Grading</p>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Challenge Statistics</h3>
            <div className="chart-box" style={{ marginBottom: '2rem' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={challengeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {challengeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Daily Match Trend</h3>
              <div className="period-selector">
                <button className={statsPeriod === 'week' ? 'active' : ''} onClick={() => setStatsPeriod('week')}>Past Week</button>
                <button className={statsPeriod === 'month' ? 'active' : ''} onClick={() => setStatsPeriod('month')}>Past Month</button>
                <button className={statsPeriod === 'quarter' ? 'active' : ''} onClick={() => setStatsPeriod('quarter')}>Past Quarter</button>
              </div>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMatchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="matches" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grade Match Modal */}
        {showGradeModal && selectedMatch && (
          <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="modal-content grade-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Grade Match</h2>
                <button className="close-btn" onClick={() => setShowGradeModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="match-info-header">
                  <div className="player-info">
                    <img src={selectedMatch.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.Player1?.UserName}`} alt="" />
                    <span>{selectedMatch.Player1?.UserName}</span>
                  </div>
                  <span>VS</span>
                  <div className="player-info">
                    <img src={selectedMatch.Player2?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.Player2?.UserName}`} alt="" />
                    <span>{selectedMatch.Player2?.UserName}</span>
                  </div>
                </div>

                <form onSubmit={handleGradeMatch}>
                  <div className="score-inputs">
                    <h4>Set 1 *</h4>
                    <div className="set-inputs">
                      <input type="number" min="0" max="7" placeholder="P1" value={scores.set1p1} onChange={(e) => setScores({...scores, set1p1: e.target.value})} required />
                      <span>-</span>
                      <input type="number" min="0" max="7" placeholder="P2" value={scores.set1p2} onChange={(e) => setScores({...scores, set1p2: e.target.value})} required />
                    </div>

                    <h4>Set 2</h4>
                    <div className="set-inputs">
                      <input type="number" min="0" max="7" placeholder="P1" value={scores.set2p1} onChange={(e) => setScores({...scores, set2p1: e.target.value})} />
                      <span>-</span>
                      <input type="number" min="0" max="7" placeholder="P2" value={scores.set2p2} onChange={(e) => setScores({...scores, set2p2: e.target.value})} />
                    </div>

                    <h4>Set 3</h4>
                    <div className="set-inputs">
                      <input type="number" min="0" max="7" placeholder="P1" value={scores.set3p1} onChange={(e) => setScores({...scores, set3p1: e.target.value})} />
                      <span>-</span>
                      <input type="number" min="0" max="7" placeholder="P2" value={scores.set3p2} onChange={(e) => setScores({...scores, set3p2: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowGradeModal(false)}>Cancel</button>
                    <button type="submit" className="btn-submit">Submit Scores</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
