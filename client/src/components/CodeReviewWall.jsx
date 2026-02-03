import React, { useEffect, useState, useRef } from "react";
import './CodeReviewWall.css';

// Demo backend simulation
function getUserId(currentUser) {
  if (currentUser?.uid) return currentUser.uid;
  let tempId = localStorage.getItem('tempReviewUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempReviewUserId', tempId);
  }
  return tempId;
}

const DEMO_REVIEW_KEY = 'reviewwall-demo-backend';

function loadReviews() {
  return JSON.parse(localStorage.getItem(DEMO_REVIEW_KEY) || '[]');
}

function saveReviews(reviews) {
  localStorage.setItem(DEMO_REVIEW_KEY, JSON.stringify(reviews));
}

function getDisplayName(userId) {
  return userId && userId.startsWith('guest-') ? 'Guest' : userId || 'Guest';
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function CodeReviewWall({ currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ code: '', description: '', language: 'javascript' });
  const [comment, setComment] = useState('');
  const [activeReview, setActiveReview] = useState(null);
  const [spamBlock, setSpamBlock] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const codeInputRef = useRef(null);
  const userId = getUserId(currentUser);

  useEffect(() => {
    const savedReviews = loadReviews();
    setReviews(savedReviews);
  }, []);

  useEffect(() => {
    saveReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    let timer;
    if (spamBlock) {
      timer = setTimeout(() => setSpamBlock(false), 30000);
    }
    return () => clearTimeout(timer);
  }, [spamBlock]);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.code.trim()) return;
    
    const newReview = {
      id: Date.now(),
      code: form.code,
      description: form.description,
      language: form.language,
      author: userId,
      comments: [],
      timestamp: Date.now(),
      likes: 0,
      likedBy: []
    };
    
    setReviews([newReview, ...reviews]);
    setForm({ code: '', description: '', language: 'javascript' });
    
    // Focus back to code input
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  const handleComment = (reviewId) => {
    if (spamBlock || !comment.trim()) return;
    
    setReviews(reviews.map(r =>
      r.id === reviewId
        ? { 
            ...r, 
            comments: [...r.comments, { 
              text: comment, 
              author: userId, 
              timestamp: Date.now() 
            }] 
          }
        : r
    ));
    
    setComment('');
    setSpamBlock(true);
    
    // Expand the review when commenting
    setExpandedReviews(prev => new Set(prev).add(reviewId));
  };

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleLike = (reviewId) => {
    setReviews(reviews.map(r => {
      if (r.id === reviewId) {
        const hasLiked = r.likedBy?.includes(userId);
        return {
          ...r,
          likes: hasLiked ? r.likes - 1 : r.likes + 1,
          likedBy: hasLiked 
            ? r.likedBy.filter(id => id !== userId)
            : [...(r.likedBy || []), userId]
        };
      }
      return r;
    }));
  };

  const handleDelete = (reviewId, authorId) => {
    if (authorId === userId) {
      if (window.confirm('Are you sure you want to delete this review?')) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      }
    }
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch(sortBy) {
      case 'most-commented':
        return sorted.sort((a, b) => b.comments.length - a.comments.length);
      case 'most-liked':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'oldest':
        return sorted.sort((a, b) => a.timestamp - b.timestamp);
      default: // 'newest'
        return sorted.sort((a, b) => b.timestamp - a.timestamp);
    }
  };

  const sortedReviews = getSortedReviews();

  return (
    <div className="code-review-wall-container">
      <header className="review-wall-header">
        <div className="header-content">
          <h1 className="review-wall-title">
            <span className="title-icon">💬</span>
            Code Review Wall
          </h1>
          <p className="review-wall-desc">
            Share code snippets, get feedback, and help others improve their code.
            <span className="emoji-hint"> 👇 Start by pasting your code below!</span>
          </p>
        </div>
      </header>

      <div className="review-wall-main">
        <div className="submit-section">
          <div className="section-header">
            <h2><span className="section-icon">📝</span> Submit Code for Review</h2>
            <div className="language-badge">
              <span className="language-dot"></span>
              {form.language}
            </div>
          </div>
          
          <form className="review-wall-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">
                <span className="label-icon">📋</span> Description
              </label>
              <input
                id="description"
                className="review-wall-input"
                name="description"
                placeholder="What does this code do? (Optional)"
                value={form.description}
                onChange={handleFormChange}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">
                <span className="label-icon">🔤</span> Language
              </label>
              <select
                id="language"
                className="review-wall-select"
                name="language"
                value={form.language}
                onChange={handleFormChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="code">
                <span className="label-icon">💻</span> Code Snippet
              </label>
              <textarea
                id="code"
                ref={codeInputRef}
                className="review-wall-textarea code-input"
                name="code"
                placeholder="Paste your code here... (Maximum 1000 characters)"
                value={form.code}
                onChange={handleFormChange}
                rows={6}
                required
                maxLength={1000}
              />
              <div className="char-count">
                {form.code.length}/1000 characters
              </div>
            </div>

            <button 
              className="review-wall-btn primary submit-btn" 
              type="submit"
              disabled={!form.code.trim()}
            >
              <span className="btn-icon">🚀</span>
              Submit for Review
            </button>
          </form>
        </div>

        <div className="reviews-section">
          <div className="section-header">
            <h2><span className="section-icon">👁️</span> Code Reviews ({reviews.length})</h2>
            <div className="sort-controls">
              <span className="sort-label">Sort by:</span>
              <select 
                className="review-wall-select sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-commented">Most Comments</option>
                <option value="most-liked">Most Likes</option>
              </select>
            </div>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="review-wall-empty-state">
              <div className="empty-icon">📭</div>
              <h3>No code submissions yet</h3>
              <p>Be the first to share your code and start a discussion!</p>
            </div>
          ) : (
            <div className="review-wall-list">
              {sortedReviews.map(review => {
                const isExpanded = expandedReviews.has(review.id);
                const hasLiked = review.likedBy?.includes(userId);
                const isAuthor = review.author === userId;
                
                return (
                  <div 
                    className={`review-wall-card ${isExpanded ? 'expanded' : ''}`} 
                    key={review.id}
                  >
                    <div className="review-wall-card-header">
                      <div className="author-info">
                        <div className="author-avatar">
                          {getDisplayName(review.author).charAt(0)}
                        </div>
                        <div>
                          <span className="review-wall-card-author">
                            {getDisplayName(review.author)}
                          </span>
                          <span className="review-wall-card-time">
                            {formatTime(review.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className={`like-btn ${hasLiked ? 'liked' : ''}`}
                          onClick={() => handleLike(review.id)}
                          title="Like this code"
                        >
                          <span className="like-icon">❤️</span>
                          <span className="like-count">{review.likes || 0}</span>
                        </button>
                        
                        <button 
                          className="toggle-btn"
                          onClick={() => toggleReview(review.id)}
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                        
                        {isAuthor && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(review.id, review.author)}
                            title="Delete review"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="review-meta">
                      <span className="review-description">
                        {review.description || "No description provided"}
                      </span>
                      <span className="language-tag">
                        {review.language}
                      </span>
                    </div>

                    {isExpanded && (
                      <>
                        <div className="code-container">
                          <div className="code-header">
                            <span className="code-language">{review.language}</span>
                            <button 
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(review.code);
                                // You could add a toast notification here
                              }}
                              title="Copy code"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <pre className="review-wall-card-code">
                            <code>{review.code}</code>
                          </pre>
                        </div>

                        <div className="review-wall-comments-section">
                          <div className="comments-header">
                            <h4>
                              <span className="comments-icon">💬</span>
                              Feedback ({review.comments.length})
                            </h4>
                          </div>
                          
                          {review.comments.length === 0 ? (
                            <div className="no-comments">
                              <span className="no-comments-icon">💭</span>
                              No feedback yet. Be the first to comment!
                            </div>
                          ) : (
                            <div className="comments-list">
                              {review.comments.map((c, idx) => (
                                <div className="review-wall-comment" key={idx}>
                                  <div className="comment-header">
                                    <span className="review-wall-comment-author">
                                      {getDisplayName(c.author)}
                                    </span>
                                    <span className="comment-time">
                                      {formatTime(c.timestamp)}
                                    </span>
                                  </div>
                                  <div className="review-wall-comment-text">
                                    {c.text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="review-wall-comment-form">
                            <input
                              className="review-wall-input comment-input"
                              type="text"
                              placeholder={
                                spamBlock 
                                  ? "⏳ Please wait 30 seconds before commenting again..." 
                                  : "💡 Add constructive feedback, suggestions, or ask questions..."
                              }
                              value={activeReview === review.id ? comment : ''}
                              onChange={e => { 
                                setComment(e.target.value); 
                                setActiveReview(review.id); 
                              }}
                              onFocus={() => setActiveReview(review.id)}
                              disabled={spamBlock}
                              maxLength={200}
                            />
                            <button
                              className="review-wall-btn comment-btn"
                              type="button"
                              onClick={() => handleComment(review.id)}
                              disabled={spamBlock || !comment.trim()}
                            >
                              <span className="btn-icon">📨</span>
                              Send
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}