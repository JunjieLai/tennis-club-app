import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getBestChallengers, getTopPlayers, createChallenge } from '../services/api';
import { toast } from 'react-toastify';
import { FaTrophy, FaUser } from 'react-icons/fa';
import './Challenge.css';

const Challenge = () => {
  const { user } = useContext(AuthContext);
  const [challengers, setChallengers] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [challengersRes, topRes] = await Promise.all([
        getBestChallengers(user.MEID),
        getTopPlayers(5)
      ]);
      setChallengers(challengersRes.data.challengers);
      setTopPlayers(topRes.data.topPlayers);
    } catch (error) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!selectedPlayer) {
      toast.error('Please select a player to challenge');
      return;
    }

    try {
      await createChallenge({
        challengedMEID: selectedPlayer.MEID,
        notes
      });
      toast.success('Challenge sent successfully!');
      setSelectedPlayer(null);
      setNotes('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container challenge-page">
      <h1>Challenge Players</h1>

      <div className="challenge-grid">
        <div className="card">
          <h2>Recommended Opponents</h2>
          <p className="card-subtitle">Players with similar UTR rating</p>
          <div className="players-list">
            {challengers.map((player) => (
              <div
                key={player.MEID}
                className={`player-card ${selectedPlayer?.MEID === player.MEID ? 'selected' : ''}`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="player-avatar">
                  {player.UserName[0].toUpperCase()}
                </div>
                <div className="player-info">
                  <h4>{player.UserName}</h4>
                  <p>UTR: {player.UTR}</p>
                  <p className="player-meta">{player.Gender}, {player.Age} years</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Top Players</h2>
          <p className="card-subtitle">Challenge the best</p>
          <div className="players-list">
            {topPlayers.map((player, index) => (
              <div
                key={player.MEID}
                className={`player-card ${selectedPlayer?.MEID === player.MEID ? 'selected' : ''}`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="player-rank">#{index + 1}</div>
                <div className="player-avatar">
                  {player.UserName[0].toUpperCase()}
                </div>
                <div className="player-info">
                  <h4>{player.UserName}</h4>
                  <p>UTR: {player.UTR}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <div className="card challenge-form">
          <h2>Send Challenge to {selectedPlayer.UserName}</h2>
          <div className="input-group">
            <label>Message (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a message to your challenge..."
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleChallenge}>
              Send Challenge
            </button>
            <button className="btn btn-secondary" onClick={() => setSelectedPlayer(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenge;
