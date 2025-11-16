const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIG ---
const MODEL = "gemini-2.0-flash-lite";

// --- CALL GEMINI ---
async function gemini(prompt, key) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${key}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 10000 }
    );
    return res.data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    throw new Error(e.response?.status === 400 || e.response?.status === 403
      ? "Invalid API key"
      : e.response?.status === 429
      ? "Quota exceeded"
      : "AI error"
    );
  }
}

// --- AUTH ---
const auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "No API key" });
  req.key = h.split(" ")[1].trim();
  next();
};

// --- ENDPOINTS ---

app.get("/app-update", (req, res) => {
  const v = req.query.version || "1.0.0";
  const latest = "2.0.0";
  const isNew = (a, b) => a.split('.').map(Number).some((n, i) => n > (b.split('.')[i] || 0) || (n < (b.split('.')[i] || 0) ? false : false));
  res.json({
    updateAvailable: isNew(latest, v),
    latestVersion: latest,
    updateUrl: "https://play.google.com/store/apps/details?id=rkr.simplekeyboard.inputmethod"
  });
});

app.post("/chat", auth, async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "No text" });
  try {
    const result = await gemini(text, req.key);
    res.json({ chatText: result });
  } catch (e) {
    res.status(502).json({ error: e.message, chatText: "" });
  }
});

app.post("/refine", auth, async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "No text" });
  const prompt = `Fix grammar, spelling, clarity. Keep language (Hinglish/Hindi/English). Output only final text. Input: "${text}"`;
  try {
    const result = await gemini(prompt, req.key);
    res.json({ refinedText: result });
  } catch (e) {
    res.status(502).json({ error: e.message, refinedText: text });
  }
});

module.exports = app;
