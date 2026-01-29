import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaCode, FaFolder, FaUsers, FaBrain, FaTerminal, FaBug, FaCheck, FaClock } from 'react-icons/fa';
import '../Style/UserDashboard.css';
import {
  addSnippet,
  deleteSnippet,
  getProfileLocal,
  getStats,
  listSessions,
  listSnippets,
  updateProfileLocal,
} from '../services/localStore';

// Import refactored components
import DashboardSidebar from './Dashboard/DashboardSidebar';
import OverviewTab from './Dashboard/OverviewTab';
import SnippetsTab from './Dashboard/SnippetsTab';
import AchievementsTab from './Dashboard/AchievementsTab';
import SettingsTab from './Dashboard/SettingsTab';

/**
 * UserDashboard Component - Comprehensive User Dashboard
 * Features: Analytics, Achievements, Portfolio View, Snippet Library, Collaboration History
 * 
 * Refactored to use smaller, focused components for better maintainability
 */
const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
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
      portfolioPublic: local.portfolioPublic !== undefined ? local.portfolioPublic : false,
    });
    setTempPhoto(fallbackPhoto || '');
  }, [currentUser]);

  const refreshData = () => {
    setSnippets(listSnippets());
    setSessions(listSessions());
    setStats(getStats());
    initializeAchievements();
  };

  const initializeAchievements = () => {
    const currentStats = getStats();
    const newAchievements = [];

    if (currentStats?.runs >= 10) {
      newAchievements.push({ 
        id: 1, 
        title: 'First Steps', 
        description: 'Run 10 code snippets', 
        icon: <FaCode />, 
        earned: true, 
        date: new Date().toISOString() 
      });
    }
    if (currentStats?.runs >= 50) {
      newAchievements.push({ 
        id: 2, 
        title: 'Code Runner', 
        description: 'Run 50 code snippets', 
        icon: <FaTerminal />, 
        earned: true, 
        date: new Date().toISOString() 
      });
    }
    if (currentStats?.snippetsCreated >= 5) {
      newAchievements.push({ 
        id: 3, 
        title: 'Snippet Creator', 
        description: 'Create 5 code snippets', 
        icon: <FaFolder />, 
        earned: true, 
        date: new Date().toISOString() 
      });
    }
    if (currentStats?.sessionsJoined >= 3) {
      newAchievements.push({ 
        id: 4, 
        title: 'Collaborator', 
        description: 'Join 3 collaboration sessions', 
        icon: <FaUsers />, 
        earned: true, 
        date: new Date().toISOString() 
      });
    }
    if (currentStats?.aiExplains >= 5) {
      newAchievements.push({ 
        id: 5, 
        title: 'AI Explorer', 
        description: 'Use AI explain 5 times', 
        icon: <FaBrain />, 
        earned: true, 
        date: new Date().toISOString() 
      });
    }

    setAchievements(newAchievements);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        portfolioPublic: profile.portfolioPublic,
      });

      setProfile((prev) => ({ ...prev, photoURL: tempPhoto }));
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
    const fallbackPhoto = local.photoURL || currentUser?.photoURL || '';

    setTempPhoto(fallbackPhoto || '');
    setProfile({
      displayName: local.displayName || fallbackName,
      email: currentUser?.email || '',
      photoURL: fallbackPhoto,
      bio: local.bio || '',
      githubUrl: local.githubUrl || '',
      linkedinUrl: local.linkedinUrl || '',
      portfolioPublic: local.portfolioPublic !== undefined ? local.portfolioPublic : false,
    });
  };

  const identityLabel = useMemo(() => {
    if (currentUser?.email) {
      return currentUser.email;
    }
    return 'Guest (saved in this browser)';
  }, [currentUser]);

  const handleCreateSnippet = () => {
    if (!newTitle.trim()) {
      alert('Please enter a snippet title.');
      return;
    }
    addSnippet({
      title: newTitle.trim(),
      language: newLanguage,
      code: newCode,
      description: newDescription,
    });
    setNewTitle('');
    setNewCode('');
    setNewDescription('');
    refreshData();
    setActiveTab('snippets');
  };

  const handleDeleteSnippet = (id) => {
    const ok = window.confirm('Delete this snippet?');
    if (!ok) {
      return;
    }
    deleteSnippet(id);
    refreshData();
  };

  const handleLoadSnippetToEditor = (snippet) => {
    try {
      localStorage.setItem('lang', snippet.language);
      localStorage.setItem(`code-${snippet.language}`, snippet.code);
      alert('Snippet loaded into Editor (open /editor).');
    } catch {
      // Silent fail
    }
  };

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet.code);
    alert('Snippet copied to clipboard!');
  };

  // Calculate productivity metrics
  const productivityMetrics = {
    totalSnippets: snippets.length,
    totalSessions: sessions.length,
    totalRuns: stats?.runs || 0,
    totalAIUses: (stats?.aiExplains || 0) + (stats?.aiDebugs || 0),
    avgSessionDuration:
      sessions.length > 0
        ? sessions.reduce((sum, session) => {
            if (session.endedAt) {
              const start = new Date(session.startedAt).getTime();
              const end = new Date(session.endedAt).getTime();
              return sum + (end - start);
            }
            return sum;
          }, 0) /
          sessions.length /
          1000 /
          60
        : 0,
    mostUsedLanguage:
      snippets.length > 0
        ? Object.entries(
            snippets.reduce((acc, snippet) => {
              acc[snippet.language] = (acc[snippet.language] || 0) + 1;
              return acc;
            }, {})
          ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
        : 'N/A',
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <DashboardSidebar
          profile={profile}
          tempPhoto={tempPhoto}
          identityLabel={identityLabel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <OverviewTab
              profile={profile}
              productivityMetrics={productivityMetrics}
              achievements={achievements}
            />
          )}

          {activeTab === 'snippets' && (
            <SnippetsTab
              snippets={snippets}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newLanguage={newLanguage}
              setNewLanguage={setNewLanguage}
              newCode={newCode}
              setNewCode={setNewCode}
              newDescription={newDescription}
              setNewDescription={setNewDescription}
              handleCreateSnippet={handleCreateSnippet}
              handleDeleteSnippet={handleDeleteSnippet}
              handleLoadSnippetToEditor={handleLoadSnippetToEditor}
              handleCopySnippet={handleCopySnippet}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab achievements={achievements} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              profile={profile}
              tempPhoto={tempPhoto}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleInputChange={handleInputChange}
              handlePhotoChange={handlePhotoChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              identityLabel={identityLabel}
            />
          )}

          {/* Placeholder for other tabs */}
          {activeTab === 'coding-stats' && (
            <div className="dashboard-section">
              <h2>Coding Statistics</h2>
              <p>Coming soon...</p>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="dashboard-section">
              <h2>Portfolio</h2>
              <p>Coming soon...</p>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="dashboard-section">
              <h2>Collaboration History</h2>
              <p>Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
