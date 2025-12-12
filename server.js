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
const BYTEZ_MODEL = "openai/gpt-3.5-turbo";
const DAILY_LIMIT = 30; // Production Limit (Security Fallback)

// IN-MEMORY LIMIT (Note: Resets on Vercel cold boot)
const usageMap = new Map();

const getTodayDate = () => new Date().toISOString().split('T')[0];

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
        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        }, { headers: { "Content-Type": "application/json" } });
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } catch (e) {
        throw new Error("Gemini Failed");
    }
}

async function callBytez(text, prompt) {
    if (!process.env.BYTEZ_KEY) throw new Error("Server Backup Key Missing");

    let Bytez;
    try {
        Bytez = require("bytez.js");
    } catch (e) { throw new Error("Bytez Module Missing"); }

    const sdk = new Bytez(process.env.BYTEZ_KEY);
    const model = sdk.model(BYTEZ_MODEL);
    const { error, output } = await model.run([{ role: "user", content: prompt }]);

    if (error) throw new Error("Bytez Failed");
    return typeof output === 'string' ? output : output.content;
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
    const prompt = type === 'refine'
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
                resultText = await callBytez(userText, prompt);
            }
        } else {
            // FREE TIER
            resultText = await callBytez(userText, prompt);
            incrementUsage(deviceId);
        }

        // 4. RESPONSE
        const key = type === 'refine' ? 'refinedText' : 'chatText';
        res.json({ [key]: resultText });

    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(502).json({ error: "AI Service Failed" });
    }
};

app.post("/refine", (req, res) => handleRequest(req, res, 'refine'));
app.post("/chat", (req, res) => handleRequest(req, res, 'chat'));

app.get("/app-update", (req, res) => {
    res.json({
        updateAvailable: true, // Always true since we are forcing 2.0
        latestVersion: "2.0",
        forceUpdate: true,
        updateUrl: "https://refiner-keyboard-lite.vercel.app",
        changelog: `🚀 Version 2.0 Major Update!

• Google Login & Cloud Sync: Sign in to sync your clipboard across devices.
• End-to-End Encryption: Your data is secure and private.
• New Settings Redesign: Fresh look with dedicated profile section.
• Performance Improvements: Faster loading and smoother typing.
• Hybrid AI Backend: Reliable free tier with smart fallback.`
    });
});

app.get("/", (_, res) => res.send("Refiner AI Backend Live"));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
