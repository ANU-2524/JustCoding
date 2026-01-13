import React from "react";
import "../Style/HomePage.css";

const TermsAndConditions = () => {
  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Terms & <span className="highlight">Conditions</span>
          </h1>
          <p>
            Please read these terms carefully before using JustCoding.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="features-section-enhanced">
        <div className="max-w-4xl mx-auto text-left policy-card">
          <p className="policy-date">
            Effective Date: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using JustCoding, you agree to be bound by these
            Terms & Conditions. If you do not agree, please do not use the
            platform.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            JustCoding provides an AI-powered code editor, collaboration tools,
            and learning assistance for programming and development purposes.
          </p>

          <h2>3. User Responsibilities</h2>
          <ul>
            <li>You are responsible for maintaining your account security</li>
            <li>You must not misuse the platform for illegal activities</li>
            <li>You agree not to upload malicious or harmful code</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All platform branding, UI, and original content belong to JustCoding.
            You retain ownership of the code you write and share.
          </p>

          <h2>5. Acceptable Use</h2>
          <ul>
            <li>No hacking, scraping, or abuse of services</li>
            <li>No harassment, hate speech, or harmful behavior</li>
            <li>No attempts to bypass security measures</li>
          </ul>

          <h2>6. AI Limitations</h2>
          <p>
            AI-generated suggestions are for assistance only. JustCoding does
            not guarantee correctness, security, or suitability of generated
            code.
          </p>

          <h2>7. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms or harm the platform.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            JustCoding is provided “as is” without warranties of any kind. We do
            not guarantee uninterrupted or error-free service.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            JustCoding shall not be liable for any indirect, incidental, or
            consequential damages arising from use of the platform.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms & Conditions at any time. Continued use of
            the platform constitutes acceptance of updated terms.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by applicable laws of the user’s
            jurisdiction.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
