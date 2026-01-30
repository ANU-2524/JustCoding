import React, { useEffect, useState } from "react";
import "./AdvancedLeaderboard.css";

// Demo: Aggregate all submissions from localStorage for all prompts
function getAllPromptKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith("prompt_"));
}

function getAllSubmissions() {
  const keys = getAllPromptKeys();
  let all = [];
  keys.forEach(key => {
    const subs = JSON.parse(localStorage.getItem(key) || "[]");
    subs.forEach((s, idx) => {
      all.push({ ...s, promptKey: key, date: key.replace("prompt_", "").replace(/_/g, "/"), idx });
    });
  });
  return all;
}

function analyzeUserStats(submissions) {
  // Group by name
  const users = {};
  submissions.forEach(sub => {
    if (!users[sub.name]) users[sub.name] = { name: sub.name, totalVotes: 0, solutions: [], streak: 0, lastDate: null };
    users[sub.name].totalVotes += sub.votes || 0;
    users[sub.name].solutions.push(sub);
  });
  // Calculate streaks (consecutive days)
  Object.values(users).forEach(user => {
    const dates = user.solutions.map(s => s.promptKey).sort();
    let streak = 1, maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1].replace("prompt_", "").replace(/_/g, "/"));
      const curr = new Date(dates[i].replace("prompt_", "").replace(/_/g, "/"));
      if ((curr - prev) / (1000*60*60*24) === 1) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 1;
      }
    }
    user.streak = maxStreak;
  });
  return Object.values(users);
}

function analyzeSolutionQuality(solution) {
  // Demo: Use code length and upvotes as proxy for quality/efficiency
  if (!solution.solution) return "N/A";
  const len = solution.solution.length;
  if (len < 50) return "Concise";
  if (len < 200) return "Good";
  return "Detailed";
}

function getBadges(user) {
  const badges = [];
  if (user.totalVotes >= 10) badges.push("Top Voted");
  if (user.streak >= 3) badges.push("Streak Star");
  if (user.solutions.length >= 5) badges.push("Prolific");
  return badges;
}

export default function AdvancedLeaderboard() {
  const [users, setUsers] = useState([]);
  const [allSubs, setAllSubs] = useState([]);

  useEffect(() => {
    const subs = getAllSubmissions();
    setAllSubs(subs);
    setUsers(analyzeUserStats(subs));
  }, []);

  // Sort by totalVotes, then by streak, then by number of solutions
  const sorted = [...users].sort((a, b) =>
    b.totalVotes - a.totalVotes || b.streak - a.streak || b.solutions.length - a.solutions.length
  );

  return (
    <div className="advanced-leaderboard-container">
      <h2>Advanced Leaderboard & Analytics</h2>
      <table className="advanced-leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Total Upvotes</th>
            <th>Solutions</th>
            <th>Best Streak</th>
            <th>Badges</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((user, idx) => (
            <tr key={user.name}>
              <td>{idx + 1}</td>
              <td>{user.name}</td>
              <td>{user.totalVotes}</td>
              <td>{user.solutions.length}</td>
              <td>{user.streak}</td>
              <td>{getBadges(user).map(b => <span className="badge" key={b}>{b}</span>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="advanced-leaderboard-analytics">
        <h3>Solution Analytics</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Quality</th>
              <th>Upvotes</th>
            </tr>
          </thead>
          <tbody>
            {allSubs.map((s, idx) => (
              <tr key={idx}>
                <td>{s.name}</td>
                <td>{s.date}</td>
                <td>{analyzeSolutionQuality(s)}</td>
                <td>{s.votes || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
