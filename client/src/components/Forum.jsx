import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);


  const SAMPLE_THREADS = [
    {
      _id: "1",
      title: "How do I debug async code in JavaScript?",
      author: { username: "Alice" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      postCount: 5,
    },
    {
      _id: "2",
      title: "Best practices for MongoDB schema design?",
      author: { username: "Bob" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      postCount: 3,
    },
    {
      _id: "3",
      title: "Showcase your favorite CSS tricks!",
      author: { username: "Charlie" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      postCount: 7,
    },
    {
      _id: "4",
      title: "How to optimize React performance?",
      author: { username: "Diana" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      postCount: 2,
    },
    {
      _id: "5",
      title: "Tips for learning TypeScript fast?",
      author: { username: "Eve" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      postCount: 4,
    },
    {
      _id: "6",
      title: "What are the best VSCode extensions?",
      author: { username: "Frank" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      postCount: 6,
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/forum/threads`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setThreads(data);
        } else {
          setThreads(SAMPLE_THREADS);
        }
      })
      .catch(() => {
        setError("Could not load threads");
        setThreads(SAMPLE_THREADS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Simulate creating a thread on mount if none exist (for demo)
  useEffect(() => {
    if (threads.length === 0) {
      setThreads([{
        _id: String(Date.now()),
        title: "Welcome to the forum! Introduce yourself.",
        author: { username: "Admin" },
        createdAt: new Date().toISOString(),
        postCount: 1,
      }, ...SAMPLE_THREADS]);
    }
    // eslint-disable-next-line
  }, [loading]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/forum/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to create thread");
      const thread = await res.json();
      setThreads([thread, ...threads]);
      setNewTitle("");
      setNewContent("");
    } catch {
      alert("Error creating thread");
    }
    setCreating(false);
  };

  return (
    <div style={{maxWidth:900,margin:'6rem auto 3rem auto',padding:24,background:'#18181b',borderRadius:12,color:'#f3f4f6'}}>
      <h1 style={{color:'#a5b4fc',marginBottom:24}}>Discussion Forum</h1>
      <div style={{marginBottom:32}}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Thread title"
          style={{padding:8,width:'60%',marginRight:8,borderRadius:4,border:'1px solid #333'}}
        />
        <button onClick={handleCreate} disabled={creating || !newTitle} style={{padding:'8px 16px',background:'#6366f1',color:'#fff',border:'none',borderRadius:4}}>
          {creating ? "Creating..." : "Create Thread"}
        </button>
      </div>
      {loading ? <div>Loading threads...</div>
        : (
          <>
            <div>
              {threads.length === 0 ? <div>No threads yet.</div> : (
                <ul style={{listStyle:'none',padding:0}}>
                  {threads.map(thread => (
                    <li key={thread._id} style={{marginBottom:18,padding:16,background:'#232336',borderRadius:8}}>
                      <Link to={`/forum/thread/${thread._id}`} style={{color:'#a5b4fc',fontSize:20,textDecoration:'none'}}>{thread.title}</Link>
                      <div style={{fontSize:14,marginTop:4}}>By {thread.author?.username || 'User'} | {new Date(thread.createdAt).toLocaleString()}</div>
                      <div style={{fontSize:13,marginTop:2}}>Posts: {thread.postCount}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
    </div>
  );
};

export default Forum;
