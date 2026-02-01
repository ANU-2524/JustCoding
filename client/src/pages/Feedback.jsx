// src/pages/Feedback.jsx
import React from "react";
import "../Style/Feedback.css";

const Feedback = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your feedback!");
    e.target.reset();
  };

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <h2 className="feedback-title">We Value Your Feedback</h2>
        <p className="feedback-subtitle">
          Help us improve JustCoding by sharing your thoughts.
        </p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-field">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" required />
          </div>

          <div className="feedback-field">
            <label>Your Email</label>
            <input type="email" placeholder="Enter your email" required />
          </div>

          <div className="feedback-field">
            <label>Your Feedback</label>
            <textarea
              rows="5"
              placeholder="Write your feedback here..."
              required
            />
          </div>

          <button type="submit" className="feedback-submit-btn">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
