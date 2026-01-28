import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaGitAlt, FaCodeBranch } from "react-icons/fa";
import "../Style/HomePage.css";
import "../Style/ContributingPage.css";

const ContributingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Contributing to <span className="highlight">JustCode</span>
          </h1>
          <p>
            Help us make coding clearer, less frustrating, and more collaborative.
            Every contribution matters, no matter how small!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="features-section-enhanced">
        <div className="max-w-4xl mx-auto text-left policy-card">
          <h2>🚀 How You Can Contribute</h2>
          <p>
            You can contribute in many ways to help improve JustCode:
          </p>
          <ul>
            <li>🐛 Fix bugs and identify issues</li>
            <li>✨ Add new features and enhancements</li>
            <li>🎨 Improve UI/UX and design</li>
            <li>🧠 Improve AI prompts and explanations</li>
            <li>📄 Improve documentation</li>
            <li>⚡ Optimize performance</li>
            <li>🧪 Add tests and improve test coverage</li>
            <li>🌍 Improve accessibility and responsiveness</li>
          </ul>

          <h2>📌 Getting Started</h2>
          <p>
            If you're unsure where to start, check the <strong>Issues</strong> tab for:
          </p>
          <ul>
            <li>
              <code>good first issue</code> - Perfect for beginners
            </li>
            <li>
              <code>help wanted</code> - Areas where we need assistance
            </li>
          </ul>

          <h2>🛠 Tech Stack Overview</h2>
          <h3>Frontend</h3>
          <ul>
            <li>React.js - UI library</li>
            <li>Tailwind CSS - Styling</li>
            <li>Framer Motion - Animations</li>
            <li>Firebase - Authentication</li>
          </ul>

          <h3>Backend</h3>
          <ul>
            <li>Node.js - Runtime</li>
            <li>Express.js - Web framework</li>
            <li>MongoDB (Atlas) - Database</li>
          </ul>

          <h3>Realtime & Utilities</h3>
          <ul>
            <li>Socket.io - Real-time collaboration</li>
            <li>OpenAI GPT APIs - AI assistance</li>
            <li>jsPDF - Document generation</li>
            <li>UUID - Unique identifiers</li>
          </ul>

          <h2>🏗 Architecture Overview</h2>
          <p>
            JustCode follows a client–server architecture:
          </p>
          <ul>
            <li>
              <strong>Client (Frontend):</strong> Built with React and Tailwind CSS. Handles the code editor UI, user interactions, AI requests, and real-time collaboration interface.
            </li>
            <li>
              <strong>Server (Backend):</strong> Built with Node.js and Express.js. Manages API routes, AI prompt handling, real-time socket connections, and database operations.
            </li>
            <li>
              <strong>Database:</strong> MongoDB is used to store user sessions, code data, and collaboration-related information.
            </li>
            <li>
              <strong>Realtime Layer:</strong> Socket.io enables live collaboration features in DevZone.
            </li>
          </ul>

          <h2>📦 Getting Started with Code</h2>

          <h3>1️⃣ Fork the Repository</h3>
          <p>
            Click the <strong>Fork</strong> button at the top right of the repository on GitHub.
          </p>

          <h3>2️⃣ Clone Your Fork</h3>
          <pre className="code-block">
            {`git clone https://github.com/YOUR-USERNAME/JustCoding.git
cd JustCoding`}
          </pre>

          <h3>3️⃣ Install Dependencies</h3>
          <p><strong>Frontend:</strong></p>
          <pre className="code-block">
            {`cd client
npm install`}
          </pre>

          <p><strong>Backend:</strong></p>
          <pre className="code-block">
            {`cd server
npm install`}
          </pre>

          <h3>4️⃣ Environment Variables</h3>
          <p>
            Create a <code>.env</code> file in the backend directory with required keys:
          </p>
          <pre className="code-block">
            {`MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key`}
          </pre>
          <p>
            <strong>⚠️ Never commit .env files or API keys.</strong>
          </p>

          <h3>5️⃣ Run the Application</h3>
          <p><strong>Frontend:</strong></p>
          <pre className="code-block">
            {`npm run dev`}
          </pre>

          <p><strong>Backend:</strong></p>
          <pre className="code-block">
            {`npm run dev`}
          </pre>

          <h2>🌱 Creating a Branch</h2>
          <p>
            Always create a new branch for your work:
          </p>
          <pre className="code-block">
            {`git checkout -b feature/your-feature-name`}
          </pre>

          <p>
            <strong>Examples:</strong>
          </p>
          <pre className="code-block">
            {`fix/editor-bug
feature/pdf-export-improvement
ui/devzone-enhancement`}
          </pre>

          <h2>✅ Commit Guidelines</h2>
          <p>
            Write clear, meaningful commit messages:
          </p>
          <pre className="code-block">
            {`git commit -m "Fix: prevent editor crash on empty input"`}
          </pre>

          <p>
            <strong>Good commit prefixes:</strong>
          </p>
          <ul>
            <li>
              <code>Add:</code> for new features
            </li>
            <li>
              <code>Fix:</code> for bug fixes
            </li>
            <li>
              <code>Update:</code> for improvements
            </li>
            <li>
              <code>Refactor:</code> for code restructuring
            </li>
            <li>
              <code>Docs:</code> for documentation changes
            </li>
          </ul>

          <h2>🔍 Pull Request Guidelines</h2>
          <p>
            Before opening a PR, make sure:
          </p>
          <ul>
            <li>Your code runs locally without errors</li>
            <li>You've tested your changes thoroughly</li>
            <li>You've followed existing code style and patterns</li>
            <li>You've updated documentation if needed</li>
          </ul>

          <p>
            <strong>When creating a PR, include:</strong>
          </p>
          <ul>
            <li>What problem your PR solves</li>
            <li>What changes you made</li>
            <li>Screenshots or screen recordings (for UI changes)</li>
            <li>Any known limitations or follow-ups</li>
          </ul>

          <h2>📌 Issue Assignment</h2>
          <ul>
            <li>Please comment on an issue before starting work</li>
            <li>Wait for a maintainer to assign the issue to you</li>
            <li>This helps avoid duplicate work and conflicts</li>
          </ul>

          <h2>🧠 AI-Related Contributions</h2>
          <p>
            If you're working on GPT prompts or AI features:
          </p>
          <ul>
            <li>Keep prompts clear, safe, and user-friendly</li>
            <li>Avoid leaking user data</li>
            <li>Test outputs with multiple examples</li>
            <li>Prefer explainability over verbosity</li>
          </ul>

          <h2>🎨 UI & UX Contributions</h2>
          <ul>
            <li>Keep the UI clean and intuitive</li>
            <li>Maintain dark/light theme compatibility</li>
            <li>Avoid unnecessary animations</li>
            <li>Ensure responsiveness across devices</li>
          </ul>

          <h2>🎯 Code Style</h2>
          <ul>
            <li>Follow existing project structure and patterns</li>
            <li>Use meaningful variable and function names</li>
            <li>Keep files focused and readable</li>
          </ul>

          <h2>🤝 Community Guidelines</h2>
          <ul>
            <li>Be respectful and constructive in all interactions</li>
            <li>No harassment, discrimination, or toxic behavior</li>
            <li>Feedback should be kind, specific, and actionable</li>
            <li>This project follows a Code of Conduct — please respect it</li>
          </ul>

          <h2>💡 Need Help?</h2>
          <p>If you're stuck or have questions:</p>
          <ul>
            <li>Open a discussion in the repo</li>
            <li>Comment on an issue with your question</li>
            <li>Ask in the community — curiosity is welcome here!</li>
          </ul>

          <h2>❤️ Final Note</h2>
          <p>
            JustCode exists because coding shouldn't feel lonely or overwhelming.
            Thanks for helping make this space better, smarter, and more human.
            <br />
            <br />
            <strong>We're excited to have you contribute! 🎉</strong>
          </p>

          <div className="contributing-cta">
            <button
              className="cta-button"
              onClick={() => window.open('https://github.com/Ayaanshaikh12243/JUST-CODING', '_blank')}
            >
              <FaGithub /> View Repository on GitHub
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContributingPage;
