import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { FaLightbulb, FaCode, FaCopy, FaCheckCircle, FaSpinner, FaHistory, FaTrash, FaDownload } from 'react-icons/fa';
import Markdown from 'react-markdown';
import '../Style/CodeExplainer.css';

const CodeExplainer = () => {
  const { isDark } = useTheme();
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('Copy');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const codeInputRef = useRef(null);
  const explanationRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('codeExplainerHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  const explainCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to explain');
      return;
    }

    if (code.length > 2000) {
      setError('Code is too long. Maximum 2000 characters allowed.');
      return;
    }

    setLoading(true);
    setError('');
    setExplanation('');

    try {
      const response = await fetch('/api/gpt/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: code })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData?.error || `API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.explanation) {
        setExplanation(data.explanation);

        // Save to history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          code: code.substring(0, 50) + (code.length > 50 ? '...' : ''),
          explanation: data.explanation.substring(0, 100) + (data.explanation.length > 100 ? '...' : ''),
          fullCode: code,
          fullExplanation: data.explanation,
        };

        const updatedHistory = [historyEntry, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('codeExplainerHistory', JSON.stringify(updatedHistory));
      } else {
        setError(data?.error || 'No explanation received. Please try again.');
      }
    } catch (err) {
      console.error('Explanation failed:', err);
      setError(err.message || 'Failed to explain code. Please check the API configuration.');
      setExplanation('');
    }
    setLoading(false);
  };

  const copyExplanation = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopyState('Copied');
      setTimeout(() => setCopyState('Copy'), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyState('Retry');
    }
  };

  const downloadExplanation = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([`Code:\n\n${code}\n\n---\n\nExplanation:\n\n${explanation}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `code-explanation-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const loadFromHistory = (entry) => {
    setCode(entry.fullCode);
    setExplanation(entry.fullExplanation);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('codeExplainerHistory');
  };

  const deleteHistoryEntry = (id) => {
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('codeExplainerHistory', JSON.stringify(updatedHistory));
  };

  const clearAll = () => {
    setCode('');
    setExplanation('');
    setError('');
    setCopyState('Copy');
  };

  return (
    <div className={`code-explainer-container ${isDark ? 'dark' : 'light'}`}>
      <div className="explainer-header">
        <div className="header-content">
          <div className="header-icon">
            <FaLightbulb className="icon-pulse" />
          </div>
          <div className="header-text">
            <h1>Code Explainer</h1>
            <p>Get AI-powered explanations of your code snippets</p>
          </div>
        </div>
      </div>

      <div className="explainer-content">
        {/* Input Section */}
        <div className="input-section">
          <div className="section-header">
            <FaCode className="section-icon" />
            <h2>Enter Your Code</h2>
            <button 
              className="history-btn"
              onClick={() => setShowHistory(!showHistory)}
              title="View history"
            >
              <FaHistory /> {history.length > 0 && <span className="badge">{history.length}</span>}
            </button>
          </div>

          <textarea
            ref={codeInputRef}
            className="code-input"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="2000"
          />

          <div className="input-footer">
            <span className="char-count">
              {code.length} / 2000 characters
            </span>
            <div className="input-actions">
              <button 
                className="btn btn-secondary"
                onClick={clearAll}
                disabled={!code && !explanation}
              >
                Clear
              </button>
              <button 
                className="btn btn-primary"
                onClick={explainCode}
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Explaining...
                  </>
                ) : (
                  <>
                    <FaLightbulb /> Explain Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* History Sidebar */}
        {showHistory && (
          <div className="history-sidebar">
            <div className="history-header">
              <h3>History ({history.length})</h3>
              <button 
                className="clear-history-btn"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                <FaTrash /> Clear All
              </button>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <p className="empty-history">No history yet</p>
              ) : (
                history.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="history-item"
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div className="history-item-content">
                      <p className="history-code">{entry.code}</p>
                      <p className="history-timestamp">{entry.timestamp}</p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistoryEntry(entry.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Explanation Section */}
        {explanation && (
          <div className="output-section">
            <div className="section-header">
              <FaCheckCircle className="section-icon success" />
              <h2>Explanation</h2>
              <div className="output-actions">
                <button 
                  className={`btn btn-sm ${copyState === 'Copied' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={copyExplanation}
                >
                  <FaCopy /> {copyState}
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={downloadExplanation}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>

            <div className="explanation-content">
              <Markdown>{explanation}</Markdown>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loader">
              <FaSpinner className="spinner-large" />
            </div>
            <p>Analyzing your code and generating explanation...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !explanation && !error && (
          <div className="empty-state">
            <FaCode className="empty-icon" />
            <h3>No explanation yet</h3>
            <p>Paste your code above and click "Explain Code" to get started!</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h4>Fast Processing</h4>
          <p>Get instant explanations powered by advanced AI</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📚</div>
          <h4>Simple Language</h4>
          <p>Explanations are written in easy-to-understand terms</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💾</div>
          <h4>History Tracking</h4>
          <p>Access previous explanations from your history</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📤</div>
          <h4>Download & Share</h4>
          <p>Download explanations as text files</p>
        </div>
      </div>
    </div>
  );
};

export default CodeExplainer;
