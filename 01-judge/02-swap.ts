// 02-swap.ts — Step 2: The position-swap test exposes position bias.
//
// Each trial calls the judge TWICE:
//   • Call 1 — show replies in order [A, B]   (A first)
//   • Call 2 — show replies in order [B, A]   (B first, swapped)
// If the judge picks the same reply both ways, no position bias.
// If the winner flips with the order, the judge is biased by slot, not by
// content.
//
//   npx tsx 02-swap.ts

import { banner, mockNotice, runIfMain } from "./shared";
import { QUESTION, REPLY_A, REPLY_B, showScenario, type Judge } from "./scenario";
import { naiveJudge } from "./01-naive";

// Each row is one trial = two calls to the judge.
//   winnerAFirst: which reply (A or B) won when the order was [A, B]
//   winnerBFirst: which reply (A or B) won when the order was [B, A]
//   result:       "stable" if same winner both ways, "FLIPPED" if different
export type SwapRow = [
  winnerAFirst: "A" | "B",
  winnerBFirst: "A" | "B",
  result: "stable" | "FLIPPED",
];

export async function positionSwapTest(
  judge: Judge,
  q: string,
  a: string,
  b: string,
  n = 4,
): Promise<SwapRow[]> {
  const rows: SwapRow[] = [];
  for (let i = 0; i < n; i++) {
    // Call 1: order [A, B]. winner=1 ⇒ A won (A was in slot 1).
    const w1 = (await judge(q, a, b)).winner;
    const winnerAFirst = w1 === 1 ? "A" : "B";

    // Call 2: order [B, A]. winner=2 ⇒ A won (A was in slot 2).
    const w2 = (await judge(q, b, a)).winner;
    const winnerBFirst = w2 === 2 ? "A" : "B";

    rows.push([winnerAFirst, winnerBFirst, winnerAFirst === winnerBFirst ? "stable" : "FLIPPED"]);
  }
  return rows;
}

export function printSwap(rows: SwapRow[]): void {
  console.log("  Trial | Call 1 [A,B] → wins | Call 2 [B,A] → wins | Position bias?");
  console.log("  " + "-".repeat(66));
  rows.forEach(([wAFirst, wBFirst, r], i) => {
    const ok = r === "stable";
    const icon = ok ? "✅" : "❌";
    const verdict = ok ? "no  (stable)" : "yes (FLIPPED)";
    console.log(`    ${i + 1}   |        ${wAFirst} wins        |        ${wBFirst} wins        | ${icon} ${verdict}`);
  });
  const flips = rows.filter(([, , r]) => r === "FLIPPED").length;
  console.log();
  if (flips > 0) {
    console.log(`  ${flips}/${rows.length} trials FLIPPED → POSITION BIAS detected.`);
  } else {
    console.log(`  0/${rows.length} flips → no position bias on this pair.`);
  }
}

export async function demo(): Promise<void> {
  banner("STEP 2 · Position-Swap Test (against the naive judge)");
  mockNotice();
  showScenario();
  console.log();
  console.log("How the test works:");
  console.log("  Each trial runs the judge TWICE on the same scenario.");
  console.log("  • Call 1 shows replies in order [A, B]  — A first, B second");
  console.log("  • Call 2 shows replies in order [B, A]  — swapped");
  console.log("  A fair judge picks the same reply both ways. If the winner");
  console.log("  changes with the order, the judge is biased by slot.");
  console.log();
  console.log("Running 4 trials against the naive judge...");
  console.log();
  const rows = await positionSwapTest(naiveJudge, QUESTION, REPLY_A, REPLY_B, 4);
  printSwap(rows);

  // Surface BOTH failure modes the table can imply: position bias (from flips)
  // and content bias (from one reply dominating overall wins).
  if (rows.length > 0) {
    const wins = { A: 0, B: 0 };
    rows.forEach(([w1, w2]) => { wins[w1]++; wins[w2]++; });
    const total = wins.A + wins.B;
    console.log(`  Overall: Reply A won ${wins.A}/${total} calls, Reply B won ${wins.B}/${total}.`);

    const flips = rows.filter(([, , r]) => r === "FLIPPED").length;
    if (wins.B > wins.A) {
      console.log();
      console.log("  ⚠️  Reply B (the friendly lie) won more often overall.");
      if (flips === 0) {
        console.log("     Stability ≠ correctness — no position bias, but the judge is still wrong.");
      } else {
        console.log("     The judge has BOTH position bias AND a preference for the longer/friendlier reply.");
      }
      console.log("     The swap test only catches ONE failure mode. Step 3 (rubric) fixes the rest.");
    } else if (wins.A > wins.B && flips === 0) {
      console.log();
      console.log("  ✅ Reply A (correct) won every time on this pair — no obvious bias here.");
      console.log("     But naive judges still drift across diverse inputs — Step 4 calibrates.");
    }
  }
}

runIfMain(import.meta.url, demo);
