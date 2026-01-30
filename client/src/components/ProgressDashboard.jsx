import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const SAMPLE_PROGRESS = {
  userId: 'sampleUser',
  displayName: 'Sample User',
  totalPoints: 500,
  level: 5,
  joinedAt: '2025-01-01',
  summary: {
    totalEvents: 50,
    totalPoints: 500,
    level: 5,
    dailyStreak: 7,
    badgeCount: 3
  },
  eventStats: {
    code_run: 20,
    code_submit: 15,
    challenge_solve: 10,
    tutorial_view: 5
  },
  topLanguages: [
    { language: 'JavaScript', count: 15 },
    { language: 'Python', count: 10 }
  ],
  badges: [
    { name: 'First Run', description: 'Ran first code', category: 'milestone', rarity: 'common', points: 10 },
    { name: 'Solver', description: 'Solved 5 challenges', category: 'achievement', rarity: 'rare', points: 30 }
  ]
};

const ProgressDashboard = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProgress(SAMPLE_PROGRESS);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/dashboard/${currentUser.uid}`)
      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(() => setProgress(SAMPLE_PROGRESS))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div>Loading progress...</div>;
  if (!progress) return <div>Could not load progress data.</div>;

  return (
    <div className="progress-dashboard">
      <h1>Your Progress</h1>
      <pre>{JSON.stringify(progress, null, 2)}</pre>
      {/* Replace with styled UI as needed */}
    </div>
  );
};

export default ProgressDashboard;
