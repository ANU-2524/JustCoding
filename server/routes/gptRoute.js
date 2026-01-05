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

  // Simple fallback debug suggestions
  const debugSuggestions = {
    cpp: "✅ C++ Debug Tips:\n• Add 'using namespace std;' after includes\n• Check for missing semicolons\n• Ensure main() returns int\n• Use cout for output",
    c: "✅ C Debug Tips:\n• Include <stdio.h> for printf\n• Check for missing semicolons\n• Use %d for integers in printf\n• Ensure main() returns int",
    java: "✅ Java Debug Tips:\n• Check class name matches filename\n• Use System.out.println() for output\n• Ensure proper main method signature\n• Check for missing semicolons",
    python: "✅ Python Debug Tips:\n• Check indentation (use spaces, not tabs)\n• Use print() for output\n• Check for missing colons after if/for\n• Ensure proper variable names",
    javascript: "✅ JavaScript Debug Tips:\n• Use console.log() for output\n• Check for missing semicolons\n• Ensure proper variable declarations\n• Check bracket matching",
    typescript: "✅ TypeScript Debug Tips:\n• Check type annotations\n• Use console.log() for output\n• Ensure proper interface definitions\n• Check for missing semicolons",
    go: "✅ Go Debug Tips:\n• Use fmt.Println() for output\n• Check package main declaration\n• Ensure proper import statements\n• Check for missing braces",
    rust: "✅ Rust Debug Tips:\n• Use println!() macro for output\n• Check for missing semicolons\n• Ensure proper variable declarations\n• Check ownership and borrowing",
    php: "✅ PHP Debug Tips:\n• Start with <?php tag\n• Use echo for output\n• Check for missing semicolons\n• Ensure proper variable syntax ($var)",
    ruby: "✅ Ruby Debug Tips:\n• Use puts for output\n• Check for missing 'end' keywords\n• Ensure proper indentation\n• Check variable naming",
    swift: "✅ Swift Debug Tips:\n• Use print() for output\n• Check for missing semicolons\n• Ensure proper variable declarations\n• Check bracket matching",
    kotlin: "✅ Kotlin Debug Tips:\n• Use println() for output\n• Check fun main() declaration\n• Ensure proper variable declarations\n• Check for missing semicolons",
    csharp: "✅ C# Debug Tips:\n• Use Console.WriteLine() for output\n• Check using System; declaration\n• Ensure proper class structure\n• Check for missing semicolons",
    scala: "✅ Scala Debug Tips:\n• Use println() for output\n• Check object declaration\n• Ensure proper variable declarations\n• Check for missing braces",
    dart: "✅ Dart Debug Tips:\n• Use print() for output\n• Check void main() declaration\n• Ensure proper variable types\n• Check for missing semicolons",
    lua: "✅ Lua Debug Tips:\n• Use print() for output\n• Check for missing 'end' keywords\n• Ensure proper variable declarations\n• Check conditional syntax",
    perl: "✅ Perl Debug Tips:\n• Use print for output\n• Check for missing semicolons\n• Ensure proper variable syntax ($var)\n• Check use strict; declaration",
    r: "✅ R Debug Tips:\n• Use print() or cat() for output\n• Check assignment operator (<-)\n• Ensure proper function calls\n• Check for missing parentheses",
    matlab: "✅ MATLAB Debug Tips:\n• Use disp() for output\n• Check for missing semicolons\n• Ensure proper variable declarations\n• Check function syntax",
    sql: "✅ SQL Debug Tips:\n• Check SELECT statement syntax\n• Ensure proper table/column names\n• Check for missing semicolons\n• Verify JOIN conditions"
  };

  try {
    // Try AI first
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
            content: `Debug this code and provide specific fixes:\n\nCode:\n${code}\n\nError:\n${errorMessage || "No specific error"}`,
          },
        ],
      }),
    });

    const data = await result.json();

    if (data && data.choices && data.choices[0]?.message?.content) {
      const reply = data.choices[0].message.content.trim();
      return res.json({ debugHelp: reply });
    }
  } catch (err) {
    console.error("❌ AI debug failed:", err);
  }

  // Fallback to language-specific suggestions
  const language = detectLanguage(code);
  const suggestion = debugSuggestions[language] || "✅ General Debug Tips:\n• Check syntax errors\n• Verify variable names\n• Ensure proper imports/includes\n• Check for missing semicolons";
  
  res.json({ debugHelp: suggestion });
});

function detectLanguage(code) {
  if (code.includes('#include') && code.includes('cout')) return 'cpp';
  if (code.includes('#include') && code.includes('printf')) return 'c';
  if (code.includes('public class') || code.includes('System.out')) return 'java';
  if (code.includes('print(') && !code.includes(';') && !code.includes('<?php')) return 'python';
  if (code.includes('console.log') || code.includes('let ') || code.includes('const ')) return 'javascript';
  if (code.includes('interface ') || code.includes(': number') || code.includes(': string')) return 'typescript';
  if (code.includes('package main') || code.includes('fmt.Println')) return 'go';
  if (code.includes('fn main()') || code.includes('println!')) return 'rust';
  if (code.includes('<?php') || code.includes('echo ')) return 'php';
  if (code.includes('puts ') || code.includes('def ') && !code.includes('(')) return 'ruby';
  if (code.includes('print(') && code.includes('let ') && !code.includes('console')) return 'swift';
  if (code.includes('fun main()') || code.includes('println(')) return 'kotlin';
  if (code.includes('using System') || code.includes('Console.WriteLine')) return 'csharp';
  if (code.includes('object ') && code.includes('extends App')) return 'scala';
  if (code.includes('void main()') && code.includes('print(')) return 'dart';
  if (code.includes('print(') && code.includes('then')) return 'lua';
  if (code.includes('my $') || code.includes('use strict')) return 'perl';
  if (code.includes('<-') || code.includes('cat(')) return 'r';
  if (code.includes('disp(') || code.includes('fprintf')) return 'matlab';
  if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
  return 'general';
}

module.exports = router;
