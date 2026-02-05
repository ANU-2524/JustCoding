import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUser, FaCamera, FaSave, FaTimes, FaTrash, FaCode, FaGithub, FaLinkedin, FaPencilAlt, FaArrowRight, FaUsers, FaChartLine } from 'react-icons/fa';
import Breadcrumb from './Breadcrumb';
import '../Style/Profile.css';
import { useTheme } from './ThemeContext';
import {
  getProfileLocal,
  getStats,
  listSessions,
  updateProfileLocal,
} from '../services/localStore';
import {
  fetchSnippetsFromBackend,
  createSnippetOnBackend,
  updateSnippetOnBackend,
  deleteSnippetOnBackend,
} from '../services/syncService';

// Utility to get or create a temp user ID for guests
function getUserId(currentUser) {
  if (currentUser?.uid) return currentUser.uid;
  let tempId = localStorage.getItem('tempUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempUserId', tempId);
  }
  return tempId;
}

/**
 * Profile Component - User Profile Card with Basic Snippet Management
 * For comprehensive analytics and dashboard features, use UserDashboard component
 */
const Profile = () => {
  const { isDark, theme } = useTheme();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhoto, setTempPhoto] = useState('');

  const [activeTab, setActiveTab] = useState('snippets');
  const [snippets, setSnippets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('javascript');
  const [newCode, setNewCode] = useState('');

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
    });
    setTempPhoto(fallbackPhoto || '');
  }, [currentUser]);

  const refreshData = () => {
    const userId = getUserId(currentUser);
    fetchSnippetsFromBackend(userId).then(setSnippets);
    setSessions(listSessions());
    setStats(getStats());
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
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
    });
  };

  const normalizeUrl = (value) => {
    const v = String(value || '').trim();
    if (!v) {
return '';
}
    if (v.startsWith('http://') || v.startsWith('https://')) {
return v;
}
    return `https://${v}`;
  };

  const identityLabel = useMemo(() => {
    if (currentUser?.email) {
return currentUser.email;
}
    return 'Guest (saved in this browser)';
  }, [currentUser]);

  const formatDate = (iso) => {
    if (!iso) {
return '';
}
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
return iso;
}
    return d.toLocaleString();
  };

  const formatDuration = (startedAt, endedAt) => {
    if (!startedAt) {
return '';
}
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    if (Number.isNaN(start) || Number.isNaN(end)) {
return '';
}
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
    const userId = getUserId(currentUser);
    createSnippetOnBackend(userId, {
      title: newTitle.trim(),
      language: newLanguage,
      code: newCode,
    }).then(() => {
      setNewTitle('');
      setNewCode('');
      refreshData();
      setActiveTab('snippets');
    });
  };

  const handleDeleteSnippet = (id) => {
    const ok = window.confirm('Delete this snippet?');
    if (!ok) return;
    const userId = getUserId(currentUser);
    deleteSnippetOnBackend(id, userId).then(() => {
      refreshData();
    });
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

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header Section */}
        <div className="profile-header">
          <div className="back-button-container">
            <button 
              className="back-button" 
              onClick={() => window.history.back()}
            >
              <FaArrowRight style={{ transform: 'rotate(180deg)' }} /> Back
            </button>
          </div>
          
          {!isEditing && (
            <div className="edit-button-container">
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaPencilAlt /> Edit Profile
              </button>
            </div>
          )}
          
          <div className="avatar-container">
            {tempPhoto || profile.photoURL ? (
              <img 
                src={tempPhoto || profile.photoURL} 
                alt="Profile" 
                className="profile-avatar"
              />
            ) : (
              <div className="default-avatar">
                <FaUser />
              </div>
            )}
            
            {isEditing && (
              <div className="upload-overlay">
                <label htmlFor="photo-upload" className="upload-label">
                  <FaCamera className="camera-icon" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                value={profile.displayName}
                onChange={handleInputChange}
                name="displayName"
                className="name-input"
                placeholder="Enter your name"
              />
            ) : (
              <h1 className="profile-name">{profile.displayName}</h1>
            )}
            
            <div className="profile-email">
              <span>{profile.email || identityLabel}</span>
              {currentUser?.isAnonymous && (
                <span className="email-note">Guest account (local storage)</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Body Content */}
        <div className="profile-body">
          {/* Bio Section */}
          <div className="bio-section">
            <h3>Bio</h3>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={handleInputChange}
                name="bio"
                className="bio-input"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="bio-text">
                {profile.bio || 'No bio yet. Tell us about yourself!'}
              </p>
            )}
          </div>
          
          {/* Links Section */}
          <div className="links-section">
            <h3>Social Links</h3>
            {isEditing ? (
              <div className="links-form">
                <div className="link-row">
                  <div className="link-label">
                    <FaGithub /> GitHub
                  </div>
                  <input
                    type="text"
                    value={profile.githubUrl}
                    onChange={handleInputChange}
                    name="githubUrl"
                    className="dash-input"
                    placeholder="github.com/username"
                  />
                </div>
                
                <div className="link-row">
                  <div className="link-label">
                    <FaLinkedin /> LinkedIn
                  </div>
                  <input
                    type="text"
                    value={profile.linkedinUrl}
                    onChange={handleInputChange}
                    name="linkedinUrl"
                    className="dash-input"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            ) : (
              <div className="links-list">
                {profile.githubUrl && (
                  <a 
                    href={normalizeUrl(profile.githubUrl)} 
                    className="link-item"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaGithub /> {profile.githubUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
                
                {profile.linkedinUrl && (
                  <a 
                    href={normalizeUrl(profile.linkedinUrl)} 
                    className="link-item"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin /> {profile.linkedinUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
                
                {!profile.githubUrl && !profile.linkedinUrl && (
                  <div className="link-item disabled">
                    No social links added yet
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Dashboard Notice - Only show when not editing */}
          {!isEditing && (
            <div className="dashboard-notice">
              <div className="notice-content">
                <h3>📊 Full Analytics Dashboard Available</h3>
                <p>Want to see detailed coding statistics, achievements, and progress tracking?</p>
                <button 
                  className="notice-btn"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <FaArrowRight /> Go to Full Dashboard
                </button>
              </div>
            </div>
          )}
          
          {/* Dashboard Tabs - Only show when not editing */}
          {!isEditing && (
            <div className="dashboard-tabs">
              <button
                className={`dash-tab ${activeTab === 'snippets' ? 'active' : ''}`}
                onClick={() => setActiveTab('snippets')}
              >
                <FaCode /> Snippets
              </button>
              <button
                className={`dash-tab ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveTab('sessions')}
              >
                <FaUsers /> Sessions
              </button>
              <button
                className={`dash-tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <FaChartLine /> Stats
              </button>
            </div>
          )}
          
          {/* Tab Content - Only show when not editing */}
          {!isEditing && (
            <>
              {/* Tab Content */}
              {activeTab === 'snippets' && (
                <div className="tab-content">
                  <div className="snippet-create">
                    <h3>Create New Snippet</h3>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Snippet title"
                      className="dash-input"
                    />
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="dash-input"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>
                    <textarea
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Your code here..."
                      className="dash-textarea"
                      rows="6"
                    />
                    <button 
                      className="dash-btn primary"
                      onClick={handleCreateSnippet}
                    >
                      Create Snippet
                    </button>
                  </div>
                  
                  <div className="snippet-list">
                    <h3>Your Snippets</h3>
                    {snippets.length === 0 ? (
                      <div className="dash-empty">No snippets created yet</div>
                    ) : (
                      snippets.map(snippet => (
                        <div key={snippet.id} className="snippet-item">
                          <div className="snippet-meta">
                            <div className="snippet-title">{snippet.title}</div>
                            <div className="snippet-sub">{snippet.language} • {formatDate(snippet.createdAt)}</div>
                          </div>
                          <div className="snippet-actions">
                            <button 
                              className="dash-btn"
                              onClick={() => handleLoadSnippetToEditor(snippet)}
                            >
                              Load to Editor
                            </button>
                            <button 
                              className="dash-btn danger"
                              onClick={() => handleDeleteSnippet(snippet.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'sessions' && (
                <div className="tab-content">
                  <h3>Recent Sessions</h3>
                  {sessions.length === 0 ? (
                    <div className="dash-empty">No sessions joined yet</div>
                  ) : (
                    sessions.slice(0, 5).map(session => (
                      <div key={session.id} className="session-item">
                        <div className="session-title">Session #{session.id.slice(0, 8)}</div>
                        <div className="session-sub">
                          Joined: {formatDate(session.joinedAt)} • Duration: {formatDuration(session.joinedAt, session.leftAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && (
                <div className="tab-content">
                  <h3>Your Statistics</h3>
                  {stats ? (
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">{stats.runs || 0}</div>
                        <div className="stat-label">Code Runs</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{stats.snippetsCreated || 0}</div>
                        <div className="stat-label">Snippets</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{stats.sessionsJoined || 0}</div>
                        <div className="stat-label">Sessions</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{stats.minutesCoded || 0}</div>
                        <div className="stat-label">Minutes Coded</div>
                      </div>
                      <div className="stat-card wide">
                        <div className="stat-value">{stats.favoriteLanguage || 'None'}</div>
                        <div className="stat-label">Favorite Language</div>
                      </div>
                    </div>
                  ) : (
                    <div className="dash-empty">No statistics available yet</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer Actions */}
        {isEditing && (
          <div className="profile-footer">
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;