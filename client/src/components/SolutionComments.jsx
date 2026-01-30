import React, { useState } from "react";
import "./SolutionComments.css";

// Comments are stored in localStorage per solution (by promptKey and solutionIndex)
function getComments(promptKey, solutionIndex) {
  const key = `comments_${promptKey}_${solutionIndex}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveComment(promptKey, solutionIndex, comment) {
  const key = `comments_${promptKey}_${solutionIndex}`;
  const comments = getComments(promptKey, solutionIndex);
  comments.push(comment);
  localStorage.setItem(key, JSON.stringify(comments));
}

export default function SolutionComments({ promptKey, solutionIndex }) {
  const [comments, setComments] = useState(getComments(promptKey, solutionIndex));
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [lastCommentTime, setLastCommentTime] = useState(
    Number(localStorage.getItem(`lastComment_${promptKey}_${solutionIndex}`) || 0)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (!name.trim() || !text.trim()) {
      setError("Name and comment required.");
      return;
    }
    if (now - lastCommentTime < 30000) {
      setError("Please wait before posting another comment (30s spam protection).");
      return;
    }
    saveComment(promptKey, solutionIndex, { name, text, time: now });
    setComments(getComments(promptKey, solutionIndex));
    setName("");
    setText("");
    setError("");
    setLastCommentTime(now);
    localStorage.setItem(`lastComment_${promptKey}_${solutionIndex}`, now);
  };

  return (
    <div className="solution-comments">
      <h5>Comments</h5>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          className="comment-input"
          type="text"
          placeholder="Your Name (guest)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          className="comment-textarea"
          placeholder="Your comment"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
        />
        {error && <div className="comment-error">{error}</div>}
        <button className="comment-btn" type="submit">Add Comment</button>
      </form>
      <div className="comment-list">
        {comments.length === 0 && <div className="comment-empty">No comments yet.</div>}
        {comments.map((c, idx) => (
          <div className="comment-item" key={idx}>
            <span className="comment-author">{c.name}</span>
            <span className="comment-time">{new Date(c.time).toLocaleString()}</span>
            <div className="comment-text">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
