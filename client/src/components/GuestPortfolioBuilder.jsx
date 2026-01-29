import React, { useState, useEffect } from 'react';
import './GuestPortfolioBuilder.css';

// Utility to get or create a temp user ID for guests
function getUserId(currentUser) {
  if (currentUser?.uid) return currentUser.uid;
  let tempId = localStorage.getItem('tempPortfolioUserId');
  if (!tempId) {
    tempId = 'guest-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('tempPortfolioUserId', tempId);
  }
  return tempId;
}

const defaultPortfolio = {
  bio: '',
  skills: [],
  projects: [],
};

export default function GuestPortfolioBuilder({ currentUser }) {
  const [portfolio, setPortfolio] = useState(defaultPortfolio);
  const [editingBio, setEditingBio] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '', image: '' });
  const [editingProjectIdx, setEditingProjectIdx] = useState(null);

  // Load portfolio from localStorage
  useEffect(() => {
    const userId = getUserId(currentUser);
    const saved = localStorage.getItem('portfolio-' + userId);
    if (saved) setPortfolio(JSON.parse(saved));
  }, [currentUser]);

  // Save portfolio to localStorage
  useEffect(() => {
    const userId = getUserId(currentUser);
    localStorage.setItem('portfolio-' + userId, JSON.stringify(portfolio));
  }, [portfolio, currentUser]);

  // Handlers
  const handleBioSave = () => setEditingBio(false);
  const handleAddSkill = () => {
    if (newSkill.trim() && !portfolio.skills.includes(newSkill.trim())) {
      setPortfolio({ ...portfolio, skills: [...portfolio.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };
  const handleRemoveSkill = (skill) => {
    setPortfolio({ ...portfolio, skills: portfolio.skills.filter(s => s !== skill) });
  };
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm({ ...projectForm, [name]: value });
  };
  const handleAddOrEditProject = () => {
    if (!projectForm.title.trim()) return;
    let projects = [...portfolio.projects];
    if (editingProjectIdx !== null) {
      projects[editingProjectIdx] = { ...projectForm };
    } else {
      projects.push({ ...projectForm });
    }
    setPortfolio({ ...portfolio, projects });
    setProjectForm({ title: '', description: '', link: '', image: '' });
    setEditingProjectIdx(null);
  };
  const handleEditProject = (idx) => {
    setProjectForm({ ...portfolio.projects[idx] });
    setEditingProjectIdx(idx);
  };
  const handleRemoveProject = (idx) => {
    setPortfolio({ ...portfolio, projects: portfolio.projects.filter((_, i) => i !== idx) });
  };

  return (
    <div className="portfolio-builder-container">
      <header>
        <h1 className="portfolio-title">Portfolio Builder</h1>
      </header>
      <section className="portfolio-section bio-section">
        <h2 style={{fontWeight:600, fontSize:'1.3rem', marginBottom:'1.1rem'}}>Bio</h2>
        <hr style={{margin:'-0.5rem 0 1.2rem 0', border:'none', borderTop:'1.5px solid #e2e8f0'}} />
        {editingBio ? (
          <>
            <textarea
              className="portfolio-bio-input"
              value={portfolio.bio}
              onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself..."
            />
            <button className="portfolio-btn primary" onClick={handleBioSave}>Save Bio</button>
          </>
        ) : (
          <div className="portfolio-bio-display">
            <p>{portfolio.bio || 'No bio yet. Click edit to add one.'}</p>
            <button className="portfolio-btn" onClick={() => setEditingBio(true)}>Edit Bio</button>
          </div>
        )}
      </section>
      <section className="portfolio-section skills-section">
        <h2 style={{fontWeight:600, fontSize:'1.3rem', marginBottom:'1.1rem'}}>Skills</h2>
        <hr style={{margin:'-0.5rem 0 1.2rem 0', border:'none', borderTop:'1.5px solid #e2e8f0'}} />
        <div className="skills-list">
          {portfolio.skills.map(skill => (
            <span className="skill-chip" key={skill}>
              {skill}
              <button className="remove-skill-btn" onClick={() => handleRemoveSkill(skill)}>&times;</button>
            </span>
          ))}
        </div>
        <div className="add-skill-row">
          <input
            className="portfolio-input"
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
          />
          <button className="portfolio-btn" onClick={handleAddSkill}>Add</button>
        </div>
      </section>
      <section className="portfolio-section projects-section">
        <h2 style={{fontWeight:600, fontSize:'1.3rem', marginBottom:'1.1rem'}}>Projects</h2>
        <hr style={{margin:'-0.5rem 0 1.2rem 0', border:'none', borderTop:'1.5px solid #e2e8f0'}} />
        <div className="projects-list">
          {portfolio.projects.map((proj, idx) => (
            <div className="project-card" key={idx}>
              {proj.image && <img src={proj.image} alt="Project" className="project-image" />}
              <div className="project-info">
                <h3>{proj.title}</h3>
                <p>{proj.description}</p>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer">View Project</a>}
              </div>
              <div className="project-actions">
                <button className="portfolio-btn" onClick={() => handleEditProject(idx)}>Edit</button>
                <button className="portfolio-btn danger" onClick={() => handleRemoveProject(idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="project-form">
          <h3 style={{fontWeight:600, fontSize:'1.1rem', marginBottom:'0.7rem'}}>{editingProjectIdx !== null ? 'Edit Project' : 'Add Project'}</h3>
          <input
            className="portfolio-input"
            type="text"
            name="title"
            value={projectForm.title}
            onChange={handleProjectFormChange}
            placeholder="Project Title"
          />
          <textarea
            className="portfolio-input"
            name="description"
            value={projectForm.description}
            onChange={handleProjectFormChange}
            placeholder="Project Description"
            rows={2}
          />
          <input
            className="portfolio-input"
            type="text"
            name="link"
            value={projectForm.link}
            onChange={handleProjectFormChange}
            placeholder="Project Link (optional)"
          />
          <input
            className="portfolio-input"
            type="text"
            name="image"
            value={projectForm.image}
            onChange={handleProjectFormChange}
            placeholder="Image URL (optional)"
          />
          <button className="portfolio-btn primary" onClick={handleAddOrEditProject}>
            {editingProjectIdx !== null ? 'Update Project' : 'Add Project'}
          </button>
          {editingProjectIdx !== null && (
            <button className="portfolio-btn" onClick={() => { setProjectForm({ title: '', description: '', link: '', image: '' }); setEditingProjectIdx(null); }}>
              Cancel
            </button>
          )}
        </div>
      </section>
      <section className="portfolio-section preview-section">
        <h2 style={{fontWeight:600, fontSize:'1.3rem', marginBottom:'1.1rem'}}>Live Preview</h2>
        <hr style={{margin:'-0.5rem 0 1.2rem 0', border:'none', borderTop:'1.5px solid #e2e8f0'}} />
        <div className="portfolio-preview">
          <h3>Bio</h3>
          <p>{portfolio.bio || 'No bio yet.'}</p>
          <h3>Skills</h3>
          <div className="skills-list">
            {portfolio.skills.map(skill => (
              <span className="skill-chip" key={skill}>{skill}</span>
            ))}
          </div>
          <h3>Projects</h3>
          <div className="projects-list">
            {portfolio.projects.map((proj, idx) => (
              <div className="project-card preview" key={idx}>
                {proj.image && <img src={proj.image} alt="Project" className="project-image" />}
                <div className="project-info">
                  <h4>{proj.title}</h4>
                  <p>{proj.description}</p>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer">View Project</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
