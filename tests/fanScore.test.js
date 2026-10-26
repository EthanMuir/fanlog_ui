import { describe, expect, it } from 'vitest';
import { SCORE_BASE, computeFanScore } from '../src/data/fanScore.js';

// The same worked examples the landing page (fanlog/cardVisuals.js) pins, so
// the demo profile and the card can't drift apart.
describe('computeFanScore', () => {
  it('matches the landing page', () => {
    expect(computeFanScore([92, 74, 55])).toBe(95);
    expect(computeFanScore([50, 50, 50])).toBe(88);
    expect(computeFanScore([40, 30, 20])).toBe(79);
    expect(computeFanScore([80])).toBe(97);
  });

  it('runs from the floor to 100', () => {
    expect(computeFanScore([])).toBe(SCORE_BASE);
    expect(computeFanScore([0, 0])).toBe(SCORE_BASE);
    expect(computeFanScore([100])).toBe(100);
    expect(computeFanScore([500, -20])).toBe(computeFanScore([100, 0]));
  });
});
