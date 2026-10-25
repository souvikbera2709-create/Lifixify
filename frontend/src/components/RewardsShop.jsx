import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  ShoppingBag, Coins, Gamepad2, UtensilsCrossed,
  Film, Moon, Plus, CheckCircle2, Sparkles, X
} from 'lucide-react';

const getIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('game'))  return Gamepad2;
  if (t.includes('meal') || t.includes('food')) return UtensilsCrossed;
  if (t.includes('movie')) return Film;
  if (t.includes('sleep')) return Moon;
  return Sparkles;
};

export const RewardsShop = () => {
  const { user, shopRewards, redeemReward, addCustomReward, redeemedHistory, isDark } = useStore();
  const safeUser = user || {};

  const [isAdding,    setIsAdding]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [cost,        setCost]        = useState(100);
  const [category,    setCategory]    = useState('Leisure');

  const cardBg  = isDark ? 'bg-[#090d16] border-slate-800/80' : 'bg-white border-slate-200';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCustomReward({ title: title.trim(), cost: Number(cost) || 50, category, icon: 'Sparkles' });
    setTitle(''); setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between p-5 rounded-2xl ${cardBg} border`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className={`font-display font-black text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Rewards Shop</h2>
            <p className={`text-xs ${textSub}`}>Redeem your hard-earned coins for real perks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{safeUser.coins || 0}</span>
            <span className="text-[11px] text-amber-300/70">coins</span>
          </div>
          <button
            onClick={() => setIsAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />Custom Perk
          </button>
        </div>
      </div>

      {/* Add Custom Reward Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className={`p-5 rounded-2xl ${cardBg} border border-indigo-500/30 space-y-3`}>
          <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} pb-3`}>
            <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Custom Perk</h4>
            <button type="button" onClick={() => setIsAdding(false)} className={`${textSub} cursor-pointer`}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Perk Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cheat Meal Friday" required className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500 ${inputCls}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Coin Cost</label>
              <input type="number" value={cost} onChange={e => setCost(e.target.value)} min={10} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-indigo-500 ${inputCls}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`}>
                {['Leisure','Food','Entertainment','Rest','Fitness','Social'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setIsAdding(false)} className={`px-4 py-2 text-xs font-semibold ${textSub} cursor-pointer`}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow cursor-pointer">Add Perk</button>
          </div>
        </form>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(shopRewards || []).map(reward => {
          const Icon = getIcon(reward.title);
          const canAfford = (safeUser.coins || 0) >= reward.cost;
          return (
            <div key={reward.id} className={`p-4 rounded-2xl ${cardBg} border flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-sm`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {reward.cost} 🪙
                  </span>
                </div>
                <h4 className={`font-display font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{reward.title}</h4>
                <span className={`text-[10px] capitalize ${textSub}`}>{reward.category}</span>
              </div>
              <button
                onClick={() => redeemReward(reward)}
                disabled={!canAfford}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  canAfford
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md'
                    : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                {canAfford ? 'Redeem Perk 🎁' : `Need ${reward.cost - (safeUser.coins || 0)} more 🪙`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Redemption History */}
      {redeemedHistory.length > 0 && (
        <div className={`p-4 rounded-2xl ${cardBg} border`}>
          <span className={`text-xs font-bold uppercase tracking-wider block mb-3 ${textSub}`}>Redemption History</span>
          <div className="flex items-center gap-2 flex-wrap">
            {(redeemedHistory || []).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {item.title}
                <span className={`text-[10px] font-mono ${textSub}`}>({item.redeemedAt})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
