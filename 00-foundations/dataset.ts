/**
 * dataset.ts - Golden test cases (ground truth)
 */

export type TestCase = {
  input: string;
  ok: (answer: string) => boolean;
};

export const GOLDEN_DATASET: TestCase[] = [
  {
    input: "What is 2 + 2?",
    ok: (answer: string) => answer.includes("4"),
  },
  {
    input: "What is the capital of France?",
    ok: (answer: string) => answer.toLowerCase().includes("paris"),
  },
  {
    input: "Is water wet?",
    ok: (answer: string) => answer.toLowerCase().includes("yes") || answer.toLowerCase().includes("wet"),
  },
  {
    input: "What color is the sky?",
    ok: (answer: string) => answer.toLowerCase().includes("blue"),
  },
  {
    input: "How many legs does a spider have?",
    ok: (answer: string) => answer.includes("8") || answer.includes("eight"),
  },
];
