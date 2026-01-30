import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUser, FaCamera, FaSave, FaTimes, FaTrash, FaCode, FaGithub, FaLinkedin, FaPencilAlt, FaArrowRight } from 'react-icons/fa';
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
    <div>Profile Component</div>
  );
};

export default Profile;