/**
 * File:        mobile/src/app/data/mockTeams.ts
 * Module:      Data · MyTeams Mock Data
 * Purpose:     Strongly-typed mock data module for the MyTeamsScreen.
 *              No runtime cost; swappable for a real fetch later.
 *
 * Exports:
 *   - ContestType            — Union of all supported contest labels
 *   - Player                 — Avatar model (id, name, initials, color)
 *   - FantasyTeam            — Team model with contest + players
 *   - MOCK_TEAMS             — 5 fantasy teams (one per contest type)
 *   - MOCK_STATS             — Summary metrics for the stats bar
 *   - MOCK_MATCH             — Match info strip model
 *
 * Side-effects: none (pure data)
 */

/* ---------- Types ---------- */

export type ContestType =
  | 'Mega Contest'
  | 'Head to Head'
  | 'Mini Grand'
  | 'Hot Contest'
  | 'Beginner Contest';

export type Player = {
  id: string;
  name: string; // full name (used for accessibility, not rendered)
  initials: string; // 1-2 chars, rendered inside circle avatar
  color: string; // background color of avatar circle
};

export type FantasyTeam = {
  id: string;
  name: string; // "Team 1" .. "Team 5"
  contestType: ContestType;
  points: number; // e.g. 624.5
  rank: string; // "#1,245" or "#-" when unranked
  winning: number; // INR amount, 0 when no win
  players: Player[]; // 11 entries; UI renders first 6 + "+5" overflow chip
};

/* ---------- Constants ---------- */

/**
 * Six distinct avatar background colors, cycled across the 11 players
 * in each team. Tuned for legibility against the dark card surface.
 */
const AVATAR_COLORS = [
  '#F7C42E', // amber / CSK gold
  '#004C8F', // deep blue / MI
  '#D40026', // crimson / RCB
  '#3F2E84', // indigo / KKR
  '#E23A6E', // pink / RR
  '#9333EA', // violet / accent
] as const;

/**
 * Build an 11-player roster for a team.
 *
 * `seed` is mixed into the id to keep ids unique across teams when
 * concatenated. Initials and full names follow a realistic IPL-flavored
 * pattern but are intentionally fictional to avoid impersonation.
 */
function buildRoster(seed: string): Player[] {
  const template: Array<Omit<Player, 'id' | 'color'>> = [
    { name: 'Captain Marvel', initials: 'CM' },
    { name: 'Vice Keeper', initials: 'VK' },
    { name: 'Rally Pro', initials: 'RP' },
    { name: 'Jet Jockey', initials: 'JJ' },
    { name: 'Sky Walker', initials: 'SK' },
    { name: 'Anchor Right', initials: 'AR' },
    { name: 'Left Arm Spinner', initials: 'LS' },
    { name: 'Death Overs', initials: 'DO' },
    { name: 'Power Hitter', initials: 'PH' },
    { name: 'Finisher', initials: 'FI' },
    { name: 'Wildcard', initials: 'WC' },
  ];

  return template.map((p, idx) => ({
    id: `${seed}-p${idx + 1}`,
    name: p.name,
    initials: p.initials,
    color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
  }));
}

/* ---------- Mock Data ---------- */

export const MOCK_TEAMS: FantasyTeam[] = [
  {
    id: 't1',
    name: 'Team 1',
    contestType: 'Mega Contest',
    points: 624.5,
    rank: '#1,245',
    winning: 75,
    players: buildRoster('t1'),
  },
  {
    id: 't2',
    name: 'Team 2',
    contestType: 'Head to Head',
    points: 480.0,
    rank: '#-',
    winning: 0,
    players: buildRoster('t2'),
  },
  {
    id: 't3',
    name: 'Team 3',
    contestType: 'Mini Grand',
    points: 589.2,
    rank: '#2,580',
    winning: 150,
    players: buildRoster('t3'),
  },
  {
    id: 't4',
    name: 'Team 4',
    contestType: 'Hot Contest',
    points: 722.8,
    rank: '#856',
    winning: 25,
    players: buildRoster('t4'),
  },
  {
    id: 't5',
    name: 'Team 5',
    contestType: 'Beginner Contest',
    points: 412.3,
    rank: '#-',
    winning: 0,
    players: buildRoster('t5'),
  },
];

export const MOCK_STATS = {
  teams: 5,
  totalWinning: 152, // INR
  contestsJoined: 12,
  winningTeams: 4,
};

export const MOCK_MATCH = {
  team1Short: 'CHE',
  team2Short: 'KOL',
  team1Name: 'Chennai Super Kings',
  team2Name: 'Kolkata Knight Riders',
  matchDateTime: '2026-06-13T19:30:00+05:30', // future date so countdown is positive
  format: 'T20',
};
