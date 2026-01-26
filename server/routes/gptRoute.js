const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const { validate } = require('../middleware/validation');
dotenv.config();

// Node-fetch for CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ✅ RECOMMENDED OpenRouter model
const MODEL_NAME = "mistralai/mistral-7b-instruct";

/**
 * POST /api/gpt/explain
 * Get AI explanation for programming question
 * Returns: { success, explanation }
 */
router.post("/explain", validate('gptExplain'), async (req, res) => {
  const { question } = req.body;

  try {
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

    const data = await result.json();

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter response:", JSON.stringify(data, null, 2));
      return res.json({ success: false, explanation: "💡 No explanation available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ success: true, explanation: reply });
  } catch (err) {
    console.error("❌ Error fetching explanation from OpenRouter:", err);
    res.status(500).json({ success: false, error: "Failed to get explanation." });
  }
});

/**
 * POST /api/gpt/debug
 * Get AI debugging assistance for code
 * Returns: { success, debugHelp }
 */
router.post("/debug", validate('gptDebug'), async (req, res) => {
  const { code, errorMessage } = req.body;

  try {
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

    const data = await result.json();

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ Invalid OpenRouter debug response:", JSON.stringify(data, null, 2));
      return res.json({ success: false, debugHelp: "🐞 No debugging help available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ success: true, debugHelp: reply });
  } catch (err) {
    console.error("❌ Error fetching debug help from OpenRouter:", err);
    res.status(500).json({ success: false, error: "Failed to get debug help." });
  }
});

module.exports = router;
