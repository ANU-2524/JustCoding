import React, { useEffect, useState, useRef } from "react";
import './CodeGallery.css';

// Demo data for public snippets
const DEMO_SNIPPETS = [
  {
    id: 1,
    title: "FizzBuzz in Python",
    code: "for i in range(1, 101):\n    output = ''\n    if i % 3 == 0:\n        output += 'Fizz'\n    if i % 5 == 0:\n        output += 'Buzz'\n    print(output or i)",
    language: "Python",
    author: "Guest",
    likes: 24,
    views: 156,
    timestamp: Date.now() - 86400000, // 1 day ago
    tags: ["algorithm", "beginner", "python"]
  },
  {
    id: 2,
    title: "Async Fetch in JavaScript",
    code: "async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n    throw error;\n  }\n}",
    language: "JavaScript",
    author: "Ayaanshaikh12243",
    likes: 42,
    views: 289,
    timestamp: Date.now() - 43200000, // 12 hours ago
    tags: ["async", "api", "javascript"]
  },
  {
    id: 3,
    title: "Binary Search in C++",
    code: "int binarySearch(vector<int>& arr, int target) {\n    int left = 0, right = arr.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
    language: "C++",
    author: "Guest",
    likes: 18,
    views: 132,
    timestamp: Date.now() - 172800000, // 2 days ago
    tags: ["algorithm", "search", "c++"]
  },
  {
    id: 4,
    title: "Quick Sort in Python",
    code: "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
    language: "Python",
    author: "DevUser",
    likes: 31,
    views: 204,
    timestamp: Date.now() - 259200000, // 3 days ago
    tags: ["sorting", "algorithm", "python", "recursion"]
  },
  {
    id: 5,
    title: "React Custom Hook",
    code: "import { useState, useEffect } from 'react';\n\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? JSON.parse(stored) : initialValue;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue];\n}",
    language: "JavaScript",
    author: "ReactFan",
    likes: 57,
    views: 321,
    timestamp: Date.now() - 7200000, // 2 hours ago
    tags: ["react", "hooks", "javascript", "frontend"]
  }
];

function getUserId() {
  let tempId = localStorage.getItem('tempGalleryUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempGalleryUserId', tempId);
  }
  return tempId;
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

function getLanguageColor(lang) {
  const colors = {
    'Python': '#3572A5',
    'JavaScript': '#F1E05A',
    'C++': '#F34B7D',
    'Java': '#B07219',
    'TypeScript': '#2B7489',
    'Go': '#00ADD8',
    'Rust': '#DEA584',
    'HTML': '#E34C26',
    'CSS': '#563D7C',
    'SQL': '#E38C00',
    'Other': '#6E7681'
  };
  return colors[lang] || colors.Other;
}

export default function CodeGallery() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    code: "", 
    language: "", 
    tags: "" 
  });
  const [copiedId, setCopiedId] = useState(null);
  const [likedSnippets, setLikedSnippets] = useState(new Set());
  const formRef = useRef(null);

  useEffect(() => {
    // Simulate API fetch with delay
    const timer = setTimeout(() => {
      setSnippets(DEMO_SNIPPETS);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showForm]);

  const handleLike = (snippetId) => {
    if (likedSnippets.has(snippetId)) {
      setLikedSnippets(prev => {
        const newSet = new Set(prev);
        newSet.delete(snippetId);
        return newSet;
      });
      setSnippets(prev => prev.map(s => 
        s.id === snippetId ? { ...s, likes: s.likes - 1 } : s
      ));
    } else {
      setLikedSnippets(prev => new Set(prev).add(snippetId));
      setSnippets(prev => prev.map(s => 
        s.id === snippetId ? { ...s, likes: s.likes + 1 } : s
      ));
    }
  };

  const handleCopy = (code, snippetId) => {
    navigator.clipboard.writeText(code);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewSnippet = (snippet) => {
    setSelectedSnippet(snippet);
    // Increment view count
    setSnippets(prev => prev.map(s => 
      s.id === snippet.id ? { ...s, views: s.views + 1 } : s
    ));
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim() || !form.language.trim()) return;
    
    const newSnippet = {
      ...form,
      id: Date.now(),
      author: getUserId(),
      likes: 0,
      views: 0,
      timestamp: Date.now(),
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    setSnippets([newSnippet, ...snippets]);
    setForm({ title: "", code: "", language: "", tags: "" });
    setShowForm(false);
    
    // Show success message (you could add a toast notification here)
    alert('Snippet shared successfully!');
  };

  const filtered = snippets.filter(s =>
    (!search || 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!language || s.language === language)
  );

  const sorted = [...filtered].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return b.timestamp - a.timestamp;
      case 'oldest':
        return a.timestamp - b.timestamp;
      case 'most-liked':
        return b.likes - a.likes;
      case 'most-viewed':
        return b.views - a.views;
      default:
        return b.timestamp - a.timestamp;
    }
  });

  const languages = [...new Set(snippets.map(s => s.language))];
  const allTags = [...new Set(snippets.flatMap(s => s.tags || []))];

  return (
    <div className="code-gallery-container">
      <header className="gallery-header">
        <div className="header-content">
          <h1 className="gallery-title">
            <span className="title-icon">💻</span>
            Code Snippet Gallery
          </h1>
          <p className="gallery-subtitle">
            Discover, share, and learn from code snippets across all programming languages.
            <span className="emoji-hint"> ✨ Perfect for learning and inspiration!</span>
          </p>
        </div>

        <div className="gallery-stats">
          <div className="stat-item">
            <span className="stat-icon">📚</span>
            <span className="stat-count">{snippets.length}</span>
            <span className="stat-label">Snippets</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-count">{new Set(snippets.map(s => s.author)).size}</span>
            <span className="stat-label">Contributors</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span className="stat-count">{snippets.reduce((acc, s) => acc + s.likes, 0)}</span>
            <span className="stat-label">Total Likes</span>
          </div>
        </div>
      </header>

      <div className="gallery-controls-panel">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="gallery-input search-input"
              type="text"
              placeholder="Search snippets by title, code, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                className="clear-search" 
                onClick={() => setSearch("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <select
              className="gallery-select filter-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select
              className="gallery-select filter-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-liked">Most Liked</option>
              <option value="most-viewed">Most Viewed</option>
            </select>

            <button 
              className="gallery-btn primary submit-btn" 
              onClick={() => setShowForm(v => !v)}
            >
              <span className="btn-icon">{showForm ? "✕" : "➕"}</span>
              {showForm ? "Cancel" : "Share Snippet"}
            </button>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="tags-container">
            <span className="tags-label">Popular Tags:</span>
            <div className="tags-list">
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  className={`tag-chip ${search === tag ? 'active' : ''}`}
                  onClick={() => setSearch(search === tag ? "" : tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="submit-form-container" ref={formRef}>
          <div className="form-header">
            <h2><span className="form-icon">📤</span> Share Your Code Snippet</h2>
            <p className="form-subtitle">Help others learn by sharing useful code examples</p>
          </div>
          <form className="gallery-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                <span className="label-icon">📝</span> Snippet Title *
              </label>
              <input
                id="title"
                className="gallery-input"
                name="title"
                placeholder="e.g., 'Reverse String in Python'"
                value={form.title}
                onChange={handleFormChange}
                required
                maxLength={60}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">
                <span className="label-icon">🔤</span> Programming Language *
              </label>
              <select
                id="language"
                className="gallery-select"
                name="language"
                value={form.language}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Language</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="SQL">SQL</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="code">
                <span className="label-icon">💻</span> Code Snippet *
              </label>
              <textarea
                id="code"
                className="gallery-textarea code-input"
                name="code"
                placeholder="Paste your code here... (Maximum 1500 characters)"
                value={form.code}
                onChange={handleFormChange}
                rows={8}
                required
                maxLength={1500}
              />
              <div className="char-count">
                {form.code.length}/1500 characters
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">
                <span className="label-icon">🏷️</span> Tags (comma-separated)
              </label>
              <input
                id="tags"
                className="gallery-input"
                name="tags"
                placeholder="e.g., algorithm, recursion, beginner"
                value={form.tags}
                onChange={handleFormChange}
              />
              <div className="tags-hint">Add relevant tags to help others find your snippet</div>
            </div>

            <div className="form-actions">
              <button className="gallery-btn secondary" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="gallery-btn primary submit-action-btn" type="submit">
                <span className="btn-icon">🚀</span>
                Publish Snippet
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedSnippet && (
        <div className="snippet-modal-overlay" onClick={() => setSelectedSnippet(null)}>
          <div className="snippet-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSnippet.title}</h3>
              <button className="modal-close" onClick={() => setSelectedSnippet(null)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="modal-meta">
                <span className="language-badge" style={{ 
                  backgroundColor: getLanguageColor(selectedSnippet.language) 
                }}>
                  {selectedSnippet.language}
                </span>
                <span className="meta-item">👤 {selectedSnippet.author}</span>
                <span className="meta-item">⏰ {formatTimeAgo(selectedSnippet.timestamp)}</span>
                <span className="meta-item">👁️ {selectedSnippet.views} views</span>
                <span className="meta-item">❤️ {selectedSnippet.likes} likes</span>
              </div>
              {selectedSnippet.tags && selectedSnippet.tags.length > 0 && (
                <div className="modal-tags">
                  {selectedSnippet.tags.map(tag => (
                    <span key={tag} className="modal-tag">#{tag}</span>
                  ))}
                </div>
              )}
              <pre className="modal-code">
                <code>{selectedSnippet.code}</code>
              </pre>
            </div>
            <div className="modal-actions">
              <button 
                className="gallery-btn" 
                onClick={() => handleCopy(selectedSnippet.code, selectedSnippet.id)}
              >
                {copiedId === selectedSnippet.id ? '✓ Copied!' : '📋 Copy Code'}
              </button>
              <button 
                className={`like-btn ${likedSnippets.has(selectedSnippet.id) ? 'liked' : ''}`}
                onClick={() => handleLike(selectedSnippet.id)}
              >
                ❤️ {selectedSnippet.likes}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="gallery-content">
        {sorted.length === 0 ? (
          <div className="gallery-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No snippets found</h3>
            <p>Try adjusting your search or be the first to share a snippet!</p>
            <button 
              className="gallery-btn primary" 
              onClick={() => setShowForm(true)}
            >
              Share First Snippet
            </button>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span className="results-count">Found {sorted.length} snippet{sorted.length !== 1 ? 's' : ''}</span>
              {search && (
                <button 
                  className="clear-filters" 
                  onClick={() => {
                    setSearch("");
                    setLanguage("");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
            
            <div className="gallery-list">
              {sorted.map(snippet => (
                <div 
                  className="gallery-card" 
                  key={snippet.id}
                  onClick={() => handleViewSnippet(snippet)}
                >
                  <div className="card-header">
                    <div className="card-title-section">
                      <h3 className="gallery-card-title">{snippet.title}</h3>
                      <span 
                        className="gallery-card-lang"
                        style={{ 
                          backgroundColor: getLanguageColor(snippet.language),
                          color: snippet.language === 'JavaScript' ? '#000' : '#fff'
                        }}
                      >
                        {snippet.language}
                      </span>
                    </div>
                    <button 
                      className={`like-btn-card ${likedSnippets.has(snippet.id) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(snippet.id);
                      }}
                      title="Like this snippet"
                    >
                      ❤️ {snippet.likes}
                    </button>
                  </div>

                  <pre className="gallery-card-code">
                    <code>{snippet.code.split('\n').slice(0, 6).join('\n')}</code>
                    {snippet.code.split('\n').length > 6 && (
                      <div className="code-overlay">...click to view more</div>
                    )}
                  </pre>

                  <div className="card-meta">
                    <div className="meta-info">
                      <span className="meta-item">
                        <span className="meta-icon">👤</span>
                        {snippet.author.startsWith('guest-') ? 'Guest' : snippet.author}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">⏰</span>
                        {formatTimeAgo(snippet.timestamp)}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">👁️</span>
                        {snippet.views}
                      </span>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="action-btn copy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(snippet.code, snippet.id);
                        }}
                        title="Copy code"
                      >
                        {copiedId === snippet.id ? '✓' : '📋'}
                      </button>
                      <button 
                        className="action-btn view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSnippet(snippet);
                        }}
                        title="View full snippet"
                      >
                        👁️
                      </button>
                    </div>
                  </div>

                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="card-tags">
                      {snippet.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="card-tag">#{tag}</span>
                      ))}
                      {snippet.tags.length > 3 && (
                        <span className="card-tag-more">+{snippet.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="gallery-footer">
        <p>
          <span className="footer-icon">💡</span>
          Pro Tip: Use tags when submitting snippets to help others find them easily!
        </p>
        <p className="footer-stats">
          Total Snippets: {snippets.length} • Total Likes: {snippets.reduce((acc, s) => acc + s.likes, 0)} • 
          Languages: {languages.length}
        </p>
      </footer>
    </div>
  );
}