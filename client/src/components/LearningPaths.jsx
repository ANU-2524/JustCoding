import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
  FaRoad, 
  FaCheckCircle, 
  FaCircle, 
  FaLock, 
  FaStar, 
  FaClock, 
  FaGraduationCap,
  FaChevronRight,
  FaArrowRight,
  FaPlay,
  FaBook,
  FaLightbulb,
  FaTrophy,
  FaCode
} from 'react-icons/fa';
import '../Style/LearningPaths.css';

const LearningPaths = () => {
  const { pathId } = useParams();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [paths, setPaths] = useState([]);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [userProgress, setUserProgress] = useState({});

  const languages = [
    { value: 'all', label: 'All Languages', icon: '🌐' },
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'node', label: 'Node.js', icon: '📦' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: '#4caf50', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', color: '#ff9800', icon: '🔥' },
    { value: 'advanced', label: 'Advanced', color: '#f44336', icon: '🚀' }
  ];

  useEffect(() => {
    fetchLearningPaths();
  }, [selectedLanguage, selectedDifficulty]);

  useEffect(() => {
    if (pathId && paths.length > 0) {
      const path = paths.find(p => p._id === pathId);
      setSelectedPath(path);
    }
  }, [pathId, paths]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedLanguage !== 'all') queryParams.append('language', selectedLanguage);
      queryParams.append('difficulty', selectedDifficulty);

      const response = await fetch(`${API_BASE}/api/tutorials/learning-paths?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch learning paths');
      
      const data = await response.json();
      setPaths(data);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (tutorials) => {
    if (!tutorials || tutorials.length === 0) return 0;
    const completed = tutorials.filter(t => userProgress[t._id]?.completed).length;
    return Math.round((completed / tutorials.length) * 100);
  };

  const isPrerequisiteMet = (tutorial) => {
    if (!tutorial.prerequisites || tutorial.prerequisites.length === 0) return true;
    return tutorial.prerequisites.every(prereq => userProgress[prereq._id]?.completed);
  };

  const startTutorial = (slug) => {
    navigate(`/tutorials/${slug}`);
  };

  const viewPathDetails = (pathId) => {
    navigate(`/learning-paths/${pathId}`);
  };

  if (loading) {
    return (
      <div className={`learning-paths ${theme}`}>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading learning paths...</p>
        </div>
      </div>
    );
  }

  if (pathId && selectedPath) {
    return (
      <div className={`learning-paths ${theme}`}>
        <div className="paths-container">
          <button className="back-btn" onClick={() => navigate('/learning-paths')}>
            <FaArrowRight style={{ transform: 'rotate(180deg)' }} /> Back to All Paths
          </button>

          <div className="path-detail-header">
            <div className="path-title-section">
              <FaRoad className="path-icon" />
              <h1>{selectedPath.title} Learning Path</h1>
            </div>
            <div className="path-meta">
              <span className="difficulty-badge" style={{ background: difficulties.find(d => d.value === selectedPath.difficulty)?.color }}>
                {difficulties.find(d => d.value === selectedPath.difficulty)?.icon} {selectedPath.difficulty}
              </span>
              <span className="language-badge">
                {languages.find(l => l.value === selectedPath.language)?.icon} {selectedPath.language}
              </span>
              <span className="duration">
                <FaClock /> {selectedPath.estimatedDuration || '2-3 hours'}
              </span>
            </div>
            <p className="path-description">{selectedPath.description}</p>
            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${calculateProgress([selectedPath])}%` }}></div>
              </div>
              <span className="progress-text">{calculateProgress([selectedPath])}% Complete</span>
            </div>
          </div>

          <div className="roadmap">
            <div className="roadmap-line"></div>
            <div className="roadmap-steps">
              {[selectedPath, ...(selectedPath.nextTutorials || [])].map((tutorial, index) => {
                const isCompleted = userProgress[tutorial._id]?.completed;
                const isLocked = !isPrerequisiteMet(tutorial);
                const isCurrent = index === 0;

                return (
                  <div key={tutorial._id} className={`roadmap-step ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-number">
                      {isCompleted ? <FaCheckCircle /> : isLocked ? <FaLock /> : <FaCircle />}
                    </div>
                    <div className="step-content">
                      <div className="step-header">
                        <h3>Step {index + 1}: {tutorial.title}</h3>
                        <span className="step-duration">
                          <FaClock /> {tutorial.estimatedDuration || '30 min'}
                        </span>
                      </div>
                      <p className="step-description">{tutorial.description}</p>
                      <div className="step-tags">
                        {tutorial.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                      {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                        <div className="prerequisites">
                          <FaLightbulb /> Prerequisites: {tutorial.prerequisites.map(p => p.title).join(', ')}
                        </div>
                      )}
                      <button 
                        className={`step-action-btn ${isLocked ? 'disabled' : ''}`}
                        onClick={() => !isLocked && startTutorial(tutorial.slug)}
                        disabled={isLocked}
                      >
                        {isCompleted ? (
                          <><FaCheckCircle /> Review</>
                        ) : isLocked ? (
                          <><FaLock /> Locked</>
                        ) : (
                          <><FaPlay /> {isCurrent ? 'Continue' : 'Start'}</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`learning-paths ${theme}`}>
      <div className="paths-container">
        <div className="paths-header">
          <div className="header-content">
            <FaRoad className="header-icon" />
            <div className="header-text">
              <h1>Learning Paths</h1>
              <p>Structured roadmaps to master programming skills step by step</p>
            </div>
          </div>
        </div>

        <div className="paths-filters">
          <div className="filter-group">
            <label>Language</label>
            <div className="language-pills">
              {languages.map(lang => (
                <button
                  key={lang.value}
                  className={`pill ${selectedLanguage === lang.value ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage(lang.value)}
                >
                  {lang.icon} {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <div className="difficulty-pills">
              {difficulties.map(diff => (
                <button
                  key={diff.value}
                  className={`pill ${selectedDifficulty === diff.value ? 'active' : ''}`}
                  style={selectedDifficulty === diff.value ? { background: diff.color } : {}}
                  onClick={() => setSelectedDifficulty(diff.value)}
                >
                  {diff.icon} {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {paths.length === 0 ? (
          <div className="empty-state">
            <FaRoad className="empty-icon" />
            <h3>No Learning Paths Found</h3>
            <p>Try adjusting your filters to see available paths</p>
          </div>
        ) : (
          <div className="paths-grid">
            {paths.map((path, index) => {
              const progress = calculateProgress([path]);
              const nextTutorials = path.nextTutorials?.length || 0;
              const totalSteps = 1 + nextTutorials;

              return (
                <div key={path._id} className="path-card">
                  <div className="card-header">
                    <div className="path-number">Path {index + 1}</div>
                    <div className="path-badges">
                      <span className="difficulty-badge" style={{ background: difficulties.find(d => d.value === path.difficulty)?.color }}>
                        {difficulties.find(d => d.value === path.difficulty)?.icon}
                      </span>
                      <span className="language-badge">
                        {languages.find(l => l.value === path.language)?.icon}
                      </span>
                    </div>
                  </div>

                  <h3 className="path-title">{path.title}</h3>
                  <p className="path-description">{path.description}</p>

                  <div className="path-stats">
                    <div className="stat">
                      <FaBook />
                      <span>{totalSteps} Steps</span>
                    </div>
                    <div className="stat">
                      <FaClock />
                      <span>{path.estimatedDuration || '2-3 hours'}</span>
                    </div>
                    <div className="stat">
                      <FaStar />
                      <span>{path.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{progress}% Complete</span>
                  </div>

                  <div className="path-preview">
                    <h4>Path Overview:</h4>
                    <ul className="preview-steps">
                      <li className="preview-step">
                        <FaCircle className="step-dot" />
                        <span>{path.title}</span>
                      </li>
                      {path.nextTutorials?.slice(0, 2).map(next => (
                        <li key={next._id} className="preview-step">
                          <FaCircle className="step-dot" />
                          <span>{next.title}</span>
                        </li>
                      ))}
                      {nextTutorials > 2 && (
                        <li className="preview-step more">
                          <span>+{nextTutorials - 2} more steps</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button 
                    className="start-path-btn"
                    onClick={() => viewPathDetails(path._id)}
                  >
                    {progress > 0 ? (
                      <><FaPlay /> Continue Path</>
                    ) : (
                      <><FaRoad /> Start Path</>
                    )}
                    <FaChevronRight />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPaths;
