import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyChallenges, getMemberStats, acceptChallenge, rejectChallenge } from '../services/api';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState({ received: [], sent: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengesRes, statsRes] = await Promise.all([
        getMyChallenges(),
        getMemberStats(user.MEID)
      ]);

      setChallenges({
        received: challengesRes.data.challengesReceived,
        sent: challengesRes.data.challengesSent
      });
      setStats(statsRes.data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptChallenge(id);
      toast.success('Challenge accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept challenge');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectChallenge(id);
      toast.success('Challenge rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject challenge');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.UserName}!</h1>
        <p className="subtitle">Here's your tennis performance overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon wins">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>{stats.wins}</h3>
            <p>Wins</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon losses">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.losses}</h3>
            <p>Losses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon matches">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>{stats.totalMatches}</h3>
            <p>Total Matches</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon winrate">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.winRate}%</h3>
            <p>Win Rate</p>
          </div>
        </div>
      </div>

      {stats.history && stats.history.length > 0 && (
        <div className="card chart-card">
          <h2>Performance History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#2563eb"
                strokeWidth={2}
                name="Win Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {challenges.received.length > 0 && (
        <div className="card">
          <h2>Pending Challenges</h2>
          <div className="challenges-list">
            {challenges.received.map((challenge) => (
              <div key={challenge.CID} className="challenge-item">
                <div className="challenge-info">
                  <div className="challenger-avatar">
                    {challenge.Challenger.UserName[0].toUpperCase()}
                  </div>
                  <div>
                    <h4>{challenge.Challenger.UserName}</h4>
                    <p className="challenge-notes">{challenge.Notes}</p>
                    <p className="challenge-date">
                      <FaClock /> {new Date(challenge.DateOfChallenge).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="challenge-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleAccept(challenge.CID)}
                  >
                    <FaCheckCircle /> Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(challenge.CID)}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges.sent.length > 0 && (
        <div className="card">
          <h2>Sent Challenges</h2>
          <div className="challenges-list">
            {challenges.sent.map((challenge) => (
              <div key={challenge.CID} className="challenge-item">
                <div className="challenge-info">
                  <div className="challenger-avatar">
                    {challenge.Challenged.UserName[0].toUpperCase()}
                  </div>
                  <div>
                    <h4>{challenge.Challenged.UserName}</h4>
                    <p className="challenge-notes">{challenge.Notes}</p>
                    <p className="challenge-date">
                      <FaClock /> {new Date(challenge.DateOfChallenge).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`challenge-status status-${challenge.State.toLowerCase()}`}>
                  {challenge.State}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
