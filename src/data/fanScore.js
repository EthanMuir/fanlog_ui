// The FanLog Score, copied from cardVisuals.js in the fanlog repo (the
// landing page) so the demo's profile shows the same number as the card the
// visitor just built. Keep the two in step: tests/fanScore.test.js pins the
// same worked examples as the landing page's tests.
//
//   finalScore = SCORE_BASE + SCORE_SPAN * mean(curve(teamScore)) / 100
//
// where curve() lifts each team score toward 100 (ease-out by GENEROSITY).
export const SCORE_BASE = 65;
export const SCORE_SPAN = 100 - SCORE_BASE;
export const GENEROSITY = 1.5;

function curveTeamScore(score) {
  const x = Math.max(0, Math.min(100, Number(score) || 0)) / 100;
  return (1 - Math.pow(1 - x, GENEROSITY)) * 100;
}

export function computeFanScore(scores) {
  if (!scores || !scores.length) return SCORE_BASE;
  const meanCurved = scores.reduce((sum, s) => sum + curveTeamScore(s), 0) / scores.length;
  return Math.round(Math.min(100, SCORE_BASE + (SCORE_SPAN * meanCurved) / 100));
}
