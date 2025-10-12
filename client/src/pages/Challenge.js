import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaSearch, FaEnvelope, FaPaperPlane, FaTimes, FaCheck, FaClock } from 'react-icons/fa';
import '../styles/Challenge.css';

const Challenge = () => {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [sentChallenges, setSentChallenges] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSentModal, setShowSentModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchDateTime, setMatchDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedPlayers, setRecommendedPlayers] = useState([]);
  const [sentChallengesPage, setSentChallengesPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchChallenges();
    fetchRecommendedPlayers();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges/me');
      setPendingChallenges(response.data.challengesReceived || []);
      setSentChallenges(response.data.challengesSent || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchRecommendedPlayers = async () => {
    try {
      // Get players with similar UTR (±1.5 range)
      const response = await api.get('/members?excludeAdmins=true');
      const allPlayers = response.data.members || [];

      const userUTR = user.UTR;
      const recommended = allPlayers
        .filter(p => p.MEID !== user.MEID)
        .filter(p => Math.abs(p.UTR - userUTR) <= 1.5)
        .sort((a, b) => Math.abs(a.UTR - userUTR) - Math.abs(b.UTR - userUTR))
        .slice(0, 5);

      setRecommendedPlayers(recommended);
    } catch (error) {
      console.error('Error fetching recommended players:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a username to search');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/members?search=${searchQuery}&excludeAdmins=true&limit=10`);
      const filteredResults = (response.data.members || []).filter(m => m.MEID !== user.MEID);
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        toast.info('No players found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openChallengeModal = (player) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
    setMatchDateTime('');
    setNotes('');
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();

    if (!matchDateTime) {
      toast.error('Please select match date and time');
      return;
    }

    const selectedDate = new Date(matchDateTime);
    if (selectedDate <= new Date()) {
      toast.error('Match date must be in the future');
      return;
    }

    setLoading(true);
    try {
      await api.post('/challenges', {
        challengedMEID: selectedPlayer.MEID,
        matchDateTime,
        notes
      });
      toast.success('Challenge sent successfully!');
      setShowChallengeModal(false);
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      await api.put(`/challenges/${challengeId}/accept`);
      toast.success('Challenge accepted!');
      fetchChallenges();
      setShowPendingModal(false);
    } catch (error) {
      toast.error('Failed to accept challenge');
    }
  };

  const handleRejectChallenge = async (challengeId) => {
    try {
      await api.put(`/challenges/${challengeId}/reject`);
      toast.success('Challenge rejected');
      fetchChallenges();
      setShowPendingModal(false);
    } catch (error) {
      toast.error('Failed to reject challenge');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Wait: { text: 'Waiting', color: '#f59e0b', icon: <FaClock /> },
      Accept: { text: 'Accepted', color: '#10b981', icon: <FaCheck /> },
      Reject: { text: 'Rejected', color: '#ef4444', icon: <FaTimes /> }
    };
    const badge = badges[status] || badges.Wait;
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  return (
    <div className="challenge-page">
      <div className="container">
        <h1>Challenge Players</h1>

        {/* Challenge Status Cards */}
        <div className="challenge-status-cards">
          <div className="status-card pending" onClick={() => setShowPendingModal(true)}>
            <div className="status-icon">
              <FaEnvelope />
            </div>
            <div className="status-content">
              <h3>{pendingChallenges.length}</h3>
              <p>Pending Challenges</p>
              <span className="status-subtitle">Click to view</span>
            </div>
          </div>

          <div className="status-card sent" onClick={() => { setShowSentModal(true); setSentChallengesPage(1); }}>
            <div className="status-icon">
              <FaPaperPlane />
            </div>
            <div className="status-content">
              <h3>{sentChallenges.length}</h3>
              <p>Sent Challenges</p>
              <span className="status-subtitle">Click to view</span>
            </div>
          </div>
        </div>

        {/* Recommended Players Section */}
        <div className="recommended-section">
          <h2>Recommended Players (Similar UTR)</h2>
          <p className="section-subtitle">Players with UTR within ±1.5 of yours ({user.UTR.toFixed(1)})</p>

          {recommendedPlayers.length > 0 ? (
            <div className="player-grid">
              {recommendedPlayers.map(player => (
                <div key={player.MEID} className="player-card" onClick={() => openChallengeModal(player)}>
                  <img
                    src={player.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.UserName}`}
                    alt={player.UserName}
                    className="player-avatar"
                  />
                  <h4>{player.UserName}</h4>
                  <p className="player-name">{player.FirstName} {player.LastName}</p>
                  <span className="utr-badge">UTR {player.UTR.toFixed(1)}</span>
                  <span className="utr-diff">Δ {Math.abs(player.UTR - user.UTR).toFixed(1)}</span>
                  <button className="challenge-btn">
                    <FaPaperPlane /> Challenge
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-players">No recommended players found at your UTR level</p>
          )}
        </div>

        {/* Search Section */}
        <div className="search-section">
          <h2>Find Players</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              <FaSearch /> Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              <div className="player-grid">
                {searchResults.map(player => (
                  <div key={player.MEID} className="player-card" onClick={() => openChallengeModal(player)}>
                    <img
                      src={player.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.UserName}`}
                      alt={player.UserName}
                      className="player-avatar"
                    />
                    <h4>{player.UserName}</h4>
                    <p className="player-name">{player.FirstName} {player.LastName}</p>
                    <span className="utr-badge">UTR {player.UTR.toFixed(1)}</span>
                    <button className="challenge-btn">
                      <FaPaperPlane /> Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending Challenges Modal */}
        {showPendingModal && (
          <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Pending Challenges</h2>
                <button className="close-btn" onClick={() => setShowPendingModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {pendingChallenges.length === 0 ? (
                  <p className="no-data">No pending challenges</p>
                ) : (
                  <div className="challenge-list">
                    {pendingChallenges.slice(0, 5).map(challenge => (
                      <div key={challenge.CID} className="challenge-item">
                        <img
                          src={challenge.Challenger?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.Challenger?.UserName}`}
                          alt={challenge.Challenger?.UserName}
                          className="challenger-avatar"
                        />
                        <div className="challenge-info">
                          <h4>{challenge.Challenger?.UserName}</h4>
                          <p className="challenge-time">
                            Match time: {new Date(challenge.MatchDateTime).toLocaleString()}
                          </p>
                          {challenge.Notes && <p className="challenge-notes">{challenge.Notes}</p>}
                        </div>
                        <div className="challenge-actions">
                          <button className="accept-btn" onClick={() => handleAcceptChallenge(challenge.CID)}>
                            <FaCheck /> Accept
                          </button>
                          <button className="reject-btn" onClick={() => handleRejectChallenge(challenge.CID)}>
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sent Challenges Modal */}
        {showSentModal && (
          <div className="modal-overlay" onClick={() => setShowSentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Sent Challenges</h2>
                <button className="close-btn" onClick={() => setShowSentModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {sentChallenges.length === 0 ? (
                  <p className="no-data">No sent challenges</p>
                ) : (
                  <>
                    <div className="challenge-list">
                      {sentChallenges
                        .slice((sentChallengesPage - 1) * itemsPerPage, sentChallengesPage * itemsPerPage)
                        .map(challenge => (
                          <div key={challenge.CID} className="challenge-item">
                            <img
                              src={challenge.Challenged?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.Challenged?.UserName}`}
                              alt={challenge.Challenged?.UserName}
                              className="challenger-avatar"
                            />
                            <div className="challenge-info">
                              <h4>{challenge.Challenged?.UserName}</h4>
                              <p className="challenge-time">
                                Match time: {new Date(challenge.MatchDateTime).toLocaleString()}
                              </p>
                              {challenge.Notes && <p className="challenge-notes">{challenge.Notes}</p>}
                            </div>
                            <div className="challenge-status">
                              {getStatusBadge(challenge.State)}
                            </div>
                          </div>
                        ))}
                    </div>
                    {sentChallenges.length > itemsPerPage && (
                      <div className="pagination">
                        {Array.from({ length: Math.ceil(sentChallenges.length / itemsPerPage) }, (_, i) => (
                          <button
                            key={i + 1}
                            className={`page-btn ${sentChallengesPage === i + 1 ? 'active' : ''}`}
                            onClick={() => setSentChallengesPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showChallengeModal && selectedPlayer && (
          <div className="modal-overlay" onClick={() => setShowChallengeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Challenge {selectedPlayer.UserName}</h2>
                <button className="close-btn" onClick={() => setShowChallengeModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateChallenge}>
                  <div className="form-group">
                    <label>Match Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={matchDateTime}
                      onChange={(e) => setMatchDateTime(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add a message..."
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowChallengeModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      <FaPaperPlane /> Send Challenge
                    </button>
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

export default Challenge;
