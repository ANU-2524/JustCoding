import React from 'react';
import { FaChartLine, FaCode, FaFolder, FaStar, FaUser, FaUsers, FaCog, FaQuestionCircle, FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../Style/UserDashboard.css';

const DashboardSidebar = ({ 
  profile, 
  tempPhoto, 
  identityLabel, 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}) => {
  const navigate = useNavigate();
  return (
    <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className={`sidebar-profile ${sidebarCollapsed ? 'compact' : ''}`}>
        <img 
          src={tempPhoto || profile.photoURL || '/default-avatar.png'} 
          alt="Profile" 
          className="sidebar-avatar"
        />
        {!sidebarCollapsed && (
          <div className="sidebar-user-info">
            <h3>{profile.displayName}</h3>
            <p>{identityLabel}</p>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          data-tooltip="Overview"
        >
          <span className="nav-item-icon"><FaChartLine /></span>
          {!sidebarCollapsed && <span>Overview</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'coding-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('coding-stats')}
          data-tooltip="Coding Stats"
        >
          <span className="nav-item-icon"><FaCode /></span>
          {!sidebarCollapsed && <span>Coding Stats</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'snippets' ? 'active' : ''}`}
          onClick={() => setActiveTab('snippets')}
          data-tooltip="Snippets Library"
        >
          <span className="nav-item-icon"><FaFolder /></span>
          {!sidebarCollapsed && <span>Snippets Library</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
          data-tooltip="Achievements"
        >
          <span className="nav-item-icon"><FaStar /></span>
          {!sidebarCollapsed && <span>Achievements</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
          data-tooltip="Portfolio"
        >
          <span className="nav-item-icon"><FaUser /></span>
          {!sidebarCollapsed && <span>Portfolio</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'collaboration' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaboration')}
          data-tooltip="Collaboration"
        >
          <span className="nav-item-icon"><FaUsers /></span>
          {!sidebarCollapsed && <span>Collaboration</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          data-tooltip="Settings"
        >
          <span className="nav-item-icon"><FaCog /></span>
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
          data-tooltip="Feedback"
        >
          <span className="nav-item-icon"><FaQuestionCircle /></span>
          {!sidebarCollapsed && <span>Feedback</span>}
        </button>
      </nav>

      {/* Quick Links Section */}
      <div className="sidebar-quick-links">
        <button
          className="quick-link-item"
          onClick={() => navigate('/faq')}
          data-tooltip="FAQ"
        >
          <span className="nav-item-icon"><FaQuestionCircle /></span>
          {!sidebarCollapsed && <span>FAQ</span>}
        </button>
        <button
          className="quick-link-item"
          onClick={() => navigate('/contributing')}
          data-tooltip="Contributing"
        >
          <span className="nav-item-icon"><FaGithub /></span>
          {!sidebarCollapsed && <span>Contributing</span>}
        </button>
      </div>
      
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? '»' : '«'}
      </button>
    </div>
  );
};

export default DashboardSidebar;
