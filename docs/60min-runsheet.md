# 60-Minute Runsheet — "Your Evals Are Lying To You"

Target: ~52 min content + ~8 min Q&A. **Audience assumption: most of the room has never written an eval and isn't running any.** So the danger isn't a lying instrument — it's *no* instrument. The talk opens from first principles (what an eval even is, build your first one live), *then* turns to how the thing you just built can lie. Three live segments (first eval + demo, code tutorial, production walk). Keep the laptop on the editor/console the whole time.

**The title is the hook even for beginners:** "You think your evals can't be lying to you because you don't have any. That's worse — you're flying with no instrument at all. Let's build one. Then I'll show you how even that one lies."

---

## The four-act live demo (the hook engine)

Run on the **Eval Console** artifact. This is the visual wow that motivates the code tutorial — show it breaking *before* you build the fix.

**Act 1 — The crowning (≈2 min).** Naive judge selected. Open "show the prompt" so the room reads it — it looks completely reasonable, and it never sees the policy. Hit RUN. It picks Reply 2, the friendly lie. Read its reasoning aloud; it praises tone and detail. *"Your dashboard just turned green."*

**Act 2 — The flakiness (≈1.5 min).** Bump runs to 5. Same input, different winners across runs. *"It can't even agree with itself — and this is the number teams report to leadership."*

**Act 3 — The fix (≈2 min).** Switch to the Rubric judge. Show *that* prompt: same model, but it gets the answer key and is told correctness beats style. RUN. Verdict flips green. *"Same model. Different instrument. The bias was never in the model."*

**Act 4 — The scale tease (≈1 min).** Type a brand-new case someone shouts from the room, re-run rubric. It holds. *"One case is a demo. Let's build the thing that does this over your whole dataset."* → hard cut to the editor.

**Act 5 — The real system (≈3 min, after the code tutorial).** Switch the harness target from two strings to **OpenRAG** (`openr.ag` — IBM's distro of Docling + OpenSearch + Langflow). Ask the live refund question through its TypeScript SDK; the response carries the retrieved `sources`. Run `eval-openrag.ts` → it prints `blame: GENERATION` (or RETRIEVAL). Then open the embedded **Langflow** editor, swap the agent to a weaker model or drop the re-ranker, re-run — `blame` flips live. *"A single score can't tell you which box lied. The sources can — so point at the box."*

**Stage-proofing:** test on venue wifi beforehand; the console has a retry-able error state; keep `MOCK_MODE` (in the coding-agent build) as the offline fallback. Have screenshots of the red and green verdicts on a hidden backup slide.

---

## Minute-by-minute

| Time | Segment | Beat |
|---|---|---|
| 0:00–0:04 | **Cold open · the vibe check** | "How do you know your AI feature works right now? Honest answer: you ran it a few times, it looked right, you shipped. That's a vibe, not a test." Subvert the title: "You think your evals can't be lying — you don't have any. That's worse: no instrument at all." (Absorbs the old "velocity lies" point: shipping faster than ever, no idea if it's better.) |
| 0:04–0:10 | **What an eval IS (first principles)** | Anchor on what they know: `assert add(2,2) == 4`. An eval is that, for software that's *non-deterministic* and where "correct" is *fuzzy*. The three things LLMs break in a normal test: fixed input → you need a **dataset**; one exact right answer → you need a **notion of "good"**; exact match → you need a **tolerant checker**. Define golden set = trusted inputs + ideal outputs. |
| 0:10–0:16 | **Your FIRST eval, live (≈4 lines)** | Build the dumbest thing that works: a few inputs + one checkable property + an assertion → a repeatable **score**. No AI judge yet — a deterministic check. The gift is repeatability: run it again, same verdict. |
| 0:16–0:20 | **The payoff · eval-driven dev** | Change the prompt, re-run, watch 72% → 88% (or → 61%). You just turned "I think it's better" into a fact. *This* is why anyone should care — it's TDD for fuzzy software. |
| 0:20–0:24 | **The turn → judges and their traps** | "What if 'good' is too fuzzy to assert in code? You ask another model to grade it. The moment you do, it lies." Define LLM-as-judge; name the biases: length/verbosity, position, self-preference (Zheng et al. 2023). |
| 0:24–0:32 | **LIVE DEMO (acts 1–3)** | The console: judge crowns the lie → flakiness on repeat → rubric fix. *Now earned — they just built a judge.* "Same model, different instrument." |
| 0:32–0:34 | **Reset + setup slide** | `npm install openai` (judge via OpenRouter), `export OPENROUTER_API_KEY`, `npx tsx eval-demo.ts`. "Let's harden the eval you just built." |
| 0:34–0:46 | **CODE TUTORIAL (build-along)** | `eval-tutorial.md`, run each function live: position-swap test (proves + fixes bias) → calibrate vs humans → probes (3 types) → dataset run (the d4 failing row is the peak — open it) → CI gate → the four-stage cadence. Also covers staleness (GPT-4 Turbo silent weight change) and distribution shift as they arise. |
| 0:46–0:48 | **Bridge → real system** | "Your dataset is still a lab. Here's the same eval wrapped around a real, open-source RAG stack." |
| 0:48–0:54 | **RAG UNDER TEST (Act 5) + production** | Run `eval-openrag.ts` against OpenRAG (Docling→OpenSearch→Langflow); localize retrieval vs generation via `sources` (RAGAS: context recall/precision vs faithfulness/answer relevancy); sabotage a stage in Langflow, watch `blame` flip. Then: traces & spans, 5–10% prod sampling, golden set grown *from* prod so it stops rotting. |
| 0:54–0:58 | **Framework + close** | The checklist. "An eval is how you see. Right now most of you are flying blind — you don't have to be after today." 2026 ends the grace period: prove the system worked. |
| 0:58–1:00+ | **Q&A** | Seed questions below. |

---

## Section depth notes (so the extra 30 min is substance, not padding)

- **Open from zero.** Assume the room has never written an eval. The first 20 minutes earn the concept: vibe check → what an eval is (from unit tests) → build your first one live → the eval-driven-dev payoff. Don't say "LLM-as-judge" until minute 20.
- **The title is a deliberate bait-and-switch.** "Your evals are lying" lands *after* they build one — for the opening, flip it: not having evals is worse than having lying ones.
- **The biases are introduced when hit, not front-loaded.** Judge biases at the turn + demo; staleness/distribution shift inside the code tutorial; "which stage lied" at the RAG segment. Each trap appears the moment the audience could actually hit it.
- The **code tutorial is the centerpiece** (12 min): every trap reappears as a runnable function — spine is "build it → watch it break → harden it."
- **Calibration** is the bit most eval talks skip: measure judge↔human agreement before trusting the judge. Your defense against "but the judge is also an LLM."

## Seed Q&A (rehearse these)

- *"I have zero evals today — where do I start?"* → one deterministic assertion over 10 real inputs, today. That's a real eval. Don't reach for an LLM judge or a framework first; earn the score, then grow the set from failures.
- *"The judge is an LLM too — why trust it?"* → calibrate against humans (Step 4); ~80% agreement is the human–human ceiling, so match it, don't expect more; use deterministic probes where possible and judge only the fuzzy residue; no judge is uniformly reliable (RAND 2026), so re-check per task.
- *"Pairwise vs pointwise?"* → pairwise for ranking/preference tuning; pointwise/probes for production correctness. Prod has one answer, not two.
- *"How big should the eval set be?"* → start at 20–50 calibrated examples; grow it from production failures, not from imagination.
- *"Won't rubric prompts get huge?"* → keep the rubric short and correctness-first; push verifiable facts into deterministic probes, not the judge prompt.
- *"Cost?"* → deterministic probes are free; reserve model calls for fuzzy checks; sample prod rather than judging 100%.

## To personalize before submitting

- Swap your name / handle on the title + close slides.
- Confirm the incident / change-failure stats against their original reports — reviewers spot-check these.
- Pre-load the console with one example from *your* domain so Act 4 feels native.
