import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaSignOutAlt, FaTrash, FaUser, FaEnvelope, FaBell, FaLock, FaPalette, FaMoon, FaSun, FaGlobe, FaDownload, FaSync, FaShieldAlt } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const SettingsTab = ({
  profile,
  tempPhoto,
  identityLabel,
  handleLogout,
  handleDeleteAccount
}) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: {
      email: true,
      push: false,
      newsletter: true
    },
    privacy: {
      profilePublic: false,
      showEmail: false,
      showActivity: true
    },
    language: 'en',
    autoSave: true,
    twoFactor: false
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleSimpleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Manage your profile and preferences</p>
      </div>

      <div className="settings-grid">
        {/* Profile Information Card */}
        <div className="settings-card compact-profile-card">
          <h3><FaUser /> Profile Information</h3>
          <div className="profile-summary">
            <div className="profile-avatar-section">
              <img 
                src={tempPhoto || profile.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                className="profile-avatar-small"
              />
              <div className="profile-basic-info">
                <h4>{profile.displayName}</h4>
                <p className="profile-email"><FaEnvelope /> {identityLabel}</p>
              </div>
            </div>
            
            {profile.bio && (
              <div className="profile-bio">
                <p>{profile.bio}</p>
              </div>
            )}
            
            <div className="profile-links">
              {profile.githubUrl && (
                <p><FaGithub /> <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">GitHub Profile</a></p>
              )}
              {profile.linkedinUrl && (
                <p><FaLinkedin /> <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn Profile</a></p>
              )}
            </div>
          </div>
        </div>

        {/* Appearance & Theme Settings */}
        <div className="settings-card">
          <h3><FaPalette /> Appearance</h3>
          <div className="settings-section">
            <div className="setting-item">
              <div className="setting-label">
                <FaMoon /> Theme
                <span className="setting-description">Choose your preferred theme</span>
              </div>
              <select 
                value={settings.theme} 
                onChange={(e) => handleSimpleSettingChange('theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-label">
                <FaGlobe /> Language
                <span className="setting-description">Interface language</span>
              </div>
              <select 
                value={settings.language} 
                onChange={(e) => handleSimpleSettingChange('language', e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h3><FaBell /> Notifications</h3>
          <div className="settings-section">
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaEnvelope /> Email Notifications
                <span className="setting-description">Receive email updates</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaBell /> Push Notifications
                <span className="setting-description">Browser push notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaEnvelope /> Newsletter
                <span className="setting-description">Product updates and news</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.newsletter}
                  onChange={(e) => handleSettingChange('notifications', 'newsletter', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3><FaLock /> Privacy</h3>
          <div className="settings-section">
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaUser /> Public Profile
                <span className="setting-description">Make your profile visible to others</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.profilePublic}
                  onChange={(e) => handleSettingChange('privacy', 'profilePublic', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaEnvelope /> Show Email
                <span className="setting-description">Display email on your profile</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaSync /> Show Activity
                <span className="setting-description">Display coding activity publicly</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) => handleSettingChange('privacy', 'showActivity', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <h3><FaShieldAlt /> Security</h3>
          <div className="settings-section">
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaLock /> Two-Factor Authentication
                <span className="setting-description">Add extra security to your account</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => handleSimpleSettingChange('twoFactor', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item toggle-setting">
              <div className="setting-label">
                <FaSync /> Auto-Save
                <span className="setting-description">Automatically save your work</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSimpleSettingChange('autoSave', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-card">
          <h3><FaDownload /> Data Management</h3>
          <div className="settings-section">
            <div className="setting-item action-setting">
              <div className="setting-label">
                <FaDownload /> Export Data
                <span className="setting-description">Download all your profile and activity data</span>
              </div>
              <button className="btn-secondary">Export</button>
            </div>
            
            <div className="setting-item action-setting">
              <div className="setting-label">
                <FaSync /> Sync Settings
                <span className="setting-description">Sync your preferences across devices</span>
              </div>
              <button className="btn-secondary">Sync Now</button>
            </div>
          </div>
        </div>

        {/* Account Actions Card */}
        <div className="settings-card account-actions-card">
          <h3><FaSignOutAlt /> Account Actions</h3>
          <div className="account-actions">
            <div className="account-buttons">
              <button onClick={handleLogout} className="btn-primary logout-btn">
                <FaSignOutAlt /> Logout
              </button>
              <button onClick={handleDeleteAccount} className="btn-danger delete-account-btn">
                <FaTrash /> Delete Account
              </button>
            </div>
            <p className="account-warning">
              <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. All your data will be lost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
