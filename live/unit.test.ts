import { describe, it, expect } from 'vitest';

function add(a: number, b: number): number {
  return a + b;
}

describe('add', () => {
  it('should return the sum of two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});