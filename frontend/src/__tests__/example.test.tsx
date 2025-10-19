/**
 * Simple example test to verify Vitest setup
 */

import { describe, it, expect } from 'vitest';

describe('Vitest Setup Verification', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});
