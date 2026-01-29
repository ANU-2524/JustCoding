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

      <div className="snippet-form-card">
        <h3>Create New Snippet</h3>
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
        </select>
        <textarea
          placeholder="Code..."
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="snippet-textarea"
          rows="8"
        />
        <textarea
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="snippet-textarea"
          rows="3"
        />
        <button onClick={handleCreateSnippet} className="btn-primary">
          Create Snippet
        </button>
      </div>

      <div className="snippets-list">
        {snippets.length === 0 ? (
          <div className="empty-state">
            <p>No snippets yet. Create your first one above!</p>
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
              <pre className="snippet-code">{snippet.code}</pre>
              <div className="snippet-actions">
                <button
                  onClick={() => handleLoadSnippetToEditor(snippet)}
                  className="btn-icon"
                  title="Load to Editor"
                >
                  <FaUpload />
                </button>
                <button
                  onClick={() => handleCopySnippet(snippet)}
                  className="btn-icon"
                  title="Copy Code"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={() => handleDeleteSnippet(snippet.id)}
                  className="btn-icon btn-danger"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SnippetsTab;
