/**
 * Refiner Keyboard AI Backend – NO RATE LIMIT
 * • Users pass their own Gemini key via Bearer token
 * • /refine (Hinglish/Hindi-aware)
 * • /chat
 * • /app-update
 * • /health
 * • CORS enabled
 * • Vercel-ready
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// --- Config ---
const MODEL = "gemini-2.0-flash-lite";
const PORT = process.env.PORT || 5000;

// --- Helper: Call Gemini ---
async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" }, timeout: 12000 }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("Empty response from AI");
    return text;
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error("Gemini API Error:", msg);
    throw new Error(
      msg.includes("quota") || error.response?.status === 429
        ? "AI quota exceeded or rate limited. Try again later."
        : "AI service unavailable. Check your API key."
    );
  }
}

// --- Middleware: Extract Bearer key ---
const extractApiKey = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer API key" });
  }
  req.userApiKey = auth.split(" ")[1].trim();
  next();
};

// --- Endpoints ---
app.get("/", (req, res) => {
  res.send("Refiner AI Backend (no rate limit). Use /refine or /chat.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    model: MODEL,
    timestamp: new Date().toISOString(),
    note: "Rate limiting is disabled"
  });
});

app.get("/app-update", (req, res) => {
  const currentVersion = req.query.version || "1.0.0";

  const LATEST_VERSION = "2.0.0";
  const FORCE_UPDATE = false;
  const UPDATE_URL =
    "https://play.google.com/store/apps/details?id=rkr.simplekeyboard.inputmethod";

  const isUpdateAvailable = isNewerVersion(LATEST_VERSION, currentVersion);

  res.json({
    updateAvailable: isUpdateAvailable,
    latestVersion: LATEST_VERSION,
    forceUpdate: FORCE_UPDATE,
    updateUrl: UPDATE_URL,
    changelog: `New Features:
• AI Command Buttons
• Smart Translation
• Enhanced Refine
• Better UI/UX

Bug fixes and performance improvements`,
    timestamp: new Date().toISOString()
  });
});

function isNewerVersion(latest, current) {
  const latestParts = latest.split(".").map(Number);
  const currentParts = current.split(".").map(Number);
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

// --- /chat ---
app.post("/chat", extractApiKey, async (req, res) => {
  console.log("CHAT REQUEST");
  const userText = req.body.text?.trim();
  if (!userText) return res.status(400).json({ error: "Missing 'text'" });

  try {
    const chatText = await callGemini(userText, req.userApiKey);
    res.json({ chatText });
  } catch (error) {
    res.status(502).json({ error: error.message, chatText: "" });
  }
});

// --- /refine (Hinglish/Hindi-aware) ---
app.post("/refine", extractApiKey, async (req, res) => {
  console.log("REFINE REQUEST");
  const userText = req.body.text?.trim();
  if (!userText) return res.status(400).json({ error: "Missing 'text'" });

  const prompt = `Decode and correct heavily abbreviated or misspelled text. Detect the input’s language style (Hinglish, Hindi script, English, or any other language). Correct grammar, spelling, and clarity while preserving the original tone and intent. Ensure the output remains in the same script (Romanized for Hinglish, Devanagari for Hindi, standard English for English, or the respective script for other languages). Provide only the final corrected version. Input: "${userText}"`;

  try {
    const refinedText = await callGemini(prompt, req.userApiKey);
    res.json({ refinedText });
  } catch (error) {
    res.status(502).json({
      error: error.message,
      refinedText: userText // fallback to original
    });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Rate limiting: DISABLED`);
});

module.exports = app;
