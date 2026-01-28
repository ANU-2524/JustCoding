import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const SettingsTab = ({
  profile,
  tempPhoto,
  isEditing,
  setIsEditing,
  handleInputChange,
  handlePhotoChange,
  handleSave,
  handleCancel,
  identityLabel
}) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Manage your profile and preferences</p>
      </div>

      <div className="settings-card">
        <div className="profile-photo-section">
          <img 
            src={tempPhoto || profile.photoURL || '/default-avatar.png'} 
            alt="Profile" 
            className="profile-photo-large"
          />
          {isEditing && (
            <div className="photo-upload">
              <label htmlFor="photo-upload" className="btn-secondary">
                Change Photo
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

        <div className="profile-form">
          <div className="form-group">
            <label>Display Name</label>
            {isEditing ? (
              <input
                type="text"
                name="displayName"
                value={profile.displayName}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.displayName}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <p className="form-value">{identityLabel}</p>
          </div>

          <div className="form-group">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="form-value">{profile.bio || 'No bio yet'}</p>
            )}
          </div>

          <div className="form-group">
            <label>
              <FaGithub /> GitHub URL
            </label>
            {isEditing ? (
              <input
                type="text"
                name="githubUrl"
                value={profile.githubUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://github.com/username"
              />
            ) : (
              <p className="form-value">{profile.githubUrl || 'Not set'}</p>
            )}
          </div>

          <div className="form-group">
            <label>
              <FaLinkedin /> LinkedIn URL
            </label>
            {isEditing ? (
              <input
                type="text"
                name="linkedinUrl"
                value={profile.linkedinUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://linkedin.com/in/username"
              />
            ) : (
              <p className="form-value">{profile.linkedinUrl || 'Not set'}</p>
            )}
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
