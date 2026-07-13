/**
 * eval-runner.ts - Evaluation execution logic
 */

import type { TestCase } from "./dataset.js";

export type EvalResult = {
  passed: number;
  total: number;
  percentage: number;
};

/**
 * Run the evaluation against a system
 * Returns a score: { passed, total, percentage }
 */
export function runEval(
  dataset: TestCase[],
  systemFn: (input: string) => string
): EvalResult {
  let passed = 0;
  const total = dataset.length;
  
  console.log("🧪 Running evaluation...\n");
  
  for (const testCase of dataset) {
    const answer = systemFn(testCase.input);
    const isCorrect = testCase.ok(answer);
    
    if (isCorrect) {
      passed++;
      console.log(`✅ PASS: ${testCase.input}`);
      console.log(`   Answer: ${answer}\n`);
    } else {
      console.log(`❌ FAIL: ${testCase.input}`);
      console.log(`   Answer: ${answer}\n`);
    }
  }
  
  const percentage = Math.round((passed / total) * 100);
  
  console.log("═".repeat(60));
  console.log(`📊 Results: ${passed}/${total} passed (${percentage}%)`);
  console.log("═".repeat(60));
  
  return { passed, total, percentage };
}
