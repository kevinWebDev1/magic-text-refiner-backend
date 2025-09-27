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

// Root
app.get("/", (_, res) => {
  res.send("✅ Server is running.");
});

// ---------------------- REFINE ENDPOINT ----------------------
app.post("/refine", async (req, res) => {
  const userText = req.body.text?.trim() || "";
  const userApiKey = process.env.GEMINI_API_KEY;
  // const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  const PROMPT_TO_REFINE_TEXT = `Decode and correct heavily abbreviated or misspelled text. Detect the input’s language style (Hinglish, Hindi script, English, or any other language). Correct grammar, spelling, and clarity while preserving the original tone and intent. Ensure the output remains in the same script (Romanized for Hinglish, Devanagari for Hindi, standard English for English, or the respective script for other languages). Provide only the final corrected version. Input: "${userText}"`;

  const start = Date.now();

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

    const elapsed = Date.now() - start;
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
  // const userApiKey = req.headers.authorization?.replace('Bearer ', '');
  const userApiKey = process.env.GEMINI_API_KEY;


  if (!userApiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

  console.log("userText ::>", userText);

  const prompt = `${getPrompt(userText)} "${userText}"`;
  const start = Date.now();
  
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

    const chatText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const elapsed = Date.now() - start;
    console.log(`⏱ /chat response time: ${elapsed} ms`);

    res.json({ chatText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to chat text." });
  }
});

// ---------------------- PROMPT HANDLER ----------------------
function getPrompt(userInput) {
  const defaultPrompt = `Please keep all responses concise and focused only on what is requested. Avoid confirmations, extra explanations, or filler phrases. Respond naturally and directly to the user input as if you are having a normal conversation. Do not add phrases like 'Sure,' 'Got it,' or 'I understand'. Only return the direct result.`;

  // Build regex: match any command in CMDs if followed by space, punctuation, or end of string
  const commandPattern = new RegExp(
    `(${CMDs.map(cmd => cmd.replace('/', '\\/')).join('|')})(?=\\s|$|[.,!?])`,
    'i' // case-insensitive
  );

  const match = userInput.match(commandPattern);

  // Pick the right prompt if command exists, else default
  const prompt = match && CMS_PROMPTS[match[1].toLowerCase()]
    ? CMS_PROMPTS[match[1].toLowerCase()]
    : defaultPrompt;

  console.log("cmd ::>", match?.[1]);
  return prompt;
}


// ---------------------- SERVER ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});