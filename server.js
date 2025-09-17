const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from any origin (for your keyboard app)
app.use(cors());

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome your server is running.");
});

app.post("/refine", async (req, res) => {
  const userText = req.body.text || "";
  console.log("user text:: ", userText);

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
// -------------------------------------------------------------------------------------
app.post("/chat", async (req, res) => {
  const userText = req.body.text || "";
  console.log("user text:: ", userText);

  const prompt = `Please keep all responses concise and focused only on what is requested.   
 Avoid confirmations, extra explanations, or filler phrases.   
 Do not add phrases like "Sure," "Got it," or "I understand."   

 Only return the direct result based on the command used.   
 Commands:   
 /rf   → Refine or rephrase text in detail, not just a shorter sentence   
 /ct   → Change tone (formal, casual, flirty, savage, etc.) with complete rewritten version   
 /sm   → Summarize text into clear points or a short paragraph   
 /el   → Expand text with more details, depth, and context   
 /sh   → Shorten text while keeping main meaning intact   
 /tr   → Translate text (specify target language after command)   
 /img  → Generate a full, detailed image prompt (not just a sentence)   
 /vid  → Generate a full, detailed video prompt (not just a sentence)   
 /mem  → Create a meme caption or idea with context   
 /rp → Write a reply on my behalf in the given context. The reply should not sound mechanical; it can include reasoning or interpretation of why the question was asked, and respond naturally as if I’m answering in real conversation.  
 "${userText}"`;

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

    const chatText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ chatText });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to chat text." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
