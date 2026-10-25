import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Trophy,
  Coins,
  ShoppingBag,
  Flame,
  Zap,
  Gamepad2,
  UtensilsCrossed,
  Film,
  Moon,
  Plus,
  CheckCircle2,
  Crown,
  Medal,
  Sparkles
} from 'lucide-react';

export const RewardsLeaderboard = () => {
  const { user, shopRewards, redeemReward, addCustomReward, redeemedHistory } = useStore();
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'leaderboard'
  
  // Custom Reward Form state
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(100);
  const [newRewardCategory, setNewRewardCategory] = useState('Leisure');

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoadingLeaderboard(true);
        const data = await api.auth.getLeaderboard();
        if (data.success && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        } else {
          setLeaderboard([]);
        }
      } catch (e) {
        setLeaderboard([]);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, [user.level, user.xp, user.streak, user.coins]);

  const handleCreateReward = (e) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;

    addCustomReward({
      title: newRewardTitle.trim(),
      cost: Number(newRewardCost) || 50,
      category: newRewardCategory,
      icon: 'Sparkles'
    });

    setNewRewardTitle('');
    setIsAddingReward(false);
  };

  const getRewardIcon = (title) => {
    if (title.toLowerCase().includes('game')) return Gamepad2;
    if (title.toLowerCase().includes('meal') || title.toLowerCase().includes('food')) return UtensilsCrossed;
    if (title.toLowerCase().includes('movie')) return Film;
    if (title.toLowerCase().includes('sleep')) return Moon;
    return Sparkles;
  };

  return (
    <div className="glass-card rounded-3xl p-6 border-t-2 border-t-amber-500 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <ShoppingBag className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              Rewards Shop & Community Leaderboard
            </h2>
            <p className="text-xs text-slate-400">
              Redeem real-world perks with hard-earned coins and compete for the top rank
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Rewards Shop</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Rewards Shop */}
      {activeTab === 'shop' && (
        <div className="mt-6 animate-fade-in space-y-6">
          
          {/* Shop Balance Banner & Add Custom Reward Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#090d16] border border-amber-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Your Spendable Balance</span>
                <span className="font-mono text-2xl font-black text-amber-400">
                  {user.coins} <span className="text-sm font-bold text-amber-300">Coins</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAddingReward(!isAddingReward)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingReward ? 'Close Form' : '+ Create Custom Reward'}</span>
            </button>
          </div>

          {/* Custom Reward Creator */}
          {isAddingReward && (
            <form onSubmit={handleCreateReward} className="p-4 rounded-2xl bg-[#090d16] border border-amber-500/40 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Define Your Custom Real-Life Perk
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Perk Name</label>
                  <input
                    type="text"
                    value={newRewardTitle}
                    onChange={(e) => setNewRewardTitle(e.target.value)}
                    placeholder="e.g. Buy a new Sci-Fi book, Coffee shop visit..."
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cost (Coins)</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingReward(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow active:scale-95"
                >
                  Save Perk
                </button>
              </div>
            </form>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shopRewards.map((reward) => {
              const IconComponent = getRewardIcon(reward.title);
              const canAfford = user.coins >= reward.cost;

              return (
                <div
                  key={reward.id}
                  className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {reward.cost} Coins
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-white">{reward.title}</h4>
                    <span className="text-[10px] text-slate-500 capitalize">{reward.category}</span>
                  </div>

                  <button
                    onClick={() => redeemReward(reward)}
                    disabled={!canAfford}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    {canAfford ? 'Redeem Perk 🎁' : `Need ${reward.cost - user.coins} more 🪙`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Recent Redemptions Log */}
          {redeemedHistory.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Redemptions Log
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {redeemedHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({item.redeemedAt})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Community Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="mt-6 animate-fade-in space-y-6">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((player, idx) => {
              const medals = [
                { rank: '1st', color: 'from-amber-500 to-yellow-300', text: 'text-amber-400', border: 'border-amber-400' },
                { rank: '2nd', color: 'from-slate-300 to-slate-100', text: 'text-slate-200', border: 'border-slate-300' },
                { rank: '3rd', color: 'from-amber-700 to-amber-600', text: 'text-amber-600', border: 'border-amber-600' }
              ];
              const medal = medals[idx];

              return (
                <div
                  key={player._id || idx}
                  className={`p-5 rounded-2xl bg-[#090d16] border-2 ${medal.border} flex flex-col items-center text-center relative overflow-hidden shadow-lg`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${medal.color} p-0.5 mb-2`}>
                    <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center font-black text-lg text-white">
                      {medal.rank}
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-sm text-white truncate max-w-[150px]">
                    {player.name}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                    Level {player.level}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                      {player.xp} XP
                    </span>
                    <span className="flex items-center gap-1 text-orange-400 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" />
                      {player.streak}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <div className="rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Active Streak</th>
                  <th className="py-3 px-4 text-right">Experience (XP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {leaderboard.map((player, index) => {
                  const isYou = player.name?.includes('(You)');
                  return (
                    <tr
                      key={player._id || index}
                      className={isYou ? 'bg-indigo-950/30 text-indigo-300' : 'text-slate-300 hover:bg-slate-900/40'}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        {player.name}
                        {isYou && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-400">
                        Lvl {player.level}
                      </td>
                      <td className="py-3 px-4 text-orange-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        {player.streak} Days
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {player.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
