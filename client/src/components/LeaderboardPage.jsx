import React, { useEffect, useState } from 'react';

const SAMPLE_LEADERBOARD = [
  { odId: 'sample1', odName: 'Alice', totalPoints: 1200 },
  { odId: 'sample2', odName: 'Bob', totalPoints: 950 },
  { odId: 'sample3', odName: 'Charlie', totalPoints: 800 }
];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(() => setLeaderboard(SAMPLE_LEADERBOARD))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (!leaderboard.length) return <div>No leaderboard data available.</div>;

  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, idx) => (
            <tr key={entry.odId || idx}>
              <td>{idx + 1}</td>
              <td>{entry.odName || entry.userName || entry.userId}</td>
              <td>{entry.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;
