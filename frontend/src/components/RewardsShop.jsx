import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  ShoppingBag, Coins, Gamepad2, UtensilsCrossed,
  Film, Moon, Plus, CheckCircle2, Sparkles, X, Trash2,
  History, AlertTriangle
} from 'lucide-react';

const CATEGORIES = ['Leisure', 'Food', 'Entertainment', 'Rest', 'Fitness', 'Social', 'Wellness'];

const getIcon = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('game'))  return Gamepad2;
  if (t.includes('meal') || t.includes('food')) return UtensilsCrossed;
  if (t.includes('movie')) return Film;
  if (t.includes('sleep')) return Moon;
  return Sparkles;
};

const formatTs = (ts) => {
  try {
    return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
};

export const RewardsShop = () => {
  const {
    user, isDark,
    shopRewards, redeemReward, addCustomReward, deleteReward,
    redeemedHistory, deleteHistoryEntry, clearHistory
  } = useStore();
  const safeUser = user || {};

  // Add-perk form state
  const [isAdding,  setIsAdding]  = useState(false);
  const [title,     setTitle]     = useState('');
  const [cost,      setCost]      = useState(100);
  const [category,  setCategory]  = useState('Leisure');

  // Confirm-delete overlay for history clear
  const [confirmClear, setConfirmClear] = useState(false);

  // ---------- styles ----------
  const canvasBg = isDark ? 'bg-[#111e18]' : 'bg-[#F4F6F5]';
  const cardBg   = isDark
    ? 'bg-[#111e18] border-[#1a2f26]'
    : 'bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)]';
  const textPrimary = isDark ? 'text-white'        : 'text-[#111827]';
  const textSub     = isDark ? 'text-slate-400'    : 'text-[#6B7280]';
  const inputCls    = isDark
    ? 'bg-[#14261f] border-[#1a2f26] text-white placeholder-slate-500 focus:border-[#10B981]'
    : 'bg-[#F4F6F5] border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:border-[#124F34]';
  const divider     = isDark ? 'border-[#1a2f26]' : 'border-[#EEF2F0]';

  // ---------- handlers ----------
  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCustomReward({ title: title.trim(), cost: Number(cost) || 50, category });
    setTitle(''); setCost(100); setIsAdding(false);
  };

  const handleRedeem = (reward) => {
    redeemReward(reward);
  };

  const handleDeleteReward = (rewardId, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this perk from the shop?')) return;
    deleteReward(rewardId);
  };

  const handleDeleteHistoryEntry = (idx) => {
    deleteHistoryEntry(idx);
  };

  const handleClearHistory = () => {
    clearHistory();
    setConfirmClear(false);
  };

  return (
    <div className={`space-y-6 min-h-screen p-1 ${canvasBg} rounded-3xl`}>

      {/* ── Header ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl ${cardBg} border`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className={`font-display font-black text-xl ${textPrimary}`}>Rewards Shop</h2>
            <p className={`text-xs ${textSub}`}>Redeem your hard-earned coins for real-life perks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Coin balance */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm
            ${isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
            <Coins className="w-3.5 h-3.5" />
            {safeUser.coins || 0}
            <span className="text-[11px] font-normal opacity-70">coins</span>
          </div>

          {/* Add custom perk */}
          <button
            onClick={() => setIsAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold shadow cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Perk
          </button>
        </div>
      </div>

      {/* ── Add Custom Perk Form ── */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className={`p-5 rounded-2xl ${cardBg} border border-[#124F34]/30 space-y-4`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${divider}`}>
            <h4 className={`font-bold text-sm ${textPrimary}`}>Create Custom Perk</h4>
            <button type="button" onClick={() => setIsAdding(false)} className={`${textSub} cursor-pointer hover:text-red-500 transition-colors`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Perk Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Cheat Meal Friday"
                required
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Coin Cost</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                min={10}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={`px-4 py-2 text-xs font-semibold ${textSub} cursor-pointer hover:text-[#111827] transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all"
            >
              Add Perk
            </button>
          </div>
        </form>
      )}

      {/* ── Rewards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(shopRewards || []).map(reward => {
          const Icon = getIcon(reward.title);
          const canAfford = (safeUser.coins || 0) >= reward.cost;

          return (
            <div
              key={reward.id}
              className={`relative p-4 rounded-2xl ${cardBg} border flex flex-col justify-between transition-all hover:border-amber-400/40 hover:shadow-md group`}
            >
              {/* Delete button (top-right corner) */}
              <button
                onClick={(e) => handleDeleteReward(reward.id, e)}
                title="Remove perk"
                className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all
                  ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div>
                {/* Icon + cost badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border
                    ${isDark ? 'bg-amber-950/30 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border
                    ${isDark ? 'text-amber-400 bg-amber-950/40 border-amber-500/30' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                    {reward.cost} 🪙
                  </span>
                </div>

                <h4 className={`font-display font-bold text-sm ${textPrimary}`}>{reward.title}</h4>
                <span className={`text-[10px] capitalize ${textSub}`}>{reward.category}</span>
              </div>

              {/* Redeem button */}
              <button
                onClick={() => handleRedeem(reward)}
                disabled={!canAfford}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  canAfford
                    ? 'bg-[#124F34] hover:bg-[#0D5C3A] text-white shadow-md shadow-emerald-950/20'
                    : isDark
                      ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-[#F4F6F5] text-[#9CA3AF] cursor-not-allowed border border-[#E5E7EB]'
                }`}
              >
                {canAfford ? 'Redeem Perk 🎁' : `Need ${reward.cost - (safeUser.coins || 0)} more 🪙`}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Redemption History ── */}
      <div className={`p-5 rounded-2xl ${cardBg} border`}>
        {/* History header */}
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${divider}`}>
          <div className="flex items-center gap-2">
            <History className={`w-4 h-4 ${textSub}`} />
            <span className={`text-sm font-bold ${textPrimary}`}>Redemption History</span>
            {redeemedHistory.length > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#F4F6F5] text-[#6B7280]'}`}>
                {redeemedHistory.length} used
              </span>
            )}
          </div>

          {redeemedHistory.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs ${textSub}`}>Clear all?</span>
                <button
                  onClick={handleClearHistory}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors
                    ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-[#F4F6F5] text-[#6B7280] hover:bg-[#EEF2F0]'}`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors
                  ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Clear All
              </button>
            )
          )}
        </div>

        {/* History list */}
        {redeemedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <CheckCircle2 className={`w-8 h-8 ${textSub} opacity-30`} />
            <p className={`text-sm ${textSub} text-center`}>No redemptions yet.<br />Earn coins and redeem your first perk!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {redeemedHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all group
                  ${isDark
                    ? 'bg-[#0b1a14] border-[#1a2f26] hover:border-[#2a4f3a]'
                    : 'bg-[#F9FCFA] border-[#EEF2F0] hover:border-[#C2E7D3]'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>{item.title}</p>
                    <div className={`flex items-center gap-2 mt-0.5 flex-wrap text-[11px] ${textSub}`}>
                      <span className="capitalize">{item.category}</span>
                      <span>·</span>
                      <span className="font-mono">{item.cost} 🪙</span>
                      <span>·</span>
                      <span>{formatTs(item.redeemedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Delete individual entry */}
                <button
                  onClick={() => handleDeleteHistoryEntry(idx)}
                  title="Remove this entry"
                  className={`shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer
                    ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
