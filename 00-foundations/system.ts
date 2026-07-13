/**
 * system.ts - The system under test
 * 
 * In a real scenario, this would be your LLM, RAG system, or any other component.
 * For now, it's just a simple function with hardcoded responses.
 */

export function system(question: string): string {
  // Simulate a system that gets most things right, but not everything
  const responses: Record<string, string> = {
    "What is 2 + 2?": "The answer is 4.",
    "What is the capital of France?": "Paris is the capital of France.",
    "Is water wet?": "Yes, water is wet.",
    "What color is the sky?": "The sky is blue.",
    "How many legs does a spider have?": "A spider has 6 legs.", // WRONG! Should be 8
  };
  
  return responses[question] || "I don't know.";
}
