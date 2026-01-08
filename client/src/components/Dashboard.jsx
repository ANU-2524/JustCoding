import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaFire, FaDownload, FaShare, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import ProgressService from '../services/progressService';
import jsPDF from 'jspdf';
import '../Style/Dashboard.css';

// Simple chart fallback components
const SimpleBarChart = ({ data }) => (
  <div className="simple-chart">
    {data.labels.map((label, index) => (
      <div key={label} className="chart-bar">
        <div className="bar-label">{label}</div>
        <div className="bar-container">
          <div 
            className="bar-fill" 
            style={{ height: `${(data.datasets[0].data[index] / Math.max(...data.datasets[0].data)) * 100}%` }}
          />
        </div>
        <div className="bar-value">{data.datasets[0].data[index]}</div>
      </div>
    ))}
  </div>
);

const SimpleDoughnutChart = ({ data }) => (
  <div className="simple-doughnut">
    {data.labels.map((label, index) => (
      <div key={label} className="doughnut-item">
        <div 
          className="color-dot" 
          style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
        />
        <span>{label}: {data.datasets[0].data[index]}</span>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboard, setLeaderboard] = useState([]);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadLeaderboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const data = await ProgressService.getDashboard();
    if (data) {
      setDashboardData(data);
      if (data.newBadges?.length > 0) {
        setNewBadges(data.newBadges);
      }
    } else {
      // Fallback to localStorage data
      setDashboardData(ProgressService.getFallbackData());
    }
    setLoading(false);
  };

  const loadLeaderboard = async () => {
    const data = await ProgressService.getLeaderboard();
    setLeaderboard(data);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('dashboard-content');
    
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('JustCode Progress Report', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`User: ${dashboardData.user.displayName}`, 20, 50);
    pdf.text(`Total Points: ${dashboardData.user.totalPoints}`, 20, 60);
    pdf.text(`Level: ${dashboardData.user.level}`, 20, 70);
    pdf.text(`Daily Streak: ${dashboardData.dailyStreak}`, 20, 80);
    pdf.text(`Badges Earned: ${dashboardData.badges.length}`, 20, 90);
    
    pdf.save('justcode-progress.pdf');
  };

  const shareProgress = () => {
    if (navigator.share && dashboardData) {
      navigator.share({
        title: 'My JustCode Progress',
        text: `I've earned ${dashboardData.user.totalPoints} points and ${dashboardData.badges.length} badges on JustCode!`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      const text = `Check out my JustCode progress: ${dashboardData.user.totalPoints} points, Level ${dashboardData.user.level}, ${dashboardData.badges.length} badges!`;
      navigator.clipboard.writeText(text);
      alert('Progress shared to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>Unable to load dashboard data. Please try again later.</p>
          <button onClick={loadDashboard} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  const eventChartData = {
    labels: Object.keys(dashboardData.eventStats).map(key => 
      key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [{
      label: 'Activities',
      data: Object.values(dashboardData.eventStats).map(stat => stat.count),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };

  const languageChartData = {
    labels: dashboardData.topLanguages.map(lang => lang._id),
    datasets: [{
      data: dashboardData.topLanguages.map(lang => lang.count),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ]
    }]
  };

  const getBadgeRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div className="dashboard-container">
      {newBadges.length > 0 && (
        <motion.div 
          className="new-badges-notification"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <h3>🎉 New Badges Earned!</h3>
          <div className="new-badges-list">
            {newBadges.map(badge => (
              <div key={badge.badgeId} className="new-badge">
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setNewBadges([])} className="close-notification">×</button>
        </motion.div>
      )}

      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome back, {dashboardData.user.displayName}!</h1>
          <div className="user-stats">
            <div className="stat-item">
              <FaTrophy className="stat-icon" />
              <span>{dashboardData.user.totalPoints} Points</span>
            </div>
            <div className="stat-item">
              <FaMedal className="stat-icon" />
              <span>Level {dashboardData.user.level}</span>
            </div>
            <div className="stat-item">
              <FaFire className="stat-icon" />
              <span>{dashboardData.dailyStreak} Day Streak</span>
            </div>
          </div>
        </div>
        <div className="dashboard-actions">
          <button onClick={exportToPDF} className="action-btn">
            <FaDownload /> Export PDF
          </button>
          <button onClick={shareProgress} className="action-btn">
            <FaShare /> Share Progress
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartBar /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <FaMedal /> Badges ({dashboardData.badges.length})
        </button>
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaTrophy /> Leaderboard
        </button>
      </div>

      <div id="dashboard-content" className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Activities</h3>
                <div className="stat-value">{dashboardData.totalEvents}</div>
              </div>
              <div className="stat-card">
                <h3>This Month</h3>
                <div className="stat-value">{dashboardData.monthlyEvents || 0}</div>
              </div>
              <div className="stat-card">
                <h3>This Week</h3>
                <div className="stat-value">{dashboardData.weeklyEvents || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Badges Earned</h3>
                <div className="stat-value">{dashboardData.badges.length}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Activity Breakdown</h3>
                <SimpleBarChart data={eventChartData} />
              </div>
              <div className="chart-card">
                <h3>Top Languages</h3>
                <SimpleDoughnutChart data={languageChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="badges-tab">
            <div className="badges-grid">
              {dashboardData.badges.map(badge => (
                <motion.div 
                  key={badge.badgeId}
                  className="badge-card"
                  whileHover={{ scale: 1.05 }}
                  style={{ borderColor: getBadgeRarityColor(badge.rarity) }}
                >
                  <div className="badge-icon-large">{badge.icon}</div>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  <div className="badge-meta">
                    <span className={`rarity ${badge.rarity}`}>{badge.rarity}</span>
                    <span className="points">+{badge.points} pts</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {dashboardData.badges.length === 0 && (
              <div className="empty-state">
                <FaMedal size={48} />
                <h3>No badges yet!</h3>
                <p>Start coding to earn your first badge</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab">
            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
                <div key={user.userId} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="user-info">
                    <span className="username">{user.displayName}</span>
                    <span className="level">Level {user.level}</span>
                  </div>
                  <div className="points">{user.totalPoints} pts</div>
                  <div className="badges-count">{user.badges.length} badges</div>
                </div>
              ))}
            </div>
            {leaderboard.length === 0 && (
              <div className="empty-state">
                <FaTrophy size={48} />
                <h3>Leaderboard coming soon!</h3>
                <p>Be the first to climb the ranks</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;