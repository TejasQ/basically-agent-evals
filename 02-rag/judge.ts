/**
 * judge.ts - LLM judge utilities
 */

import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MOCK_MODE = process.env.MOCK_MODE === "true";

const judge = MOCK_MODE
  ? null
  : new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

const JUDGE_MODEL = process.env.JUDGE_MODEL || "anthropic/claude-sonnet-4.6";

/**
 * Ask the judge a question
 */
export async function ask(prompt: string): Promise<string> {
  if (MOCK_MODE) {
    // Mock judge responses
    if (prompt.includes("APPROVE or DENY")) {
      if (prompt.includes("cannot accept") || prompt.includes("14 days")) {
        return '{"decision": "deny"}';
      }
      return '{"decision": "approve"}';
    }
    return '{"result": "mock"}';
  }

  const r = await judge!.chat.completions.create({
    model: JUDGE_MODEL,
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });
  return r.choices[0]?.message?.content ?? "";
}

/**
 * Parse JSON from LLM response (handles markdown code fences)
 */
export function parseJson<T = any>(text: string): T {
  let t = text.trim();
  if (t.startsWith("```")) {
    const parts = t.split("```");
    t = parts[1] ?? t;
    t = t.toLowerCase().startsWith("json") ? t.slice(4).trim() : t.trim();
  }
  try {
    return JSON.parse(t) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", t);
    throw e;
  }
}
