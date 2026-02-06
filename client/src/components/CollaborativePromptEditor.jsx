import React, { useEffect, useRef, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  set
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../firebase"; // ✅ correct import
import "./CollaborativePromptEditor.css";

/**
 * Initialize Firebase services ONCE using shared app
 */
const db = getDatabase(app);
const auth = getAuth(app); // (not used now, but safe for future)

function getRoomId() {
  const today = new Date();
  return `collab_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
}

export default function CollaborativePromptEditor() {
  const [solution, setSolution] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const roomId = getRoomId();

  /* -------- REALTIME SYNC -------- */
  useEffect(() => {
    const solRef = ref(db, `collabRooms/${roomId}/solution`);

    const unsubscribe = onValue(solRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        setSolution(val);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  /* -------- UPDATE SOLUTION -------- */
  const handleSolutionChange = (e) => {
    const value = e.target.value;
    setSolution(value);
    set(ref(db, `collabRooms/${roomId}/solution`), value);
  };

  /* -------- SUBMIT (LOCAL STORAGE DEMO) -------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !solution.trim()) {
      setStatus("Name and solution required.");
      return;
    }

    setSubmitting(true);

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
          onChange={(e) => setName(e.target.value)}
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

        <button
          className="collab-prompt-btn"
          type="submit"
          disabled={submitting}
        >
          Submit Solution
        </button>
      </form>

      <div className="collab-prompt-note">
        <b>Note:</b> All users on this page are editing the same solution in real time.
        Submit to save as a public solution for today.
      </div>
    </div>
  );
}
