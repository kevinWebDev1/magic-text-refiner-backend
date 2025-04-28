const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://127.0.0.1:5500/frontend",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(bodyParser.json());

app.post("/refine", async (req, res) => {
  const userText = req.body.text;

  const prompt = `Refine the given text by first understanding the intended action or emotion behind it.
  Look for any minor spelling mistakes and correct them while maintaining the original tone and meaning.
  If text is in hinglish, then keep it hinglish but correct any minor spelling mistakes.
  When refining text, if two words are approximately 90% similar in spelling and appear in the same sentence or structure,
  do not assume they are different words unless the context clearly demands it.
  Focus on improving clarity without altering the essence or intent of the message,
  as do fix grammer mistakes and type the missing words even they are in hinglish or english.
  Do not add extra context, no prefixes like "refined text:", or explanations.
  Text: "${userText}"`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
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

    const refinedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ refinedText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refine text." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
