import React, { useEffect, useState } from "react";
import './CodeReviewWall.css';

// Demo backend simulation (replace with real API calls)
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

export default function CodeReviewWall({ currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ code: '', description: '' });
  const [comment, setComment] = useState('');
  const [activeReview, setActiveReview] = useState(null);
  const [spamBlock, setSpamBlock] = useState(false);
  const userId = getUserId(currentUser);

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  useEffect(() => {
    saveReviews(reviews);
  }, [reviews]);

  // Basic spam protection: block if more than 2 comments in 30s
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
    setReviews([
      {
        id: Date.now(),
        code: form.code,
        description: form.description,
        author: userId,
        comments: [],
      },
      ...reviews,
    ]);
    setForm({ code: '', description: '' });
  };

  const handleComment = (reviewId) => {
    if (spamBlock) return;
    if (!comment.trim()) return;
    setReviews(reviews.map(r =>
      r.id === reviewId
        ? { ...r, comments: [...r.comments, { text: comment, author: userId, time: Date.now() }] }
        : r
    ));
    setComment('');
    setActiveReview(reviewId);
    setSpamBlock(true);
  };

  return (
    <div className="code-review-wall-container">
      <header>
        <h1 className="review-wall-title">Public Code Review Wall</h1>
        <p className="review-wall-desc">Submit code for review or give feedback to others. No login required!</p>
      </header>
      <form className="review-wall-form" onSubmit={handleSubmit}>
        <textarea
          className="review-wall-input"
          name="code"
          placeholder="Paste your code here..."
          value={form.code}
          onChange={handleFormChange}
          rows={4}
          required
        />
        <input
          className="review-wall-input"
          name="description"
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleFormChange}
        />
        <button className="review-wall-btn primary" type="submit">Submit for Review</button>
      </form>
      <div className="review-wall-list">
        {reviews.length === 0 && <div className="review-wall-empty">No code submissions yet.</div>}
        {reviews.map(review => (
          <div className="review-wall-card" key={review.id}>
            <div className="review-wall-card-header">
              <span className="review-wall-card-author">{getDisplayName(review.author)}</span>
              <span className="review-wall-card-desc">{review.description}</span>
            </div>
            <pre className="review-wall-card-code"><code>{review.code}</code></pre>
            <div className="review-wall-comments">
              <h4>Feedback</h4>
              {review.comments.length === 0 && <div className="review-wall-empty">No comments yet.</div>}
              {review.comments.map((c, idx) => (
                <div className="review-wall-comment" key={idx}>
                  <span className="review-wall-comment-author">{getDisplayName(c.author)}</span>
                  <span className="review-wall-comment-text">{c.text}</span>
                </div>
              ))}
              <div className="review-wall-comment-form">
                <input
                  className="review-wall-input"
                  type="text"
                  placeholder={spamBlock ? "Please wait before commenting again..." : "Add feedback..."}
                  value={activeReview === review.id ? comment : ''}
                  onChange={e => { setComment(e.target.value); setActiveReview(review.id); }}
                  disabled={spamBlock}
                  maxLength={200}
                />
                <button
                  className="review-wall-btn"
                  type="button"
                  onClick={() => handleComment(review.id)}
                  disabled={spamBlock || !comment.trim() || activeReview !== review.id}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
