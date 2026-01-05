import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUser, FaCamera, FaSave, FaTimes, FaTrash, FaCode, FaGithub, FaLinkedin } from 'react-icons/fa';
import '../Style/Profile.css';
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

const Profile = () => {
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
    setSnippets(listSnippets());
    setSessions(listSessions());
    setStats(getStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

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
    addSnippet({ title: newTitle.trim(), language: newLanguage, code: newCode });
    setNewTitle('');
    setNewCode('');
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

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="back-button-container">
            <button 
              className="back-button"
              onClick={() => window.history.back()}
              title="Go back"
            >
              ← Back
            </button>
          </div>
          
          <div className="avatar-container">
            {(tempPhoto || profile.photoURL) ? (
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
                <label htmlFor="avatar-upload" className="upload-label">
                  <FaCamera className="camera-icon" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  className="name-input"
                />
              ) : (
                profile.displayName
              )}
            </h1>
            <p className="profile-email">
              {identityLabel}
              {currentUser?.email ? (
                <span className="email-note">(Auth is optional; data still saves locally)</span>
              ) : (
                <span className="email-note">(No login required)</span>
              )}
            </p>
          </div>
        </div>

        <div className="profile-body">
          <div className="bio-section">
            <h3>About</h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="bio-input"
                rows="4"
              />
            ) : (
              <p className="bio-text">
                {profile.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          <div className="links-section">
            <h3>Links</h3>
            {isEditing ? (
              <div className="links-form">
                <div className="link-row">
                  <label className="link-label"><FaGithub /> GitHub</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={profile.githubUrl}
                    onChange={handleInputChange}
                    className="dash-input"
                    placeholder="github.com/yourname"
                  />
                </div>
                <div className="link-row">
                  <label className="link-label"><FaLinkedin /> LinkedIn</label>
                  <input
                    type="text"
                    name="linkedinUrl"
                    value={profile.linkedinUrl}
                    onChange={handleInputChange}
                    className="dash-input"
                    placeholder="linkedin.com/in/yourname"
                  />
                </div>
              </div>
            ) : (
              <div className="links-list">
                <a
                  className={`link-item ${profile.githubUrl ? '' : 'disabled'}`}
                  href={profile.githubUrl ? normalizeUrl(profile.githubUrl) : undefined}
                  target={profile.githubUrl ? "_blank" : undefined}
                  rel={profile.githubUrl ? "noreferrer" : undefined}
                  onClick={(e) => {
                    if (!profile.githubUrl) e.preventDefault();
                  }}
                >
                  <FaGithub /> <span>{profile.githubUrl ? 'GitHub' : 'GitHub (not set)'}</span>
                </a>
                <a
                  className={`link-item ${profile.linkedinUrl ? '' : 'disabled'}`}
                  href={profile.linkedinUrl ? normalizeUrl(profile.linkedinUrl) : undefined}
                  target={profile.linkedinUrl ? "_blank" : undefined}
                  rel={profile.linkedinUrl ? "noreferrer" : undefined}
                  onClick={(e) => {
                    if (!profile.linkedinUrl) e.preventDefault();
                  }}
                >
                  <FaLinkedin /> <span>{profile.linkedinUrl ? 'LinkedIn' : 'LinkedIn (not set)'}</span>
                </a>
              </div>
            )}
          </div>

          <div className="dashboard">
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
                Sessions
              </button>
              <button
                className={`dash-tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                Stats
              </button>
            </div>

            {activeTab === 'snippets' && (
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <h3>Your Snippets</h3>
                  <button className="dash-btn" onClick={refreshData}>Refresh</button>
                </div>

                <div className="snippet-create">
                  <h4>Create Snippet</h4>
                  <input
                    className="dash-input"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <select
                    className="dash-input"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
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
                    className="dash-textarea"
                    placeholder="Paste code here..."
                    rows={6}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                  <button className="dash-btn primary" onClick={handleCreateSnippet}>Save Snippet</button>
                </div>

                <div className="snippet-list">
                  {snippets.length === 0 ? (
                    <p className="dash-empty">No snippets yet.</p>
                  ) : (
                    snippets.map((s) => (
                      <div key={s.id} className="snippet-item">
                        <div className="snippet-meta">
                          <div className="snippet-title">{s.title}</div>
                          <div className="snippet-sub">{s.language} • Updated {formatDate(s.updatedAt)}</div>
                        </div>
                        <div className="snippet-actions">
                          <button className="dash-btn" onClick={() => handleLoadSnippetToEditor(s)}>Load to Editor</button>
                          <button
                            className="dash-btn"
                            onClick={() => {
                              const title = window.prompt('Rename snippet', s.title);
                              if (!title) return;
                              updateSnippet(s.id, { title: title.trim() });
                              refreshData();
                            }}
                          >
                            Rename
                          </button>
                          <button className="dash-btn danger" onClick={() => handleDeleteSnippet(s.id)}>
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <h3>Past Collaboration Sessions</h3>
                  <button className="dash-btn" onClick={refreshData}>Refresh</button>
                </div>

                {sessions.length === 0 ? (
                  <p className="dash-empty">No sessions tracked yet. Join a room in Collaborate.</p>
                ) : (
                  <div className="session-list">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="session-item">
                        <div className="session-title">Room: {sess.roomId || '(unknown)'}</div>
                        <div className="session-sub">
                          As: {sess.username || '(unknown)'} • Started {formatDate(sess.startedAt)}
                          {sess.endedAt ? ` • Duration ${formatDuration(sess.startedAt, sess.endedAt)}` : ' • (active)'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <h3>Usage Stats</h3>
                  <button className="dash-btn" onClick={refreshData}>Refresh</button>
                </div>
                {!stats ? (
                  <p className="dash-empty">Loading...</p>
                ) : (
                  <div className="stats-grid">
                    <div className="stat-card"><div className="stat-value">{stats.runs || 0}</div><div className="stat-label">Runs</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.visualizes || 0}</div><div className="stat-label">Visualizes</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.aiExplains || 0}</div><div className="stat-label">AI Explains</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.aiDebugs || 0}</div><div className="stat-label">AI Debugs</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.snippetsCreated || 0}</div><div className="stat-label">Snippets Created</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.sessionsJoined || 0}</div><div className="stat-label">Sessions Joined</div></div>
                    <div className="stat-card wide"><div className="stat-value">{stats.lastActiveAt ? formatDate(stats.lastActiveAt) : '—'}</div><div className="stat-label">Last Active</div></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-footer">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          ) : (
            <button 
              className="btn-edit" 
              onClick={() => setIsEditing(true)}
            >
              <FaUser /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;