// ✅ LiveRoom with Full Real-Time Collaboration Features
import { useEffect, useState, useRef, useCallback } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { FaCopy, FaPlay, FaSignOutAlt, FaBug, FaMagic, FaUsers, FaVideo, FaCommentAlt, FaTerminal } from 'react-icons/fa';
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
  const username = searchParams.get("user") || `User-${Math.random().toString(36).slice(2, 6)}`;
  const navigate = useNavigate();
  const socket = useRef(null);
  const sessionIdRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false); // Flag to prevent echo

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
  const [myColor, setMyColor] = useState(USER_COLORS[0]);

  const messagesEndRef = useRef(null);


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

    // Code sync - receive code from other users
    socket.current.on("code-update", (newCode) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
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
    socket.current.on("user-joined", ({ username: newUser, color }) => {
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

    // Cursor sharing - receive cursor positions from other users
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

  // Send cursor position
  const sendCursorPosition = useCallback((position, selection) => {
    if (socket.current) {
      socket.current.emit("cursor-move", {
        roomId,
        username,
        position,
        selection,
        color: myColor
      });
    }
  }, [roomId, username, myColor]);

  // Handle code changes - simple broadcast
  const handleCodeChange = useCallback((value, viewUpdate) => {
    // Don't broadcast if this is a remote update
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    setCode(value);

    // Broadcast code to other users
    if (socket.current) {
      socket.current.emit("code-change", { roomId, code: value });
    }

    // Send cursor position
    if (viewUpdate?.state) {
      const selection = viewUpdate.state.selection.main;
      sendCursorPosition(
        selection.head,
        selection.from !== selection.to ? { from: selection.from, to: selection.to } : null
      );
    }
  }, [roomId, sendCursorPosition]);

  // Handle selection/cursor changes
  const handleEditorUpdate = useCallback((viewUpdate) => {
    if (viewUpdate?.state && viewUpdate.selectionSet) {
      const selection = viewUpdate.state.selection.main;
      sendCursorPosition(
        selection.head,
        selection.from !== selection.to ? { from: selection.from, to: selection.to } : null
      );
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
    const codeUpToPosition = code.slice(0, charPosition);
    const lines = codeUpToPosition.split('\n');
    const lineNumber = lines.length - 1;
    const columnNumber = lines[lines.length - 1].length;

    // CodeMirror line height is typically ~19-20px, char width ~7.8px for monospace
    return {
      top: lineNumber * 19 + 4, // +4 for padding
      left: columnNumber * 7.8 + 4 // +4 for padding/gutter
    };
  };


  return (
    <div className="live-room-container">
      {/* Top Bar */}
      <motion.div
        className="top-bar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="room-title">👨‍💻 DevZone: <span>{roomId}</span></h2>

        <div className="top-bar-actions">
          {isRecording && (
            <motion.span
              className="recording-badge"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaVideo /> Recording
            </motion.span>
          )}

          <div className="participant-count">
            <FaUsers /> {participants.length + 1}
          </div>

          <motion.button
            className="share-btn"
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              setSystemMsg('Room ID copied to clipboard!');
              setTimeout(() => setSystemMsg(''), 3000);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaCopy /> {systemMsg === 'Room ID copied to clipboard!' ? 'Copied!' : 'Copy ID'}
          </motion.button>

          <button className="leave-btn" onClick={() => setShowModal(true)}>
            <FaSignOutAlt /> Leave Room
          </button>
        </div>
      </motion.div>

      <div className="main-content">
        {/* Left Panel - Editor */}
        <motion.div
          className="editor-panel"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
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

            <button className="run-btn" onClick={runCode}>
              ▶ Run Code
            </button>

            {isHost && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'recording-active' : ''}
              >
                {isRecording ? '⏹ Stop' : '🔴 Record'}
              </button>
            )}
          </div>

          <div className="editor-wrapper" style={{ position: 'relative' }}>
            <CodeMirror
              ref={editorRef}
              value={code}
              extensions={[getLanguageExtension(language)]}
              theme={eclipse}
              onChange={handleCodeChange}
              onUpdate={handleEditorUpdate}
              minHeight="400px"
            />

            {/* Remote Cursors Overlay */}
            <div className="remote-cursors-overlay">
              <AnimatePresence>
                {Object.entries(remoteCursors).map(([user, cursor]) => {
                  const pos = getCursorPixelPosition(cursor.position);
                  return (
                    <motion.div
                      key={user}
                      className="remote-cursor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* AI sections - unified container */}
          <div className="ai-sections">
            <div className="ai-box outputs">
              <h4><FaTerminal /> Output</h4>
              <textarea
                placeholder="Standard input (stdin)..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <pre className="output-box">{output || 'Execution output will appear here...'}</pre>
            </div>

            <div className="ai-box assistant">
              <h4><FaMagic /> AI Assistant</h4>
              <textarea
                placeholder="Ask anything about this code..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
              <button onClick={explainQuestion} disabled={isExplaining}>
                {isExplaining ? "Analyzing..." : "Ask Assistant"}
              </button>
              {explanation && <div className="ai-response">{explanation}</div>}
            </div>

            <div className="ai-box debug">
              <h4><FaBug /> Debugger</h4>
              <button onClick={debugCode} disabled={debugLoading}>
                {debugLoading ? "Hunting bugs..." : "Analyze Bugs"}
              </button>
              {debugResult && <div className="ai-response">{debugResult}</div>}
              {debugState?.type === 'debug' && debugState.result && (
                <div className="shared-debug">
                  <small>Team Debug Insight:</small>
                  <pre>{debugState.result}</pre>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Sidebar */}
        <motion.div
          className="chat-panel"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Participants List */}
          <div className="participants-section">
            <h4>Online Collaborators</h4>
            <div className="participants-list">
              <div className="participant-item">
                <span className="participant-dot" style={{ backgroundColor: myColor, color: myColor }} />
                <span>{username} (You)</span>
                {isHost && <span className="host-badge">Host</span>}
              </div>
              {participants.map((p) => (
                <div key={p.username} className="participant-item">
                  <span className="participant-dot" style={{ backgroundColor: p.color, color: p.color }} />
                  <span>{p.username}</span>
                  {p.isHost && <span className="host-badge">Host</span>}
                  <span className={`status-dot ${p.isActive ? 'active' : 'idle'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="chat-header">
            <h4><FaCommentAlt /> Team Chat</h4>
          </div>

          <div className="chat-messages">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${msg.username === 'You' ? 'own-message' : ''}`}
                >
                  <strong>{msg.username}</strong>
                  <span>{msg.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {typingNotification && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="typing-notification"
            >
              {typingNotification}
            </motion.p>
          )}

          <div className="chat-input-area">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                socket.current.emit("typing", { roomId, username });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Chat with team..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </motion.div>
      </div>

      {/* Leave Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3>Leave Session?</h3>
              <p>Your work will be saved, but you'll disconnect from the team.</p>
              <div className="modal-actions">
                <button onClick={leaveRoom} className="modal-btn leave">Exit Session</button>
                <button onClick={() => setShowModal(false)} className="modal-btn cancel">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveRoom;
