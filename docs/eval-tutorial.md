# Code Tutorial — Build an Eval That Doesn't Lie (TypeScript)

A build-along for the 60-minute talk **"Your Evals Are Lying To You."** The audience starts with the naive eval everyone ships, watches it get fooled, then fixes it step by step. Runnable companion: `eval-demo.ts`.

**Setup (put this on a slide before you start):**
```bash
npm init -y
npm install openai
npm install -D tsx typescript
export OPENROUTER_API_KEY=sk-or-...
npx tsx eval-demo.ts
```
The judge runs through **OpenRouter** (OpenAI-compatible) so one key reaches any model — and swapping the judge model is a one-string change, which is itself a great way to demo judge variance. A current slug is `anthropic/claude-sonnet-4.6`; browse `openrouter.ai/models` for others.

> Teaching arc: **rank → expose → fix → calibrate → assert → scale → gate.** Each step is one runnable function. Don't move on until the room has *seen* the previous one run.

---

## Foundations — what an eval even is (5 min)

Assume the room has never written an eval. Start from what they already know: a unit test.

```ts
// A normal test:
expect(add(2, 2)).toBe(4);
```

An eval is *that*, for software that breaks the three things a unit test relies on:
1. **A fixed input.** An LLM feature faces endless phrasings → so an eval needs a **dataset** of inputs, not one.
2. **One exact right answer.** "Good" is fuzzy → so you define a **notion of good** (a property, a rubric, a reference), not a string.
3. **Exact match.** Output varies run to run → so you need a **tolerant checker**, not `===`.

So, the smallest real eval — no AI judge anywhere, just an assertion over a few cases:

```ts
type Case = { input: string; expect: (answer: string) => boolean };

const golden: Case[] = [
  { input: "return after 20 days?", expect: (a) => /no|cannot|outside/i.test(a) },
  { input: "return after 9 days?",  expect: (a) => /yes|approved|within/i.test(a) },
];

function runEval(system: (q: string) => Promise<string>) {
  return Promise.all(golden.map(async (c) => c.expect(await system(c.input))))
    .then((rs) => rs.filter(Boolean).length / rs.length); // a repeatable SCORE
}
```

That's it. That is an eval. The gift is **repeatability**: run it again, get the same verdict — which unlocks the only thing that matters here:

**The payoff — eval-driven development.** Change your prompt, re-run, and watch the number: `0.72 → 0.88` (you helped) or `0.72 → 0.61` (you broke it). You just turned *"I think it's better"* into a fact. That loop is the entire reason to care; everything below is making the checker smarter and the dataset realer.

> On stage: build the snippet above live first. Only once they have a working score do you ask the question that opens the rest of the talk — *"but what if 'good' is too fuzzy to write as a regex?"* — which is exactly when you reach for a model to judge, and exactly when it starts lying.

---

## Step 0 — The plumbing (2 min)

Everything rests on two helpers: one model call, one robust JSON parse. The parse is not boilerplate — flaky parsing is itself a way evals lie (a crash counts as a "fail" even when the answer was fine).

```ts
import OpenAI from "openai";

// The judge runs through OpenRouter — one key, any model.
const judge = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
const JUDGE_MODEL = "anthropic/claude-sonnet-4.6"; // swap this slug to A/B different judges

async function ask(prompt: string, maxTokens = 512): Promise<string> {
  const r = await judge.chat.completions.create({
    model: JUDGE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return r.choices[0]?.message?.content ?? "";
}

function parseJson<T = any>(text: string): T {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.split("```")[1] ?? t;
    t = t.toLowerCase().startsWith("json") ? t.slice(4).trim() : t.trim();
  }
  return JSON.parse(t) as T;
}
```

**The scenario** (one slide): a customer wants to return headphones after 20 days. Policy is 14 days, so the answer is **no**. Reply A is short and correct; Reply B is warm, long, confident, and wrong.

```ts
type Verdict = { winner: 1 | 2; reason: string; r1_correct?: boolean; r2_correct?: boolean };
```

---

## Step 1 — The naive judge everyone ships (3 min)

When "good" is too fuzzy for a regex — tone, helpfulness, "did it actually answer?" — the instinct is to ask another model to grade it. That's an **LLM-as-judge**, and it's where the lying starts. The naive version: ask a model which answer is better. Note what's *missing* — it never sees the policy.

```ts
const NAIVE = (q: string, a: string, b: string) => `You are reviewing two customer-support replies.
QUESTION: ${q}
REPLY 1: ${a}
REPLY 2: ${b}
Which reply is more helpful, higher-quality, and better for the customer?
Respond ONLY as JSON: {"winner": 1 or 2, "reason": "one short sentence"}`;

async function naiveJudge(q: string, a: string, b: string): Promise<Verdict> {
  return parseJson<Verdict>(await ask(NAIVE(q, a, b)));
}
```

**Run it live.** It crowns Reply 2 — the friendly lie — and its `reason` will praise the tone and detail. *"That's the number your dashboard turns green on."*

---

## Step 2 — Expose the bias: the position-swap test (4 min)

This is the moment that earns the talk's title. A fair judge names the **same answer** regardless of which slot it's in. If the winner flips when you swap slots, the score is partly measuring *order*, not *quality*.

```ts
type Judge = (q: string, a: string, b: string) => Promise<Verdict>;

async function positionSwapTest(judge: Judge, q: string, a: string, b: string, n = 4) {
  const rows: [string, string, string][] = [];
  for (let i = 0; i < n; i++) {
    const w1 = (await judge(q, a, b)).winner; // A in slot 1
    const w2 = (await judge(q, b, a)).winner; // A in slot 2
    const named1 = w1 === 1 ? "A" : "B";
    const named2 = w2 === 2 ? "A" : "B";
    rows.push([named1, named2, named1 === named2 ? "stable" : "FLIPPED"]);
  }
  return rows;
}
```

**Run it live.** You'll typically see `FLIPPED` rows and disagreement across identical runs. Two lessons land at once: **position bias** (slot affects the verdict) and **non-determinism** (same input, different answer). Name the cousins on a slide: *length bias, sycophancy, self-preference.*

---

## Step 3 — The fix is the prompt, not the model (4 min)

Give the judge the answer key and a correctness-first rubric. Same model. Different instrument.

```ts
const RUBRIC = (truth: string, q: string, a: string, b: string) => `You are a STRICT evaluator. Correctness comes before everything else.
GROUND TRUTH (the policy / answer key): ${truth}
QUESTION: ${q}
REPLY 1: ${a}
REPLY 2: ${b}
RULES:
1. Check each reply against the GROUND TRUTH.
2. A reply that contradicts it is INCORRECT and CANNOT win — no matter how
   friendly, detailed, confident, or long it is.
3. Only among correct replies, prefer the clearest.
Respond ONLY as JSON:
{"winner":1 or 2,"r1_correct":true,"r2_correct":false,"reason":"one short sentence"}`;

async function rubricJudge(q: string, a: string, b: string, truth = POLICY): Promise<Verdict> {
  return parseJson<Verdict>(await ask(RUBRIC(truth, q, a, b)));
}
```

**Run it, then re-run the swap test on it.** It picks Reply A and the flips largely disappear. The point to say out loud: *nothing changed but the instruction — the bias was never in the model, it was in how you asked.*

---

## Step 4 — Trust, but calibrate (3 min)

Before anyone ships an LLM judge, measure it against humans on a small labeled sample. An uncalibrated judge is a ruler you never checked against a meter stick.

```ts
type Labeled = { q: string; a: string; b: string; human: 1 | 2 };

async function judgeAgreement(judge: Judge, labeled: Labeled[]): Promise<number> {
  let hits = 0;
  for (const { q, a, b, human } of labeled) {
    if ((await judge(q, a, b)).winner === human) hits++;
  }
  return hits / labeled.length; // report this BEFORE you trust the judge
}
```

Rule of thumb to give them: ~80% is roughly how often *humans agree with each other* (Zheng et al., 2023), so it's the ceiling, not a floor — aim to *match* it on 20–50 hand-labeled examples, not beat it. And no judge is uniformly reliable (a 2026 RAND study found frontier models exceed 50% error on hard bias benchmarks), so re-check agreement per task, not once.

---

## Step 5 — Stop ranking, start asserting (4 min)

Pairwise "which is better" is the wrong shape for production. You don't have two answers in prod — you have one, and you want to know if it's *right*. Replace one fuzzy score with **probes**: small, targeted checks. These come in three types, cheapest first: **deterministic** (programmatic asserts), **statistical** (regex/heuristics), and **LLM-as-judge** (for the genuinely fuzzy residue). Reach for them in that order — don't pay a model call for something a 5ms check settles.

```ts
// Deterministic probe — free, instant, never flaky:
function probeMentionsWindow(answer: string): boolean {
  return answer.includes("14");
}

// Fuzzy probe — extract the decision, then assert on it:
async function probeDecision(answer: string): Promise<"approve" | "deny"> {
  const out = await parseJson<{ decision: "approve" | "deny" }>(
    await ask(`Does this reply APPROVE or DENY the refund?\nReply: ${answer}\nJSON only: {"decision":"approve" or "deny"}`)
  );
  return out.decision;
}
```

Teaching point: a probe that returns *which property* failed is debuggable; a single 0–1 score is not.

---

## Step 6 — Run it over a dataset (4 min)

One example is a demo; a dataset is an eval. Score the whole set and surface the failures, not just the average.

```ts
type Case = { id: string; answer: string; expected: "approve" | "deny" };

const DATASET: Case[] = [
  { id: "d1", answer: REPLY_A, expected: "deny" },
  { id: "d2", answer: REPLY_B, expected: "deny" },
  { id: "d3", answer: "Sure! It's day 9, inside the 14-day window — approved.", expected: "approve" },
  { id: "d4", answer: "Thanks! I've gone ahead and approved your refund.", expected: "deny" },
];

async function evaluate(dataset: Case[]) {
  const results = [];
  for (const c of dataset) {
    const got = await probeDecision(c.answer);
    results.push({ id: c.id, expected: c.expected, got, pass: got === c.expected });
  }
  const nPass = results.filter((r) => r.pass).length;
  return { results, nPass, n: results.length };
}
```

**Run it live.** `d4` fails — a confidently wrong approval. Open that one row. *"This is the difference between a number and an eval: the number says 75%; the eval shows you the customer you'd have lied to."*

---

## Step 7 — Pin it in CI (2 min)

The failing `d4` becomes a permanent regression fixture. The eval graduates from a script to a gate.

Where each eval actually runs — the four-stage cadence that's now standard practice:
1. **Dev — millisecond sanity checks** (does the JSON parse? is the label one of the four allowed?). Not quality evals; they filter obvious breakage before anything hits a judge.
2. **CI — the golden-set gate** above: every PR that touches a prompt, model, or retrieval config runs it; regress past threshold → no merge.
3. **Pre-release — an adversarial / red-team set** (cover the OWASP Top 10 for LLM apps). The golden set catches failures you've seen; this finds the ones you haven't.
4. **Production — sample 5–10% of real traffic** and score it continuously. This is the *only* layer that catches changes that happen *to* you (silent model updates, input drift) rather than changes you make.

```ts
async function ciGate(dataset: Case[], threshold = 0.9): Promise<number> {
  const { nPass, n } = await evaluate(dataset);
  const rate = nPass / n;
  if (rate < threshold) {
    throw new Error(`Eval regressed: ${(rate * 100).toFixed(0)}% < ${(threshold * 100).toFixed(0)}%`);
  }
  return rate;
}
```

Close the loop: every real production failure you find becomes a new row here, so the suite grows toward your actual traffic instead of rotting. That's the bridge to the production half of the talk (traces → sample failures → new fixtures).

---

## Step 8 — Point it at a real RAG system (OpenRAG) (6 min)

Companion file: `eval-openrag.ts`. So far the "system" was two strings. Now swap in a real pipeline: **OpenRAG** (https://openr.ag), IBM's open-source RAG distribution that bundles all three tools you asked about as its three layers — **Docling** (ingest/parse) → **OpenSearch** (retrieve) → **Langflow** (orchestrate).

Run it locally, ingest a real policy PDF (Docling parses it), then have your harness *call* it:

```bash
uvx --python 3.13 openrag        # one command; or docker-compose up from the repo
# UI → Add Knowledge → upload refund-policy.pdf
npm install openrag-sdk openai
export OPENRAG_URL=http://localhost:8080
export OPENROUTER_API_KEY=sk-or-...   # the judge runs through OpenRouter
npx tsx eval-openrag.ts
```

```ts
import { OpenRAGClient, type Source } from "openrag-sdk";
const rag = new OpenRAGClient(); // baseUrl ← OPENRAG_URL

async function askOpenRAG(message: string): Promise<{ answer: string; sources: Source[] }> {
  const res = await rag.chat.create({ message });
  return { answer: res.response, sources: res.sources }; // note: it returns the retrieved sources
}
```

The payoff is the `sources` field — it lets you do the thing a single score can't: **localize which stage lied.**

```ts
// Did the right chunk actually surface? (retrieval = Docling parse + OpenSearch)
function retrievalHit(sources: Source[], mustContain: string): boolean {
  return sources.some((s) => s.text.includes(mustContain));
}

// Then: combine with the generation decision to assign blame.
//   not retrieved + wrong  → RETRIEVAL failed (bad parse / wrong chunk)
//   retrieved   + wrong    → GENERATION failed (model ignored good context)
//   not retrieved + right  → LUCKY guess — fix retrieval anyway
```

**Run it live, then sabotage a stage.** Open the embedded Langflow editor, swap the agent to a weaker model (or drop the re-ranker), re-run — watch `blame` flip from "GENERATION" to a different failure, in real time. *This* is "one score hides the failure" made physical: you can point at the node.

> These map onto the standard **RAGAS** metrics, which evaluate each component in isolation: `retrievalHit` is a teaching proxy for **context recall** (did retrieval surface the needed info?), paired with **context precision** (are the retrieved chunks actually relevant?); the generation side is **faithfulness** (is every claim grounded in the retrieved context?) and **answer relevancy**. For pure retrieval scoring, `client.search.query(...)` returns ranked `results` you can score with recall@k / precision@k / MRR against known filenames — retrieval eval, fully decoupled from generation. (Watch for "Lost in the Middle" — models can miss correct context buried mid-prompt, which reads as a generation miss but is really a ranking problem.)

> OpenRAG is OpenAI-compatible too, so you can point *its* model provider at OpenRouter (Settings → model provider, base URL `https://openrouter.ai/api/v1`). Then both the system under test and the judge run through one gateway — and you can A/B the generator model by changing a slug.

---

## The five-line takeaway (leave this on screen)

1. Rank → **assert**: probes beat a single preference score.
2. The bias is in the **prompt**, not the model — give the judge the answer key.
3. **Calibrate** the judge against humans before you trust it.
4. Surface the **failing rows**, not just the average.
5. Every production failure becomes a **regression fixture** — that's how the set stops rotting.
6. On a real RAG system, eval each **stage** — use the retrieved `sources` to tell a retrieval miss from a generation miss.
