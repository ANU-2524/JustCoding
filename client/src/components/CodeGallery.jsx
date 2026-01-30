import React, { useEffect, useState } from "react";
import './CodeGallery.css';

// Demo data for public snippets (replace with API later)
const DEMO_SNIPPETS = [
  {
    id: 1,
    title: "FizzBuzz in Python",
    code: "for i in range(1, 101):\n    print('Fizz'*(i%3==0)+'Buzz'*(i%5==0) or i)",
    language: "Python",
    author: "Guest",
  },
  {
    id: 2,
    title: "Hello World (JS)",
    code: "console.log('Hello, world!');",
    language: "JavaScript",
    author: "Ayaanshaikh12243",
  },
  {
    id: 3,
    title: "Factorial (C++)",
    code: "int fact(int n){ return n<=1?1:n*fact(n-1); }",
    language: "C++",
    author: "Guest",
  },
];

function getUserId() {
  let tempId = localStorage.getItem('tempGalleryUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempGalleryUserId', tempId);
  }
  return tempId;
}

export default function CodeGallery() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", language: "", author: "" });

  useEffect(() => {
    // Replace with API fetch
    setSnippets(DEMO_SNIPPETS);
  }, []);

  const filtered = snippets.filter(s =>
    (!search || s.title.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())) &&
    (!language || s.language === language)
  );

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim() || !form.language.trim()) return;
    setSnippets([
      {
        ...form,
        id: Date.now(),
        author: getUserId(),
      },
      ...snippets,
    ]);
    setForm({ title: "", code: "", language: "", author: "" });
    setShowForm(false);
  };

  return (
    <div className="code-gallery-container">
      <header>
        <h1 className="gallery-title">Public Code Gallery</h1>
        <div className="gallery-controls">
          <input
            className="gallery-input"
            type="text"
            placeholder="Search by title or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="gallery-input"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="C++">C++</option>
            <option value="Java">Java</option>
            <option value="Other">Other</option>
          </select>
          <button className="gallery-btn primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? "Cancel" : "Submit a Snippet"}
          </button>
        </div>
      </header>
      {showForm && (
        <form className="gallery-form" onSubmit={handleSubmit}>
          <input
            className="gallery-input"
            name="title"
            placeholder="Snippet Title"
            value={form.title}
            onChange={handleFormChange}
            required
          />
          <textarea
            className="gallery-input"
            name="code"
            placeholder="Paste your code here..."
            value={form.code}
            onChange={handleFormChange}
            rows={4}
            required
          />
          <select
            className="gallery-input"
            name="language"
            value={form.language}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Language</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="C++">C++</option>
            <option value="Java">Java</option>
            <option value="Other">Other</option>
          </select>
          <button className="gallery-btn primary" type="submit">Share Snippet</button>
        </form>
      )}
      <div className="gallery-list">
        {filtered.length === 0 && <div className="gallery-empty">No snippets found.</div>}
        {filtered.map(snippet => (
          <div className="gallery-card" key={snippet.id}>
            <div className="gallery-card-header">
              <span className="gallery-card-title">{snippet.title}</span>
              <span className="gallery-card-lang">{snippet.language}</span>
            </div>
            <pre className="gallery-card-code"><code>{snippet.code}</code></pre>
            <div className="gallery-card-footer">
              <span className="gallery-card-author">{snippet.author.startsWith('guest-') ? 'Guest' : snippet.author}</span>
              <button className="gallery-btn" onClick={() => handleCopy(snippet.code)}>Copy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
