const BASE_URL = import.meta.env.VITE_BACKEND_URL + "/api/gpt";

export const getExplanation = async (question) => {
  try {
    const res = await fetch(`${BASE_URL}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    return data.explanation || "🤖 No explanation available.";
  } catch (err) {
    console.error("❌ Explanation API error:", err);
    return "⚠️ AI failed to explain.";
  }
};

export const getDebugSuggestion = async (code, errorMessage) => {
  try {
    const res = await fetch(`${BASE_URL}/debug`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, errorMessage }),
    });
    const data = await res.json();
    return data.debugHelp || "🐞 No debugging suggestion found.";
  } catch (err) {
    console.error("❌ Debug API error:", err);
    return "⚠️ AI failed to debug.";
  }
};

