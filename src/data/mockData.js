import { generateFandomContext } from './dynamicGenerator';

// 1. Inspect URL search query parameters (e.g. ?name=Ethan&handle=ethan_h&favorites=leafs,bills,jays)
const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
let name = urlParams ? urlParams.get('name') : null;
let handle = urlParams ? urlParams.get('handle') : null;
let favorites = urlParams ? urlParams.get('favorites') : null;

// 2. Inspect LocalStorage as a fallback (sharing state under same origin)
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    const savedOnboarding = localStorage.getItem('fanlog_onboarding_user');
    if (savedOnboarding) {
      const parsed = JSON.parse(savedOnboarding);
      if (parsed) {
        if (!name && parsed.name) name = parsed.name;
        if (!handle && parsed.handle) handle = parsed.handle;
        if (!favorites && parsed.favorites) favorites = parsed.favorites;
      }
    }
  } catch (e) {
    console.warn('Failed to parse onboarding local storage data', e);
  }
}

// 3. Generate customized contextual database
const context = generateFandomContext({ name, handle, favorites });

// 4. Export database constants dynamically for all React components
export const TEAMS = context.TEAMS;
export const MOCK_PROFILE = context.MOCK_PROFILE;
export const MOCK_FEED = context.MOCK_FEED;
export const MOCK_CHATS = context.MOCK_CHATS;
export const MOCK_UNLOGGED_GAMES = context.MOCK_UNLOGGED_GAMES;
export const MOCK_LOGGED_GAMES = context.MOCK_LOGGED_GAMES;
