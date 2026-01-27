const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

// Import async handler and error utilities
const { asyncHandler } = require("../middleware/async");
const { BadRequestError, ExternalServiceError } = require("../utils/ErrorResponse");
const { logExternalService } = require("../services/logger");

// Node-fetch for CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ✅ RECOMMENDED OpenRouter model
const MODEL_NAME = "mistralai/mistral-7b-instruct";

router.post("/explain", asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  // Enhanced input validation using error classes
  if (!question) {
    throw new BadRequestError("Missing 'question' in request body.");
  }
  
  if (typeof question !== 'string') {
    throw new BadRequestError("'question' must be a string.");
  }
  
  if (question.length > 2000) {
    throw new BadRequestError("Question too long. Maximum 2000 characters allowed.");
  }
  
  if (question.trim().length === 0) {
    throw new BadRequestError("Question cannot be empty.");
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

  const data = await result.json();

  if (!data || !data.choices || !data.choices[0]?.message?.content) {
    logExternalService('OpenRouter', 'explain', false, { response: data });
    return res.json({ explanation: "💡 No explanation available." });
  }

  logExternalService('OpenRouter', 'explain', true);
  const reply = data.choices[0].message.content.trim();
  res.json({ explanation: reply });
}));

router.post("/debug", asyncHandler(async (req, res, next) => {
  const { code, errorMessage } = req.body;

  // Enhanced input validation using error classes
  if (!code) {
    throw new BadRequestError("Missing 'code' in request body.");
  }
  
  if (typeof code !== 'string') {
    throw new BadRequestError("'code' must be a string.");
  }
  
  if (code.length > 10000) {
    throw new BadRequestError("Code too long. Maximum 10,000 characters allowed.");
  }
  
  if (code.trim().length === 0) {
    throw new BadRequestError("Code cannot be empty.");
  }
  
  if (errorMessage && typeof errorMessage !== 'string') {
    throw new BadRequestError("'errorMessage' must be a string.");
  }
  
  if (errorMessage && errorMessage.length > 5000) {
    throw new BadRequestError("Error message too long. Maximum 5,000 characters allowed.");
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

  const data = await result.json();

  if (!data || !data.choices || !data.choices[0]?.message?.content) {
    logExternalService('OpenRouter', 'debug', false, { response: data });
    return res.json({ debugHelp: "🐞 No debugging help available." });
  }

  logExternalService('OpenRouter', 'debug', true);
  const reply = data.choices[0].message.content.trim();
  res.json({ debugHelp: reply });
}));

module.exports = router;
