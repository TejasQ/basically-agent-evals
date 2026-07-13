/**
 * rag-eval.ts - RAG system evaluation logic
 */

import { retrievalHit, decisionOf } from "./probes.js";
import type { Source, ChatResponse } from "./clients.js";

export type StageVerdict = {
  answer: string;
  retrieved: boolean;
  decision: "approve" | "deny";
  correct: boolean;
  blame: string;
};

/**
 * Evaluate a RAG system response with stage-level blame analysis
 */
export async function ragEval(
  ragResponse: ChatResponse,
  mustContain: string,
  expected: "approve" | "deny"
): Promise<StageVerdict> {
  const { response: answer, sources } = ragResponse;
  const retrieved = retrievalHit(sources, mustContain);
  const decision = await decisionOf(answer);
  const correct = decision === expected;

  // Stage-level blame: pinpoint WHERE the failure occurred
  let blame: string;
  if (!retrieved && !correct) {
    blame = "RETRIEVAL — the policy chunk never surfaced. Check the Docling parse and the OpenSearch index.";
  } else if (retrieved && !correct) {
    blame = "GENERATION — the right context WAS retrieved, but the model ignored it. Fix the Langflow agent prompt.";
  } else if (!retrieved && correct) {
    blame = "LUCKY — correct without grounding; the model guessed from priors. Fix retrieval anyway.";
  } else {
    blame = "none — grounded and correct.";
  }
  
  return { answer, retrieved, decision, correct, blame };
}
