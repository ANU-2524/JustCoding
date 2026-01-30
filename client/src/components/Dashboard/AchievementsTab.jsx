import React from 'react';
import '../../Style/UserDashboard.css';

const AchievementsTab = ({ achievements }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Achievements</h2>
        <p>Your coding milestones and badges</p>
      </div>

      <div className="achievements-grid">
        {achievements.length === 0 ? (
          <div className="empty-state">
            <p>Keep coding to unlock achievements!</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div key={achievement.id} className="achievement-card earned">
              <div className="achievement-icon">{achievement.icon}</div>
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
              {achievement.date && (
                <small className="achievement-date">
                  Unlocked: {new Date(achievement.date).toLocaleDateString()}
                </small>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementsTab;
