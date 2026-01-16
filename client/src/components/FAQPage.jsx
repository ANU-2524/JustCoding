// src/components/FAQPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle, FaCode, FaUsers, FaRobot, FaLock, FaShieldAlt, FaGlobe, FaTerminal, FaRegFileCode, FaDownload, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import "../Style/FAQPage.css";

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is JustCoding?",
      answer: "JustCoding is an AI-powered online code editor and collaboration platform that allows developers to write, run, and share code in multiple programming languages. It features real-time collaboration, AI assistance, and a secure execution environment.",
      icon: <FaQuestionCircle />,
      category: "general"
    },
    {
      question: "Which programming languages are supported?",
      answer: "JustCoding supports a wide range of programming languages including JavaScript, Python, Java, C++, C#, TypeScript, Go, Ruby, PHP, Swift, Kotlin, Rust, and many more. We're constantly adding new language support based on community feedback.",
      icon: <FaCode />,
      category: "features"
    },
    {
      question: "How does real-time collaboration work?",
      answer: "Our real-time collaboration allows multiple users to edit the same code file simultaneously. Each user gets a unique cursor color, and changes are synchronized instantly. You can collaborate with teammates by sharing a unique session link.",
      icon: <FaUsers />,
      category: "collaboration"
    },
    {
      question: "Is my code secure on JustCoding?",
      answer: "Yes! All code execution happens in secure, isolated sandbox environments. Your code is encrypted in transit and at rest. We never store or access your code for any purpose other than providing our service. For maximum security, consider our Pro plan which offers additional security features.",
      icon: <FaLock />,
      category: "security"
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI assistant uses advanced language models to provide code suggestions, debugging help, code explanations, and optimization tips. It can generate code snippets, fix errors, and explain complex concepts in simple terms.",
      icon: <FaRobot />,
      category: "features"
    },
    {
      question: "Is JustCoding free to use?",
      answer: "Yes! JustCoding offers a free tier with access to all basic features including multi-language support, real-time collaboration, and AI assistance. We also offer premium plans with additional features like private repositories, advanced AI models, and priority support.",
      icon: <FaShieldAlt />,
      category: "general"
    },
    {
      question: "Can I use JustCoding offline?",
      answer: "JustCoding primarily functions as an online platform. However, you can save your code locally and work offline using our desktop application (coming soon). The web version requires an internet connection for real-time features and code execution.",
      icon: <FaGlobe />,
      category: "general"
    },
    {
      question: "How do I share my code with others?",
      answer: "You can share your code by generating a shareable link, exporting as PDF, or inviting collaborators directly via email. All shared sessions can be set as view-only or editable based on your preference.",
      icon: <FaRegFileCode />,
      category: "collaboration"
    },
    {
      question: "Does JustCoding support code compilation and execution?",
      answer: "Yes! JustCoding provides a built-in compiler and runtime environment for most supported languages. You can run your code directly in the browser and see the output in real-time. Advanced execution features are available in our Pro plan.",
      icon: <FaTerminal />,
      category: "features"
    },
    {
      question: "Can I import/export my projects?",
      answer: "Yes, you can import projects from GitHub, GitLab, and local files. You can also export your projects in various formats including ZIP, GitHub repository, or as individual files. Premium users get unlimited import/export capabilities.",
      icon: <FaDownload />,
      category: "general"
    }
  ];

  const filteredFAQs = activeFilter === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeFilter);

  // Styled using your HomePage pattern
  return (
    <div className="homepage faq-page">
      
      {/* Hero Section for FAQ */}
      <motion.section
        className="hero-section faq-hero"
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
            Frequently Asked <span className="highlight">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find answers to common questions about JustCoding - the AI-powered code editor and collaboration platform.
          </motion.p>
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

      {/* Stats Section */}
      <motion.section
        className="features-section-enhanced faq-stats"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="features-grid-static" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div 
            className="feature-static stat-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-wrapper-small">
              <FaCode />
            </div>
            <h4>15+</h4>
            <p>Programming Languages</p>
          </motion.div>
          
          <motion.div 
            className="feature-static stat-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-wrapper-small">
              <FaUsers />
            </div>
            <h4>10K+</h4>
            <p>Active Developers</p>
          </motion.div>
          
          <motion.div 
            className="feature-static stat-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-wrapper-small">
              <FaShieldAlt />
            </div>
            <h4>99.9%</h4>
            <p>Uptime</p>
          </motion.div>
          
          <motion.div 
            className="feature-static stat-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-wrapper-small">
              <FaGlobe />
            </div>
            <h4>24/7</h4>
            <p>Support</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter Buttons */}
      <motion.section
        className="faq-filter-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="faq-filter-container">
          {["all", "general", "features", "collaboration", "security"].map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`faq-filter-btn ${activeFilter === filter ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* FAQ List */}
      <motion.section
        className="faq-list-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="faq-list-container">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="faq-question-btn"
                >
                  <div className="faq-question-content">
                    <div className="faq-icon-circle">
                      {faq.icon}
                    </div>
                    <span className="faq-question-text">{faq.question}</span>
                  </div>
                  <motion.div
                    className="faq-chevron-icon"
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="faq-answer-container"
                    >
                      <div className="faq-answer-text">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="cta-section faq-cta"
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
          Still have questions?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          Can't find what you're looking for? Our support team is here to help you get the answers you need.
        </motion.p>
        <motion.button
          className="btn-primary"
          onClick={() => window.open("https://github.com/ANU-2524/JustCoding/issues", "_blank")}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Contact Support
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          style={{ marginTop: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}
        >
          Or visit our <a href="https://github.com/ANU-2524/JustCoding" style={{ color: "#6366f1", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">GitHub repository</a> for more information
        </motion.p>
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

export default FAQPage;