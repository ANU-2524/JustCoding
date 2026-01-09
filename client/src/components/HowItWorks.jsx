import React from "react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Sign Up",
      description: "Create an account and access your AI-powered workspace.",
      details: "Sign up with your email to create a new account. Enter your credentials and verify your identity to access the platform."
    },
    {
      id: 2,
      title: "Start Coding",
      description: "Use our editor to write code in multiple languages with AI suggestions.",
      details: "Access our powerful code editor with syntax highlighting, AI-powered suggestions, and real-time collaboration features."
    },
    {
      id: 3,
      title: "Collaborate & Share",
      description: "Invite teammates to collaborate or export your work seamlessly.",
      details: "Invite team members, share your projects, and work together in real-time with our collaborative coding environment."
    }
  ];

  return (
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
      
      <div className="how-steps-timeline">
        <div className="timeline-connector"></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`step-container ${index % 2 === 0 ? 'right-side' : 'left-side'}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="step-circle">
              <div className="step-number">{step.id}</div>
            </div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default HowItWorks;