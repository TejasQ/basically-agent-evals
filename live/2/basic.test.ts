import { describe, it, expect } from 'vitest';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {scenarios} from "./data"
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const policy = `We have a 14 day return policy. If any item is not working, you can return it within 14 days. After 14 days, you cannot return it. our return policy is non-negotiable and cannot be changed no matter how loyal a user is.

Change-of-mind returns need the item unused and in original packaging

No matter how nice the user is`;

describe('scenario', () => {
    it('human / AI agreement should be at least 80%', async () => {
        const results = await Promise.all(
            scenarios.map(async (scenario) => {
                const { text } = await generateText({
                    model: openai('gpt-4o-mini'),
                    prompt: `
                We judge customer service responses.

                Our policy is: ${policy}
                The scenario is: ${scenario.input}
                The answer is: ${scenario.answer}

                Give us a verdict: pass or fail based on how closely it adheres to the policy. Generate ONLY the verdict, no punctuation. Just the word, no other text.
            `,
                });
                const aiVerdict = text.trim().toLowerCase();
                return aiVerdict === scenario.verdict.toLowerCase();
            })
        );

        const agreements = results.filter(Boolean).length;
        const agreementPct = (agreements / results.length) * 100;
        console.log(`\x1b[35mHuman / AI agreement\x1b[0m: ${agreementPct.toFixed(1)}% (${agreements}/${results.length})`);

        expect(agreementPct).toBeGreaterThanOrEqual(80);
    }, 60000);
});