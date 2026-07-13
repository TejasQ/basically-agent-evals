/**
 * mock-responses.ts - Mock data for offline mode
 */

export const MOCK_JUDGE_RESPONSES: Record<string, any> = {
  naive_1: { 
    winner: 2, 
    reason: "Reply 2 is more detailed and customer-friendly" 
  },
  naive_2: { 
    winner: 1, 
    reason: "Reply 1 is more helpful and clear" 
  },
  rubric: { 
    winner: 1, 
    r1_correct: true, 
    r2_correct: false, 
    reason: "Reply 1 correctly follows policy" 
  },
};

export const MOCK_RAG_RESPONSE = {
  response: "I'm sorry, but our return policy allows returns only within 14 days of purchase. Since it's been 20 days, we cannot accept this return.",
  sources: [
    {
      text: "Returns are accepted within 14 days of purchase. After this period, returns cannot be processed.",
      metadata: { page: 1, source: "refund-policy.pdf" }
    }
  ]
};

export class MockCallCounter {
  private count = 0;

  increment(): number {
    return ++this.count;
  }

  get current(): number {
    return this.count;
  }
}
