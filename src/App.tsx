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
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { TournamentsView } from './components/tournaments/TournamentsView';
import { ShopView } from './components/shop/ShopView';
import { BattlePassView } from './components/rewards/BattlePassView';
import { ProfileView } from './components/profile/ProfileView';

// Modals & Drawers
import { MatchmakingModal } from './components/multiplayer/MatchmakingModal';
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
    'GAMES' | 'LEADERBOARD' | 'TOURNAMENTS' | 'SHOP' | 'BATTLE_PASS' | 'PROFILE'
  >('GAMES');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [onlineOpponent, setOnlineOpponent] = useState<{
    name: string;
    avatar: string;
    rating: number;
    title: string;
  } | null>(null);

  // Modals visibility
  const [showMatchmaking, setShowMatchmaking] = useState<boolean>(false);
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

    // Record in Match History
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
    setOnlineOpponent(opp);
    setActiveGame(game);
    setCurrentTab('GAMES');
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
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'oled'
          ? 'bg-black text-slate-100'
          : theme === 'cyber'
          ? 'bg-[#080d1a] text-slate-100'
          : 'bg-[#080b11] text-slate-100'
      }`}
    >
      {/* Offline Travel Mode Alert Banner */}
      {profile.isOfflineMode && (
        <div className="bg-amber-600/90 text-slate-950 font-bold text-xs py-1.5 px-4 text-center">
          ✈ Offline Travel Mode Active — Local AI bots enabled without internet connectivity.
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
