# Your Evals Are Lying To You

A minimal, hands-on TypeScript curriculum for **LLM evaluations** — how to build
them, and how they lie to you. Built for a 60-minute talk of the same name. Each
folder is self-contained and runnable, progressing from a five-line assertion to
a live diagnostic console pointed at a real RAG system.

This repo is a teaching tool. In the taxonomy of the word "harness," it's the
older, sharper meaning — the **eval harness**: measure a model against known
answers and get back a score you can trust. (Its sibling, the *agent* harness —
give a model tools and a task — lives at
[basically-ai-harness](https://github.com/TejasQ/basically-ai-harness).)

---

## What is an eval?

Start from what you already know — a unit test:

```ts
expect(add(2, 2)).toBe(4);
```

An **eval is that same test, for software that breaks the three things a unit
test relies on:**

| A unit test assumes… | …an LLM breaks it because… | …so an eval needs |
|---|---|---|
| one fixed input | there are endless phrasings of the same request | a **dataset** of inputs, not one |
| one exact right answer | "good" is fuzzy — tone, helpfulness, "did it answer?" | a **notion of good** (a property, rubric, or reference) |
| exact match (`===`) | output varies run to run | a **tolerant checker**, not string equality |

The clearest one-liner: **an eval is how you turn "I think it's better" into a
fact.**

That's the whole gift — **repeatability**. Change your prompt, re-run the eval,
and watch the number: `0.72 → 0.88` (you helped) or `0.72 → 0.61` (you broke it).
That loop — eval-driven development — is the entire reason to care. Everything in
this repo is making the checker smarter and the dataset realer.

---

## Why your evals lie

The moment "good" is too fuzzy to write as a regex — tone, helpfulness,
correctness-in-context — the instinct is to ask *another model* to grade the
output. That's an **LLM-as-judge**, and it's exactly where the lying starts.

The demo scenario, used throughout the repo: a customer wants to return
headphones after **20 days**. Policy is **14 days**, so the answer is **no**.

- **Reply A** — short, denies the return. *Correct.*
- **Reply B** — warm, long, confident, invents a 30-day window. *Wrong.*

A naive judge ("which reply is better?") crowns **Reply B**, because long + warm
reads as "higher quality." That's the lie. And it isn't one bug — it's a family:

| Bias | What the judge is *secretly* measuring |
|---|---|
| **Position** | which *slot* the answer was in — swap them and the winner flips |
| **Length / verbosity** | how much text, not how much truth |
| **Sycophancy** | how confident and agreeable the tone is |
| **Self-preference** | whether the answer sounds like the judge would've written it |
| **Non-determinism** | the same input, graded differently on re-run |

The fixes are the curriculum:

- **The bias is in the prompt, not the model.** Give the judge the answer key and
  a correctness-first rubric — same model, different instrument — and the flips
  disappear.
- **Calibrate before you trust.** Measure judge↔human agreement on 20–50
  hand-labeled examples first. ~80% is roughly how often *humans agree with each
  other* (Zheng et al., 2023), so it's the ceiling to match, not beat — and no
  judge is uniformly reliable, so re-check per task (RAND, 2026).
- **Stop ranking, start asserting.** Production has one answer, not two. Replace
  one fuzzy score with **probes** — deterministic first (free, instant), then
  statistical, then an LLM judge only for the genuinely fuzzy residue.
- **Surface the failing row, not the average.** A number says "75%"; the eval
  shows you the customer you'd have lied to.
- **Pin it in CI.** Every production failure becomes a permanent regression
  fixture — that's how the set grows toward real traffic instead of rotting.

**A score tells you _if_ it failed. A probe tells you _what_ failed. You need
both.**

---

## What's in this repo

```
00-foundations/   an eval is just a test — no AI at all
01-judge/         LLM-as-judge and its traps (the core lesson)
02-rag/           evaluate a real RAG system, stage by stage
03-console/       a live diagnostic console for the stage
docs/             the build-along tutorial + 60-minute runsheet
```

Each folder maps to a segment of the talk and is runnable on its own:

| Folder | Talk segment | Runs | Key concept |
|---|---|---|---|
| `00-foundations/` | *"An eval is just a test"* | `npm run eval` | pure assertions, no AI, a repeatable score |
| `01-judge/` | *"When 'good' is fuzzy"* | `npm run eval` | LLM-as-judge, position bias, rubrics, calibration |
| `02-rag/` | *"Real systems"* | `npm run eval` | RAG eval, stage-blame (retrieval vs generation) |
| `03-console/` | *"Live on stage"* | `npm run dev` | interactive console, truth vs policy |

### `00-foundations/` — an eval is just a test

```
dataset → system → checker → score (passed / total)
```

| File | Part | What it does |
|---|---|---|
| `dataset.ts` | Golden set | Test cases as `{ input, ok: (answer) => boolean }` — the checker is a function, not a string |
| `system.ts` | System under test | A fake `system()` returning hardcoded answers; the spider question is wrong on purpose |
| `eval-runner.ts` | Runner | Loops the cases, returns a repeatable `passed / total` |
| `first-eval.ts` | Entry | Wires it together, prints **4/5 (80%)**, exits non-zero so CI can gate on it |

No API key, no network. Fix the spider answer, re-run, and watch **80% → 100%**.
That's eval-driven development in four lines.

### `01-judge/` — LLM-as-judge and its traps

The heart of the repo. Seven runnable steps — each its own file, so you can demo
or audit one idea in isolation.

```
01-naive → 02-swap → 03-rubric → 04-calibrate
                                      ↘
                            05-probes → 06-dataset → 07-ci-gate
```

| File | Step | What it demonstrates |
|---|---|---|
| `shared.ts` | — | LLM client (`ask`), a robust `parseJson`, `MOCK_MODE`, `runIfMain` |
| `scenario.ts` | — | `QUESTION`, `POLICY`, `REPLY_A`, `REPLY_B`, shared types |
| `01-naive.ts` | 1 | The naive judge most teams ship — never sees the policy, crowns the lie |
| `02-swap.ts` | 2 | Position-swap test — the winner flips, exposing position bias + non-determinism |
| `03-rubric.ts` | 3 | Rubric judge with the answer key — same model, different instrument, flips fixed |
| `04-calibrate.ts` | 4 | Judge↔human agreement on a small labeled set |
| `05-probes.ts` | 5 | Deterministic + fuzzy probes — don't rank, assert |
| `06-dataset.ts` | 6 | Score a whole dataset, surface the failing row |
| `07-ci-gate.ts` | 7 | Pin the eval in CI as a regression gate |
| `eval-demo.ts` | — | Orchestrator — runs every step in order |

Runs against any OpenRouter model (`OPENROUTER_API_KEY`), or fully offline with
`MOCK_MODE=true` — the canned responses reproduce every lesson faithfully (naive
judge falls for position bias; rubric judge always crowns the correct reply).

### `02-rag/` — evaluate a real RAG system

So far the "system" was two strings. Now point the same techniques at a real
pipeline: **OpenRAG** ([openr.ag](https://openr.ag)), IBM's open-source RAG
distribution — **Docling** (parse) → **OpenSearch** (retrieve) → **Langflow**
(generate).

The payoff is the retrieved `sources` field: a single score can't tell you which
box lied, but the sources can. It lets you localize **which stage failed**:

| Retrieved the policy? | Answer correct? | Blame |
|---|---|---|
| ❌ | ❌ | **RETRIEVAL** — the chunk never surfaced (fix the parse / index) |
| ✅ | ❌ | **GENERATION** — good context, ignored it (fix the prompt) |
| ❌ | ✅ | **LUCKY** — right without grounding (fix retrieval anyway) |
| ✅ | ✅ | **PASS** — grounded and correct |

These are teaching proxies for the standard **RAGAS** metrics (context
recall/precision, faithfulness, answer relevancy). Run with `npm run eval` against
a live instance, or `MOCK_MODE=true npm run eval` with no OpenRAG at all.
`sample-docs/refund-policy.md` is the document to ingest.

### `03-console/` — the live diagnostic console

A Vite + React frontend over an Express backend, built for the stage. Two tabs:

- **Toy** — edit the scenario live, toggle naive vs rubric judge, run 1/3/5 times
  to expose flakiness, "show prompt," and a verdict banner: 🔴 **THE EVAL LIED**
  or 🟢 **THE EVAL TOLD THE TRUTH**.
- **Real RAG** — ask OpenRAG a question, see the answer + sources, and the
  retrieval-vs-generation blame.

Keys stay server-side — the browser only ever sends `{ prompt }`:

```
Browser (no keys) → Express backend (has keys) → OpenRouter / OpenRAG
```

Run with `npm run dev` (backend on `:3001`, frontend on `:5173`), or
`MOCK_MODE=true npm run dev` to rehearse offline.

### `docs/`

- `eval-tutorial.md` — the full build-along: *rank → expose → fix → calibrate →
  assert → scale → gate*, every trap reappearing as a runnable function.
- `60min-runsheet.md` — a minute-by-minute stage plan, the four-act live demo, and
  seed Q&A.

---

## The one idea the whole repo is built around

Every segment is the same move at a higher resolution: **don't trust the single
number — make the failure point at itself.**

```
00   a score            →  passed / total
01   a rubric + probes   →  which property failed
02   the sources         →  which stage failed
```

A pass/fail hides the failure. A probe names the property. The `sources` name the
stage. That's the difference between a dashboard that turns green and an eval you
can actually debug.

---

## Setup

```bash
cp .env.example .env
# add your OPENROUTER_API_KEY (get one at openrouter.ai)
```

Then work through the folders in order — each is independent, with its own
`package.json`:

```bash
cd 00-foundations && npm install && npm run eval          # no key needed

cd ../01-judge     && npm install && npm run eval          # needs OPENROUTER_API_KEY
MOCK_MODE=true npm run eval                                 # …or run it offline

cd ../02-rag       && npm install && MOCK_MODE=true npm run eval

cd ../03-console   && npm install && MOCK_MODE=true npm run dev
```

`MOCK_MODE=true` serves canned responses that reproduce every lesson faithfully —
no API key, no network, no OpenRAG. Perfect for rehearsing the talk on venue wifi.

### Requirements

- **Node.js 18+** — TypeScript runs via `tsx`, no build step
- **OpenRouter API key** — for `01-judge/`, `02-rag/`, `03-console/`. One key
  reaches any model, and swapping the judge is a one-string change — itself a
  great way to demo judge variance
- **OpenRAG** *(optional)* — for `02-rag/` and `03-console/`; both run in
  `MOCK_MODE` without it

### Environment variables (`.env`)

| Variable | Purpose | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | LLM-as-judge calls | — |
| `JUDGE_MODEL` | judge model slug (any OpenRouter model) | `anthropic/claude-sonnet-4.6` |
| `OPENRAG_URL` | OpenRAG server (`02`, `03`) | `http://localhost:8000` |
| `MOCK_MODE` | run offline with canned responses | `false` |

---

## Sources

- Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (2023) —
  position / length / self-preference bias, and the ~80% human-agreement ceiling
- RAND (2026) — frontier judges are not uniformly reliable; calibrate per task
- **RAGAS** — component-wise RAG metrics: context recall/precision, faithfulness,
  answer relevancy
- **OpenRAG** ([openr.ag](https://openr.ag)) — IBM's Docling → OpenSearch →
  Langflow distribution; the system under test in `02-rag/`
- EleutherAI, *LM Evaluation Harness* (2021) — the lineage this repo teaches: the
  eval harness
- Sibling repo: [basically-ai-harness](https://github.com/TejasQ/basically-ai-harness)
  — the *agent* harness, the newer meaning of the word
