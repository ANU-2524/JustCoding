import { useEffect, useMemo, useState } from 'react';
import { useTheme } from './ThemeContext';
import { FaBug, FaCode, FaCopy, FaDownload, FaHistory, FaSpinner, FaTrash, FaCheckCircle } from 'react-icons/fa';
import Markdown from 'react-markdown';
import '../Style/CodeDebugger.css';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'other', label: 'Other' }
];

const MAX_CODE_LENGTH = 10000;
const MAX_ERROR_LENGTH = 5000;

const extractFirstCodeBlock = (text) => {
  if (!text) return '';
  const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : '';
};

const CodeDebugger = () => {
  const { isDark } = useTheme();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [debugHelp, setDebugHelp] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [copyState, setCopyState] = useState('Copy Fixed Code');

  useEffect(() => {
    const saved = localStorage.getItem('codeDebuggerHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load debug history:', e);
      }
    }
  }, []);

  useEffect(() => {
    const extracted = extractFirstCodeBlock(debugHelp);
    setFixedCode(extracted);
  }, [debugHelp]);

  const canAnalyze = useMemo(() => {
    return code.trim().length > 0 && !loading;
  }, [code, loading]);

  const analyzeDebug = async () => {
    if (!code.trim()) {
      setError('Please enter some code to debug.');
      return;
    }

    if (code.length > MAX_CODE_LENGTH) {
      setError(`Code is too long. Maximum ${MAX_CODE_LENGTH} characters allowed.`);
      return;
    }

    if (errorMessage.length > MAX_ERROR_LENGTH) {
      setError(`Error message is too long. Maximum ${MAX_ERROR_LENGTH} characters allowed.`);
      return;
    }

    setLoading(true);
    setError('');
    setDebugHelp('');

    try {
      const composedError = errorMessage.trim()
        ? `Language: ${language}\n${errorMessage.trim()}`
        : `Language: ${language}`;

      const response = await fetch('http://localhost:4334/api/gpt/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          errorMessage: composedError
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const errorData = errorText ? { error: errorText } : { error: 'Unknown error' };
        throw new Error(errorData?.error || `API Error: ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      if (data.debugHelp) {
        setDebugHelp(data.debugHelp);

        const entry = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          language,
          errorMessage: errorMessage.trim(),
          codePreview: code.substring(0, 80) + (code.length > 80 ? '...' : ''),
          debugPreview: data.debugHelp.substring(0, 120) + (data.debugHelp.length > 120 ? '...' : ''),
          fullCode: code,
          fullDebugHelp: data.debugHelp
        };

        const updatedHistory = [entry, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('codeDebuggerHistory', JSON.stringify(updatedHistory));
      } else {
        setError('No debugging response received. Please try again.');
      }
    } catch (err) {
      console.error('Debugging failed:', err);
      setError(err.message || 'Failed to debug code. Please check the API configuration.');
    }

    setLoading(false);
  };

  const copyFixedCode = async () => {
    if (!fixedCode) return;
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopyState('Copied');
      setTimeout(() => setCopyState('Copy Fixed Code'), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyState('Retry');
    }
  };

  const downloadReport = () => {
    try {
      const element = document.createElement('a');
      const report = `AI Debug Report\n\nLanguage: ${language}\n\nError Message:\n${errorMessage || 'None'}\n\nCode:\n${code}\n\n---\n\nDebug Suggestions:\n${debugHelp}\n\n---\n\nSuggested Fix:\n${fixedCode || 'No fixed code detected.'}`;
      const file = new Blob([report], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `debug-report-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const loadHistory = (entry) => {
    setCode(entry.fullCode || '');
    setDebugHelp(entry.fullDebugHelp || '');
    setErrorMessage(entry.errorMessage || '');
    setLanguage(entry.language || 'javascript');
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('codeDebuggerHistory');
  };

  return (
    <div className={`code-debugger ${isDark ? 'dark' : 'light'}`}>
      <div className="debugger-container">
        <div className="debugger-header">
          <div className="header-left">
            <FaBug className="header-icon" />
            <div>
              <h1>AI Code Debug Assistant</h1>
              <p>Find bugs faster with AI-guided debugging suggestions</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="ghost-btn" onClick={() => setShowHistory(!showHistory)}>
              <FaHistory /> History
            </button>
          </div>
        </div>

        <div className="debugger-grid">
          <div className="input-panel">
            <div className="input-header">
              <h2><FaCode /> Code Input</h2>
              <div className="language-select">
                <label>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              className="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste the code you want to debug..."
              rows={12}
            />
            <div className="char-count">
              {code.length}/{MAX_CODE_LENGTH}
            </div>

            <label className="error-label">Error Message (optional)</label>
            <textarea
              className="error-input"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste the error message or describe the issue..."
              rows={4}
            />
            <div className="char-count">
              {errorMessage.length}/{MAX_ERROR_LENGTH}
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button className="primary-btn" disabled={!canAnalyze} onClick={analyzeDebug}>
              {loading ? <><FaSpinner className="spin" /> Analyzing...</> : <><FaBug /> Debug Code</>}
            </button>
          </div>

          <div className="output-panel">
            <div className="output-header">
              <h2><FaLightbulbIcon /> Debugging Suggestions</h2>
              <div className="output-actions">
                <button className="ghost-btn" onClick={downloadReport} disabled={!debugHelp}>
                  <FaDownload /> Export Report
                </button>
              </div>
            </div>

            <div className="output-content">
              {loading ? (
                <div className="loading-state">
                  <FaSpinner className="spin" />
                  <p>Analyzing your code...</p>
                </div>
              ) : debugHelp ? (
                <Markdown>{debugHelp}</Markdown>
              ) : (
                <div className="placeholder">
                  <FaBug className="placeholder-icon" />
                  <p>Run a debug analysis to see suggestions here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <div className="comparison-header">
            <h2>Before / After</h2>
            <button className="ghost-btn" onClick={copyFixedCode} disabled={!fixedCode}>
              <FaCopy /> {copyState}
            </button>
          </div>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h3>Before</h3>
              <textarea readOnly value={code || 'No code provided yet.'} rows={8} />
            </div>
            <div className="comparison-card">
              <h3>Suggested Fix</h3>
              <textarea readOnly value={fixedCode || 'No fixed code detected in response.'} rows={8} />
            </div>
          </div>
        </div>

        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3><FaHistory /> Recent Debug Sessions</h3>
              <button className="ghost-btn" onClick={clearHistory} disabled={history.length === 0}>
                <FaTrash /> Clear
              </button>
            </div>
            {history.length === 0 ? (
              <p className="history-empty">No debug history yet.</p>
            ) : (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id} className="history-item" onClick={() => loadHistory(item)}>
                    <div className="history-meta">
                      <span className="history-time">{item.timestamp}</span>
                      <span className="history-lang">{item.language}</span>
                    </div>
                    <div className="history-preview">
                      <strong>Code:</strong> {item.codePreview}
                    </div>
                    <div className="history-preview">
                      <strong>Debug:</strong> {item.debugPreview}
                    </div>
                    <span className="history-load"><FaCheckCircle /> Load</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FaLightbulbIcon = () => <span className="lightbulb">💡</span>;

export default CodeDebugger;