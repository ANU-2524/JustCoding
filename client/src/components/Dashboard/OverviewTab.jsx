import React from 'react';
import DashboardMetrics from './DashboardMetrics';
import '../../Style/UserDashboard.css';

const OverviewTab = ({ profile, productivityMetrics, achievements }) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, {profile.displayName}! Here's your coding activity summary.</p>
      </div>

      <DashboardMetrics productivityMetrics={productivityMetrics} />

      {productivityMetrics.avgSessionDuration > 0 && (
        <div className="productivity-insights">
          <h3>Productivity Insights</h3>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Average Session Duration</span>
              <span className="insight-value">{productivityMetrics.avgSessionDuration.toFixed(1)} minutes</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Most Used Language</span>
              <span className="insight-value">{productivityMetrics.mostUsedLanguage}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Achievements Unlocked</span>
              <span className="insight-value">{achievements.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
