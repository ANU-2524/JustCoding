

import React, { useState, useEffect } from 'react';
import { FaDownload, FaFileExport, FaUser, FaTrophy, FaCode, FaMedal } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { exportUserProgress } from '../services/progressService';
import '../Style/ProgressExport.css';

const DEMO_DATA = {
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
};


const ProgressExport = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    if (!currentUser?.uid) return;
    setLoading(true);
    exportUserProgress(currentUser.uid)
      .then((data) => setUserData(data))
      .catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleExport = async () => {
    const data = userData || DEMO_DATA;
    setLoading(true);
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-export-${data.user?.userId || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
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

  if (loading) {
    return <div className="progress-export"><h2>Loading your progress...</h2></div>;
  }
  // Show demo data if real data is not available
  const previewData = userData || DEMO_DATA;
  return (
    <div className="progress-export" style={{maxWidth: 900, margin: '40px auto', background: '#181c24', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32}}>
      <div className="export-header" style={{textAlign: 'center', marginBottom: 32}}>
        <h1 style={{fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8}}><FaFileExport /> Export Progress</h1>
        <p style={{color: '#b0b8c9', fontSize: 18}}>Download your coding journey and achievements</p>
      </div>
      <div className="export-sections" style={{display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between'}}>
        {/* Summary Card */}
        <div style={{flex: '1 1 260px', background: '#23283a', borderRadius: 12, padding: 24, minWidth: 260}}>
          <h2 style={{color: '#fff', fontSize: 22, marginBottom: 16}}><FaUser /> {previewData.user.displayName || 'User'}</h2>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
            <div style={{flex: '1 1 100px', background: '#2d3347', borderRadius: 8, padding: 12, textAlign: 'center'}}>
              <FaTrophy style={{color: '#ffd700', fontSize: 22}} />
              <div style={{color: '#fff', fontWeight: 600, fontSize: 20}}>{previewData.summary.totalPoints}</div>
              <div style={{color: '#b0b8c9', fontSize: 14}}>Points</div>
            </div>
            <div style={{flex: '1 1 100px', background: '#2d3347', borderRadius: 8, padding: 12, textAlign: 'center'}}>
              <FaCode style={{color: '#4fd1c5', fontSize: 22}} />
              <div style={{color: '#fff', fontWeight: 600, fontSize: 20}}>{previewData.summary.totalEvents}</div>
              <div style={{color: '#b0b8c9', fontSize: 14}}>Activities</div>
            </div>
            <div style={{flex: '1 1 100px', background: '#2d3347', borderRadius: 8, padding: 12, textAlign: 'center'}}>
              <FaMedal style={{color: '#f59e0b', fontSize: 22}} />
              <div style={{color: '#fff', fontWeight: 600, fontSize: 20}}>{previewData.summary.badgeCount}</div>
              <div style={{color: '#b0b8c9', fontSize: 14}}>Badges</div>
            </div>
            <div style={{flex: '1 1 100px', background: '#2d3347', borderRadius: 8, padding: 12, textAlign: 'center'}}>
              <div style={{background: '#4fd1c5', color: '#23283a', borderRadius: 20, padding: '2px 12px', fontWeight: 700, display: 'inline-block'}}>L{previewData.summary.level}</div>
              <div style={{color: '#fff', fontWeight: 600, fontSize: 20}}>Level {previewData.summary.level}</div>
              <div style={{color: '#b0b8c9', fontSize: 14}}>Current Level</div>
            </div>
          </div>
        </div>
        {/* Activity Breakdown */}
        <div style={{flex: '1 1 220px', background: '#23283a', borderRadius: 12, padding: 24, minWidth: 220}}>
          <h3 style={{color: '#fff', fontSize: 18, marginBottom: 12}}>Activity Breakdown</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {Object.entries(previewData.eventStats).map(([activity, count]) => (
              <div key={activity} style={{display: 'flex', justifyContent: 'space-between', color: '#b0b8c9', fontSize: 15}}>
                <span style={{textTransform: 'capitalize'}}>{activity.replace('_', ' ')}</span>
                <span style={{color: '#fff', fontWeight: 600}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top Languages */}
        <div style={{flex: '1 1 220px', background: '#23283a', borderRadius: 12, padding: 24, minWidth: 220}}>
          <h3 style={{color: '#fff', fontSize: 18, marginBottom: 12}}>Top Languages</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {previewData.topLanguages.map((lang, idx) => (
              <div key={lang.language} style={{display: 'flex', alignItems: 'center', gap: 8, color: '#b0b8c9', fontSize: 15}}>
                <span style={{fontWeight: 700, color: '#4fd1c5'}}>#{idx + 1}</span>
                <span style={{color: '#fff'}}>{lang.language}</span>
                <span style={{marginLeft: 'auto', color: '#b0b8c9'}}>{lang.count} uses</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Badges & Achievements */}
      <div style={{marginTop: 32, background: '#23283a', borderRadius: 12, padding: 24}}>
        <h3 style={{color: '#fff', fontSize: 18, marginBottom: 16}}>Badges & Achievements</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
          {previewData.badges.map((badge, idx) => (
            <div key={idx} style={{background: '#2d3347', borderRadius: 10, padding: 16, minWidth: 180, flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{background: getRarityColor(badge.rarity), borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22}}>
                <FaMedal />
              </div>
              <div>
                <div style={{fontWeight: 700, color: '#fff'}}>{badge.name}</div>
                <div style={{fontSize: 14, color: '#b0b8c9'}}>{badge.description}</div>
                <div style={{fontSize: 13, color: '#ffd700', fontWeight: 600}}>{badge.rarity} • {badge.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Export Button */}
      <div className="export-controls" style={{marginTop: 32, textAlign: 'center'}}>
        <button 
          className="export-btn"
          style={{fontSize: 18, padding: '12px 32px', borderRadius: 8, background: '#4fd1c5', color: '#23283a', fontWeight: 700, border: 'none', boxShadow: '0 2px 8px #0003', cursor: 'pointer'}}
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
    </div>
  );
};

export default ProgressExport;