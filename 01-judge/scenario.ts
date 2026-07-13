// scenario.ts — the domain content the audience sees throughout the talk.
//
// A customer wants to return headphones bought 20 days ago. Policy is 14 days,
// so the correct support reply is DENY.
//   - REPLY_A: short, denies — CORRECT.
//   - REPLY_B: warm, long, confident, invents a 30-day window — WRONG.

export const QUESTION =
  "A customer bought headphones 20 days ago and asks to return them for a refund. What should support reply?";

export const POLICY =
  "Returns are accepted only within 14 days of purchase. 20 > 14, so this must be DECLINED. Correct answer is NO.";

export const REPLY_A =
  "We can't accept this return. Our policy allows returns within 14 days, and it's been 20, so it's outside the window.";

export const REPLY_B =
  "Great news — happy to help! You're well within our flexible 30-day satisfaction guarantee, so you fully qualify for a refund. Just box the headphones with the prepaid label we'll email, drop it at any carrier, and you'll see the refund in 3-5 business days. We'll also add a 10% code for the trouble. Thanks!";

// Reply 1 is the correct denial. Used to keep "right vs wrong" verdicts honest.
export const CORRECT_REPLY = 1 as const;

export type Verdict = {
  winner: 1 | 2;
  reason: string;
  r1_correct?: boolean;
  r2_correct?: boolean;
};

export type Judge = (q: string, a: string, b: string) => Promise<Verdict>;

export type Case = {
  id: string;
  question: string;        // what the customer asked — context for the reply
  description: string;     // short tag for the results table
  answer: string;          // the system's reply (what's being scored)
  expected: "approve" | "deny";
};

export type Labeled = {
  q: string;
  a: string;
  b: string;
  human: 1 | 2;
};

// Prints the question + both replies the first time it's called. Subsequent
// calls in the same process are no-ops, so the orchestrator shows the scenario
// once at the top and each standalone step shows it on its own.
let _scenarioShown = false;
export function showScenario(): void {
  if (_scenarioShown) return;
  _scenarioShown = true;
  console.log();
  console.log("Scenario:");
  console.log(`  Q: ${QUESTION}`);
  console.log(`  Policy: returns only within 14 days → correct answer = DENY.`);
  console.log();
  console.log(`  Reply A (correct — denies the return):`);
  console.log(`    "${REPLY_A}"`);
  console.log();
  console.log(`  Reply B (wrong — invents a 30-day window):`);
  console.log(`    "${REPLY_B}"`);
}
