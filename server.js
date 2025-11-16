require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIG ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash"; // Confirmed stable as of Nov 2025

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY not set in .env");
  process.exit(1);
}
console.log("Using model:", MODEL);

// --- CALL GEMINI (WITH FULL ERROR LOGS) ---
async function gemini(prompt) {
  try {
    console.log("Calling Gemini with prompt:", prompt.substring(0, 100) + "..."); // Log partial prompt
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 15000 } // Slightly longer timeout
    );
    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("Empty response from Gemini");
    console.log("Gemini success! Response length:", text.length);
    return text;
  } catch (e) {
    // LOG FULL ERROR FOR DEBUG
    console.error("FULL GEMINI ERROR:", {
      message: e.message,
      status: e.response?.status,
      statusText: e.response?.statusText,
      data: e.response?.data,
      code: e.code
    });
    
    // Better error mapping
    const status = e.response?.status;
    if (status === 400 || status === 403) {
      throw new Error(`Invalid API key: ${e.response?.data?.error?.message || 'Check .env key'}`);
    }
    if (status === 429) {
      throw new Error("Quota exceeded – wait or get new key");
    }
    if (status === 503) {
      throw new Error("Model overloaded (503) – try again in 1-2 min");
    }
    if (status >= 500) {
      throw new Error(`Gemini server error (${status}): ${e.response?.data?.error?.message || 'Try later'}`);
    }
    throw new Error(`Network/AI error: ${e.message} (Status: ${status})`);
  }
}

// --- ENDPOINTS ---

app.get("/app-update", (req, res) => {
  const v = req.query.version || "1.0.0";
  const latest = "2.0.0";
  const isNew = (a, b) => {
    const ap = a.split('.').map(Number);
    const bp = b.split('.').map(Number);
    for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
      if ((ap[i] || 0) > (bp[i] || 0)) return true;
      if ((ap[i] || 0) < (bp[i] || 0)) return false;
    }
    return false;
  };
  res.json({
    updateAvailable: isNew(latest, v),
    latestVersion: latest,
    updateUrl: "https://play.google.com/store/apps/details?id=rkr.simplekeyboard.inputmethod"
  });
});

app.post("/chat", async (req, res) => {
  console.log("CHAT request received");
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "No text" });
  try {
    const result = await gemini(text);
    res.json({ chatText: result });
  } catch (e) {
    console.error("CHAT failed:", e.message);
    res.status(502).json({ error: e.message, chatText: "" });
  }
});

app.post("/refine", async (req, res) => {
  console.log("REFINE request received");
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "No text" });
  const prompt = `Fix grammar, spelling, clarity. Keep Hinglish/Hindi/English. Output only final text. Input: "${text}"`;
  try {
    const result = await gemini(prompt);
    res.json({ refinedText: result });
  } catch (e) {
    console.error("REFINE failed:", e.message);
    res.status(502).json({ error: e.message, refinedText: text });
  }
});

module.exports = app;
