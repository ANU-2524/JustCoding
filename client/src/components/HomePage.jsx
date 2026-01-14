// src/components/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, animate } from "framer-motion";
import "../Style/HomePage.css";
import { FaRobot, FaCode, FaUsers, FaFilePdf, FaGithub, FaLinkedin, FaCodeBranch, FaChartLine, FaShareAlt, FaSyncAlt, FaShieldAlt, FaCogs } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import CardSwap, { Card } from './CardSwap';
import HowItWorks from './HowItWorks';

const HomePage = () => {
  const navigate = useNavigate(); // initialize navigate

  const scrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      // Scroll exactly to the start of the section to hide the hero background
      const targetPosition = featuresSection.offsetTop; 
      
      animate(window.scrollY, targetPosition, {
        type: "spring",
        stiffness: 70,
        damping: 20,
        restDelta: 0.5,
        onUpdate: (latest) => {
          window.scrollTo(0, latest);
        }
      });
    }
  };

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
              onClick={scrollToFeatures}
              whileHover={{ 
                y: -8,
                scale: 1.03,
                transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
              }}
              whileTap={{ scale: 0.98 }}
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


{/* Use Cases Section */}
<motion.section
  className="use-cases-section"
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
    Who Is JustCoding For?
  </motion.h2>

  <motion.p
    className="use-cases-subtitle"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true }}
  >
    JustCoding is built to support different learning and development needs.
  </motion.p>

  <div className="use-cases-grid">
    {[
      {
        icon: <FaCode />,
        title: "Students",
        text: "Practice coding, understand concepts, and learn faster with AI assistance."
      },
      {
        icon: <FaUsers />,
        title: "Teams",
        text: "Collaborate in real time and build projects together seamlessly."
      },
      {
        icon: <FaRobot />,
        title: "Learners",
        text: "Get instant explanations, debugging help, and coding guidance."
      },
      {
        icon: <FaFilePdf />,
        title: "Educators",
        text: "Demonstrate code live and share examples with students easily."
      },
      {
        icon: <FaChartLine />,
        title: "Interview Prep",
        text: "Practice coding problems and improve performance with insights."
      },
      {
        icon: <FaCodeBranch />,
        title: "Developers",
        text: "Experiment, test ideas, and manage code efficiently."
      }
    ].map((item, index) => (
      <motion.div
        key={index}
        className="use-case-card"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05, y: -10 }}

      >
        <div className="use-case-icon">{item.icon}</div>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </motion.div>
    ))}
  </div>
</motion.section>


      {/* How It Works Section */}
      <HowItWorks />

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

export default HomePage;
