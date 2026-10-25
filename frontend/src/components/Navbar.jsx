import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  BookOpen, Activity, Wallet, LayoutDashboard,
  Plus, X, Sparkles
} from 'lucide-react';

const CORE_MODULES = [
  { id: 'all',     name: 'All Modules',      icon: LayoutDashboard },
  { id: 'daily',   name: 'Daily Life',        icon: Sparkles },
  { id: 'study',   name: 'Study & Focus',     icon: BookOpen },
  { id: 'fitness', name: 'Fitness & Nutrition', icon: Activity },
  { id: 'finance', name: 'Finance Tracking',  icon: Wallet },
];

export const Navbar = () => {
  const { activeModuleFilter, setActiveModuleFilter, customModules, addCustomModule, isDark } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [newCategory, setNewCategory] = useState('Daily Life');

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCustomModule({ title: newTitle.trim(), category: newCategory, description: 'Custom user module', accentColor: '#8b5cf6' });
    setNewTitle('');
    setIsModalOpen(false);
  };

  const navBg   = isDark ? 'bg-[#0d1322]/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80';
  const inputCls = isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <>
      <nav className={`w-full ${navBg} border-b px-4 sm:px-6 py-2.5 backdrop-blur-md`}>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(CORE_MODULES || []).map(m => {
            const Icon = m.icon;
            const isActive = activeModuleFilter === m.name;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleFilter(m.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400'
                    : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                {m.name}
              </button>
            );
          })}

          {(customModules || []).map(cm => {
            const isActive = activeModuleFilter === cm.title;
            return (
              <button
                key={cm.id}
                onClick={() => setActiveModuleFilter(cm.title)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-pink-300 border-pink-500/50 shadow-md ring-1 ring-pink-400'
                    : isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                {cm.title}
              </button>
            );
          })}

          {/* Add Module */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0 ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Module
          </button>
        </div>
      </nav>

      {/* Add Module Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md ${isDark ? 'bg-[#0d1322] border-indigo-500/30' : 'bg-white border-indigo-300/50'} border rounded-3xl p-6 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Workspace Module</h3>
              <button onClick={() => setIsModalOpen(false)} className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddModule} className="space-y-4 mt-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Module Name</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Japanese Kanji Practice" required className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500 ${inputCls}`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputCls}`}>
                  <option value="Daily Life">Daily Life</option>
                  <option value="Study & Focus">Study & Focus</option>
                  <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                  <option value="Finance Tracking">Finance Tracking</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 text-xs font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} cursor-pointer`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer">Create Module</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
