# Contributing to JustCode 🧠✨

First of all — thank you for considering contributing to **JustCode**.  
This project exists to make coding feel clearer, less frustrating, and more collaborative.  
Every contribution, big or small, helps move us closer to that goal.

Whether you’re fixing a typo, improving UI, optimizing backend logic, or adding a brand-new feature — you’re welcome here.

---

## 🚀 How You Can Contribute

You can contribute in many ways:

- 🐛 Fix bugs
- ✨ Add new features
- 🎨 Improve UI/UX
- 🧠 Improve AI prompts or explanations
- 📄 Improve documentation
- ⚡ Optimize performance
- 🧪 Add tests
- 🌍 Improve accessibility or responsiveness

If you’re unsure where to start, check the **Issues** tab for:
- `good first issue`
- `help wanted`

---

## 📌 Issue Assignment

- Please comment on an issue before starting work.
- Wait for a maintainer to assign the issue to you.
- This helps avoid duplicate work and conflicts.

## 🛠 Tech Stack Overview

Before contributing, it helps to know what we’re working with:

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- Firebase

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)

### Realtime & Utilities
- Socket.io (DevZone collaboration)
- OpenAI GPT APIs
- jsPDF
- UUID

---

## 🏗 Architecture Overview

JustCode follows a client–server architecture:

- **Client (Frontend)**  
  Built with React and Tailwind CSS. Handles the code editor UI, user interactions, AI requests, and real-time collaboration interface.

- **Server (Backend)**  
  Built with Node.js and Express.js. Manages API routes, AI prompt handling, real-time socket connections, and database operations.

- **Database**  
  MongoDB is used to store user sessions, code data, and collaboration-related information.

- **Realtime Layer**  
  Socket.io enables live collaboration features in DevZone.

This separation ensures scalability, maintainability, and clear responsibility between components.


## 📦 Getting Started

### 1️⃣ Fork the Repository
Click the **Fork** button at the top right of this repository.

### 2️⃣ Clone Your Fork
```bash
git clone https://github.com/YOUR-USERNAME/JustCoding.git
cd JustCoding
```

### 3️⃣ Install Dependencies
***Frontend***
```bash
cd client
npm install
```

***Backend***
```bash
cd server
npm install
```

### 4️⃣ Environment Variables

Create a .env file in the backend directory and add required keys:
```bash
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
```

**⚠️ Never commit .env files or API keys.**

### 5️⃣ Run the App
# Frontend
```bash
npm run dev
```

# Backend
```bash
npm run dev
```

### 🌱 Creating a Branch

Always create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
```

Examples:
```bash
fix/editor-bug
feature/pdf-export-improvement
ui/devzone-enhancement
```

### ✅ Commit Guidelines

Write clear, meaningful commit messages:
```bash
git commit -m "Fix: prevent editor crash on empty input"
```

## Good commit prefixes:

+ Add: for new features
+ Fix: for bug fixes
+ Update: for improvements
+ Refactor: for code restructuring
+ Docs: for documentation changes

## 🔍 Pull Request Guidelines

Before opening a PR, make sure:

+ Your code runs locally without errors
+ You’ve tested your changes
+ You’ve followed existing code style
+ You’ve updated documentation if needed
+ When creating a PR, include:
+ What problem your PR solves
+ What changes you made
+ Screenshots or screen recordings (for UI changes)
+ Any known limitations or follow-ups

### 🧠 AI-Related Contributions

If you’re working on GPT prompts or AI features:

+ Keep prompts clear, safe, and user-friendly
+ Avoid leaking user data
+ Test outputs with multiple examples
+ Prefer explainability over verbosity

### 🎨 UI & UX Contributions

+ Keep the UI clean and intuitive
+ Maintain dark/light theme compatibility
+ Avoid unnecessary animations
+ Ensure responsiveness across devices

## 🎯 Code Style

- Follow existing project structure and patterns
- Use meaningful variable and function names
- Keep files focused and readable

### 🤝 Community Guidelines

+ Be respectful and constructive
+ No harassment, discrimination, or toxic behavior
+ Feedback should be kind, specific, and actionable
+ This project follows a Code of Conduct — please respect it in all interactions.

### 💡 Need Help?

If you’re stuck:

+ Open a discussion
+ Comment on an issue
+ Ask questions — curiosity is welcome here

### ❤️ Final Note

JustCode exists because coding shouldn’t feel lonely or overwhelming.
Thanks for helping make this space better, smarter, and more human.