import React, { useState, useEffect } from 'react';
import { getAllMatches, getAllMembers, getAcceptedChallenges, createMatch, deleteMatch } from '../services/api';
import { toast } from 'react-toastify';
import { FaUsers, FaTrophy, FaHandshake, FaTrash, FaPlus } from 'react-icons/fa';
import './AdminPanel.css';

const AdminPanel = () => {
  const [matches, setMatches] = useState([]);
  const [members, setMembers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, membersRes, challengesRes] = await Promise.all([
        getAllMatches(),
        getAllMembers(),
        getAcceptedChallenges()
      ]);
      setMatches(matchesRes.data.matches);
      setMembers(membersRes.data.members);
      setChallenges(challengesRes.data.challenges);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;

    try {
      await deleteMatch(matchId);
      toast.success('Match deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete match');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container admin-page">
      <h1>Admin Panel</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <div>
            <h3>{members.length}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div>
            <h3>{matches.length}</h3>
            <p>Total Matches</p>
          </div>
        </div>
        <div className="stat-card">
          <FaHandshake className="stat-icon" />
          <div>
            <h3>{challenges.length}</h3>
            <p>Pending Challenges</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'matches' && (
          <div className="card">
            <h2>All Matches</h2>
            <div className="data-table">
              {matches.length === 0 ? (
                <p>No matches found</p>
              ) : (
                matches.map((match) => (
                  <div key={match.MAID} className="table-row">
                    <div className="match-info">
                      <strong>{match.Winner.UserName}</strong> vs <strong>{match.Loser.UserName}</strong>
                      <span className="match-date">{new Date(match.DateOfMatch).toLocaleDateString()}</span>
                    </div>
                    <div className="match-scores">
                      {match.MEID1Set1Score}-{match.MEID2Set1Score},
                      {match.MEID1Set2Score}-{match.MEID2Set2Score},
                      {match.MEID1Set3Score}-{match.MEID2Set3Score}
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteMatch(match.MAID)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card">
            <h2>All Members</h2>
            <div className="data-table">
              {members.map((member) => (
                <div key={member.MEID} className="table-row">
                  <div className="member-info">
                    <strong>{member.UserName}</strong>
                    <span>{member.FirstName} {member.LastName}</span>
                  </div>
                  <div className="member-details">
                    <span>UTR: {member.UTR}</span>
                    <span>{member.Gender}, {member.Age} years</span>
                    <span>{member.Email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="card">
            <h2>Accepted Challenges</h2>
            <p className="info-text">These challenges can be converted into matches</p>
            <div className="data-table">
              {challenges.length === 0 ? (
                <p>No accepted challenges</p>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge.CID} className="table-row">
                    <div className="challenge-info">
                      <strong>{challenge.Challenger.UserName}</strong> challenged <strong>{challenge.Challenged.UserName}</strong>
                      <span className="challenge-date">{new Date(challenge.DateOfChallenge).toLocaleDateString()}</span>
                    </div>
                    <span className="badge accepted-badge">Accepted</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
