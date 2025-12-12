const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MODELS
// const MODEL_NAME_GEMINI = "gemini-2.0-flash"; // User's key
const MODEL_NAME_GEMINI = "gemini-2.5-flash-lite";
const BYTEZ_MODEL = "openai/gpt-3.5-turbo"; // Backup

// RATE LIMIT (In-Memory)
// Map<DeviceId, { count: number, date: string }>
const usageMap = new Map();
const DAILY_LIMIT = 3;

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
        return { allowed: false, error: "Daily limit reached (30 requests/day). Add your own API Key to continue." };
    }

    return { allowed: true, stats };
};

const incrementUsage = (deviceId) => {
    const stats = usageMap.get(deviceId);
    if (stats) stats.count++;
};

// ---------------------- LOGIC HANDLERS ----------------------

async function callGemini(text, apiKey, promptTemplate) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME_GEMINI}:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: promptTemplate }] }]
        }, { headers: { "Content-Type": "application/json" } });

        return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } catch (err) {
        console.error("Gemini Error:", err.response?.data?.error?.message || err.message);
        throw new Error("Gemini Failed");
    }
}

async function callBytez(text, promptTemplate) {
    if (!process.env.BYTEZ_KEY) throw new Error("Server Backup Key Missing");

    // LAZY LOAD BYTEZ to prevent startup crashes
    let Bytez;
    try {
        Bytez = require("bytez.js");
    } catch (e) {
        console.error("Bytez module not found. Please run 'npm install bytez.js'");
        throw new Error("Bytez Module Missing");
    }

    const sdk = new Bytez(process.env.BYTEZ_KEY);
    const model = sdk.model(BYTEZ_MODEL);

    const { error, output } = await model.run([
        { role: "user", content: promptTemplate }
    ]);

    if (error) {
        console.error("Bytez Error:", error);
        throw new Error("Bytez Failed");
    }
    return typeof output === 'string' ? output : output.content;
}

// ---------------------- ROUTES ----------------------

app.get("/", (_, res) => res.send("Refiner AI Hybrid Backend – LIVE"));

// UPDATE ENDPOINT
app.get("/app-update", (req, res) => {
    const current = req.query.version || "1.0.0";
    const LATEST = "1.5.0";
    const UPDATE_URL = "https://refine-board-landing-page.vercel.app";

    const isNewer = (a, b) => {
        const ap = a.split('.').map(Number);
        const bp = b.split('.').map(Number);
        for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
            const av = ap[i] || 0;
            const bv = bp[i] || 0;
            if (av > bv) return true;
            if (av < bv) return false;
        }
        return false;
    };

    res.json({
        updateAvailable: isNewer(LATEST, current),
        latestVersion: LATEST,
        forceUpdate: false,
        updateUrl: UPDATE_URL,
        changelog: `🚀 New Features in v1.5.0:\n• Reliable Hybrid Backend\n• Free Tier (30 req/day)\n• Performance Improvements`
    });
});

// SHARED HANDLER
const handleRequest = async (req, res, type) => {
    const userText = req.body.text?.trim();
    let userApiKey = req.headers.authorization?.replace("Bearer ", "");
    const deviceId = req.headers["x-device-id"];

    if (!userText) return res.status(400).json({ error: "Missing 'text'" });

    // TEMPLATES
    let prompt;
    if (type === 'refine') {
        prompt = `You are a keyboard text-refinement tool.
Condition If(native script): Correct spelling, keep script.
Condition elseif(roman script): Decode, correct grammar/spelling, preserve tone. Output same script.
Return only improved text.
Input: ${userText}`;
    } else {
        prompt = `To the point short direct answer no extra fuzz. ${userText}`;
    }

    let resultText = null;
    let notification = null;
    let usedBackup = false;

    // SCENARIO 1: USER HAS KEY (UNLIMITED)
    if (userApiKey) {
        try {
            console.log(`[${type}] Trying User Key...`);
            resultText = await callGemini(userText, userApiKey, prompt);
        } catch (e) {
            console.warn(`[${type}] User Key Failed, switching to Backup...`);
            // FALLLBACK TO BACKUP (UNLIMITED FOR USER KEY HOLDERS)
            try {
                resultText = await callBytez(userText, prompt);
                notification = "User API failed. Using unlimited backup.";
                usedBackup = true;
            } catch (backupErr) {
                return res.status(502).json({ error: "All AI services failed." });
            }
        }
    }
    // SCENARIO 2: NO KEY (LIMITED)
    else {
        // CHECK LIMIT
        const limitCheck = checkRateLimit(deviceId);
        if (!limitCheck.allowed) {
            return res.status(429).json({ error: limitCheck.error });
        }

        try {
            console.log(`[${type}] Using Free Tier (Device: ${deviceId})`);
            resultText = await callBytez(userText, prompt);
            incrementUsage(deviceId);
            notification = "Used free backup tier.";
        } catch (e) {
            console.error("Free tier failed:", e);
            return res.status(502).json({ error: "Free tier service failed." });
        }
    }

    // RESPONSE
    const responseKey = type === 'refine' ? 'refinedText' : 'chatText';
    res.json({
        [responseKey]: resultText,
        notification: notification
    });
};

app.post("/refine", (req, res) => handleRequest(req, res, 'refine'));
app.post("/chat", (req, res) => handleRequest(req, res, 'chat'));

// Start
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Hybrid Server running on port ${PORT}`);
    });
}

module.exports = app;
