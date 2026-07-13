/**
 * judge-client.ts - Judge API client
 */

import OpenAI from "openai";
import { MOCK_JUDGE_RESPONSES, MockCallCounter } from "./mock-responses.js";

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MOCK_MODE = process.env.MOCK_MODE === "true";
const JUDGE_MODEL = process.env.JUDGE_MODEL;

const mockCounter = new MockCallCounter();

/**
 * Initialize judge client
 */
export function createJudgeClient() {
  if (MOCK_MODE) {
    return null;
  }
  
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

/**
 * Call the judge with a prompt
 */
export async function callJudge(
  client: OpenAI | null,
  prompt: string
): Promise<any> {
  if (MOCK_MODE) {
    // Return mock response based on prompt type
    const count = mockCounter.increment();
    
    if (prompt.includes("GROUND TRUTH")) {
      return MOCK_JUDGE_RESPONSES.rubric;
    }
    
    // Alternate between responses for naive judge to show flakiness
    return count % 2 === 0 
      ? MOCK_JUDGE_RESPONSES.naive_1 
      : MOCK_JUDGE_RESPONSES.naive_2;
  }

  // Real API call
  const completion = await client!.chat.completions.create({
    model: JUDGE_MODEL!,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return parseJudgeResponse(text);
}

/**
 * Parse JSON response from judge (handles markdown fences)
 */
function parseJudgeResponse(text: string): any {
  let cleanText = text.trim();
  
  if (cleanText.startsWith("```")) {
    const parts = cleanText.split("```");
    cleanText = parts[1] ?? cleanText;
    cleanText = cleanText.toLowerCase().startsWith("json") 
      ? cleanText.slice(4).trim() 
      : cleanText.trim();
  }

  return JSON.parse(cleanText);
}
