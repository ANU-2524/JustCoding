import express from "express";
import dotenv from "dotenv";
const router = express.Router();
import { validate } from '../middleware/validation.js';
dotenv.config();

// Import async handler and error utilities
import { asyncHandler } from "../middleware/async.js";
import { BadRequestError, ExternalServiceError } from "../utils/ErrorResponse.js";
import { logExternalService } from "../services/logger.js";

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
      return res.json({ success: false, explanation: "💡 No explanation available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ success: true, explanation: reply });
  } catch (err) {
    console.error("❌ Error fetching explanation from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get explanation. " + err.message });
  }
})

/**
 * POST /api/gpt/debug
 * Get AI debugging assistance for code
 * Returns: { success, debugHelp }
 */
router.post("/debug", validate('gptDebug'), async (req, res) => {
  const { code, errorMessage } = req.body;

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
      return res.json({ success: false, debugHelp: "🐞 No debugging help available." });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ success: true, debugHelp: reply });
  } catch (err) {
    console.error("❌ Error fetching debug help from OpenRouter:", err);
    res.status(500).json({ error: "Failed to get debug help. " + err.message });
  }

  logExternalService('OpenRouter', 'debug', true);
  const reply = data.choices[0].message.content.trim();
  res.json({ debugHelp: reply });
});

export default router;
