import { PlayerProfile, MatchHistoryItem, LeaderboardEntry, ShopItem, Quest, Tournament, Friend } from '../types';

const STORAGE_KEY_PROFILE = 'apex_arena_player_profile';
const STORAGE_KEY_HISTORY = 'apex_arena_match_history';
const STORAGE_KEY_QUESTS = 'apex_arena_daily_quests';
const STORAGE_KEY_SETTINGS = 'apex_arena_settings';

export const INITIAL_PROFILE: PlayerProfile = {
  id: 'usr_apex_9024',
  username: 'ValkyriePrime',
  tag: '#7701',
  avatar: '⚡',
  title: 'Grandmaster Contender',
  banner: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
  level: 14,
  xp: 3850,
  xpToNextLevel: 5000,
  coins: 4850,
  gems: 190,
  twoFactorEnabled: true,
  cloudSyncHash: 'sha256-e9a8f273b018',
  lastSyncedAt: new Date().toISOString(),
  isOfflineMode: false,
  ratings: {
    chess: 1680,
    racing: 1740,
    cards: 1610,
    overall: 1676,
  },
  stats: {
    totalMatches: 48,
    totalWins: 32,
    winStreak: 4,
    bestStreak: 9,
    chessWins: 14,
    chessLosses: 6,
    chessDraws: 2,
    racingFirstPlaces: 11,
    racingBestTime: '01:14.32',
    cardBlackjacks: 9,
    cardBiggestPot: 2400,
  },
  equipped: {
    chessSkin: 'chess_cyber_neon',
    carSkin: 'car_phantom_gt',
    cardDeck: 'deck_hologram_matrix',
  },
  inventory: [
    'chess_default',
    'chess_cyber_neon',
    'car_default',
    'car_phantom_gt',
    'deck_classic',
    'deck_hologram_matrix',
    'title_apex_legend',
    'title_speed_demon',
  ],
};

export const INITIAL_MATCH_HISTORY: MatchHistoryItem[] = [
  {
    id: 'mat_001',
    game: 'CHESS',
    opponentName: 'KasparovBot99',
    opponentAvatar: '♟️',
    opponentRating: 1665,
    result: 'VICTORY',
    ratingDelta: +18,
    duration: '06:42',
    date: 'Today, 20:14',
    antiCheatScore: 100,
    verified: true,
  },
  {
    id: 'mat_002',
    game: 'CAR_RACING',
    opponentName: 'ApexDrifter_JP',
    opponentAvatar: '🏎️',
    opponentRating: 1720,
    result: 'VICTORY',
    ratingDelta: +24,
    duration: '02:31',
    date: 'Today, 18:45',
    antiCheatScore: 99,
    verified: true,
  },
  {
    id: 'mat_003',
    game: 'CARD_GAME',
    opponentName: 'NeonAce_99',
    opponentAvatar: '🃏',
    opponentRating: 1640,
    result: 'DEFEAT',
    ratingDelta: -14,
    duration: '04:15',
    date: 'Yesterday, 22:30',
    antiCheatScore: 100,
    verified: true,
  },
  {
    id: 'mat_004',
    game: 'CHESS',
    opponentName: 'GrandmasterShadow',
    opponentAvatar: '👑',
    opponentRating: 1790,
    result: 'VICTORY',
    ratingDelta: +29,
    duration: '09:12',
    date: 'Yesterday, 21:05',
    antiCheatScore: 100,
    verified: true,
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead_1',
    rank: 1,
    previousRank: 1,
    username: 'MagnusDrift',
    tag: '#0001',
    avatar: '👑',
    tier: 'Grandmaster',
    rating: 2480,
    winRate: 84.5,
    matchesPlayed: 412,
    region: 'EU',
    isFriend: false,
    isSelf: false,
  },
  {
    id: 'lead_2',
    rank: 2,
    previousRank: 3,
    username: 'CipherSpeed',
    tag: '#1337',
    avatar: '⚡',
    tier: 'Grandmaster',
    rating: 2390,
    winRate: 81.2,
    matchesPlayed: 380,
    region: 'NA',
    isFriend: true,
    isSelf: false,
  },
  {
    id: 'lead_3',
    rank: 3,
    previousRank: 2,
    username: 'HoloQueen',
    tag: '#4421',
    avatar: '💎',
    tier: 'Grandmaster',
    rating: 2315,
    winRate: 78.9,
    matchesPlayed: 320,
    region: 'APAC',
    isFriend: false,
    isSelf: false,
  },
  {
    id: 'lead_4',
    rank: 4,
    previousRank: 5,
    username: 'TurboBishop',
    tag: '#9012',
    avatar: '🚀',
    tier: 'Master',
    rating: 2180,
    winRate: 74.0,
    matchesPlayed: 245,
    region: 'EU',
    isFriend: true,
    isSelf: false,
  },
  {
    id: 'lead_5',
    rank: 5,
    previousRank: 4,
    username: 'ValkyriePrime',
    tag: '#7701',
    avatar: '⚡',
    tier: 'Platinum',
    rating: 1676,
    winRate: 66.7,
    matchesPlayed: 48,
    region: 'NA',
    isFriend: false,
    isSelf: true,
  },
  {
    id: 'lead_6',
    rank: 6,
    previousRank: 6,
    username: 'AceDealers',
    tag: '#2209',
    avatar: '🃏',
    tier: 'Platinum',
    rating: 1650,
    winRate: 63.8,
    matchesPlayed: 110,
    region: 'APAC',
    isFriend: false,
    isSelf: false,
  },
  {
    id: 'lead_7',
    rank: 7,
    previousRank: 8,
    username: 'ApexRonin',
    tag: '#8841',
    avatar: '🔥',
    tier: 'Gold',
    rating: 1540,
    winRate: 59.4,
    matchesPlayed: 92,
    region: 'NA',
    isFriend: true,
    isSelf: false,
  },
  {
    id: 'lead_8',
    rank: 8,
    previousRank: 7,
    username: 'NeonPawn',
    tag: '#3144',
    avatar: '🛡️',
    tier: 'Gold',
    rating: 1490,
    winRate: 55.1,
    matchesPlayed: 88,
    region: 'EU',
    isFriend: false,
    isSelf: false,
  },
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'chess_cyber_neon',
    name: 'Cyber Neon Pieces',
    game: 'CHESS',
    type: 'SKIN',
    rarity: 'Epic',
    price: 1500,
    currency: 'COINS',
    previewColor: '#06b6d4',
    description: 'Electric cyan and neon magenta pieces with illuminated edge glows.',
  },
  {
    id: 'chess_obsidian_gold',
    name: 'Obsidian & Imperial Gold',
    game: 'CHESS',
    type: 'SKIN',
    rarity: 'Legendary',
    price: 250,
    currency: 'GEMS',
    previewColor: '#eab308',
    description: 'Forged obsidian black pieces accented with 24k polished gold crowns.',
  },
  {
    id: 'car_phantom_gt',
    name: 'Phantom GT Stealth Racer',
    game: 'CAR_RACING',
    type: 'SKIN',
    rarity: 'Epic',
    price: 2000,
    currency: 'COINS',
    previewColor: '#8b5cf6',
    description: 'Carbon-fiber aerodynamic chassis equipped with purple plasma exhaust trail.',
  },
  {
    id: 'car_solar_mclaren',
    name: 'Solar Flare Hypercar',
    game: 'CAR_RACING',
    type: 'SKIN',
    rarity: 'Legendary',
    price: 350,
    currency: 'GEMS',
    previewColor: '#f97316',
    description: 'Radiant orange metallic finish with blazing ember particle boosters.',
  },
  {
    id: 'deck_hologram_matrix',
    name: 'Hologram Matrix Deck',
    game: 'CARD_GAME',
    type: 'SKIN',
    rarity: 'Epic',
    price: 1200,
    currency: 'COINS',
    previewColor: '#10b981',
    description: 'Prismatic foil cards with animated digital back pattern.',
  },
  {
    id: 'deck_royal_gold',
    name: 'Crown Royal High-Roller',
    game: 'CARD_GAME',
    type: 'SKIN',
    rarity: 'Legendary',
    price: 200,
    currency: 'GEMS',
    previewColor: '#f59e0b',
    description: 'Opulent gold-foil filigree cards designed for VIP high-stakes tables.',
  },
  {
    id: 'title_apex_legend',
    name: 'Title: "Apex Legend"',
    game: 'ALL',
    type: 'TITLE',
    rarity: 'Legendary',
    price: 150,
    currency: 'GEMS',
    previewColor: '#ec4899',
    description: 'Prestige title displayed proudly on leaderboards and in matchmaking.',
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'qst_1',
    title: 'Blitz Tactician',
    description: 'Win 1 match in Grandmaster Blitz Chess',
    targetCount: 1,
    currentCount: 0,
    rewardType: 'COINS',
    rewardAmount: 600,
    game: 'CHESS',
    claimed: false,
  },
  {
    id: 'qst_2',
    title: 'Speed Demon',
    description: 'Finish a Nitro Apex race in under 01:25.00',
    targetCount: 1,
    currentCount: 1,
    rewardType: 'COINS',
    rewardAmount: 500,
    game: 'CAR_RACING',
    claimed: false,
  },
  {
    id: 'qst_3',
    title: 'High-Stakes Dealer',
    description: 'Score a Natural Blackjack in Cyber 21',
    targetCount: 1,
    currentCount: 0,
    rewardType: 'GEMS',
    rewardAmount: 25,
    game: 'CARD_GAME',
    claimed: false,
  },
  {
    id: 'qst_4',
    title: 'Global Contender',
    description: 'Play 3 multiplayer matches in any game',
    targetCount: 3,
    currentCount: 2,
    rewardType: 'XP',
    rewardAmount: 750,
    game: 'ALL',
    claimed: false,
  },
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'trn_1',
    name: 'Apex Daily Blitz Championship',
    game: 'CHESS',
    status: 'LIVE',
    startTime: 'Today, 21:00 UTC',
    entryFee: 200,
    currency: 'COINS',
    prizePool: { coins: 15000, gems: 250 },
    participantsCount: 64,
    maxParticipants: 64,
    userRegistered: true,
    bracketStage: 'Semifinals',
    matches: [
      { id: 'm1', round: 'Quarterfinals', player1: 'ValkyriePrime', player2: 'NeonPawn', score1: 1, score2: 0, winner: 'ValkyriePrime' },
      { id: 'm2', round: 'Quarterfinals', player1: 'MagnusDrift', player2: 'TurboBishop', score1: 1, score2: 0, winner: 'MagnusDrift' },
      { id: 'm3', round: 'Semifinals', player1: 'ValkyriePrime', player2: 'CipherSpeed', score1: 0, score2: 0 },
      { id: 'm4', round: 'Semifinals', player1: 'MagnusDrift', player2: 'HoloQueen', score1: 0, score2: 0 },
    ],
  },
  {
    id: 'trn_2',
    name: 'Neon Tokyo Grand Prix',
    game: 'CAR_RACING',
    status: 'UPCOMING',
    startTime: 'Tomorrow, 16:00 UTC',
    entryFee: 50,
    currency: 'GEMS',
    prizePool: { coins: 30000, gems: 800 },
    participantsCount: 48,
    maxParticipants: 64,
    userRegistered: false,
    bracketStage: 'Quarterfinals',
    matches: [],
  },
  {
    id: 'trn_3',
    name: 'Midnight Cyber 21 Invitational',
    game: 'CARD_GAME',
    status: 'UPCOMING',
    startTime: 'In 3 Days, 23:00 UTC',
    entryFee: 500,
    currency: 'COINS',
    prizePool: { coins: 20000, gems: 400 },
    participantsCount: 32,
    maxParticipants: 32,
    userRegistered: false,
    bracketStage: 'Quarterfinals',
    matches: [],
  },
];

export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'frd_1',
    name: 'CipherSpeed',
    tag: '#1337',
    avatar: '⚡',
    status: 'IN_MATCH',
    currentGame: 'CAR_RACING',
    rating: 2390,
  },
  {
    id: 'frd_2',
    name: 'TurboBishop',
    tag: '#9012',
    avatar: '🚀',
    status: 'ONLINE',
    rating: 2180,
  },
  {
    id: 'frd_3',
    name: 'ApexRonin',
    tag: '#8841',
    avatar: '🔥',
    status: 'ONLINE',
    rating: 1540,
  },
  {
    id: 'frd_4',
    name: 'SilentRook',
    tag: '#0491',
    avatar: '🛡️',
    status: 'OFFLINE',
    rating: 1420,
  },
];

// Profile storage helper
export function loadProfile(): PlayerProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (data) return JSON.parse(data);
  } catch {}
  return INITIAL_PROFILE;
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    const updated = {
      ...profile,
      lastSyncedAt: new Date().toISOString(),
      cloudSyncHash: 'sha256-' + Math.random().toString(36).substring(2, 12),
    };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
  } catch {}
}

export function loadMatchHistory(): MatchHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (data) return JSON.parse(data);
  } catch {}
  return INITIAL_MATCH_HISTORY;
}

export function saveMatchHistory(history: MatchHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch {}
}

export function loadQuests(): Quest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_QUESTS);
    if (data) return JSON.parse(data);
  } catch {}
  return INITIAL_QUESTS;
}

export function saveQuests(quests: Quest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
  } catch {}
}
