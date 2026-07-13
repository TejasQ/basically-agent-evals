# 03-console: Live Stage Web App

A live diagnostic console for demonstrating LLM evaluations on stage. Features two interactive tabs: a toy scenario with editable prompts and a real RAG system integration.

## What's Inside

- **Frontend** (Vite + React + TypeScript):
  - **Toy Tab**: Editable question/policy/replies, naive vs rubric judge toggle, 1/3/5 runs, show-prompt feature, verdict banner
  - **Real RAG Tab**: OpenRAG integration, shows answer + sources, stage-blame analysis
  - Dark "diagnostic console" design with projector-legible typography
  
- **Backend** (Express + TypeScript):
  - Proxies judge calls to OpenRouter (keeps API keys server-side)
  - Proxies RAG calls to OpenRAG
  - Full MOCK_MODE support for offline demos

## Architecture: Keys Stay Server-Side

```
Browser (no keys) → Express Backend (has keys) → OpenRouter/OpenRAG
```

The frontend **never** sees API keys. All calls go through `/api/judge` and `/api/rag` endpoints.

## Setup

```bash
npm install

# Set environment variables in ../.env
# OPENROUTER_API_KEY=sk-or-...
# OPENRAG_URL=http://localhost:8000
# MOCK_MODE=false
```

## Run It

### Development Mode (both frontend and backend)

```bash
npm run dev
```

This starts:
- Express backend on `http://localhost:3001`
- Vite frontend on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

### Offline Mode (no API keys needed)

```bash
MOCK_MODE=true npm run dev
```

Uses canned responses for both judge and RAG calls. Perfect for:
- Rehearsing the talk without burning API credits
- Demos in venues with unreliable wifi
- Development without OpenRAG running

## Verify No Keys Reach Browser

1. Open browser DevTools → Network tab
2. Run an eval in the Toy tab
3. Inspect the `/api/judge` request
4. Confirm: request body contains only `{ "prompt": "..." }`, no API keys

The backend adds the API key when forwarding to OpenRouter.

## The Two Tabs

### Toy Tab

Interactive demonstration of judge bias:

1. **Edit the scenario**: Question, ground truth, two replies
2. **Mark which reply is correct**: Radio buttons
3. **Choose judge mode**:
   - **Naive**: "Which is more helpful?" (no ground truth)
   - **Rubric**: Correctness-first with ground truth
4. **Run 1/3/5 times**: Expose flakiness
5. **Show prompt**: See exactly what's sent to the judge
6. **Verdict banner**: 
   - 🔴 Red "THE EVAL LIED" if wrong reply wins
   - 🟢 Green "THE EVAL TOLD THE TRUTH" if correct

### Real RAG Tab

OpenRAG integration with stage-blame:

1. **Ask a question**: Queries the OpenRAG system
2. **See the answer**: Full response from RAG
3. **View sources**: Retrieved chunks with metadata
4. **Blame analysis**: 
   - ✅ Retrieved context? (checks for "14 days")
   - ✅ Correct decision? (checks for deny/approve)
   - Pinpoints RETRIEVAL vs GENERATION failures

## Design: Dark Diagnostic Console

- **Monospace UI**: JetBrains Mono for code/data feel
- **Display font**: Syne for headings
- **Color coding**:
  - 🟢 Green = truth/correct/pass
  - 🟡 Amber = policy/warning
  - 🔴 Red = lie/wrong/fail
  - 🔵 Blue = info/interactive
- **Projector-legible**: High contrast, large text, clear verdicts

## Typecheck

```bash
npx tsc --noEmit
```

Should pass with no errors.

## Production Build

```bash
npm run build
npm run preview
```

## Key Features for Live Demos

1. **Instant feedback**: Results appear as they stream in
2. **Flakiness detection**: Run multiple times, see disagreement
3. **Prompt transparency**: Show exactly what the judge sees
4. **Stage-blame**: Don't just fail—explain where it broke
5. **Offline mode**: Demo works without network

## Troubleshooting

**"Judge call failed"**: 
- Check OPENROUTER_API_KEY in `../.env`
- Verify backend is running (`curl http://localhost:3001/api/health`)
- Try MOCK_MODE=true

**"RAG call failed"**:
- Check OpenRAG is running (`curl http://localhost:8000/health`)
- Verify OPENRAG_URL in `../.env`
- Try MOCK_MODE=true

**Keys in browser?**:
- Check Network tab in DevTools
- Request bodies should only have `prompt` or `message`
- Keys are added server-side in `server/index.ts`

---

**Next**: Check out `docs/` for the full tutorial and 60-minute runsheet.
