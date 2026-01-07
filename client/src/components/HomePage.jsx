// src/components/HomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import "../Style/HomePage.css";
import { FaRobot, FaCode, FaUsers, FaFilePdf, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate(); // initialize navigate

  // Motion variants
  const heroVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hover: { scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 20 } },
    tap: { scale: 0.98 },
  };

  const gridParent = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 24 } },
    hover: { y: -6, scale: 1.02, boxShadow: "0 12px 32px rgba(124,58,237,0.18)" },
  };

  return (
    <div className="homepage home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1 variants={heroVariants}>
            Just<span className="highlight">Coding</span>
          </motion.h1>
          <motion.p variants={heroVariants}>
            AI-powered code editor & collaboration platform for developers.
          </motion.p>

          {/* Buttons */}
          <div className="hero-buttons">
            <motion.button
              className="btn-primary"
              onClick={() => navigate("/login")}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Start Coding
            </motion.button>

            <motion.a
              href="#features"
              className="btn-secondary"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Explore Features
            </motion.a>

            <motion.button
              className="btn-editor"
              onClick={() => navigate("/editor")}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Open Code Editor
            </motion.button>
          </div>
        </motion.div>

        {/* Floating shapes */}
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="animate-on-scroll">Features</h2>
        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridParent}
        >
          <motion.div className="feature-card" variants={cardVariants} whileHover="hover">
            <FaRobot className="feature-icon" />
            <h3 className="feature-title">AI Code Explanation</h3>
            <p className="feature-text">Understand and debug code with AI-powered insights.</p>
          </motion.div>
          <motion.div className="feature-card" variants={cardVariants} whileHover="hover">
            <FaCode className="feature-icon" />
            <h3 className="feature-title">Multi-language Support</h3>
            <p className="feature-text">Write code in multiple languages with ease.</p>
          </motion.div>
          <motion.div className="feature-card" variants={cardVariants} whileHover="hover">
            <FaUsers className="feature-icon" />
            <h3 className="feature-title">Real-time Collaboration</h3>
            <p className="feature-text">Work together with teammates in DevZone.</p>
          </motion.div>
          <motion.div className="feature-card" variants={cardVariants} whileHover="hover">
            <FaFilePdf className="feature-icon" />
            <h3 className="feature-title">Export & Share</h3>
            <p className="feature-text">Export your code to PDF or share instantly.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="how-section">
        <h2 className="animate-on-scroll">How It Works</h2>
        <motion.div
          className="how-steps"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridParent}
        >
          <motion.div className="how-step" variants={cardVariants}>
            <h3 className="step-title">1. Sign Up</h3>
            <p className="step-text">Create an account and access your AI-powered workspace.</p>
          </motion.div>
          <motion.div className="how-step" variants={cardVariants}>
            <h3 className="step-title">2. Start Coding</h3>
            <p className="step-text">Use our editor to write code in multiple languages with AI suggestions.</p>
          </motion.div>
          <motion.div className="how-step" variants={cardVariants}>
            <h3 className="step-title">3. Collaborate & Share</h3>
            <p className="step-text">Invite teammates to collaborate or export your work seamlessly.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>Ready to Start Coding?</motion.h2>
        <motion.button
          className="btn-primary"
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
        >
          Get Started
        </motion.button>
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
