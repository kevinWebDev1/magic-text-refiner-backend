// api/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MODEL
const MODEL_NAME = "gemini-2.0-flash"; // FREE, FAST
app.get("/", (_, res) => res.send("Refiner AI Backend – LIVE"));

// ---------------------- APP UPDATE ----------------------
app.get("/app-update", (req, res) => {
  const current = req.query.version || "1.0.0";
  const LATEST = "1.1.0";
  const UPDATE_URL = "https://refine-board-landing-page.vercel.app";

  const isNewer = (a, b) => {
    const ap = a.split('.').map(Number);
    const bp = b.split('.').map(Number);
    for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
      const av = ap[i] || 0;
      const bv = bp[i] || 0;
      if (av > bv) return true;
      if (av < bv) return false;
    }
    return false;
  };

  res.json({
    updateAvailable: isNewer(LATEST, current),
    latestVersion: LATEST,
    forceUpdate: false,
    updateUrl: UPDATE_URL,
    changelog: `New Features:
• AI Command Buttons
• Smart Translation
• Enhanced Refine
• Better UI/UX

Bug fixes and performance improvements`
  });
});

// ---------------------- REFINE ----------------------
app.post("/refine", async (req, res) => {
  const userText = req.body.text?.trim();
  const userApiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!userText) return res.status(400).json({ error: "Missing 'text'" });
  if (!userApiKey) return res.status(401).json({ error: "Missing Bearer API key" });

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  const PROMPT = `You are a text-refinement engine inside a keyboard app. Fix grammar, spelling, and any mistakes. 
Make sure speelings are correct.
Return ONLY the improved text user input: ${userText}`;

  try {
    const response = await axios.post(API_URL, {
      contents: [{ role: "user", parts: [{ text: PROMPT }] }]
    }, { headers: { "Content-Type": "application/json" } });

    const refinedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || userText;
    res.json({ refinedText }); // Matches Android: expects "refinedText"
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error("REFINE ERROR:", msg);
    res.status(502).json({ error: "AI failed", details: msg });
  }
});

// ---------------------- CHAT ----------------------
app.post("/chat", async (req, res) => {
  const userText = req.body.text?.trim();
  const userApiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!userText) return res.status(400).json({ error: "Missing 'text'" });
  if (!userApiKey) return res.status(401).json({ error: "Missing Bearer API key" });

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  const prompt = `To the point short direct answer no even small extra fuzz ${userText}`;

  try {
    const response = await axios.post(API_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    }, { headers: { "Content-Type": "application/json" } });

    const chatText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response";
    res.json({ chatText }); // Matches Android: expects "chatText"
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error("CHAT ERROR:", msg);
    res.status(502).json({ error: "AI failed", details: msg });
  }
});

// ---------------------- START ----------------------
app.listen(PORT, () => {
  console.log(`Refiner AI LIVE at http://localhost:${PORT}`);
  console.log(`Update: http://localhost:${PORT}/app-update?version=1.5.0`);
});
