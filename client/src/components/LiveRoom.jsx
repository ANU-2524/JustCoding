// Updated LiveRoom.jsx with cleaner structure, better alignment and classNames

import React, { useEffect, useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import OpenAIService from './OpenAIService';
import '../Style/LiveRoom.css';

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

const LiveRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("user");
  const navigate = useNavigate();
  const socket = useRef(null);

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

  useEffect(() => {
    socket.current = io("http://localhost:4334");
    socket.current.emit("join-room", { roomId, username });

    socket.current.on("code-update", setCode);
    socket.current.on("receive-chat", ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
      new Audio("/notification.mp3").play().catch(() => {});
    });
    socket.current.on("show-typing", (msg) => {
      setTypingNotification(msg);
      setTimeout(() => setTypingNotification(''), 2000);
    });
    socket.current.on("user-joined", (msg) => {
      setSystemMsg(msg);
      setTimeout(() => setSystemMsg(''), 3000);
    });
    socket.current.on("user-left", (msg) => {
      setSystemMsg(msg);
      setTimeout(() => setSystemMsg(''), 3000);
    });

    return () => socket.current.disconnect();
  }, [roomId, username]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.current.emit("code-change", { roomId, code: value });
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setMessages((prev) => [...prev, { username: "You", message: chatInput }]);
      socket.current.emit("send-chat", { roomId, username, message: chatInput });
      setChatInput('');
    }
  };

  const leaveRoom = () => {
    socket.current.disconnect();
    navigate("/editor");
  };

  const runCode = async () => {
    try {
      const res = await fetch("http://localhost:4334/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: userInput }),
      });
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      setOutput("Error running code.");
    }
  };

  const explainQuestion = async () => {
    if (!questionText.trim()) return;
    setIsExplaining(true);
    const result = await OpenAIService(`Explain this question: ${questionText}`);
    setExplanation(result);
    setIsExplaining(false);
  };

  const debugCode = async () => {
    setDebugLoading(true);
    const result = await OpenAIService(`Debug this code: ${code}\nOutput/Error: ${output}`);
    setDebugResult(result);
    setDebugLoading(false);
  };

  return (
    <div className="live-room-container">
      <div className="top-bar">
        <h2 className="room-title">👨‍💻 DevZone ID: <span>{roomId}</span></h2>
        <button className="leave-btn" onClick={() => setShowModal(true)}>🚪 Leave Room</button>
      </div>

      <div className="main-content">
        <div className="editor-panel">
          <div className="toolbar">
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
                setCode(languages[lang].starter);
              }}>
              {Object.entries(languages).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
            <button onClick={runCode}>▶️ Run</button>
          </div>

          <CodeMirror
            value={code}
            height="300px"
            extensions={[javascript()]}
            theme={eclipse}
            onChange={handleCodeChange}
          />

          <div className="ai-sections">
            <div className="ai-box">
              <h4>❓ Any Ques ...</h4>
              <textarea
                placeholder="Paste question here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
              <button onClick={explainQuestion}>{isExplaining ? "Explaining..." : "Ask AI"}</button>
              {explanation && <p className="ai-response">💡 {explanation}</p>}
            </div>

            <div className="ai-box">
              <h4>🐞 Debug it ...</h4>
              <button onClick={debugCode}>{debugLoading ? "Debugging..." : "Debug"}</button>
              {debugResult && <pre className="ai-response">{debugResult}</pre>}
            </div>

            <div className="ai-box">
              <h4>📤 Output !!</h4>
              <textarea
                placeholder="Enter input..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <pre>{output}</pre>
            </div>
          </div>
        </div>

        <div className="chat-panel">
          <h3 className="chat-heading">Discussion Zone 🤝</h3>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i}><strong>{msg.username}:</strong> {msg.message}</div>
            ))}
          </div>
          {typingNotification && <p className="typing-notification">{typingNotification}</p>}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              socket.current.emit("typing", { roomId, username });
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Drop code or jokes... your call 😄"
          />
          <button onClick={handleSendMessage}>Send  </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Leaving already? 😢</h3>
            <p>Are you sure you want to leave this joyful room?</p>
            <div className="modal-actions">
              <button onClick={leaveRoom} className="modal-btn leave">Yes, I must leave...</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">No, Stay !</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoom;
