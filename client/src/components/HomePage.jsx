// src/components/HomePage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { useTheme } from "./ThemeContext";
import "../Style/theme.css";
import "../Style/HomePage.css";
import { FaRobot, FaCode, FaUsers, FaFilePdf, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate(); // initialize navigate
  const { theme, isDark } = useTheme(); // Add theme context

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const sections = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }, []);

  return (
    <div className="homepage home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Just<span className="highlight">Coding</span>
          </h1>
          <p className="animate-on-scroll">
            AI-powered code editor & collaboration platform for developers.
          </p>

          {/* Buttons */}
          <div className="hero-buttons animate-on-scroll">

            <button
              className="btn-secondary"
              onClick={() => navigate("/login")}
            >
              Start Coding
            </button>

            <a href="#features" className="btn-secondary">Explore Features</a>

            <button
              className="btn-editor"
              onClick={() => navigate("/editor")} // navigate to CodeEditor.jsx
            >
              Open Code Editor
            </button>
          </div>
        </div>

        {/* Floating shapes */}
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="animate-on-scroll">Features</h2>
        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <FaRobot className="feature-icon" />
            <h3 className="feature-title">AI Code Explanation</h3>
            <p className="feature-text">Understand and debug code with AI-powered insights.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaCode className="feature-icon" />
            <h3 className="feature-title">Multi-language Support</h3>
            <p className="feature-text">Write code in multiple languages with ease.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaUsers className="feature-icon" />
            <h3 className="feature-title">Real-time Collaboration</h3>
            <p className="feature-text">Work together with teammates in DevZone.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaFilePdf className="feature-icon" />
            <h3 className="feature-title">Export & Share</h3>
            <p className="feature-text">Export your code to PDF or share instantly.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section">
        <h2 className="animate-on-scroll">How It Works</h2>
        <div className="how-steps">
          <div className="how-step animate-on-scroll">
            <h3 className="step-title">1. Sign Up</h3>
            <p className="step-text">Create an account and access your AI-powered workspace.</p>
          </div>
          <div className="how-step animate-on-scroll">
            <h3 className="step-title">2. Start Coding</h3>
            <p className="step-text">Use our editor to write code in multiple languages with AI suggestions.</p>
          </div>
          <div className="how-step animate-on-scroll">
            <h3 className="step-title">3. Collaborate & Share</h3>
            <p className="step-text">Invite teammates to collaborate or export your work seamlessly.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <h2>Ready to Start Coding?</h2>
        <button
          className="btn-primary"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="footer animate-on-scroll">
        <p>&copy; {new Date().getFullYear()} JustCoding. Built with love, learning, and late nights by Anu 💌🌸.</p>
        <div className="social-icons">
          <a href="https://x.com/_Anuuu_Soniii_" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a>
          <a href="https://github.com/ANU-2524/" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a>
          <a href="https://www.linkedin.com/in/anu--soni/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
