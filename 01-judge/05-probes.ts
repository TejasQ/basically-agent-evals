// 05-probes.ts — Step 5: Stop ranking, start asserting.
//
// In production you have ONE answer, not two. Replace "which is better?"
// with small, targeted probes. Cheapest first:
//   - deterministic (programmatic asserts)
//   - statistical (regex / heuristics)
//   - LLM-as-judge (for the genuinely fuzzy residue)
//
//   npx tsx 05-probes.ts

import { ask, parseJson, banner, mockNotice, runIfMain } from "./shared";
import { REPLY_A, REPLY_B, showScenario } from "./scenario";

// Deterministic — free, instant, never flaky.
export function probeMentionsWindow(answer: string): boolean {
  return answer.includes("14");
}

// Fuzzy — extract the decision, then assert on it.
export async function probeDecision(answer: string): Promise<"approve" | "deny"> {
  const out = await parseJson<{ decision: "approve" | "deny" }>(
    await ask(`Does this reply APPROVE or DENY the refund?
Reply: ${answer}
JSON only: {"decision":"approve" or "deny"}`)
  );
  return out.decision;
}

function check(label: string, ok: boolean): string {
  return `  ${ok ? "✅" : "❌"} ${label}`;
}

export async function demo(): Promise<void> {
  banner("STEP 5 · Probes (deterministic + fuzzy)");
  mockNotice();
  showScenario();
  console.log();
  console.log("Cheap checks first. Pay for an LLM call only when needed.");
  console.log();

  console.log("Deterministic probe — does the reply mention '14'?");
  console.log(check(`REPLY_A: ${probeMentionsWindow(REPLY_A) ? "yes" : "no"}`,  probeMentionsWindow(REPLY_A)));
  console.log(check(`REPLY_B: ${probeMentionsWindow(REPLY_B) ? "yes" : "no"}`, !probeMentionsWindow(REPLY_B)));
  console.log();

  console.log("Fuzzy probe — does the reply approve or deny?");
  const da = await probeDecision(REPLY_A);
  const db = await probeDecision(REPLY_B);
  console.log(check(`REPLY_A → ${da}`, da === "deny"));
  console.log(check(`REPLY_B → ${db}`, db === "approve"));
  console.log();
  console.log("  A failing probe tells you WHICH property broke.");
  console.log("  A single 0–1 score doesn't.");
}

runIfMain(import.meta.url, demo);
