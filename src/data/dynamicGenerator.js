import { TEAM_DIRECTORY } from './teamDirectory';
import { computeFanScore } from './fanScore';

// Each league's go-to opponents for the mock matchups: the first one, or the
// second when the fan's team is the first (so a team never plays itself).
const LEAGUE_OPPONENT_IDS = {
  NFL: ['chiefs', 'raiders'],
  NBA: ['celtics', 'lakers'],
  NHL: ['bruins', 'canadiens'],
  MLB: ['yankees', 'redsox'],
  MLS: ['galaxy', 'lafc'],
  CFL: ['argonauts', 'ticats'],
  EPL: ['liverpool', 'arsenal'],
  LALIGA: ['real_madrid', 'barcelona'],
  BUNDESLIGA: ['bayern', 'dortmund'],
  SERIEA: ['juventus', 'inter'],
  LIGUE1: ['psg', 'marseille']
};

function getOpponentForTeam(team) {
  const [first, second] = LEAGUE_OPPONENT_IDS[team.league] || LEAGUE_OPPONENT_IDS.NHL;
  const { id, name, logo, shortName } = TEAM_DIRECTORY[first !== team.id ? first : second];
  return { id, name, logo, shortName };
}

// Sport-specific watch configuration labels
function getSportConfig(sport) {
  switch (sport) {
    case 'Football': // NFL and CFL
    case 'Basketball':
      return {
        periodLabel: 'Quarters Watched',
        periodOptions: ['Q1', 'Q2', 'Q3', 'Q4', 'OT']
      };
    case 'Hockey':
      return {
        periodLabel: 'Periods Watched',
        periodOptions: ['1st', '2nd', '3rd', 'OT']
      };
    case 'Baseball':
      return {
        periodLabel: 'Innings Watched',
        periodOptions: ['1-3', '4-6', '7-9', 'Extra']
      };
    case 'Soccer':
    default:
      return {
        periodLabel: 'Halves Watched',
        periodOptions: ['1st Half', '2nd Half']
      };
  }
}

const LIVE_STATUS = {
  Football: '4th Quarter - 04:12',
  Basketball: '4th Quarter - 04:12',
  Hockey: '3rd Period - 04:12',
  Baseball: 'Top 9th',
  Soccer: '2nd Half - 84:10'
};

// The profile draws one arc per team, five at most
const MAX_FAVORITES = 5;

const isTeamId = (id) => Object.prototype.hasOwnProperty.call(TEAM_DIRECTORY, id);

const toList = (value) =>
  Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];

const escapeXml = (s) =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);

export function generateFandomContext({ name, handle, favorites, scores }) {
  // 1. Sanitize user identity parameters
  const finalName = name && name.trim() ? name.trim() : 'Ethan Henderson';
  let finalHandle = handle && handle.trim() ? handle.trim() : '@ethan_h';
  if (finalHandle && !finalHandle.startsWith('@')) {
    finalHandle = `@${finalHandle}`;
  }

  // 2. Sanitize and validate favorite teams list. Scores arrive as a parallel
  // list (same order as favorites), so pair them up before dropping unknown
  // or repeated teams, or every later team would take the wrong score.
  const rawScores = toList(scores);
  const picks = [];
  toList(favorites).forEach((raw, idx) => {
    const id = String(raw).trim();
    if (!isTeamId(id) || picks.some(p => p.id === id) || picks.length >= MAX_FAVORITES) return;
    const score = parseInt(String(rawScores[idx] ?? '').trim(), 10);
    picks.push({ id, score: isNaN(score) ? undefined : Math.max(0, Math.min(100, score)) });
  });

  // Fallback to default index if empty. (Must be valid TEAM_DIRECTORY ids — the
  // old 'jays' was not a real id and crashed when this fallback triggered.)
  if (picks.length === 0) {
    ['leafs', 'bills', 'bluejays', 'raptors'].forEach(id => picks.push({ id, score: undefined }));
  }
  const favoritesList = picks.map(p => p.id);

  // 3. Resolve active favorite team entities
  const selectedTeams = {};
  favoritesList.forEach(id => {
    const rawTeam = TEAM_DIRECTORY[id];
    const sportCfg = getSportConfig(rawTeam.sport);
    selectedTeams[id] = {
      ...rawTeam,
      ...sportCfg
    };
  });

  const topTeamId = favoritesList[0];
  const topTeam = selectedTeams[topTeamId];

  // 4. Construct MOCK_PROFILE
  // Scores passed in from the landing page, or presets where one is missing:
  // 1st gets 92, 2nd gets 78, 3rd gets 65, 4th gets 42, 5th gets 28
  const scorePresets = [92, 78, 65, 42, 28];
  const fandomIndex = picks.map((p, idx) => ({
    teamId: p.id,
    score: p.score !== undefined ? p.score : (scorePresets[idx] || 25)
  }));

  const mockProfile = {
    user: {
      name: finalName,
      handle: finalHandle,
      avatar: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#g)"/><text x="20" y="26" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">${escapeXml((finalName || 'G').charAt(0).toUpperCase())}</text></svg>`)}`, // Robust inline SVG avatar
      favorites: favoritesList
    },
    fandomIndex,
    // Same overall score as the landing page's card
    fanScore: computeFanScore(fandomIndex.map(f => f.score)),
    stats: {
      gamesWatched: 147,
      hoursWatched: 382,
      gamesLoggedThisMonth: 14,
      favoriteTeamId: topTeamId
    }
  };

  // 5. Generate MOCK_FEED dynamically
  const feed = [];
  
  // A. Live Match (Top Team)
  const topTeamOpponent = getOpponentForTeam(topTeam);
  feed.push({
    id: `live-${topTeamId}`,
    type: 'live-score',
    teamId: topTeamId,
    opponent: topTeamOpponent,
    liveStatus: LIVE_STATUS[topTeam.sport] || LIVE_STATUS.Hockey,
    score: { team: 3, opponent: 2 },
    isLive: true,
    headline: `Clutch Rivalry Match: ${topTeam.shortName} vs ${topTeamOpponent.shortName}`,
    recentPlay: `${topTeam.shortName} offense is pressing hard inside the scoring zone. Opponent pulling goalie/defense soon.`,
    timestamp: 'Live'
  });

  // B. Game Recap (Top Team)
  feed.push({
    id: `${topTeamId}-recap`,
    type: 'game-recap',
    teamId: topTeamId,
    opponent: topTeamOpponent,
    resultText: `Final: ${topTeam.shortName} 4, ${topTeamOpponent.shortName} 2`,
    gameDate: 'Yesterday',
    headline: `${topTeam.shortName} secure dominant victory on home turf`,
    summary: `In a classic divisional matchup, ${topTeam.shortName} rallied behind their starting units to score three unanswered points in the final frames. The defense locked down the final drives to secure a comfortable win.`,
    stats: [
      { label: 'Efficiency %', team: '54%', opponent: '46%' },
      { label: 'Scoring Drives', team: 4, opponent: 2 },
      { label: 'Turnovers/Fouls', team: 1, opponent: 3 }
    ],
    source: 'The Athletic',
    timestamp: '18h ago'
  });

  // C. News Card (Top Team)
  feed.push({
    id: `${topTeamId}-news`,
    type: 'news',
    teamId: topTeamId,
    headline: `${topTeam.shortName} stars selected for League Honors list`,
    preview: `Following consecutive standout performances, key members of ${topTeam.name} have secured honors this week. Head coach praised the team\'s overall focus during postgame interviews.`,
    source: 'ESPN Sports',
    timestamp: '3h ago',
    likes: 215,
    comments: 67
  });

  // D. Dynamic news and recaps for other favorite teams
  favoritesList.slice(1).forEach((teamId, idx) => {
    const team = selectedTeams[teamId];
    const opponent = getOpponentForTeam(team);
    
    // News Card
    feed.push({
      id: `${teamId}-news`,
      type: 'news',
      teamId: teamId,
      headline: `${team.shortName} linked to star players in latest trade rumors`,
      preview: `With roster reorganization approaching, league executives report ${team.shortName} is looking to add impact depth to their rotation. Discussions have intensified around free agents.`,
      source: 'Sportsnet',
      timestamp: `${idx + 1}d ago`,
      likes: 110 - idx * 20,
      comments: 24
    });

    // Score Card
    feed.push({
      id: `${teamId}-score`,
      type: 'score',
      teamId: teamId,
      opponent,
      resultText: `Final: ${team.shortName} 5, ${opponent.shortName} 3`,
      headline: `${team.shortName} clinch crucial road victory in high-scoring clash`,
      source: 'Sports Report',
      timestamp: `${idx + 2}d ago`
    });
  });

  // 6. Generate MOCK_CHATS
  const chats = [];
  
  // A. Live Match Room (Top Team)
  chats.push({
    id: `live-${topTeamId}`,
    name: `${topTeam.shortName} vs ${topTeamOpponent.shortName} - Live Chat`,
    teamId: topTeamId,
    isLive: true,
    memberCount: 1420,
    unread: true,
    lastMessage: {
      sender: 'MatchTracker',
      text: `${topTeam.shortName} looking dominant in the final stretch!`,
      timestamp: '10:44 PM'
    },
    messages: [
      { id: '1', user: 'FanExpert', text: `LETS GOOO ${topTeam.shortName.toUpperCase()}!`, time: '10:42 PM' },
      { id: '2', user: 'ArenaWitness', text: 'What a pass, absolute vision out there.', time: '10:43 PM' },
      { id: '3', user: 'OpponentFan', text: 'Tough night for us, defense is too slow.', time: '10:44 PM' },
      { id: '4', user: 'MatchTracker', text: `${topTeam.shortName} looking dominant in the final stretch!`, time: '10:44 PM' }
    ]
  });

  // B. Pinned general chat room for each favorite team
  favoritesList.forEach((teamId, idx) => {
    const team = selectedTeams[teamId];
    chats.push({
      id: `general-${teamId}`,
      name: `${team.shortName} Nation Banter`,
      teamId: teamId,
      isLive: false,
      memberCount: 2000 - idx * 400,
      unread: idx === 1, // Add an unread dot for secondary team
      lastMessage: {
        sender: 'SupporterHub',
        text: `Do you guys think the squad holds up long-term this year?`,
        timestamp: '30m ago'
      },
      messages: [
        { id: '1', user: 'MainAnchor', text: 'I think the roster has solid chemistry right now.', time: '1h ago' },
        { id: '2', user: 'SupporterHub', text: `Do you guys think the squad holds up long-term this year?`, time: '30m ago' }
      ]
    });
  });

  // 7. Generate MOCK_UNLOGGED_GAMES ("To Log")
  const unloggedGames = favoritesList.map((teamId, idx) => {
    const team = selectedTeams[teamId];
    const opponent = getOpponentForTeam(team);
    return {
      id: `unlogged-${teamId}`,
      teamId,
      opponent,
      scoreText: `${team.shortName} 4, ${opponent.shortName} 2`,
      date: idx === 0 ? 'Yesterday' : `${idx + 1} days ago`
    };
  });

  // 8. Generate MOCK_LOGGED_GAMES ("Logged" history)
  const loggedGames = favoritesList.map((teamId, idx) => {
    const team = selectedTeams[teamId];
    const opponent = getOpponentForTeam(team);
    return {
      id: `log-${teamId}`,
      teamId,
      opponentName: opponent.name,
      opponentLogo: opponent.logo,
      rating: 5 - (idx % 2), // 5 star and 4 star ratings
      notes: `Incredible performance! ${team.shortName} showed outstanding composure in the final period to lock down the lead.`,
      timeSpent: team.periodOptions.slice(0, 3).join(', '),
      date: `${idx + 2} days ago`
    };
  });

  return {
    TEAMS: selectedTeams,
    MOCK_PROFILE: mockProfile,
    MOCK_FEED: feed,
    MOCK_CHATS: chats,
    MOCK_UNLOGGED_GAMES: unloggedGames,
    MOCK_LOGGED_GAMES: loggedGames
  };
}
