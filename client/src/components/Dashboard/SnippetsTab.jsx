import React from 'react';
import { FaCopy, FaEye, FaTrash, FaUpload } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const SnippetsTab = ({
  snippets,
  newTitle,
  setNewTitle,
  newLanguage,
  setNewLanguage,
  newCode,
  setNewCode,
  newDescription,
  setNewDescription,
  handleCreateSnippet,
  handleDeleteSnippet,
  handleLoadSnippetToEditor,
  handleCopySnippet
}) => {
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Snippets Library</h2>
        <p>Manage your saved code snippets</p>
      </div>

      <div className="snippets-layout">
        {/* Create Snippet Form */}
        <div className="snippet-form-card">
          <h3>Create New Snippet</h3>
          <div className="snippet-form-fields">
            <input
              type="text"
              placeholder="Snippet Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="snippet-input"
            />
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="snippet-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="php">PHP</option>
            </select>
            <textarea
              placeholder="Enter your code here..."
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="snippet-textarea"
              rows="10"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="snippet-textarea"
              rows="3"
            />
            <div className="snippet-form-actions">
              <button 
                onClick={handleCreateSnippet} 
                className="btn-primary"
                disabled={!newTitle.trim() || !newCode.trim()}
              >
                Create Snippet
              </button>
              <button 
                onClick={() => {
                  setNewTitle('');
                  setNewCode('');
                  setNewDescription('');
                }}
                className="btn-secondary"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>

        {/* Snippets List */}
        <div className="snippets-section">
          <div className="section-header">
            <h3>Your Snippets ({snippets.length})</h3>
            {snippets.length > 0 && (
              <div className="snippets-controls">
                <button className="btn-small secondary">
                  <FaEye /> View All
                </button>
                <button className="btn-small secondary">
                  Export
                </button>
              </div>
            )}
          </div>

          <div className="snippets-list">
            {snippets.length === 0 ? (
              <div className="empty-state">
                <FaCopy className="empty-icon" />
                <h3>No Snippets Found</h3>
                <p>Create your first code snippet using the form above!</p>
              </div>
            ) : (
              snippets.map((snippet) => (
                <div key={snippet.id} className="snippet-card">
                  <div className="snippet-header">
                    <h4>{snippet.title}</h4>
                    <span className="snippet-language">{snippet.language}</span>
                  </div>
                  
                  {snippet.description && (
                    <p className="snippet-description">{snippet.description}</p>
                  )}
                  
                  <pre className="snippet-code">{snippet.code.substring(0, 200)}{snippet.code.length > 200 ? '...' : ''}</pre>
                  
                  <div className="snippet-meta">
                    <span className="snippet-date">
                      Created: {new Date(snippet.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="snippet-actions">
                    <button
                      onClick={() => handleLoadSnippetToEditor(snippet)}
                      className="btn-icon"
                      title="Load to Editor"
                    >
                      <FaUpload /> Load
                    </button>
                    <button
                      onClick={() => handleCopySnippet(snippet)}
                      className="btn-icon"
                      title="Copy Code"
                    >
                      <FaCopy /> Copy
                    </button>
                    <button
                      onClick={() => handleDeleteSnippet(snippet.id)}
                      className="btn-icon btn-danger"
                      title="Delete"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetsTab;
