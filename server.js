const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Use a working Gemini model
// const MODEL = "gemini-1.5-flash";
const MODEL = "gemini-2.0-flash-lite";
// const MODEL = "gemini-1.0-pro"; // Alternative if above doesn't work
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${key}`;

// Root endpoint
app.get("/", (req, res) => {
  console.log("✅ Root endpoint hit");
  res.send("✅ Server is running.");
});

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("🔍 Health check");
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Refine endpoint
app.post("/refine", async (req, res) => {
  console.log("=== REFINE REQUEST ===");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  console.log("API Key present:", !!userApiKey);
  console.log("API Key length:", userApiKey?.length);
  console.log("Text to refine:", userText);

  if (!userApiKey) {
    console.log("❌ No API key provided");
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    console.log("❌ No text provided");
    return res.status(400).json({ error: "Missing text" });
  }

  const prompt = `Improve and refine this text while keeping its original meaning. Fix grammar, spelling, and clarity: ${userText}`;
  console.log("Final prompt:", prompt);

  try {
    console.log("🔄 Calling Gemini API for refine...");
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    console.log("Gemini payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      GEMINI_URL(userApiKey),
      payload,
      {
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "RefineBoard-Server/1.0"
        },
        timeout: 15000,
      }
    );

    console.log("✅ Gemini refine response received");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    const refinedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!refinedText) {
      console.log("⚠️ Empty response from Gemini");
      return res.status(500).json({ error: "Empty response from AI" });
    }

    console.log("Refined text:", refinedText);
    res.json({ refinedText });

  } catch (error) {
    console.error("❌ Refine error:");
    
    if (error.response) {
      // Gemini API returned an error
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Headers:", error.response.headers);
      
      if (error.response.status === 401) {
        return res.status(401).json({ error: "Invalid API key" });
      } else if (error.response.status === 403) {
        return res.status(403).json({ error: "API key not authorized" });
      } else if (error.response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      } else if (error.response.status === 400) {
        return res.status(400).json({ error: "Bad request to Gemini API" });
      } else {
        return res.status(502).json({ error: `Gemini API error: ${error.response.status}` });
      }
    } else if (error.request) {
      // No response received
      console.error("No response received:", error.message);
      return res.status(503).json({ error: "No response from Gemini API" });
    } else {
      // Other error
      console.error("Setup error:", error.message);
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  console.log("=== CHAT REQUEST ===");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  
  const userText = req.body.text?.trim() || "";
  const userApiKey = req.headers.authorization?.replace('Bearer ', '');

  console.log("API Key present:", !!userApiKey);
  console.log("API Key length:", userApiKey?.length);
  console.log("Text to chat:", userText);

  if (!userApiKey) {
    console.log("❌ No API key provided");
    return res.status(401).json({ error: "API key required" });
  }

  if (!userText) {
    console.log("❌ No text provided");
    return res.status(400).json({ error: "Missing text" });
  }

  console.log("Final prompt:", userText);

  try {
    console.log("🔄 Calling Gemini API for chat...");
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: userText }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    console.log("Gemini payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      GEMINI_URL(userApiKey),
      payload,
      {
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "RefineBoard-Server/1.0"
        },
        timeout: 15000,
      }
    );

    console.log("✅ Gemini chat response received");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    const chatText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!chatText) {
      console.log("⚠️ Empty response from Gemini");
      return res.status(500).json({ error: "Empty response from AI" });
    }

    console.log("Chat text:", chatText);
    res.json({ chatText });

  } catch (error) {
    console.error("❌ Chat error:");
    
    if (error.response) {
      // Gemini API returned an error
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Headers:", error.response.headers);
      
      if (error.response.status === 401) {
        return res.status(401).json({ error: "Invalid API key" });
      } else if (error.response.status === 403) {
        return res.status(403).json({ error: "API key not authorized" });
      } else if (error.response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      } else if (error.response.status === 400) {
        return res.status(400).json({ error: "Bad request to Gemini API" });
      } else {
        return res.status(502).json({ error: `Gemini API error: ${error.response.status}` });
      }
    } else if (error.request) {
      // No response received
      console.error("No response received:", error.message);
      return res.status(503).json({ error: "No response from Gemini API" });
    } else {
      // Other error
      console.error("Setup error:", error.message);
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.url);
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /refine - Refine text`);
  console.log(`   POST /chat   - Chat with AI`);
});

module.exports = app;
