/**
 * probes.ts - Evaluation probes for RAG systems
 */

import { ask, parseJson } from "./judge.js";
import type { Source } from "./clients.js";

/**
 * Retrieval probe - did the needed chunk actually surface?
 * Similar to RAGAS "context recall"
 */
export function retrievalHit(sources: Source[], mustContain: string): boolean {
  return sources.some((s) => s.text.includes(mustContain));
}

/**
 * Generation probe - what did the answer decide?
 * Similar to RAGAS "faithfulness/answer correctness"
 */
export async function decisionOf(answer: string): Promise<"approve" | "deny"> {
  const o = await parseJson<{ decision: "approve" | "deny" }>(
    await ask(`Does this reply APPROVE or DENY the refund?\nReply: ${answer}\nJSON only: {"decision":"approve" or "deny"}`)
  );
  return o.decision;
}
