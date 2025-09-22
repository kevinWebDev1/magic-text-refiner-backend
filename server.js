const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");
// local requires
const { CMDs } = require('./data.js');
const { CMS_PROMPTS } = require('./data.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from any origin (for your keyboard app)
app.use(cors());

app.use(bodyParser.json());

// API configuration
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

app.get("/", (_, res) => {
  res.send("Welcome your server is running.");
});

app.post("/refine", async (req, res) => { // Refine End Point
  const userText = req.body.text?.trim() || "";

  PROMPT_TO_REFINE_TEXT = `Decode and correct heavily abbreviated or misspelled Hinglish text. Fix grammar, spelling, and clarity while Preserve its original language (Romanized or native script), tone, and intent.. Provide only the final corrected version: ${userText}
`

  try {
    const response = await axios.post(API_URL,
      {
        contents: [
          {
            parts: [{ text: PROMPT_TO_REFINE_TEXT }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
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
// -------------------------------------------------------------------------------------
app.post("/chat", async (req, res) => {  // Chat End Point
  const userText = req.body.text?.trim() || "";
  console.log("userText ::>", userText);
  

  const prompt = `${getPrompt(userText)} ${userText}`

  try {
    const response = await axios.post(API_URL, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const chatReply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ chatReply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to chat text." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


function getPrompt(userInput) {
  const defaultPrompt = `Please keep all responses concise and focused only on what is requested.
Avoid confirmations, extra explanations, or filler phrases.
Respond naturally and directly to the user input as if you are having a normal conversation.
Do not add phrases like 'Sure,' 'Got it,' or 'I understand'
Only return the direct result.`;

  const command = userInput.split(" ")[0];
  return CMS_PROMPTS[command] ? CMS_PROMPTS[command] : defaultPrompt
};

