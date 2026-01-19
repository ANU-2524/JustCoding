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
├── client/ # Frontend (React + Vite)
│ ├── src/
│ ├── public/
│ └── index.html
│
├── server/ # Backend (Node + Express)
│
├── README.md
├── CONTRIBUTING.md
└── .gitignore
```

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18 or above)
- npm or yarn
- MongoDB (local or MongoDB Atlas)


### 1️⃣ Clone the Repository

git clone https://github.com/your-username/JustCoding.git

cd JustCoding

2️⃣ Run the Frontend (Client)
```bash
cd client
npm install
npm run dev

```

Frontend will run at:
http://localhost:5173

3️⃣ Run the Backend (Server)
Open a new terminal and run:
```bash
cd server
npm install
npm run dev

```

Backend will run at:
http://localhost:4334


Important:
You must keep two terminals running at the same time — one for the client and one for the server.

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
