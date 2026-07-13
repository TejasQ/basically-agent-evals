// shared.ts — plumbing every step imports.
//
//   - Judge client + MOCK_MODE
//   - ask() + parseJson()
//   - banner(), mockNotice(), runIfMain()
//
// Each step file is runnable on its own (`npx tsx 0X-name.ts`) and uses
// runIfMain() to fire its demo() only when it's the entry point.

import OpenAI from "openai";
import * as dotenv from "dotenv";
import { pathToFileURL } from "node:url";

dotenv.config({ path: "../.env" });

export const MOCK_MODE = process.env.MOCK_MODE === "true";
export const JUDGE_MODEL = process.env.JUDGE_MODEL || "anthropic/claude-sonnet-4.6";

const judge = MOCK_MODE
  ? null
  : new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

// Canned responses keep the talk runnable offline. The mock dispatcher fakes
// two judges:
//   - naive: always picks whatever is in slot 2 (classic position bias)
//   - rubric: always crowns REPLY_A (the correct denial), no matter the slot
function mockReply(prompt: string): string {
  if (prompt.includes("REPLY 1:") && prompt.includes("REPLY 2:")) {
    const aIdx = prompt.indexOf("We can't accept");
    const bIdx = prompt.indexOf("Great news");

    if (prompt.includes("GROUND TRUTH")) {
      // No REPLY_A/B fingerprint? Default to "slot 1 wins" — works for the
      // calibrate set where the correct reply sits in slot 1.
      if (aIdx < 0 || bIdx < 0) {
        return '{"winner":1,"r1_correct":true,"r2_correct":false,"reason":"Reply 1 is correct"}';
      }
      const aInSlot1 = aIdx < bIdx;
      return JSON.stringify({
        winner: aInSlot1 ? 1 : 2,
        r1_correct: aInSlot1,
        r2_correct: !aInSlot1,
        reason: "Reply A correctly denies; Reply B falsely approves the 20-day return",
      });
    }

    // Naive — biased toward slot 2 regardless of content.
    return '{"winner":2,"reason":"Reply 2 is more detailed and customer-friendly"}';
  }

  if (prompt.includes("APPROVE or DENY")) {
    if (prompt.includes("We can't accept")) return '{"decision":"deny"}';
    if (prompt.includes("Great news"))      return '{"decision":"approve"}';
    if (prompt.includes("approved"))        return '{"decision":"approve"}';
    return '{"decision":"deny"}';
  }
  return '{"result":"mock"}';
}

export async function ask(prompt: string, maxTokens = 512): Promise<string> {
  if (MOCK_MODE) return mockReply(prompt);
  const r = await judge!.chat.completions.create({
    model: JUDGE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return r.choices[0]?.message?.content ?? "";
}

export function parseJson<T = unknown>(text: string): T {
  let t = text.trim();
  if (t.startsWith("```")) {
    const parts = t.split("```");
    t = parts[1] ?? t;
    t = t.toLowerCase().startsWith("json") ? t.slice(4).trim() : t.trim();
  }
  return JSON.parse(t) as T;
}

export function banner(title: string): void {
  console.log();
  console.log("─".repeat(64));
  console.log(title);
  console.log("─".repeat(64));
}

export function mockNotice(): void {
  if (MOCK_MODE) console.log("(MOCK_MODE — offline canned responses)");
}

// Fire `fn` only when this module is the entry point. Lets each step file
// double as a library export and a runnable demo.
export function runIfMain(metaUrl: string, fn: () => Promise<void>): void {
  if (!process.argv[1]) return;
  const entry = pathToFileURL(process.argv[1]).href;
  if (metaUrl === entry) {
    fn().catch((e) => { console.error(e); process.exit(1); });
  }
}
