import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaFire } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [topPlayers, setTopPlayers] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [showTopPlayers, setShowTopPlayers] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('low'); // 'low', 'mid', 'high'

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=600&fit=crop',
      title: 'Join the Ultimate Tennis Experience',
      subtitle: 'Where Champions Are Made'
    },
    {
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&h=600&fit=crop',
      title: 'Challenge Players, Improve Your Game',
      subtitle: 'Track Your Progress, Reach New Heights'
    },
    {
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&h=600&fit=crop',
      title: 'Connect With Tennis Enthusiasts',
      subtitle: 'Build Your Tennis Community'
    }
  ];

  useEffect(() => {
    // Only fetch data if user is logged in
    if (user) {
      fetchData();
    }

    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    try {
      const [topRes, activeRes, matchesRes] = await Promise.all([
        api.get('/members/top/5?excludeAdmins=true'),
        api.get('/members/active/5'),
        api.get('/matches?limit=50')
      ]);

      setTopPlayers(topRes.data.topPlayers || []);
      setActivePlayers(activeRes.data.activePlayers || []);
      setRecentMatches(matchesRes.data.matches || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const getDisplayedPlayers = () => {
    return showTopPlayers ? topPlayers : activePlayers;
  };

  const groupMatchesByUTR = () => {
    const grouped = {
      low: { recent: [], upcoming: [] },
      mid: { recent: [], upcoming: [] },
      high: { recent: [], upcoming: [] }
    };

    // Helper function to determine UTR category
    const getCategory = (utr) => {
      if (utr < 5) return 'low';
      if (utr >= 9) return 'high';
      return 'mid';
    };

    recentMatches.forEach(match => {
      // Check if match has player data
      if (!match.Player1 || !match.Player2) return;

      const player1UTR = match.Player1.UTR || 0;
      const player2UTR = match.Player2.UTR || 0;

      const player1Category = getCategory(player1UTR);
      const player2Category = getCategory(player2UTR);

      // Only include match if both players are in the same category
      if (player1Category !== player2Category) return;

      const category = player1Category;
      const now = new Date();
      const matchDate = new Date(match.DateOfMatch);

      // Only graded matches -> recent
      if (match.Status === 'graded') {
        grouped[category].recent.push(match);
      }
      // Pending matches in the future -> upcoming
      else if (match.Status === 'pending' && matchDate >= now) {
        grouped[category].upcoming.push(match);
      }
    });

    // Sort and limit to 3 most recent for each category
    ['low', 'mid', 'high'].forEach(category => {
      grouped[category].recent.sort((a, b) => new Date(b.DateOfMatch) - new Date(a.DateOfMatch)).splice(3);
      grouped[category].upcoming.sort((a, b) => new Date(a.DateOfMatch) - new Date(b.DateOfMatch)).splice(3);
    });

    return grouped;
  };

  const matchGroups = groupMatchesByUTR();

  return (
    <div className="home-page">
      {/* Carousel */}
      <div className="hero-carousel">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="carousel-overlay">
              <h1 className="carousel-title">{slide.title}</h1>
              <p className="carousel-subtitle">{slide.subtitle}</p>
            </div>
          </div>
        ))}
        <div className="carousel-indicators">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Introduction */}
      <section className="intro-section">
        <div className="container">
          <h2>Welcome to Our Tennis Club</h2>
          <p>
            Join our vibrant community of tennis enthusiasts! Whether you're a beginner or a seasoned player,
            our club offers the perfect environment to improve your game, challenge worthy opponents, and
            build lasting friendships. Track your progress with our UTR (Universal Tennis Rating) system,
            participate in exciting matches, and climb the rankings. Your tennis journey starts here!
          </p>
        </div>
      </section>

      {/* Member Showcase - Only show when logged in */}
      {user && (
        <section className="member-showcase">
          <div className="container">
            <div className="showcase-header">
              <h2>Featured Players</h2>
              <div className="toggle-buttons">
                <button
                  className={`toggle-btn ${showTopPlayers ? 'active' : ''}`}
                  onClick={() => setShowTopPlayers(true)}
                >
                  <FaTrophy /> Top 5 by UTR
                </button>
                <button
                  className={`toggle-btn ${!showTopPlayers ? 'active' : ''}`}
                  onClick={() => setShowTopPlayers(false)}
                >
                  <FaFire /> Most Active This Month
                </button>
              </div>
            </div>

            <div className="player-grid">
              {getDisplayedPlayers().map((player, index) => (
                <div key={player.MEID} className="player-card">
                  <div className="player-rank">#{index + 1}</div>
                  <img
                    src={player.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.UserName}`}
                    alt={player.UserName}
                    className="player-avatar"
                  />
                  <h3>{player.UserName}</h3>
                  <div className="player-stats">
                    <span className="utr-badge">UTR {player.UTR.toFixed(1)}</span>
                    {player.matchCount && (
                      <span className="match-count">{player.matchCount} matches</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Match Showcase - Only show when logged in */}
      {user && (
        <section className="match-showcase">
        <div className="container">
          <h2>Recent & Upcoming Matches</h2>

          {/* Level Filter Buttons */}
          <div className="level-filter">
            <button
              className={`level-btn ${selectedLevel === 'low' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('low')}
            >
              Beginner (0-4.9)
            </button>
            <button
              className={`level-btn ${selectedLevel === 'mid' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('mid')}
            >
              Intermediate (5-8.9)
            </button>
            <button
              className={`level-btn ${selectedLevel === 'high' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('high')}
            >
              Advanced (9+)
            </button>
          </div>

          {[selectedLevel].map(level => (
            <div key={level} className="utr-section">
              <h3>
                {level === 'low' && 'Beginner Level (UTR 0-4.9)'}
                {level === 'mid' && 'Intermediate Level (UTR 5-8.9)'}
                {level === 'high' && 'Advanced Level (UTR 9+)'}
              </h3>

              <div className="match-categories">
                <div className="match-category">
                  <h4>Recent Results</h4>
                  <div className="match-list">
                    {matchGroups[level].recent.length > 0 ? (
                      matchGroups[level].recent.map(match => (
                        <MatchCard key={match.MAID} match={match} />
                      ))
                    ) : (
                      <p className="no-matches">No recent matches</p>
                    )}
                  </div>
                </div>

                <div className="match-category">
                  <h4>Upcoming Matches</h4>
                  <div className="match-list">
                    {matchGroups[level].upcoming.length > 0 ? (
                      matchGroups[level].upcoming.map(match => (
                        <MatchCard key={match.MAID} match={match} />
                      ))
                    ) : (
                      <p className="no-matches">No upcoming matches</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join our community and start playing competitive tennis today!</p>
          <Link to="/register" className="cta-button">Join Now</Link>
        </div>
      </section>
    </div>
  );
};

// Match Card Component
const MatchCard = ({ match }) => {
  const { sets, status } = formatMatchScore(match);

  if (status === 'pending') {
    return (
      <div className="match-card pending">
        <div className="match-players">
          <div className="player">
            <img
              src={match.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player1?.UserName}`}
              alt={match.Player1?.UserName}
            />
            <span>{match.Player1?.UserName}</span>
          </div>
          <div className="vs">VS</div>
          <div className="player">
            <img
              src={match.Player2?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player2?.UserName}`}
              alt={match.Player2?.UserName}
            />
            <span>{match.Player2?.UserName}</span>
          </div>
        </div>
        <div className="match-date">
          {new Date(match.DateOfMatch).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  }

  const player1Won = match.WinnerMEID === match.Player1MEID;

  return (
    <div className="match-card graded">
      <div className="match-players">
        <div className={`player ${player1Won ? 'winner' : ''}`}>
          <img
            src={match.Player1?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player1?.UserName}`}
            alt={match.Player1?.UserName}
          />
          <span>{match.Player1?.UserName}</span>
        </div>

        <div className="score-board">
          {sets.map((set, index) => (
            <div key={index} className="set-score">
              <span className={set.p1 > set.p2 ? 'winning' : ''}>{set.p1}</span>
              <span className={set.p2 > set.p1 ? 'winning' : ''}>{set.p2}</span>
            </div>
          ))}
        </div>

        <div className={`player ${!player1Won ? 'winner' : ''}`}>
          <img
            src={match.Player2?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.Player2?.UserName}`}
            alt={match.Player2?.UserName}
          />
          <span>{match.Player2?.UserName}</span>
        </div>
      </div>
      <div className="match-date">
        {new Date(match.DateOfMatch).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })}
      </div>
    </div>
  );
};

// Helper function for formatting match scores
function formatMatchScore(match) {
  if (match.Status !== 'graded') {
    return { sets: [], status: match.Status };
  }

  const sets = [];
  if (match.MEID1Set1Score !== null && match.MEID2Set1Score !== null) {
    sets.push({ p1: match.MEID1Set1Score, p2: match.MEID2Set1Score });
  }
  if (match.MEID1Set2Score !== null && match.MEID2Set2Score !== null) {
    sets.push({ p1: match.MEID1Set2Score, p2: match.MEID2Set2Score });
  }
  if (match.MEID1Set3Score !== null && match.MEID2Set3Score !== null) {
    sets.push({ p1: match.MEID1Set3Score, p2: match.MEID2Set3Score });
  }

  return { sets, status: 'graded' };
}

export default Home;
