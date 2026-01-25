import React, { useState, useEffect } from 'react';
import { FaMedal, FaTrophy, FaStar, FaCrown, FaLock, FaFire } from 'react-icons/fa';
import '../Style/BadgesPage.css';

const BadgesPage = () => {
  const [activeTab, setActiveTab] = useState('earned');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [earnedBadges] = useState([
    {
      id: 1,
      name: 'First Steps',
      description: 'Completed your first code run',
      category: 'milestone',
      rarity: 'common',
      points: 10,
      earnedAt: '2024-01-15',
      icon: 'star'
    },
    {
      id: 2,
      name: 'Problem Solver',
      description: 'Solved 10 coding challenges',
      category: 'achievement',
      rarity: 'rare',
      points: 50,
      earnedAt: '2024-02-01',
      icon: 'trophy'
    },
    {
      id: 3,
      name: 'Code Warrior',
      description: 'Maintained a 7-day coding streak',
      category: 'streak',
      rarity: 'epic',
      points: 100,
      earnedAt: '2024-02-10',
      icon: 'fire'
    },
    {
      id: 4,
      name: 'JavaScript Master',
      description: 'Completed 50 JavaScript challenges',
      category: 'language',
      rarity: 'legendary',
      points: 200,
      earnedAt: '2024-02-20',
      icon: 'crown'
    }
  ]);

  const [availableBadges] = useState([
    {
      id: 5,
      name: 'Speed Demon',
      description: 'Solve a challenge in under 5 minutes',
      category: 'achievement',
      rarity: 'rare',
      points: 75,
      progress: 0,
      requirement: 1,
      icon: 'medal'
    },
    {
      id: 6,
      name: 'Marathon Runner',
      description: 'Maintain a 30-day coding streak',
      category: 'streak',
      rarity: 'legendary',
      points: 500,
      progress: 12,
      requirement: 30,
      icon: 'fire'
    },
    {
      id: 7,
      name: 'Python Expert',
      description: 'Complete 100 Python challenges',
      category: 'language',
      rarity: 'epic',
      points: 300,
      progress: 23,
      requirement: 100,
      icon: 'crown'
    },
    {
      id: 8,
      name: 'Contest Champion',
      description: 'Win first place in a coding contest',
      category: 'contest',
      rarity: 'legendary',
      points: 1000,
      progress: 0,
      requirement: 1,
      icon: 'trophy'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'milestone', name: 'Milestones' },
    { id: 'achievement', name: 'Achievements' },
    { id: 'streak', name: 'Streaks' },
    { id: 'language', name: 'Languages' },
    { id: 'contest', name: 'Contests' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'star': return <FaStar />;
      case 'trophy': return <FaTrophy />;
      case 'fire': return <FaFire />;
      case 'crown': return <FaCrown />;
      case 'medal': return <FaMedal />;
      default: return <FaMedal />;
    }
  };

  const filteredEarnedBadges = selectedCategory === 'all' 
    ? earnedBadges 
    : earnedBadges.filter(badge => badge.category === selectedCategory);

  const filteredAvailableBadges = selectedCategory === 'all'
    ? availableBadges
    : availableBadges.filter(badge => badge.category === selectedCategory);

  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);

  return (
    <div className="badges-page">
      <div className="badges-header">
        <h1><FaMedal /> Badges & Achievements</h1>
        <div className="badges-stats">
          <div className="stat">
            <span className="stat-number">{earnedBadges.length}</span>
            <span className="stat-label">Badges Earned</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalPoints}</span>
            <span className="stat-label">Badge Points</span>
          </div>
          <div className="stat">
            <span className="stat-number">{availableBadges.length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      <div className="badges-controls">
        <div className="tab-selector">
          <button 
            className={activeTab === 'earned' ? 'active' : ''}
            onClick={() => setActiveTab('earned')}
          >
            Earned Badges
          </button>
          <button 
            className={activeTab === 'available' ? 'active' : ''}
            onClick={() => setActiveTab('available')}
          >
            Available Badges
          </button>
        </div>

        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="badges-content">
        {activeTab === 'earned' ? (
          <div className="badges-grid">
            {filteredEarnedBadges.length === 0 ? (
              <div className="empty-state">
                <FaMedal className="empty-icon" />
                <h3>No badges in this category</h3>
                <p>Keep coding to earn more badges!</p>
              </div>
            ) : (
              filteredEarnedBadges.map(badge => (
                <div key={badge.id} className="badge-card earned">
                  <div 
                    className="badge-icon"
                    style={{ backgroundColor: getRarityColor(badge.rarity) }}
                  >
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div className="badge-info">
                    <h3>{badge.name}</h3>
                    <p>{badge.description}</p>
                    <div className="badge-meta">
                      <span className={`rarity ${badge.rarity}`}>
                        {badge.rarity}
                      </span>
                      <span className="points">+{badge.points} pts</span>
                    </div>
                    <div className="earned-date">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="badges-grid">
            {filteredAvailableBadges.length === 0 ? (
              <div className="empty-state">
                <FaLock className="empty-icon" />
                <h3>No available badges in this category</h3>
                <p>Check other categories for more challenges!</p>
              </div>
            ) : (
              filteredAvailableBadges.map(badge => (
                <div key={badge.id} className="badge-card available">
                  <div className="badge-icon locked">
                    <FaLock />
                  </div>
                  <div className="badge-info">
                    <h3>{badge.name}</h3>
                    <p>{badge.description}</p>
                    <div className="badge-meta">
                      <span className={`rarity ${badge.rarity}`}>
                        {badge.rarity}
                      </span>
                      <span className="points">+{badge.points} pts</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-label">
                        Progress: {badge.progress}/{badge.requirement}
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(badge.progress / badge.requirement) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;