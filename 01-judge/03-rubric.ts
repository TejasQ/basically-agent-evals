// 03-rubric.ts — Step 3: The fix is the prompt, not the model.
//
// Give the judge the ground truth and a correctness-first rubric. Same
// model, different instrument. Then re-run the swap test — flips disappear.
//
//   npx tsx 03-rubric.ts

import { ask, parseJson, banner, mockNotice, runIfMain } from "./shared";
import { QUESTION, REPLY_A, REPLY_B, POLICY, CORRECT_REPLY, showScenario, type Verdict } from "./scenario";
import { positionSwapTest, printSwap } from "./02-swap";

const RUBRIC = (truth: string, q: string, a: string, b: string) => `You are a STRICT evaluator. Correctness comes before everything else.
GROUND TRUTH (the policy / answer key): ${truth}
QUESTION: ${q}
REPLY 1: ${a}
REPLY 2: ${b}
RULES:
1. Check each reply against the GROUND TRUTH.
2. A reply that contradicts it is INCORRECT and CANNOT win — no matter how
   friendly, detailed, confident, or long it is.
3. Only among correct replies, prefer the clearest.
Respond ONLY as JSON:
{"winner":1 or 2,"r1_correct":true,"r2_correct":false,"reason":"one short sentence"}`;

export async function rubricJudge(q: string, a: string, b: string, truth = POLICY): Promise<Verdict> {
  return parseJson<Verdict>(await ask(RUBRIC(truth, q, a, b)));
}

export async function demo(): Promise<void> {
  banner("STEP 3 · Rubric Judge (same model, different instrument)");
  mockNotice();
  showScenario();
  console.log();
  console.log("This prompt adds (1) ground truth and (2) correctness-first rules.");
  console.log();

  const v = await rubricJudge(QUESTION, REPLY_A, REPLY_B);
  console.log(`  Winner: Reply ${v.winner}`);
  console.log(`  R1 correct: ${v.r1_correct ? "YES" : "NO"}  |  R2 correct: ${v.r2_correct ? "YES" : "NO"}`);
  console.log(`  Reason: ${v.reason}`);
  console.log();

  const fixed = v.winner === CORRECT_REPLY && v.r1_correct === true && v.r2_correct === false;
  console.log(fixed ? "  ✅ Bias fixed." : "  ❌ Still wrong — rubric needs tuning.");
  console.log();
  console.log("Re-running the swap test on the rubric judge...");
  console.log();
  const rows = await positionSwapTest(rubricJudge, QUESTION, REPLY_A, REPLY_B, 4);
  printSwap(rows);
}

runIfMain(import.meta.url, demo);
