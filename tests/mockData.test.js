// mockData.js reads the landing page's hand-off (URL params, then a
// localStorage fallback) once at import time.
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function load({ search = '', stored } = {}) {
  vi.resetModules();
  vi.stubGlobal('window', { location: { search } });
  const data = new Map(stored === undefined ? [] : [['fanlog_onboarding_user', stored]]);
  vi.stubGlobal('localStorage', { getItem: (k) => (data.has(k) ? data.get(k) : null) });
  return import('../src/data/mockData.js');
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('mockData', () => {
  it('builds the profile from the URL the landing page opens', async () => {
    const m = await load({ search: '?name=Sam&handle=%40sam_99&favorites=bills,leafs&scores=81,40' });
    expect(m.MOCK_PROFILE.user).toMatchObject({ name: 'Sam', handle: '@sam_99', favorites: ['bills', 'leafs'] });
    expect(m.MOCK_PROFILE.fandomIndex.map((f) => f.score)).toEqual([81, 40]);
    expect(Object.keys(m.TEAMS)).toEqual(['bills', 'leafs']);
  });

  it('fills gaps from the saved onboarding state', async () => {
    const m = await load({
      search: '?name=FromUrl',
      stored: JSON.stringify({ name: 'FromStorage', handle: 'stored', favorites: 'raptors', scores: '66' }),
    });
    expect(m.MOCK_PROFILE.user).toMatchObject({ name: 'FromUrl', handle: '@stored', favorites: ['raptors'] });
    expect(m.MOCK_PROFILE.fandomIndex).toEqual([{ teamId: 'raptors', score: 66 }]);
  });

  it('ignores corrupt saved state', async () => {
    const m = await load({ stored: '{not json' });
    expect(m.MOCK_PROFILE.user.name).toBe('Ethan Henderson');
    expect(console.warn).toHaveBeenCalled();
  });

  it('works with nothing at all', async () => {
    const m = await load();
    expect(m.MOCK_PROFILE.user.favorites).toEqual(['leafs', 'bills', 'bluejays', 'raptors']);
    expect(m.MOCK_FEED.length).toBeGreaterThan(0);
  });
});
