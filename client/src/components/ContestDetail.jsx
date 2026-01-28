import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FaTrophy, FaClock, FaUsers, FaCalendarAlt, FaPlay, FaStop, FaCheckCircle, FaCode, FaStar } from 'react-icons/fa';
import '../Style/ContestDetail.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const ContestDetail = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    fetchContest();
  }, [slug]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/challenges/contests/${slug}`);
      const data = await response.json();
      setContest(data);
      
      // Check if user has joined
      if (currentUser && data.participants) {
        setHasJoined(data.participants.some(p => p.odId === currentUser.uid));
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinContest = async () => {
    if (!currentUser) {
      alert('Please login to join the contest');
      return;
    }

    try {
      setJoining(true);
      const response = await fetch(`${BACKEND_URL}/api/challenges/contests/${slug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odId: currentUser.uid,
          odName: currentUser.displayName || currentUser.email
        })
      });

      if (response.ok) {
        setHasJoined(true);
        fetchContest(); // Refresh contest data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join contest');
      }
    } catch (error) {
      console.error('Error joining contest:', error);
      alert('Failed to join contest');
    } finally {
      setJoining(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <FaClock className="status-icon upcoming" />;
      case 'active': return <FaPlay className="status-icon active" />;
      case 'ended': return <FaStop className="status-icon ended" />;
      default: return <FaCheckCircle className="status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return <div className="loading">Loading contest...</div>;
  }

  if (!contest) {
    return (
      <div className="error-state">
        <h2>Contest not found</h2>
        <Link to="/contests" className="btn-primary">Back to Contests</Link>
      </div>
    );
  }

  return (
    <div className="contest-detail-container">
      <div className="contest-detail-header">
        <div className="contest-status-badge">
          {getStatusIcon(contest.status)}
          <span>{contest.status}</span>
        </div>
        <h1>{contest.title}</h1>
        <p className="contest-description">{contest.description}</p>
      </div>

      <div className="contest-info-grid">
        <div className="contest-info-card">
          <h3>Contest Details</h3>
          <div className="info-item">
            <FaCalendarAlt />
            <div>
              <strong>Start Time:</strong>
              <span>{formatDate(contest.startTime)}</span>
            </div>
          </div>
          <div className="info-item">
            <FaCalendarAlt />
            <div>
              <strong>End Time:</strong>
              <span>{formatDate(contest.endTime)}</span>
            </div>
          </div>
          <div className="info-item">
            <FaClock />
            <div>
              <strong>Duration:</strong>
              <span>{formatDuration(contest.duration)}</span>
            </div>
          </div>
          <div className="info-item">
            <FaUsers />
            <div>
              <strong>Participants:</strong>
              <span>{contest.participants?.length || 0} / {contest.maxParticipants}</span>
            </div>
          </div>
        </div>

        <div className="contest-actions-card">
          <h3>Actions</h3>
          {!hasJoined ? (
            <button 
              onClick={joinContest} 
              disabled={joining || contest.status === 'ended'}
              className="btn-primary"
            >
              {joining ? 'Joining...' : 'Join Contest'}
            </button>
          ) : (
            <div className="joined-status">
              <FaCheckCircle className="success-icon" />
              <span>You've joined this contest!</span>
            </div>
          )}
          
          <Link 
            to={`/contests/${contest.slug}/leaderboard`} 
            className="btn-secondary"
          >
            View Leaderboard
          </Link>
          
          <Link to="/contests" className="btn-outline">
            Back to Contests
          </Link>
        </div>
      </div>

      {contest.challenges && contest.challenges.length > 0 && (
        <div className="contest-challenges">
          <h3>Contest Challenges</h3>
          <div className="challenges-grid">
            {contest.challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-header">
                  <h4>{challenge.title}</h4>
                  <div className="challenge-meta">
                    <span className={`difficulty ${challenge.difficulty}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="points">
                      <FaStar /> {challenge.points}
                    </span>
                  </div>
                </div>
                <div className="challenge-stats">
                  <span>Solved: {challenge.solvedCount || 0}</span>
                </div>
                <Link 
                  to={`/challenges/${challenge.slug}`}
                  className="btn-small"
                >
                  <FaCode /> Solve
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestDetail;