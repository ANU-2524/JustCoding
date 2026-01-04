import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUser, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import '../Style/Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhoto, setTempPhoto] = useState('');

  useEffect(() => {
    if (currentUser) {
      // Check if there's a saved photo in localStorage, otherwise use the Firebase photoURL
      const savedPhoto = localStorage.getItem('userPhoto') || currentUser.photoURL;
      
      setProfile({
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        photoURL: savedPhoto || '',
        bio: localStorage.getItem('userBio') || ''
      });
      setTempPhoto(savedPhoto || '');
    }
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
      // Save profile info to localStorage
      localStorage.setItem('userBio', profile.bio);
      
      // If there's a new photo selected, we would normally upload it to Firebase Storage
      // For now, we'll store the photo in localStorage as a data URL
      if (tempPhoto && tempPhoto !== currentUser.photoURL) {
        localStorage.setItem('userPhoto', tempPhoto);
      }
      
      // In a real app, you would update the user profile in Firebase
      // await updateProfile(auth.currentUser, {
      //   displayName: profile.displayName,
      //   photoURL: tempPhoto
      // });
      
      // Update the profile state with the new photo
      setProfile(prev => ({
        ...prev,
        photoURL: tempPhoto
      }));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempPhoto(currentUser.photoURL || '');
    setProfile({
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
      bio: localStorage.getItem('userBio') || ''
    });
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
              {profile.email}
              <span className="email-note">(Email cannot be changed here)</span>
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