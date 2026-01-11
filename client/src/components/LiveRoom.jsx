// ✅ LiveRoom with Full Real-Time Collaboration Features
import React, { useEffect, useState, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getExplanation, getDebugSuggestion } from './OpenAIService';
import '../Style/LiveRoom.css';
import { endSession, incrementStat, startSession, touchLastActive } from '../services/localStore';

// ✅ Language starter code
const languages = {
  python: { name: 'Python', starter: `print("Hello World")` },
  cpp: { name: 'C++', starter: `#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}` },
  java: { name: 'Java', starter: `public class Main {\n  public static void main(String[] args) {\n    \n  }\n}` },
  javascript: { name: 'JavaScript', starter: `console.log("Hello World");` },
  typescript: { name: 'TypeScript', starter: `console.log("Hello TypeScript");` },
  c: { name: 'C', starter: `#include <stdio.h>\nint main() {\n  printf("Hello, World!");\n  return 0;\n}` },
  go: { name: 'Go', starter: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello Go")\n}` },
  ruby: { name: 'Ruby', starter: `puts "Hello Ruby"` },
  php: { name: 'PHP', starter: `<?php\necho "Hello PHP";` },
  rust: { name: 'Rust', starter: `fn main() {\n  println!("Hello Rust");\n}` }
};

const languageMap = {
  javascript: 'javascript', typescript: 'javascript', python: 'python',
  java: 'java', cpp: 'cpp', c: 'c', go: 'go', ruby: 'ruby', php: 'php', rust: 'rust'
};

// User colors for cursors
const USER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

const LiveRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("user") || `User-${Math.random().toString(36).substr(2, 4)}`;
  const navigate = useNavigate();
  const socket = useRef(null);
  const sessionIdRef = useRef(null);
  const editorRef = useRef(null);

  // Basic state
  const [code, setCode] = useState(languages.javascript.starter);
  const [language, setLanguage] = useState("javascript");
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingNotification, setTypingNotification] = useState('');
  const [systemMsg, setSystemMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [output, setOutput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [debugResult, setDebugResult] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);

  // Collaboration state
  const [participants, setParticipants] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [debugState, setDebugState] = useState(null);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [myColor, setMyColor] = useState(USER_COLORS[0]);

  const messagesEndRef = useRef(null);
  const pendingOps = useRef([]);


  // Initialize socket and join room
  useEffect(() => {
    sessionIdRef.current = startSession({ roomId, username });
    touchLastActive();

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4334";
    socket.current = io(backendUrl);
    
    // Assign color based on username hash
    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % USER_COLORS.length;
    setMyColor(USER_COLORS[colorIndex]);

    // Join room with user info
    socket.current.emit("join-room", { 
      roomId, 
      username,
      color: USER_COLORS[colorIndex]
    });

    // Code sync
    socket.current.on("code-update", (newCode) => {
      setCode(newCode);
      setDocumentVersion(v => v + 1);
    });

    // OT Operations
    socket.current.on("operation", ({ operation, version, userId }) => {
      if (userId !== socket.current.id) {
        applyRemoteOperation(operation);
        setDocumentVersion(version);
      }
    });

    socket.current.on("operation-ack", ({ version }) => {
      setDocumentVersion(version);
      pendingOps.current.shift();
    });

    // Chat
    socket.current.on("receive-chat", ({ username: sender, message }) => {
      setMessages(prev => [...prev, { username: sender, message }]);
    });

    socket.current.on("show-typing", (msg) => {
      setTypingNotification(msg);
      setTimeout(() => setTypingNotification(''), 2000);
    });

    // Participants
    socket.current.on("user-joined", ({ username: newUser, color, isHost: hostStatus }) => {
      setSystemMsg(`${newUser} joined the room`);
      setTimeout(() => setSystemMsg(''), 3000);
      setParticipants(prev => {
        if (prev.find(p => p.username === newUser)) return prev;
        return [...prev, { username: newUser, color, isActive: true }];
      });
    });

    socket.current.on("user-left", ({ username: leftUser }) => {
      setSystemMsg(`${leftUser} left the room`);
      setTimeout(() => setSystemMsg(''), 3000);
      setParticipants(prev => prev.filter(p => p.username !== leftUser));
      setRemoteCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[leftUser];
        return newCursors;
      });
    });

    socket.current.on("participants-list", (list) => {
      setParticipants(list);
    });

    socket.current.on("host-assigned", ({ isHost: hostStatus }) => {
      setIsHost(hostStatus);
    });

    // Cursor sharing
    socket.current.on("cursor-update", ({ username: cursorUser, position, selection, color }) => {
      if (cursorUser !== username) {
        setRemoteCursors(prev => ({
          ...prev,
          [cursorUser]: { position, selection, color, username: cursorUser }
        }));
      }
    });

    socket.current.on("cursor-remove", ({ username: leftUser }) => {
      setRemoteCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[leftUser];
        return newCursors;
      });
    });

    // Recording
    socket.current.on("recording-started", () => {
      setIsRecording(true);
      setSystemMsg("📹 Session recording started");
      setTimeout(() => setSystemMsg(''), 3000);
    });

    socket.current.on("recording-stopped", ({ recordingId: recId }) => {
      setIsRecording(false);
      setRecordingId(recId);
      setSystemMsg(`📹 Recording saved: ${recId}`);
      setTimeout(() => setSystemMsg(''), 5000);
    });

    // Collaborative debugging
    socket.current.on("debug-state-update", (state) => {
      setDebugState(state);
    });

    return () => {
      socket.current?.disconnect();
      endSession(sessionIdRef.current);
      touchLastActive();
    };
  }, [roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // OT: Apply remote operation
  const applyRemoteOperation = useCallback((operation) => {
    setCode(prevCode => {
      if (operation.type === 'insert') {
        return prevCode.slice(0, operation.position) + operation.data + prevCode.slice(operation.position);
      } else if (operation.type === 'delete') {
        return prevCode.slice(0, operation.position) + prevCode.slice(operation.position + operation.length);
      }
      return prevCode;
    });
  }, []);

  // OT: Send local operation
  const sendOperation = useCallback((type, position, data) => {
    const operation = { type, position, data, timestamp: Date.now() };
    pendingOps.current.push(operation);
    
    socket.current.emit("operation", {
      roomId,
      operation,
      version: documentVersion
    });
  }, [roomId, documentVersion]);

  // Handle code changes with OT
  const handleCodeChange = useCallback((value, viewUpdate) => {
    const oldCode = code;
    setCode(value);
    
    // Detect changes and create operations
    if (value.length > oldCode.length) {
      // Insert operation
      const pos = findDiffPosition(oldCode, value);
      const inserted = value.slice(pos, pos + (value.length - oldCode.length));
      sendOperation('insert', pos, inserted);
    } else if (value.length < oldCode.length) {
      // Delete operation
      const pos = findDiffPosition(oldCode, value);
      const length = oldCode.length - value.length;
      sendOperation('delete', pos, length);
    }

    // Broadcast full code for simple sync (fallback)
    socket.current.emit("code-change", { roomId, code: value });

    // Send cursor position
    if (viewUpdate?.state) {
      const selection = viewUpdate.state.selection.main;
      sendCursorPosition(selection.head, selection.from !== selection.to ? { from: selection.from, to: selection.to } : null);
    }
  }, [code, roomId, sendOperation]);

  // Find position where strings differ
  const findDiffPosition = (oldStr, newStr) => {
    let i = 0;
    while (i < oldStr.length && i < newStr.length && oldStr[i] === newStr[i]) {
      i++;
    }
    return i;
  };

  // Send cursor position
  const sendCursorPosition = useCallback((position, selection) => {
    socket.current.emit("cursor-move", {
      roomId,
      username,
      position,
      selection,
      color: myColor
    });
  }, [roomId, username, myColor]);

  // Handle selection/cursor changes
  const handleEditorUpdate = useCallback((viewUpdate) => {
    if (viewUpdate?.state && viewUpdate.selectionSet) {
      const selection = viewUpdate.state.selection.main;
      sendCursorPosition(selection.head, selection.from !== selection.to ? { from: selection.from, to: selection.to } : null);
    }
  }, [sendCursorPosition]);

  // Recording controls (host only)
  const startRecording = useCallback(() => {
    if (!isHost) return;
    socket.current.emit("start-recording", { roomId });
  }, [isHost, roomId]);

  const stopRecording = useCallback(() => {
    if (!isHost) return;
    socket.current.emit("stop-recording", { roomId });
  }, [isHost, roomId]);

  // Collaborative debug state
  const shareDebugState = useCallback((state) => {
    socket.current.emit("debug-state", { roomId, state });
    setDebugState(state);
  }, [roomId]);


  // Chat functions
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setMessages(prev => [...prev, { username: "You", message: chatInput }]);
      socket.current.emit("send-chat", { roomId, username, message: chatInput });
      setChatInput('');
    }
  };

  const leaveRoom = () => {
    socket.current.disconnect();
    navigate("/devzone");
  };

  // Run code
  const runCode = async () => {
    try {
      const backendLanguage = languageMap[language] || language;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4334";
      setOutput("Compiling and running your code...");
      incrementStat('runs', 1);
      
      const res = await fetch(`${backendUrl}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: backendLanguage, code, stdin: userInput }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      setOutput(result.output || "No output");
      
      // Share output with collaborators
      shareDebugState({ type: 'output', output: result.output, timestamp: Date.now() });
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  // AI functions
  const explainQuestion = async () => {
    if (!questionText.trim()) return;
    setIsExplaining(true);
    incrementStat('aiExplains', 1);
    const result = await getExplanation(questionText);
    setExplanation(result);
    setIsExplaining(false);
  };

  const debugCode = async () => {
    setDebugLoading(true);
    incrementStat('aiDebugs', 1);
    const result = await getDebugSuggestion(code, output);
    setDebugResult(result);
    setDebugLoading(false);
    
    // Share debug result with collaborators
    shareDebugState({ type: 'debug', result, timestamp: Date.now() });
  };

  // Get language extension
  const getLanguageExtension = (lang) => {
    const extensions = {
      javascript: javascript(), typescript: javascript(),
      python: python(), java: java(),
      cpp: cpp(), c: cpp(), go: go(),
      php: php(), rust: rust(), ruby: javascript()
    };
    return extensions[lang] || javascript();
  };

  // Calculate cursor position in pixels (approximate)
  const getCursorPixelPosition = (charPosition) => {
    const lines = code.slice(0, charPosition).split('\n');
    const lineNumber = lines.length - 1;
    const columnNumber = lines[lines.length - 1].length;
    return {
      top: lineNumber * 20, // ~20px per line
      left: columnNumber * 8 // ~8px per character
    };
  };


  return (
    <div className="live-room-container">
      {/* Top Bar */}
      <div className="top-bar">
        <h2 className="room-title">👨‍💻 DevZone: <span>{roomId}</span></h2>
        <div className="top-bar-actions">
          {isRecording && <span className="recording-badge">🔴 Recording</span>}
          <span className="participant-count">👥 {participants.length + 1}</span>
          <button 
            className="share-btn"
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              setSystemMsg('Room code copied! Share it with others to join.');
              setTimeout(() => setSystemMsg(''), 3000);
            }}
            title="Copy room code"
          >
            📋 Share Code
          </button>
          <button className="leave-btn" onClick={() => setShowModal(true)}>🚪 Leave</button>
        </div>
      </div>

      <div className="main-content">
        {/* Left Panel - Editor */}
        <div className="editor-panel">
          <div className="toolbar">
            <select value={language} onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setCode(languages[lang].starter);
            }}>
              {Object.entries(languages).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
            <button onClick={runCode}>▶️ Run</button>
            {isHost && (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'recording-active' : ''}
              >
                {isRecording ? '⏹️ Stop Recording' : '🔴 Record'}
              </button>
            )}
          </div>

          {/* Editor with Remote Cursors */}
          <div className="editor-wrapper" style={{ position: 'relative' }}>
            <CodeMirror
              ref={editorRef}
              value={code}
              extensions={[getLanguageExtension(language)]}
              theme={eclipse}
              onChange={handleCodeChange}
              onUpdate={handleEditorUpdate}
              height="350px"
            />
            
            {/* Remote Cursors Overlay */}
            <div className="remote-cursors-overlay">
              {Object.entries(remoteCursors).map(([user, cursor]) => {
                const pos = getCursorPixelPosition(cursor.position);
                return (
                  <div
                    key={user}
                    className="remote-cursor"
                    style={{
                      position: 'absolute',
                      left: `${pos.left}px`,
                      top: `${pos.top}px`,
                      pointerEvents: 'none',
                      zIndex: 1000
                    }}
                  >
                    <div 
                      className="cursor-caret"
                      style={{ backgroundColor: cursor.color }}
                    />
                    <span 
                      className="cursor-name-tag"
                      style={{ backgroundColor: cursor.color }}
                    >
                      {cursor.username}
                    </span>
                    {cursor.selection && (
                      <div 
                        className="cursor-selection"
                        style={{
                          backgroundColor: `${cursor.color}30`,
                          width: `${(cursor.selection.to - cursor.selection.from) * 8}px`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Output & Debug */}
          <div className="ai-sections">
            <div className="ai-box">
              <h4>📤 Output</h4>
              <textarea
                placeholder="Enter input for your program..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={2}
              />
              <pre className="output-box">{output || 'Run your code to see output'}</pre>
            </div>

            <div className="ai-box">
              <h4>❓ Ask AI</h4>
              <textarea
                placeholder="Paste your question..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={2}
              />
              <button onClick={explainQuestion} disabled={isExplaining}>
                {isExplaining ? "Thinking..." : "Ask"}
              </button>
              {explanation && <pre className="ai-response">{explanation}</pre>}
            </div>

            <div className="ai-box">
              <h4>🐞 Debug</h4>
              <button onClick={debugCode} disabled={debugLoading}>
                {debugLoading ? "Analyzing..." : "Debug Code"}
              </button>
              {debugResult && <pre className="ai-response">{debugResult}</pre>}
              {debugState?.type === 'debug' && debugState.result && (
                <div className="shared-debug">
                  <small>Shared debug result:</small>
                  <pre>{debugState.result}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat & Participants */}
        <div className="chat-panel">
          {/* Participants List */}
          <div className="participants-section">
            <h4>👥 Collaborators ({participants.length + 1})</h4>
            <ul className="participants-list">
              <li className="participant-item">
                <span className="participant-dot" style={{ backgroundColor: myColor }} />
                <span>{username} (You)</span>
                {isHost && <span className="host-badge">Host</span>}
              </li>
              {participants.map((p) => (
                <li key={p.username} className="participant-item">
                  <span className="participant-dot" style={{ backgroundColor: p.color }} />
                  <span>{p.username}</span>
                  {p.isHost && <span className="host-badge">Host</span>}
                  <span className={`status-dot ${p.isActive ? 'active' : 'idle'}`} />
                </li>
              ))}
            </ul>
            
            {/* Recording Info */}
            {recordingId && (
              <div className="recording-info">
                <small>📹 Last Recording: {recordingId}</small>
              </div>
            )}
          </div>

          {/* Chat */}
          <h3 className="chat-heading">💬 Team Chat</h3>
          <div className="chat-messages">
            {systemMsg && <div className="system-message">{systemMsg}</div>}
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.username === 'You' ? 'own-message' : ''}`}>
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {typingNotification && <p className="typing-notification">{typingNotification}</p>}
          <div className="chat-input-area">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                socket.current.emit("typing", { roomId, username });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>

      {/* Leave Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Leave Session?</h3>
            <p>Are you sure you want to leave this collaboration session?</p>
            <div className="modal-actions">
              <button onClick={leaveRoom} className="modal-btn leave">Yes, Leave</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">Stay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoom;
