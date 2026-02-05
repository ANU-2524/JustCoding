import React from 'react';
import { FaChartBar, FaClock, FaCode, FaBrain, FaCheck, FaTimes } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const CodingStatsTab = ({ stats, sessions, snippets }) => {
  // Calculate advanced statistics
  const totalExecutionTime = sessions.reduce((sum, session) => {
    if (session.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      return sum + (end - start);
    }
    return sum;
  }, 0);

  const avgSessionTime = sessions.length > 0 ? totalExecutionTime / sessions.length / 1000 / 60 : 0;
  
  const languageDistribution = snippets.reduce((acc, snippet) => {
    acc[snippet.language] = (acc[snippet.language] || 0) + 1;
    return acc;
  }, {});

  const mostUsedLanguage = Object.keys(languageDistribution).length > 0 
    ? Object.entries(languageDistribution).sort(([,a], [,b]) => b - a)[0][0]
    : 'None';

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Coding Statistics</h2>
        <p>Detailed analytics of your coding activity</p>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3><FaChartBar /> Total Executions</h3>
          <div className="stat-number">{stats?.runs || 0}</div>
          <div className="stat-description">Code snippets executed</div>
        </div>
        
        <div className="stat-card">
          <h3><FaClock /> Average Session Time</h3>
          <div className="stat-number">{avgSessionTime.toFixed(1)}m</div>
          <div className="stat-description">Per collaboration session</div>
        </div>
        
        <div className="stat-card">
          <h3><FaCode /> Snippets Created</h3>
          <div className="stat-number">{snippets.length}</div>
          <div className="stat-description">Total code snippets saved</div>
        </div>
        
        <div className="stat-card">
          <h3><FaBrain /> AI Interactions</h3>
          <div className="stat-number">{(stats?.aiExplains || 0) + (stats?.aiDebugs || 0)}</div>
          <div className="stat-description">AI assistant usage</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-section">
        <h3>Activity Overview</h3>
        <div className="chart-placeholder">
          <FaChartBar style={{ fontSize: '3rem', marginBottom: '15px', color: '#666' }} />
          <p>Interactive charts coming soon</p>
          <p className="stat-description">Visualize your coding patterns and progress over time</p>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="stats-grid">
        <div className="stat-card wide">
          <h3><FaCode /> Language Distribution</h3>
          <div className="language-distribution">
            {Object.keys(languageDistribution).length > 0 ? (
              Object.entries(languageDistribution).map(([language, count]) => (
                <div key={language} className="language-item">
                  <span className="language-name">{language}</span>
                  <div className="language-progress">
                    <div 
                      className="language-bar" 
                      style={{ 
                        width: `${(count / snippets.length) * 100}%`,
                        backgroundColor: '#d4581f'
                      }}
                    ></div>
                  </div>
                  <span className="language-count">{count}</span>
                </div>
              ))
            ) : (
              <p className="stat-description">No snippets created yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3><FaCheck /> Success Rate</h3>
          <div className="stat-number">
            {stats?.runs > 0 ? Math.round(((stats?.runs - (stats?.errors || 0)) / stats.runs) * 100) : 0}%
          </div>
          <div className="stat-description">Successful executions</div>
        </div>
        
        <div className="stat-card">
          <h3><FaTimes /> Error Rate</h3>
          <div className="stat-number">{stats?.errors || 0}</div>
          <div className="stat-description">Execution errors encountered</div>
        </div>
        
        <div className="stat-card">
          <h3><FaCode /> Favorite Language</h3>
          <div className="stat-number" style={{ fontSize: '1.5rem' }}>{mostUsedLanguage}</div>
          <div className="stat-description">Most frequently used</div>
        </div>
        
        <div className="stat-card">
          <h3><FaClock /> Total Coding Time</h3>
          <div className="stat-number">{Math.round(totalExecutionTime / 1000 / 60)}m</div>
          <div className="stat-description">Across all sessions</div>
        </div>
      </div>
    </div>
  );
};

export default CodingStatsTab;