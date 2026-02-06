// src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhoneAlt, FaClock } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer animate-on-scroll">
      <div className="footer-container">
        <div className="footer-content">
          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => navigate("/")}>Home</li>
              <li onClick={() => navigate("/editor")}>Editor</li>
              <li onClick={() => navigate("/challenges")}>Challenges</li>
              <li onClick={() => navigate("/tutorials")}>Tutorials</li>
              <li onClick={() => navigate("/faq")}>FAQ</li>
              <li onClick={() => navigate("/feedback")}>Feedback</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
              <li onClick={() => navigate("/terms")}>Terms & Conditions</li>
              <li onClick={() => navigate("/contributing")}>Contributing</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li>
                <FaEnvelope />
                <span>justcoding.contact@gmail.com</span>
              </li>
              <li>
                <FaPhoneAlt />
                <span>+91 XXXXX XXXXX</span>
              </li>
              <li>
                <FaClock />
                <span>Mon–Fri, 10 AM – 6 PM</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-section">
            <h4>Connect</h4>
            <ul className="social-links">
              <li>
                <a
                  href="https://x.com/_Anuuu_Soniii_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaXTwitter /> Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ANU-2524/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub /> GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/anu--soni/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin /> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JustCoding. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
