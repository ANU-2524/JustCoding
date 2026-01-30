import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const UserHistoryPage = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TEMP_HISTORY = [
    {
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      language: "Python",
      challengeTitle: "FizzBuzz Challenge",
      status: "accepted",
      executionTime: 120,
    },
    {
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      language: "JavaScript",
      challengeTitle: "Palindrome Checker",
      status: "failed",
      executionTime: 210,
    },
    {
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      language: "C++",
      challengeTitle: "Prime Number Finder",
      status: "accepted",
      executionTime: 95,
    },
  ];

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setHistory(TEMP_HISTORY);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/execution/history/user/${currentUser.uid}`)
      .then(res => res.json())
      .then(data => {
        const hist = Array.isArray(data) ? data : (data.history || []);
        setHistory(hist.length ? hist : TEMP_HISTORY);
      })
      .catch(() => {
        setError('Could not fetch session history');
        setHistory(TEMP_HISTORY);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div>Loading session history...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!history.length) return <div>No session history found.</div>;

  return (
    <div style={{maxWidth:800,margin:'6rem auto 3rem auto',padding:24,background:'#18181b',borderRadius:12,color:'#f3f4f6'}}>
      <h1 style={{color:'#a5b4fc',marginBottom:24}}>Your Code Session History</h1>
      <table style={{width:'100%',borderCollapse:'collapse',background:'#232336',borderRadius:8}}>
        <thead>
          <tr style={{background:'#232336',color:'#facc15'}}>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Date</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Language</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Challenge</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Status</th>
            <th style={{padding:'8px 6px',textAlign:'left'}}>Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, i) => (
            <tr key={i} style={{borderBottom:'1px solid #333'}}>
              <td style={{padding:'8px 6px'}}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
              <td style={{padding:'8px 6px'}}>{item.language || 'N/A'}</td>
              <td style={{padding:'8px 6px'}}>{item.challengeTitle || item.challengeSlug || 'N/A'}</td>
              <td style={{padding:'8px 6px',color:item.status==='accepted'?'#22d3ee':'#f472b6'}}>{item.status || 'N/A'}</td>
              <td style={{padding:'8px 6px'}}>{item.executionTime ? `${item.executionTime} ms` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserHistoryPage;
