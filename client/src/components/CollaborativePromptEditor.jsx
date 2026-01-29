import React, { useEffect, useRef, useState } from "react";
import { getDatabase, ref, onValue, set, push, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import "./CollaborativePromptEditor.css";

// Firebase config (replace with your own or use the existing one in firebase.js)
import firebaseConfig from "../firebase";

// Initialize Firebase if not already initialized
if (!window._firebaseInitialized) {
  initializeApp(firebaseConfig);
  window._firebaseInitialized = true;
}

const db = getDatabase();
const auth = getAuth();

function getRoomId() {
  // Use today's date as room id for daily prompt
  const today = new Date();
  return `collab_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
}

export default function CollaborativePromptEditor() {
  const [solution, setSolution] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef();
  const roomId = getRoomId();

  // Sync solution in real time
  useEffect(() => {
    const solRef = ref(db, `collabRooms/${roomId}/solution`);
    const unsub = onValue(solRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && val !== solution) {
        setSolution(val);
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, [roomId]);

  // Update solution in Firebase on change
  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
    set(ref(db, `collabRooms/${roomId}/solution`), e.target.value);
  };

  // Submit solution (push to daily prompt submissions)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !solution.trim()) {
      setStatus("Name and solution required.");
      return;
    }
    setSubmitting(true);
    // Save to localStorage for demo (could also push to Firebase)
    const todayKey = `prompt_${new Date().getFullYear()}_${new Date().getMonth() + 1}_${new Date().getDate()}`;
    const submissions = JSON.parse(localStorage.getItem(todayKey) || "[]");
    submissions.push({ name, solution, votes: 0 });
    localStorage.setItem(todayKey, JSON.stringify(submissions));
    setStatus("Submitted! View on Daily Prompt page.");
    setSubmitting(false);
    setName("");
  };

  return (
    <div className="collab-prompt-editor-container">
      <h2>Collaborative Daily Prompt Solution</h2>
      <form className="collab-prompt-form" onSubmit={handleSubmit}>
        <input
          className="collab-prompt-input"
          type="text"
          placeholder="Your Name (guest)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          ref={textareaRef}
          className="collab-prompt-textarea"
          placeholder="Edit solution here with others in real time..."
          value={solution}
          onChange={handleSolutionChange}
          rows={8}
        />
        {status && <div className="collab-prompt-status">{status}</div>}
        <button className="collab-prompt-btn" type="submit" disabled={submitting}>Submit Solution</button>
      </form>
      <div className="collab-prompt-note">
        <b>Note:</b> All users on this page are editing the same solution in real time. Submit to save as a public solution for today.
      </div>
    </div>
  );
}
