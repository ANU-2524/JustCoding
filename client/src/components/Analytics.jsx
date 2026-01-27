import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaChartLine, FaStar, FaTrophy, FaCode, FaFire, FaCalendarAlt, FaUser, FaBrain, FaRocket } from 'react-icons/fa';
import '../Style/Analytics.css';

const Analytics = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const userId = currentUser.uid || currentUser.email || 'guest';
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';
      const response = await fetch(`${backendUrl}/api/progress/dashboard/${userId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeName) => {
    const icons = {
      'First Steps': <FaRocket />,
      'Code Runner': <FaCode />,
      'AI Explorer': <FaBrain />,
      'Collaborator': <FaUser />,
      'Snippet Creator': <FaStar />
    };
    return icons[badgeName] || <FaTrophy />;
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  if (!currentUser) {
    return (
      <div className="analytics-container">
        <div className="auth-required">
          <FaUser className="auth-icon" />
          <h2>Login Required</h2>
          <p>Please login to view your progress and analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading your analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1><FaChartLine /> Your Progress Analytics</h1>
        <p>Track your coding journey and achievements</p>
      </div>

      {analytics ? (
        <div className="analytics-content">
          {/* Overview Cards */}
          <div className="overview-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaCode />
              </div>
              <div className="stat-info">
                <div className="stat-value">{analytics.totalEvents || 0}</div>
                <div className="stat-label">Total Activities</div>
              </div>
            </div>

            <div className="stat-card secondary">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-info">
                <div className="stat-value">{analytics.user?.totalPoints || 0}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>

            <div className="stat-card accent">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-info">
                <div className="stat-value">{analytics.user?.level || 1}</div>
                <div className="stat-label">Current Level</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FaFire />
              </div>
              <div className="stat-info">
                <div className="stat-value">{analytics.dailyStreak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Activity Breakdown</h3>
              <div className="activity-stats">
                {analytics.eventStats && Object.entries(analytics.eventStats).map(([event, count]) => (
                  <div key={event} className="activity-item">
                    <span className="activity-name">{event.replace('_', ' ')}</span>
                    <div className="activity-bar">
                      <div 
                        className="activity-fill" 
                        style={{ width: `${getProgressPercentage(count, Math.max(...Object.values(analytics.eventStats)))}%` }}
                      ></div>
                    </div>
                    <span className="activity-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Programming Languages</h3>
              <div className="languages-stats">
                {analytics.topLanguages && analytics.topLanguages.length > 0 ? (
                  analytics.topLanguages.map((lang, index) => (
                    <div key={index} className="language-item">
                      <span className="language-name">{lang._id || 'Unknown'}</span>
                      <div className="language-bar">
                        <div 
                          className="language-fill" 
                          style={{ width: `${getProgressPercentage(lang.count, analytics.topLanguages[0].count)}%` }}
                        ></div>
                      </div>
                      <span className="language-count">{lang.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No language data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="badges-section">
            <h3>Your Badges</h3>
            <div className="badges-grid">
              {analytics.badges && analytics.badges.length > 0 ? (
                analytics.badges.map((badge, index) => (
                  <div key={index} className="badge-card">
                    <div className="badge-icon">
                      {getBadgeIcon(badge.name)}
                    </div>
                    <div className="badge-info">
                      <h4>{badge.name}</h4>
                      <p>{badge.description}</p>
                      <span className="badge-points">+{badge.points} points</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-badges">
                  <FaTrophy className="empty-icon" />
                  <p>No badges earned yet. Start coding to unlock achievements!</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Goals */}
          <div className="goals-section">
            <h3>Progress Goals</h3>
            <div className="goals-grid">
              <div className="goal-card">
                <h4>Code Runs</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage(analytics.eventStats?.code_run || 0, 50)}%` }}
                  ></div>
                </div>
                <span>{analytics.eventStats?.code_run || 0} / 50</span>
              </div>

              <div className="goal-card">
                <h4>AI Interactions</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage((analytics.eventStats?.ai_explain || 0) + (analytics.eventStats?.ai_debug || 0), 20)}%` }}
                  ></div>
                </div>
                <span>{(analytics.eventStats?.ai_explain || 0) + (analytics.eventStats?.ai_debug || 0)} / 20</span>
              </div>

              <div className="goal-card">
                <h4>Challenges Solved</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage(analytics.eventStats?.challenge_solve || 0, 10)}%` }}
                  ></div>
                </div>
                <span>{analytics.eventStats?.challenge_solve || 0} / 10</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-state">
          <FaChartLine className="empty-icon" />
          <h3>No Analytics Data</h3>
          <p>Start using JustCode to see your progress analytics!</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;