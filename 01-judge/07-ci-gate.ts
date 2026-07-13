// 07-ci-gate.ts — Step 7: Pin the eval in CI.
//
// The eval graduates from a script to a regression gate. If the pass rate
// drops below the threshold, ciGate() throws — that's the CI failure.
//
//   npx tsx 07-ci-gate.ts

import { banner, mockNotice, runIfMain } from "./shared";
import { showScenario, type Case } from "./scenario";
import { DATASET, evaluate } from "./06-dataset";

export async function ciGate(dataset: Case[], threshold = 0.9): Promise<number> {
  const { nPass, n } = await evaluate(dataset);
  const rate = nPass / n;
  if (rate < threshold) {
    throw new Error(`Eval regressed: ${(rate * 100).toFixed(0)}% < ${(threshold * 100).toFixed(0)}%`);
  }
  return rate;
}

export async function demo(): Promise<void> {
  banner("STEP 7 · CI Gate");
  mockNotice();
  showScenario();
  const threshold = 0.9;
  console.log();
  console.log(`Gate threshold: pass rate ≥ ${(threshold * 100).toFixed(0)}%.`);
  console.log();
  try {
    const rate = await ciGate(DATASET, threshold);
    console.log(`  ✅ ${(rate * 100).toFixed(0)}% — gate passed.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ❌ ${msg}`);
    console.log(`     In real CI this throws → non-zero exit → blocks the merge.`);
  }
}

runIfMain(import.meta.url, demo);
