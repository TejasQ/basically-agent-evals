import { describe, it, expect } from 'vitest';

const scenario = "I purchased headphones 20 days ago and they are not working. I want to return them.";
const answers = ["Yes, no problem, you can return them within 20 days.", "No, you cannot return them because our return policy is 14 days."];

describe.skip('scenario', () => {
  answers.forEach((answer) => {
      it('should handle customer scenario: ' + answer, () => {
      expect(answer.toLowerCase()).toContain('cannot');
    });
  });
});