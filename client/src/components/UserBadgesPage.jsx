import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const UserBadgesPage = () => {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Sample badges for demo/testing
  const SAMPLE_BADGES = [
    { name: 'First Steps', description: 'Completed your first challenge', category: 'milestone', points: 10, earnedAt: new Date().toISOString() },
    { name: 'Streak Starter', description: 'Solved challenges 3 days in a row', category: 'streak', points: 20, earnedAt: new Date().toISOString() },
    { name: 'Code Guru', description: 'Earned 500 points', category: 'achievement', points: 50, earnedAt: new Date().toISOString() }
  ];

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setBadges(SAMPLE_BADGES);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/user/profile/${currentUser.uid}`)
      .then(res => res.json())
      .then(data => setBadges((data.badges && data.badges.length) ? data.badges : SAMPLE_BADGES))
      .catch(() => setBadges(SAMPLE_BADGES))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div>Loading badges...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!badges.length) return <div>No badges earned yet.</div>;

  return (
    <div style={{maxWidth:700,margin:'8rem auto 3rem auto',padding:24,background:'#18181b',borderRadius:12,color:'#f3f4f6'}}>
      <h1 style={{color:'#a5b4fc',marginBottom:24}}>Your Badges</h1>
      <div style={{display:'flex',flexWrap:'wrap',gap:20}}>
        {badges.map((badge, i) => (
          <div key={i} style={{background:'#232336',borderRadius:10,padding:16,minWidth:180}}>
            <div style={{fontWeight:600,fontSize:18,color:'#facc15'}}>{badge.name}</div>
            <div style={{fontSize:14,margin:'8px 0',color:'#f3f4f6'}}>{badge.description}</div>
            <div style={{fontSize:13,color:'#f472b6'}}>Category: {badge.category}</div>
            <div style={{fontSize:13,color:'#a5b4fc'}}>Points: {badge.points}</div>
            <div style={{fontSize:12,color:'#94a3b8'}}>Earned: {badge.earnedAt ? new Date(badge.earnedAt).toLocaleString() : 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBadgesPage;
