import React, { useState } from 'react';
import { ShopItem, PlayerProfile, GameId } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Coins,
  Check,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';

interface ShopViewProps {
  playerProfile: PlayerProfile;
  shopItems: ShopItem[];
  onPurchaseItem: (item: ShopItem) => void;
  onEquipItem: (category: 'chessSkin' | 'carSkin' | 'cardDeck', itemId: string) => void;
}

const RARITY_COLORS: Record<string, { badge: string; border: string }> = {
  Common: { badge: 'bg-slate-800 text-slate-300', border: 'border-slate-700' },
  Rare: { badge: 'bg-cyan-950 text-cyan-400', border: 'border-cyan-500/30' },
  Epic: { badge: 'bg-purple-950 text-purple-400', border: 'border-purple-500/30' },
  Legendary: { badge: 'bg-amber-950 text-amber-400', border: 'border-amber-500/40' },
};

export const ShopView: React.FC<ShopViewProps> = ({
  playerProfile,
  shopItems,
  onPurchaseItem,
  onEquipItem,
}) => {
  const [activeTab, setActiveTab] = useState<'SHOP' | 'INVENTORY'>('SHOP');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | GameId>('ALL');

  const filteredItems = shopItems.filter(item => {
    if (categoryFilter !== 'ALL' && item.game !== categoryFilter && item.game !== 'ALL') {
      return false;
    }
    return true;
  });

  const handleBuy = (item: ShopItem) => {
    const hasFunds =
      item.currency === 'COINS'
        ? playerProfile.coins >= item.price
        : playerProfile.gems >= item.price;

    if (!hasFunds) {
      sounds.playDefeat();
      alert(`Insufficient ${item.currency}. Win matches and tournaments to earn more!`);
      return;
    }

    sounds.playVictory();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onPurchaseItem(item);
  };

  const isEquipped = (itemId: string): boolean => {
    return (
      playerProfile.equipped.chessSkin === itemId ||
      playerProfile.equipped.carSkin === itemId ||
      playerProfile.equipped.cardDeck === itemId
    );
  };

  const handleEquip = (item: ShopItem) => {
    sounds.playClick();
    if (item.game === 'CHESS') onEquipItem('chessSkin', item.id);
    else if (item.game === 'CAR_RACING') onEquipItem('carSkin', item.id);
    else if (item.game === 'CARD_GAME') onEquipItem('cardDeck', item.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Cosmetics & Armory
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Fair Cosmetic Progression</span>
              <span aria-hidden="true">·</span>
              <span>No Pay-to-Win Mechanics</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">Daily Rotation Active</span>
            </div>
          </div>
        </div>

        {/* Currency Display Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-amber-400 font-bold font-mono">
              {playerProfile.coins.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Coins</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-cyan-400 font-bold font-mono">{playerProfile.gems}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Gems</span>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Shop vs Inventory Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('SHOP');
            }}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'SHOP' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Featured Store
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('INVENTORY');
            }}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'INVENTORY' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            My Locker & Inventory ({playerProfile.inventory.length})
          </button>
        </div>

        {/* Game Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'CHESS', label: 'Chess Sets' },
            { id: 'CAR_RACING', label: 'Hypercars' },
            { id: 'CARD_GAME', label: 'Card Decks' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sounds.playClick();
                setCategoryFilter(f.id as 'ALL' | GameId);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === f.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems
          .filter(item => {
            if (activeTab === 'INVENTORY') {
              return playerProfile.inventory.includes(item.id);
            }
            return true;
          })
          .map(item => {
            const isOwned = playerProfile.inventory.includes(item.id);
            const equipped = isEquipped(item.id);
            const rarity = RARITY_COLORS[item.rarity];

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 bg-slate-900/70 border flex flex-col justify-between transition-all duration-150 ${rarity.border} hover:bg-slate-900`}
              >
                <div>
                  {/* Item Visual Color Frame / Preview */}
                  <div
                    className="w-full h-32 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, #090d16 0%, ${item.previewColor}22 100%)`,
                      border: `1px solid ${item.previewColor}44`,
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
                      style={{
                        background: item.previewColor,
                        color: '#080b11',
                      }}
                    >
                      {item.game === 'CHESS' ? '♟' : item.game === 'CAR_RACING' ? '🏎️' : item.game === 'CARD_GAME' ? '🃏' : '💎'}
                    </div>

                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rarity.badge}`}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-white text-sm font-display mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {item.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {/* Price */}
                  <div>
                    {isOwned ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acquired
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 font-mono font-bold text-sm text-slate-200">
                        {item.currency === 'COINS' ? (
                          <span className="text-amber-400">${item.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-cyan-400">{item.price} 💎</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Buy / Equip Button */}
                  <div>
                    {isOwned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={equipped}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          equipped
                            ? 'bg-slate-800 text-slate-400 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                        }`}
                      >
                        {equipped ? <Check className="w-3 h-3" /> : null}
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
