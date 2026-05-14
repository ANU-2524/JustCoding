import React, { useState } from 'react';
import { FaGlobe, FaLink, FaGithub, FaLinkedin, FaTwitter, FaPalette, FaEye, FaEyeSlash, FaBriefcase, FaProjectDiagram, FaPlus, FaTrash } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const PortfolioTab = ({ profile, tempPhoto, handleInputChange, handlePhotoChange, handleSave, handleCancel, isEditing, setIsEditing }) => {
  const [portfolioPreview, setPortfolioPreview] = useState(false);
  const [projects, setProjects] = useState([
    // Sample projects data
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/user/ecommerce',
      liveUrl: 'https://ecommerce-demo.com',
      date: '2023'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Collaborative task management application with real-time updates',
      technologies: ['React', 'Firebase', 'WebSocket'],
      githubUrl: 'https://github.com/user/task-manager',
      date: '2023'
    }
  ]);
  
  const [experiences, setExperiences] = useState([
    // Sample experience data
    {
      id: 1,
      company: 'Tech Solutions Inc.',
      position: 'Frontend Developer',
      duration: 'Jan 2022 - Present',
      description: 'Developed responsive web applications using React and modern JavaScript frameworks.'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'Junior Developer',
      duration: 'Jun 2020 - Dec 2021',
      description: 'Built and maintained web applications, collaborated with design teams.'
    }
  ]);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    date: new Date().getFullYear().toString()
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    duration: '',
    description: ''
  });

  const portfolioUrl = `${window.location.origin}/portfolio/${profile.displayName}`;

  const togglePreview = () => {
    setPortfolioPreview(!portfolioPreview);
  };

  const handleAddProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      const projectToAdd = {
        ...newProject,
        id: Date.now(),
        technologies: newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };
      setProjects([...projects, projectToAdd]);
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        date: new Date().getFullYear().toString()
      });
    }
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleAddExperience = () => {
    if (newExperience.company.trim() && newExperience.position.trim()) {
      const experienceToAdd = {
        ...newExperience,
        id: Date.now()
      };
      setExperiences([...experiences, experienceToAdd]);
      setNewExperience({
        company: '',
        position: '',
        duration: '',
        description: ''
      });
    }
  };

  const handleDeleteExperience = (id) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Portfolio Builder</h2>
        <p>Create and customize your public coding portfolio</p>
      </div>

      <div className="portfolio-grid">
        <div className="portfolio-main-content">
          {/* Portfolio Settings */}
          <div className="settings-card">
            <h3><FaPalette /> Portfolio Settings</h3>
            
            <div className="portfolio-settings">
              <div className="setting-item">
                <div className="toggle-label">
                  <span>Make Portfolio Public</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="portfolioPublic"
                      checked={profile.portfolioPublic}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              
              {profile.portfolioPublic && (
                <div className="setting-item">
                  <div className="url-display">
                    <FaLink />
                    <span>{portfolioUrl}</span>
                    <button 
                      className="btn-small secondary"
                      onClick={() => navigator.clipboard.writeText(portfolioUrl)}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="textarea-field"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={profile.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={profile.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="websiteUrl"
                value={profile.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="input-field"
              />
            </div>

            <div className="portfolio-actions">
              <button onClick={handleSave} className="btn-primary">
                Save Changes
              </button>
              <button onClick={togglePreview} className="btn-secondary">
                {portfolioPreview ? <><FaEyeSlash /> Hide Preview</> : <><FaEye /> Preview Portfolio</>}
              </button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="portfolio-section-card">
            <div className="section-header">
              <h3><FaProjectDiagram /> Projects</h3>
              <button 
                onClick={() => document.getElementById('project-form').scrollIntoView({behavior: 'smooth'})}
                className="btn-small primary"
              >
                <FaPlus /> Add Project
              </button>
            </div>
            
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4>{project.title}</h4>
                    <span className="project-date">{project.date}</span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <FaGlobe /> Live Demo
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="btn-icon btn-danger project-delete"
                    title="Delete Project"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              
              {projects.length === 0 && (
                <div className="empty-state">
                  <FaProjectDiagram className="empty-icon" />
                  <p>No projects added yet</p>
                </div>
              )}
            </div>
            
            {/* Add Project Form */}
            <div id="project-form" className="add-project-form">
              <h4>Add New Project</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="Project name"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    value={newProject.date}
                    onChange={(e) => setNewProject({...newProject, date: e.target.value})}
                    placeholder="2023"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe your project..."
                  className="textarea-field"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                  className="input-field"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                    placeholder="https://github.com/user/project"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                    placeholder="https://project-demo.com"
                    className="input-field"
                  />
                </div>
              </div>
              <button onClick={handleAddProject} className="btn-primary">
                <FaPlus /> Add Project
              </button>
            </div>
          </div>

          {/* Experience Section */}
          <div className="portfolio-section-card">
            <div className="section-header">
              <h3><FaBriefcase /> Work Experience</h3>
              <button 
                onClick={() => document.getElementById('experience-form').scrollIntoView({behavior: 'smooth'})}
                className="btn-small primary"
              >
                <FaPlus /> Add Experience
              </button>
            </div>
            
            <div className="experiences-list">
              {experiences.map(experience => (
                <div key={experience.id} className="experience-card">
                  <div className="experience-header">
                    <div>
                      <h4>{experience.position}</h4>
                      <h5>{experience.company}</h5>
                    </div>
                    <span className="experience-duration">{experience.duration}</span>
                  </div>
                  <p className="experience-description">{experience.description}</p>
                  <button 
                    onClick={() => handleDeleteExperience(experience.id)}
                    className="btn-icon btn-danger experience-delete"
                    title="Delete Experience"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              
              {experiences.length === 0 && (
                <div className="empty-state">
                  <FaBriefcase className="empty-icon" />
                  <p>No work experience added yet</p>
                </div>
              )}
            </div>
            
            {/* Add Experience Form */}
            <div id="experience-form" className="add-experience-form">
              <h4>Add Work Experience</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                    placeholder="Job title"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                    placeholder="Company name"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                    placeholder="Jan 2020 - Present"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your responsibilities and achievements..."
                  className="textarea-field"
                  rows="3"
                />
              </div>
              <button onClick={handleAddExperience} className="btn-primary">
                <FaPlus /> Add Experience
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Preview - Right Side */}
        {portfolioPreview && (
          <div className="portfolio-preview-sidebar">
            <div className="portfolio-preview-card">
              <h3><FaGlobe /> Portfolio Preview</h3>
              <div className="portfolio-preview-content">
                <div className="preview-header">
                  <img 
                    src={tempPhoto || profile.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    className="preview-avatar"
                  />
                  <div className="preview-info">
                    <h2>{profile.displayName}</h2>
                    <p>{profile.bio || 'No bio provided'}</p>
                    <div className="preview-links">
                      {profile.githubUrl && (
                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                          <FaGithub />
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <FaLinkedin />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <FaGlobe />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="preview-section">
                  <h4>Projects</h4>
                  {projects.length > 0 ? (
                    <div className="preview-projects">
                      {projects.slice(0, 2).map(project => (
                        <div key={project.id} className="preview-project">
                          <h5>{project.title} ({project.date})</h5>
                          <p>{project.description.substring(0, 100)}...</p>
                          <div className="preview-tech">
                            {project.technologies.slice(0, 3).map((tech, index) => (
                              <span key={index} className="preview-tech-tag">{tech}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {projects.length > 2 && (
                        <p className="more-indicator">+{projects.length - 2} more projects</p>
                      )}
                    </div>
                  ) : (
                    <p className="stat-description">No projects added yet</p>
                  )}
                </div>
                
                <div className="preview-section">
                  <h4>Work Experience</h4>
                  {experiences.length > 0 ? (
                    <div className="preview-experiences">
                      {experiences.slice(0, 2).map(experience => (
                        <div key={experience.id} className="preview-experience">
                          <h5>{experience.position}</h5>
                          <h6>{experience.company} • {experience.duration}</h6>
                          <p>{experience.description.substring(0, 100)}...</p>
                        </div>
                      ))}
                      {experiences.length > 2 && (
                        <p className="more-indicator">+{experiences.length - 2} more experiences</p>
                      )}
                    </div>
                  ) : (
                    <p className="stat-description">No work experience added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Tips */}
      <div className="portfolio-tips">
        <h3>Tips for a Great Portfolio</h3>
        <ul>
          <li>Keep your bio concise and professional</li>
          <li>Include links to your GitHub and LinkedIn profiles</li>
          <li>Showcase your best projects with descriptions</li>
          <li>Highlight relevant work experience</li>
          <li>List technologies you're proficient in</li>
          <li>Regularly update with new projects and experiences</li>
          <li>Make it public to share with potential employers</li>
        </ul>
      </div>
    </div>
  );
};

export default PortfolioTab;