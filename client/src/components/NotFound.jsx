import { Link } from "react-router-dom";
import "../Style/NotFound.css";

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-description">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="navigation-links">
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
          <Link to="/challenges" className="btn-secondary">
            Explore Challenges
          </Link>
          <Link to="/tutorials" className="btn-secondary">
            View Tutorials
          </Link>
        </div>

        <div className="suggestions">
          <h3>Here are some helpful links:</h3>
          <ul>
            <li>
              <Link to="/editor">Code Editor</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/contests">Contests</Link>
            </li>
            <li>
              <Link to="/leaderboard">Leaderboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
