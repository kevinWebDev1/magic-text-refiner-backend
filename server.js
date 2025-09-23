const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

// local requires
const { CMDs } = require("./data.js");
const { CMS_PROMPTS } = require("./data.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API config
const MODEL_NAME = "gemini-2.5-flash-lite"; // really fast

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// Root
app.get("/", (_, res) => {
  res.send("✅ Server is running.");
});

// ---------------------- REFINE ENDPOINT ----------------------
app.post("/refine", async (req, res) => {
  const userText = req.body.text?.trim() || "";

  const PROMPT_TO_REFINE_TEXT = `Decode and correct heavily abbreviated or misspelled Hinglish text. 
Fix grammar, spelling, and clarity while preserving its original language (Romanized or native script), 
tone, and intent. Provide only the final corrected version: ${userText}`;

  const start = Date.now(); // start timer
  

  try {
    const response = await axios.post(
      API_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT_TO_REFINE_TEXT }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const refinedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const elapsed = Date.now() - start; // end timer
    console.log(`⏱ /refine response time: ${elapsed} ms`);
    

    res.json({ refinedText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refine text." });
  }
});

// ---------------------- CHAT ENDPOINT ----------------------
app.post("/chat", async (req, res) => {
  const userText = req.body.text?.trim() || "";
  console.log("userText ::>", userText);

  const prompt = `${getPrompt(userText)} ${userText}`;
  const start = Date.now(); // start timer
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

    const chatReply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const elapsed = Date.now() - start; // end timer
    console.log(`⏱ /refine response time: ${elapsed} ms`);
    
    res.json({ chatReply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to chat text." });
  }
});

// ---------------------- PROMPT HANDLER ----------------------
function getPrompt(userInput) {
  const defaultPrompt = `Please keep all responses concise and focused only on what is requested.
Avoid confirmations, extra explanations, or filler phrases.
Respond naturally and directly to the user input as if you are having a normal conversation.
Do not add phrases like 'Sure,' 'Got it,' or 'I understand'.
Only return the direct result.`;

  const command = userInput.split(" ")[0];
  return CMS_PROMPTS[command] ? CMS_PROMPTS[command] : defaultPrompt;
}

// ---------------------- SERVER ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
