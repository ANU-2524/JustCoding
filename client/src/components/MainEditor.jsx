import { useEffect, useState, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import { FaSun, FaMoon } from 'react-icons/fa';
import Loader from './Loader';
import '../Style/MainEdior.css';
import jsPDF from "jspdf";
import { useAuth } from "./AuthContext";

const languages = {
  python:     { name: 'Python',     starter: `print("Hello World")` },
  cpp:        { name: 'C++',        starter: `#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}` },
  java:       { name: 'Java',       starter: `public class Main {\n  public static void main(String[] args) {\n    \n  }\n}` },
  javascript: { name: 'JavaScript', starter: `console.log("Hello World");` },
  typescript: { name: 'TypeScript', starter: `console.log("Hello TypeScript");` },
  c:          { name: 'C',          starter: `#include <stdio.h>\nint main() {\n  return 0;\n}` },
  go:         { name: 'Go',         starter: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello Go")\n}` },
  ruby:       { name: 'Ruby',       starter: `puts "Hello Ruby"` },
  php:        { name: 'PHP',        starter: `<?php\necho "Hello PHP";` },
  swift:      { name: 'Swift',      starter: `print("Hello Swift")` },
  rust:       { name: 'Rust',       starter: `fn main() {\n  println!("Hello Rust");\n}` }
};

const API_BASE = "https://justcoding.onrender.com";
const REQUEST_TIMEOUT = 45000; // 45 seconds

const MainEditor = () => {
  const [debugResult, setDebugResult] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "python");
  const [code, setCode] = useState(() =>
    localStorage.getItem(`code-${localStorage.getItem("lang")}`) || languages.python.starter
  );
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "vs-dark");
  const { logout, currentUser } = useAuth();

  // Keep server alive - ping every 8 minutes
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_BASE}/health`, { method: 'GET' });
      } catch (err) {
        console.log('Keep-alive ping failed');
      }
    };

    // Initial ping
    keepAlive();

    // Set interval
    const intervalId = setInterval(keepAlive, 8 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) {
      const data = JSON.parse(localStorage.getItem(`shared-${shareId}`));
      if (data) {
        setLanguage(data.language);
        setCode(data.code);
        setUserInput(data.userInput);
      }
    }
  }, []);

  // Helper function for fetch with timeout
  const fetchWithTimeout = async (url, options, timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
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
      alert("Please paste a question first.");
      return;
    }
    
    setIsExplaining(true);
    localStorage.removeItem("question");
    localStorage.removeItem("explanation");

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/gpt/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      }, 60000); // 60 second timeout for AI

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setExplanation(data.explanation);
      localStorage.setItem("question", questionText);
      localStorage.setItem("explanation", data.explanation);
    } catch (err) {
      const errorMsg = err.message || "Error explaining the question.";
      setExplanation(errorMsg);
      console.error("Explain error:", err);
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
      const res = await fetchWithTimeout(`${API_BASE}/api/gpt/debug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, errorMessage: output }),
      }, 60000); // 60 second timeout for AI

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setDebugResult(data.debugHelp);
      localStorage.setItem("debugHelp", data.debugHelp);
    } catch (err) {
      const errorMsg = err.message || "Error getting debug help.";
      setDebugResult(errorMsg);
      console.error("Debug error:", err);
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(`code-${language}`, code);
    localStorage.setItem("lang", language);
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme === "vs-dark" ? "dark" : "light");
  }, [code, language, theme]);

  const runCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Connecting to server...");
    setOutput(""); // Clear previous output

    // Show cold start warning after 3 seconds
    const warningTimeout = setTimeout(() => {
      setLoadingMessage("Server is starting up (free tier)... Please wait 30-60s");
    }, 3000);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: userInput }),
      });

      clearTimeout(warningTimeout);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      setLoadingMessage("Processing code...");
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      clearTimeout(warningTimeout);
      
      if (err.message.includes('timeout')) {
        setOutput("⏱️ Request timeout. The server took too long to respond.\n\nTips:\n- Try again in a moment\n- Check your internet connection\n- Simplify your code if it's too complex");
      } else if (err.message.includes('Failed to fetch')) {
        setOutput("🌐 Network error. Cannot reach the server.\n\nTips:\n- Check your internet connection\n- The server might be down\n- Try again in a few minutes");
      } else {
        setOutput(`❌ Error: ${err.message}\n\nPlease try again.`);
      }
      console.error("Run code error:", err);
    } finally {
      clearTimeout(warningTimeout);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const reset = () => {
    setCode(languages[language].starter);
    setUserInput("");
    setOutput("");
    setExplanation("");
    setQuestionText("");
    setDebugResult("");
    localStorage.removeItem("question");
    localStorage.removeItem("explanation");
    localStorage.removeItem("debugHelp");
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
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

    const explanation = localStorage.getItem("explanation");
    if (explanation) {
      if (y > 250) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text("Explanation:", 10, y);
      y += 8;
      const eLines = doc.splitTextToSize(explanation, 180);
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

  return (
    <div className="main-editor">
      <div className="editor-wrapper">
        <div className={`app-container ${theme === "vs-dark" ? "dark-theme" : "light-theme"}`}>
          {loading && (
            <Loader message={loadingMessage || "Running code..."} />
          )}
          <div className="inner-container">
            <div className="header">
              <h1 className="logo">JustCode ...💪</h1>
              <div className="flex gap-2 items-center">
                <button onClick={handleThemeToggle} className="theme-toggle">
                  {theme === "vs-dark" ? <FaSun /> : <FaMoon />}
                </button>
                {currentUser && (
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                )}
              </div>
            </div>
            
            <div className="question-section">
              <textarea
                className="input-box"
                rows={3}
                placeholder="Paste your question HERE !!"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
              <button className="btn explain" onClick={explainQuestion} disabled={isExplaining}>
                {isExplaining ? "Explaining..." : "Explain This Question"}
              </button>

              {explanation && (
                <div className="explanation-box">
                  <h3>Explanation:</h3>
                  <p>{explanation}</p>
                </div>
              )}
            </div>

            <button 
              className="btn debug" 
              style={{ marginTop: "8px" }} 
              onClick={debugCode}
              disabled={debugLoading}
            >
              {debugLoading ? "Debugging..." : "Debug My Code"}
            </button>

            {debugResult && (
              <div className="debug-result">
                <h3>Debug Suggestion:</h3>
                <pre>{debugResult}</pre>
              </div>
            )}

            <div className="toolbar">
              <select
                className="select-lang"
                value={language}
                onChange={(e) => {
                  const lang = e.target.value;
                  setLanguage(lang);
                  setCode(localStorage.getItem(`code-${lang}`) || languages[lang].starter);
                }}
              >
                {Object.entries(languages).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>

              <button onClick={runCode} className="btn run" disabled={loading}>
                {loading ? "Running..." : "Run Code"}
              </button>
              <button onClick={reset} className="btn reset" disabled={loading}>Reset</button>
              <button onClick={downloadPDF} className="btn pdf" disabled={loading}>
                Export as PDF
              </button>
            </div>

            <div className="editor-output-wrapper">
              <div className="code-editor-column">
                <CodeEditor language={language} code={code} setCode={setCode} theme={theme} />
              </div>

              <div className="output-column">
                <textarea
                  className="input-box"
                  rows={5}
                  placeholder="Enter input values !!"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                ></textarea>
                <pre className="output-box">{output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainEditor;