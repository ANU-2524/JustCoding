import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';
import { FaSun, FaMoon, FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo, FaEye } from 'react-icons/fa';
import Loader from './Loader';
import '../Style/MainEdior.css';
import jsPDF from "jspdf";
import { useAuth } from "./AuthContext";

const languages = {
  python:     { name: 'Python',     starter: `x = 10
y = 20
sum_val = x + y
print(sum_val)
if sum_val > 25:
    print("Large")` },
  cpp:        { name: 'C++',        starter: `#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    cout << sum << endl;
    if (sum > 25) {
        cout << "Large" << endl;
    }
    return 0;
}` },
  java:       { name: 'Java',       starter: `public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 20;
        int sum = x + y;
        System.out.println(sum);
        if (sum > 25) {
            System.out.println("Large");
        }
    }
}` },
  javascript: { name: 'JavaScript', starter: `let x = 10;
let y = 20;
let sum = x + y;
console.log(sum);
if (sum > 25) {
  console.log("Large");
}` },
  typescript: { name: 'TypeScript', starter: `let x: number = 10;
let y: number = 20;
let sum: number = x + y;
console.log(sum);
if (sum > 25) {
  console.log("Large");
}` },
  c:          { name: 'C',          starter: `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    printf("%d\\n", sum);
    if (sum > 25) {
        printf("Large\\n");
    }
    return 0;
}` },
  go:         { name: 'Go',         starter: `package main

import "fmt"

func main() {
    x := 10
    y := 20
    sum := x + y
    fmt.Println(sum)
    if sum > 25 {
        fmt.Println("Large")
    }
}` },
  ruby:       { name: 'Ruby',       starter: `x = 10
y = 20
sum = x + y
puts sum
if sum > 25
  puts "Large"
end` },
  php:        { name: 'PHP',        starter: `<?php
$x = 10;
$y = 20;
$sum = $x + $y;
echo $sum . "\\n";
if ($sum > 25) {
    echo "Large\\n";
}
?>` },
  swift:      { name: 'Swift',      starter: `let x = 10
let y = 20
let sum = x + y
print(sum)
if sum > 25 {
    print("Large")
}` },
  rust:       { name: 'Rust',       starter: `fn main() {
    let x = 10;
    let y = 20;
    let sum = x + y;
    println!("{}", sum);
    if sum > 25 {
        println!("Large");
    }
}` },
  csharp:     { name: 'C#',         starter: `using System;

class Program {
    static void Main() {
        int x = 10;
        int y = 20;
        int sum = x + y;
        Console.WriteLine(sum);
        if (sum > 25) {
            Console.WriteLine("Large");
        }
    }
}` },
  kotlin:     { name: 'Kotlin',     starter: `fun main() {
    val x = 10
    val y = 20
    val sum = x + y
    println(sum)
    if (sum > 25) {
        println("Large")
    }
}` },
  scala:      { name: 'Scala',      starter: `object Main extends App {
  val x = 10
  val y = 20
  val sum = x + y
  println(sum)
  if (sum > 25) {
    println("Large")
  }
}` },
  dart:       { name: 'Dart',       starter: `void main() {
  int x = 10;
  int y = 20;
  int sum = x + y;
  print(sum);
  if (sum > 25) {
    print('Large');
  }
}` },
  lua:        { name: 'Lua',        starter: `x = 10
y = 20
sum = x + y
print(sum)
if sum > 25 then
    print("Large")
end` },
  perl:       { name: 'Perl',       starter: `my $x = 10;
my $y = 20;
my $sum = $x + $y;
print $sum . "\\n";
if ($sum > 25) {
    print "Large\\n";
}` },
  r:          { name: 'R',          starter: `x <- 10
y <- 20
sum <- x + y
print(sum)
if (sum > 25) {
  print("Large")
}` },
  matlab:     { name: 'MATLAB',     starter: `x = 10;
y = 20;
sum = x + y;
disp(sum);
if sum > 25
    disp('Large');
end` },
  sql:        { name: 'SQL',        starter: `SELECT 10 + 20 AS sum;` }
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
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
  const [code, setCode] = useState(() => {
    const savedLang = localStorage.getItem("lang") || "python";
    const savedCode = localStorage.getItem(`code-${savedLang}`);
    if (savedCode) return savedCode;
    return languages[savedLang]?.starter || languages.python.starter;
  });
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "vs-dark");
  // Remove unused callback import
  const { logout, currentUser } = useAuth();

  // Visualizer states
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [execution, setExecution] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [visualizerLoading, setVisualizerLoading] = useState(false);

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
    const newCode = languages[language].starter;
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
    localStorage.setItem(`code-${language}`, newCode);
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

  // Visualizer functions
  const visualizeCode = async () => {
    setVisualizerLoading(true);
    
    try {
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
                <pre className="debug-code">{debugResult}</pre>
              </div>
            )}

            <div className="toolbar">
              <select
                className="select-lang"
                value={language}
                onChange={(e) => {
                  const lang = e.target.value;
                  setLanguage(lang);
                  const savedCode = localStorage.getItem(`code-${lang}`);
                  if (savedCode) {
                    setCode(savedCode);
                  } else {
                    setCode(languages[lang].starter);
                  }
                }}
              >
                {Object.entries(languages).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>

              <button onClick={runCode} className="btn run" disabled={loading}>
                {loading ? "Running..." : "Run Code"}
              </button>
              
              <button 
                onClick={visualizeCode} 
                className="btn visualize" 
                disabled={visualizerLoading}
                style={{background: 'linear-gradient(45deg, #e233ff, #ff6b00)'}}
              >
                <FaEye /> {visualizerLoading ? "Analyzing..." : "Visualize"}
              </button>
              
              <button onClick={reset} className="btn reset" disabled={loading}>Reset</button>
              <button onClick={downloadPDF} className="btn pdf" disabled={loading}>
                Export as PDF
              </button>
            </div>

            <div className="editor-output-wrapper">
              <div className="code-editor-column">
                {showVisualizer && execution.length > 0 ? (
                  <div className="visualizer-section">
                    <div className="visualizer-header">
                      <h3>🔍 Code Execution Visualizer</h3>
                      <button 
                        onClick={() => setShowVisualizer(false)} 
                        className="btn close-visualizer"
                        style={{background: '#666', padding: '0.5rem 1rem', fontSize: '0.8rem'}}
                      >
                        Close Visualizer
                      </button>
                    </div>
                    
                    <div className="code-display">
                      <div className="code-lines">
                        {code.split('\n').map((line, index) => (
                          <div 
                            key={index}
                            className={`code-line ${
                              currentState?.lineNumber === index + 1 ? 'active-line' : ''
                            }`}
                          >
                            <span className="line-number">{index + 1}</span>
                            <span className="line-code">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="visualizer-controls">
                      <div className="playback-controls">
                        <button onClick={resetVisualizer} className="control-btn">
                          <FaRedo />
                        </button>
                        <button onClick={prevStep} disabled={currentStep === 0} className="control-btn">
                          <FaStepBackward />
                        </button>
                        <button onClick={togglePlay} className="control-btn play-btn">
                          {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <button 
                          onClick={nextStep} 
                          disabled={currentStep >= execution.length - 1} 
                          className="control-btn"
                        >
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
                        Step {currentStep + 1} of {execution.length}
                      </div>
                    </div>

                    {currentState && (
                      <div className="state-info">
                        <div className="variables-panel">
                          <h4>Variables</h4>
                          <div className="variables-list">
                            {Object.entries(currentState.variables).map(([name, info]) => (
                              <div key={name} className="variable-item">
                                <span className="var-name">{name}</span>
                                <span className="var-value">{String(info.value)}</span>
                                <span className="var-type">{info.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="execution-details">
                          <h4>Current Step</h4>
                          <p><strong>Line:</strong> {currentState.lineNumber}</p>
                          <p><strong>Code:</strong> {currentState.code}</p>
                          <p><strong>Type:</strong> {currentState.type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <CodeEditor language={language} code={code} setCode={setCode} theme={theme} />
                )}
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