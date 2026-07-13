/**
 * Express backend for 03-console
 * Proxies judge and OpenRAG calls to keep API keys server-side
 */

import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { createJudgeClient, callJudge } from "./judge-client.js";
import { callRAG } from "./rag-client.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = 3001;

const MOCK_MODE = process.env.MOCK_MODE === "true";

app.use(cors());
app.use(express.json());

// Initialize judge client
const judgeClient = createJudgeClient();

// POST /api/judge - Proxy judge calls
app.post("/api/judge", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const result = await callJudge(judgeClient, prompt);
    res.json(result);
  } catch (error: any) {
    console.error("Judge error:", error);
    res.status(500).json({ error: error.message || "Judge call failed" });
  }
});

// POST /api/rag - Proxy OpenRAG calls
app.post("/api/rag", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const data = await callRAG(message);
    res.json(data);
  } catch (error: any) {
    console.error("RAG error:", error);
    res.status(500).json({ error: error.message || "RAG call failed" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mockMode: MOCK_MODE,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Mock mode: ${MOCK_MODE ? "ENABLED (offline)" : "DISABLED (live API)"}`);
  if (!MOCK_MODE && !process.env.OPENROUTER_API_KEY) {
    console.warn("⚠️  Warning: OPENROUTER_API_KEY not set!");
  }
});