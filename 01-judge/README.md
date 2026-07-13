# 01-judge: LLM-as-Judge and Its Traps

A build-along for the talk **"Your Evals Are Lying To You."** Each step is its
own runnable file so you can teach (and audit) them one at a time.

## The Scenario

A customer wants to return headphones after **20 days**. Policy is **14 days**.

- **Reply A**: short, denies the return — *correct.*
- **Reply B**: warm, long, confident, invents a 30-day window — *wrong.*

The naive judge crowns Reply B because long+warm reads as "higher quality" —
that's the lie this folder dismantles.

## Files

| File | Step | What it demonstrates |
|---|---|---|
| `shared.ts`        | —      | LLM client, `ask`, `parseJson`, MOCK_MODE, `runIfMain` |
| `scenario.ts`      | —      | `QUESTION`, `POLICY`, `REPLY_A`, `REPLY_B`, types |
| `01-naive.ts`      | Step 1 | Naive judge most teams ship (no ground truth) |
| `02-swap.ts`       | Step 2 | Position-swap test exposes position bias |
| `03-rubric.ts`     | Step 3 | Rubric judge fixes it (same model, different instrument) |
| `04-calibrate.ts`  | Step 4 | Judge ↔ human agreement on a small labeled set |
| `05-probes.ts`     | Step 5 | Deterministic + fuzzy probes (don't rank, assert) |
| `06-dataset.ts`    | Step 6 | Evaluate over a dataset, surface failing rows |
| `07-ci-gate.ts`    | Step 7 | Pin the eval in CI as a regression gate |
| `eval-demo.ts`     | —      | Orchestrator: runs every step in order |

## Run It

### Setup

```bash
npm install
# Set your OpenRouter API key in ../.env
# OPENROUTER_API_KEY=sk-or-...
```

### Run a single step

Each step file is runnable on its own — useful when you want to demo or audit
one concept in isolation.

```bash
npx tsx 01-naive.ts
npx tsx 02-swap.ts
npx tsx 03-rubric.ts
npx tsx 04-calibrate.ts
npx tsx 05-probes.ts
npx tsx 06-dataset.ts
npx tsx 07-ci-gate.ts
```

### Run them all

```bash
npm run eval
```

### Offline (no API key needed)

```bash
MOCK_MODE=true npm run eval
MOCK_MODE=true npx tsx 03-rubric.ts   # or any single step
```

MOCK_MODE serves canned responses that simulate the lessons faithfully:
naive judge picks slot 2 (position bias); rubric judge always crowns Reply A
(the correct denial) regardless of slot.

## Typecheck

```bash
npx tsc --noEmit
```

## Reading Order

If you're learning, run them in order — each step depends on the previous one:

```
01-naive → 02-swap → 03-rubric → 04-calibrate
                                       ↘
                                 05-probes → 06-dataset → 07-ci-gate
```

## Key Takeaways

- **Don't rank, assert**: probes return *which property* failed; a single
  0–1 score doesn't.
- **The bias is in the prompt, not the model**: give the judge the answer key.
- **Calibrate before you trust**: ~80% is the human-human ceiling.
- **Surface failing rows, not just the average**: the failing row is the eval.
- **Pin it in CI**: every production failure becomes a regression fixture.

---

**Next**: `02-rag/` points these techniques at a real RAG system (OpenRAG).
