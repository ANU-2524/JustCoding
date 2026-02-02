import React, { useState, useEffect, useRef } from "react";
import "./PromptHistory.css";
import PrismHighlight from "./PrismHighlight";
import SolutionComments from "./SolutionComments";

// Demo: Use the same prompts as DailyPrompt
const getAllPrompts = () => [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\n// Explanation:\nnums[0] + nums[1] == 9, so return [0,1].",
    difficulty: "Easy",
    category: "Arrays",
    key: "prompt_2026_1_28",
    submissions: 42,
    popularity: 95,
    avgRating: 4.7
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string in-place with O(1) extra memory. The input string is given as an array of characters.",
    example: "Input: ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']\n\n// Two-pointer approach is recommended",
    difficulty: "Easy",
    category: "Strings",
    key: "prompt_2026_1_29",
    submissions: 35,
    popularity: 88,
    avgRating: 4.5
  },
  {
    title: "FizzBuzz",
    description: "Given an integer n, return a string array answer where answer[i] == 'Fizz' if i is divisible by 3, 'Buzz' if divisible by 5, 'FizzBuzz' if divisible by both.",
    example: "Input: n = 15\nOutput: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz']",
    difficulty: "Easy",
    category: "Basic",
    key: "prompt_2026_1_30",
    submissions: 28,
    popularity: 82,
    avgRating: 4.3
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    example: "Input: root = [1,null,2,3]\nOutput: [1,3,2]\n\n// Recursive solution is straightforward",
    difficulty: "Medium",
    category: "Trees",
    key: "prompt_2026_1_27",
    submissions: 31,
    popularity: 78,
    avgRating: 4.6
  },
  {
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists and return it as a sorted list.",
    example: "Input: l1 = [1,2,4], l2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
    difficulty: "Easy",
    category: "Linked Lists",
    key: "prompt_2026_1_26",
    submissions: 39,
    popularity: 91,
    avgRating: 4.8
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    example: "Input: s = '()[]{}'\nOutput: true\n\n// Use a stack for efficient solution",
    difficulty: "Easy",
    category: "Stacks",
    key: "prompt_2026_1_25",
    submissions: 47,
    popularity: 96,
    avgRating: 4.9
  }
];

const getSubmissionsForPrompt = (key) => {
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  // Add demo data if empty
  if (saved.length === 0) {
    const demoSubmissions = [
      {
        name: "Alex Johnson",
        solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        votes: 42,
        timestamp: Date.now() - 86400000,
        rating: 5,
        language: "JavaScript",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Uses a hash map to store seen numbers and their indices. For each number, checks if its complement exists in the map."
      },
      {
        name: "Maria Chen",
        solution: `const twoSum = (nums, target) => {
  const numMap = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (numMap[diff] !== undefined) {
      return [numMap[diff], i];
    }
    numMap[nums[i]] = i;
  }
  return [];
};`,
        votes: 38,
        timestamp: Date.now() - 172800000,
        rating: 4,
        language: "JavaScript",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Clean solution using object for O(1) lookups. Returns indices immediately when complement is found."
      },
      {
        name: "David Park",
        solution: `function twoSum(nums, target) {
  // Two-pass solution
  const indices = new Map();
  
  // First pass: build map
  for (let i = 0; i < nums.length; i++) {
    indices.set(nums[i], i);
  }
  
  // Second pass: find complement
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (indices.has(complement) && indices.get(complement) !== i) {
      return [i, indices.get(complement)];
    }
  }
  
  return [];
}`,
        votes: 25,
        timestamp: Date.now() - 259200000,
        rating: 4,
        language: "JavaScript",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Two-pass approach. First builds complete map, then finds complement ensuring indices are different."
      }
    ];
    localStorage.setItem(key, JSON.stringify(demoSubmissions));
    return demoSubmissions;
  }
  return saved;
};

const getDifficultyColor = (difficulty) => {
  switch(difficulty.toLowerCase()) {
    case 'easy': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'hard': return '#EF4444';
    default: return '#6B7280';
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Simple icon components using emojis or text
const Icon = ({ type, size = 16 }) => {
  const icons = {
    trophy: "🏆",
    star: "⭐",
    trendingUp: "📈",
    calendar: "📅",
    filter: "🔍",
    zap: "⚡",
    clock: "🕒",
    user: "👤",
    award: "🏅",
    thumbsUp: "👍",
    download: "📥",
    eye: "👁️",
    share: "↗️",
    chevronLeft: "◀",
    chevronRight: "▶"
  };
  
  return (
    <span 
      className="icon" 
      style={{ 
        fontSize: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icons[type] || "⚫"}
    </span>
  );
};

export default function PromptHistory() {
  const [prompts, setPrompts] = useState(getAllPrompts());
  const [selected, setSelected] = useState(prompts[0]);
  const [submissions, setSubmissions] = useState([]);
  const [sortBy, setSortBy] = useState("votes");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const submissionsPerPage = 6;
  const containerRef = useRef(null);

  useEffect(() => {
    const subs = getSubmissionsForPrompt(selected.key);
    setSubmissions(subs);
    setCurrentPage(0);
    setExpandedCard(null);
  }, [selected]);

  const handleVote = (submissionIndex) => {
    const updated = [...submissions];
    updated[submissionIndex].votes = (updated[submissionIndex].votes || 0) + 1;
    setSubmissions(updated);
    localStorage.setItem(selected.key, JSON.stringify(updated));
  };

  const handleCopyCode = (code, submissionIndex) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(submissionIndex);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShare = (prompt, solution) => {
    const shareText = `Check out this solution for "${prompt.title}" on CodeCollab:\n\n${solution.substring(0, 100)}...`;
    if (navigator.share) {
      navigator.share({
        title: `${prompt.title} Solution`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share link copied to clipboard!');
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    !filterLanguage || sub.language === filterLanguage
  );

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch(sortBy) {
      case 'votes':
        return (b.votes || 0) - (a.votes || 0);
      case 'newest':
        return b.timestamp - a.timestamp;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return (b.votes || 0) - (a.votes || 0);
    }
  });

  const totalPages = Math.ceil(sortedSubmissions.length / submissionsPerPage);
  const paginatedSubmissions = sortedSubmissions.slice(
    currentPage * submissionsPerPage,
    (currentPage + 1) * submissionsPerPage
  );

  const languages = [...new Set(submissions.map(s => s.language))];

  return (
    <div className="prompt-history-container" ref={containerRef}>
      {/* Header Section */}
      <header className="history-header">
        <div className="header-content">
          <h1 className="history-title">
            <Icon type="trophy" size={32} />
            Prompt History & Solutions
          </h1>
          <p className="history-subtitle">
            Explore past coding challenges and learn from community solutions
            <span className="highlight-text"> 🏆 Top-rated approaches from developers worldwide</span>
          </p>
        </div>
        
        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Icon type="star" size={20} />
            </div>
            <div>
              <div className="stat-value">{prompts.length}</div>
              <div className="stat-label">Past Challenges</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Icon type="trendingUp" size={20} />
            </div>
            <div>
              <div className="stat-value">{prompts.reduce((acc, p) => acc + p.submissions, 0)}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Icon type="calendar" size={20} />
            </div>
            <div>
              <div className="stat-value">{prompts[0].key.replace("prompt_", "").split("_")[0]}</div>
              <div className="stat-label">Latest Challenge</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="history-main">
        {/* Sidebar - Prompt Selection */}
        <div className="prompt-sidebar">
          <div className="sidebar-header">
            <h3><Icon type="filter" size={20} /> Past Challenges</h3>
            <span className="sidebar-count">{prompts.length} total</span>
          </div>
          <div className="prompt-list">
            {prompts.map((prompt, index) => (
              <button
                key={prompt.key}
                className={`prompt-card ${selected.key === prompt.key ? "selected" : ""}`}
                onClick={() => setSelected(prompt)}
              >
                <div className="prompt-card-header">
                  <div className="prompt-title-wrapper">
                    <span className="prompt-number">#{(index + 1).toString().padStart(2, '0')}</span>
                    <h4 className="prompt-card-title">{prompt.title}</h4>
                  </div>
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(prompt.difficulty) }}
                  >
                    {prompt.difficulty}
                  </span>
                </div>
                <div className="prompt-card-meta">
                  <span className="prompt-category">{prompt.category}</span>
                  <span className="prompt-stats">
                    <span className="stat">
                      <Icon type="star" size={14} /> {prompt.avgRating}
                    </span>
                    <span className="stat">
                      <Icon type="user" size={14} /> {prompt.submissions}
                    </span>
                  </span>
                </div>
                <div className="prompt-card-date">
                  <Icon type="clock" size={14} />
                  {prompt.key.replace("prompt_", "").replace(/_/g, "/")}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="history-content">
          {/* Selected Prompt Details */}
          <div className="selected-prompt-section">
            <div className="prompt-details-header">
              <div>
                <h2 className="selected-prompt-title">
                  <span className="prompt-number-large">#{(prompts.indexOf(selected) + 1).toString().padStart(2, '0')}</span>
                  {selected.title}
                </h2>
                <div className="prompt-tags">
                  <span className="prompt-tag category">{selected.category}</span>
                  <span 
                    className="prompt-tag difficulty"
                    style={{ 
                      backgroundColor: getDifficultyColor(selected.difficulty),
                      color: selected.difficulty === 'Easy' ? '#000' : '#fff'
                    }}
                  >
                    {selected.difficulty}
                  </span>
                  <span className="prompt-tag">
                    <Icon type="star" size={14} /> {selected.avgRating}
                  </span>
                  <span className="prompt-tag">
                    <Icon type="user" size={14} /> {selected.submissions} solutions
                  </span>
                </div>
              </div>
              <div className="prompt-popularity">
                <div className="popularity-meter">
                  <div className="meter-label">Popularity</div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill" 
                      style={{ width: `${selected.popularity}%` }}
                    />
                  </div>
                  <div className="meter-value">{selected.popularity}%</div>
                </div>
              </div>
            </div>

            <div className="prompt-description-box">
              <div className="description-header">
                <h3>📋 Problem Description</h3>
                <span className="word-count">{selected.description.split(' ').length} words</span>
              </div>
              <p className="prompt-description">{selected.description}</p>
              
              <div className="example-section">
                <h4>📝 Example</h4>
                <pre className="prompt-example">
                  <code>{selected.example}</code>
                </pre>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="sortSelect">
                  <Icon type="trendingUp" size={16} /> Sort by
                </label>
                <select
                  id="sortSelect"
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="votes">Most Votes</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="languageSelect">
                  <Icon type="zap" size={16} /> Language
                </label>
                <select
                  id="languageSelect"
                  className="filter-select"
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="results-info">
                <span className="results-count">
                  Showing {paginatedSubmissions.length} of {sortedSubmissions.length} solutions
                </span>
              </div>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="solutions-grid">
            {paginatedSubmissions.length === 0 ? (
              <div className="empty-solutions">
                <div className="empty-icon">💡</div>
                <h3>No solutions found</h3>
                <p>Try adjusting your filters or be the first to submit a solution!</p>
              </div>
            ) : (
              <>
                {paginatedSubmissions.map((submission, index) => (
                  <div 
                    className={`solution-card ${expandedCard === index ? 'expanded' : ''}`}
                    key={index}
                  >
                    <div className="solution-card-header">
                      <div className="solution-author">
                        <div className="author-avatar">
                          {submission.name.charAt(0)}
                        </div>
                        <div>
                          <div className="author-name">{submission.name}</div>
                          <div className="solution-meta">
                            <span className="solution-language">{submission.language}</span>
                            <span className="solution-time">
                              <Icon type="clock" size={14} /> {formatTimeAgo(submission.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="solution-stats">
                        <button 
                          className="vote-button"
                          onClick={() => handleVote(index)}
                          title="Vote for this solution"
                        >
                          <Icon type="thumbsUp" size={18} />
                          <span className="vote-count">{submission.votes || 0}</span>
                        </button>
                        
                        <div className="solution-rating">
                          <Icon type="star" size={14} />
                          {submission.rating || 4}.0
                        </div>
                      </div>
                    </div>

                    <div className="solution-complexity">
                      <span className="complexity-item">
                        <span className="complexity-label">Time:</span>
                        <span className="complexity-value">{submission.timeComplexity}</span>
                      </span>
                      <span className="complexity-item">
                        <span className="complexity-label">Space:</span>
                        <span className="complexity-value">{submission.spaceComplexity}</span>
                      </span>
                    </div>

                    {submission.explanation && (
                      <div className="solution-explanation">
                        <div className="explanation-header">
                          <span className="explanation-icon">💡</span>
                          <span className="explanation-title">Approach</span>
                        </div>
                        <p className="explanation-text">{submission.explanation}</p>
                      </div>
                    )}

                    <div className="solution-code">
                      <div className="code-header">
                        <span className="code-language">{submission.language}</span>
                        <div className="code-actions">
                          <button 
                            className="code-action-btn copy-btn"
                            onClick={() => handleCopyCode(submission.solution, index)}
                            title="Copy code"
                          >
                            {copiedCode === index ? (
                              <span className="copied-text">✓ Copied</span>
                            ) : (
                              <>
                                <Icon type="download" size={16} />
                                Copy
                              </>
                            )}
                          </button>
                          <button 
                            className="code-action-btn view-btn"
                            onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                            title={expandedCard === index ? "Collapse" : "Expand"}
                          >
                            <Icon type="eye" size={16} />
                            {expandedCard === index ? "Collapse" : "View"}
                          </button>
                          <button 
                            className="code-action-btn share-btn"
                            onClick={() => handleShare(selected, submission.solution)}
                            title="Share solution"
                          >
                            <Icon type="share" size={16} />
                            Share
                          </button>
                        </div>
                      </div>
                      
                      <PrismHighlight 
                        code={submission.solution} 
                        language={submission.language.toLowerCase()} 
                        maxHeight={expandedCard === index ? 'none' : '200px'}
                      />
                    </div>

                    {/* Comments Section */}
                    <SolutionComments 
                      promptKey={selected.key} 
                      solutionIndex={index}
                      expanded={expandedCard === index}
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <Icon type="chevronLeft" size={18} />
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
                <Icon type="chevronRight" size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="history-footer">
        <div className="footer-content">
          <div className="footer-stats">
            <span className="footer-stat">
              <Icon type="award" size={18} />
              Most Solutions: {prompts.reduce((max, p) => p.submissions > max.submissions ? p : max).title}
            </span>
            <span className="footer-stat">
              <Icon type="trendingUp" size={18} />
              Highest Rated: {prompts.reduce((max, p) => p.avgRating > max.avgRating ? p : max).title}
            </span>
          </div>
          <p className="footer-note">
            💡 Pro tip: Bookmark your favorite solutions and compare different approaches to learn faster!
          </p>
        </div>
      </footer>
    </div>
  );
}