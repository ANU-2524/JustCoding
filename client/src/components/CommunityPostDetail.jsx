import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaEye,
  FaClock,
  FaUser,
  FaReply,
  FaEdit,
  FaTrash,
  FaShare,
  FaFlag,
  FaTrophy,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import '../Style/CommunityPostDetail.css';

const CommunityPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/community/posts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      
      const data = await response.json();
      setPost(data.post);
      setComments(data.comments || []);
      
      // Initialize user votes from local storage or API
      const storedVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      setUserVotes(storedVotes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetType, targetId, voteType) => {
    if (!currentUser) {
      alert('Please login to vote');
      return;
    }

    const voteKey = `${targetType}-${targetId}`;
    const currentVote = userVotes[voteKey];
    
    // If clicking the same vote, remove it
    const newVoteType = currentVote === voteType ? 'none' : voteType;

    try {
      const endpoint = targetType === 'post' 
        ? `/api/community/posts/${targetId}/vote`
        : `/api/community/comments/${targetId}/vote`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          voteType: newVoteType,
          userId: currentUser.uid
        })
      });

      if (!response.ok) throw new Error('Failed to vote');
      
      const data = await response.json();

      // Update local state
      if (targetType === 'post') {
        setPost(prev => ({
          ...prev,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          score: data.score
        }));
      } else {
        setComments(prev => updateCommentVotes(prev, targetId, data));
      }

      // Update user votes
      const newVotes = { ...userVotes };
      if (newVoteType === 'none') {
        delete newVotes[voteKey];
      } else {
        newVotes[voteKey] = newVoteType;
      }
      setUserVotes(newVotes);
      localStorage.setItem('userVotes', JSON.stringify(newVotes));

    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote. Please try again.');
    }
  };

  const updateCommentVotes = (comments, commentId, voteData) => {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return {
          ...comment,
          upvotes: voteData.upvotes,
          downvotes: voteData.downvotes,
          score: voteData.score
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentVotes(comment.replies, commentId, voteData)
        };
      }
      return comment;
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      
      const response = await fetch(`/api/community/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          content: newComment,
          author: currentUser?.displayName || currentUser?.email || 'Anonymous',
          authorId: currentUser?.uid || 'anonymous'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to post comment');
      }
      
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment('');
      
      // Update comment count
      setPost(prev => ({ ...prev, commentCount: prev.commentCount + 1 }));
    } catch (err) {
      console.error('Error posting comment:', err);
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      
      const response = await fetch(`/api/community/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          content: replyText,
          author: currentUser?.displayName || currentUser?.email || 'Anonymous',
          authorId: currentUser?.uid || 'anonymous',
          parentCommentId: commentId
        })
      });

      if (!response.ok) throw new Error('Failed to post reply');
      
      const replyData = await response.json();
      
      // Add reply to nested comments
      setComments(prev => addReplyToComment(prev, commentId, replyData));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error posting reply:', err);
      alert('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addReplyToComment = (comments, parentId, reply) => {
    return comments.map(comment => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, reply)
        };
      }
      return comment;
    });
  };

  const toggleBookmark = () => {
    if (!currentUser) {
      alert('Please login to bookmark');
      return;
    }
    setBookmarked(!bookmarked);
    // TODO: Call API to save bookmark
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general-discussion': '#3b82f6',
      'help-request': '#ef4444',
      'code-review': '#8b5cf6',
      'project-showcase': '#10b981',
      'career-advice': '#f59e0b',
      'learning-resources': '#06b6d4',
      'bug-reports': '#dc2626',
      'feature-requests': '#6366f1',
      'announcements': '#f97316',
      'off-topic': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const renderComment = (comment, depth = 0) => {
    const voteKey = `comment-${comment._id}`;
    const userVote = userVotes[voteKey];

    return (
      <motion.div
        key={comment._id}
        className={`comment depth-${depth}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="comment-content">
          <div className="comment-header">
            <div className="comment-author">
              <FaUser className="author-icon" />
              <span className="author-name">{comment.author}</span>
              {comment.authorReputation > 1000 && (
                <FaTrophy className="reputation-badge" title="Top Contributor" />
              )}
            </div>
            <div className="comment-meta">
              <FaClock className="meta-icon" />
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>

          <div className="comment-body">
            {editingComment === comment._id ? (
              <div className="edit-form">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button
                    onClick={() => {
                      // TODO: Call edit API
                      setEditingComment(null);
                    }}
                    className="save-btn"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingComment(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{comment.content}</p>
            )}
          </div>

          <div className="comment-actions">
            <div className="vote-controls">
              <button
                className={`vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
                onClick={() => handleVote('comment', comment._id, 'upvote')}
                title="Upvote"
              >
                <FaThumbsUp />
                <span>{comment.upvotes || 0}</span>
              </button>
              <span className="score">{comment.score || 0}</span>
              <button
                className={`vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
                onClick={() => handleVote('comment', comment._id, 'downvote')}
                title="Downvote"
              >
                <FaThumbsDown />
                <span>{comment.downvotes || 0}</span>
              </button>
            </div>

            <button
              className="action-btn"
              onClick={() => {
                setReplyingTo(replyingTo === comment._id ? null : comment._id);
                setReplyText('');
              }}
            >
              <FaReply /> Reply
            </button>

            {currentUser && currentUser.uid === comment.authorId && (
              <>
                <button
                  className="action-btn"
                  onClick={() => {
                    setEditingComment(comment._id);
                    setEditText(comment.content);
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button className="action-btn delete">
                  <FaTrash /> Delete
                </button>
              </>
            )}

            <button className="action-btn">
              <FaFlag /> Report
            </button>
          </div>

          {replyingTo === comment._id && (
            <motion.div
              className="reply-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="reply-textarea"
              />
              <div className="reply-actions">
                <button
                  onClick={() => handleReplySubmit(comment._id)}
                  className="submit-reply-btn"
                  disabled={submitting || !replyText.trim()}
                >
                  <FaPaperPlane /> Post Reply
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className={`post-detail-page ${theme}`}>
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={`post-detail-page ${theme}`}>
        <div className="error-container">
          <h2>Post Not Found</h2>
          <p>{error || 'The post you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/community')} className="back-btn">
            <FaArrowLeft /> Back to Community
          </button>
        </div>
      </div>
    );
  }

  const postVoteKey = `post-${post._id}`;
  const userPostVote = userVotes[postVoteKey];

  return (
    <div className={`post-detail-page ${theme}`}>
      <div className="post-detail-container">
        {/* Header with back button */}
        <div className="page-header">
          <button onClick={() => navigate('/community')} className="back-btn">
            <FaArrowLeft /> Back to Community
          </button>
          <div className="header-actions">
            <button onClick={toggleBookmark} className="bookmark-btn">
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button className="share-btn">
              <FaShare /> Share
            </button>
          </div>
        </div>

        {/* Main Post */}
        <motion.div
          className="post-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="post-header">
            <div
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(post.category) }}
            >
              {post.category?.replace('-', ' ')}
            </div>
            {post.isPinned && <div className="pinned-badge">📌 Pinned</div>}
            {post.isSolved && <div className="solved-badge">✓ Solved</div>}
          </div>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-author-info">
            <div className="author-details">
              <FaUser className="author-icon" />
              <span className="author-name">{post.author}</span>
              {post.authorReputation > 1000 && (
                <span className="reputation-score">
                  <FaTrophy /> {post.authorReputation}
                </span>
              )}
            </div>
            <div className="post-meta">
              <span>
                <FaClock /> {formatDate(post.createdAt)}
              </span>
              <span>
                <FaEye /> {post.viewCount} views
              </span>
              <span>
                <FaComment /> {post.commentCount} comments
              </span>
            </div>
          </div>

          <div className="post-content">
            <div className="content-body">
              {post.content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="post-footer">
            <div className="vote-section">
              <button
                className={`vote-btn upvote ${userPostVote === 'upvote' ? 'active' : ''}`}
                onClick={() => handleVote('post', post._id, 'upvote')}
                title="Upvote this post"
              >
                <FaThumbsUp />
                <span>{post.upvotes || 0}</span>
              </button>
              <div className="score-display">{post.score || 0}</div>
              <button
                className={`vote-btn downvote ${userPostVote === 'downvote' ? 'active' : ''}`}
                onClick={() => handleVote('post', post._id, 'downvote')}
                title="Downvote this post"
              >
                <FaThumbsDown />
                <span>{post.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h2>
              <FaComment /> {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {/* New Comment Form */}
          {currentUser ? (
            <motion.form
              className="new-comment-form"
              onSubmit={handleCommentSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="comment-textarea"
                rows="4"
              />
              <div className="form-footer">
                <span className="character-count">
                  {newComment.length} / 5000
                </span>
                <button
                  type="submit"
                  className="submit-comment-btn"
                  disabled={submitting || !newComment.trim()}
                >
                  <FaPaperPlane /> {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </motion.form>
          ) : (
            <div className="login-prompt">
              <p>Please login to comment</p>
              <button onClick={() => navigate('/login')} className="login-btn">
                Login
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            <AnimatePresence>
              {comments.length > 0 ? (
                comments.map(comment => renderComment(comment, 0))
              ) : (
                <motion.div
                  className="no-comments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaComment className="no-comments-icon" />
                  <p>No comments yet. Be the first to comment!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostDetail;
