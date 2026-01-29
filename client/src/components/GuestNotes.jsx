import React, { useEffect, useState } from "react";
import './GuestNotes.css';

// Demo backend simulation (replace with real API calls)
function getUserId(currentUser) {
  if (currentUser?.uid) return currentUser.uid;
  let tempId = localStorage.getItem('tempNotesUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempNotesUserId', tempId);
  }
  return tempId;
}

const DEMO_NOTES_KEY = 'notes-demo-backend';

function loadNotes(userId) {
  const all = JSON.parse(localStorage.getItem(DEMO_NOTES_KEY) || '{}');
  return all[userId] || [];
}
function saveNotes(userId, notes) {
  const all = JSON.parse(localStorage.getItem(DEMO_NOTES_KEY) || '{}');
  all[userId] = notes;
  localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(all));
}

export default function GuestNotes({ currentUser }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [form, setForm] = useState({ id: null, title: "", content: "", tags: "" });
  const [editing, setEditing] = useState(false);
  const [rich, setRich] = useState(false);
  const userId = getUserId(currentUser);

  useEffect(() => {
    setNotes(loadNotes(userId));
  }, [userId]);

  useEffect(() => {
    saveNotes(userId, notes);
  }, [notes, userId]);

  const filtered = notes.filter(n =>
    (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())) &&
    (!tagFilter || n.tags.split(',').map(t => t.trim().toLowerCase()).includes(tagFilter.toLowerCase()))
  );

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContentChange = e => {
    setForm({ ...form, content: e.target.value });
  };

  const handleRichContent = e => {
    setForm({ ...form, content: e.target.innerHTML });
  };

  const handleEdit = note => {
    setForm(note);
    setEditing(true);
    setRich(false);
  };

  const handleDelete = id => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (editing) {
      setNotes(notes.map(n => n.id === form.id ? { ...form, tags: form.tags } : n));
    } else {
      setNotes([
        { ...form, id: Date.now(), tags: form.tags },
        ...notes,
      ]);
    }
    setForm({ id: null, title: "", content: "", tags: "" });
    setEditing(false);
    setRich(false);
  };

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags.split(',').map(t => t.trim()).filter(Boolean))));

  return (
    <div className="guest-notes-container">
      <header>
        <h1 className="notes-title">Coding Journal / Notes</h1>
        <div className="notes-controls">
          <input
            className="notes-input"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="notes-input"
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button className="notes-btn primary" onClick={() => { setForm({ id: null, title: "", content: "", tags: "" }); setEditing(false); setRich(false); }}>
            New Note
          </button>
        </div>
      </header>
      <form className="notes-form" onSubmit={handleSubmit}>
        <input
          className="notes-input"
          name="title"
          placeholder="Note Title"
          value={form.title}
          onChange={handleFormChange}
          required
        />
        <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.98rem', color: '#888' }}>
            <input type="checkbox" checked={rich} onChange={e => setRich(e.target.checked)} /> Rich Text
          </label>
          <input
            className="notes-input"
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleFormChange}
          />
        </div>
        {rich ? (
          <div
            className="notes-rich-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={handleRichContent}
            dangerouslySetInnerHTML={{ __html: form.content }}
            style={{ minHeight: 80, border: '1.5px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 1.1rem', background: '#fff', color: '#222', marginBottom: 10 }}
          />
        ) : (
          <textarea
            className="notes-input"
            name="content"
            placeholder="Write your note here..."
            value={form.content}
            onChange={handleContentChange}
            rows={4}
            required
          />
        )}
        <button className="notes-btn primary" type="submit">{editing ? "Update Note" : "Add Note"}</button>
        {editing && (
          <button className="notes-btn" type="button" onClick={() => { setForm({ id: null, title: "", content: "", tags: "" }); setEditing(false); setRich(false); }}>
            Cancel
          </button>
        )}
      </form>
      <div className="notes-list">
        {filtered.length === 0 && <div className="notes-empty">No notes found.</div>}
        {filtered.map(note => (
          <div className="notes-card" key={note.id}>
            <div className="notes-card-header">
              <span className="notes-card-title">{note.title}</span>
              <span className="notes-card-tags">{note.tags}</span>
            </div>
            <div className="notes-card-content" dangerouslySetInnerHTML={{ __html: note.content }} />
            <div className="notes-card-footer">
              <button className="notes-btn" onClick={() => handleEdit(note)}>Edit</button>
              <button className="notes-btn danger" onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
