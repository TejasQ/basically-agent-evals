import React, { useState } from 'react';

const COLORS = {
  bg: '#0a0c0f',
  panel: '#12161c',
  panel2: '#0e1217',
  line: '#222a33',
  ink: '#e8eef2',
  dim: '#7b8794',
  green: '#3ee08f',
  amber: '#ffb454',
  red: '#ff5d6c',
  blue: '#5cc8ff',
};

const DEFAULTS = {
  question: "A customer bought a pair of headphones 20 days ago and emails asking to return them for a full refund. What should our support reply?",
  truth: "COMPANY POLICY: Returns are accepted only within 14 days of purchase. 20 days > 14 days, so this return is OUTSIDE the window and must be DECLINED. The correct answer says NO.",
  r1: "Unfortunately we can't accept this return. Our policy allows returns within 14 days of purchase, and it's now been 20 days, so this order falls outside the return window.",
  r2: "Great news — we'd be happy to help! You're well within our flexible 30-day satisfaction guarantee, so you absolutely qualify for a full refund. Just pop the headphones back in the original box, attach the prepaid label we'll email you, and drop it at any carrier location. Refunds process in 3–5 business days, and we'll throw in a 10% off code for the inconvenience. Thanks for being a valued customer!",
  truthIsR1: true,
};

type Verdict = {
  winner: 1 | 2;
  reason: string;
  r1_correct?: boolean;
  r2_correct?: boolean;
};

type RAGResponse = {
  response: string;
  sources: Array<{ text: string; metadata?: any }>;
};

function buildPrompt(mode: string, s: typeof DEFAULTS): string {
  if (mode === 'naive') {
    return `You are reviewing two customer-support replies.

QUESTION FROM CUSTOMER:
${s.question}

REPLY 1:
${s.r1}

REPLY 2:
${s.r2}

Which reply is more helpful, higher-quality, and better for the customer?
Respond ONLY with JSON, no other text:
{"winner": 1 or 2, "reason": "one short sentence"}`;
  }
  return `You are a STRICT evaluator. Correctness comes before everything else.

GROUND TRUTH (the company's actual policy — the answer key):
${s.truth}

QUESTION FROM CUSTOMER:
${s.question}

REPLY 1:
${s.r1}

REPLY 2:
${s.r2}

RULES:
1. First, check each reply against the GROUND TRUTH above.
2. A reply that contradicts the ground truth is INCORRECT and CANNOT win — no matter how friendly, detailed, confident, or long it is.
3. Only among factually correct replies, prefer the clearest.

Respond ONLY with JSON, no other text:
{"winner": 1 or 2, "r1_correct": true or false, "r2_correct": true or false, "reason": "one short sentence"}`;
}

async function callJudge(prompt: string): Promise<Verdict> {
  const res = await fetch('/api/judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Judge call failed');
  return await res.json();
}

async function callRAG(message: string): Promise<RAGResponse> {
  const res = await fetch('/api/rag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('RAG call failed');
  return await res.json();
}

function ToyTab() {
  const [s, setS] = useState(DEFAULTS);
  const [mode, setMode] = useState<'naive' | 'rubric'>('naive');
  const [runs, setRuns] = useState(1);
  const [results, setResults] = useState<Verdict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const correctIdx = s.truthIsR1 ? 1 : 2;
  const set = (k: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setS({ ...s, [k]: e.target.value });

  async function run() {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const out: Verdict[] = [];
      for (let i = 0; i < runs; i++) {
        const result = await callJudge(buildPrompt(mode, s));
        out.push(result);
        setResults([...out]);
      }
    } catch (e: any) {
      setError('Judge call failed — check the server and try again.');
    } finally {
      setLoading(false);
    }
  }

  const picks = results.map((r) => r.winner);
  const wrongCount = picks.filter((w) => w !== correctIdx).length;
  const lied = results.length > 0 && wrongCount > 0;
  const flaky = new Set(picks).size > 1;

  const card: React.CSSProperties = {
    background: COLORS.panel,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
  };

  const label: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.dim,
    marginBottom: 8,
  };

  const ta: React.CSSProperties = {
    width: '100%',
    background: COLORS.panel2,
    color: COLORS.ink,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    lineHeight: 1.5,
    resize: 'vertical',
  };

  return (
    <div>
      {/* Scenario */}
      <div style={card}>
        <div style={label}>01 / The Scenario</div>
        <textarea style={{ ...ta, marginBottom: 12 }} rows={2} value={s.question} onChange={set('question')} />
        <div style={{ ...label, color: COLORS.amber }}>Ground Truth — the answer key</div>
        <textarea
          style={{ ...ta, borderColor: '#3a3320', background: '#161308' }}
          rows={2}
          value={s.truth}
          onChange={set('truth')}
        />
      </div>

      {/* Two Answers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        {[1, 2].map((n) => {
          const isCorrect = correctIdx === n;
          return (
            <div key={n} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={label}>Reply {n}</div>
                <label style={{ fontSize: 11, color: COLORS.dim, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="radio"
                    checked={isCorrect}
                    onChange={() => setS({ ...s, truthIsR1: n === 1 })}
                  />
                  mark as correct
                </label>
              </div>
              <textarea style={ta} rows={7} value={n === 1 ? s.r1 : s.r2} onChange={set(n === 1 ? 'r1' : 'r2')} />
              {isCorrect && <div style={{ marginTop: 8, fontSize: 11, color: COLORS.green }}>✓ this is the truthful reply</div>}
            </div>
          );
        })}
      </div>

      {/* Judge Controls */}
      <div style={card}>
        <div style={label}>02 / The Judge</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            ['naive', 'NAÏVE JUDGE', '"which is more helpful?"'],
            ['rubric', 'RUBRIC JUDGE', 'correctness-first, gets the answer key'],
          ].map(([m, t, sub]) => (
            <button
              key={m}
              onClick={() => setMode(m as 'naive' | 'rubric')}
              style={{
                flex: '1 1 220px',
                textAlign: 'left',
                background: mode === m ? (m === 'naive' ? '#2a1822' : '#10271d') : COLORS.panel2,
                border: `1px solid ${mode === m ? (m === 'naive' ? COLORS.red : COLORS.green) : COLORS.line}`,
                color: COLORS.ink,
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div>
              <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 3 }}>{sub}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: COLORS.dim }}>runs:</span>
            {[1, 3, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRuns(r)}
                style={{
                  background: runs === r ? COLORS.ink : 'transparent',
                  color: runs === r ? COLORS.bg : COLORS.ink,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 6,
                  width: 34,
                  height: 30,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                }}
              >
                {r}
              </button>
            ))}
            <span style={{ fontSize: 11, color: COLORS.dim, marginLeft: 4 }}>(run several to expose flakiness)</span>
          </div>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={{
              background: 'transparent',
              color: COLORS.blue,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {showPrompt ? '▾ hide' : '▸ show'} the prompt being sent
          </button>
        </div>

        {showPrompt && (
          <pre
            style={{
              marginTop: 12,
              background: '#06080a',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              color: COLORS.dim,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              maxHeight: 220,
              overflow: 'auto',
            }}
          >
            {buildPrompt(mode, s)}
          </pre>
        )}

        <button
          onClick={run}
          disabled={loading}
          style={{
            marginTop: 16,
            width: '100%',
            background: loading ? COLORS.line : COLORS.green,
            color: loading ? COLORS.dim : '#04130c',
            border: 'none',
            borderRadius: 8,
            padding: 16,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? `JUDGING…  (${results.length}/${runs})` : '▶ RUN THE EVAL'}
        </button>
      </div>

      {/* Verdict */}
      {error && <div style={{ ...card, borderColor: COLORS.red, color: COLORS.red }}>{error}</div>}

      {results.length > 0 && !error && (
        <div style={card}>
          <div style={label}>03 / The Verdict</div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 30,
              lineHeight: 1.15,
              color: lied ? COLORS.red : COLORS.green,
              marginBottom: 6,
            }}
          >
            {lied ? '✗ THE EVAL LIED.' : '✓ THE EVAL TOLD THE TRUTH.'}
          </div>
          <div style={{ color: COLORS.dim, fontSize: 14, marginBottom: 18 }}>
            {lied
              ? `It crowned the confidently-wrong reply ${wrongCount}/${results.length} time${results.length > 1 ? 's' : ''}. The number on your dashboard would say "pass."`
              : `It correctly picked the truthful reply ${results.length}/${results.length} times.`}
            {flaky && ' It also disagreed with itself across runs — same input, different answer.'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => {
              const ok = r.winner === correctIdx;
              return (
                <div
                  key={i}
                  style={{
                    background: COLORS.panel2,
                    border: `1px solid ${ok ? '#1d3a2b' : '#3a1d22'}`,
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: COLORS.dim }}>run {i + 1}</span>
                    <span style={{ fontWeight: 700, color: ok ? COLORS.green : COLORS.red }}>
                      picked Reply {r.winner} {ok ? '✓ correct' : '✗ WRONG'}
                    </span>
                    {'r1_correct' in r && (
                      <span style={{ fontSize: 11, color: COLORS.dim }}>
                        [graded R1: {String(r.r1_correct)} · R2: {String(r.r2_correct)}]
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>"{r.reason}"</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RealRAGTab() {
  const [question, setQuestion] = useState("A customer bought headphones 20 days ago and wants a full refund. What should we tell them?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RAGResponse | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await callRAG(question);
      setResult(data);
    } catch (e: any) {
      setError('RAG call failed — check the server and OpenRAG instance.');
    } finally {
      setLoading(false);
    }
  }

  const card: React.CSSProperties = {
    background: COLORS.panel,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
  };

  const label: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.dim,
    marginBottom: 8,
  };

  return (
    <div>
      <div style={card}>
        <div style={label}>Question</div>
        <textarea
          style={{
            width: '100%',
            background: COLORS.panel2,
            color: COLORS.ink,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'vertical',
          }}
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={run}
          disabled={loading}
          style={{
            marginTop: 12,
            width: '100%',
            background: loading ? COLORS.line : COLORS.blue,
            color: loading ? COLORS.dim : '#04130c',
            border: 'none',
            borderRadius: 8,
            padding: 16,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'QUERYING RAG…' : '▶ ASK OPENRAG'}
        </button>
      </div>

      {error && <div style={{ ...card, borderColor: COLORS.red, color: COLORS.red }}>{error}</div>}

      {result && (
        <>
          <div style={card}>
            <div style={label}>Answer</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink }}>{result.response}</div>
          </div>

          <div style={card}>
            <div style={label}>Retrieved Sources ({result.sources.length})</div>
            {result.sources.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.dim }}>No sources retrieved</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.sources.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      background: COLORS.panel2,
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, color: COLORS.dim, marginBottom: 6 }}>
                      Source {i + 1}
                      {src.metadata && ` · ${JSON.stringify(src.metadata)}`}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.ink }}>{src.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={label}>Stage Blame Analysis</div>
            <div style={{ fontSize: 13, color: COLORS.dim, lineHeight: 1.6 }}>
              {(() => {
                // NB: OpenRAG's chat API doesn't currently populate `score`
                // (always 0), so we diagnose retrieval from filename + chunk
                // text instead — what's actually grounded in the response.
                const policyDocHit = result.sources.some((s) =>
                  /refund|return|policy/i.test(s.metadata?.filename ?? '')
                );
                const ruleChunkHit = result.sources.some(
                  (s) =>
                    /refund|return|policy/i.test(s.metadata?.filename ?? '') &&
                    /\b\d+\s*-?\s*day(s)?\b/i.test(s.text ?? '')
                );

                let retrievalStatus: React.ReactNode;
                if (!policyDocHit) {
                  retrievalStatus = (
                    <span style={{ color: COLORS.red }}>
                      ✗ Policy doc NOT retrieved
                    </span>
                  );
                } else if (!ruleChunkHit) {
                  retrievalStatus = (
                    <span style={{ color: COLORS.amber }}>
                      ⚠ Policy doc retrieved, but no chunk contains the
                      day-window rule
                    </span>
                  );
                } else {
                  retrievalStatus = (
                    <span style={{ color: COLORS.green }}>
                      ✓ Policy retrieved with day-window rule in chunk text
                    </span>
                  );
                }

                const reply = result.response.toLowerCase();
                const deniedTerms = /\b(cannot|can't|unable|decline|denied|outside|not eligible|sorry)\b/;
                const approvedTerms = /\b(approved|happy to|refund.*processed|refund.*issued|full refund|eligible|qualif)/;
                let decisionStatus: React.ReactNode;
                if (deniedTerms.test(reply) && !approvedTerms.test(reply)) {
                  decisionStatus = (
                    <span style={{ color: COLORS.green }}>✓ Correctly DENIED</span>
                  );
                } else if (approvedTerms.test(reply) && !deniedTerms.test(reply)) {
                  decisionStatus = (
                    <span style={{ color: COLORS.red }}>
                      ✗ INCORRECTLY APPROVED (policy says 14-day window)
                    </span>
                  );
                } else {
                  decisionStatus = (
                    <span style={{ color: COLORS.amber }}>
                      ? Ambiguous — read the answer above
                    </span>
                  );
                }

                return (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: COLORS.ink }}>Retrieved context:</strong>{' '}
                      {retrievalStatus}
                    </div>
                    <div>
                      <strong style={{ color: COLORS.ink }}>Decision:</strong>{' '}
                      {decisionStatus}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<'toy' | 'rag'>('toy');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        color: COLORS.ink,
        fontFamily: "'JetBrains Mono', monospace",
        padding: '28px 20px 60px',
        backgroundImage: 'radial-gradient(circle at 20% -10%, rgba(62,224,143,0.07), transparent 40%)',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              YOUR EVALS ARE LYING TO YOU
            </div>
            <div style={{ color: COLORS.dim, marginTop: 8, fontSize: 13 }}>
              Live diagnostic console for LLM evaluations
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: COLORS.green,
              border: `1px solid ${COLORS.green}`,
              borderRadius: 999,
              padding: '5px 12px',
            }}
          >
            ● LIVE CONSOLE
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            ['toy', 'TOY EVAL', 'Editable scenario with naive vs rubric judge'],
            ['rag', 'REAL RAG', 'OpenRAG integration with stage-blame'],
          ].map(([t, title, desc]) => (
            <button
              key={t}
              onClick={() => setTab(t as 'toy' | 'rag')}
              style={{
                flex: 1,
                textAlign: 'left',
                background: tab === t ? COLORS.panel : 'transparent',
                border: `1px solid ${tab === t ? COLORS.green : COLORS.line}`,
                color: COLORS.ink,
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
              <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 3 }}>{desc}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'toy' ? <ToyTab /> : <RealRAGTab />}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: COLORS.dim, fontSize: 11, marginTop: 24, lineHeight: 1.6 }}>
          The naïve judge never sees the policy, so it rewards tone & length — and ships a bot that lies to customers.
          <br />
          The rubric judge gets the answer key and is told correctness beats style. Same model. Different instrument.
        </div>
      </div>
    </div>
  );
}
