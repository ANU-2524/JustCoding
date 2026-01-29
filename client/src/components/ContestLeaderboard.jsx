import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTrophy, FaMedal, FaAward, FaCrown, FaArrowLeft, FaSync, FaClock, FaUsers } from 'react-icons/fa';
import '../Style/ContestLeaderboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const ContestLeaderboard = () => {
  const { slug } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [cached, setCached] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchContestLeaderboard();
    // Auto-refresh every 30 seconds for active contests
    const interval = setInterval(() => {
      if (contest?.status === 'active') {
        fetchContestLeaderboard(false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [slug, pagination.page]);

  const fetchContestLeaderboard = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Fetch contest details, leaderboard, and stats
      const [contestResponse, leaderboardResponse, statsResponse] = await Promise.all([
        fetch(`http://localhost:4334/api/challenges/contests/${slug}`),
        fetch(`http://localhost:4334/api/challenges/contests/${slug}/leaderboard?page=${pagination.page}&limit=${pagination.limit}`),
        fetch(`http://localhost:4334/api/challenges/contests/${slug}/stats`)
      ]);

      const contestData = await contestResponse.json();
      const leaderboardData = await leaderboardResponse.json();
      const statsData = await statsResponse.json();

      setContest(contestData);
      setLeaderboard(leaderboardData.leaderboard || []);
      setPagination(leaderboardData.pagination || pagination);
      setCached(leaderboardData.cached || false);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching contest leaderboard:', error);
      setLeaderboard([]);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `http://localhost:4334/api/challenges/contests/${slug}/leaderboard?page=${pagination.page}&limit=${pagination.limit}&refresh=true`
      );
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setPagination(data.pagination || pagination);
      setCached(false);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '0m';
    const minutes = Math.floor(timestamp / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="loading">Loading contest leaderboard...</div>;
  }

  return (
    <div className="contest-leaderboard-container">
      <div className="contest-leaderboard-header">
        <Link to={`/contests/${slug}`} className="back-link">
          <FaArrowLeft /> Back to Contest
        </Link>
        
        <div className="header-content">
          <h1><FaTrophy /> Contest Leaderboard</h1>
          {contest && (
            <div className="contest-info">
              <h2>{contest.title}</h2>
              <div className="contest-meta">
                <span className={`status ${contest.status}`}>{contest.status.toUpperCase()}</span>
                {cached && (
                  <span className="cache-indicator" title="Showing cached results">
                    <FaClock /> Cached
                  </span>
                )}
                {stats && (
                  <span className="participants-count">
                    <FaUsers /> {stats.participantCount} Participants
                  </span>
                )}
              </div>
            </div>
          )}
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {stats && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total Submissions</span>
              <span className="stat-value">{stats.totalSubmissions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accepted</span>
              <span className="stat-value">{stats.acceptedSubmissions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Acceptance Rate</span>
              <span className="stat-value">{stats.acceptanceRate.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <FaAward className="empty-icon" />
          <h3>No participants yet</h3>
          <p>Be the first to join and compete!</p>
          <Link to={`/contests/${slug}`} className="btn-primary">
            Join Contest
          </Link>
        </div>
      ) : (
        <>
          <div className="leaderboard-list">
            {leaderboard.map((participant) => (
              <div key={participant.odId} className={`leaderboard-item ${participant.rank <= 3 ? 'top-three' : ''}`}>
                <div className="rank">
                  {getRankIcon(participant.rank)}
                </div>
                
                <div className="participant-info">
                  <h3>{participant.odName || participant.odId}</h3>
                  <p className="participant-id">{participant.odId}</p>
                </div>
                
                <div className="participant-stats">
                  <div className="stat">
                    <span className="stat-value">{participant.totalPoints || 0}</span>
                    <span className="stat-label">Points</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{participant.solvedCount || 0}</span>
                    <span className="stat-label">Solved</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{participant.submissions || 0}</span>
                    <span className="stat-label">Attempts</span>
                  </div>
                </div>
                
                {participant.lastSubmission && (
                  <div className="last-submission">
                    <span>Last: {formatDate(participant.lastSubmission)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                First
              </button>
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
              <button
                className="page-btn"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages}
              >
                Last
              </button>
            </div>
          )}
        </>
      )}

      <div className="leaderboard-actions">
        <Link to="/contests" className="btn-outline">
          All Contests
        </Link>
        <Link to={`/contests/${slug}`} className="btn-primary">
          Contest Details
        </Link>
      </div>
    </div>
  );
};

export default ContestLeaderboard;