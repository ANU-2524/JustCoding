import React from 'react';
import { FaChartLine, FaCode, FaFolder, FaBrain, FaUsers, FaStar } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const DashboardMetrics = ({ productivityMetrics }) => {
  return (
    <div className="overview-metrics">
      <div className="metric-card primary">
        <div className="metric-icon">
          <FaCode />
        </div>
        <div className="metric-info">
          <div className="metric-value">{productivityMetrics.totalRuns}</div>
          <div className="metric-label">Code Executions</div>
        </div>
      </div>
      
      <div className="metric-card secondary">
        <div className="metric-icon">
          <FaFolder />
        </div>
        <div className="metric-info">
          <div className="metric-value">{productivityMetrics.totalSnippets}</div>
          <div className="metric-label">Saved Snippets</div>
        </div>
      </div>
      
      <div className="metric-card tertiary">
        <div className="metric-icon">
          <FaUsers />
        </div>
        <div className="metric-info">
          <div className="metric-value">{productivityMetrics.totalSessions}</div>
          <div className="metric-label">Collaboration Sessions</div>
        </div>
      </div>
      
      <div className="metric-card quaternary">
        <div className="metric-icon">
          <FaBrain />
        </div>
        <div className="metric-info">
          <div className="metric-value">{productivityMetrics.totalAIUses}</div>
          <div className="metric-label">AI Assists</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
