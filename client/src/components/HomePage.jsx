// src/components/HomePage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../Style/HomePage.css";
import { FaRobot, FaCode, FaUsers, FaFilePdf, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate(); // initialize navigate

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
    <div className="homepage">

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
              className="btn-primary"
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
            <FaRobot className="feature-icon"/>
            <h3>AI Code Explanation</h3>
            <p>Understand and debug code with AI-powered insights.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaCode className="feature-icon"/>
            <h3>Multi-language Support</h3>
            <p>Write code in multiple languages with ease.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaUsers className="feature-icon"/>
            <h3>Real-time Collaboration</h3>
            <p>Work together with teammates in DevZone.</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <FaFilePdf className="feature-icon"/>
            <h3>Export & Share</h3>
            <p>Export your code to PDF or share instantly.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section">
        <h2 className="animate-on-scroll">How It Works</h2>
        <div className="how-steps">
          <div className="animate-on-scroll">
            <h3>1. Sign Up</h3>
            <p>Create an account and access your AI-powered workspace.</p>
          </div>
          <div className="animate-on-scroll">
            <h3>2. Start Coding</h3>
            <p>Use our editor to write code in multiple languages with AI suggestions.</p>
          </div>
          <div className="animate-on-scroll">
            <h3>3. Collaborate & Share</h3>
            <p>Invite teammates to collaborate or export your work seamlessly.</p>
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
        <p>&copy; {new Date().getFullYear()} JustCoding. All rights reserved.</p>
        <div className="social-icons">
          <a href="https://x.com/_Anuuu_Soniii_" aria-label="Twitter"><FaTwitter /> Twitter</a>
          <a href="https://github.com/ANU-2524/" aria-label="GitHub"><FaGithub /> GitHub</a>
          <a href="https://www.linkedin.com/in/anu--soni/" aria-label="LinkedIn"><FaLinkedin /> LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
