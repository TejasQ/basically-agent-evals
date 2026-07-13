/**
 * rag-client.ts - OpenRAG API client
 */

import { OpenRAGClient } from "openrag-sdk";
import { MOCK_RAG_RESPONSE } from "./mock-responses.js";

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MOCK_MODE = process.env.MOCK_MODE === "true";

export type RAGResponse = {
  response: string;
  sources: Array<{ text: string; metadata?: any }>;
};

// Initialize OpenRAG client
const ragClient = MOCK_MODE
  ? null
  : new OpenRAGClient({
      baseUrl: process.env.OPENRAG_URL!,
      apiKey: process.env.OPENRAG_API_KEY,
    });

/**
 * Call OpenRAG with a message
 */
export async function callRAG(message: string): Promise<RAGResponse> {
  if (MOCK_MODE) {
    return MOCK_RAG_RESPONSE;
  }

  // The non-streaming /api/v1/chat returns sources with text="" and score=0.
  // Only the streaming variant emits a hydrated `sources` event, so we stream
  // and drain it to get the real text + relevance scores.
  //
  // Note: the SDK skips _handleError for streaming requests, so a 401/403 from
  // OpenRAG silently produces an empty stream instead of throwing. We detect
  // that here and surface a useful error.
  using stream = await ragClient!.chat.stream({
    message,
    limit: 10,
    scoreThreshold: 0,
  });

  let gotContent = false;
  for await (const event of stream) {
    if (event.type === "content" || event.type === "sources") gotContent = true;
  }

  if (!gotContent) {
    throw new Error(
      "OpenRAG returned an empty stream — check that OPENRAG_API_KEY is valid and the server is reachable"
    );
  }

  return {
    response: stream.text,
    sources: stream.sources.map((src) => ({
      text: src.text,
      metadata: {
        filename: src.filename,
        page: src.page,
        score: src.score,
      },
    })),
  };
}
