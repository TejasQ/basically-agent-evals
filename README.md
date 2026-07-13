# LLM Evals Conference Talk

A hands-on teaching repository demonstrating how to build reliable evaluations for LLM systems, from basic assertions to production-ready RAG evals. Each folder is self-contained and runnable, progressing from foundational concepts to a live diagnostic console.

## Setup

1. Copy `.env.example` to `.env` and add your OpenRouter API key
2. Work through folders in order: `00-foundations/` → `01-judge/` → `02-rag/` → `03-console/`
3. Each folder has its own README with exact run commands
4. Set `MOCK_MODE=true` in `.env` to run offline with canned responses

## Folder → Talk Segment Mapping

| Folder | Talk Segment | Duration | Key Concept |
|--------|--------------|----------|-------------|
| `00-foundations/` | Opening: "An eval is just a test" | 5 min | Pure assertions, no AI needed |
| `01-judge/` | Act I: "When 'good' is fuzzy" | 20 min | LLM-as-judge, position bias, rubrics, calibration |
| `02-rag/` | Act II: "Real systems" | 15 min | RAG eval, stage blame (retrieval vs generation) |
| `03-console/` | Act III: "Live on stage" | 15 min | Interactive diagnostic console, truth vs policy |
| `docs/` | Reference materials | - | Tutorial and 60-minute runsheet |

## Requirements

- Node.js 18+
- TypeScript (via `tsx` - no build step needed)
- OpenRouter API key (for `01-judge/`, `02-rag/`, `03-console/`)
- Optional: OpenRAG server for `02-rag/` and `03-console/` (can run in MOCK_MODE without it)

## Quick Start

```bash
# Install dependencies in each folder as you go
cd 00-foundations && npm install
npm run eval

# Continue to next folder
cd ../01-judge && npm install
MOCK_MODE=true npm run eval  # Runs offline

# And so on...
```

See individual folder READMEs for detailed instructions.
