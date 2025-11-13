const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API config
const MODEL_NAME = "gemini-2.0-flash-lite"; // really fast

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

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  const prompt = `Improve and refine this text while keeping its original meaning. Fix grammar, spelling, and clarity: ${userText}`;

  try {
    const response = await axios.post(
      API_URL,
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
      }
    );

    const refinedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ refinedText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refine text." });
  }
});

// chat endpoint for everything
app.post("/chat", async (req, res) => {
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  try {
    const response = await axios.post(
      API_URL,
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
      }
    );

    const chatText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ chatText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
