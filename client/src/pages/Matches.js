import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaTrophy, FaCalendar, FaHistory, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import '../styles/Matches.css';

const Matches = () => {
  const { user } = useContext(AuthContext);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [calendarMatches, setCalendarMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const matchesPerPage = 10;

  useEffect(() => {
    fetchMatches();
  }, [filterPeriod, filterResult]);

  const fetchMatches = async () => {
    try {
      const [upcomingRes, allRes, historyRes] = await Promise.all([
        api.get(`/matches/member/${user.MEID}?status=upcoming`),
        api.get(`/matches/member/${user.MEID}`),
        api.get(`/matches/member/${user.MEID}?status=history${filterPeriod !== 'all' ? `&period=${filterPeriod}` : ''}${filterResult !== 'all' ? `&result=${filterResult}` : ''}`)
      ]);

      const upcoming = (upcomingRes.data.matches || [])
        .filter(m => m.Status === 'pending')
        .sort((a, b) => new Date(a.DateOfMatch) - new Date(b.DateOfMatch))
        .slice(0, 3);

      setUpcomingMatches(upcoming);
      setCalendarMatches(allRes.data.matches || []);
      setHistoryMatches(historyRes.data.matches || []);
      setHistoryPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    }
  };

  // Pagination functions
  const getPaginatedHistory = () => {
    const startIndex = (historyPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    return historyMatches.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(historyMatches.length / matchesPerPage);
  };

  const handlePageChange = (newPage) => {
    setHistoryPage(newPage);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getMatchesForDate = (date) => {
    if (!date) return [];
    return calendarMatches.filter(match => {
      const matchDate = new Date(match.DateOfMatch);
      return matchDate.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMatchScore = (match) => {
    if (match.Status !== 'graded') return null;

    const sets = [];
    if (match.MEID1Set1Score !== null) sets.push([match.MEID1Set1Score, match.MEID2Set1Score]);
    if (match.MEID1Set2Score !== null) sets.push([match.MEID1Set2Score, match.MEID2Set2Score]);
    if (match.MEID1Set3Score !== null) sets.push([match.MEID1Set3Score, match.MEID2Set3Score]);

    return sets;
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const isMatchFinished = (match) => {
    const matchDate = new Date(match.DateOfMatch);
    const now = new Date();
    return matchDate < now;
  };

  return (
    <div className="matches-page">
      <div className="container">
        <h1>My Matches</h1>

        {!showHistory ? (
          <>
            {/* Upcoming Matches */}
            <div className="upcoming-section">
              <h2><FaTrophy /> Upcoming Matches</h2>
              {upcomingMatches.length === 0 ? (
                <p className="no-matches">No upcoming matches scheduled</p>
              ) : (
                <div className="upcoming-matches">
                  {upcomingMatches.map(match => (
                    <div key={match.MAID} className="upcoming-match-card">
                      <div className="match-date">
                        {new Date(match.DateOfMatch).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="match-time">
                        {new Date(match.DateOfMatch).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="match-opponent">
                        <img
                          src={match.Player1MEID === user.MEID ? match.Player2?.MPID : match.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player1MEID === user.MEID ? match.Player2?.UserName : match.Player1?.UserName}`}
                          alt="Opponent"
                          className="opponent-avatar"
                        />
                        <span className="opponent-name">
                          {match.Player1MEID === user.MEID ? match.Player2?.UserName : match.Player1?.UserName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar View */}
            <div className="calendar-section">
              <div className="calendar-header">
                <h2><FaCalendar /> Match Calendar</h2>
                <div className="calendar-controls">
                  <button onClick={previousMonth}><FaChevronLeft /></button>
                  <span className="current-month">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth}><FaChevronRight /></button>
                </div>
              </div>

              <div className="calendar">
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
<div className="calendar-days">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const matches = date ? getMatchesForDate(date) : [];
                    const hasMatches = matches.length > 0;
                    const hasFinishedMatches = matches.some(m => isMatchFinished(m));
                    const hasUpcomingMatches = matches.some(m => !isMatchFinished(m));

                    return (
                      <div
                        key={index}
                        className={`calendar-day ${!date ? 'empty' : ''} ${hasFinishedMatches ? 'has-finished-matches' : hasUpcomingMatches ? 'has-matches' : ''}`}
                      >
                        {date && (
                          <>
                            <span className="day-number">{date.getDate()}</span>
                            {hasMatches && (
                              <div className="match-avatars">
                                {matches.slice(0, 3).map((match, i) => {
                                  const opponent = match.Player1MEID === user.MEID ? match.Player2 : match.Player1;
                                  return (
                                    <div
                                      key={i}
                                      className="match-avatar-wrapper"
                                      title={`vs ${opponent?.UserName} at ${new Date(match.DateOfMatch).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                      onClick={() => handleMatchClick(match)}
                                    >
                                      <img
                                        src={opponent?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.UserName}`}
                                        alt={opponent?.UserName}
                                        className="match-avatar"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History Button */}
            <div className="history-button-section">
              <button className="view-history-btn" onClick={() => setShowHistory(true)}>
                <FaHistory /> View Match History
              </button>
            </div>
          </>
        ) : (
          <>
            {/* History View */}
            <div className="history-section">
              <div className="history-header">
                <button className="back-btn" onClick={() => setShowHistory(false)}>
                  <FaChevronLeft /> Back
                </button>
                <h2>Match History</h2>
              </div>

              <div className="history-filters">
                <div className="filter-group">
                  <label>Time Period:</label>
                  <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                    <option value="all">All Time</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="quarter">Past Quarter</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Result:</label>
                  <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)}>
                    <option value="all">All Matches</option>
                    <option value="win">Wins Only</option>
                    <option value="loss">Losses Only</option>
                  </select>
                </div>
              </div>

              {historyMatches.length === 0 ? (
                <p className="no-matches">No match history found</p>
              ) : (
                <>
                  <div className="history-list">
                    {getPaginatedHistory().map(match => {
                    const isPlayer1 = match.Player1MEID === user.MEID;
                    const opponent = isPlayer1 ? match.Player2 : match.Player1;
                    const isWinner = match.WinnerMEID === user.MEID;
                    const scores = formatMatchScore(match);

                    return (
                      <div key={match.MAID} className={`history-match-card ${isWinner ? 'win' : 'loss'}`}>
                        <div className="match-result">
                          <span className={`result-badge ${isWinner ? 'win' : 'loss'}`}>
                            {isWinner ? 'WIN' : 'LOSS'}
                          </span>
                        </div>

                        <div className="match-info">
                          <div className="match-players">
                            <div className={`player ${isWinner ? 'winner' : ''}`}>
                              <span className="player-label">You</span>
                            </div>
                            <div className="vs">VS</div>
                            <div className={`player ${!isWinner ? 'winner' : ''}`}>
                              <img
                                src={opponent?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.UserName}`}
                                alt={opponent?.UserName}
                                className="opponent-avatar-small"
                              />
                              <span>{opponent?.UserName}</span>
                            </div>
                          </div>

                          {scores && (
                            <div className="match-score">
                              {scores.map((set, index) => (
                                <div key={index} className="set-score">
                                  <span className={isPlayer1 && set[0] > set[1] || !isPlayer1 && set[1] > set[0] ? 'winning' : ''}>{isPlayer1 ? set[0] : set[1]}</span>
                                  <span className={isPlayer1 && set[0] < set[1] || !isPlayer1 && set[1] < set[0] ? 'winning' : ''}>{isPlayer1 ? set[1] : set[0]}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="match-meta">
                          {new Date(match.DateOfMatch).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {getTotalPages() > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(historyPage - 1)}
                      disabled={historyPage === 1}
                    >
                      <FaChevronLeft /> Previous
                    </button>

                    <div className="pagination-info">
                      Page {historyPage} of {getTotalPages()}
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(historyPage + 1)}
                      disabled={historyPage === getTotalPages()}
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </>
        )}

        {/* Match Details Modal */}
        {showMatchModal && selectedMatch && (
          <div className="modal-overlay" onClick={() => setShowMatchModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Match Details</h2>
                <button className="close-btn" onClick={() => setShowMatchModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="match-detail-content">
                  <div className="opponent-info">
                    <img
                      src={
                        selectedMatch.Player1MEID === user.MEID
                          ? selectedMatch.Player2?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.Player2?.UserName}`
                          : selectedMatch.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.Player1?.UserName}`
                      }
                      alt="Opponent"
                      className="modal-opponent-avatar"
                    />
                    <h3>
                      {selectedMatch.Player1MEID === user.MEID
                        ? selectedMatch.Player2?.UserName
                        : selectedMatch.Player1?.UserName}
                    </h3>
                    <p className="opponent-full-name">
                      {selectedMatch.Player1MEID === user.MEID
                        ? `${selectedMatch.Player2?.FirstName} ${selectedMatch.Player2?.LastName}`
                        : `${selectedMatch.Player1?.FirstName} ${selectedMatch.Player1?.LastName}`}
                    </p>
                    <span className="modal-utr-badge">
                      UTR{' '}
                      {selectedMatch.Player1MEID === user.MEID
                        ? selectedMatch.Player2?.UTR?.toFixed(1)
                        : selectedMatch.Player1?.UTR?.toFixed(1)}
                    </span>
                  </div>

                  <div className="match-time-info">
                    <h4>Match Time</h4>
                    <p className="match-datetime">
                      {new Date(selectedMatch.DateOfMatch).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {selectedMatch.Challenge?.Notes && (
                    <div className="match-notes">
                      <h4>Message from Opponent</h4>
                      <p className="notes-content">{selectedMatch.Challenge.Notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
