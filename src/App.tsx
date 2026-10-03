/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GameId,
  PlayerProfile,
  LeaderboardEntry,
  MatchHistoryItem,
  ShopItem,
  Quest,
  Tournament,
  Friend,
  LanguageCode,
  ThemeMode,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadMatchHistory,
  saveMatchHistory,
  loadQuests,
  saveQuests,
  INITIAL_LEADERBOARD,
  INITIAL_SHOP_ITEMS,
  INITIAL_TOURNAMENTS,
  INITIAL_FRIENDS,
} from './utils/storage';
import { sounds } from './utils/soundEffects';

// Top Bar & Views
import { TopBar } from './components/navigation/TopBar';
import { GameHub } from './components/games/GameHub';
import { ReplaysView } from './components/replays/ReplaysView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { TournamentsView } from './components/tournaments/TournamentsView';
import { ShopView } from './components/shop/ShopView';
import { BattlePassView } from './components/rewards/BattlePassView';
import { ProfileView } from './components/profile/ProfileView';

// Modals & Drawers
import { MatchmakingModal } from './components/multiplayer/MatchmakingModal';
import { SquadTrainingModal } from './components/training/SquadTrainingModal';
import { VoiceChatHub } from './components/social/VoiceChatHub';
import { SocialDrawer } from './components/social/SocialDrawer';
import { AntiCheatModal } from './components/anticheat/AntiCheatModal';
import { DailyRewardsModal } from './components/rewards/DailyRewardsModal';
import { ShareCardModal } from './components/social/ShareCardModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { NotificationToast } from './components/notifications/NotificationToast';

export default function App() {
  // App-level state
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(() => loadMatchHistory());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [shopItems] = useState<ShopItem[]>(INITIAL_SHOP_ITEMS);
  const [quests, setQuests] = useState<Quest[]>(() => loadQuests());
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);

  // Active navigation & Game state
  const [currentTab, setCurrentTab] = useState<
    'GAMES' | 'REPLAYS' | 'LEADERBOARD' | 'TOURNAMENTS' | 'SHOP' | 'BATTLE_PASS' | 'PROFILE'
  >('GAMES');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(false);
  const [selectedReplayMatchId, setSelectedReplayMatchId] = useState<string | undefined>(undefined);
  const [onlineOpponent, setOnlineOpponent] = useState<{
    name: string;
    avatar: string;
    rating: number;
    title: string;
  } | null>(null);

  // Modals visibility
  const [showMatchmaking, setShowMatchmaking] = useState<boolean>(false);
  const [showSquadTraining, setShowSquadTraining] = useState<boolean>(false);
  const [matchmakingInitialGame, setMatchmakingInitialGame] = useState<GameId>('CHESS');
  const [showVoiceChat, setShowVoiceChat] = useState<boolean>(false);
  const [showSocial, setShowSocial] = useState<boolean>(false);
  const [showAntiCheat, setShowAntiCheat] = useState<boolean>(false);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [showShareCard, setShowShareCard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Localization & Themes
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Auto-save profile & history changes
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveMatchHistory(matchHistory);
  }, [matchHistory]);

  useEffect(() => {
    saveQuests(quests);
  }, [quests]);

  // Handle Match Completion
  const handleMatchComplete = (
    game: GameId,
    result: 'VICTORY' | 'DEFEAT' | 'DRAW',
    eloDelta: number,
    coinsEarned: number
  ) => {
    // Zero-ELO Squad Training Mode safeguard
    if (isTrainingMode) {
      const historyItem: MatchHistoryItem = {
        id: 'match_training_' + Date.now(),
        game,
        opponentName: onlineOpponent?.name || 'Squad Sparring Partner',
        opponentAvatar: onlineOpponent?.avatar || '⚡',
        opponentRating: onlineOpponent?.rating || 1650,
        result,
        ratingDelta: 0, // Zero ELO change!
        duration: game === 'CHESS' ? '04:10' : game === 'CAR_RACING' ? '01:15' : '02:00',
        date: 'Squad Training Session',
        antiCheatScore: 100,
        verified: true,
        replayData: {
          summary: `Squad Training Sparring session in ${game === 'CHESS' ? 'Blitz Chess' : game === 'CAR_RACING' ? 'Nitro Racing' : 'Cyber 21'} (100% Zero-ELO Rating Protected).`,
        },
      };
      setMatchHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      setIsTrainingMode(false);
      sounds.playSuccess();
      return;
    }

    setProfile(prev => {
      const isWin = result === 'VICTORY';
      const key = game === 'CHESS' ? 'chess' : game === 'CAR_RACING' ? 'racing' : 'cards';
      const newRating = Math.max(100, prev.ratings[key] + eloDelta);
      const newOverall = Math.round(
        (prev.ratings.chess + prev.ratings.racing + prev.ratings.cards + eloDelta) / 3
      );

      const nextStreak = isWin ? prev.stats.winStreak + 1 : 0;
      const nextBestStreak = Math.max(prev.stats.bestStreak, nextStreak);

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        xp: prev.xp + 150,
        ratings: {
          ...prev.ratings,
          [key]: newRating,
          overall: newOverall,
        },
        stats: {
          ...prev.stats,
          totalMatches: prev.stats.totalMatches + 1,
          totalWins: prev.stats.totalWins + (isWin ? 1 : 0),
          winStreak: nextStreak,
          bestStreak: nextBestStreak,
          chessWins: prev.stats.chessWins + (game === 'CHESS' && isWin ? 1 : 0),
          chessLosses: prev.stats.chessLosses + (game === 'CHESS' && result === 'DEFEAT' ? 1 : 0),
          chessDraws: prev.stats.chessDraws + (game === 'CHESS' && result === 'DRAW' ? 1 : 0),
          racingFirstPlaces: prev.stats.racingFirstPlaces + (game === 'CAR_RACING' && isWin ? 1 : 0),
          cardBlackjacks: prev.stats.cardBlackjacks + (game === 'CARD_GAME' && isWin ? 1 : 0),
        },
      };
    });

    // Record in Match History with rich replay data
    const historyItem: MatchHistoryItem = {
      id: 'match_' + Date.now(),
      game,
      opponentName: onlineOpponent?.name || 'GrandmasterBot_AI',
      opponentAvatar: onlineOpponent?.avatar || '🤖',
      opponentRating: onlineOpponent?.rating || 1650,
      result,
      ratingDelta: eloDelta,
      duration: game === 'CHESS' ? '04:12' : game === 'CAR_RACING' ? '01:22' : '02:40',
      date: 'Just now',
      antiCheatScore: 100,
      verified: true,
      replayData: {
        summary: `Competitive ${game === 'CHESS' ? 'Blitz Chess' : game === 'CAR_RACING' ? 'Nitro Racing' : 'Cyber 21'} ranked matchup resulting in a decisive ${result}.`,
        chessMoves: game === 'CHESS' ? [
          { moveIndex: 1, color: 'w', notation: 'e4', from: [6, 4], to: [4, 4], piece: 'p', commentary: 'Controlled center opening' },
          { moveIndex: 2, color: 'b', notation: 'c5', from: [1, 2], to: [3, 2], piece: 'p', commentary: 'Sicilian Defense counter-strike' },
          { moveIndex: 3, color: 'w', notation: 'Nf3', from: [7, 6], to: [5, 5], piece: 'n', commentary: 'Open Sicilian preparation' },
          { moveIndex: 4, color: 'b', notation: 'd6', from: [1, 3], to: [2, 3], piece: 'p', commentary: 'Solid pawn structure' },
          { moveIndex: 5, color: 'w', notation: 'd4', from: [6, 3], to: [4, 3], piece: 'p', commentary: 'Center break initiated' },
          { moveIndex: 6, color: 'b', notation: 'cxd4', from: [3, 2], to: [4, 3], piece: 'p', captured: 'p', commentary: 'Flank pawn exchanged for center pawn' },
          { moveIndex: 7, color: 'w', notation: 'Nxd4', from: [5, 5], to: [4, 3], piece: 'n', captured: 'p', commentary: 'Knight dominates center' },
          { moveIndex: 8, color: 'b', notation: 'Nf6', from: [0, 6], to: [2, 5], piece: 'n', commentary: 'Black attacks e4 pawn' },
          { moveIndex: 9, color: 'w', notation: 'Nc3', from: [7, 1], to: [5, 2], piece: 'n', commentary: 'Defending e4 and developing' },
          { moveIndex: 10, color: 'b', notation: 'a6', from: [1, 0], to: [2, 0], piece: 'p', commentary: 'Najdorf variation setup' },
          { moveIndex: 11, color: 'w', notation: 'Be3', from: [7, 2], to: [5, 4], piece: 'b', commentary: 'English Attack development' },
          { moveIndex: 12, color: 'b', notation: 'e5', from: [1, 4], to: [3, 4], piece: 'p', commentary: 'Challenging white centralized knight' },
          { moveIndex: 13, color: 'w', notation: 'Nf5', from: [4, 3], to: [3, 5], piece: 'n', commentary: 'Aggressive outpost on f5' },
          { moveIndex: 14, color: 'b', notation: 'Bxf5', from: [0, 2], to: [3, 5], piece: 'b', captured: 'n', commentary: 'Bishop eliminates dangerous knight' },
          { moveIndex: 15, color: 'w', notation: 'exf5', from: [4, 4], to: [3, 5], piece: 'p', captured: 'b', commentary: 'White maintains attacking pressure' },
          { moveIndex: 16, color: 'b', notation: 'd5', from: [2, 3], to: [3, 3], piece: 'p', commentary: 'Counter-attack in center' },
          { moveIndex: 17, color: 'w', notation: 'Bg5', from: [5, 4], to: [3, 6], piece: 'b', commentary: 'Pinning knight to queen' },
          { moveIndex: 18, color: 'b', notation: 'd4', from: [3, 3], to: [4, 3], piece: 'p', commentary: 'Pawn fork attempt' },
          { moveIndex: 19, color: 'w', notation: 'Ne4', from: [5, 2], to: [4, 4], piece: 'n', commentary: 'Tactical repositioning' },
          { moveIndex: 20, color: 'b', notation: 'Be7', from: [0, 5], to: [1, 4], piece: 'b', commentary: 'Unpinning knight' },
          { moveIndex: 21, color: 'w', notation: 'Bxf6', from: [3, 6], to: [2, 5], piece: 'b', captured: 'n', commentary: 'Defenders removed' },
          { moveIndex: 22, color: 'b', notation: 'Bxf6', from: [1, 4], to: [2, 5], piece: 'b', captured: 'b', commentary: 'Recaptured' },
          { moveIndex: 23, color: 'w', notation: 'Bc4', from: [7, 5], to: [4, 2], piece: 'b', commentary: 'Targeting weak d5 outpost' },
          { moveIndex: 24, color: 'b', notation: 'O-O', from: [0, 4], to: [0, 6], piece: 'k', commentary: 'King tucked to safety' },
          { moveIndex: 25, color: 'w', notation: 'Qh5#', from: [7, 3], to: [3, 7], piece: 'q', isCheck: true, commentary: 'Decisive queen battery mate!' },
        ] : undefined,
        racingTelemetry: game === 'CAR_RACING' ? [
          { timeSec: 0, speedMph: 0, position: 4, lap: 1, event: 'Race Started' },
          { timeSec: 15, speedMph: 150, position: 3, lap: 1, event: 'Hairpin turn drift cleanly negotiated' },
          { timeSec: 32, speedMph: 190, position: 2, lap: 1, event: 'Nitro boost applied on straightaway' },
          { timeSec: 50, speedMph: 175, position: 2, lap: 2, event: 'Lap 1 split: 00:50.1' },
          { timeSec: 78, speedMph: 220, position: 1, lap: 2, event: 'Slingshot boost taken for P1 lead' },
          { timeSec: 110, speedMph: 215, position: 1, lap: 3, event: 'Final lap defense maintained' },
          { timeSec: 122, speedMph: 230, position: 1, lap: 3, event: 'Checkered flag crossed!' },
        ] : undefined,
        cardSteps: game === 'CARD_GAME' ? [
          {
            step: 1,
            description: 'Dealt Ace of Spades and 10 of Diamonds (Natural 21!)',
            playerCards: [{ suit: '♠', rank: 'A' }, { suit: '♦', rank: '10' }],
            dealerCards: [{ suit: '♥', rank: '8' }, { suit: '♣', rank: '9', hidden: true }],
            playerScore: 21,
            dealerScore: 8,
          },
          {
            step: 2,
            description: 'Dealer reveals 9 of Clubs for 17 total. Natural Blackjack victory payout!',
            playerCards: [{ suit: '♠', rank: 'A' }, { suit: '♦', rank: '10' }],
            dealerCards: [{ suit: '♥', rank: '8' }, { suit: '♣', rank: '9' }],
            playerScore: 21,
            dealerScore: 17,
          },
        ] : undefined,
      },
    };
    setMatchHistory(prev => [historyItem, ...prev.slice(0, 19)]);

    // Update quest progress
    setQuests(prev =>
      prev.map(q => {
        if ((q.game === game || q.game === 'ALL') && !q.claimed) {
          return {
            ...q,
            currentCount: Math.min(q.targetCount, q.currentCount + 1),
          };
        }
        return q;
      })
    );
  };

  const handleStartMatchmakingForGame = (game: GameId) => {
    setMatchmakingInitialGame(game);
    setShowMatchmaking(true);
  };

  const handleStartMatchFound = (
    game: GameId,
    opp: { name: string; avatar: string; rating: number; title: string }
  ) => {
    setIsTrainingMode(false);
    setOnlineOpponent(opp);
    setActiveGame(game);
    setCurrentTab('GAMES');
  };

  const handleLaunchSquadTraining = (game: GameId, partner?: Friend) => {
    setIsTrainingMode(true);
    setOnlineOpponent(
      partner
        ? {
            name: partner.name,
            avatar: partner.avatar,
            rating: partner.rating,
            title: 'Squad Sparring Partner',
          }
        : {
            name: 'Squad Coach AI',
            avatar: '🎓',
            rating: 1600,
            title: 'Sparring Bot',
          }
    );
    setActiveGame(game);
    setCurrentTab('GAMES');
    sounds.playSuccess();
  };

  const handleChallengeCompetitor = (competitor: LeaderboardEntry | Friend) => {
    const opp = {
      name: 'username' in competitor ? competitor.username : competitor.name,
      avatar: competitor.avatar,
      rating: competitor.rating,
      title: 'Challenger',
    };
    setOnlineOpponent(opp);
    setActiveGame('CHESS');
    setCurrentTab('GAMES');
    setShowSocial(false);
  };

  const handleRegisterTournament = (tournamentId: string) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tournamentId) {
          // Deduct entry fee
          setProfile(p => ({
            ...p,
            coins: t.currency === 'COINS' ? p.coins - t.entryFee : p.coins,
            gems: t.currency === 'GEMS' ? p.gems - t.entryFee : p.gems,
          }));
          return {
            ...t,
            userRegistered: true,
            participantsCount: t.participantsCount + 1,
          };
        }
        return t;
      })
    );
  };

  const handlePlayTournamentMatch = (tournament: Tournament) => {
    setOnlineOpponent({
      name: 'CipherSpeed',
      avatar: '⚡',
      rating: 2390,
      title: 'Tournament Semifinalist',
    });
    setActiveGame(tournament.game);
    setCurrentTab('GAMES');
  };

  const handlePurchaseItem = (item: ShopItem) => {
    setProfile(prev => ({
      ...prev,
      coins: item.currency === 'COINS' ? prev.coins - item.price : prev.coins,
      gems: item.currency === 'GEMS' ? prev.gems - item.price : prev.gems,
      inventory: [...prev.inventory, item.id],
    }));
  };

  const handleEquipItem = (category: 'chessSkin' | 'carSkin' | 'cardDeck', itemId: string) => {
    setProfile(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [category]: itemId,
      },
    }));
  };

  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setProfile(prev => ({
      ...prev,
      coins: quest.rewardType === 'COINS' ? prev.coins + quest.rewardAmount : prev.coins,
      gems: quest.rewardType === 'GEMS' ? prev.gems + quest.rewardAmount : prev.gems,
      xp: quest.rewardType === 'XP' ? prev.xp + quest.rewardAmount : prev.xp,
    }));

    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
    );
  };

  const handleClaimDailyStreak = (day: number) => {
    setProfile(prev => ({
      ...prev,
      coins: prev.coins + 800,
      gems: prev.gems + 25,
      xp: prev.xp + 300,
    }));
  };

  const handleAddFriend = (name: string, tag: string) => {
    const newFriend: Friend = {
      id: 'frd_' + Date.now(),
      name,
      tag,
      avatar: '⚡',
      status: 'ONLINE',
      rating: 1600,
    };
    setFriends(prev => [newFriend, ...prev]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-200 bg-arena-grid ${
        theme === 'oled'
          ? 'bg-black text-slate-100'
          : theme === 'cyber'
          ? 'bg-[#060913] text-slate-100'
          : 'bg-[#080b11] text-slate-100'
      }`}
    >
      {/* Ambient Top Lighting Vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(6,182,212,0.12),transparent_70%)] z-0"
        aria-hidden="true"
      />

      {/* Offline Travel Mode Alert Banner */}
      {profile.isOfflineMode && (
        <div className="relative z-50 bg-amber-600/90 text-slate-950 font-bold text-xs py-1.5 px-4 text-center">
          ✈ Offline Travel Mode Active — Local AI bots enabled without internet connectivity.
        </div>
      )}

      {/* Squad Training Mode Zero-ELO Banner */}
      {isTrainingMode && activeGame && (
        <div className="relative z-40 bg-gradient-to-r from-indigo-950 via-cyan-950 to-indigo-950 border-b border-cyan-500/40 text-cyan-300 font-semibold text-xs py-2 px-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>
              <strong>⚡ Squad Training Session Active:</strong> Zero ELO rating impact. Practice moves, ghost laps, and card strategies with your squad risk-free.
            </span>
          </div>
          <button
            onClick={() => {
              setIsTrainingMode(false);
              setActiveGame(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] border border-slate-700 transition-colors"
          >
            Exit Training
          </button>
        </div>
      )}

      {/* Top Bar Navigation (Strict 3-zone Top Bar Contract) */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={tab => {
          setActiveGame(null);
          setCurrentTab(tab);
        }}
        playerProfile={profile}
        currentLanguage={language}
        onOpenMatchmaking={() => setShowMatchmaking(true)}
        onOpenVoiceChat={() => setShowVoiceChat(true)}
        onOpenSocial={() => setShowSocial(true)}
        onOpenAntiCheat={() => setShowAntiCheat(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenDailyRewards={() => setShowRewards(true)}
      />

      {/* Main View Port Routing */}
      <main className="flex-1 pb-16">
        {currentTab === 'GAMES' && (
          <GameHub
            playerProfile={profile}
            currentLanguage={language}
            activeGame={activeGame}
            onSelectGame={game => setActiveGame(game)}
            onOpenMatchmakingForGame={handleStartMatchmakingForGame}
            onMatchComplete={handleMatchComplete}
            onlineOpponent={onlineOpponent}
            onOpenSquadTraining={() => setShowSquadTraining(true)}
          />
        )}

        {currentTab === 'REPLAYS' && (
          <ReplaysView
            matchHistory={matchHistory}
            selectedMatchId={selectedReplayMatchId}
            onSelectMatch={id => setSelectedReplayMatchId(id)}
          />
        )}

        {currentTab === 'LEADERBOARD' && (
          <LeaderboardView
            playerProfile={profile}
            leaderboardData={leaderboard}
            onChallengePlayer={handleChallengeCompetitor}
          />
        )}

        {currentTab === 'TOURNAMENTS' && (
          <TournamentsView
            playerProfile={profile}
            tournaments={tournaments}
            onRegisterTournament={handleRegisterTournament}
            onPlayTournamentMatch={handlePlayTournamentMatch}
          />
        )}

        {currentTab === 'SHOP' && (
          <ShopView
            playerProfile={profile}
            shopItems={shopItems}
            onPurchaseItem={handlePurchaseItem}
            onEquipItem={handleEquipItem}
          />
        )}

        {currentTab === 'BATTLE_PASS' && (
          <BattlePassView
            playerProfile={profile}
            onClaimPassTier={(tier, isPrem) => {
              setProfile(p => ({ ...p, coins: p.coins + 750, xp: p.xp + 500 }));
            }}
          />
        )}

        {currentTab === 'PROFILE' && (
          <ProfileView
            profile={profile}
            matchHistory={matchHistory}
            onUpdateProfile={updated => setProfile(p => ({ ...p, ...updated }))}
            onOpenShareCard={() => setShowShareCard(true)}
            onWatchReplay={matchId => {
              setSelectedReplayMatchId(matchId);
              setCurrentTab('REPLAYS');
            }}
          />
        )}
      </main>

      {/* Auxiliary Overlays & Drawers */}
      <MatchmakingModal
        isOpen={showMatchmaking}
        onClose={() => setShowMatchmaking(false)}
        playerProfile={profile}
        initialGame={matchmakingInitialGame}
        onStartMatch={handleStartMatchFound}
      />

      <SquadTrainingModal
        isOpen={showSquadTraining}
        onClose={() => setShowSquadTraining(false)}
        playerProfile={profile}
        friends={friends}
        onLaunchTraining={handleLaunchSquadTraining}
      />

      <VoiceChatHub
        playerProfile={profile}
        isOpen={showVoiceChat}
        onClose={() => setShowVoiceChat(false)}
      />

      <SocialDrawer
        isOpen={showSocial}
        onClose={() => setShowSocial(false)}
        friends={friends}
        playerProfile={profile}
        onChallengeFriend={handleChallengeCompetitor}
        onAddFriend={handleAddFriend}
        onOpenSquadTraining={friend => {
          setShowSocial(false);
          setShowSquadTraining(true);
        }}
      />

      <AntiCheatModal
        isOpen={showAntiCheat}
        onClose={() => setShowAntiCheat(false)}
      />

      <DailyRewardsModal
        isOpen={showRewards}
        onClose={() => setShowRewards(false)}
        quests={quests}
        playerProfile={profile}
        onClaimQuest={handleClaimQuest}
        onClaimDailyStreak={handleClaimDailyStreak}
      />

      <ShareCardModal
        isOpen={showShareCard}
        onClose={() => setShowShareCard(false)}
        playerProfile={profile}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        playerProfile={profile}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        currentTheme={theme}
        onThemeChange={setTheme}
        onUpdateProfile={updated => setProfile(p => ({ ...p, ...updated }))}
        onImportData={data => {
          setProfile(data);
          saveProfile(data);
        }}
      />

      <NotificationToast
        onOpenSocial={() => setShowSocial(true)}
        onOpenTournaments={() => {
          setActiveGame(null);
          setCurrentTab('TOURNAMENTS');
        }}
        onOpenRewards={() => setShowRewards(true)}
      />
    </div>
  );
}
