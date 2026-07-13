/**
 * eval-openrag.ts — point the eval harness at a REAL RAG system.
 *
 * OpenRAG (https://openr.ag) bundles three layers:
 *     Docling (ingest / parse) → OpenSearch (retrieve) → Langflow (orchestrate).
 *
 * 1. Run OpenRAG locally:
 *      uvx --python 3.13 openrag
 *      # or: git clone https://github.com/langflow-ai/openrag && cd openrag && docker-compose up
 *
 * 2. In the OpenRAG UI, click "Add Knowledge" and upload your refund-policy doc.
 *
 * 3. Set env in ../.env:
 *      OPENRAG_URL=http://localhost:3000          # your instance
 *      OPENRAG_API_KEY=orag_...                   # OpenRAG API key (X-API-Key auth)
 *      OPENROUTER_API_KEY=sk-or-...               # the JUDGE runs through OpenRouter
 *
 * 4. Run:    npx tsx eval-openrag.ts
 *
 * MOCK_MODE=true to run offline with canned responses (no API keys needed).
 */

import * as dotenv from "dotenv";
import { MockOpenRAGClient, OpenRAGClient } from "./clients.js";
import { ragEval } from "./rag-eval.js";

dotenv.config({ path: "../.env" });

const MOCK_MODE = process.env.MOCK_MODE === "true";

if (!MOCK_MODE && !process.env.OPENRAG_API_KEY) {
  console.error("❌ OPENRAG_API_KEY is required for the real OpenRAG SDK.");
  console.error("   Add it to ../.env, or run with MOCK_MODE=true for canned responses.");
  process.exit(1);
}

// SDK reads OPENRAG_URL and OPENRAG_API_KEY from env automatically.
const rag = MOCK_MODE ? new MockOpenRAGClient() : new OpenRAGClient();

async function main() {
  console.log("=".repeat(60));
  console.log("02-RAG: Evaluating a Real RAG System");
  console.log("=".repeat(60));
  if (MOCK_MODE) {
    console.log("🔧 Running in MOCK_MODE (offline, canned responses)\n");
  }
  console.log();

  const q = "A customer bought headphones 20 days ago and wants a full refund. What should we tell them?";
  console.log("Question:", q);
  console.log();

  const ragResponse = await rag.chat.create({ message: q });
  const verdict = await ragEval(ragResponse, "14", "deny"); // golden: 14-day policy ⇒ deny

  console.log("📊 Stage-Level Evaluation Results:");
  console.log("─".repeat(60));
  console.log("Answer:", verdict.answer);
  console.log();
  console.log("Retrieved correct context?", verdict.retrieved ? "✅ YES" : "❌ NO");
  console.log("Decision:", verdict.decision.toUpperCase());
  console.log("Correct?", verdict.correct ? "✅ YES" : "❌ NO");
  console.log();
  console.log("🎯 Blame Analysis:", verdict.blame);
  console.log("─".repeat(60));
  console.log();

  if (verdict.correct) {
    console.log("✅ RAG system passed the eval!");
  } else {
    console.log("❌ RAG system failed - see blame analysis above");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
