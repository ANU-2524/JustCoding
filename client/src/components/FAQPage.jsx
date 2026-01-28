// src/components/FAQPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaQuestionCircle,
  FaCode,
  FaUsers,
  FaRobot,
  FaLock,
  FaShieldAlt,
  FaGlobe,
  FaTerminal,
  FaRegFileCode,
  FaDownload,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const FAQPage = () => {
  const navigate = useNavigate();
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
      
      {/* FAQ List */}
      <motion.section
        className="faq-list-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="faq-list-container" style={{ maxWidth: "800px", margin: "4rem auto 6rem" }}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2.5rem" }}>Frequently Asked Questions</h2>
          <AnimatePresence>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
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

      {/* Footer */}
      <footer className="footer animate-on-scroll">
  <div className="footer-container">
    <div className="footer-content">
      <div className="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/editor")}>Editor</li>
          <li onClick={() => navigate("/challenges")}>Challenges</li>
          <li onClick={() => navigate("/tutorials")}>Tutorials</li>
          <li onClick={() => navigate("/faq")}>FAQ</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Legal</h4>
        <ul>
          <li onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
          <li onClick={() => navigate("/terms")}>Terms & Conditions</li>
          <li onClick={() => navigate("/contributing")}>Contributing</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Connect</h4>
        <ul className="social-links">
          <li><a href="https://x.com/_Anuuu_Soniii_" target="_blank" rel="noopener noreferrer"><FaXTwitter /> Twitter</a></li>
          <li><a href="https://github.com/ANU-2524/" target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/anu--soni/" target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn</a></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} JustCoding. All rights reserved.</p>
    </div>
  </div>
</footer>

      {/* Add FAQ-specific CSS */}
      <style jsx>{`
        .faq-page {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        
        .faq-hero .hero-content h1 {
          font-size: 4rem;
        }
        
        .faq-hero .hero-content p {
          font-size: 1.3rem;
          max-width: 700px;
          margin: 0 auto;
        }
        
        .faq-stats {
          padding-top: 4rem;
        }
        
        .stat-box {
          text-align: center;
          padding: 2rem;
        }
        
        .stat-box h4 {
          font-size: 2.5rem;
          margin: 1rem 0;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        
        .stat-box p {
          color: #94a3b8;
          font-size: 1rem;
        }
        
        .faq-filter-section {
          max-width: 1200px;
          margin: 2rem auto 4rem;
          padding: 0 1rem;
        }
        
        .faq-filter-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .faq-filter-btn {
          padding: 0.75rem 2rem;
          border-radius: 50px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .faq-filter-btn.active {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        
        .faq-filter-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .faq-filter-btn.active:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
        }
        
        .faq-list-section {
          max-width: 800px;
          margin: 0 auto 4rem;
          padding: 0 1rem;
        }
        
        .faq-item-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          margin-bottom: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .faq-question-btn {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: left;
        }
        
        .faq-question-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .faq-icon-circle {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 0.75rem;
          border-radius: 12px;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 50px;
          min-height: 50px;
        }
        
        .faq-question-text {
          flex: 1;
        }
        
        .faq-chevron-icon {
          transition: transform 0.3s ease;
          margin-left: 1rem;
        }
        
        .faq-answer-container {
          overflow: hidden;
        }
        
        .faq-answer-text {
          padding: 0 1.5rem 1.5rem;
          color: #cbd5e1;
          line-height: 1.6;
          font-size: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 0;
          padding-top: 1.5rem;
        }
        
        .faq-cta {
          max-width: 800px;
          margin: 0 auto 4rem;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .faq-cta h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .faq-cta p {
          font-size: 1.1rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .faq-hero .hero-content h1 {
            font-size: 3rem;
          }
          
          .faq-hero .hero-content p {
            font-size: 1.1rem;
          }
          
          .faq-filter-btn {
            padding: 0.5rem 1.5rem;
            font-size: 0.9rem;
          }
          
          .faq-question-btn {
            padding: 1rem;
            font-size: 1rem;
          }
          
          .faq-icon-circle {
            min-width: 40px;
            min-height: 40px;
            padding: 0.5rem;
            font-size: 1rem;
          }
          
          .faq-question-content {
            gap: 0.75rem;
          }
          
          .stat-box h4 {
            font-size: 2rem;
          }
          
          .faq-cta {
            padding: 3rem 1.5rem;
          }
          
          .faq-cta h2 {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .faq-hero .hero-content h1 {
            font-size: 2.5rem;
          }
          
          .faq-filter-container {
            gap: 0.5rem;
          }
          
          .faq-filter-btn {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
          
          .faq-question-text {
            font-size: 0.95rem;
          }
          
          .faq-answer-text {
            padding: 0 1rem 1rem;
            font-size: 0.95rem;
          }
          
          .faq-cta h2 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
