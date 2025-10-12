import React, { useState, useEffect } from 'react';
import { getAllMatches } from '../services/api';
import { toast } from 'react-toastify';
import './Matches.css';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await getAllMatches();
      setMatches(res.data.matches);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container matches-page">
      <h1>Match History</h1>
      <div className="matches-list">
        {matches.map((match) => (
          <div key={match.MAID} className="match-card">
            <div className="match-header">
              <span className="match-date">{new Date(match.DateOfMatch).toLocaleDateString()}</span>
            </div>
            <div className="match-players">
              <div className="player winner">
                <span className="player-name">{match.Winner.UserName}</span>
                <span className="badge winner-badge">Winner</span>
              </div>
              <div className="vs">vs</div>
              <div className="player loser">
                <span className="player-name">{match.Loser.UserName}</span>
                <span className="badge loser-badge">Loser</span>
              </div>
            </div>
            <div className="match-scores">
              <span>{match.MEID1Set1Score}-{match.MEID2Set1Score}</span>
              <span>{match.MEID1Set2Score}-{match.MEID2Set2Score}</span>
              <span>{match.MEID1Set3Score}-{match.MEID2Set3Score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
