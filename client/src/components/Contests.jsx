import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaClock, FaUsers, FaCalendarAlt, FaPlay, FaStop, FaCheckCircle } from 'react-icons/fa';
import Breadcrumb from './Breadcrumb';
import '../Style/Contests.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/challenges/contests/list`);
      const data = await response.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
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
      month: 'short',
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

  return (
    <div className="contests-container">
      <Breadcrumb 
        items={[
          { label: 'Contests', path: null }
        ]}
      />

      <div className="contests-header">
        <h1><FaTrophy /> Coding Contests</h1>
        <p>Compete with developers worldwide and showcase your skills</p>
      </div>

      {loading ? (
        <div className="loading">Loading contests...</div>
      ) : (
        <div className="contests-grid">
          {contests.length === 0 ? (
            <div className="empty-state">
              <FaTrophy className="empty-icon" />
              <h3>No contests available</h3>
              <p>Check back later for upcoming contests!</p>
            </div>
          ) : (
            contests.map((contest) => (
              <div key={contest._id} className={`contest-card ${contest.status}`}>
                <div className="contest-header">
                  <div className="contest-status">
                    {getStatusIcon(contest.status)}
                    <span className="status-text">{contest.status}</span>
                  </div>
                  <h3>{contest.title}</h3>
                </div>

                <p className="contest-description">{contest.description}</p>

                <div className="contest-details">
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>Start: {formatDate(contest.startTime)}</span>
                  </div>
                  <div className="detail-item">
                    <FaClock />
                    <span>Duration: {formatDuration(contest.duration)}</span>
                  </div>
                  <div className="detail-item">
                    <FaUsers />
                    <span>{contest.participantCount || 0} participants</span>
                  </div>
                </div>

                <div className="contest-actions">
                  <Link 
                    to={`/contests/${contest.slug}`} 
                    className="btn-primary"
                  >
                    View Contest
                  </Link>
                  <Link 
                    to={`/contests/${contest.slug}/leaderboard`} 
                    className="btn-secondary"
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Contests;