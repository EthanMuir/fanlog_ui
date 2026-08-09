import { TEAM_DIRECTORY } from './teamDirectory';

// Default league-specific opponents for realistic matchups
const LEAGUE_OPPONENTS = {
  NFL: { id: 'chiefs', name: 'Kansas City Chiefs', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', shortName: 'Chiefs' },
  NBA: { id: 'celtics', name: 'Boston Celtics', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', shortName: 'Celtics' },
  NHL: { id: 'bruins', name: 'Boston Bruins', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png', shortName: 'Bruins' },
  MLB: { id: 'yankees', name: 'New York Yankees', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png', shortName: 'Yankees' },
  MLS: { id: 'galaxy', name: 'LA Galaxy', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/187.png', shortName: 'Galaxy' }
};

// Fallback opponents in case the selected team is the default opponent (prevents playing itself)
const LEAGUE_FALLBACK_OPPONENTS = {
  NFL: { id: 'raiders', name: 'Las Vegas Raiders', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', shortName: 'Raiders' },
  NBA: { id: 'lakers', name: 'Los Angeles Lakers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', shortName: 'Lakers' },
  NHL: { id: 'canadiens', name: 'Montreal Canadiens', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png', shortName: 'Canadiens' },
  MLB: { id: 'redsox', name: 'Boston Red Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png', shortName: 'Red Sox' },
  MLS: { id: 'lafc', name: 'Los Angeles FC', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/18966.png', shortName: 'LAFC' }
};

function getOpponentForTeam(team) {
  const primary = LEAGUE_OPPONENTS[team.league];
  if (primary && primary.id !== team.id) {
    return primary;
  }
  return LEAGUE_FALLBACK_OPPONENTS[team.league] || LEAGUE_FALLBACK_OPPONENTS.NHL;
}

// Generate sport-specific watch configuration labels
function getSportConfig(league) {
  switch (league) {
    case 'NFL':
      return {
        periodLabel: 'Quarters Watched',
        periodOptions: ['Q1', 'Q2', 'Q3', 'Q4', 'OT']
      };
    case 'NBA':
      return {
        periodLabel: 'Quarters Watched',
        periodOptions: ['Q1', 'Q2', 'Q3', 'Q4', 'OT']
      };
    case 'NHL':
      return {
        periodLabel: 'Periods Watched',
        periodOptions: ['1st', '2nd', '3rd', 'OT']
      };
    case 'MLB':
      return {
        periodLabel: 'Innings Watched',
        periodOptions: ['1-3', '4-6', '7-9', 'Extra']
      };
    case 'MLS':
    default:
      return {
        periodLabel: 'Halves Watched',
        periodOptions: ['1st Half', '2nd Half']
      };
  }
}

export function generateFandomContext({ name, handle, favorites, scores }) {
  // 1. Sanitize user identity parameters
  const finalName = name && name.trim() ? name.trim() : 'Ethan Henderson';
  let finalHandle = handle && handle.trim() ? handle.trim() : '@ethan_h';
  if (finalHandle && !finalHandle.startsWith('@')) {
    finalHandle = `@${finalHandle}`;
  }

  // 2. Sanitize and validate favorite teams list
  let favoritesList = [];
  if (favorites && Array.isArray(favorites)) {
    favoritesList = favorites.filter(id => TEAM_DIRECTORY[id]);
  } else if (favorites && typeof favorites === 'string') {
    favoritesList = favorites.split(',').map(s => s.trim()).filter(id => TEAM_DIRECTORY[id]);
  }

  // Fallback to default index if empty
  if (favoritesList.length === 0) {
    favoritesList = ['leafs', 'bills', 'jays', 'raptors'];
  }

  // 3. Resolve active favorite team entities
  const selectedTeams = {};
  favoritesList.forEach(id => {
    const rawTeam = TEAM_DIRECTORY[id];
    const sportCfg = getSportConfig(rawTeam.league);
    selectedTeams[id] = {
      ...rawTeam,
      ...sportCfg
    };
  });

  const topTeamId = favoritesList[0];
  const topTeam = selectedTeams[topTeamId];

  // 4. Construct MOCK_PROFILE
  // Parse passed-in scores (from landing page) or fall back to presets
  let parsedScores = [];
  if (scores) {
    if (Array.isArray(scores)) {
      parsedScores = scores.map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    } else if (typeof scores === 'string') {
      parsedScores = scores.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }
  }
  // Devotion score baseline presets: 1st gets 92, 2nd gets 78, 3rd gets 65, 4th gets 42, 5th gets 28
  const scorePresets = [92, 78, 65, 42, 28];
  const fandomIndex = favoritesList.map((teamId, idx) => ({
    teamId,
    score: parsedScores[idx] !== undefined ? parsedScores[idx] : (scorePresets[idx] || 25)
  }));

  const mockProfile = {
    user: {
      name: finalName,
      handle: finalHandle,
      avatar: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#g)"/><text x="20" y="26" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">${(finalName || 'G').charAt(0).toUpperCase()}</text></svg>`)}`, // Robust inline SVG avatar
      favorites: favoritesList
    },
    fandomIndex,
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
    liveStatus: topTeam.league === 'MLB' ? 'Top 9th' : (topTeam.league === 'MLS' ? '2nd Half - 84:10' : '3rd Period - 04:12'),
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
