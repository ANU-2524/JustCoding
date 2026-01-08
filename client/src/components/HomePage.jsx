// src/components/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../Style/HomePage.css";
import { FaRobot, FaCode, FaUsers, FaFilePdf, FaTwitter, FaGithub, FaLinkedin, FaCodeBranch, FaChartLine, FaShareAlt, FaSyncAlt, FaShieldAlt, FaCogs } from "react-icons/fa";
import CardSwap, { Card } from './CardSwap';

const HomePage = () => {
  const navigate = useNavigate(); // initialize navigate

  return (
    <div className="homepage home-page">

      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Just<span className="highlight">Coding</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            AI-powered code editor & collaboration platform for developers.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="hero-buttons"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="btn-primary"
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Start Coding
            </motion.button>

            <motion.a
              href="#features"
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Features
            </motion.a>

            <motion.button
              className="btn-editor"
              onClick={() => navigate("/editor")}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Open Code Editor
            </motion.button>
          </motion.div>
        </div>

        {/* Floating shapes */}
        <motion.div
          className="floating-shape shape1"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div
          className="floating-shape shape2"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div
          className="floating-shape shape3"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 3, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
      </motion.section>

      {/* Enhanced Features Section with Animated Cards */}
      <motion.section
        id="features"
        className="features-section-enhanced"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="features-title"
        >
          Powerful Features
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="features-subtitle"
        >
          Everything you need to boost your coding productivity
        </motion.p>
              
        <div className="features-container">
          <div className="animated-feature-container">
            <CardSwap width={350} height={250} cardDistance={35} verticalDistance={45} delay={2000} pauseOnHover={true} skewAmount={4} easing='power2'>
              <Card className="feature-card-animated">
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    <FaCode className="feature-icon-main" />
                  </div>
                  <h3 className="feature-title-animated">Multi-Language Support</h3>
                  <p className="feature-desc">Code in multiple languages with real-time syntax highlighting.</p>
                </div>
              </Card>
                      
              <Card className="feature-card-animated">
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    <FaUsers className="feature-icon-main" />
                  </div>
                  <h3 className="feature-title-animated">Real-time Collaboration</h3>
                  <p className="feature-desc">Work together with your team in live coding sessions.</p>
                </div>
              </Card>
                      
              <Card className="feature-card-animated">
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    <FaRobot className="feature-icon-main" />
                  </div>
                  <h3 className="feature-title-animated">AI-Powered Assistance</h3>
                  <p className="feature-desc">Get instant code explanations and debugging help.</p>
                </div>
              </Card>
                      
              <Card className="feature-card-animated">
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    <FaChartLine className="feature-icon-main" />
                  </div>
                  <h3 className="feature-title-animated">Performance Analytics</h3>
                  <p className="feature-desc">Monitor your coding habits and productivity metrics.</p>
                </div>
              </Card>
            </CardSwap>
          </div>
                  
          <div className="features-grid-static">
            <motion.div 
              className="feature-static"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon-wrapper-small">
                <FaCodeBranch />
              </div>
              <h4>Version Control</h4>
              <p>Track your code changes and manage project versions</p>
            </motion.div>
                    
            <motion.div 
              className="feature-static"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon-wrapper-small">
                <FaShieldAlt />
              </div>
              <h4>Secure Execution</h4>
              <p>Run your code in a secure sandbox environment</p>
            </motion.div>
                    
            <motion.div 
              className="feature-static"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon-wrapper-small">
                <FaCogs />
              </div>
              <h4>Customizable Themes</h4>
              <p>Tailor your coding environment with various themes</p>
            </motion.div>
                    
            <motion.div 
              className="feature-static"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon-wrapper-small">
                <FaShareAlt />
              </div>
              <h4>Easy Sharing</h4>
              <p>Share your code snippets and projects instantly</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="how-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        <motion.div
          className="how-steps"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.3
              }
            }
          }}
        >
          <motion.div
            className="how-step"
            variants={{
              hidden: { opacity: 0, x: -50, scale: 0.9 },
              visible: { opacity: 1, x: 0, scale: 1 }
            }}
            transition={{ duration: 0.6 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12)"
            }}
          >
            <h3 className="step-title">1. Sign Up</h3>
            <p className="step-text">Create an account and access your AI-powered workspace.</p>
          </motion.div>
          <motion.div
            className="how-step"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.6 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12)"
            }}
          >
            <h3 className="step-title">2. Start Coding</h3>
            <p className="step-text">Use our editor to write code in multiple languages with AI suggestions.</p>
          </motion.div>
          <motion.div
            className="how-step"
            variants={{
              hidden: { opacity: 0, x: 50, scale: 0.9 },
              visible: { opacity: 1, x: 0, scale: 1 }
            }}
            transition={{ duration: 0.6 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12)"
            }}
          >
            <h3 className="step-title">3. Collaborate & Share</h3>
            <p className="step-text">Invite teammates to collaborate or export your work seamlessly.</p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Ready to Start Coding?
        </motion.h2>
        <motion.button
          className="btn-primary"
          onClick={() => navigate("/login")}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="footer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          &copy; {new Date().getFullYear()} JustCoding. Built with love, learning, and late nights by Anu 💌🌸.
        </motion.p>
        <motion.div
          className="social-icons"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://x.com/_Anuuu_Soniii_"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTwitter />
          </motion.a>
          <motion.a
            href="https://github.com/ANU-2524/"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/anu--soni/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaLinkedin />
          </motion.a>
        </motion.div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
