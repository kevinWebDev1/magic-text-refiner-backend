const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Use gemini-2.0-flash-lite
const MODEL = "gemini-2.0-flash-lite";
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${key}`;

// Simple rate limiting
const rateLimitStore = new Map();

const rateLimit = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!apiKey) return next();
  
  const now = Date.now();
  const windowStart = now - 60000;
  
  if (!rateLimitStore.has(apiKey)) {
    rateLimitStore.set(apiKey, []);
  }
  
  const requests = rateLimitStore.get(apiKey).filter(time => time > windowStart);
  rateLimitStore.set(apiKey, requests);
  
  if (requests.length >= 10) {
    return res.status(429).json({ error: "Rate limit exceeded. Wait 1 minute." });
  }
  
  requests.push(now);
  next();
};

app.use(rateLimit);

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Server is running.");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Update end point
app.get("/app-update", (req, res) => {
  const currentVersion = req.query.version || "1.0.0";
  const platform = req.query.platform || "android";
  
  // Configure these for your app
  const LATEST_VERSION = "2.0.0";
  const FORCE_UPDATE = false;
  const UPDATE_URL = "https://play.google.com/store/apps/details?id=rkr.simplekeyboard.inputmethod";
  
  const isUpdateAvailable = isNewerVersion(LATEST_VERSION, currentVersion);
  
  res.json({
    updateAvailable: isUpdateAvailable,
    latestVersion: LATEST_VERSION,
    forceUpdate: FORCE_UPDATE,
    updateUrl: UPDATE_URL,
    changelog: "🎉 New Features:\n• AI Command Buttons\n• Smart Translation\n• Enhanced Refine\n• Better UI/UX\n\n🐛 Bug fixes and performance improvements",
    timestamp: new Date().toISOString()
  });
});

function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestNum = latestParts[i] || 0;
    const currentNum = currentParts[i] || 0;
    
    if (latestNum > currentNum) return true;
    if (latestNum < currentNum) return false;
  }
  return false;
}

// Chat endpoint
app.post("/chat", async (req, res) => {
  console.log("=== CHAT REQUEST ===");
  
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const response = await axios.post(
      GEMINI_URL(userApiKey),
      {
        contents: [{ parts: [{ text: userText }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const chatText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    res.json({ chatText });

  } catch (error) {
    console.error("❌ Chat Error:", error.response?.data?.error?.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: "AI service busy. Please wait." });
    }
    
    res.status(502).json({ error: "AI service unavailable" });
  }
});

// Refine endpoint
app.post("/refine", async (req, res) => {
  console.log("=== REFINE REQUEST ===");
  
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    return res.status(400).json({ error: "Missing text" });
  }

  const prompt = `Decode and correct heavily abbreviated or misspelled text. Detect the input’s language style (Hinglish, Hindi script, English, or any other language). Correct grammar, spelling, and clarity while preserving the original tone and intent. Ensure the output remains in the same script (Romanized for Hinglish, Devanagari for Hindi, standard English for English, or the respective script for other languages). Provide only the final corrected version. Input: "${userText}"`;

  try {
    const response = await axios.post(
      GEMINI_URL(userApiKey),
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const refinedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    res.json({ refinedText });

  } catch (error) {
    console.error("❌ Refine Error:", error.response?.data?.error?.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: "AI service busy. Please wait." });
    }
    
    res.status(502).json({ error: "AI service unavailable" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Using model: ${MODEL}`);
});

module.exports = app;
