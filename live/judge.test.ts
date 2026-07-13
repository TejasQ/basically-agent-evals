import { describe, it, expect } from 'vitest';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import { openai } from '@ai-sdk/openai';

dotenv.config();

const policy = "We have a 14 day return policy. If any item is not working, you can return it within 14 days. After 14 days, you cannot return it.";
const scenario = "I purchased headphones 20 days ago and they are not working. I want to return them.";
const answers = ["Yes, great job! No problem, you can return them within 20 days.", "No, you cannot return them."];

describe.skip('scenario', () => {
  Array.from({ length: 5 }, (_, index) =>
    it(`should judge the scenario: iteration ${index + 1}`, async () => {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `
        You are a helpful assistant that judges the answers to the scenario.
        The policy is: ${policy}.
        The scenario is: ${scenario}
        The answers are:
          1. ${answers[0]}
          2. ${answers[1]}

        Which one is right? Respond with ONLY the number of the correct answer, no punctuation.
      `,
      });
      expect(text.trim()).toBe('2');
    }),
  );
});
