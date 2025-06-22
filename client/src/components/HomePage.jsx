// src/pages/HomePage.jsx
import React from "react";
import "../Style/HomePage.css";
import { FaArrowRight, FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="glass-box"> 
       <h1 className="title">
  <span className="gradient-text">JustCoding...</span>
  <span className="emoji">    </span>
</h1>

        <p className="subtitle">Where code meets creativity ✨</p>

        <div className="btn-group">
          <Link to="/editor" className="btn start">
            Start Coding <FaArrowRight />
          </Link>
          <a
            href="https://github.com/ANU-2524"
            target="_blank"
            rel="noopener noreferrer"
            className="btn github"
          >
            <FaGithub /> GitHub
          </a>
        </div>
      </div>

      <footer className="tagline">
        “Write. Run. Share. Repeat. 💪🧠”
      </footer>
    </div>
  );
};

export default HomePage;
