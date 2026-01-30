import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaClock, FaUsers } from 'react-icons/fa';
import '../Style/ContestManagement.css';

const ContestManagement = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 120,
    maxParticipants: 100,
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges/contests');
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/challenges/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newContest = await response.json();
        setContests([...contests, newContest]);
        setFormData({ 
          title: '', 
          slug: '', 
          description: '', 
          duration: 120, 
          maxParticipants: 100,
          startTime: '',
          endTime: ''
        });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create contest');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Failed to create contest');
    }
  };

  const handleDelete = async (slug) => {
    if (confirm('Delete this contest?')) {
      try {
        const response = await fetch(`/api/challenges/contests/${slug}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setContests(contests.filter(c => c.slug !== slug));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete contest');
        }
      } catch (error) {
        console.error('Error deleting contest:', error);
        alert('Failed to delete contest');
      }
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
                  type="datetime-local"
                  placeholder="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
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
        {loading ? (
          <p>Loading contests...</p>
        ) : contests.length === 0 ? (
          <p>No contests yet. Create one to get started!</p>
        ) : (
          contests.map(contest => (
            <div key={contest._id} className="contest-card">
              <div className="contest-info">
                <h3>{contest.title}</h3>
                <p>{contest.description}</p>
                <div className="contest-meta">
                  <span><FaClock /> {contest.duration} min</span>
                  <span><FaUsers /> {contest.participants?.length || 0}/{contest.maxParticipants}</span>
                  <span className={`status ${contest.status}`}>{contest.status}</span>
                </div>
              </div>
              <div className="contest-actions">
                <button onClick={() => handleDelete(contest.slug)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContestManagement;