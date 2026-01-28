import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  FaBook, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaPlay, 
  FaClock, 
  FaGraduationCap,
  FaCode,
  FaChevronRight,
  FaTimes,
  FaBookmark,
  FaLightbulb,
  FaTrophy,
  FaUser
} from 'react-icons/fa';
import '../Style/TutorialsPage.css';

const difficultyColors = {
  beginner: '#4caf50',
  intermediate: '#ff9800',
  advanced: '#f44336'
};

const categoryIcons = {
  fundamentals: '📚',
  'data-structures': '🏗️',
  algorithms: '🧮',
  'web-development': '🌐',
  backend: '⚙️',
  frontend: '🎨',
  databases: '🗄️',
  devops: '🚀',
  mobile: '📱',
  'machine-learning': '🤖',
  security: '🔒',
  testing: '🧪',
  'design-patterns': '🏛️'
};

const languageColors = {
  javascript: '#f7df1e',
  python: '#3776ab',
  java: '#ed8b00',
  cpp: '#00599c',
  react: '#61dafb',
  node: '#339933',
  general: '#6c757d'
};

function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [userProgress, setUserProgress] = useState({});
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchTutorials();
    fetchCategories();
    if (currentUser) {
      fetchUserProgress();
    }
  }, [currentPage, selectedDifficulty, selectedCategory, selectedLanguage, searchTerm]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLanguage && { language: selectedLanguage }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/tutorials?${params}`);
      const data = await response.json();
      
      setTutorials(data.tutorials);
      setFilteredTutorials(data.tutorials);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tutorials/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/tutorials/user/progress', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });
      const data = await response.json();
      
      // Create a map of tutorial ID to progress
      const progressMap = {};
      data.progress.forEach(p => {
        if (p.tutorialId) {
          progressMap[p.tutorialId._id] = p;
        }
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (filterType, value) => {
    switch (filterType) {
      case 'difficulty':
        setSelectedDifficulty(value === selectedDifficulty ? '' : value);
        break;
      case 'category':
        setSelectedCategory(value === selectedCategory ? '' : value);
        break;
      case 'language':
        setSelectedLanguage(value === selectedLanguage ? '' : value);
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedDifficulty('');
    setSelectedCategory('');
    setSelectedLanguage('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const startTutorial = (tutorial) => {
    navigate(`/tutorials/${tutorial.slug}`);
  };

  const continueTutorial = (tutorial) => {
    navigate(`/tutorials/${tutorial.slug}`);
  };

  const getTutorialProgress = (tutorial) => {
    const progress = userProgress[tutorial._id];
    if (!progress) {
return { percentage: 0, status: 'not-started' };
}
    
    const completed = progress.completedSteps.length;
    const total = tutorial.steps?.length || 1;
    const percentage = Math.round((completed / total) * 100);
    
    if (progress.completedAt) {
return { percentage: 100, status: 'completed' };
}
    if (completed > 0) {
return { percentage, status: 'in-progress' };
}
    return { percentage: 0, status: 'not-started' };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const TutorialCard = ({ tutorial }) => {
    const progress = getTutorialProgress(tutorial);
    
    return (
      <div className={`tutorial-card ${view}`}>
        <div className="tutorial-thumbnail">
          {tutorial.thumbnailUrl ? (
            <img src={tutorial.thumbnailUrl} alt={tutorial.title} />
          ) : (
            <div className="thumbnail-placeholder">
              <FaBook className="thumbnail-icon" />
            </div>
          )}
          <div className="tutorial-overlay">
            <div className="tutorial-badges">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: difficultyColors[tutorial.difficulty] }}
              >
                {tutorial.difficulty}
              </span>
              <span 
                className="language-badge"
                style={{ backgroundColor: languageColors[tutorial.language] }}
              >
                {tutorial.language}
              </span>
            </div>
          </div>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-header">
            <h3 className="tutorial-title">{tutorial.title}</h3>
            <div className="tutorial-meta">
              <div className="tutorial-category">
                <span className="category-icon">
                  {categoryIcons[tutorial.category] || '📖'}
                </span>
                <span>{tutorial.category.replace('-', ' ')}</span>
              </div>
              <div className="tutorial-duration">
                <FaClock className="duration-icon" />
                <span>{formatDuration(tutorial.estimatedDuration)}</span>
              </div>
            </div>
          </div>

          <p className="tutorial-description">{tutorial.shortDescription}</p>

          <div className="tutorial-stats">
            <div className="stat">
              <FaGraduationCap className="stat-icon" />
              <span>{tutorial.completionCount} completed</span>
            </div>
            <div className="stat">
              <FaStar className="stat-icon" />
              <span>{tutorial.rating.toFixed(1)} ({tutorial.ratingCount})</span>
            </div>
          </div>

          {currentUser && progress.status !== 'not-started' && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="progress-text">{progress.percentage}% complete</span>
            </div>
          )}

          <div className="tutorial-actions">
            {currentUser && progress.status === 'completed' ? (
              <button 
                className="tutorial-btn review-btn"
                onClick={() => startTutorial(tutorial)}
              >
                <FaTrophy className="btn-icon" />
                Review
              </button>
            ) : currentUser && progress.status === 'in-progress' ? (
              <button 
                className="tutorial-btn continue-btn"
                onClick={() => continueTutorial(tutorial)}
              >
                <FaPlay className="btn-icon" />
                Continue
              </button>
            ) : (
              <button 
                className="tutorial-btn start-btn"
                onClick={() => startTutorial(tutorial)}
              >
                <FaPlay className="btn-icon" />
                Start Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tutorials-page">
      <div className="tutorials-container">
        {/* Header */}
        <div className="tutorials-header">
          <div className="header-content">
            <h1 className="page-title">
              <FaBook className="title-icon" />
              Interactive Tutorials
            </h1>
            <p className="page-subtitle">
              Learn programming concepts through hands-on tutorials with code examples, 
              interactive exercises, and video lessons.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="tutorials-controls">
          <div className="search-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="filter-icon" />
              Filters
            </button>

            <div className="view-toggle">
              <button 
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                ⊞
              </button>
              <button 
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
                title="List view"
              >
                ≡
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Difficulty</label>
                <div className="filter-options">
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <button
                      key={difficulty}
                      className={`filter-option ${selectedDifficulty === difficulty ? 'active' : ''}`}
                      onClick={() => handleFilter('difficulty', difficulty)}
                      style={{
                        borderColor: selectedDifficulty === difficulty ? difficultyColors[difficulty] : undefined
                      }}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Category</label>
                <div className="filter-options">
                  {categories.categories?.map(cat => (
                    <button
                      key={cat._id}
                      className={`filter-option ${selectedCategory === cat._id ? 'active' : ''}`}
                      onClick={() => handleFilter('category', cat._id)}
                    >
                      {categoryIcons[cat._id] || '📖'} {cat._id.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Language</label>
                <div className="filter-options">
                  {categories.languages?.map(lang => (
                    <button
                      key={lang._id}
                      className={`filter-option ${selectedLanguage === lang._id ? 'active' : ''}`}
                      onClick={() => handleFilter('language', lang._id)}
                      style={{
                        borderColor: selectedLanguage === lang._id ? languageColors[lang._id] : undefined
                      }}
                    >
                      {lang._id}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedDifficulty || selectedCategory || selectedLanguage) && (
                <button className="clear-filters" onClick={clearFilters}>
                  <FaTimes className="clear-icon" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tutorials Grid */}
        <div className="tutorials-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading tutorials...</p>
            </div>
          ) : filteredTutorials.length === 0 ? (
            <div className="empty-state">
              <FaLightbulb className="empty-icon" />
              <h3>No tutorials found</h3>
              <p>Try adjusting your search terms or filters</p>
              {(searchTerm || selectedDifficulty || selectedCategory || selectedLanguage) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`tutorials-grid ${view}`}>
                {filteredTutorials.map(tutorial => (
                  <TutorialCard key={tutorial._id} tutorial={tutorial} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorialsPage;