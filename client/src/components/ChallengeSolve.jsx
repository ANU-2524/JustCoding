
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { eclipse } from "@uiw/codemirror-theme-eclipse";
import {
  FaPlay,
  FaPaperPlane,
  FaLightbulb,
  FaBook,
  FaTrophy,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import "../Style/ChallengeSolve.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4334";

// import { FaPlay, FaPaperPlane, FaLightbulb, FaBook, FaTrophy, FaArrowLeft, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import Breadcrumb from './Breadcrumb';
import '../Style/ChallengeSolve.css';


const difficultyColors = {
  easy: "#4caf50",
  medium: "#ff9800",
  hard: "#f44336",
  expert: "#9c27b0",
};

const ChallengeSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const odId = localStorage.getItem("odId") || `user-${Date.now()}`;
  const odName = localStorage.getItem("odName") || "Anonymous";

  useEffect(() => {
    fetchChallenge();
  }, [slug]);

  useEffect(() => {
    if (challenge && challenge.starterCode) {
      setCode(challenge.starterCode[language] || "// Write your solution here");
    }
  }, [language, challenge]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/challenges/${slug}`);
      if (!res.ok) {
        throw new Error("Challenge not found");
      }
      const data = await res.json();
      setChallenge(data);
      setCode(data.starterCode?.[language] || "// Write your solution here");

      // Fetch submissions and leaderboard
      fetchSubmissions();
      fetchLeaderboard();
    } catch (error) {
      console.error("Error:", error);
      navigate("/challenges");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/${slug}/submissions/${odId}`);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/${slug}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const validateCode = (codeToValidate) => {
    if (!codeToValidate || codeToValidate.trim() === "") {
      setValidationError("Please write some code before submitting.");
      return false;
    }

    // Check if code is only comments/whitespace
    const codeLines = codeToValidate.split("\n");
    const hasActualCode = codeLines.some((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*")
      );
    });

    if (!hasActualCode) {
      setValidationError("Please write actual code (not just comments).");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const runCode = async () => {
    if (!validateCode(code)) {
      return;
    }

    setRunning(true);
    setResults(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/${slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          customInput: useCustomInput ? customInput : undefined,
        }),
      });

      const data = await res.json();
      setResults({ type: "run", results: data.results });
      setActiveTab("results");
    } catch (error) {
      setResults({ type: "error", message: error.message });
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    if (!validateCode(code)) {
      return;
    }

    setSubmitting(true);
    setResults(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/challenges/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          odId,
          odName,
        }),
      });

      const data = await res.json();
      setResults({ type: "submit", ...data });
      setActiveTab("results");
      fetchSubmissions();
      fetchLeaderboard();
    } catch (error) {
      setResults({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getLanguageExtension = (lang) => {
    const extensions = {
      javascript: javascript(),
      python: python(),
      java: java(),
      cpp: cpp(),
    };
    return extensions[lang] || javascript();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <FaCheck className="status-icon accepted" />;
      case "wrong_answer":
        return <FaTimes className="status-icon wrong" />;
      case "time_limit":
        return <FaClock className="status-icon tle" />;
      default:
        return <FaTimes className="status-icon error" />;
    }
  };

  if (loading) {
    return (
      <div className="challenge-solve-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div className="challenge-solve-container">
      <Breadcrumb 
        items={[
          { label: 'Challenges', path: '/challenges' },
          { label: challenge.title, path: null }
        ]}
      />

      {/* Header */}
      <div className="solve-header">
        <button className="back-btn" onClick={() => navigate("/challenges")}>
          <FaArrowLeft /> Back
        </button>
        <div className="challenge-title-section">
          <h1>{challenge.title}</h1>
          <span
            className="difficulty-badge"
            style={{ backgroundColor: difficultyColors[challenge.difficulty] }}
          >
            {challenge.difficulty}
          </span>
          <span className="points-badge">
            <FaTrophy /> {challenge.points} pts
          </span>
        </div>
      </div>

      <div className="solve-main">
        {/* Left Panel - Problem Description */}
        <div className="problem-panel">
          <div className="panel-tabs">
            <button
              className={activeTab === "description" ? "active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={activeTab === "results" ? "active" : ""}
              onClick={() => setActiveTab("results")}
            >
              Results
            </button>
            <button
              className={activeTab === "submissions" ? "active" : ""}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
            <button
              className={activeTab === "leaderboard" ? "active" : ""}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </button>
          </div>

          <div className="panel-content">
            {activeTab === "description" && (
              <div className="description-tab">
                <div className="problem-description">
                  <pre>
                    {challenge.description && challenge.description.length > 0
                      ? challenge.description
                      : "Description not available."}
                  </pre>
                </div>

                {challenge.constraints && (
                  <div className="constraints-section">
                    <h4>Constraints</h4>
                    <pre>{challenge.constraints}</pre>
                  </div>
                )}

                {challenge.examples?.length > 0 && (
                  <div className="examples-section">
                    <h4>Examples</h4>
                    {challenge.examples.map((ex, i) => (
                      <div key={i} className="example-box">
                        <div className="example-io">
                          <div>
                            <strong>Input:</strong>
                            <pre>{ex.input}</pre>
                          </div>
                          <div>
                            <strong>Output:</strong>
                            <pre>{ex.output}</pre>
                          </div>
                        </div>
                        {ex.explanation && (
                          <div className="explanation">
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {challenge.hints?.length > 0 && (
                  <div className="hints-section">
                    <button className="hints-toggle" onClick={() => setShowHints(!showHints)}>
                      <FaLightbulb /> {showHints ? "Hide Hints" : "Show Hints"}
                    </button>
                    {showHints && (
                      <ul className="hints-list">
                        {challenge.hints.map((hint, i) => (
                          <li key={i}>{hint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Editorial Link */}
                <div style={{marginTop:24}}>
                  <a
                    href={`/challenges/${challenge.slug || slug}/editorial`}
                    style={{
                      display: 'inline-block',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '8px 16px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Editorial / Hints
                  </a>
                </div>
              </div>
            )}

            {activeTab === "results" && (
              <div className="results-tab">
                {!results ? (
                  <div className="no-results">
                    <p>Run or submit your code to see results</p>
                  </div>
                ) : results.type === "error" ? (
                  <div className="error-result">
                    <FaTimes className="error-icon" />
                    <p>{results.message}</p>
                  </div>
                ) : (
                  <div className="results-content">
                    {results.type === "submit" && (
                      <div className={`submission-status ${results.status}`}>
                        {getStatusIcon(results.status)}
                        <span className="status-text">
                          {results.status === "accepted"
                            ? "Accepted!"
                            : results.status === "wrong_answer"
                              ? "Wrong Answer"
                              : results.status === "time_limit"
                                ? "Time Limit Exceeded"
                                : "Error"}
                        </span>
                        <span className="test-count">
                          {results.passedTests}/{results.totalTests} tests passed
                        </span>
                        {results.status === "accepted" && (
                          <span className="points-earned">+{results.points} pts</span>
                        )}
                      </div>
                    )}

                    <div className="test-results">
                      {results.results?.map((test, i) => (
                        <div key={i} className={`test-case ${test.passed ? "passed" : "failed"}`}>
                          <div className="test-header">
                            {test.passed ? <FaCheck /> : <FaTimes />}
                            <span>Test Case {i + 1}</span>
                            <span className="exec-time">{test.executionTime}ms</span>
                          </div>
                          {!test.passed && (
                            <div className="test-details">
                              <div>
                                <strong>Input:</strong> <pre>{test.input}</pre>
                              </div>
                              <div>
                                <strong>Expected:</strong> <pre>{test.expectedOutput}</pre>
                              </div>
                              <div>
                                <strong>Got:</strong> <pre>{test.actualOutput}</pre>
                              </div>
                              {test.error && <div className="error-msg">{test.error}</div>}
                            </div>
                          )}
                        </div>
                      )) ||
                        results.testResults?.map((test, i) => (
                          <div key={i} className={`test-case ${test.passed ? "passed" : "failed"}`}>
                            <div className="test-header">
                              {test.passed ? <FaCheck /> : <FaTimes />}
                              <span>Test Case {i + 1}</span>
                              <span className="exec-time">{test.executionTime}ms</span>
                            </div>
                            {!test.passed && (
                              <div className="test-details">
                                <div>
                                  <strong>Input:</strong> <pre>{test.input}</pre>
                                </div>
                                <div>
                                  <strong>Expected:</strong> <pre>{test.expectedOutput}</pre>
                                </div>
                                <div>
                                  <strong>Got:</strong> <pre>{test.actualOutput}</pre>
                                </div>
                                {test.error && <div className="error-msg">{test.error}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="submissions-tab">
                {submissions.length === 0 ? (
                  <p className="no-submissions">No submissions yet</p>
                ) : (
                  <div className="submissions-list">
                    {submissions.map((sub, i) => (
                      <div key={i} className={`submission-item ${sub.status}`}>
                        {getStatusIcon(sub.status)}
                        <span className="sub-status">{sub.status.replace("_", " ")}</span>
                        <span className="sub-tests">
                          {sub.passedTests}/{sub.totalTests}
                        </span>
                        <span className="sub-lang">{sub.language}</span>
                        <span className="sub-time">{sub.executionTime}ms</span>
                        <span className="sub-date">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="leaderboard-tab">
                {leaderboard.length === 0 ? (
                  <p className="no-leaderboard">No solutions yet. Be the first!</p>
                ) : (
                  <div className="leaderboard-list">
                    <div className="leaderboard-header-row">
                      <span>Rank</span>
                      <span>User</span>
                      <span>Time</span>
                    </div>
                    {leaderboard.map((entry, i) => (
                      <div key={i} className={`leaderboard-row ${i < 3 ? "top-three" : ""}`}>
                        <span className="rank">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : entry.rank}
                        </span>
                        <span className="name">{entry.odName}</span>
                        <span className="time">{entry.executionTime}ms</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="editor-panel">
          <div className="editor-toolbar">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <div className="toolbar-actions">
              <button className="run-btn" onClick={runCode} disabled={running || submitting}>
                <FaPlay /> {running ? "Running..." : "Run"}
              </button>
              <button className="submit-btn" onClick={submitCode} disabled={running || submitting}>
                <FaPaperPlane /> {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {validationError && (
            <div className="validation-error-banner">
              <span>{validationError}</span>
              <button className="error-close-btn" onClick={() => setValidationError(null)}>
                ×
              </button>
            </div>
          )}

          <div className="code-editor-wrapper">
            <CodeMirror
              value={code}
              extensions={[getLanguageExtension(language)]}
              theme={eclipse}
              onChange={(value) => setCode(value)}
              height="400px"
            />
          </div>

          {/* Custom Input */}
          <div className="custom-input-section">
            <label className="custom-input-toggle">
              <input
                type="checkbox"
                checked={useCustomInput}
                onChange={(e) => setUseCustomInput(e.target.checked)}
              />
              Use Custom Input
            </label>
            {useCustomInput && (
              <textarea
                className="custom-input-area"
                placeholder="Enter your custom input here..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={3}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSolve;
