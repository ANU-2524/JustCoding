// ✅ Your original imports
import React, { useEffect, useState, useRef } from 'react';
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
  cpp: { name: 'C++', starter: `#include <iostream>
using namespace std;
int main() {
  return 0;
}` },
  java: { name: 'Java', starter: `public class Main {
  public static void main(String[] args) {
    
  }
}` },
  javascript: { name: 'JavaScript', starter: `console.log("Hello World");` },
  typescript: { name: 'TypeScript', starter: `console.log("Hello TypeScript");` },
  c: { name: 'C', starter: `#include <stdio.h>
int main() {
  printf("Hello, World!");
  return 0;
}` },
  go: { name: 'Go', starter: `package main
import "fmt"
func main() {
  fmt.Println("Hello Go")
}` },
  ruby: { name: 'Ruby', starter: `puts "Hello Ruby"` },
  php: { name: 'PHP', starter: `<?php
echo "Hello PHP";` },
  rust: { name: 'Rust', starter: `fn main() {
  println!("Hello Rust");
}` }
};

// Map internal language keys to backend identifiers
const languageMap = {
  javascript: 'javascript',
  typescript: 'javascript', // Backend treats TS same as JS
  python: 'python',
  java: 'java',
  cpp: 'cpp', // Backend identifies C++ as cpp
  c: 'c', // Backend identifies C as c
  go: 'go',
  ruby: 'ruby',
  php: 'php',
  rust: 'rust'
};

const LiveRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("user");
  const navigate = useNavigate();
  const socket = useRef(null);
  const sessionIdRef = useRef(null);

  const [code, setCode] = useState(languages.c.starter); // Changed to C starter code
  const [language, setLanguage] = useState("c"); // Changed to C as default
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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = startSession({ roomId, username });
    touchLastActive();

    // Use a default backend URL if environment variable is not set
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4334";
    socket.current = io(backendUrl);
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

    return () => {
      try {
        socket.current?.disconnect();
      } finally {
        endSession(sessionIdRef.current);
        touchLastActive();
      }
    };
  }, [roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    navigate("/devzone");
  };

  const runCode = async () => {
    try {
      // Map the internal language to backend language identifier
      const backendLanguage = languageMap[language] || language;
      
      // Use the same backend URL as the socket connection
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4334";
      
      // Set initial output to show that compilation is in progress
      setOutput("Compiling and running your code...");
      
      const res = await fetch(`${backendUrl}/compile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ language: backendLanguage, code, stdin: userInput }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      console.error("Error running code:", err);
      setOutput(`Error running code: ${err.message}\n\nMake sure the backend server is running on the correct port.`);
    }
  };

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
};

  // Get the appropriate language extension
  const getLanguageExtension = (lang) => {
    switch(lang) {
      case 'javascript':
      case 'typescript':
        return javascript();
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
      case 'c':
        return cpp(); // Use C++ parser for both C and C++
      case 'go':
        return go();
      case 'php':
        return php();
      case 'rust':
        return rust();
      case 'ruby':
        // For Ruby, we'll use a basic extension since there's no official one
        return javascript(); // Fallback to javascript for Ruby syntax highlighting
      default:
        return javascript();
    }
  };

  return (
    <div className="live-room-container">
      <div className="top-bar">
        <h2 className="room-title">👨‍💻 DevZone Room: <span>{roomId}</span></h2>
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
            <button onClick={runCode}>▶️ Run Code</button>
          </div>

          <CodeMirror
            value={code}
            extensions={[getLanguageExtension(language)]}
            theme={eclipse}
            onChange={handleCodeChange}
            height="300px" /* Fixed height for the editor */
          />

          <div className="ai-sections">
            <div className="ai-box">
              <h4>❓ Ask AI anything</h4>
              <textarea
                placeholder="Paste your question here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
              <button onClick={explainQuestion} disabled={isExplaining}>
                {isExplaining ? "Explaining..." : "Ask AI"}
              </button>
              {explanation && <p className="ai-response">{explanation}</p>}
            </div>

            <div className="ai-box">
              <h4>🐞 Debug Assistant</h4>
              <button onClick={debugCode} disabled={debugLoading}>
                {debugLoading ? "Debugging..." : "Debug Code"}
              </button>
              {debugResult && <pre className="ai-response">{debugResult}</pre>}
            </div>

            <div className="ai-box">
              <h4>📤 Code Output</h4>
              <textarea
                placeholder="Enter input for your program..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <pre className="ai-response">{output}</pre>
            </div>
          </div>
        </div>

        <div className="chat-panel">
          <h3 className="chat-heading">Team Discussion 💬</h3>
          <div className="chat-messages">
            {systemMsg && <div className="system-message"><strong>System:</strong> {systemMsg}</div>}
            {messages.map((msg, i) => (
              <div key={i} className="message">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <p className="typing-notification">{typingNotification}</p>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              socket.current.emit("typing", { roomId, username });
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Chat with your team... 🚀"
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Leaving already? 😢</h3>
            <p>Are you sure you want to leave this awesome collaboration session?</p>
            <div className="modal-actions">
              <button onClick={leaveRoom} className="modal-btn leave">Yes, I must go</button>
              <button onClick={() => setShowModal(false)} className="modal-btn cancel">No, stay!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoom;