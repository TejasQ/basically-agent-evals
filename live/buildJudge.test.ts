import { describe, it, expect } from 'vitest';
import { scenarios, policy } from './data/scenarios';

import { generateText, Output } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const model = openrouter('anthropic/claude-opus-4.8-fast');

describe('judge', () => {
    scenarios.forEach((scenario) => {
      it(`- scenario: ${scenario.input}
- answer: ${scenario.answer}
- verdict: ${scenario.verdict}`, async () => {
        const prompt = `We judge customer service responses based on how closely they adhere to the policy. The policy is: ${policy}

        The scenario is: ${scenario.input}
        The answer is: ${scenario.answer}

        Give us a verdict: pass or fail based on how closely it adheres to the policy. Generate ONLY the verdict, no punctuation. Just the word, no other text.
      `;

      const { text } = await generateText({ model, prompt });
      const verdict = text.trim().toLowerCase();
      expect(verdict).toBe(scenario.verdict);
    });
  });
});
