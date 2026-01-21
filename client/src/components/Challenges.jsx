import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaTrophy, FaFire, FaSearch, FaFilter, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';
import '../Style/Challenges.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

const difficultyColors = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
  expert: '#9c27b0'
};

const categoryIcons = {
  arrays: '📊',
  strings: '📝',
  'linked-lists': '🔗',
  trees: '🌳',
  graphs: '🕸️',
  dp: '🧮',
  sorting: '📈',
  searching: '🔍',
  math: '➗',
  other: '💡'
};

// Static list of popular LeetCode problems
const leetCodeProblems = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "easy",
    category: "arrays",
    points: 100,
    solvedCount: 2456789,
    successRate: 45.2,
    leetCodeUrl: "https://leetcode.com/problems/two-sum/",
    tags: ["array", "hash-table"]
  },
  {
    id: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "medium",
    category: "linked-lists",
    points: 200,
    solvedCount: 1234567,
    successRate: 32.1,
    leetCodeUrl: "https://leetcode.com/problems/add-two-numbers/",
    tags: ["linked-list", "math"]
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "medium",
    category: "strings",
    points: 200,
    solvedCount: 987654,
    successRate: 28.7,
    leetCodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    tags: ["string", "sliding-window"]
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "hard",
    category: "arrays",
    points: 300,
    solvedCount: 567890,
    successRate: 25.3,
    leetCodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    tags: ["array", "binary-search", "divide-and-conquer"]
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    difficulty: "medium",
    category: "strings",
    points: 200,
    solvedCount: 876543,
    successRate: 27.8,
    leetCodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
    tags: ["string", "dynamic-programming"]
  },
  {
    id: 6,
    title: "Zigzag Conversion",
    slug: "zigzag-conversion",
    difficulty: "medium",
    category: "strings",
    points: 200,
    solvedCount: 654321,
    successRate: 35.6,
    leetCodeUrl: "https://leetcode.com/problems/zigzag-conversion/",
    tags: ["string"]
  },
  {
    id: 7,
    title: "Reverse Integer",
    slug: "reverse-integer",
    difficulty: "easy",
    category: "math",
    points: 100,
    solvedCount: 1234567,
    successRate: 25.8,
    leetCodeUrl: "https://leetcode.com/problems/reverse-integer/",
    tags: ["math"]
  },
  {
    id: 8,
    title: "String to Integer (atoi)",
    slug: "string-to-integer-atoi",
    difficulty: "medium",
    category: "strings",
    points: 200,
    solvedCount: 789012,
    successRate: 15.2,
    leetCodeUrl: "https://leetcode.com/problems/string-to-integer-atoi/",
    tags: ["string", "parsing"]
  },
  {
    id: 9,
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "easy",
    category: "math",
    points: 100,
    solvedCount: 1456789,
    successRate: 48.9,
    leetCodeUrl: "https://leetcode.com/problems/palindrome-number/",
    tags: ["math"]
  },
  {
    id: 10,
    title: "Regular Expression Matching",
    slug: "regular-expression-matching",
    difficulty: "hard",
    category: "strings",
    points: 300,
    solvedCount: 345678,
    successRate: 25.1,
    leetCodeUrl: "https://leetcode.com/problems/regular-expression-matching/",
    tags: ["string", "dynamic-programming", "recursion"]
  },
  {
    id: 11,
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "medium",
    category: "arrays",
    points: 200,
    solvedCount: 678901,
    successRate: 45.6,
    leetCodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    tags: ["array", "two-pointers"]
  },
  {
    id: 12,
    title: "Integer to Roman",
    slug: "integer-to-roman",
    difficulty: "medium",
    category: "math",
    points: 200,
    solvedCount: 567890,
    successRate: 52.3,
    leetCodeUrl: "https://leetcode.com/problems/integer-to-roman/",
    tags: ["math", "string"]
  },
  {
    id: 13,
    title: "Roman to Integer",
    slug: "roman-to-integer",
    difficulty: "easy",
    category: "math",
    points: 100,
    solvedCount: 1234567,
    successRate: 55.7,
    leetCodeUrl: "https://leetcode.com/problems/roman-to-integer/",
    tags: ["math", "string"]
  },
  {
    id: 14,
    title: "Longest Common Prefix",
    slug: "longest-common-prefix",
    difficulty: "easy",
    category: "strings",
    points: 100,
    solvedCount: 987654,
    successRate: 38.9,
    leetCodeUrl: "https://leetcode.com/problems/longest-common-prefix/",
    tags: ["string"]
  },
  {
    id: 15,
    title: "3Sum",
    slug: "3sum",
    difficulty: "medium",
    category: "arrays",
    points: 200,
    solvedCount: 789012,
    successRate: 24.5,
    leetCodeUrl: "https://leetcode.com/problems/3sum/",
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    id: 16,
    title: "3Sum Closest",
    slug: "3sum-closest",
    difficulty: "medium",
    category: "arrays",
    points: 200,
    solvedCount: 456789,
    successRate: 42.1,
    leetCodeUrl: "https://leetcode.com/problems/3sum-closest/",
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    id: 17,
    title: "Letter Combinations of a Phone Number",
    slug: "letter-combinations-of-a-phone-number",
    difficulty: "medium",
    category: "strings",
    points: 200,
    solvedCount: 678901,
    successRate: 43.2,
    leetCodeUrl: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    tags: ["string", "backtracking"]
  },
  {
    id: 18,
    title: "4Sum",
    slug: "4sum",
    difficulty: "medium",
    category: "arrays",
    points: 200,
    solvedCount: 345678,
    successRate: 31.4,
    leetCodeUrl: "https://leetcode.com/problems/4sum/",
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    id: 19,
    title: "Remove Nth Node From End of List",
    slug: "remove-nth-node-from-end-of-list",
    difficulty: "medium",
    category: "linked-lists",
    points: 200,
    solvedCount: 567890,
    successRate: 35.6,
    leetCodeUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    tags: ["linked-list", "two-pointers"]
  },
  {
    id: 20,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "easy",
    category: "strings",
    points: 100,
    solvedCount: 1456789,
    successRate: 38.7,
    leetCodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    tags: ["string", "stack"]
  }
];

const Challenges = () => {
  const [challenges, setChallenges] = useState(leetCodeProblems);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: ''
  });
  const [userProgress, setUserProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('challenges');

  useEffect(() => {
    filterChallenges();
  }, [filters.difficulty, filters.category, filters.search]);

  const filterChallenges = () => {
    let filtered = leetCodeProblems;

    if (filters.difficulty) {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    if (filters.category) {
      filtered = filtered.filter(challenge => challenge.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    setChallenges(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterChallenges();
  };

  return (
    <div className="challenges-container">
      {/* Hero Section */}
      <div className="challenges-hero">
        <h1><FaCode /> Coding Challenges</h1>
        <p>Sharpen your skills with curated programming problems</p>
        
        {/* Stats Bar */}
        {userProgress && (
          <div className="user-stats-bar">
            <div className="stat-item">
              <FaTrophy className="stat-icon gold" />
              <span className="stat-value">{userProgress.totalSolved}</span>
              <span className="stat-label">Solved</span>
            </div>
            <div className="stat-item">
              <FaStar className="stat-icon" />
              <span className="stat-value">{userProgress.totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat-item easy">
              <span className="stat-value">{userProgress.byDifficulty?.easy || 0}</span>
              <span className="stat-label">Easy</span>
            </div>
            <div className="stat-item medium">
              <span className="stat-value">{userProgress.byDifficulty?.medium || 0}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-item hard">
              <span className="stat-value">{userProgress.byDifficulty?.hard || 0}</span>
              <span className="stat-label">Hard</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="challenges-tabs">
        <button 
          className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <FaCode /> Problems
        </button>
        <button 
          className={`tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          <FaTrophy /> Contests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaChartLine /> Leaderboard
        </button>
      </div>

      {activeTab === 'challenges' && (
        <>
          {/* Filters */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <button type="submit" className="search-btn">Search</button>
            </form>

            <div className="filter-buttons">
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="filter-select"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="arrays">Arrays</option>
                <option value="strings">Strings</option>
                <option value="linked-lists">Linked Lists</option>
                <option value="trees">Trees</option>
                <option value="graphs">Graphs</option>
                <option value="dp">Dynamic Programming</option>
                <option value="sorting">Sorting</option>
                <option value="searching">Searching</option>
                <option value="math">Math</option>
              </select>
            </div>
          </div>

          {/* Challenges List */}
          <div className="challenges-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="empty-state">
                <FaCode className="empty-icon" />
                <p>No challenges found. Try different filters!</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="challenge-card"
                >
                  <div className="challenge-header">
                    <span className="category-icon">{categoryIcons[challenge.category] || '💡'}</span>
                    <h3>{challenge.title}</h3>
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: difficultyColors[challenge.difficulty] }}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>

                  <div className="challenge-meta">
                    <span className="points">
                      <FaStar /> {challenge.points} pts
                    </span>
                    <span className="solved-count">
                      <FaUsers /> {challenge.solvedCount} solved
                    </span>
                    <span className="success-rate">
                      {challenge.successRate}% success
                    </span>
                  </div>

                  <div className="challenge-tags">
                    {challenge.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="challenge-actions">
                    <a
                      href={challenge.leetCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="solve-leetcode-btn"
                    >
                      Solve on LeetCode
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'contests' && (
        <ContestsList />
      )}

      {activeTab === 'leaderboard' && (
        <GlobalLeaderboard />
      )}
    </div>
  );
};

// Contests List Component
const ContestsList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/contests/list`);
      const data = await res.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'Upcoming', color: '#2196f3' },
      active: { text: 'Live Now', color: '#4caf50' },
      ended: { text: 'Ended', color: '#9e9e9e' }
    };
    return badges[status] || badges.upcoming;
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div></div>;
  }

  return (
    <div className="contests-list">
      {contests.length === 0 ? (
        <div className="empty-state">
          <FaTrophy className="empty-icon" />
          <p>No contests available yet. Check back soon!</p>
        </div>
      ) : (
        contests.map((contest) => {
          const badge = getStatusBadge(contest.status);
          return (
            <div key={contest._id} className="contest-card">
              <div className="contest-header">
                <h3>{contest.title}</h3>
                <span className="status-badge" style={{ backgroundColor: badge.color }}>
                  {badge.text}
                </span>
              </div>
              <p className="contest-desc">{contest.description}</p>
              <div className="contest-meta">
                <span>📅 {new Date(contest.startTime).toLocaleDateString()}</span>
                <span>⏱️ {contest.duration} min</span>
                <span>👥 {contest.participantCount} joined</span>
              </div>
              <button 
                className="join-contest-btn"
                onClick={() => navigate(`/contests/${contest.slug}`)}
                disabled={contest.status === 'ended'}
              >
                {contest.status === 'active' ? 'Enter Contest' : 
                 contest.status === 'upcoming' ? 'View Details' : 'View Results'}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

// Global Leaderboard Component
const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real leaderboard data from API
    const fetchLeaderboard = async () => {
      try {
        // For now, show empty state - will populate from actual submissions
        setLeaderboard([]);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div></div>;
  }

  return (
    <div className="leaderboard-section">
      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <FaTrophy className="empty-icon" />
          <p>No rankings yet. Be the first to solve challenges!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>User</span>
            <span>Points</span>
            <span>Solved</span>
          </div>
          {leaderboard.map((user, index) => (
            <div key={index} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
              <span className="rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.rank}
              </span>
              <span className="name">{user.name}</span>
              <span className="points">{user.points}</span>
              <span className="solved">{user.solved}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Challenges;
