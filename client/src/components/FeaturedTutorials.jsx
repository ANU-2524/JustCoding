import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaPlay, FaClock, FaStar, FaChevronRight } from 'react-icons/fa';

const difficultyColors = {
  beginner: '#4caf50',
  intermediate: '#ff9800',
  advanced: '#f44336'
};

const languageColors = {
  javascript: '#f7df1e',
  python: '#3776ab',
  java: '#ed8b00',
  react: '#61dafb',
  general: '#6c757d'
};

function FeaturedTutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedTutorials();
  }, []);

  const fetchFeaturedTutorials = async () => {
    try {
      const response = await fetch('/api/tutorials/featured');
      if (response.ok) {
        const data = await response.json();
        setTutorials(data.slice(0, 3)); // Show only 3 featured tutorials
      }
    } catch (error) {
      console.error('Error fetching featured tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startTutorial = (tutorial) => {
    navigate(`/tutorials/${tutorial.slug}`);
  };

  if (loading || tutorials.length === 0) {
    return null; // Don't render if loading or no tutorials
  }

  return (
    <motion.section
      className="featured-tutorials-section"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2>
            <FaBook className="section-icon" />
            Featured Tutorials
          </h2>
          <p className="section-subtitle">
            Start learning with our handpicked tutorials designed for all skill levels
          </p>
        </motion.div>

        <div className="tutorials-grid">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial._id}
              className="tutorial-card-featured"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="tutorial-thumbnail">
                {tutorial.thumbnailUrl ? (
                  <img src={tutorial.thumbnailUrl} alt={tutorial.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <FaBook className="thumbnail-icon" />
                  </div>
                )}
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

              <div className="tutorial-content">
                <h3 className="tutorial-title">{tutorial.title}</h3>
                <p className="tutorial-description">{tutorial.shortDescription}</p>

                <div className="tutorial-meta">
                  <div className="meta-item">
                    <FaClock className="meta-icon" />
                    <span>{formatDuration(tutorial.estimatedDuration)}</span>
                  </div>
                  <div className="meta-item">
                    <FaStar className="meta-icon" />
                    <span>{tutorial.rating.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  className="start-tutorial-btn"
                  onClick={() => startTutorial(tutorial)}
                >
                  <FaPlay className="btn-icon" />
                  Start Tutorial
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="view-all-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <button
            className="view-all-btn"
            onClick={() => navigate('/tutorials')}
          >
            View All Tutorials
            <FaChevronRight className="btn-arrow" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeaturedTutorials;