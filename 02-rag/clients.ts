// clients.ts — OpenRAG client (real via SDK, plus a matching mock).
//
// The real client is the official SDK. The mock mimics its
// `chat.create({ message })` surface so the harness uses ONE API regardless of
// MOCK_MODE. Endpoint, auth header (X-API-Key), and body shape all live in the
// SDK — we don't roll our own fetch.

export { OpenRAGClient } from "openrag-sdk";
export type { Source, ChatResponse } from "openrag-sdk";

import type { ChatResponse } from "openrag-sdk";

// Canned OpenRAG response for offline runs / the talk's fallback.
export class MockOpenRAGClient {
  chat = {
    create: async ({ message }: { message: string }): Promise<ChatResponse> => {
      if (message.includes("20 days")) {
        return {
          response:
            "I'm sorry, but our return policy allows returns only within 14 days of purchase. Since it's been 20 days, we cannot accept this return.",
          sources: [
            {
              filename: "refund-policy.pdf",
              text: "Returns are accepted within 14 days of purchase. After this period, returns cannot be processed.",
              score: 0.95,
              page: 1,
            },
          ],
        };
      }
      return { response: "I can help you with that.", sources: [] };
    },
  };
}
