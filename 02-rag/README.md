# 02-rag: RAG System Evaluation

This folder demonstrates how to evaluate a real RAG (Retrieval-Augmented Generation) system using **stage-level blame analysis**. Instead of just pass/fail, we pinpoint whether failures come from retrieval or generation.

## What's Inside

- `eval-openrag.ts`: Complete RAG evaluation with:
  - **Retrieval probe**: Did the right context surface? (≈ RAGAS "context recall")
  - **Generation probe**: Did the model use it correctly? (≈ RAGAS "faithfulness")
  - **Blame analysis**: Localizes failures to RETRIEVAL vs GENERATION stage
- `sample-docs/refund-policy.md`: Sample policy document to ingest into OpenRAG

## The System Under Test

**OpenRAG** (https://openr.ag) is IBM's open-source RAG distribution with three layers:
1. **Docling**: Ingest and parse documents
2. **OpenSearch**: Retrieve relevant chunks
3. **Langflow**: Orchestrate the generation

## Setup OpenRAG (Optional - can run in MOCK_MODE)

### Option 1: Quick Start with uvx

```bash
uvx --python 3.13 openrag
```

### Option 2: Docker Compose

```bash
git clone https://github.com/langflow-ai/openrag
cd openrag
docker-compose up
```

### Ingest Sample Document

1. Open OpenRAG UI (usually http://localhost:8080)
2. Click "Add Knowledge"
3. Upload `sample-docs/refund-policy.md`
4. Wait for Docling to parse it into the OpenSearch index

## Run the Eval

### With Real OpenRAG (requires running instance)

```bash
npm install

# Set environment variables in ../.env
# OPENRAG_URL=http://localhost:8080
# OPENROUTER_API_KEY=sk-or-...

npm run eval
```

### Offline Mode (no OpenRAG or API key needed)

```bash
MOCK_MODE=true npm run eval
```

Uses canned responses to demonstrate the eval flow without network calls.

## Stage-Level Blame Analysis

Traditional RAG evals give you pass/fail. This eval tells you **where** it failed:

| Retrieved? | Correct? | Blame |
|------------|----------|-------|
| ❌ | ❌ | **RETRIEVAL** — policy chunk never surfaced. Fix Docling parse or OpenSearch index. |
| ✅ | ❌ | **GENERATION** — right context retrieved, but model ignored it. Fix Langflow prompt. |
| ❌ | ✅ | **LUCKY** — correct without grounding. Model guessed from priors. Fix retrieval anyway. |
| ✅ | ✅ | **PASS** — grounded and correct. |

## The Demo Scenario

Question: "Customer bought headphones 20 days ago, wants refund. What do we tell them?"

- **Policy**: 14-day return window
- **Expected**: DENY (20 > 14)
- **Retrieval check**: Did "14" appear in retrieved sources?
- **Generation check**: Did the answer approve or deny?

## Sabotage-a-Stage Demo (Live Talk)

During the talk, the presenter can demonstrate blame analysis by breaking one stage:

1. **Break Retrieval**: Delete the policy from OpenSearch → retrieval fails, blame = RETRIEVAL
2. **Break Generation**: Edit Langflow prompt to ignore policy → retrieval succeeds, blame = GENERATION

This shows how stage-level evals help debug production RAG systems.

## Typecheck

```bash
npx tsc --noEmit
```

Should pass with no errors.

## Key Takeaways

- **Don't just pass/fail**: Use the `sources` field to check retrieval separately
- **Blame analysis**: Pinpoint which stage failed (retrieval vs generation)
- **RAGAS metrics**: This implements simplified versions of context_recall and faithfulness
- **Production debugging**: Stage-level evals help you fix the right component

---

**Next**: Move to `03-console/` for the live stage web app with interactive eval UI.
