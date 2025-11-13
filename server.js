const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const MODEL = "gemini-1.5-flash";
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${key}`;

// Root endpoint
app.get("/", (_, res) => {
  res.send("✅ Server is running.");
});

// Refine endpoint
app.post("/refine", async (req, res) => {
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    return res.status(400).json({ error: "Missing text" });
  }

  const prompt = `Improve and refine this text while keeping its original meaning. Fix grammar, spelling, and clarity: ${userText}`;

  try {
    const response = await axios.post(
      GEMINI_URL(userApiKey),
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const refinedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ refinedText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refine text." });
  }
});

// Chat endpoint
app.post("/chat", async (req, res) => {
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
        contents: [
          {
            role: "user",
            parts: [{ text: userText }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const chatText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ chatText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

module.exports = app;
