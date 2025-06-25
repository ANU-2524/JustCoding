const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

// Node-fetch for CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.post("/explain", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "❌ Missing 'question' in request body." });
  }

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

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter response:", JSON.stringify(data, null, 2));
      return res.json({ explanation: "💡 No explanation available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ explanation: reply });
  } catch (err) {
    console.error("❌ Error fetching explanation from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get explanation." });
  }
});

router.post("/debug", async (req, res) => {
  const { code, errorMessage } = req.body;

  if (!code) {
    return res.status(400).json({ error: "❌ Missing 'code' in request body." });
  }

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

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter debug response:", JSON.stringify(data, null, 2));
      return res.json({ debugHelp: "🐞 No debugging help available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ debugHelp: reply });
  } catch (err) {
    console.error("❌ Error fetching debug help from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get debug help." });
  }
});

module.exports = router;
