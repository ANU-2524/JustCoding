import React, { useState, useEffect } from "react";
import "./PromptHistory.css";

// Demo: Use the same prompts as DailyPrompt
const getAllPrompts = () => [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    key: "prompt_2026_1_28"
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string.",
    example: "Input: 'hello'\nOutput: 'olleh'",
    key: "prompt_2026_1_29"
  },
  {
    title: "FizzBuzz",
    description: "Print numbers 1 to 100. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for both print 'FizzBuzz'.",
    example: "Output: 1, 2, Fizz, 4, Buzz, ...",
    key: "prompt_2026_1_30"
  },
];

const getSubmissionsForPrompt = (key) => {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export default function PromptHistory() {
  const [prompts, setPrompts] = useState(getAllPrompts());
  const [selected, setSelected] = useState(prompts[prompts.length - 1]);
  const [submissions, setSubmissions] = useState(getSubmissionsForPrompt(selected.key));

  useEffect(() => {
    setSubmissions(getSubmissionsForPrompt(selected.key));
  }, [selected]);

  // Sort by votes descending
  const sorted = [...submissions].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="prompt-history-container">
      <h2 className="history-title">Prompt History</h2>
      <div className="history-list">
        {prompts.map((p, idx) => (
          <button
            key={p.key}
            className={`history-prompt-btn${selected.key === p.key ? " selected" : ""}`}
            onClick={() => setSelected(p)}
          >
            <span className="history-prompt-title">{p.title}</span>
            <span className="history-prompt-date">{p.key.replace("prompt_", "").replace(/_/g, "/")}</span>
          </button>
        ))}
      </div>
      <div className="history-prompt-box">
        <h3>{selected.title}</h3>
        <p>{selected.description}</p>
        <pre className="history-example">{selected.example}</pre>
      </div>
      <div className="history-submissions">
        <h4>Top Solutions</h4>
        {sorted.length === 0 && <div className="history-empty">No submissions for this prompt yet.</div>}
        {sorted.map((sub, idx) => (
          <div className="history-sub-card" key={idx}>
            <div className="history-sub-header">
              <span className="history-sub-name">{sub.name}</span>
              <span className="history-sub-votes">▲ {sub.votes || 0}</span>
            </div>
            <pre className="history-sub-solution">{sub.solution}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
