import React, { useEffect, useState } from "react";

const TEMP_REPUTATION = {
  userId: "demo",
  reputation: 1200,
  changes: [
    { date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), change: +20, reason: "Upvoted answer on 'How to debug JS'" },
    { date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), change: -5, reason: "Downvoted on 'Best CSS tricks'" },
    { date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), change: +10, reason: "Marked answer as accepted" },
  ],
  leaderboard: [
    { user: "Alice", reputation: 1500 },
    { user: "Bob", reputation: 1350 },
    { user: "You", reputation: 1200 },
    { user: "Charlie", reputation: 1100 },
  ],
};

const CommunityReputationPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "demo";
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/community/reputation/${userId}`)
      .then(res => res.ok ? res.json() : Promise.reject("No data"))
      .then(json => setData(json && json.reputation ? json : TEMP_REPUTATION))
      .catch(() => setData(TEMP_REPUTATION))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{color:'#fff',padding:24}}>Loading community reputation...</div>;
  if (error) return <div style={{color:'red',padding:24}}>{error}</div>;
  if (!data) return <div style={{color:'#fff',padding:24}}>No reputation data found.</div>;

  return (
    <div style={{maxWidth:800,margin:'6rem auto 3rem auto',padding:24,background:'#18181b',borderRadius:12,color:'#f3f4f6'}}>
      <h1 style={{color:'#a5b4fc',marginBottom:24}}>Community Reputation</h1>
      <div style={{fontSize:24,marginBottom:16}}>Your Reputation: <span style={{color:'#facc15'}}>{data.reputation}</span></div>
      <h2 style={{marginTop:32,marginBottom:12,color:'#a5b4fc'}}>Recent Changes</h2>
      <table style={{width:'100%',background:'#232336',borderRadius:8,marginBottom:32}}>
        <thead>
          <tr style={{background:'#232336',color:'#facc15'}}>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Date</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Change</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {data.changes && data.changes.length ? data.changes.map((item, i) => (
            <tr key={i} style={{borderBottom:'1px solid #333'}}>
              <td style={{padding:'8px 6px'}}>{new Date(item.date).toLocaleString()}</td>
              <td style={{padding:'8px 6px',color:item.change>0?'#22d3ee':'#f472b6'}}>{item.change>0?`+${item.change}`:item.change}</td>
              <td style={{padding:'8px 6px'}}>{item.reason}</td>
            </tr>
          )) : <tr><td colSpan={3} style={{padding:12}}>No recent changes.</td></tr>}
        </tbody>
      </table>
      <h2 style={{marginTop:24,marginBottom:12,color:'#a5b4fc'}}>Leaderboard</h2>
      <table style={{width:'100%',background:'#232336',borderRadius:8}}>
        <thead>
          <tr style={{background:'#232336',color:'#facc15'}}>
            <th style={{padding:'8px 6px',textAlign:'left'}}>User</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Reputation</th>
          </tr>
        </thead>
        <tbody>
          {data.leaderboard && data.leaderboard.length ? data.leaderboard.map((item, i) => (
            <tr key={i} style={{borderBottom:'1px solid #333'}}>
              <td style={{padding:'8px 6px'}}>{item.user}</td>
              <td style={{padding:'8px 6px'}}>{item.reputation}</td>
            </tr>
          )) : <tr><td colSpan={2} style={{padding:12}}>No leaderboard data.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default CommunityReputationPage;
