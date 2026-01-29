import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaSort, FaFire, FaClock, FaComment, FaEye, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import '../Style/CommunityPage.css';

const CommunityPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: 'general-discussion',
    tags: ''
  });
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/community/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sortBy,
        page: currentPage,
        limit: 20
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/community/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!currentUser) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType,
          userId: currentUser.uid
        })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post =>
          post._id === postId
            ? { ...post, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes, score: updatedPost.score }
            : post
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to create a post');
      navigate('/login');
      return;
    }

    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setSubmittingPost(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          title: newPostData.title,
          content: newPostData.content,
          category: newPostData.category,
          tags: newPostData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          author: currentUser.displayName || currentUser.email,
          authorId: currentUser.uid
        })
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setShowNewPostModal(false);
      setNewPostData({
        title: '',
        content: '',
        category: 'general-discussion',
        tags: ''
      });
      alert('Post created successfully! 🎉');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
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
      'general-discussion': '#6b7280',
      'help-request': '#dc2626',
      'code-review': '#2563eb',
      'project-showcase': '#16a34a',
      'career-advice': '#ca8a04',
      'learning-resources': '#9333ea',
      'bug-reports': '#dc2626',
      'feature-requests': '#0891b2',
      'announcements': '#dc2626',
      'off-topic': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <motion.div
      className={`community-page ${theme}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="community-header">
        <div className="header-content">
          <h1>Community Forum</h1>
          <p>Connect, share, and learn with fellow developers</p>
        </div>
        <button 
          className="create-post-btn"
          onClick={() => {
            if (!currentUser) {
              alert('Please login to create a post');
              navigate('/login');
            } else {
              setShowNewPostModal(true);
            }
          }}
        >
          <FaPlus /> New Post
        </button>
      </div>

      <div className="community-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.postCount})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="createdAt">Latest</option>
            <option value="score">Top Rated</option>
            <option value="commentCount">Most Comments</option>
            <option value="viewCount">Most Viewed</option>
          </select>

          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      <div className="categories-bar">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tag ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            style={{ '--category-color': getCategoryColor(category.id) }}
          >
            {category.name}
            <span className="post-count">({category.postCount})</span>
          </button>
        ))}
      </div>

      <div className={`posts-container ${viewMode}`}>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts found</h3>
            <p>Be the first to start a discussion in this category!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.div
              key={post._id}
              className="post-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="post-header">
                <div className="author-info">
                  <img
                    src={post.authorPhotoURL || '/default-avatar.png'}
                    alt={post.authorName}
                    className="author-avatar"
                  />
                  <div className="author-details">
                    <span className="author-name">{post.authorName}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(post.category) }}
                >
                  {categories.find(cat => cat.id === post.category)?.name || post.category}
                </div>
              </div>

              <div className="post-content">
                <h3 
                  className="post-title" 
                  onClick={() => navigate(`/community/posts/${post._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {post.title}
                </h3>
                <p className="post-excerpt">
                  {post.content.length > 200
                    ? `${post.content.substring(0, 200)}...`
                    : post.content
                  }
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-footer">
                <div className="post-stats">
                  <span className="stat">
                    <FaEye /> {post.viewCount}
                  </span>
                  <span className="stat">
                    <FaComment /> {post.commentCount}
                  </span>
                  <span className="stat score">
                    <FaThumbsUp /> {post.score}
                  </span>
                </div>

                <div className="post-actions">
                  <button
                    className="view-post-btn"
                    onClick={() => navigate(`/community/posts/${post._id}`)}
                  >
                    View Discussion
                  </button>
                  <button
                    className="vote-btn upvote"
                    onClick={() => handleVote(post._id, 'upvote')}
                    disabled={!currentUser}
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    className="vote-btn downvote"
                    onClick={() => handleVote(post._id, 'downvote')}
                    disabled={!currentUser}
                  >
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="page-btn"
          >
            Previous
          </button>

          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <motion.div
          className="modal-overlay"
          onClick={() => setShowNewPostModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className={`new-post-modal ${theme}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button 
                className="close-btn"
                onClick={() => setShowNewPostModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="new-post-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({...newPostData, title: e.target.value})}
                  placeholder="Enter post title"
                  maxLength="200"
                  required
                />
                <span className="char-count">{newPostData.title.length}/200</span>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newPostData.category}
                  onChange={(e) => setNewPostData({...newPostData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newPostData.content}
                  onChange={(e) => setNewPostData({...newPostData, content: e.target.value})}
                  placeholder="Share your thoughts or ask a question..."
                  rows="8"
                  maxLength="5000"
                  required
                />
                <span className="char-count">{newPostData.content.length}/5000</span>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={newPostData.tags}
                  onChange={(e) => setNewPostData({...newPostData, tags: e.target.value})}
                  placeholder="e.g. javascript, react, help"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowNewPostModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submittingPost}
                >
                  {submittingPost ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommunityPage;