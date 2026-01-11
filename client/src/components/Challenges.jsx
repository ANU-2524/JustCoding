import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaTrophy, FaFire, FaSearch, FaFilter, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';
import '../Style/Challenges.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const difficultyColors = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
  expert: '#9c27b0'
};

const categoryIcons = {
  arrays: '📊',
  strings: '📝',
  'linked-lists': '🔗',
  trees: '🌳',
  graphs: '🕸️',
  dp: '🧮',
  sorting: '📈',
  searching: '🔍',
  math: '➗',
  other: '💡'
};

const Challenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: ''
  });
  const [userProgress, setUserProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('challenges');

  const odId = localStorage.getItem('odId') || `user-${Date.now()}`;
  if (!localStorage.getItem('odId')) {
    localStorage.setItem('odId', odId);
  }

  useEffect(() => {
    fetchChallenges();
    fetchUserProgress();
  }, [filters.difficulty, filters.category]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`${BACKEND_URL}/api/challenges?${params}`);
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/user/${odId}/progress`);
      const data = await res.json();
      setUserProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchChallenges();
  };

  return (
    <div className="challenges-container">
      {/* Hero Section */}
      <div className="challenges-hero">
        <h1><FaCode /> Coding Challenges</h1>
        <p>Sharpen your skills with curated programming problems</p>
        
        {/* Stats Bar */}
        {userProgress && (
          <div className="user-stats-bar">
            <div className="stat-item">
              <FaTrophy className="stat-icon gold" />
              <span className="stat-value">{userProgress.totalSolved}</span>
              <span className="stat-label">Solved</span>
            </div>
            <div className="stat-item">
              <FaStar className="stat-icon" />
              <span className="stat-value">{userProgress.totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat-item easy">
              <span className="stat-value">{userProgress.byDifficulty?.easy || 0}</span>
              <span className="stat-label">Easy</span>
            </div>
            <div className="stat-item medium">
              <span className="stat-value">{userProgress.byDifficulty?.medium || 0}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-item hard">
              <span className="stat-value">{userProgress.byDifficulty?.hard || 0}</span>
              <span className="stat-label">Hard</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="challenges-tabs">
        <button 
          className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <FaCode /> Problems
        </button>
        <button 
          className={`tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          <FaTrophy /> Contests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaChartLine /> Leaderboard
        </button>
      </div>

      {activeTab === 'challenges' && (
        <>
          {/* Filters */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <button type="submit" className="search-btn">Search</button>
            </form>

            <div className="filter-buttons">
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="filter-select"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="arrays">Arrays</option>
                <option value="strings">Strings</option>
                <option value="linked-lists">Linked Lists</option>
                <option value="trees">Trees</option>
                <option value="graphs">Graphs</option>
                <option value="dp">Dynamic Programming</option>
                <option value="sorting">Sorting</option>
                <option value="searching">Searching</option>
                <option value="math">Math</option>
              </select>
            </div>
          </div>

          {/* Challenges List */}
          <div className="challenges-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="empty-state">
                <FaCode className="empty-icon" />
                <p>No challenges found. Try different filters!</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="challenge-card"
                  onClick={() => navigate(`/challenges/${challenge.slug}`)}
                >
                  <div className="challenge-header">
                    <span className="category-icon">{categoryIcons[challenge.category] || '💡'}</span>
                    <h3>{challenge.title}</h3>
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: difficultyColors[challenge.difficulty] }}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  
                  <div className="challenge-meta">
                    <span className="points">
                      <FaStar /> {challenge.points} pts
                    </span>
                    <span className="solved-count">
                      <FaUsers /> {challenge.solvedCount} solved
                    </span>
                    <span className="success-rate">
                      {challenge.successRate}% success
                    </span>
                  </div>

                  <div className="challenge-tags">
                    {challenge.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'contests' && (
        <ContestsList />
      )}

      {activeTab === 'leaderboard' && (
        <GlobalLeaderboard />
      )}
    </div>
  );
};

// Contests List Component
const ContestsList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/contests/list`);
      const data = await res.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'Upcoming', color: '#2196f3' },
      active: { text: 'Live Now', color: '#4caf50' },
      ended: { text: 'Ended', color: '#9e9e9e' }
    };
    return badges[status] || badges.upcoming;
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div></div>;
  }

  return (
    <div className="contests-list">
      {contests.length === 0 ? (
        <div className="empty-state">
          <FaTrophy className="empty-icon" />
          <p>No contests available yet. Check back soon!</p>
        </div>
      ) : (
        contests.map((contest) => {
          const badge = getStatusBadge(contest.status);
          return (
            <div key={contest._id} className="contest-card">
              <div className="contest-header">
                <h3>{contest.title}</h3>
                <span className="status-badge" style={{ backgroundColor: badge.color }}>
                  {badge.text}
                </span>
              </div>
              <p className="contest-desc">{contest.description}</p>
              <div className="contest-meta">
                <span>📅 {new Date(contest.startTime).toLocaleDateString()}</span>
                <span>⏱️ {contest.duration} min</span>
                <span>👥 {contest.participantCount} joined</span>
              </div>
              <button 
                className="join-contest-btn"
                onClick={() => navigate(`/contests/${contest.slug}`)}
                disabled={contest.status === 'ended'}
              >
                {contest.status === 'active' ? 'Enter Contest' : 
                 contest.status === 'upcoming' ? 'View Details' : 'View Results'}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

// Global Leaderboard Component
const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show a placeholder - would need a global leaderboard endpoint
    setLoading(false);
    setLeaderboard([
      { rank: 1, name: 'CodeMaster', points: 2500, solved: 45 },
      { rank: 2, name: 'AlgoNinja', points: 2200, solved: 40 },
      { rank: 3, name: 'ByteWizard', points: 1900, solved: 35 },
    ]);
  }, []);

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div></div>;
  }

  return (
    <div className="leaderboard-section">
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>User</span>
          <span>Points</span>
          <span>Solved</span>
        </div>
        {leaderboard.map((user, index) => (
          <div key={index} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
            <span className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
            </span>
            <span className="name">{user.name}</span>
            <span className="points">{user.points}</span>
            <span className="solved">{user.solved}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
