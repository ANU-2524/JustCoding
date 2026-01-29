import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import '../Style/Breadcrumb.css';

/**
 * Breadcrumb Navigation Component
 * Displays navigation hierarchy for current page
 * 
 * @param {Array} items - Array of breadcrumb items
 * Example: [
 *   { label: 'Challenges', path: '/challenges' },
 *   { label: 'Two Sum', path: null } // null path means current page
 * ]
 */
const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="breadcrumb-container" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {/* Home Link */}
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link home-link" title="Go to Home">
            <FaHome className="breadcrumb-icon" />
            <span>Home</span>
          </Link>
          {items.length > 0 && <FaChevronRight className="breadcrumb-separator" />}
        </li>

        {/* Dynamic Items */}
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.path ? (
              <>
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
                {index < items.length - 1 && <FaChevronRight className="breadcrumb-separator" />}
              </>
            ) : (
              <>
                <span className="breadcrumb-current">{item.label}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
