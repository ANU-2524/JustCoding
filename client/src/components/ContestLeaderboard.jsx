import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTrophy, FaMedal, FaAward, FaCrown, FaArrowLeft } from 'react-icons/fa';
import '../Style/ContestLeaderboard.css';

const ContestLeaderboard = () => {
  const { slug } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestLeaderboard();
  }, [slug]);

  const fetchContestLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch contest details and leaderboard
      const [contestResponse, leaderboardResponse] = await Promise.all([
        fetch(`http://localhost:4334/api/challenges/contests/${slug}`),
        fetch(`http://localhost:4334/api/challenges/contests/${slug}/leaderboard`)
      ]);

      const contestData = await contestResponse.json();
      const leaderboardData = await leaderboardResponse.json();

      setContest(contestData);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error('Error fetching contest leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="rank-icon gold" />;
    if (rank === 2) return <FaTrophy className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
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
              <p>Status: <span className={`status ${contest.status}`}>{contest.status}</span></p>
            </div>
          )}
        </div>
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
        <div className="leaderboard-list">
          {leaderboard.map((participant, index) => (
            <div key={participant.odId} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
              <div className="rank">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="participant-info">
                <h3>{participant.odName || participant.odId}</h3>
                <p>Participant ID: {participant.odId}</p>
              </div>
              
              <div className="participant-stats">
                <div className="stat">
                  <span className="stat-value">{participant.totalScore || 0}</span>
                  <span className="stat-label">Score</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{participant.problemsSolved || 0}</span>
                  <span className="stat-label">Solved</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{participant.penalty || 0}</span>
                  <span className="stat-label">Penalty</span>
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