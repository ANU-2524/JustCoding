import React from "react";
import { useNavigate } from "react-router-dom";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import "../Style/HomePage.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Privacy <span className="highlight">Policy</span>
          </h1>
          <p>
            Your privacy matters. This policy explains how JustCoding collects,
            uses, and protects your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="features-section-enhanced">
        <div className="max-w-4xl mx-auto text-left policy-card">
          <p className="policy-date">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Introduction</h2>
          <p>
            JustCoding is an AI-powered coding and collaboration platform designed
            for students, developers, educators, and teams. We respect your
            privacy and are committed to protecting any personal information you
            share while using our platform.
          </p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, and
              authentication details when you sign up or log in.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, session
              duration, and interaction data.
            </li>
            <li>
              <strong>Code & Content:</strong> Code written, shared snippets, and
              collaboration data.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device
              information, and operating system.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and improve JustCoding features</li>
            <li>To enable real-time collaboration and AI assistance</li>
            <li>To personalize user experience and recommendations</li>
            <li>To maintain platform security and prevent misuse</li>
          </ul>

          <h2>4. AI & Code Processing</h2>
          <p>
            JustCoding uses AI models to provide code explanations, suggestions,
            and debugging assistance. Your code is processed only to deliver
            these features and is not sold or shared for advertising purposes.
          </p>

          <h2>5. Cookies & Tracking</h2>
          <p>
            We may use cookies and similar technologies to maintain sessions,
            improve performance, and understand usage trends. You can control
            cookies through your browser settings.
          </p>

          <h2>6. Data Sharing</h2>
          <p>
            We do not sell your personal data. Information may be shared only:
          </p>
          <ul>
            <li>With trusted services required to operate the platform</li>
            <li>When required by law or legal process</li>
            <li>To protect the rights, safety, and integrity of JustCoding</li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your
            data. However, no online system is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2>8. Your Rights</h2>
          <ul>
            <li>Access, update, or delete your personal data</li>
            <li>Request clarification on how your data is used</li>
            <li>Withdraw consent or delete your account</li>
          </ul>

          <h2>9. Children’s Privacy</h2>
          <p>
            JustCoding is not intended for children under 13. If we discover
            such data has been collected, it will be deleted promptly.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected on this page.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us via the
            official JustCoding channels or GitHub repository.
          </p>
        </div>
      </section>

      <footer className="footer animate-on-scroll">
        <div className="footer-container">

          {/* Brand */}
          <div className="footer-brand">
            <p>
              &copy; {new Date().getFullYear()} JustCoding. Built with love, learning,
              and late nights by Anu 💌🌸.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => navigate("/")}>Home</li>
              <li onClick={() => navigate("/editor")}>Editor</li>
              <li onClick={() => navigate("/live")}>Collaborate</li>
              <li onClick={() => navigate("/profile")}>Profile</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
              <li onClick={() => navigate("/terms")}>Terms & Conditions</li>
            </ul>
          </div>

          {/* Feedback & Rating */}
          <div className="footer-feedback">
            <h4>Feedback</h4>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeVYOjh-QcmfOkOHtprYlMoKiKG_Tl6bZuA9c1A8JVdUhHbKA/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="feedback-btn"
              title="Help us improve JustCoding 💛"
            >
              Give Feedback
            </a>

            <div className="rating">
              <span>Rate Us:</span>
              <div className="stars">★ ★ ★ ★ ★</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="footer-social">
            <h4>Connect</h4>
            <a
              href="https://x.com/_Anuuu_Soniii_"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter /> Twitter
            </a>
            <a
              href="https://github.com/ANU-2524/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/anu--soni/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin /> LinkedIn
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default PrivacyPolicy;
