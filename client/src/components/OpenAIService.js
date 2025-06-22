const OpenAIService = async (promptText) => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("❌ Missing API key: VITE_OPENROUTER_API_KEY not found in environment.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // Optional but recommended
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: promptText }],
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    } else {
      return "🤖 AI Assistant didn’t respond with a valid message.";
    }
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return "⚠️ AI assistant failed to respond.";
  }
};

export default OpenAIService;
