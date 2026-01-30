import { useState, useEffect, useContext } from 'react';
import { FaCode, FaPlus, FaSearch, FaTimes, FaStar, FaRegStar, FaEdit, FaTrash, FaCopy, FaFilter, FaTag, FaShareAlt, FaGlobe, FaLock } from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../Style/SnippetsManager.css';

const SnippetsManager = () => {
  const { theme } = useTheme();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('snippetFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showShareModal, setShowShareModal] = useState(null);
  const [shareOptions, setShareOptions] = useState({
    isPublic: false,
    sharedWith: [],
    tags: [],
    description: ''
  });
  const [publicSnippets, setPublicSnippets] = useState([]);
  const [showPublicSnippets, setShowPublicSnippets] = useState(false);

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 
    'go', 'rust', 'typescript', 'sql', 'html', 'css', 'bash', 'other'
  ];

  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    localStorage.setItem('snippetFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4334/api/user/snippets/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch snippets');
      const data = await response.json();
      setSnippets(data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSnippet = async () => {
    try {
      const response = await fetch('http://localhost:4334/api/user/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: formData.title || 'Untitled',
          language: formData.language,
          code: formData.code
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to create snippet: ${response.status} ${errorText}`);
      }
      const newSnippet = await response.json();
      setSnippets([newSnippet, ...snippets]);
      resetForm();
    } catch (error) {
      console.error('Error creating snippet:', error);
      alert(`Failed to create snippet: ${error.message}`);
    }
  };

  const updateSnippet = async () => {
    try {
      const response = await fetch(`http://localhost:4334/api/user/snippets/${editingSnippet._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: formData.title,
          language: formData.language,
          code: formData.code
        })
      });

      if (!response.ok) throw new Error('Failed to update snippet');
      const updatedSnippet = await response.json();
      setSnippets(snippets.map(s => s._id === updatedSnippet._id ? updatedSnippet : s));
      resetForm();
    } catch (error) {
      console.error('Error updating snippet:', error);
      alert('Failed to update snippet');
    }
  };

  const deleteSnippet = async (snippetId) => {
    try {
      const response = await fetch(`http://localhost:4334/api/user/snippets/${snippetId}?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete snippet');
      setSnippets(snippets.filter(s => s._id !== snippetId));
      setFavorites(favorites.filter(id => id !== snippetId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('Failed to delete snippet');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSnippet) {
      updateSnippet();
    } else {
      createSnippet();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', language: 'javascript', code: '', tags: '' });
    setEditingSnippet(null);
    setShowModal(false);
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    setFormData({
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      tags: ''
    });
    setShowModal(true);
  };

  const handleShare = (snippet) => {
    setShowShareModal(snippet);
    setShareOptions({
      isPublic: snippet.isPublic || false,
      sharedWith: snippet.sharedWith || [],
      tags: snippet.tags || [],
      description: snippet.description || ''
    });
  };

  const updateSharing = async () => {
    try {
      const response = await fetch(`http://localhost:4334/api/user/snippets/${showShareModal._id}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...shareOptions
        })
      });

      if (!response.ok) throw new Error('Failed to update sharing');

      const updatedSnippet = await response.json();
      setSnippets(snippets.map(s => s._id === updatedSnippet._id ? updatedSnippet : s));
      setShowShareModal(null);
      alert('Sharing settings updated!');
    } catch (error) {
      console.error('Error updating sharing:', error);
      alert(`Failed to update sharing: ${error.message}`);
    }
  };

  const fetchPublicSnippets = async () => {
    try {
      const response = await fetch('http://localhost:4334/api/user/snippets/public');
      if (!response.ok) throw new Error('Failed to fetch public snippets');
      const data = await response.json();
      setPublicSnippets(data.snippets);
      setShowPublicSnippets(true);
    } catch (error) {
      console.error('Error fetching public snippets:', error);
      alert(`Failed to fetch public snippets: ${error.message}`);
    }
  };

  const copyShareLink = (snippet) => {
    if (snippet.shareId) {
      const shareUrl = `${window.location.origin}/shared-snippet/${snippet.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const toggleFavorite = (snippetId) => {
    setFavorites(prev =>
      prev.includes(snippetId)
        ? prev.filter(id => id !== snippetId)
        : [...prev, snippetId]
    );
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const favoriteSnippets = filteredSnippets.filter(s => favorites.includes(s._id));
  const regularSnippets = filteredSnippets.filter(s => !favorites.includes(s._id));
  const displaySnippets = [...favoriteSnippets, ...regularSnippets];

  return (
    <div className={`snippets-manager ${theme}`}>
      <div className="snippets-container">
        <div className="snippets-header">
          <div className="header-content">
            <FaCode className="header-icon" />
            <h1>Code Snippets Manager</h1>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={fetchPublicSnippets}>
              <FaGlobe /> Browse Public
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> New Snippet
            </button>
          </div>
        </div>

        <div className="snippets-controls">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <FaTimes className="clear-icon" onClick={() => setSearchQuery('')} />
            )}
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="language-filter"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading snippets...</p>
          </div>
        ) : displaySnippets.length === 0 ? (
          <div className="empty-state">
            <FaCode className="empty-icon" />
            <h3>No snippets found</h3>
            <p>Create your first code snippet to get started!</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> Create Snippet
            </button>
          </div>
        ) : (
          <div className="snippets-grid">
            {displaySnippets.map(snippet => (
              <div key={snippet._id} className="snippet-card">
                <div className="snippet-header">
                  <div className="snippet-title-row">
                    <h3>{snippet.title}</h3>
                    <button
                      className="favorite-btn"
                      onClick={() => toggleFavorite(snippet._id)}
                      title={favorites.includes(snippet._id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.includes(snippet._id) ? <FaStar className="star-filled" /> : <FaRegStar />}
                    </button>
                  </div>
                  <div className="snippet-meta">
                    <span className="language-badge">{snippet.language}</span>
                    <span className="date">{new Date(snippet.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="snippet-code">
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={theme === 'dark' ? vscDarkPlus : vs}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      borderRadius: '8px',
                      fontSize: '13px',
                      maxHeight: '200px'
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                <div className="snippet-actions">
                  <button
                    className="action-btn copy-btn"
                    onClick={() => copyToClipboard(snippet.code)}
                    title="Copy code"
                  >
                    <FaCopy /> Copy
                  </button>
                  <button
                    className="action-btn share-btn"
                    onClick={() => handleShare(snippet)}
                    title="Share snippet"
                  >
                    <FaShareAlt /> Share
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(snippet)}
                    title="Edit snippet"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => setShowDeleteConfirm(snippet._id)}
                    title="Delete snippet"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Public Snippets View */}
        {showPublicSnippets && (
          <div className="public-snippets-section">
            <div className="section-header">
              <h2><FaGlobe /> Public Snippets</h2>
              <button className="btn-secondary" onClick={() => setShowPublicSnippets(false)}>
                <FaTimes /> Close
              </button>
            </div>
            <div className="snippets-grid">
              {publicSnippets.map(snippet => (
                <div key={snippet._id} className="snippet-card public-snippet">
                  <div className="snippet-header">
                    <h3>{snippet.title}</h3>
                    <div className="snippet-meta">
                      <span className="language-badge">{snippet.language}</span>
                      <span className="author">by {snippet.userId?.displayName || 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="snippet-preview">
                    <SyntaxHighlighter
                      language={snippet.language}
                      style={theme === 'dark' ? vscDarkPlus : vs}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.9rem',
                        maxHeight: '200px',
                        overflow: 'hidden'
                      }}
                    >
                      {snippet.code.length > 300 ? snippet.code.substring(0, 300) + '...' : snippet.code}
                    </SyntaxHighlighter>
                  </div>
                  {snippet.description && (
                    <div className="snippet-description">
                      <p>{snippet.description}</p>
                    </div>
                  )}
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="snippet-tags">
                      {snippet.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="snippet-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => copyShareLink(snippet)}
                    >
                      <FaCopy /> Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingSnippet ? 'Edit Snippet' : 'New Snippet'}</h2>
                <button className="close-btn" onClick={resetForm}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="snippet-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 120) })}
                    placeholder="Enter snippet title..."
                    required
                  />
                  <span className="char-count">{formData.title.length}/120</span>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Code</label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Paste your code here..."
                    rows="15"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingSnippet ? 'Update Snippet' : 'Create Snippet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">
                <FaTrash />
              </div>
              <h3>Delete Snippet?</h3>
              <p>This action cannot be undone. The snippet will be permanently deleted.</p>
              <div className="confirm-actions">
                <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={() => deleteSnippet(showDeleteConfirm)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(null)}>
            <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Share Snippet: {showShareModal.title}</h3>
                <button className="close-btn" onClick={() => setShowShareModal(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="share-option">
                  <label className="share-toggle">
                    <input
                      type="checkbox"
                      checked={shareOptions.isPublic}
                      onChange={(e) => setShareOptions({...shareOptions, isPublic: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {shareOptions.isPublic ? <><FaGlobe /> Make Public</> : <><FaLock /> Keep Private</>}
                    </span>
                  </label>
                  <p className="share-description">
                    {shareOptions.isPublic 
                      ? "Anyone with the link can view this snippet" 
                      : "Only you can see this snippet"
                    }
                  </p>
                </div>

                {shareOptions.isPublic && (
                  <div className="share-link-section">
                    <label>Share Link:</label>
                    <div className="share-link-container">
                      <input
                        type="text"
                        value={showShareModal.shareId ? `${window.location.origin}/shared-snippet/${showShareModal.shareId}` : 'Save changes to generate link'}
                        readOnly
                      />
                      <button 
                        className="btn-secondary"
                        onClick={() => copyShareLink(showShareModal)}
                        disabled={!showShareModal.shareId}
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="share-option">
                  <label>Description (optional):</label>
                  <textarea
                    value={shareOptions.description}
                    onChange={(e) => setShareOptions({...shareOptions, description: e.target.value})}
                    placeholder="Add a description for your snippet..."
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div className="share-option">
                  <label>Tags (optional):</label>
                  <input
                    type="text"
                    value={shareOptions.tags.join(', ')}
                    onChange={(e) => setShareOptions({
                      ...shareOptions, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    placeholder="javascript, react, utility (comma-separated)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowShareModal(null)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={updateSharing}>
                  Update Sharing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetsManager;
