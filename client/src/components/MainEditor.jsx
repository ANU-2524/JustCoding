import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';
import { FaSun, FaMoon, FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo, FaEye, FaUndo, FaBug, FaFilePdf, FaSignOutAlt, FaLightbulb, FaCode, FaChevronDown, FaChevronUp, FaSave, FaCopy } from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import Loader from './Loader';
import '../Style/MainEdior.css';
import jsPDF from "jspdf";
import { useAuth } from "./AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { addSnippet, incrementStat, touchLastActive } from '../services/localStore';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const languages = {

  python:     { name: 'Python',     starter: `print("Hello World")` },
  cpp:        { name: 'C++',        starter: `#include <iostream>
using namespace std;
int main() {
  return 0;
}` },
  java:       { name: 'Java',       starter: `public class Main {
  public static void main(String[] args) {
    
  }
}` },
  javascript: { name: 'JavaScript', starter: `// 🔍 Try the Visualizer with this code!
let age = 25;
let name = "Alice";
let isAdult = age >= 18;
console.log(name + " is " + age + " years old");
if (isAdult) {
  console.log("Can vote!");
}` },
  typescript: { name: 'TypeScript', starter: `console.log("Hello TypeScript");` },
  c:          { name: 'C',          starter: `#include <stdio.h>\nint main() {\n  return 0;\n}` },
  go:         { name: 'Go',         starter: `package main
import "fmt"
func main() {
  fmt.Println("Hello Go")
}` },
  ruby:       { name: 'Ruby',       starter: `puts "Hello Ruby"` },
  php:        { name: 'PHP',        starter: `<?php\necho "Hello PHP";` },
  swift:      { name: 'Swift',      starter: `print("Hello Swift")` },
  rust:       { name: 'Rust',       starter: `fn main() {\n  println!("Hello Rust");\n}` }
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://justcoding.onrender.com";
const REQUEST_TIMEOUT = 45000;

const MainEditor = () => {
  const [debugResult, setDebugResult] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "javascript");
  const [code, setCode] = useState(() => {
    const savedLang = localStorage.getItem("lang") || "javascript";
    const savedCode = localStorage.getItem(`code-${savedLang}`);
    if (savedCode) return savedCode;

    return savedLang === "javascript"
      ? `// 🔍 Try the Visualizer with this code!
let age = 25;
let name = "Alice";
let isAdult = age >= 18;
console.log(name + " is " + age + " years old");
if (isAdult) {
  console.log("Can vote!");
}`
      : languages[savedLang]?.starter || languages.javascript.starter;
  });
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [showAISection, setShowAISection] = useState(false);
  const [activeAITab, setActiveAITab] = useState("explain");
  useEffect(() => {
    localStorage.setItem("aiTab", activeAITab);
  }, [activeAITab]);

  // Visualizer states
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [execution, setExecution] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [visualizerLoading, setVisualizerLoading] = useState(false);

  const { theme, toggleTheme, isDark } = useTheme();
  const { logout, currentUser } = useAuth();
  // Keep server alive
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_BASE}/health`, { method: 'GET' });
      } catch (err) {
        console.log('Keep-alive ping failed');
      }
    };
    keepAlive();
    const intervalId = setInterval(keepAlive, 8 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Apply shared link if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      const data = JSON.parse(localStorage.getItem(`shared-${shareId}`) || 'null');
      if (data) {
        setLanguage(data.language);
        setCode(data.code);
        setUserInput(data.userInput || '');
      }
    }
  }, []);

  const fetchWithTimeout = async (url, options, timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      throw error;
    }
  };

  const explainQuestion = async () => {
    if (!questionText.trim()) {
      alert('Please paste a question first.');
      return;
    }
    setIsExplaining(true);
    localStorage.removeItem('question');
    localStorage.removeItem('explanation');
    try {
      incrementStat('aiExplains', 1);
      const res = await fetchWithTimeout(`${API_BASE}/api/gpt/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
      }, 60000);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setExplanation(data.explanation);
      localStorage.setItem('question', questionText);
      localStorage.setItem('explanation', data.explanation);
    } catch (err) {
      setExplanation(err.message || 'Error explaining the question.');
    } finally {
      setIsExplaining(false);
    }
  };

  const debugCode = async () => {
    if (!code.trim()) {
      alert("Please write some code first.");
      return;
    }
    setDebugLoading(true);
    localStorage.removeItem("debugHelp");
    try {
      incrementStat('aiDebugs', 1);
      const res = await fetchWithTimeout(`${API_BASE}/api/gpt/debug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, errorMessage: output }),
      }, 60000);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setDebugResult(data.debugHelp);
      localStorage.setItem("debugHelp", data.debugHelp);
    } catch (err) {
      setDebugResult(err.message || "Error getting debug help.");
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(`code-${language}`, code);
    localStorage.setItem("lang", language);
  }, [code, language]);

  const runCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first.");
      return;
    }
    setLoading(true);
    setLoadingMessage("Connecting to server...");
    setOutput("");
    const warningTimeout = setTimeout(() => {
      setLoadingMessage("Server is starting up (free tier)... Please wait 30-60s");
    }, 3000);
    try {
      incrementStat('runs', 1);
      const res = await fetchWithTimeout(`${API_BASE}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: userInput }),
      });
      clearTimeout(warningTimeout);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setLoadingMessage("Processing code...");
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      clearTimeout(warningTimeout);
      if (err.message.includes('timeout')) {
        setOutput("⏱️ Request timeout. The server took too long to respond.\\n\\nTips:\\n- Try again in a moment\\n- Check your internet connection\\n- Simplify your code if it's too complex");
      } else if (err.message.includes('Failed to fetch')) {
        setOutput("🌐 Network error. Cannot reach the server.\\n\\nTips:\\n- Check your internet connection\\n- The server might be down\\n- Try again in a few minutes");
      } else {
        setOutput(`❌ Error: ${err.message}\\n\\nPlease try again.`);
      }
    } finally {
      clearTimeout(warningTimeout);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const reset = () => {
    const newCode = language === "javascript" ?
      `// 🔍 Try the Visualizer with this code!\nlet age = 25;\nlet name = "Alice";\nlet isAdult = age >= 18;\nconsole.log(name + " is " + age + " years old");\nif (isAdult) {\n  console.log("Can vote!");\n}` :
      languages[language].starter;
    setCode(newCode);
    setUserInput("");
    setOutput("");
    setExplanation("");
    setQuestionText("");
    setDebugResult("");
    setShowVisualizer(false);
    setExecution([]);
    localStorage.removeItem("question");
    localStorage.removeItem("explanation");
    localStorage.removeItem("debugHelp");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = `JustCode - ${languages[language].name} Code`;
    doc.setFontSize(16);
    doc.text(title, 10, 10);
    let y = 20;

    const question = localStorage.getItem("question");
    if (question) {
      doc.setFontSize(12);
      doc.text("Question:", 10, y);
      y += 8;
      const qLines = doc.splitTextToSize(question, 180);
      qLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
      y += 5;
    }

    const explanationText = localStorage.getItem("explanation");
    if (explanationText) {
      if (y > 250) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text("Explanation:", 10, y);
      y += 8;
      const eLines = doc.splitTextToSize(explanationText, 180);
      eLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
      y += 5;
    }

    if (y > 250) { doc.addPage(); y = 10; }
    doc.setFontSize(12);
    doc.text("Code:", 10, y);
    y += 8;
    const codeLines = doc.splitTextToSize(code, 180);
    codeLines.forEach(line => {
      if (y > 280) { doc.addPage(); y = 10; }
      doc.text(line, 10, y);
      y += 7;
    });

    if (userInput.trim()) {
      doc.addPage();
      y = 10;
      doc.text("Input:", 10, y);
      y += 8;
      const inputLines = doc.splitTextToSize(userInput, 180);
      inputLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
    }

    if (output.trim()) {
      doc.addPage();
      y = 10;
      doc.text("Output:", 10, y);
      y += 8;
      const outputLines = doc.splitTextToSize(output, 180);
      outputLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
    }

    const debugHelp = localStorage.getItem("debugHelp");
    if (debugHelp) {
      doc.addPage();
      y = 10;
      doc.text("Debug Help:", 10, y);
      y += 8;
      const dLines = doc.splitTextToSize(debugHelp, 180);
      dLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
    }

    doc.save(`${languages[language].name}-JustCode-Session.pdf`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed!");
    }
  };

  // Universal Visualizer - works with all languages
  const visualizeCode = async () => {
    setVisualizerLoading(true);

    try {
      incrementStat('visualizes', 1);
      const response = await fetch(`${API_BASE}/api/visualizer/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      const data = await response.json();

      if (data.success) {
        setExecution(data.execution);
        setCurrentStep(0);
        setShowVisualizer(true);
      } else {
        alert('Visualization: ' + (data.error || 'Not supported for this language'));
      }
    } catch (error) {
      console.error('Visualization failed:', error);
      alert('Failed to connect to server. Please check your connection.');
    }
    setVisualizerLoading(false);
  };

  const saveCurrentAsSnippet = () => {
    const title = window.prompt('Snippet title');
    if (!title) return;
    addSnippet({ title: title.trim(), language, code });
    incrementStat('snippetsCreated', 1);
    touchLastActive();
    alert('Saved to Profile → Snippets');
  };

  const nextStep = () => {
    if (currentStep < execution.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetVisualizer = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < execution.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= execution.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, execution.length, speed]);

  const currentState = execution[currentStep];

  return (
    <div className="workspace">
      {loading && <Loader message={loadingMessage || "Running code..."} />}

      {/* Header */}
      <header className="workspace-header">
        <div className="header-left">
          <h1 className="logo">
            <FaCode className="logo-icon" />
            <span>Editor</span>
          </h1>
        </div>
        <div className="header-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="icon">
              {isDark ? <FaSun /> : <FaMoon />}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="workspace-main">
        {/* AI Helper Section (Collapsible) */}
        <section className="ai-section glass-card">
          <button
            className="ai-section-toggle"
            onClick={() => setShowAISection(!showAISection)}
          >
            <div className="toggle-left">
              <FaLightbulb className="toggle-icon" />
              <span>AI Assistant</span>
              <span className="toggle-hint">Get help with your questions & debug your code</span>
            </div>
            {showAISection ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showAISection && (
            <div className="ai-section-content">
              <div className="ai-tabs">
                <div className="ai-tab-header">
                  <button
                    className={`ai-tab ${activeAITab === "explain" ? "active" : ""}`}
                    onClick={() => setActiveAITab("explain")}
                  >
                    <FaLightbulb />
                    Question Helper
                  </button>

                  <button
                    className={`ai-tab ${activeAITab === "debug" ? "active" : ""}`}
                    onClick={() => setActiveAITab("debug")}
                  >
                    <FaBug />
                    Debug Helper
                  </button>
                </div>

                <div className="ai-tab-content">
                  {activeAITab === "explain" && (
                    <div className="ai-card">
                      <h3><FaLightbulb /> Question Helper</h3>
                      <textarea
                        className="input-field"
                        rows={3}
                        placeholder="Paste your coding question here..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                      />
                      <button
                        className="btn-primary"
                        onClick={explainQuestion}
                        disabled={isExplaining}
                      >
                        {isExplaining ? "Explaining..." : "Explain Question"}
                      </button>

                      {explanation && (
                        <div className="ai-response markdown-body">
                          <h4>Explanation:</h4>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {explanation}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  {activeAITab === "debug" && (
                    <div className="ai-card">
                      <h3><FaBug /> Debug Helper</h3>
                      <p className="ai-card-desc">
                        Having errors? Get AI-powered debugging suggestions.
                      </p>

                      <button
                        className="btn-primary"
                        onClick={debugCode}
                        disabled={debugLoading}
                      >
                        {debugLoading ? "Debugging..." : "Debug My Code"}
                      </button>

                      {debugResult && (
                        <div className="ai-response markdown-body">
                          <h4>Debug Suggestion:</h4>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {debugResult}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Toolbar */}
        <section className="toolbar">
          <div className="toolbar-left">
            <select
              className="language-select"
              value={language}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
                const savedCode = localStorage.getItem(`code-${lang}`);
                if (savedCode) {
                  setCode(savedCode);
                } else {
                  setCode(lang === "javascript" ?
                    `// 🔍 Try the Visualizer with this code!\nlet age = 25;\nlet name = "Alice";\nlet isAdult = age >= 18;\nconsole.log(name + " is " + age + " years old");\nif (isAdult) {\n  console.log("Can vote!");\n}` :
                    languages[lang].starter);
                }
                setShowVisualizer(false);
              }}
            >
              {Object.entries(languages).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-right">
            {/* Copy Button - Added to the left of Run button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(code)
                  .then(() => {
                    alert('Code copied to clipboard!');
                  })
                  .catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy code to clipboard');
                  });
              }}
              className="btn-copy"
              disabled={loading}
              title="Copy code to clipboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-lg)',
                fontFamily: 'var(--font-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                boxShadow: '0 2px 12px rgba(124, 58, 237, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(124, 58, 237, 0.4)';
              }}
            >
              <FaCopy />
              <span>Copy Code</span>
            </button>

            <button onClick={runCode} className="btn-run" disabled={loading}>
              <FaPlay />
              <span>{loading ? "Running..." : "Run"}</span>
            </button>

            <button onClick={saveCurrentAsSnippet} className="btn-secondary" disabled={loading}>
              <FaSave />
              <span>Save Snippet</span>
            </button>

            {/* Remove JavaScript-only restriction */}
            <button
              onClick={visualizeCode}
              className="btn-visualize"
              disabled={visualizerLoading}
              title="Step through your code execution with variable tracking"
            >
              <FaEye /> {visualizerLoading ? "Analyzing..." : "Visualize"}
              {!showVisualizer && <span className="visualizer-hint">NEW!</span>}
            </button>

            <button onClick={reset} className="btn-secondary" disabled={loading}>
              <FaUndo />
              <span>Reset</span>
            </button>
            <button onClick={downloadPDF} className="btn-secondary" disabled={loading}>
              <FaFilePdf />
              <span>Export PDF</span>
            </button>
          </div>
        </section>

        {/* Editor & Output */}
        <section className="editor-section">
          <div className={`editor-panel glass-card ${showVisualizer ? 'visualizer-mode' : ''}`}>
            <div className="panel-header">
              <span className="panel-title">{showVisualizer ? '🔍 Code Execution Visualizer' : 'Code Editor'}</span>
              <span className="language-badge">{languages[language].name}</span>
            </div>
            <div className="editor-container">
              {showVisualizer && execution.length > 0 ? (
                <div className="visualizer-content">
                  <div className="visualizer-controls-top">
                    <div className="playback-controls">
                      <button onClick={resetVisualizer} className="control-btn" title="Reset">
                        <FaRedo />
                      </button>
                      <button onClick={prevStep} disabled={currentStep === 0} className="control-btn" title="Previous Step">
                        <FaStepBackward />
                      </button>
                      <button onClick={togglePlay} className="control-btn play-btn" title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      <button onClick={nextStep} disabled={currentStep >= execution.length - 1} className="control-btn" title="Next Step">
                        <FaStepForward />
                      </button>
                    </div>
                    <div className="speed-control">
                      <label>Speed: </label>
                      <input
                        type="range"
                        min="200"
                        max="2000"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                      />
                      <span>{(2200 - speed) / 1000}x</span>
                    </div>
                    <div className="step-info">
                      Step {currentStep + 1} / {execution.length}
                    </div>
                    <button onClick={() => setShowVisualizer(false)} className="btn-close-visualizer" title="Close Visualizer">
                      ✕
                    </button>
                  </div>

<div className="code-display">
  <SyntaxHighlighter
  language={language}
  style={isDark ? oneDark : undefined} // Uses 'oneDark' only in dark mode
  customStyle={{
    margin: 0,
    background: "transparent", // Allows the themed card background to show through
    fontSize: "14px",
  }}
    lineProps={(lineNumber) => ({
      className:
        lineNumber === currentState?.lineNumber
          ? "active-line"
          : "",
    })}
  >
    {code}
  </SyntaxHighlighter>
</div>


                  {currentState && (
                    <div className="state-info">
                      <div className="variables-panel">
                        <h4>📊 Variables</h4>
                        <div className="variables-list">
                          {Object.entries(currentState.variables).length === 0 ? (
                            <div className="no-variables">No variables yet</div>
                          ) : (
                            Object.entries(currentState.variables).map(([name, info]) => (
                              <div key={name} className="variable-item">
                                <span className="var-name">{name}</span>
                                <span className="var-value">
                                  {typeof info.value === 'string' ? `"${info.value}"` : String(info.value)}
                                </span>
                                <span className="var-type">{info.type}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="execution-details">
                        <h4>🔍 Step Details</h4>
                        <div className="step-details">
                          <p><strong>Line:</strong> {currentState.lineNumber}</p>
                          <p><strong>Code:</strong> <code>{currentState.code}</code></p>
                          <p><strong>Type:</strong> <span className={`type-badge ${currentState.type}`}>{currentState.type}</span></p>
                          {currentState.output && (
                            <p><strong>Output:</strong> <span className="output-value">{currentState.output}</span></p>
                          )}
                          {currentState.conditionResult !== undefined && (
                            <p><strong>Condition:</strong> <span className={`condition-result ${currentState.conditionResult}`}>
                              {currentState.conditionResult ? 'true' : 'false'}
                            </span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeEditor
                  language={language}
                  code={code}
                  setCode={setCode}
                  theme={isDark ? "vs-dark" : "light"}
                />
              )}
            </div>
          </div>

          <div className="io-panel">
            <div className="input-panel glass-card">
              <div className="panel-header">
                <span className="panel-title">Input</span>
              </div>
              <textarea
                className="io-textarea"
                rows={5}
                placeholder="Enter input values here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>

            <div className="output-panel glass-card">
              <div className="panel-header">
                <span className="panel-title">Output</span>
              </div>
              <pre className="output-content">{output || "Your output will appear here..."}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainEditor;
