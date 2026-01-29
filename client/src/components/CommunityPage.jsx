import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaSort, FaFire, FaClock, FaComment, FaEye, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import '../Style/CommunityPage.css';

const CommunityPage = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

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
    if (!user) {
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
          userId: user.uid
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
        <button className="create-post-btn">
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
                <h3 className="post-title">{post.title}</h3>
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
                    className="vote-btn upvote"
                    onClick={() => handleVote(post._id, 'upvote')}
                    disabled={!user}
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    className="vote-btn downvote"
                    onClick={() => handleVote(post._id, 'downvote')}
                    disabled={!user}
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
    </motion.div>
  );
};

export default CommunityPage;