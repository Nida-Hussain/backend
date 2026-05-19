const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const generateContent = async (prompt) => {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "StudyBuddy AI",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data?.error?.message || error.message);
    throw new Error("AI generation failed. Please try again.");
  }
};

module.exports = { generateContent };
