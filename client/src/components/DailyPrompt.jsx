import React, { useState, useEffect } from "react";
import "./DailyPrompt.css";
import PrismHighlight from "./PrismHighlight";
import SolutionComments from "./SolutionComments";

// Demo backend using localStorage for guest persistence
const getTodayKey = () => {
  const today = new Date();
  return `prompt_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
};

const getPromptOfTheDay = () => {
  // In real app, fetch from backend. Here, rotate through a static list.
  const prompts = [
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    },
    {
      title: "Reverse String",
      description: "Write a function that reverses a string.",
      example: "Input: 'hello'\nOutput: 'olleh'",
    },
    {
      title: "FizzBuzz",
      description: "Print numbers 1 to 100. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for both print 'FizzBuzz'.",
      example: "Output: 1, 2, Fizz, 4, Buzz, ...",
    },
  ];
  const dayIndex = Math.floor((new Date().getTime() / (1000 * 60 * 60 * 24)) % prompts.length);
  return prompts[dayIndex];
};

const getSubmissions = () => {
  const key = getTodayKey();
  return JSON.parse(localStorage.getItem(key) || "[]");
};

const saveSubmission = (submission) => {
  const key = getTodayKey();
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(key, JSON.stringify(submissions));
};

const upvoteSubmission = (index) => {
  const key = getTodayKey();
  const submissions = getSubmissions();
  submissions[index].votes = (submissions[index].votes || 0) + 1;
  localStorage.setItem(key, JSON.stringify(submissions));
};

export default function DailyPrompt() {
  const [prompt, setPrompt] = useState(getPromptOfTheDay());
  const [solution, setSolution] = useState("");
  const [submissions, setSubmissions] = useState(getSubmissions());
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPrompt(getPromptOfTheDay());
    setSubmissions(getSubmissions());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!solution.trim() || !name.trim()) {
      setError("Name and solution required.");
      return;
    }
    saveSubmission({ name, solution, votes: 0 });
    setSubmissions(getSubmissions());
    setSolution("");
    setName("");
    setError("");
  };

  const handleUpvote = (idx) => {
    upvoteSubmission(idx);
    setSubmissions(getSubmissions());
  };

  // Sort by votes descending
  const sorted = [...submissions].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="daily-prompt-container">
      <h2 className="prompt-title">Daily Coding Prompt</h2>
      <div className="prompt-box">
        <h3>{prompt.title}</h3>
        <p>{prompt.description}</p>
        <pre className="prompt-example">{prompt.example}</pre>
      </div>
      <form className="prompt-form" onSubmit={handleSubmit}>
        <input
          className="prompt-input"
          type="text"
          placeholder="Your Name (guest)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          className="prompt-textarea"
          placeholder="Your solution (code or explanation)"
          value={solution}
          onChange={e => setSolution(e.target.value)}
          rows={5}
        />
        {error && <div className="prompt-error">{error}</div>}
        <button className="prompt-btn" type="submit">Submit Solution</button>
      </form>
      <div className="prompt-submissions">
        <h4>Public Submissions</h4>
        {sorted.length === 0 && <div className="prompt-empty">No submissions yet. Be the first!</div>}
        {sorted.map((sub, idx) => {
          const origIdx = submissions.indexOf(sub);
          return (
            <div className="prompt-submission-card" key={idx}>
              <div className="prompt-sub-header">
                <span className="prompt-sub-name">{sub.name}</span>
                <button className="prompt-upvote" onClick={() => handleUpvote(origIdx)}>
                  ▲ {sub.votes || 0}
                </button>
              </div>
              <PrismHighlight code={sub.solution} language="javascript" />
              <SolutionComments promptKey={getTodayKey()} solutionIndex={origIdx} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
