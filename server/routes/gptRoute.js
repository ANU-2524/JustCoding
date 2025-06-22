// gptRoute.js
const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

// For node-fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.post("/explain", async (req, res) => {
  const { question } = req.body;

  try {
    const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Explain this programming question in very simple terms:\n\n${question}`,
          },
        ],
      }),
    });

    const data = await result.json();
    const reply = data?.choices?.[0]?.message?.content || "No explanation available.";
    res.json({ explanation: reply });
  } catch (err) {
    res.status(500).json({ error: "Failed to get explanation." });
  }
});

router.post("/debug", async (req, res) => {
  const { code, errorMessage } = req.body;

  try {
    const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Please help me debug this code:\n\n${code}\n\nError Message (if any):\n${errorMessage || "No specific error"}\n\nExplain what's wrong and suggest a fix.`,
          },
        ],
      }),
    });

    const data = await result.json();
    const reply = data?.choices?.[0]?.message?.content || "No debugging help available.";
    res.json({ debugHelp: reply });
  } catch (err) {
    res.status(500).json({ error: "Failed to get debug help." });
  }
});

module.exports = router;
