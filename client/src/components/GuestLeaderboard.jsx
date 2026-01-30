import React, { useEffect, useState } from "react";
import './GuestLeaderboard.css';

// Demo backend simulation (replace with real API calls)
function getUserId(currentUser) {
  if (currentUser?.uid) return currentUser.uid;
  let tempId = localStorage.getItem('tempLeaderboardUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempLeaderboardUserId', tempId);
  }
  return tempId;
}

const DEMO_CHALLENGES = [
  { id: 1, title: "FizzBuzz", points: 10 },
  { id: 2, title: "Palindrome", points: 20 },
  { id: 3, title: "Prime Counter", points: 15 },
];

const DEMO_LEADERBOARD_KEY = 'leaderboard-demo-backend';

function loadLeaderboard() {
  return JSON.parse(localStorage.getItem(DEMO_LEADERBOARD_KEY) || '[]');
}
function saveLeaderboard(lb) {
  localStorage.setItem(DEMO_LEADERBOARD_KEY, JSON.stringify(lb));
}

export default function GuestLeaderboard({ currentUser }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [showClaim, setShowClaim] = useState(false);
  const userId = getUserId(currentUser);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
    const guest = loadLeaderboard().find(u => u.id === userId);
    setCompleted(guest ? guest.completed : []);
  }, [userId]);

  useEffect(() => {
    // Save leaderboard whenever it changes
    saveLeaderboard(leaderboard);
  }, [leaderboard]);

  const handleComplete = (challengeId) => {
    if (completed.includes(challengeId)) return;
    const newCompleted = [...completed, challengeId];
    setCompleted(newCompleted);
    let lb = loadLeaderboard();
    let user = lb.find(u => u.id === userId);
    if (!user) {
      user = { id: userId, name: 'Guest', completed: [], points: 0 };
      lb.push(user);
    }
    user.completed = newCompleted;
    user.points = DEMO_CHALLENGES.filter(c => newCompleted.includes(c.id)).reduce((a, c) => a + c.points, 0);
    setLeaderboard(lb.sort((a, b) => b.points - a.points));
  };

  const handleClaim = () => {
    setShowClaim(true);
  };

  return (
    <div className="guest-leaderboard-container">
      <header>
        <h1 className="leaderboard-title">Public Leaderboard</h1>
        <p className="leaderboard-desc">Complete challenges as a guest and see your rank instantly. Sign up to claim your progress!</p>
      </header>
      <section className="leaderboard-challenges-section">
        <h2>Challenges</h2>
        <div className="leaderboard-challenges-list">
          {DEMO_CHALLENGES.map(ch => (
            <div className={`leaderboard-challenge-card${completed.includes(ch.id) ? ' completed' : ''}`} key={ch.id}>
              <span className="challenge-title">{ch.title}</span>
              <span className="challenge-points">{ch.points} pts</span>
              <button
                className="leaderboard-btn primary"
                disabled={completed.includes(ch.id)}
                onClick={() => handleComplete(ch.id)}
              >
                {completed.includes(ch.id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="leaderboard-section">
        <h2>Leaderboard</h2>
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Points</th>
                <th>Challenges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 && (
                <tr><td colSpan={4} className="leaderboard-empty">No participants yet.</td></tr>
              )}
              {leaderboard.map((user, idx) => (
                <tr key={user.id} className={user.id === userId ? 'highlight' : ''}>
                  <td>{idx + 1}</td>
                  <td>{user.name}{user.id === userId && ' (You)'}</td>
                  <td>{user.points}</td>
                  <td>{user.completed.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{textAlign:'center', marginTop:'1.5rem'}}>
          <button className="leaderboard-btn" onClick={handleClaim}>Claim Progress</button>
        </div>
        {showClaim && (
          <div className="leaderboard-claim-modal">
            <div className="leaderboard-claim-content">
              <h3>Claim Your Progress</h3>
              <p>Sign up or log in to save your guest progress to a real account!</p>
              <button className="leaderboard-btn primary" onClick={() => setShowClaim(false)}>Close</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
