import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUser, FaCode, FaChartLine, FaFolder, FaUsers, FaHistory, FaPalette, FaCog, FaShare, FaCopy, FaEye, FaStar, FaBug, FaCheck, FaClock, FaCodeBranch, FaDatabase, FaServer, FaMobile, FaDesktop, FaGamepad, FaRobot, FaBrain, FaLightbulb, FaTerminal, FaNetworkWired, FaCloud, FaLock, FaUnlock, FaEyeSlash, FaUserFriends, FaUserPlus, FaGithub, FaLinkedin } from 'react-icons/fa';
import '../Style/UserDashboard.css';
import {
  addSnippet,
  deleteSnippet,
  getProfileLocal,
  getStats,
  listSessions,
  listSnippets,
  updateProfileLocal,
  updateSnippet,
} from '../services/localStore';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    twitterUrl: '',
    portfolioPublic: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhoto, setTempPhoto] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [snippets, setSnippets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('javascript');
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Portfolio view state
  const [portfolioView, setPortfolioView] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    const local = getProfileLocal();
    const fallbackName = currentUser?.displayName || currentUser?.email?.split('@')[0] || local.displayName || 'Guest';
    const fallbackEmail = currentUser?.email || '';
    const fallbackPhoto = local.photoURL || currentUser?.photoURL || '';

    setProfile({
      displayName: local.displayName || fallbackName,
      email: fallbackEmail,
      photoURL: fallbackPhoto,
      bio: local.bio || '',
      githubUrl: local.githubUrl || '',
      linkedinUrl: local.linkedinUrl || '',
      websiteUrl: local.websiteUrl || '',
      twitterUrl: local.twitterUrl || '',
      portfolioPublic: local.portfolioPublic !== undefined ? local.portfolioPublic : false,
    });
    setTempPhoto(fallbackPhoto || '');
    setPortfolioUrl(`${window.location.origin}/portfolio/${fallbackName}`);
  }, [currentUser]);

  const refreshData = () => {
    setSnippets(listSnippets());
    setSessions(listSessions());
    setStats(getStats());
    // Initialize achievements based on stats
    initializeAchievements();
  };

  const initializeAchievements = () => {
    const currentStats = getStats();
    const newAchievements = [];

    if (currentStats?.runs >= 10) {
      newAchievements.push({ id: 1, title: 'First Steps', description: 'Run 10 code snippets', icon: <FaCode />, earned: true, date: new Date().toISOString() });
    }
    if (currentStats?.runs >= 50) {
      newAchievements.push({ id: 2, title: 'Code Runner', description: 'Run 50 code snippets', icon: <FaTerminal />, earned: true, date: new Date().toISOString() });
    }
    if (currentStats?.snippetsCreated >= 5) {
      newAchievements.push({ id: 3, title: 'Snippet Creator', description: 'Create 5 code snippets', icon: <FaFolder />, earned: true, date: new Date().toISOString() });
    }
    if (currentStats?.sessionsJoined >= 3) {
      newAchievements.push({ id: 4, title: 'Collaborator', description: 'Join 3 collaboration sessions', icon: <FaUsers />, earned: true, date: new Date().toISOString() });
    }
    if (currentStats?.aiExplains >= 5) {
      newAchievements.push({ id: 5, title: 'AI Explorer', description: 'Use AI explain 5 times', icon: <FaBrain />, earned: true, date: new Date().toISOString() });
    }

    setAchievements(newAchievements);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      updateProfileLocal({
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: tempPhoto || '',
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        websiteUrl: profile.websiteUrl,
        twitterUrl: profile.twitterUrl,
        portfolioPublic: profile.portfolioPublic,
      });

      setProfile(prev => ({ ...prev, photoURL: tempPhoto }));
      
      setIsEditing(false);
      refreshData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    const local = getProfileLocal();
    const fallbackName = currentUser?.displayName || currentUser?.email?.split('@')[0] || local.displayName || 'Guest';
    const fallbackEmail = currentUser?.email || '';
    const fallbackPhoto = local.photoURL || currentUser?.photoURL || '';

    setTempPhoto(fallbackPhoto || '');
    setProfile({
      displayName: local.displayName || fallbackName,
      email: fallbackEmail,
      photoURL: fallbackPhoto,
      bio: local.bio || '',
      githubUrl: local.githubUrl || '',
      linkedinUrl: local.linkedinUrl || '',
      websiteUrl: local.websiteUrl || '',
      twitterUrl: local.twitterUrl || '',
      portfolioPublic: local.portfolioPublic !== undefined ? local.portfolioPublic : false,
    });
  };

  const normalizeUrl = (value) => {
    const v = String(value || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    return `https://${v}`;
  };

  const identityLabel = useMemo(() => {
    if (currentUser?.email) return currentUser.email;
    return 'Guest (saved in this browser)';
  }, [currentUser]);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const formatDuration = (startedAt, endedAt) => {
    if (!startedAt) return '';
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    if (Number.isNaN(start) || Number.isNaN(end)) return '';
    const sec = Math.max(0, Math.floor((end - start) / 1000));
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min}m ${rem}s`;
  };

  const handleCreateSnippet = () => {
    if (!newTitle.trim()) {
      alert('Please enter a snippet title.');
      return;
    }
    addSnippet({ 
      title: newTitle.trim(), 
      language: newLanguage, 
      code: newCode,
      description: newDescription
    });
    setNewTitle('');
    setNewCode('');
    setNewDescription('');
    refreshData();
    setActiveTab('snippets');
  };

  const handleDeleteSnippet = (id) => {
    const ok = window.confirm('Delete this snippet?');
    if (!ok) return;
    deleteSnippet(id);
    refreshData();
  };

  const handleLoadSnippetToEditor = (snippet) => {
    try {
      localStorage.setItem('lang', snippet.language);
      localStorage.setItem(`code-${snippet.language}`, snippet.code);
      alert('Snippet loaded into Editor (open /editor).');
    } catch {
      // no-op
    }
  };

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet.code);
    alert('Snippet copied to clipboard!');
  };

  const togglePortfolioVisibility = () => {
    const newVisibility = !profile.portfolioPublic;
    setProfile(prev => ({ ...prev, portfolioPublic: newVisibility }));
    updateProfileLocal({
      ...profile,
      portfolioPublic: newVisibility
    });
    alert(`Portfolio visibility updated to ${newVisibility ? 'public' : 'private'}`);
  };

  const copyPortfolioUrl = () => {
    navigator.clipboard.writeText(portfolioUrl);
    alert('Portfolio URL copied to clipboard!');
  };

  // Calculate productivity metrics
  const productivityMetrics = {
    totalSnippets: snippets.length,
    totalSessions: sessions.length,
    totalRuns: stats?.runs || 0,
    totalAIUses: (stats?.aiExplains || 0) + (stats?.aiDebugs || 0),
    avgSessionDuration: sessions.length > 0 
      ? sessions.reduce((sum, session) => {
          if (session.endedAt) {
            const start = new Date(session.startedAt).getTime();
            const end = new Date(session.endedAt).getTime();
            return sum + (end - start);
          }
          return sum;
        }, 0) / sessions.length / 1000 / 60 // Convert to minutes
      : 0,
    mostUsedLanguage: snippets.length > 0 
      ? Object.entries(snippets.reduce((acc, snippet) => {
          acc[snippet.language] = (acc[snippet.language] || 0) + 1;
          return acc;
        }, {}))
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      : 'N/A'
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Sidebar Navigation */}
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
          </nav>
          
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome back, {profile.displayName}! Here's your coding activity summary.</p>
              </div>

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
                
                <div className="metric-card accent">
                  <div className="metric-icon">
                    <FaUsers />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">{productivityMetrics.totalSessions}</div>
                    <div className="metric-label">Collaboration Sessions</div>
                  </div>
                </div>
                
                <div className="metric-card success">
                  <div className="metric-icon">
                    <FaStar />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">{achievements.length}</div>
                    <div className="metric-label">Achievements</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-feed">
                    {snippets.slice(0, 5).map((snippet, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon green">
                          <FaCode />
                        </div>
                        <div className="activity-content">
                          <h4>Created snippet: {snippet.title}</h4>
                          <p>{formatDate(snippet.updatedAt)}</p>
                        </div>
                      </div>
                    ))}
                    {sessions.slice(0, 2).map((session, index) => (
                      <div key={`session-${index}`} className="activity-item">
                        <div className="activity-icon blue">
                          <FaUsers />
                        </div>
                        <div className="activity-content">
                          <h4>Joined session: {session.roomId || 'Unknown'}</h4>
                          <p>{formatDate(session.startedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => setActiveTab('snippets')}
                    >
                      <FaCode /> Create Snippet
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => setActiveTab('coding-stats')}
                    >
                      <FaChartLine /> View Stats
                    </button>
                    <button 
                      className="action-btn accent"
                      onClick={() => setActiveTab('achievements')}
                    >
                      <FaStar /> View Achievements
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coding Stats Tab */}
          {activeTab === 'coding-stats' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Coding Statistics</h2>
                <p>Detailed analytics of your coding activities and productivity.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Code Runs</h3>
                  <div className="stat-number">{stats?.runs || 0}</div>
                  <div className="stat-description">Times you ran code in the editor</div>
                </div>
                
                <div className="stat-card">
                  <h3>AI Interactions</h3>
                  <div className="stat-number">{(stats?.aiExplains || 0) + (stats?.aiDebugs || 0)}</div>
                  <div className="stat-description">Times you used AI assistance</div>
                </div>
                
                <div className="stat-card">
                  <h3>Visualizations</h3>
                  <div className="stat-number">{stats?.visualizes || 0}</div>
                  <div className="stat-description">Times you visualized code</div>
                </div>
                
                <div className="stat-card">
                  <h3>Last Active</h3>
                  <div className="stat-number">{stats?.lastActiveAt ? formatDate(stats.lastActiveAt) : '—'}</div>
                  <div className="stat-description">Your last coding session</div>
                </div>
                
                <div className="stat-card wide">
                  <h3>Most Used Language</h3>
                  <div className="stat-number">{productivityMetrics.mostUsedLanguage}</div>
                  <div className="stat-description">Your preferred programming language</div>
                </div>
                
                <div className="stat-card wide">
                  <h3>Average Session Duration</h3>
                  <div className="stat-number">{productivityMetrics.avgSessionDuration.toFixed(2)} min</div>
                  <div className="stat-description">Average time spent per session</div>
                </div>
              </div>

              <div className="chart-section">
                <h3>Productivity Trend</h3>
                <div className="chart-placeholder">
                  <p>Chart visualization would appear here showing your coding activity over time.</p>
                </div>
              </div>
            </div>
          )}

          {/* Snippets Library Tab */}
          {activeTab === 'snippets' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Saved Snippets Library</h2>
                <p>Manage and organize your reusable code snippets.</p>
              </div>

              <div className="snippets-controls">
                <div className="create-snippet-form">
                  <input
                    type="text"
                    placeholder="Snippet Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="input-field"
                  />
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="input-field"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="go">Go</option>
                    <option value="ruby">Ruby</option>
                    <option value="php">PHP</option>
                    <option value="swift">Swift</option>
                    <option value="rust">Rust</option>
                  </select>
                  <textarea
                    placeholder="Paste your code here..."
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    rows="4"
                    className="textarea-field"
                  ></textarea>
                  <button onClick={handleCreateSnippet} className="btn-primary">
                    Save Snippet
                  </button>
                </div>
              </div>

              <div className="snippets-grid">
                {snippets.length === 0 ? (
                  <div className="empty-state">
                    <FaFolder className="empty-icon" />
                    <h3>No Snippets Yet</h3>
                    <p>Create your first code snippet to get started.</p>
                  </div>
                ) : (
                  snippets.map((snippet) => (
                    <div key={snippet.id} className="snippet-card">
                      <div className="snippet-header">
                        <h4>{snippet.title}</h4>
                        <span className="language-tag">{snippet.language}</span>
                      </div>
                      <p className="snippet-description">{snippet.description || 'No description'}</p>
                      <pre className="snippet-preview">{snippet.code.substring(0, 100)}{snippet.code.length > 100 ? '...' : ''}</pre>
                      <div className="snippet-actions">
                        <button onClick={() => handleLoadSnippetToEditor(snippet)} className="btn-small primary">
                          Load to Editor
                        </button>
                        <button onClick={() => handleCopySnippet(snippet)} className="btn-small secondary">
                          Copy
                        </button>
                        <button 
                          onClick={() => {
                            const title = window.prompt('Rename snippet', snippet.title);
                            if (!title) return;
                            updateSnippet(snippet.id, { title: title.trim() });
                            refreshData();
                          }}
                          className="btn-small secondary"
                        >
                          Rename
                        </button>
                        <button onClick={() => handleDeleteSnippet(snippet.id)} className="btn-small danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Achievements & Badges</h2>
                <p>Earn recognition for your coding milestones and accomplishments.</p>
              </div>

              <div className="achievements-grid">
                {achievements.length === 0 ? (
                  <div className="empty-state">
                    <FaStar className="empty-icon" />
                    <h3>No Achievements Yet</h3>
                    <p>Start coding to earn your first badge!</p>
                  </div>
                ) : (
                  achievements.map(ach => (
                    <div key={ach.id} className="achievement-card">
                      <div className="achievement-icon-large">
                        {ach.icon}
                      </div>
                      <div className="achievement-content">
                        <h3>{ach.title}</h3>
                        <p>{ach.description}</p>
                        <span className="achievement-date">Earned {formatDate(ach.date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="progress-section">
                <h3>Your Progress</h3>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, (achievements.length / 10) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{achievements.length} of 10 achievements unlocked</span>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Public Portfolio</h2>
                <p>Showcase your coding skills and projects to the world.</p>
              </div>

              <div className="portfolio-settings">
                <div className="setting-item">
                  <label className="toggle-label">
                    <span>Make Portfolio Public</span>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profile.portfolioPublic}
                        onChange={handleInputChange}
                        name="portfolioPublic"
                      />
                      <span className="slider"></span>
                    </div>
                  </label>
                </div>
                
                <div className="url-display">
                  <span>Portfolio URL: {portfolioUrl}</span>
                  <button onClick={copyPortfolioUrl} className="btn-small secondary">
                    Copy URL
                  </button>
                </div>
              </div>

              <div className="portfolio-preview">
                <h3>Portfolio Preview</h3>
                <div className="portfolio-card">
                  <div className="portfolio-header">
                    <img 
                      src={profile.photoURL || '/default-avatar.png'} 
                      alt="Profile" 
                      className="portfolio-avatar"
                    />
                    <h2>{profile.displayName}</h2>
                    <p>{profile.bio}</p>
                  </div>
                  
                  <div className="portfolio-section">
                    <h4>Recent Snippets</h4>
                    {snippets.slice(0, 3).map(snippet => (
                      <div key={snippet.id} className="portfolio-snippet">
                        <h5>{snippet.title}</h5>
                        <span className="language-tag">{snippet.language}</span>
                        <pre className="snippet-preview">{snippet.code.substring(0, 100)}{snippet.code.length > 100 ? '...' : ''}</pre>
                      </div>
                    ))}
                  </div>
                  
                  <div className="portfolio-section">
                    <h4>Skills & Stats</h4>
                    <div className="skills-grid">
                      <div className="skill-item">
                        <span>Most Used Language:</span>
                        <span>{productivityMetrics.mostUsedLanguage}</span>
                      </div>
                      <div className="skill-item">
                        <span>Snippets Created:</span>
                        <span>{productivityMetrics.totalSnippets}</span>
                      </div>
                      <div className="skill-item">
                        <span>Code Runs:</span>
                        <span>{productivityMetrics.totalRuns}</span>
                      </div>
                      <div className="skill-item">
                        <span>Collaboration Sessions:</span>
                        <span>{productivityMetrics.totalSessions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collaboration Tab */}
          {activeTab === 'collaboration' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Collaboration History</h2>
                <p>Track your collaborative coding sessions and team activities.</p>
              </div>

              <div className="collaboration-grid">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <FaUsers className="empty-icon" />
                    <h3>No Collaboration Sessions</h3>
                    <p>Join a collaboration room to start working with others.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <h4>Room: {session.roomId || 'Unknown'}</h4>
                        <span className="session-date">{formatDate(session.startedAt)}</span>
                      </div>
                      <div className="session-details">
                        <p><strong>As:</strong> {session.username || 'Anonymous'}</p>
                        <p><strong>Duration:</strong> {session.endedAt ? formatDuration(session.startedAt, session.endedAt) : 'Active'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Account Settings</h2>
                <p>Manage your profile, privacy, and account preferences.</p>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Profile Information</h3>
                  <div className="profile-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={profile.displayName}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="textarea-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Avatar</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input
                        type="text"
                        name="githubUrl"
                        value={profile.githubUrl}
                        onChange={handleInputChange}
                        placeholder="github.com/username"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input
                        type="text"
                        name="linkedinUrl"
                        value={profile.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/username"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Website URL</label>
                      <input
                        type="text"
                        name="websiteUrl"
                        value={profile.websiteUrl}
                        onChange={handleInputChange}
                        placeholder="yourwebsite.com"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Social URL</label>
                      <input
                        type="text"
                        name="twitterUrl"
                        value={profile.twitterUrl}
                        onChange={handleInputChange}
                        placeholder="social-platform.com/username"
                        className="input-field"
                      />
                    </div>
                    
                    <button onClick={handleSave} className="btn-primary">
                      Save Profile
                    </button>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>Privacy Settings</h3>
                  <div className="privacy-options">
                    <div className="setting-item">
                      <label className="toggle-label">
                        <span>Make Portfolio Public</span>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.portfolioPublic}
                            onChange={handleInputChange}
                            name="portfolioPublic"
                          />
                          <span className="slider"></span>
                        </div>
                      </label>
                    </div>
                    
                    <div className="setting-item">
                      <label className="toggle-label">
                        <span>Allow Public Code Viewing</span>
                        <div className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider"></span>
                        </div>
                      </label>
                    </div>
                    
                    <div className="setting-item">
                      <label className="toggle-label">
                        <span>Receive Notifications</span>
                        <div className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider"></span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;