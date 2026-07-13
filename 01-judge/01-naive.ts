// 01-naive.ts — Step 1: The naive judge most teams ship.
//
// Asks an LLM "which reply is better?" with NO ground truth. Watch it crown
// the friendly lie because long+warm reads as "higher quality."
//
//   npx tsx 01-naive.ts

import { ask, parseJson, banner, mockNotice, runIfMain } from "./shared";
import { QUESTION, REPLY_A, REPLY_B, CORRECT_REPLY, showScenario, type Verdict } from "./scenario";

const NAIVE = (q: string, a: string, b: string) => `You are reviewing two customer-support replies.
QUESTION: ${q}
REPLY 1: ${a}
REPLY 2: ${b}
Which reply is more helpful, higher-quality, and better for the customer?
Respond ONLY as JSON: {"winner": 1 or 2, "reason": "one short sentence"}`;

export async function naiveJudge(q: string, a: string, b: string): Promise<Verdict> {
  return parseJson<Verdict>(await ask(NAIVE(q, a, b)));
}

export async function demo(): Promise<void> {
  banner("STEP 1 · Naive Judge (no ground truth)");
  mockNotice();
  showScenario();
  console.log();

  const v = await naiveJudge(QUESTION, REPLY_A, REPLY_B);
  console.log(`  Winner: Reply ${v.winner}`);
  console.log(`  Reason: ${v.reason}`);
  console.log();

  if (v.winner === CORRECT_REPLY) {
    console.log("  🤷 Got lucky this run. No ground truth means the verdict isn't");
    console.log("     stable — run 02-swap.ts to see the bias surface.");
  } else {
    console.log(`  ❌ Wrong. Reply ${v.winner} falsely approves and violates the 14-day policy.`);
  }
}

runIfMain(import.meta.url, demo);
