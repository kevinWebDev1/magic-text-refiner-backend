const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// CONFIG
const MODEL_NAME_GEMINI = "gemini-2.5-flash-lite";
const GROQ_MODEL = "qwen/qwen3-32b";
const DAILY_LIMIT = 30; // Production Limit (Security Fallback)

// IN-MEMORY LIMIT (Note: Resets on Vercel cold boot)
const usageMap = new Map();

const getTodayDate = () => new Date().toISOString().split("T")[0];

const checkRateLimit = (deviceId) => {
  if (!deviceId) return { allowed: false, error: "Missing Device ID" };

  const today = getTodayDate();
  let stats = usageMap.get(deviceId);

  if (!stats || stats.date !== today) {
    stats = { count: 0, date: today };
    usageMap.set(deviceId, stats);
  }

  if (stats.count >= DAILY_LIMIT) {
    return { allowed: false, error: "Daily limit reached." };
  }
  return { allowed: true };
};

const incrementUsage = (deviceId) => {
  const stats = usageMap.get(deviceId);
  if (stats) stats.count++;
};

// ---------------------- AI HANDLERS ----------------------

async function callGemini(text, apiKey, prompt) {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME_GEMINI}:generateContent?key=${apiKey}`;
  try {
    const response = await axios.post(
      API_URL,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (e) {
    throw new Error("Gemini Failed");
  }
}

async function callGroq(text, prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq API Key Missing");

  const { Groq } = require("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a text tool inside a keyboard app for assitance. Output ONLY the refined text. Do not provide explanations, greeting, metadata, no <>think</> block at all, or 'Here is the your output'. No internal monologue. Strict output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: false,
      // reasoning_effort: "default", // Optional, depending on model support
      stop: null,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("Groq Error:", e.message);
    throw new Error("Groq Failed");
  }
}

// ---------------------- MAIN ROUTER ----------------------

const handleRequest = async (req, res, type) => {
  const userText = req.body.text?.trim();
  const userApiKey = req.headers.authorization?.replace("Bearer ", "");
  const deviceId = req.headers["x-device-id"];

  if (!userText) return res.status(400).json({ error: "Missing 'text'" });

  // 1. CHECK LIMIT (If no API Key)
  if (!userApiKey) {
    const check = checkRateLimit(deviceId);
    if (!check.allowed) return res.status(429).json({ error: check.error });
  }

  // 2. PREPARE PROMPT
  const prompt =
    type === "refine"
      ? `Refine this text. Correct grammar/spelling. Keep native script. Return ONLY result.\nInput: ${userText}`
      : `Short answer.\n${userText}`;

  let resultText = null;

  try {
    // 3. EXECUTE
    if (userApiKey) {
      try {
        resultText = await callGemini(userText, userApiKey, prompt);
      } catch (geminiErr) {
        // FALLBACK (Unlimited for Key holders)
        resultText = await callGroq(userText, prompt);
      }
    } else {
      // FREE TIER
      resultText = await callGroq(userText, prompt);
      incrementUsage(deviceId);
    }

    // 4. RESPONSE
    const key = type === "refine" ? "refinedText" : "chatText";
    res.json({ [key]: resultText });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(502).json({ error: "AI Service Failed" });
  }
};

app.post("/refine", (req, res) => handleRequest(req, res, "refine"));
app.post("/chat", (req, res) => handleRequest(req, res, "chat"));

app.get("/app-update", (req, res) => {
  const clientVersion = req.query.version || "0.0";
  const latestVersion = "2.0";
  const updateAvailable = clientVersion !== latestVersion;

  res.json({
    updateAvailable: updateAvailable,
    latestVersion: latestVersion,
    forceUpdate: updateAvailable,
    updateUrl: "https://refinerkeyboard.vercel.app",
    changelog: `🚀 New Version 2.2:

• Improved API integration with a redesigned setup  
• Update your API key anytime from Settings  
• Faster startup and smarter clipboard sync  
• Bug fixes and stability improvements.`,

  });
});

app.get("/", (_, res) => res.send("Refiner AI Backend Live"));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
