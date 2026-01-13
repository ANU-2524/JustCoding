import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaTrophy, FaSearch, FaFilter, FaStar, FaUsers, FaChartLine, FaTimes } from 'react-icons/fa';
import '../Style/Challenges.css';

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

const mockChallenges = [
  {
    _id: '1', title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', category: 'arrays', points: 100, solvedCount: 1524, successRate: 85, tags: ['array', 'hash-table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9']
  },
  {
    _id: '2', title: 'Reverse String', slug: 'reverse-string', difficulty: 'easy', category: 'strings', points: 50, solvedCount: 1845, successRate: 92, tags: ['string', 'two-pointers'],
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'The string "hello" reversed' }
    ],
    constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ascii character']
  },
  {
    _id: '3', title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'easy', category: 'strings', points: 80, solvedCount: 1342, successRate: 78, tags: ['string', 'stack'],
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if valid.',
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Valid parentheses' },
      { input: 's = "(]"', output: 'false', explanation: 'Invalid parentheses' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only']
  },
  {
    _id: '4', title: 'Merge Sorted Lists', slug: 'merge-sorted-lists', difficulty: 'easy', category: 'linked-lists', points: 100, solvedCount: 1123, successRate: 75, tags: ['linked-list'],
    description: 'Merge two sorted linked lists and return it as a sorted list.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    constraints: ['0 <= lists length <= 50', '-100 <= Node.val <= 100']
  },
  {
    _id: '5', title: 'Best Time to Buy Stock', slug: 'best-time-stock', difficulty: 'easy', category: 'arrays', points: 120, solvedCount: 1456, successRate: 68, tags: ['array', 'dp'],
    description: 'You are given an array prices where prices[i] is the price of a stock on the ith day.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4']
  },
  {
    _id: '6', title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'easy', category: 'strings', points: 70, solvedCount: 1543, successRate: 90, tags: ['string', 'hash-table'],
    description: 'Given two strings s and t, return true if t is an anagram of s.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4']
  },
  {
    _id: '7', title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'medium', category: 'arrays', points: 200, solvedCount: 1123, successRate: 65, tags: ['array', 'dp'],
    description: 'Given an integer array nums, find the subarray with the largest sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has sum 6' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4']
  },
  {
    _id: '8', title: '3Sum', slug: 'three-sum', difficulty: 'medium', category: 'arrays', points: 220, solvedCount: 987, successRate: 52, tags: ['array', 'two-pointers'],
    description: 'Given an integer array nums, return all the triplets that sum to 0.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5']
  },
  {
    _id: '9', title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'medium', category: 'strings', points: 180, solvedCount: 765, successRate: 68, tags: ['string', 'hash-table'],
    description: 'Given an array of strings strs, group the anagrams together.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100']
  },
  {
    _id: '10', title: 'Longest Substring', slug: 'longest-substring', difficulty: 'medium', category: 'strings', points: 200, solvedCount: 987, successRate: 58, tags: ['string', 'sliding-window'],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" with length 3' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4']
  },
  {
    _id: '11', title: 'Search Rotated Array', slug: 'search-rotated-array', difficulty: 'medium', category: 'arrays', points: 210, solvedCount: 321, successRate: 48, tags: ['array', 'binary-search'],
    description: 'Search in rotated sorted array.',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' }
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4']
  },
  {
    _id: '12', title: 'Combination Sum', slug: 'combination-sum', difficulty: 'medium', category: 'arrays', points: 220, solvedCount: 234, successRate: 42, tags: ['array', 'backtracking'],
    description: 'Find all unique combinations in candidates where the numbers sum to target.',
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' }
    ],
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40']
  },
  {
    _id: '13', title: 'Permutations', slug: 'permutations', difficulty: 'medium', category: 'arrays', points: 180, solvedCount: 543, successRate: 58, tags: ['array', 'backtracking'],
    description: 'Given an array nums of distinct integers, return all possible permutations.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }
    ],
    constraints: ['1 <= nums.length <= 6', '-10 <= nums[i] <= 10']
  },
  {
    _id: '14', title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'medium', category: 'arrays', points: 190, solvedCount: 654, successRate: 62, tags: ['array', 'sorting'],
    description: 'Given an array of intervals, merge overlapping intervals.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }
    ],
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2']
  },
  {
    _id: '15', title: 'Unique Paths', slug: 'unique-paths', difficulty: 'medium', category: 'dp', points: 200, solvedCount: 765, successRate: 65, tags: ['dp', 'math'],
    description: 'A robot is located at the top-left corner of a m x n grid.',
    examples: [
      { input: 'm = 3, n = 7', output: '28' }
    ],
    constraints: ['1 <= m, n <= 100']
  },
  {
    _id: '16', title: 'Coin Change', slug: 'coin-change', difficulty: 'medium', category: 'dp', points: 230, solvedCount: 432, successRate: 52, tags: ['dp'],
    description: 'You are given an integer array coins representing coins and an integer amount.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4']
  },
  {
    _id: '17', title: 'House Robber', slug: 'house-robber', difficulty: 'medium', category: 'dp', points: 190, solvedCount: 654, successRate: 63, tags: ['dp'],
    description: 'You are a professional robber planning to rob houses along a street.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 and 3' }
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400']
  },
  {
    _id: '18', title: 'Word Break', slug: 'word-break', difficulty: 'medium', category: 'dp', points: 210, solvedCount: 543, successRate: 58, tags: ['dp'],
    description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented.',
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' }
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000']
  },
  {
    _id: '19', title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'medium', category: 'graphs', points: 210, solvedCount: 543, successRate: 57, tags: ['graph', 'dfs'],
    description: 'Given an m x n 2D binary grid representing a map of 1s (land) and 0s (water).',
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300']
  },
  {
    _id: '20', title: 'Course Schedule', slug: 'course-schedule', difficulty: 'medium', category: 'graphs', points: 230, solvedCount: 432, successRate: 55, tags: ['graph', 'topological-sort'],
    description: 'There are a total of numCourses courses labeled from 0 to numCourses - 1.',
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000']
  },
  {
    _id: '21', title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'hard', category: 'arrays', points: 350, solvedCount: 234, successRate: 38, tags: ['array', 'two-pointers'],
    description: 'Given n non-negative integers representing an elevation map.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5']
  },
  {
    _id: '22', title: 'N-Queens', slug: 'n-queens', difficulty: 'hard', category: 'arrays', points: 320, solvedCount: 187, successRate: 42, tags: ['array', 'backtracking'],
    description: 'The n-queens puzzle is placing n queens on an n x n chessboard.',
    examples: [
      { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' }
    ],
    constraints: ['1 <= n <= 9']
  },
  {
    _id: '23', title: 'Sliding Window Maximum', slug: 'sliding-window-max', difficulty: 'hard', category: 'arrays', points: 310, solvedCount: 198, successRate: 37, tags: ['array', 'heap'],
    description: 'You are given an array of integers nums and an integer k.',
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length']
  },
  {
    _id: '24', title: 'Median of Two Arrays', slug: 'median-arrays', difficulty: 'hard', category: 'arrays', points: 400, solvedCount: 89, successRate: 28, tags: ['array', 'binary-search'],
    description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000']
  },
  {
    _id: '25', title: 'Regular Expression', slug: 'regex-matching', difficulty: 'hard', category: 'strings', points: 380, solvedCount: 76, successRate: 25, tags: ['string', 'dp'],
    description: 'Given an input string s and a pattern p, implement regular expression matching.',
    examples: [
      { input: 's = "aa", p = "a"', output: 'false' },
      { input: 's = "aa", p = "a*"', output: 'true' }
    ],
    constraints: ['1 <= s.length <= 20', '1 <= p.length <= 30']
  },
  {
    _id: '26', title: 'Merge k Sorted Lists', slug: 'merge-k-lists', difficulty: 'hard', category: 'linked-lists', points: 360, solvedCount: 123, successRate: 33, tags: ['linked-list', 'heap'],
    description: 'You are given an array of k linked-lists lists, each sorted in ascending order.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500']
  },
  {
    _id: '27', title: 'Reverse Nodes in k-Group', slug: 'reverse-nodes-k', difficulty: 'hard', category: 'linked-lists', points: 340, solvedCount: 98, successRate: 30, tags: ['linked-list'],
    description: 'Given the head of a linked list, reverse the nodes of the list k at a time.',
    examples: [
      { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' }
    ],
    constraints: ['The number of nodes in the list is n.', '1 <= k <= n <= 5000', '0 <= Node.val <= 1000']
  },
  {
    _id: '28', title: 'Sudoku Solver', slug: 'sudoku-solver', difficulty: 'hard', category: 'arrays', points: 350, solvedCount: 109, successRate: 34, tags: ['array', 'backtracking'],
    description: 'Write a program to solve a Sudoku puzzle by filling the empty cells.',
    examples: [],
    constraints: ['board.length == 9', 'board[i].length == 9']
  },
  {
    _id: '29', title: 'First Missing Positive', slug: 'first-missing-positive', difficulty: 'hard', category: 'arrays', points: 320, solvedCount: 165, successRate: 39, tags: ['array', 'hash-table'],
    description: 'Given an unsorted integer array nums, return the smallest missing positive integer.',
    examples: [
      { input: 'nums = [1,2,0]', output: '3' },
      { input: 'nums = [3,4,-1,1]', output: '2' }
    ],
    constraints: ['1 <= nums.length <= 5 * 10^5', '-2^31 <= nums[i] <= 2^31 - 1']
  },
  {
    _id: '30', title: 'Word Ladder', slug: 'word-ladder', difficulty: 'hard', category: 'graphs', points: 370, solvedCount: 87, successRate: 32, tags: ['graph', 'bfs'],
    description: 'A transformation sequence from word beginWord to word endWord.',
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }
    ],
    constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000']
  }
];

const mockContests = [
  { _id: 'c1', title: 'Weekly Coding Challenge #1', slug: 'weekly-1', status: 'active', description: 'Solve 5 problems in 2 hours', startTime: '2024-01-15T10:00:00', duration: 120, participantCount: 234 },
  { _id: 'c2', title: 'Algorithm Master Cup', slug: 'algorithm-cup', status: 'upcoming', description: 'Advanced algorithms competition', startTime: '2024-01-20T14:00:00', duration: 180, participantCount: 187 },
  { _id: 'c3', title: 'Data Structures Sprint', slug: 'ds-sprint', status: 'ended', description: 'Fast-paced data structures challenge', startTime: '2024-01-10T09:00:00', duration: 90, participantCount: 321 }
];

const Challenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showProblemPopup, setShowProblemPopup] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, [filters.difficulty, filters.category]);

  const fetchChallenges = async () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockChallenges];
      
      if (filters.difficulty) {
        filtered = filtered.filter(c => c.difficulty === filters.difficulty);
      }
      
      if (filters.category) {
        filtered = filtered.filter(c => c.category === filters.category);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(searchLower) ||
          c.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      setChallenges(filtered);
      setLoading(false);
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchChallenges();
  };

  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setShowProblemPopup(true);
  };

  const closeProblemPopup = () => {
    setShowProblemPopup(false);
    setSelectedChallenge(null);
  };

  return (
    <div className="challenges-container">
      <div className="challenges-hero">
        <h1><FaCode /> Coding Challenges</h1>
        <p>Sharpen your skills with curated programming problems</p>
      </div>

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
                  key={challenge._id}
                  className="challenge-card"
                  onClick={() => handleChallengeClick(challenge)}
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

      {showProblemPopup && selectedChallenge && (
        <div className="problem-popup-overlay">
          <div className="problem-popup">
            <div className="popup-header">
              <h2>{selectedChallenge.title}</h2>
              <button className="close-popup-btn" onClick={closeProblemPopup}>
                <FaTimes />
              </button>
            </div>
            
            <div className="popup-difficulty-category">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: difficultyColors[selectedChallenge.difficulty] }}
              >
                {selectedChallenge.difficulty}
              </span>
              <span className="category-badge">
                {categoryIcons[selectedChallenge.category]} {selectedChallenge.category}
              </span>
              <span className="points-badge">
                <FaStar /> {selectedChallenge.points} points
              </span>
            </div>

            <div className="popup-content">
              <div className="problem-description">
                <h3>Description</h3>
                <p>{selectedChallenge.description}</p>
              </div>

              {selectedChallenge.examples && selectedChallenge.examples.length > 0 && (
                <div className="problem-examples">
                  <h3>Examples</h3>
                  {selectedChallenge.examples.map((example, index) => (
                    <div key={index} className="example-card">
                      <div className="example-input">
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div className="example-output">
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="example-explanation">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedChallenge.constraints && selectedChallenge.constraints.length > 0 && (
                <div className="problem-constraints">
                  <h3>Constraints</h3>
                  <ul>
                    {selectedChallenge.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="problem-tags">
                <h3>Tags</h3>
                <div className="tags-container">
                  {selectedChallenge.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="problem-stats">
                <div className="stat-item">
                  <FaUsers /> {selectedChallenge.solvedCount} solved
                </div>
                <div className="stat-item">
                  <span className="success-rate">{selectedChallenge.successRate}% success rate</span>
                </div>
              </div>
            </div>

            <div className="popup-footer">
              <button className="close-btn" onClick={closeProblemPopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContestsList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setContests(mockContests);
      setLoading(false);
    }, 500);
  }, []);

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

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockLeaderboard = [
        { id: 1, name: 'CodingMaster', points: 3850, solved: 156 },
        { id: 2, name: 'AlgorithmNinja', points: 3720, solved: 148 },
        { id: 3, name: 'DataStructPro', points: 3640, solved: 142 },
        { id: 4, name: 'PythonWizard', points: 3510, solved: 138 },
        { id: 5, name: 'JavaChampion', points: 3420, solved: 132 },
        { id: 6, name: 'CodeWarrior', points: 3350, solved: 128 },
        { id: 7, name: 'BinarySearcher', points: 3280, solved: 124 },
        { id: 8, name: 'RecursionKing', points: 3210, solved: 120 },
        { id: 9, name: 'DynamicProgrammer', points: 3150, solved: 118 },
        { id: 10, name: 'GraphExplorer', points: 3080, solved: 115 }
      ];
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 500);
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
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
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