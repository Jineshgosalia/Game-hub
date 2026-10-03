export type GameId = 'CHESS' | 'CAR_RACING' | 'CARD_GAME';

export type GameMode = 'ONLINE_RANKED' | 'PRACTICE_BOT' | 'LOCAL_VERSUS';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export interface PlayerProfile {
  id: string;
  username: string;
  tag: string;
  avatar: string;
  title: string;
  banner: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  twoFactorEnabled: boolean;
  cloudSyncHash: string;
  lastSyncedAt: string;
  isOfflineMode: boolean;
  ratings: {
    chess: number;
    racing: number;
    cards: number;
    overall: number;
  };
  stats: {
    totalMatches: number;
    totalWins: number;
    winStreak: number;
    bestStreak: number;
    chessWins: number;
    chessLosses: number;
    chessDraws: number;
    racingFirstPlaces: number;
    racingBestTime: string;
    cardBlackjacks: number;
    cardBiggestPot: number;
  };
  equipped: {
    chessSkin: string;
    carSkin: string;
    cardDeck: string;
  };
  inventory: string[];
}

export interface ChessReplayStep {
  moveIndex: number;
  color: 'w' | 'b';
  notation: string;
  from: [number, number];
  to: [number, number];
  piece: string;
  isCheck?: boolean;
  captured?: string;
  commentary?: string;
}

export interface RacingReplayStep {
  timeSec: number;
  speedMph: number;
  position: number;
  lap: number;
  event?: string;
}

export interface CardReplayStep {
  step: number;
  description: string;
  playerCards: { suit: string; rank: string }[];
  dealerCards: { suit: string; rank: string; hidden?: boolean }[];
  playerScore: number;
  dealerScore: number;
}

export interface ReplayData {
  chessMoves?: ChessReplayStep[];
  racingTelemetry?: RacingReplayStep[];
  cardSteps?: CardReplayStep[];
  summary: string;
}

export interface MatchHistoryItem {
  id: string;
  game: GameId;
  opponentName: string;
  opponentAvatar: string;
  opponentRating: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  ratingDelta: number;
  duration: string;
  date: string;
  antiCheatScore: number; // 0 - 100%
  verified: boolean;
  replayData?: ReplayData;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  username: string;
  tag: string;
  avatar: string;
  tier: RankTier;
  rating: number;
  winRate: number;
  matchesPlayed: number;
  region: 'NA' | 'EU' | 'APAC';
  isFriend: boolean;
  isSelf: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  game: GameId | 'ALL';
  type: 'SKIN' | 'BANNER' | 'TITLE' | 'EFFECT';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  currency: 'COINS' | 'GEMS';
  previewColor: string;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardType: 'COINS' | 'GEMS' | 'XP';
  rewardAmount: number;
  game: GameId | 'ALL';
  claimed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  game: GameId;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  startTime: string;
  entryFee: number;
  currency: 'COINS' | 'GEMS';
  prizePool: {
    coins: number;
    gems: number;
  };
  participantsCount: number;
  maxParticipants: number;
  userRegistered: boolean;
  bracketStage: 'Quarterfinals' | 'Semifinals' | 'Finals';
  matches: {
    id: string;
    round: string;
    player1: string;
    player2: string;
    score1: number;
    score2: number;
    winner?: string;
  }[];
}

export interface Friend {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  status: 'ONLINE' | 'IN_MATCH' | 'AWAY' | 'OFFLINE';
  currentGame?: GameId;
  rating: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  channel: 'GLOBAL' | 'SQUAD' | 'MATCH';
  isSystem?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ACHIEVEMENT' | 'FRIEND' | 'TOURNAMENT' | 'SECURITY';
  timestamp: string;
  read: boolean;
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'zh';
export type ThemeMode = 'dark' | 'cyber' | 'oled' | 'light';

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  rating: number;
  role: 'Tactician' | 'Driver' | 'Duelist' | 'Coach';
  isReady: boolean;
  isHost: boolean;
  isMuted: boolean;
  pingMs: number;
}

export interface SquadTrainingSession {
  id: string;
  roomCode: string;
  game: GameId;
  modeName: string;
  members: SquadMember[];
  voiceActive: boolean;
  isZeroElo: true;
}

