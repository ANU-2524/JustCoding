import { useState, useEffect, useContext } from 'react';
import { FaCode, FaPlus, FaSearch, FaTimes, FaStar, FaRegStar, FaEdit, FaTrash, FaCopy, FaFilter, FaTag } from 'react-icons/fa';
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
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript',
    code: '',
    tags: ''
  });

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
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> New Snippet
          </button>
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
      </div>
    </div>
  );
};

export default SnippetsManager;
