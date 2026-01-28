import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaClock, FaUsers } from 'react-icons/fa';
import '../Style/ContestManagement.css';

const ContestManagement = () => {
  const [contests, setContests] = useState([
    {
      _id: '1',
      title: 'Weekly Coding Challenge',
      slug: 'weekly-challenge-1',
      description: 'Test your coding skills with algorithmic problems',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      duration: 120,
      maxParticipants: 100,
      participantCount: 45,
      status: 'upcoming'
    },
    {
      _id: '2', 
      title: 'Data Structures Sprint',
      slug: 'ds-sprint-2024',
      description: 'Focus on trees, graphs, and dynamic programming',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 180,
      maxParticipants: 200,
      participantCount: 156,
      status: 'active'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 120,
    maxParticipants: 100
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newContest = {
      _id: Date.now().toString(),
      ...formData,
      startTime: new Date(),
      endTime: new Date(Date.now() + formData.duration * 60 * 1000),
      participantCount: 0,
      status: 'upcoming'
    };
    setContests([...contests, newContest]);
    setFormData({ title: '', slug: '', description: '', duration: 120, maxParticipants: 100 });
    setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this contest?')) {
      setContests(contests.filter(c => c._id !== id));
    }
  };

  return (
    <div className="contest-management">
      <div className="management-header">
        <h1><FaTrophy /> Contest Management</h1>
        <button className="create-btn" onClick={() => setShowCreateForm(true)}>
          <FaPlus /> Create Contest
        </button>
      </div>

      {showCreateForm && (
        <div className="contest-form-modal">
          <div className="contest-form">
            <h2>Create New Contest</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Contest Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Slug (URL-friendly)"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                required
              />
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="30"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Participants"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  min="10"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Create Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="contests-list">
        {contests.map(contest => (
          <div key={contest._id} className="contest-card">
            <div className="contest-info">
              <h3>{contest.title}</h3>
              <p>{contest.description}</p>
              <div className="contest-meta">
                <span><FaClock /> {contest.duration} min</span>
                <span><FaUsers /> {contest.participantCount}/{contest.maxParticipants}</span>
                <span className={`status ${contest.status}`}>{contest.status}</span>
              </div>
            </div>
            <div className="contest-actions">
              <button onClick={() => handleDelete(contest._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContestManagement;