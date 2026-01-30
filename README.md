# 🧠 JustCode — Where Code Meets Clarity

Ever been stuck in a coding bug spiral or felt too shy to ask for help?

**JustCode** was born out of that moment — where you’re staring at your code, frustrated, and wishing there was someone (or something) to *just explain* what’s going wrong. So, I built this.

---

## 🔗 Live Demo  
🌐 [JustCode HERE !](https://just-coding-theta.vercel.app)...

---

## 🚀 What is JustCode?

JustCode is a powerful, all-in-one online code editor made for developers, students, and curious minds. It’s more than just a code runner — it’s your debugging buddy, your AI-powered teacher, and your live collaboration hub.

Built with ❤️ using React, Node.js, MongoDB, and integrated with GPT, JustCode is designed to help you:

- Understand *why* a piece of code works (or doesn’t).
- Debug code with GPT’s insights.
- Share sessions and collaborate in real-time (DevZone 💬).
- Store your inputs, outputs, and even export your session as a clean PDF.
- Stay in your flow, with themes, language support, and intuitive UI.

---

## ✨ Why I Made This

I’ve been through those moments — the ones where you know the syntax but not the **logic**, or where you feel stuck even after hours of searching Stack Overflow.

JustCode is my attempt to bridge that gap.  
To make code feel less isolating and more collaborative, supportive, and fun.

---

## 🌟 Features That Matter

- 🧠 **AI-Powered Question Explainer**  
  Paste a question, and get a natural language explanation powered by GPT.

- 🛠️ **Debug with GPT**  
  Don't just stare at the error message — get suggestions tailored to your code.

- 💻 **Code Editor with Input/Output**  
  Supports multiple languages like Python, JavaScript, Java, C++, and more.

- 📤 **Export Everything as PDF**  
  Download your question, code, explanation, input/output, and debug logs — all neatly formatted.

- 🌓 **Theme Toggle (Dark/Light)**  
  Because your eyes deserve love too.

- 🤝 **DevZone – Real-Time Collaboration**  
  Create or join rooms, share the link, and code together. No extensions, no fuss.

- 👤 **Profile Dashboard (No login required)**
  - Save and manage code snippets
  - View past collaboration sessions (basic local history)
  - Track usage stats (runs, visualizes, AI actions)
  - Note: data is stored locally in your browser (`localStorage`), so it won’t sync across devices yet.

---

## 📁 Folder Structure

```bash
JustCode/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/              # React UI components
│   │   │   ├── Challenges.jsx       # Displays coding challenges, filters, contests, leaderboard
│   │   │   ├── HomePage.jsx         # Landing page component
│   │   │   ├── CodeEditor.jsx       # Main code editor with input/output
│   │   │   ├── LiveRoom.jsx         # Real-time collaboration room
│   │   │   └── ...                  # Other UI components (Navbar, Profile, etc.)
│   │   ├── Style/                   # CSS stylesheets
│   │   │   ├── Challenges.css       # Styles for challenges page
│   │   │   ├── HomePage.css         # Styles for home page
│   │   │   └── ...                  # Other component styles
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useCollaboration.js  # Hook for real-time collaboration
│   │   ├── services/                # Client-side services
│   │   │   └── localStore.js        # Local storage utilities
│   │   ├── assets/                  # Static assets (images, icons)
│   │   └── __tests__/               # Unit tests for components and hooks
│   ├── public/                      # Public static files
│   └── index.html                   # Main HTML template
│
├── server/                          # Backend (Node.js + Express)
│   ├── models/                      # Mongoose database schemas
│   │   ├── Challenge.js             # Challenge schema (title, difficulty, testCases, starterCode)
│   │   ├── User.js                  # User profile and authentication schema
│   │   ├── Submission.js            # Code submission tracking schema
│   │   ├── Contest.js               # Contest configuration schema
│   │   └── ...                      # Other data models
│   ├── services/                    # Business logic and utilities
│   │   ├── ChallengeService.js      # Code execution, test case validation, leaderboard logic
│   │   ├── BadgeService.js          # Achievement and badge management
│   │   ├── AnalyticsService.js      # User progress and analytics
│   │   ├── collaboration/           # Real-time collaboration features
│   │   │   ├── index.js             # Collaboration service entry point
│   │   │   ├── OperationalTransform.js # Operational transformation for concurrent editing
│   │   │   └── SessionManager.js    # Manages collaboration sessions
│   │   └── visualizer/              # Code execution visualization
│   │       ├── index.js             # Visualizer service
│   │       └── parsers/             # Language-specific code parsers
│   │           ├── javascript.js    # JavaScript code visualization
│   │           ├── python.js        # Python code visualization
│   │           └── ...              # Other language parsers
│   ├── routes/                      # API route handlers
│   │   ├── challenges.js            # Challenge CRUD and submission endpoints
│   │   ├── codeQuality.js           # Code quality analysis endpoints
│   │   ├── progress.js              # User progress tracking endpoints
│   │   ├── gptRoute.js              # AI-powered explanation endpoints
│   │   └── ...                      # Other API routes
│   ├── middleware/                  # Express middleware
│   │   └── simpleRateLimiter.js     # Rate limiting middleware
│   ├── config/                      # Configuration files
│   │   └── database.js              # Database connection configuration
│   ├── seeds/                       # Database seed data
│   │   └── challenges.js            # Initial challenge data
│   └── index.js                     # Main server entry point
│
├── README.md                        # Project documentation
├── CONTRIBUTING.md                  # Contribution guidelines
├── package.json                     # Root package configuration
├── .gitignore                       # Git ignore rules
└── ...                              # Other root files (LICENSE, etc.)
```

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18 or above)
- npm or yarn
- MongoDB (local or MongoDB Atlas)


### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ANU-2524/JustCoding.git
cd JustCoding
```

### 2️⃣ Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key. Adjust other settings if needed (e.g., MongoDB URI for Atlas).

**Note:** Ensure MongoDB is running locally (default: `mongodb://localhost:27017/justcoding`) or update `MONGODB_URI` for MongoDB Atlas.

### 3️⃣ Run the Frontend (Client)
```bash
cd client
npm install
npm run dev
```

Frontend will run at:  
http://localhost:5173

### 4️⃣ Run the Backend (Server)
Open a new terminal and run:
```bash
cd server
npm install
npm run dev
```

Backend will run at:  
http://localhost:4334

**Important:** Keep both terminals running simultaneously — one for the client and one for the server.

(OR)

### 🐳 Quick Start with Docker

The easiest way to get started! Docker handles all dependencies and setup automatically.

**Steps:**
```bash
# Clone the repository
git clone https://github.com/ANU-2524/JustCoding.git
cd JustCoding

# Copy environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start all services (MongoDB, Backend, Frontend)
docker-compose up
```

That's it! 🎉
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4334
- **MongoDB**: localhost:27017

For detailed Docker documentation, see **[DOCKER.md](./DOCKER.md)**

---


## 🧪 Tech Stack (Because we love this stuff)

| Layer | Stack |
|------|------|
| **Frontend** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="42"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="42"/> <img src="https://cdn.simpleicons.org/framer/0055FF" width="42"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-plain.svg" width="42"/> |
| **Backend** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="42"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="42"/> |
| **Database** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" width="42"/> |
| **AI** | <img src="https://img.shields.io/badge/OpenAI-000000?style=for-the-badge&logo=openai&logoColor=white" height="42"/> |
| **Utilities** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="42"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/socketio/socketio-original.svg" width="42"/> |



---

## 🤝 Contributing

Contributions are welcome!  
Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on forking, branching, committing, and submitting pull requests.

---

## ❤️ Our Contributors

![Contributors](https://contributors-img.web.app/image?repo=ANU-2524/JustCoding)

👉 View all contributors: https://github.com/ANU-2524/JustCoding/graphs/contributors





## 📄 License

MIT License

---

## 💙 Final Note

JustCode is built to make learning and debugging code less intimidating and more human.

If this project helped you — even a little — that means everything 🌱

---

## 🏗️ API Standards

This section outlines the consistent response formats used across all API endpoints to ensure uniformity and simplify client-side handling.

### Success Responses
Success responses should return the relevant data object directly, without unnecessary wrappers. This keeps responses clean and focused on the data.

**Format:**
```json
{
  "key": "value",
  "anotherKey": {
    "nested": "object"
  }
}
```

**Examples:**
- From `/contests/:slug/join` (challenges.js):
  ```json
  {
    "participant": {
      "odId": "user123",
      "odName": "John Doe"
    }
  }
  ```
- From `/explain` (gptRoute.js):
  ```json
  {
    "explanation": "This is a simple explanation of the programming concept."
  }
  ```

### Error Responses
All error responses use a consistent format with an `error` key containing a descriptive string message.

**Format:**
```json
{
  "error": "Descriptive error message"
}
```

**Examples:**
- Validation error:
  ```json
  {
    "error": "Missing required fields"
  }
  ```
- Not found error:
  ```json
  {
    "error": "Challenge not found"
  }
  ```



## 📚 API Reference

### POST /contests/:slug/join

Joins a contest.

**Request Body:**

```json
{
  "odId": "string",
  "odName": "string" (optional)
}
```

**Response:**

```json
{
  "participant": {
    "odId": "string",
    "odName": "string"
  }
}
```

**Examples:**

- Successful join:

```json
{
  "participant": {
    "odId": "user123",
    "odName": "John Doe"
  }
}
```

- Already joined:

```json
{
  "participant": {
    "odId": "user123",
    "odName": "John Doe"
  }
}
```
