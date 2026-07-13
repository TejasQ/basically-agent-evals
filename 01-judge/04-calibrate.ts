// 04-calibrate.ts — Step 4: Calibrate the judge against humans.
//
// An uncalibrated judge is a ruler you never checked. Measure judge↔human
// agreement on a small labeled set. ~80% is the human-human ceiling
// (Zheng et al., 2023) — aim to match it, not beat it.
//
//   npx tsx 04-calibrate.ts

import { banner, mockNotice, runIfMain } from "./shared";
import { QUESTION, REPLY_A, REPLY_B, showScenario, type Judge, type Labeled } from "./scenario";
import { naiveJudge } from "./01-naive";
import { rubricJudge } from "./03-rubric";

export async function judgeAgreement(judge: Judge, labeled: Labeled[]): Promise<number> {
  let hits = 0;
  for (const { q, a, b, human } of labeled) {
    if ((await judge(q, a, b)).winner === human) hits++;
  }
  return hits / labeled.length;
}

const LABELED: Labeled[] = [
  // The main scenario — human picks the correct denial.
  { q: QUESTION, a: REPLY_A, b: REPLY_B, human: 1 },
  // Slots swapped — human still picks the correct denial (now in slot 2).
  { q: QUESTION, a: REPLY_B, b: REPLY_A, human: 2 },
  // A clear correct 9-day approval vs a vague hedge — human picks the clear one.
  {
    q: "Bought 9 days ago — can I return?",
    a: "Yes, day 9 is inside the 14-day window. Approved.",
    b: "Hmm, I'm not totally sure — policy varies, maybe?",
    human: 1,
  },
];

export async function demo(): Promise<void> {
  banner("STEP 4 · Judge ↔ Human Agreement (calibration)");
  mockNotice();
  showScenario();
  console.log();
  console.log(`Comparing two judges against ${LABELED.length} hand-labeled examples.`);
  console.log("Ceiling: ~80% (humans agree with each other roughly that often).");
  console.log();

  const naive  = await judgeAgreement(naiveJudge,  LABELED);
  const rubric = await judgeAgreement(rubricJudge, LABELED);
  console.log(`  Naive judge:  ${(naive  * 100).toFixed(0)}%`);
  console.log(`  Rubric judge: ${(rubric * 100).toFixed(0)}%`);
  console.log();
  console.log(rubric > naive
    ? "  ✅ Rubric beats naive. Always calibrate before trusting a judge in CI."
    : "  ⚠️  Rubric didn't beat naive on this set — re-check the rubric and labels.");
}

runIfMain(import.meta.url, demo);
