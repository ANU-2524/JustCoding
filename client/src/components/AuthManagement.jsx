import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import '../Style/AuthManagement.css';

const AuthManagement = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [authStats, setAuthStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample sessions data
    setSessions([
      {
        id: 1,
        userId: 'user123',
        username: 'john_doe',
        email: 'john@example.com',
        loginTime: '2024-01-15 10:30:00',
        lastActivity: '2024-01-15 14:45:00',
        ipAddress: '192.168.1.100',
        device: 'Chrome on Windows',
        status: 'active'
      },
      {
        id: 2,
        userId: 'user456',
        username: 'jane_smith',
        email: 'jane@example.com',
        loginTime: '2024-01-15 09:15:00',
        lastActivity: '2024-01-15 12:20:00',
        ipAddress: '192.168.1.101',
        device: 'Safari on macOS',
        status: 'inactive'
      },
      {
        id: 3,
        userId: 'user789',
        username: 'mike_wilson',
        email: 'mike@example.com',
        loginTime: '2024-01-15 11:00:00',
        lastActivity: '2024-01-15 15:10:00',
        ipAddress: '192.168.1.102',
        device: 'Firefox on Linux',
        status: 'active'
      }
    ]);

    // Sample auth statistics
    setAuthStats({
      totalUsers: 1247,
      activeUsers: 89,
      todayLogins: 156,
      failedAttempts: 23,
      newRegistrations: 12,
      passwordResets: 5,
      emailsSent: 45,
      avgSessionTime: '2h 34m'
    });
  };

  const terminateSession = async (sessionId) => {
    try {
      // API call would go here
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const resetUserPassword = async (userId) => {
    setLoading(true);
    try {
      // API call would go here
      alert(`Password reset email sent for user ${userId}`);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
    setLoading(false);
  };

  const sendNotificationEmail = async (userId) => {
    setLoading(true);
    try {
      // API call would go here
      alert(`Notification email sent to user ${userId}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
    setLoading(false);
  };

  return (
    <div className={`auth-management-container ${isDark ? 'dark' : ''}`}>
      <div className="auth-header">
        <h1>🔐 Authentication Management</h1>
        <p>Manage user sessions, passwords, and authentication analytics</p>
      </div>
      
      <div className="auth-main">
        <div className="stats-overview">
          {authStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{authStats.totalUsers}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-card active">
                <span className="stat-icon">🟢</span>
                <span className="stat-value">{authStats.activeUsers}</span>
                <span className="stat-label">Active Now</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔑</span>
                <span className="stat-value">{authStats.todayLogins}</span>
                <span className="stat-label">Today's Logins</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-icon">⚠️</span>
                <span className="stat-value">{authStats.failedAttempts}</span>
                <span className="stat-label">Failed Attempts</span>
              </div>
            </div>
          )}
        </div>

        <div className="auth-content">
          <div className="tabs-header">
            <button 
              className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              🖥️ Active Sessions
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
            <button 
              className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              🛠️ Admin Tools
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'sessions' && (
              <div className="sessions-content">
                <div className="sessions-header">
                  <h3>User Sessions ({sessions.length})</h3>
                  <button className="refresh-btn">🔄 Refresh</button>
                </div>
                
                <div className="sessions-table">
                  {sessions.map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-info">
                        <div className="session-user">
                          <span className="username">{session.username}</span>
                          <span className="email">{session.email}</span>
                        </div>
                        <div className="session-details">
                          <span className="detail">📅 {session.loginTime}</span>
                          <span className="detail">🌐 {session.ipAddress}</span>
                          <span className="detail">💻 {session.device}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <span className={`status ${session.status}`}>
                          {session.status === 'active' ? '🟢' : '🔴'} {session.status}
                        </span>
                        <button 
                          onClick={() => terminateSession(session.id)}
                          className="terminate-btn"
                        >
                          🚫 Terminate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-content">
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>📈 Registration Trends</h4>
                    <div className="metric-row">
                      <span>New Registrations Today:</span>
                      <span className="metric-value">{authStats?.newRegistrations}</span>
                    </div>
                    <div className="metric-row">
                      <span>Average Session Time:</span>
                      <span className="metric-value">{authStats?.avgSessionTime}</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h4>🔒 Security Metrics</h4>
                    <div className="metric-row">
                      <span>Password Resets Today:</span>
                      <span className="metric-value">{authStats?.passwordResets}</span>
                    </div>
                    <div className="metric-row">
                      <span>Failed Login Attempts:</span>
                      <span className="metric-value warning">{authStats?.failedAttempts}</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h4>📧 Email Notifications</h4>
                    <div className="metric-row">
                      <span>Emails Sent Today:</span>
                      <span className="metric-value">{authStats?.emailsSent}</span>
                    </div>
                    <div className="metric-row">
                      <span>Delivery Rate:</span>
                      <span className="metric-value success">98.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="tools-content">
                <div className="tools-grid">
                  <div className="tool-card">
                    <h4>🔑 Password Management</h4>
                    <p>Reset user passwords and manage security policies</p>
                    <div className="tool-actions">
                      <input 
                        type="text" 
                        placeholder="Enter user ID or email"
                        className="tool-input"
                      />
                      <button 
                        onClick={() => resetUserPassword('sample-user')}
                        disabled={loading}
                        className="tool-btn primary"
                      >
                        {loading ? '⏳' : '🔄'} Reset Password
                      </button>
                    </div>
                  </div>
                  
                  <div className="tool-card">
                    <h4>📧 Email Notifications</h4>
                    <p>Send notifications and manage email templates</p>
                    <div className="tool-actions">
                      <select className="tool-input">
                        <option>Welcome Email</option>
                        <option>Password Reset</option>
                        <option>Security Alert</option>
                        <option>Account Verification</option>
                      </select>
                      <button 
                        onClick={() => sendNotificationEmail('sample-user')}
                        disabled={loading}
                        className="tool-btn secondary"
                      >
                        {loading ? '⏳' : '📤'} Send Email
                      </button>
                    </div>
                  </div>
                  
                  <div className="tool-card">
                    <h4>🛡️ Security Actions</h4>
                    <p>Manage user accounts and security settings</p>
                    <div className="tool-actions">
                      <button className="tool-btn warning">🔒 Lock Account</button>
                      <button className="tool-btn success">✅ Verify Account</button>
                      <button className="tool-btn danger">🗑️ Delete Account</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthManagement;