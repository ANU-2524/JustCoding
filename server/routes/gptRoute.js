const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf";

// ✅ EXPLAIN Route
router.post("/explain", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  try {
    const result = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Explain this programming question simply: ${question}`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      }),
    });

    const data = await result.json();

    const reply = data?.generated_text || "💡 No explanation available.";
    res.json({ explanation: reply.trim() });
  } catch (err) {
    console.error("❌ Hugging Face explain error:", err);
    res.status(500).json({ error: "Failed to fetch explanation" });
  }
});

// ✅ DEBUG Route
router.post("/debug", async (req, res) => {
  const { code, errorMessage } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const result = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Please help debug the following code:\n\n${code}\n\nError message:\n${errorMessage || "None"}\n\nExplain the issue and fix it.`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        },
      }),
    });

    const data = await result.json();

    const reply = data?.generated_text || "🐞 No debug help available.";
    res.json({ debugHelp: reply.trim() });
  } catch (err) {
    console.error("❌ Hugging Face debug error:", err);
    res.status(500).json({ error: "Failed to fetch debug help" });
  }
});

module.exports = router;
