import { useEffect, useState, useRef } from 'react';
import CodeEditor from './CodeEditor';
import { 
  FaSun, FaMoon, FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo, 
  FaEye, FaBug, FaFilePdf, FaLightbulb, FaCode, FaChevronRight, 
  FaChevronLeft, FaSave, FaFileArchive, FaFolder, FaFile, 
  FaHistory, FaCog, FaTerminal, FaDownload
} from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import Loader from './Loader';
import '../Style/MainEdior.css';
import jsPDF from "jspdf";
import { useAuth } from "./AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { incrementStat } from '../services/localStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const languages = {
  python:     { name: 'Python',     starter: `print("Hello World")` },
  cpp:        { name: 'C++',        starter: `#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}` },
  java:       { name: 'Java',       starter: `public class Main {\n  public static void main(String[] args) {\n    \n  }\n}` },
  javascript: { name: 'JavaScript', starter: `// 🔍 Try the Visualizer with this code!\nlet age = 25;\nlet name = "Alice";\nlet isAdult = age >= 18;\nconsole.log(name + " is " + age + " years old");\nif (isAdult) {\n  console.log("Can vote!");\n}` },
  c:          { name: 'C',          starter: `#include <stdio.h>\nint main() {\n  return 0;\n}` },
  go:         { name: 'Go',         starter: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello Go")\n}` },
  ruby:       { name: 'Ruby',       starter: `puts "Hello Ruby"` },
  php:        { name: 'PHP',        starter: `<?php\necho "Hello PHP";` },
  swift:      { name: 'Swift',      starter: `print("Hello Swift")` },
  rust:       { name: 'Rust',       starter: `fn main() {\n  println!("Hello Rust");\n}` }
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://justcoding.onrender.com";
const AUTO_SAVE_INTERVAL = 3000;
const MAX_VERSION_HISTORY = 50;
const AUTO_SAVE_KEY_PREFIX = 'autosave_';
const VERSION_HISTORY_KEY_PREFIX = 'version_history_';

const MainEditor = () => {
  const [activePanelTab, setActivePanelTab] = useState("output");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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
    return savedLang === "javascript" ? languages.javascript.starter : languages[savedLang]?.starter || languages.javascript.starter;
  });

  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  
  // Auto-save states
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(() => {
    const saved = localStorage.getItem(`${AUTO_SAVE_KEY_PREFIX}last_saved_${language}`);
    return saved ? new Date(saved) : new Date();
  });
  const [versionHistory, setVersionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`${VERSION_HISTORY_KEY_PREFIX}${language}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [editorSettings, setEditorSettings] = useState(() => {
    const saved = localStorage.getItem("editorSettings");
    return saved ? JSON.parse(saved) : {
      intellisense: true, autoClosing: true, formatOnType: true,
      suggestOnTriggerCharacters: true, wordBasedSuggestions: true,
      autoSave: true, autoSaveInterval: AUTO_SAVE_INTERVAL
    };
  });

  const [projectFiles, setProjectFiles] = useState(() => {
    const saved = localStorage.getItem(`project-files-${language}`);
    return saved ? JSON.parse(saved) : [{ 
        id: 'main', name: getDefaultFileName(language), content: code, isMain: true, path: getDefaultFileName(language)
      }];
  });
  const [activeFileId, setActiveFileId] = useState('main');
  const [isExporting, setIsExporting] = useState(false);

  const [showVisualizer, setShowVisualizer] = useState(false);
  const [execution, setExecution] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerLoading, setVisualizerLoading] = useState(false);

  const { toggleTheme, isDark } = useTheme();
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef({});

  function getDefaultFileName(lang) {
    const extensions = { javascript: 'main.js', python: 'main.py', java: 'Main.java', cpp: 'main.cpp', c: 'main.c', go: 'main.go', ruby: 'main.rb', php: 'index.php', swift: 'main.swift', rust: 'main.rs' };
    return extensions[lang] || 'code.txt';
  }
  function getFileExtension(filename) { return filename.split('.').pop(); }

  useEffect(() => {
    projectFiles.forEach(file => { lastSavedContentRef.current[file.id] = file.content; });
  }, []);

  useEffect(() => {
    if (!editorSettings.autoSave) return;
    const saveIfChanged = () => {
      const activeFile = projectFiles.find(f => f.id === activeFileId);
      if (!activeFile) return;
      const currentContent = activeFile.content;
      const lastSavedContent = lastSavedContentRef.current[activeFileId];

      if (currentContent !== lastSavedContent) {
        setIsAutoSaving(true);
        saveToVersionHistory(activeFile.content);
        lastSavedContentRef.current[activeFileId] = currentContent;
        localStorage.setItem(`project-files-${language}`, JSON.stringify(projectFiles));
        const now = new Date();
        setLastSaved(now);
        localStorage.setItem(`${AUTO_SAVE_KEY_PREFIX}last_saved_${language}`, now.toISOString());
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    };
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(saveIfChanged, editorSettings.autoSaveInterval);
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [projectFiles, activeFileId, language, editorSettings.autoSave]);

  useEffect(() => { localStorage.setItem("editorSettings", JSON.stringify(editorSettings)); }, [editorSettings]);
  useEffect(() => { localStorage.setItem(`project-files-${language}`, JSON.stringify(projectFiles)); }, [projectFiles, language]);
  useEffect(() => { localStorage.setItem(`code-${language}`, code); localStorage.setItem("lang", language); }, [code, language]);

  const saveToVersionHistory = (content) => {
    const now = new Date();
    const version = { id: Date.now(), timestamp: now.toISOString(), content, fileId: activeFileId, fileName: projectFiles.find(f => f.id === activeFileId)?.name || 'unknown', language };
    setVersionHistory(prev => [version, ...prev].slice(0, MAX_VERSION_HISTORY));
  };

  const manualSave = () => {
    const activeFile = projectFiles.find(f => f.id === activeFileId);
    if (activeFile) {
      setIsAutoSaving(true);
      saveToVersionHistory(activeFile.content);
      localStorage.setItem(`project-files-${language}`, JSON.stringify(projectFiles));
      setLastSaved(new Date());
      lastSavedContentRef.current[activeFileId] = activeFile.content;
      setTimeout(() => setIsAutoSaving(false), 1000);
    }
  };

  const runCode = async () => {
    const activeFile = projectFiles.find(f => f.id === activeFileId);
    if (!activeFile || !activeFile.content.trim()) { setOutput("Please write some code first."); return; }
    setActivePanelTab("output");
    if (!isPanelOpen) setIsPanelOpen(true);
    
    setLoading(true);
    setLoadingMessage("Processing...");
    setOutput("");
    
    try {
      incrementStat('runs', 1);
      const res = await fetch(`${API_BASE}/compile`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: activeFile.content, stdin: userInput }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const debugCode = async () => {
    const activeFile = projectFiles.find(f => f.id === activeFileId);
    if (!activeFile) return;
    setDebugLoading(true);
    setActivePanelTab("ai");
    if (!isPanelOpen) setIsPanelOpen(true);
    
    try {
      incrementStat('aiDebugs', 1);
      const res = await fetch(`${API_BASE}/api/gpt/debug`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeFile.content, errorMessage: output }),
      });
      const data = await res.json();
      setDebugResult(data.debugHelp);
    } catch (err) { setDebugResult("Error debugging."); } 
    finally { setDebugLoading(false); }
  };

  const explainQuestion = async () => {
      if (!questionText.trim()) return alert('Paste a question first.');
      setIsExplaining(true);
      try {
        const res = await fetch(`${API_BASE}/api/gpt/explain`, {
           method: 'POST', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ question: questionText })
        });
        const data = await res.json();
        setExplanation(data.explanation);
      } catch (err) { setExplanation('Error explaining.'); }
      finally { setIsExplaining(false); }
  };

  const visualizeCode = async () => {
    const activeFile = projectFiles.find(f => f.id === activeFileId);
    if (!activeFile) return;
    setVisualizerLoading(true);
    try {
        const res = await fetch(`${API_BASE}/api/visualizer/visualize`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: activeFile.content, language })
        });
        const data = await res.json();
        if (data.success) {
            setExecution(data.execution);
            setCurrentStep(0);
            setShowVisualizer(true);
        } else { alert(data.error || 'Not supported'); }
    } catch (e) { alert('Connection failed'); }
    setVisualizerLoading(false);
  };

  const addNewFile = () => {
    const fileName = window.prompt('File name:', `file${projectFiles.length + 1}.${getFileExtension(getDefaultFileName(language))}`);
    if (fileName) {
        const newFile = { id: `file-${Date.now()}`, name: fileName, content: '', isMain: false, path: fileName };
        setProjectFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
    }
  };
  const updateFileContent = (id, content) => {
      setProjectFiles(prev => prev.map(f => f.id === id ? { ...f, content } : f));
  };
  
  const exportToZip = async () => {
      setIsExporting(true);
      const zip = new JSZip();
      projectFiles.forEach(f => zip.file(f.name, f.content));
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `JustCode-${languages[language].name}.zip`);
      setIsExporting(false);
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = `JustCode - ${languages[language].name} Project`;
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

    // Export all files in the project
    projectFiles.forEach((file, index) => {
      if (y > 250) { doc.addPage(); y = 10; }
      doc.setFontSize(12);
      doc.text(`File: ${file.name}`, 10, y);
      y += 8;
      const codeLines = doc.splitTextToSize(file.content, 180);
      codeLines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 10; }
        doc.text(line, 10, y);
        y += 7;
      });
      y += 5;
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

    doc.save(`${languages[language].name}-JustCode-Project.pdf`);
  };

  const activeFile = projectFiles.find(f => f.id === activeFileId) || projectFiles[0];
  const currentState = execution[currentStep];

  return (
    <div className={`main-editor-container ${!isPanelOpen ? 'panel-closed' : ''}`}>
      {loading && <Loader message={loadingMessage || "Processing..."} />}

      <header className="editor-header">
        <div className="header-left">
          <div className="logo-section">
            <FaCode className="logo-icon text-blue-500" size={24} />
            <h1 className="font-bold text-xl ml-2 hidden md:block">JustCode</h1>
          </div>
          <div className="divider-vertical"></div>
          <div className="file-info-header">
            <span className="file-name">{activeFile.name}</span>
            <span className="save-status text-xs text-gray-400 ml-2">
                {isAutoSaving ? 'Saving...' : 'Saved'}
            </span>
          </div>
        </div>

        <div className="header-center">
            <button onClick={runCode} className="btn-primary-run" disabled={loading} title="Run Code (Ctrl+Enter)">
                <FaPlay size={14} /> Run
            </button>

            <select 
                className="language-select-minimal"
                value={language}
                onChange={(e) => {
                  const lang = e.target.value;
                  setLanguage(lang);
                  const savedCode = localStorage.getItem(`code-${lang}`);
                  const savedProject = localStorage.getItem(`project-files-${lang}`);

                  if (savedProject) {
                    const project = JSON.parse(savedProject);
                    setProjectFiles(prev => project);
                    setActiveFileId(project[0].id);
                  } else if (savedCode) {
                    setProjectFiles(prev => [
                      {
                        id: 'main',
                        name: getDefaultFileName(lang),
                        content: savedCode,
                        isMain: true,
                        path: getDefaultFileName(lang)
                      }
                    ]);
                    setActiveFileId('main');
                  } else {
                    const defaultCode = lang === "javascript" ?
                      `// 🔍 Try the Visualizer with this code!\nlet age = 25;\nlet name = "Alice";\nlet isAdult = age >= 18;\nconsole.log(name + " is " + age + " years old");\nif (isAdult) {\n  console.log("Can vote!");\n}` :
                      languages[lang].starter;

                    setProjectFiles(prev => [
                      {
                        id: 'main',
                        name: getDefaultFileName(lang),
                        content: defaultCode,
                        isMain: true,
                        path: getDefaultFileName(lang)
                      }
                    ]);
                    setActiveFileId('main');
                  }
                  setShowVisualizer(false);
                }
              }
            >
                {Object.entries(languages).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                ))}
            </select>

            <button 
                onClick={visualizeCode} 
                className={`btn-icon-text ${showVisualizer ? 'active' : ''}`}
                disabled={visualizerLoading}
            >
                <FaEye /> {visualizerLoading ? 'Loading...' : 'Visualizer'}
            </button>
        </div>

        <div className="header-right">
             <button onClick={manualSave} className="btn-icon" title="Save"><FaSave /></button>
             <button onClick={() => setActivePanelTab('settings')} className="btn-icon" title="Settings"><FaCog /></button>
             <button onClick={toggleTheme} className="btn-icon" title="Theme">{isDark ? <FaSun /> : <FaMoon />}</button>
             
             <div className="dropdown-wrapper">
                 <button className="btn-icon" title="Export"><FaDownload /></button>
                 <div className="dropdown-menu">
                     <button onClick={() => { 
                         const blob = new Blob([activeFile.content], { type: 'text/plain' });
                         saveAs(blob, activeFile.name);
                     }}><FaFile /> Save File</button>
                     <button onClick={exportToZip}><FaFileArchive /> Export Zip</button>
                     <button onClick={downloadPDF}><FaFilePdf /> Export PDF</button>
                 </div>
             </div>

             <div className="divider-vertical"></div>
             
             <button 
                className={`btn-panel-toggle ${isPanelOpen ? 'active' : ''}`}
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                title="Toggle Side Panel"
             >
                {isPanelOpen ? <FaChevronRight /> : <FaChevronLeft />}
             </button>
        </div>
      </header>

      <div className="editor-zone">
        {showVisualizer ? (
           <div className="visualizer-container">
              <div className="visualizer-overlay-controls">
                 <button onClick={() => setShowVisualizer(false)} className="close-viz">✕ Exit Visualizer</button>
                 <div className="playback-controls">
                    <button onClick={() => setCurrentStep(0)}><FaRedo /></button>
                    <button onClick={() => currentStep > 0 && setCurrentStep(c => c-1)}><FaStepBackward /></button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={() => currentStep < execution.length - 1 && setCurrentStep(c => c+1)}><FaStepForward /></button>
                 </div>
                 <div className="step-counter">Step {currentStep + 1} / {execution.length || 1}</div>
              </div>
              
              <div className="viz-split-view">
                 <div className="viz-code-view">
                    <CodeEditor 
                        language={language} 
                        code={activeFile.content} 
                        theme={isDark ? "vs-dark" : "light"}
                        editorSettings={editorSettings}
                        readOnly={true}
                        highlightLine={currentState?.lineNumber}
                    />
                 </div>
                 <div className="viz-vars-view">
                    <h4>Variables</h4>
                    {currentState?.variables && Object.entries(currentState.variables).map(([k, v]) => (
                        <div key={k} className="var-row">
                            <span className="var-name">{k}</span>
                            <span className="var-val">{JSON.stringify(v.value)}</span>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        ) : (
           <CodeEditor
              language={language}
              code={activeFile.content}
              setCode={(c) => updateFileContent(activeFileId, c)}
              theme={isDark ? "vs-dark" : "light"}
              editorSettings={editorSettings}
           />
        )}
      </div>

      <aside className={`side-panel ${isPanelOpen ? 'open' : 'closed'}`}>
         <div className="panel-tabs">
            <button className={activePanelTab === 'output' ? 'active' : ''} onClick={() => setActivePanelTab('output')} title="Output">
                <FaTerminal />
            </button>
            <button className={activePanelTab === 'ai' ? 'active' : ''} onClick={() => setActivePanelTab('ai')} title="AI Assistant">
                <FaLightbulb />
            </button>
            <button className={activePanelTab === 'files' ? 'active' : ''} onClick={() => setActivePanelTab('files')} title="Project Files">
                <FaFolder />
            </button>
            <button className={activePanelTab === 'history' ? 'active' : ''} onClick={() => setActivePanelTab('history')} title="Version History">
                <FaHistory />
            </button>
            <button className={activePanelTab === 'settings' ? 'active' : ''} onClick={() => setActivePanelTab('settings')} title="Settings">
                <FaCog />
            </button>
         </div>

         <div className="panel-content">
            {activePanelTab === 'output' && (
                <div className="panel-section output-section">
                    <h3>Input</h3>
                    <textarea 
                        value={userInput} 
                        onChange={e => setUserInput(e.target.value)} 
                        placeholder="Stdin inputs..." 
                        className="input-area"
                    />
                    <h3>Output</h3>
                    <pre className="output-area">{output || "Run code to see output..."}</pre>
                </div>
            )}

            {activePanelTab === 'ai' && (
                <div className="panel-section ai-section">
                    <div className="ai-controls">
                        <textarea 
                            value={questionText} 
                            onChange={e => setQuestionText(e.target.value)} 
                            placeholder="Ask AI a question..." 
                        />
                        <div className="ai-buttons">
                            <button onClick={explainQuestion} disabled={isExplaining} className="btn-small">
                                {isExplaining ? 'Thinking...' : 'Explain'}
                            </button>
                            <button onClick={debugCode} disabled={debugLoading} className="btn-small btn-debug">
                                <FaBug /> Debug Code
                            </button>
                        </div>
                    </div>
                    <div className="ai-result markdown-body">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                             {explanation || debugResult || "AI responses will appear here."}
                         </ReactMarkdown>
                    </div>
                </div>
            )}

            {activePanelTab === 'files' && (
                <div className="panel-section files-section">
                    <div className="files-header">
                        <h3>Files ({projectFiles.length})</h3>
                        <button onClick={addNewFile} className="btn-add">+</button>
                    </div>
                    <div className="file-list">
                        {projectFiles.map(file => (
                            <div 
                                key={file.id} 
                                className={`file-row ${activeFileId === file.id ? 'active' : ''}`}
                                onClick={() => setActiveFileId(file.id)}
                            >
                                <FaFile className="file-icon-small"/> 
                                {file.name} 
                                {file.isMain && <span className="badge-main">M</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activePanelTab === 'history' && (
                <div className="panel-section history-section">
                     <h3>History</h3>
                     <div className="history-list">
                        {versionHistory.map(v => (
                            <div key={v.id} className="history-item" onClick={() => {
                                updateFileContent(v.fileId, v.content);
                                alert('Restored!');
                            }}>
                                <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                                <small>{v.fileName}</small>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {activePanelTab === 'settings' && (
                <div className="panel-section settings-section">
                    <h3>Editor Settings</h3>
                    <label className="setting-row">
                        <span>Intellisense</span>
                        <input type="checkbox" checked={editorSettings.intellisense} onChange={() => setEditorSettings(s => ({...s, intellisense: !s.intellisense}))} />
                    </label>
                    <label className="setting-row">
                        <span>Auto Close Brackets</span>
                        <input type="checkbox" checked={editorSettings.autoClosing} onChange={() => setEditorSettings(s => ({...s, autoClosing: !s.autoClosing}))} />
                    </label>
                    <label className="setting-row">
                        <span>Auto Save</span>
                        <input type="checkbox" checked={editorSettings.autoSave} onChange={() => setEditorSettings(s => ({...s, autoSave: !s.autoSave}))} />
                    </label>
                </div>
            )}
         </div>
      </aside>
    </div>
  );
};

export default MainEditor;