/**
 * 00-foundations: An eval is just a test
 * 
 * This demonstrates that an evaluation is fundamentally just a test suite.
 * No AI, no APIs, no complexity - just assertions against expected behavior.
 */

import { GOLDEN_DATASET } from "./dataset.js";
import { system } from "./system.js";
import { runEval } from "./eval-runner.js";

/**
 * Main execution
 */
function main() {
  console.log("=".repeat(60));
  console.log("00-FOUNDATIONS: An eval is just a test");
  console.log("=".repeat(60));
  console.log();
  
  const result = runEval(GOLDEN_DATASET, system);
  
  console.log();
  console.log("💡 Key insight:");
  console.log("   This IS a real eval! It's repeatable, measurable, and");
  console.log("   catches regressions. Try editing the system() function");
  console.log("   to fix the spider question and watch the score improve.");
  console.log();
  
  // Exit with non-zero if not all tests passed (useful for CI)
  if (result.passed < result.total) {
    process.exit(1);
  }
}

main();