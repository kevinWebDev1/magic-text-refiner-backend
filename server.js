const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Try these models in order:
const MODEL = "gemini-1.5-flash-001"; // Most reliable
// const MODEL = "gemini-1.0-pro-001"; 
// const MODEL = "gemini-pro";

const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${key}`;

app.get("/", (req, res) => {
  res.send("✅ Server is running.");
});

app.post("/chat", async (req, res) => {
  console.log("=== CHAT REQUEST ===");
  
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  console.log("API Key length:", userApiKey?.length);
  console.log("Text:", userText);

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    console.log("🔄 Calling Gemini...");
    
    const response = await axios.post(
      GEMINI_URL(userApiKey),
      {
        contents: [
          {
            parts: [{ text: userText }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log("✅ Gemini response success");
    const chatText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    res.json({ chatText });

  } catch (error) {
    console.error("❌ Gemini API Error:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
      
      // Specific error messages
      if (error.response.status === 404) {
        return res.status(400).json({ error: "Invalid model name. Try 'gemini-1.5-flash-001'" });
      } else if (error.response.status === 400) {
        return res.status(400).json({ error: "Bad request to Gemini API" });
      } else if (error.response.status === 403) {
        return res.status(403).json({ error: "API key invalid or no billing setup" });
      }
    }
    
    res.status(502).json({ error: "Gemini API unavailable" });
  }
});

// Add refine endpoint similarly
app.post("/refine", async (req, res) => {
  // Same structure as chat but with refine prompt
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey || !userText) {
    return res.status(400).json({ error: "Missing API key or text" });
  }

  const prompt = `Improve this text: ${userText}`;

  try {
    const response = await axios.post(
      GEMINI_URL(userApiKey),
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const refinedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    res.json({ refinedText });

  } catch (error) {
    console.error("Refine error:", error.response?.data || error.message);
    res.status(502).json({ error: "Gemini API error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Using model: ${MODEL}`);
});

module.exports = app;
