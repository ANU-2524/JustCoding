import React, { useState, useEffect } from 'react';
import { FaDownload, FaFileExport, FaUser, FaTrophy, FaCode, FaMedal } from 'react-icons/fa';
import '../Style/ProgressExport.css';

const ProgressExport = () => {
  const [userData, setUserData] = useState({
    user: {
      userId: 'user123',
      displayName: 'John Doe',
      totalPoints: 1250,
      level: 8,
      joinedAt: '2024-01-15'
    },
    summary: {
      totalEvents: 156,
      totalPoints: 1250,
      level: 8,
      dailyStreak: 12,
      badgeCount: 8
    },
    eventStats: {
      code_run: 89,
      code_submit: 45,
      challenge_solve: 12,
      tutorial_view: 10
    },
    topLanguages: [
      { language: 'JavaScript', count: 45 },
      { language: 'Python', count: 32 },
      { language: 'Java', count: 18 }
    ],
    badges: [
      { name: 'First Steps', description: 'Completed first code run', category: 'milestone', rarity: 'common', points: 10 },
      { name: 'Problem Solver', description: 'Solved 10 challenges', category: 'achievement', rarity: 'rare', points: 50 },
      { name: 'Code Warrior', description: 'Daily coding streak of 7 days', category: 'streak', rarity: 'epic', points: 100 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-export-${userData.user.userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Progress exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="progress-export">
      <div className="export-header">
        <h1><FaFileExport /> Export Progress</h1>
        <p>Download your coding journey and achievements</p>
      </div>

      <div className="export-preview">
        <div className="preview-section">
          <h2><FaUser /> User Summary</h2>
          <div className="user-stats">
            <div className="stat-card">
              <FaTrophy className="stat-icon" />
              <div>
                <h3>{userData.summary.totalPoints}</h3>
                <p>Total Points</p>
              </div>
            </div>
            <div className="stat-card">
              <FaCode className="stat-icon" />
              <div>
                <h3>{userData.summary.totalEvents}</h3>
                <p>Total Activities</p>
              </div>
            </div>
            <div className="stat-card">
              <FaMedal className="stat-icon" />
              <div>
                <h3>{userData.summary.badgeCount}</h3>
                <p>Badges Earned</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="level-badge">L{userData.summary.level}</div>
              <div>
                <h3>Level {userData.summary.level}</h3>
                <p>Current Level</p>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h2>Activity Breakdown</h2>
          <div className="activity-stats">
            {Object.entries(userData.eventStats).map(([activity, count]) => (
              <div key={activity} className="activity-item">
                <span className="activity-name">{activity.replace('_', ' ')}</span>
                <span className="activity-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-section">
          <h2>Top Languages</h2>
          <div className="languages-list">
            {userData.topLanguages.map((lang, index) => (
              <div key={lang.language} className="language-item">
                <span className="language-rank">#{index + 1}</span>
                <span className="language-name">{lang.language}</span>
                <span className="language-count">{lang.count} uses</span>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-section">
          <h2>Badges & Achievements</h2>
          <div className="badges-grid">
            {userData.badges.map((badge, index) => (
              <div key={index} className="badge-card">
                <div 
                  className="badge-icon"
                  style={{ backgroundColor: getRarityColor(badge.rarity) }}
                >
                  <FaMedal />
                </div>
                <div className="badge-info">
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  <span className={`badge-rarity ${badge.rarity}`}>
                    {badge.rarity} • {badge.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="export-controls">
        <div className="format-selector">
          <label>Export Format:</label>
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="pdf">PDF Report</option>
            <option value="json">JSON Data</option>
            <option value="csv">CSV Summary</option>
          </select>
        </div>
        
        <button 
          className="export-btn"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <>Exporting...</>
          ) : (
            <>
              <FaDownload /> Export Progress
            </>
          )}
        </button>
      </div>

      <div className="export-info">
        <h3>What's Included:</h3>
        <ul>
          <li>Complete activity history and statistics</li>
          <li>All earned badges and achievements</li>
          <li>Programming language usage breakdown</li>
          <li>Progress timeline and milestones</li>
          <li>Performance metrics and insights</li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressExport;