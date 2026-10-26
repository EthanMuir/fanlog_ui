import { describe, expect, it } from 'vitest';
import { generateFandomContext } from '../src/data/dynamicGenerator.js';
import { TEAM_DIRECTORY } from '../src/data/teamDirectory.js';

const gen = (params = {}) => generateFandomContext({ name: null, handle: null, favorites: null, scores: null, ...params });
const DEFAULT_FAVORITES = ['leafs', 'bills', 'bluejays', 'raptors'];

describe('identity', () => {
  it('falls back to the demo persona', () => {
    const { MOCK_PROFILE } = gen();
    expect(MOCK_PROFILE.user.name).toBe('Ethan Henderson');
    expect(MOCK_PROFILE.user.handle).toBe('@ethan_h');
    expect(gen({ name: '   ', handle: '  ' }).MOCK_PROFILE.user).toMatchObject({ name: 'Ethan Henderson', handle: '@ethan_h' });
  });

  it('trims the name and makes sure the handle starts with @', () => {
    const { user } = gen({ name: '  Sam  ', handle: ' sam_99 ' }).MOCK_PROFILE;
    expect(user.name).toBe('Sam');
    expect(user.handle).toBe('@sam_99');
    expect(gen({ handle: '@already' }).MOCK_PROFILE.user.handle).toBe('@already');
  });

  it("draws an avatar with the name's initial", () => {
    const svg = decodeURIComponent(gen({ name: 'zoe' }).MOCK_PROFILE.user.avatar.replace('data:image/svg+xml,', ''));
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('>Z</text>');
  });

  it('keeps the avatar a valid image whatever the name starts with', () => {
    for (const name of ['<3 hockey', '&co', '"quoted', "'single", '>gt']) {
      const svg = decodeURIComponent(gen({ name }).MOCK_PROFILE.user.avatar.replace('data:image/svg+xml,', ''));
      const text = svg.match(/<text[^>]*>(.*?)<\/text>/)[1];
      expect(text, name).not.toMatch(/[<>"']|&(?!(amp|lt|gt|quot|apos);)/);
    }
  });
});

describe('favorites', () => {
  it('defaults to the sample teams', () => {
    expect(gen().MOCK_PROFILE.user.favorites).toEqual(DEFAULT_FAVORITES);
  });

  it('reads a comma-separated list or an array, dropping unknown ids', () => {
    expect(gen({ favorites: ' bills , nope,leafs' }).MOCK_PROFILE.user.favorites).toEqual(['bills', 'leafs']);
    expect(gen({ favorites: ['raptors', 'toString', 'leafs'] }).MOCK_PROFILE.user.favorites).toEqual(['raptors', 'leafs']);
    expect(gen({ favorites: 'nope,also_nope' }).MOCK_PROFILE.user.favorites).toEqual(DEFAULT_FAVORITES);
  });

  it('does not repeat a team', () => {
    expect(gen({ favorites: 'leafs,leafs,bills' }).MOCK_PROFILE.user.favorites).toEqual(['leafs', 'bills']);
  });

  it('keeps at most five teams (the profile draws five arcs)', () => {
    const many = 'leafs,bills,bluejays,raptors,oilers,lakers,cubs';
    expect(gen({ favorites: many }).MOCK_PROFILE.user.favorites).toHaveLength(5);
  });

  it('knows every team the landing page can send, including European football', () => {
    for (const id of ['arsenal', 'real_madrid', 'bayern', 'inter', 'psg', 'argonauts', 'toronto_fc']) {
      expect(TEAM_DIRECTORY[id], id).toBeDefined();
      expect(gen({ favorites: id }).MOCK_PROFILE.user.favorites).toEqual([id]);
    }
  });
});

describe('scores', () => {
  it('uses the landing page scores in order', () => {
    expect(gen({ favorites: 'leafs,bills', scores: '81,40' }).MOCK_PROFILE.fandomIndex).toEqual([
      { teamId: 'leafs', score: 81 },
      { teamId: 'bills', score: 40 },
    ]);
    expect(gen({ favorites: ['leafs'], scores: ['77'] }).MOCK_PROFILE.fandomIndex).toEqual([{ teamId: 'leafs', score: 77 }]);
  });

  it('falls back to presets for missing or junk scores', () => {
    expect(gen().MOCK_PROFILE.fandomIndex.map((f) => f.score)).toEqual([92, 78, 65, 42]);
    expect(gen({ favorites: 'leafs,bills', scores: 'abc' }).MOCK_PROFILE.fandomIndex.map((f) => f.score)).toEqual([92, 78]);
  });

  it('keeps each score with its own team when an unknown team is dropped', () => {
    const idx = gen({ favorites: 'not_a_team,leafs,bills', scores: '10,81,40' }).MOCK_PROFILE.fandomIndex;
    expect(idx).toEqual([
      { teamId: 'leafs', score: 81 },
      { teamId: 'bills', score: 40 },
    ]);
  });

  it('keeps each score with its own team when a junk score is dropped', () => {
    const idx = gen({ favorites: 'leafs,bills,raptors', scores: '81,x,55' }).MOCK_PROFILE.fandomIndex;
    expect(idx).toEqual([
      { teamId: 'leafs', score: 81 },
      { teamId: 'bills', score: 78 },
      { teamId: 'raptors', score: 55 },
    ]);
  });

  it('clamps scores to 0–100', () => {
    const idx = gen({ favorites: 'leafs,bills', scores: '250,-5' }).MOCK_PROFILE.fandomIndex;
    expect(idx.map((f) => f.score)).toEqual([100, 0]);
  });

  it('the overall FanLog Score matches the landing page card', () => {
    // Same formula as cardVisuals.computeFanScore in the fanlog repo
    expect(gen({ favorites: 'leafs,bills,raptors', scores: '92,74,55' }).MOCK_PROFILE.fanScore).toBe(95);
    expect(gen({ favorites: 'leafs', scores: '80' }).MOCK_PROFILE.fanScore).toBe(97);
    expect(gen({ favorites: 'leafs,bills,raptors', scores: '40,30,20' }).MOCK_PROFILE.fanScore).toBe(79);
  });
});

describe('generated content', () => {
  it('leads the feed with a live game and recap for the top team', () => {
    const { MOCK_FEED } = gen({ favorites: 'raptors,leafs' });
    expect(MOCK_FEED.slice(0, 3).map((f) => [f.type, f.teamId])).toEqual([
      ['live-score', 'raptors'],
      ['game-recap', 'raptors'],
      ['news', 'raptors'],
    ]);
    // then a news card and a score for each other team
    expect(MOCK_FEED.slice(3).map((f) => [f.type, f.teamId])).toEqual([
      ['news', 'leafs'],
      ['score', 'leafs'],
    ]);
    expect(new Set(MOCK_FEED.map((f) => f.id)).size).toBe(MOCK_FEED.length);
  });

  it('every team plays an opponent from its own league, never itself', () => {
    const leagueOf = (id) => TEAM_DIRECTORY[id].league;
    for (const id of Object.keys(TEAM_DIRECTORY)) {
      const { MOCK_UNLOGGED_GAMES } = gen({ favorites: id });
      const { opponent } = MOCK_UNLOGGED_GAMES[0];
      expect(opponent.id, id).not.toBe(id);
      expect(leagueOf(opponent.id), `${id} vs ${opponent.id}`).toBe(leagueOf(id));
      expect(opponent.name).toBe(TEAM_DIRECTORY[opponent.id].name);
      expect(opponent.logo).toBe(TEAM_DIRECTORY[opponent.id].logo);
    }
  });

  it('asks about the right parts of the game for each sport', () => {
    const periods = (id) => gen({ favorites: id }).TEAMS[id];
    expect(periods('bills')).toMatchObject({ periodLabel: 'Quarters Watched', periodOptions: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'] });
    expect(periods('raptors')).toMatchObject({ periodLabel: 'Quarters Watched' });
    expect(periods('leafs')).toMatchObject({ periodLabel: 'Periods Watched', periodOptions: ['1st', '2nd', '3rd', 'OT'] });
    expect(periods('bluejays')).toMatchObject({ periodLabel: 'Innings Watched' });
    expect(periods('toronto_fc')).toMatchObject({ periodLabel: 'Halves Watched' });
    expect(periods('arsenal')).toMatchObject({ periodLabel: 'Halves Watched' });
    // Canadian football is played in quarters
    expect(periods('argonauts')).toMatchObject({ periodLabel: 'Quarters Watched', periodOptions: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'] });
  });

  it('opens a live room for the top team and a banter room per team', () => {
    const { MOCK_CHATS } = gen({ favorites: 'leafs,bills' });
    expect(MOCK_CHATS.map((c) => c.id)).toEqual(['live-leafs', 'general-leafs', 'general-bills']);
    expect(MOCK_CHATS[0]).toMatchObject({ isLive: true, name: 'Maple Leafs vs Bruins - Live Chat' });
    expect(MOCK_CHATS[0].lastMessage.text).toBe(MOCK_CHATS[0].messages.at(-1).text);
    expect(MOCK_CHATS.filter((c) => c.unread).map((c) => c.id)).toEqual(['live-leafs', 'general-bills']);
  });

  it('has one game to log and one logged game per team', () => {
    const ctx = gen({ favorites: 'leafs,bills,raptors' });
    expect(ctx.MOCK_UNLOGGED_GAMES.map((g) => g.teamId)).toEqual(['leafs', 'bills', 'raptors']);
    expect(ctx.MOCK_LOGGED_GAMES.map((g) => g.teamId)).toEqual(['leafs', 'bills', 'raptors']);
    expect(ctx.MOCK_LOGGED_GAMES.map((g) => g.rating)).toEqual([5, 4, 5]);
    expect(ctx.MOCK_LOGGED_GAMES[0].timeSpent).toBe('1st, 2nd, 3rd');
  });

  it('only describes teams that are in the profile', () => {
    const ctx = gen({ favorites: 'leafs,bills' });
    expect(Object.keys(ctx.TEAMS)).toEqual(['leafs', 'bills']);
    for (const item of [...ctx.MOCK_FEED, ...ctx.MOCK_CHATS, ...ctx.MOCK_UNLOGGED_GAMES, ...ctx.MOCK_LOGGED_GAMES]) {
      expect(ctx.TEAMS[item.teamId], item.id).toBeDefined();
    }
  });
});

describe('the live game', () => {
  it("reads right for the top team's sport", () => {
    const live = (id) => gen({ favorites: id }).MOCK_FEED[0].liveStatus;
    expect(live('bills')).toBe('4th Quarter - 04:12');
    expect(live('argonauts')).toBe('4th Quarter - 04:12');
    expect(live('raptors')).toBe('4th Quarter - 04:12');
    expect(live('leafs')).toBe('3rd Period - 04:12');
    expect(live('bluejays')).toBe('Top 9th');
    expect(live('arsenal')).toBe('2nd Half - 84:10');
  });
});
