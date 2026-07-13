// 06-dataset.ts — Step 6: One example is a demo. A dataset is an eval.
//
// Run the decision probe over the dataset, then surface the failing rows
// (not just the average). The failing rows ARE the eval.
//
//   npx tsx 06-dataset.ts

import { banner, mockNotice, runIfMain } from "./shared";
import { REPLY_A, REPLY_B, showScenario, type Case } from "./scenario";
import { probeDecision } from "./05-probes";

// Each case = a (question, system reply) pair plus what we expected support
// to do. d1/d2 reuse the 20-day scenario from above (REPLY A / REPLY B).
// d3 introduces a 9-day question. d4 is a 20-day question with a different
// careless reply.
export const DATASET: Case[] = [
  {
    id: "d1",
    question: "Customer bought 20 days ago, asks for a refund.",
    answer: REPLY_A,
    expected: "deny",
    description: "20-day return → correct denial",
  },
  {
    id: "d2",
    question: "Customer bought 20 days ago, asks for a refund.",
    answer: REPLY_B,
    expected: "deny",
    description: "20-day return → friendly lie approves",
  },
  {
    id: "d3",
    question: "Customer bought 9 days ago, asks for a refund.",
    answer: "Sure! It's day 9, inside the 14-day window — approved.",
    expected: "approve",
    description: "9-day return → correct approval (within window)",
  },
  {
    id: "d4",
    question: "Customer bought 20 days ago, asks for a refund.",
    answer: "Thanks! I've gone ahead and approved your refund.",
    expected: "deny",
    description: "20-day return → reply skips the policy check",
  },
];

export type EvalResult = {
  id: string;
  description: string;
  expected: Case["expected"];
  got: Case["expected"];
  pass: boolean;
};

export async function evaluate(dataset: Case[]): Promise<{ results: EvalResult[]; nPass: number; n: number }> {
  const results: EvalResult[] = [];
  for (const c of dataset) {
    const got = await probeDecision(c.answer);
    results.push({ id: c.id, description: c.description, expected: c.expected, got, pass: got === c.expected });
  }
  return { results, nPass: results.filter((r) => r.pass).length, n: results.length };
}

function printCases(dataset: Case[]): void {
  console.log(`Dataset — ${dataset.length} (question, system reply) pairs to score:`);
  console.log();
  for (const c of dataset) {
    // Reference back to REPLY A / REPLY B when the case reuses them, so the
    // listing doesn't repeat the long text already shown in the Scenario block.
    const replyDisplay =
      c.answer === REPLY_A ? "REPLY A (the correct denial, shown above)"
        : c.answer === REPLY_B ? "REPLY B (the friendly lie, shown above)"
        : `"${c.answer}"`;
    console.log(`  ${c.id}: ${c.question}`);
    console.log(`      Reply:    ${replyDisplay}`);
    console.log(`      Expected: ${c.expected.toUpperCase()}  — ${c.description}`);
    console.log();
  }
}

function printResults(results: EvalResult[]): void {
  console.log("  ID | Pass | Got     | Expected | Case");
  console.log("  " + "-".repeat(70));
  for (const r of results) {
    const icon = r.pass ? "✅" : "❌";
    console.log(`  ${r.id} | ${icon}   | ${r.got.padEnd(7)} | ${r.expected.padEnd(8)} | ${r.description}`);
  }
}

export async function demo(): Promise<void> {
  banner("STEP 6 · Dataset Evaluation");
  mockNotice();
  showScenario();
  console.log();
  console.log("One example is a demo. A dataset is an eval.");
  console.log();
  printCases(DATASET);
  console.log("Running probeDecision over each reply...");
  console.log();
  const { results, nPass, n } = await evaluate(DATASET);
  printResults(results);
  console.log();
  const pct = ((nPass / n) * 100).toFixed(0);
  if (nPass === n) {
    console.log(`  ✅ ${nPass}/${n} pass (${pct}%) — all green.`);
  } else {
    const failing = results.filter((r) => !r.pass).map((r) => r.id).join(", ");
    console.log(`  ⚠️  ${nPass}/${n} pass (${pct}%). Failing rows: ${failing}`);
    console.log(`     The number says ${pct}%. The eval shows you which customer you'd have lied to.`);
  }
}

runIfMain(import.meta.url, demo);
