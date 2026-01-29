const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

// Node-fetch for CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ✅ RECOMMENDED OpenRouter model
const MODEL_NAME = "mistralai/mistral-7b-instruct";

router.post("/explain", async (req, res) => {
  const { question } = req.body;

  // Enhanced input validation
  if (!question) {
    return res.status(400).json({ error: "❌ Missing 'question' in request body." });
  }
  
  if (typeof question !== 'string') {
    return res.status(400).json({ error: "❌ 'question' must be a string." });
  }
  
  if (question.length > 2000) {
    return res.status(400).json({ error: "❌ Question too long. Maximum 2000 characters allowed." });
  }
  
  if (question.trim().length === 0) {
    return res.status(400).json({ error: "❌ Question cannot be empty." });
  }

  try {
    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY not set in environment variables");
      return res.status(500).json({ error: "API key not configured. Please set OPENROUTER_API_KEY in .env" });
    }

    const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: `Explain this programming question in very simple terms:\n\n${question}`,
          },
        ],
      }),
    });

    // Check if response is ok
    if (!result.ok) {
      const errorText = await result.text();
      console.error(`❌ OpenRouter API error (${result.status}):`, errorText);
      return res.status(result.status).json({ error: `OpenRouter API error: ${result.statusText}` });
    }

    const data = await result.json();

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter response:", JSON.stringify(data, null, 2));
      return res.json({ explanation: "💡 No explanation available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ explanation: reply });
  } catch (err) {
    console.error("❌ Error fetching explanation from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get explanation. " + err.message });
  }
});

router.post("/debug", async (req, res) => {
  const { code, errorMessage } = req.body;

  // Enhanced input validation
  if (!code) {
    return res.status(400).json({ error: "❌ Missing 'code' in request body." });
  }
  
  if (typeof code !== 'string') {
    return res.status(400).json({ error: "❌ 'code' must be a string." });
  }
  
  if (code.length > 10000) {
    return res.status(400).json({ error: "❌ Code too long. Maximum 10,000 characters allowed." });
  }
  
  if (code.trim().length === 0) {
    return res.status(400).json({ error: "❌ Code cannot be empty." });
  }
  
  if (errorMessage && typeof errorMessage !== 'string') {
    return res.status(400).json({ error: "❌ 'errorMessage' must be a string." });
  }
  
  if (errorMessage && errorMessage.length > 5000) {
    return res.status(400).json({ error: "❌ Error message too long. Maximum 5,000 characters allowed." });
  }

  try {
    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY not set in environment variables");
      return res.status(500).json({ error: "API key not configured. Please set OPENROUTER_API_KEY in .env" });
    }

    const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: `Please help me debug this code:\n\n${code}\n\nError Message (if any):\n${errorMessage || "No specific error"}\n\nExplain what's wrong and suggest a fix.`,
          },
        ],
      }),
    });

    // Check if response is ok
    if (!result.ok) {
      const errorText = await result.text();
      console.error(`❌ OpenRouter API error (${result.status}):`, errorText);
      return res.status(result.status).json({ error: `OpenRouter API error: ${result.statusText}` });
    }

    const data = await result.json();

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter debug response:", JSON.stringify(data, null, 2));
      return res.json({ debugHelp: "🐞 No debugging help available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ debugHelp: reply });
  } catch (err) {
    console.error("❌ Error fetching debug help from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get debug help. " + err.message });
  }
});

module.exports = router;
