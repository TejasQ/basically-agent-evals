// eval-demo.ts — orchestrator that runs every step in order.
//
//   npm run eval                  # all steps, real judge
//   MOCK_MODE=true npm run eval   # offline canned responses
//
// Each step is also runnable on its own:
//   npx tsx 01-naive.ts
//   npx tsx 02-swap.ts
//   npx tsx 03-rubric.ts
//   npx tsx 04-calibrate.ts
//   npx tsx 05-probes.ts
//   npx tsx 06-dataset.ts
//   npx tsx 07-ci-gate.ts

import { JUDGE_MODEL, MOCK_MODE } from "./shared";
import { showScenario } from "./scenario";
import { demo as step1 } from "./01-naive";
import { demo as step2 } from "./02-swap";
import { demo as step3 } from "./03-rubric";
import { demo as step4 } from "./04-calibrate";
import { demo as step5 } from "./05-probes";
import { demo as step6 } from "./06-dataset";
import { demo as step7 } from "./07-ci-gate";

const STEPS = [step1, step2, step3, step4, step5, step6, step7];

async function main(): Promise<void> {
  console.log("═".repeat(64));
  console.log("01-JUDGE · LLM-as-judge and its traps");
  console.log("═".repeat(64));
  console.log(`Judge: ${MOCK_MODE ? "(mock)" : JUDGE_MODEL}`);
  showScenario();

  for (const step of STEPS) {
    await step();
  }

  console.log();
  console.log("═".repeat(64));
  console.log("Done. The CI gate above intentionally fails: d2 / d4 are");
  console.log("broken-system fixtures used to prove the gate catches regressions.");
  console.log("═".repeat(64));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
