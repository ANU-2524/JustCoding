import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaAward, FaCrown } from 'react-icons/fa';
import '../Style/Leaderboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/progress/leaderboard?timeframe=${timeframe}&limit=50`);
      const data = await response.json();
      // Handle new response format with success field
      setLeaderboard(data.leaderboard || data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) {
return <FaCrown className="rank-icon gold" />;
}
    if (rank === 2) {
return <FaTrophy className="rank-icon silver" />;
}
    if (rank === 3) {
return <FaMedal className="rank-icon bronze" />;
}
    return <span className="rank-number">#{rank}</span>;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1><FaTrophy /> Global Leaderboard</h1>
        <p>Top performers on JustCode platform</p>
        
        <div className="timeframe-selector">
          <button 
            className={timeframe === 'weekly' ? 'active' : ''}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={timeframe === 'monthly' ? 'active' : ''}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={timeframe === 'all-time' ? 'active' : ''}
            onClick={() => setTimeframe('all-time')}
          >
            All Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="empty-state">
              <FaAward className="empty-icon" />
              <h3>No rankings yet</h3>
              <p>Start coding to appear on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <div key={user._id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank">
                  {getRankIcon(index + 1)}
                </div>
                <div className="user-info">
                  <h3>{user.displayName || user.userId}</h3>
                  <p>Level {user.level || 1}</p>
                </div>
                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">{user.totalPoints || 0}</span>
                    <span className="stat-label">Points</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{user.badges?.length || 0}</span>
                    <span className="stat-label">Badges</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;