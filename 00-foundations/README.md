# 00-foundations: An Eval is Just a Test

This folder demonstrates the foundational concept: **an evaluation is fundamentally just a test suite**. No AI, no APIs, no complexity—just assertions against expected behavior.

## What's Inside

- `first-eval.ts`: A complete evaluation system with:
  - **Golden dataset**: Array of test cases with `{input, ok:(answer)=>boolean}` assertions
  - **System under test**: A fake `system()` function that returns hardcoded answers
  - **Evaluation runner**: `runEval()` that returns a repeatable score (passed/total)

## Key Insight

This IS a real eval! It's:
- ✅ **Repeatable**: Run it multiple times, get the same results
- ✅ **Measurable**: Clear pass/fail metrics (currently 4/5 = 80%)
- ✅ **Regression-catching**: If you break the system, the score drops

## Run It

```bash
npm install
npm run eval
```

Expected output: **4/5 passed (80%)**

The spider question intentionally fails (says 6 legs instead of 8).

## Try This

Edit the `system()` function in `first-eval.ts` to fix the spider answer:

```typescript
"How many legs does a spider have?": "A spider has 8 legs.", // Fixed!
```

Run again: `npm run eval`

Watch the score improve to **5/5 passed (100%)**! 🎉

## Why This Matters

Before adding LLMs, judges, or complexity, understand this: you already know how to build evals. They're just tests. The rest of this repo shows what to do when "correct" gets fuzzy and you need an LLM to judge.

## Typecheck

```bash
npx tsc --noEmit
```

Should pass with no errors.

---

**Next**: Move to `01-judge/` to see what happens when "good" is too fuzzy for simple assertions.
