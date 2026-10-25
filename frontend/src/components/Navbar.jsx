import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  BookOpen, Activity, Wallet, LayoutDashboard,
  Plus, X, Sparkles
} from 'lucide-react';

const CORE_MODULES = [
  { id: 'all',     name: 'All Modules',        icon: LayoutDashboard },
  { id: 'daily',   name: 'Daily Life',          icon: Sparkles },
  { id: 'study',   name: 'Study & Focus',       icon: BookOpen },
  { id: 'fitness', name: 'Fitness & Nutrition',  icon: Activity },
  { id: 'finance', name: 'Finance Tracking',    icon: Wallet },
];

export const Navbar = () => {
  const { activeModuleFilter, setActiveModuleFilter, customModules, addCustomModule, isDark } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [newCategory, setNewCategory] = useState('Daily Life');

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCustomModule({ title: newTitle.trim(), category: newCategory, description: 'Custom user module', accentColor: '#124F34' });
    setNewTitle('');
    setIsModalOpen(false);
  };

  const navBg = isDark ? 'bg-[#111e18]/90 border-[#1a2f26]' : 'bg-white/90 border-[#EEF2F0]';
  const inputCls = isDark ? 'bg-[#14261f] border-[#1a2f26] text-white' : 'bg-[#F4F6F5] border-[#EEF2F0] text-[#111827] focus:border-[#124F34]';

  return (
    <>
      <nav className={`w-full ${navBg} border-b px-4 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]`}>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(CORE_MODULES || []).map(m => {
            const Icon = m.icon;
            const isActive = activeModuleFilter === m.name;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleFilter(m.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#124F34] text-white shadow-md shadow-emerald-950/20 ring-1 ring-[#124F34]'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-[#1a2f26]'
                      : 'text-[#6B7280] hover:text-[#124F34] hover:bg-[#E6F4ED]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-current'}`} />
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isActive
                    ? 'bg-[#124F34] text-white border-[#124F34] shadow-md'
                    : isDark
                      ? 'border-[#1a2f26] text-slate-400 hover:text-white hover:bg-[#1a2f26]'
                      : 'border-[#EEF2F0] text-[#6B7280] hover:text-[#124F34] hover:bg-[#E6F4ED]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                {cm.title}
              </button>
            );
          })}

          {/* Add Module Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#E6F4ED] hover:bg-[#C2E7D3] text-[#124F34] border border-[#C2E7D3] text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Module
          </button>
        </div>
      </nav>

      {/* Add Module Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md ${isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0]'} border rounded-3xl p-6 shadow-2xl animate-fade-in`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#1a2f26]' : 'border-[#EEF2F0]'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4ED] flex items-center justify-center text-[#124F34]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-[#111827]'}`}>Create Workspace Module</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddModule} className="space-y-4 mt-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>Module Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily Spanish Practice"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm outline-none transition-all ${inputCls}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm outline-none ${inputCls}`}
                >
                  <option value="Daily Life">Daily Life</option>
                  <option value="Study & Focus">Study & Focus</option>
                  <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                  <option value="Finance Tracking">Finance Tracking</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold shadow-md shadow-emerald-950/20 cursor-pointer transition-all"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
