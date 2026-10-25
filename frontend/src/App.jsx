import React, { useEffect, useState } from "react";
import { GamifiedHeader } from "./components/GamifiedHeader";
import { Navbar } from "./components/Navbar";
import { LeftSidebar } from "./components/LeftSidebar";
import { DashboardGrid } from "./components/DashboardGrid";
import { AiLifeCoachDrawer } from "./components/AiLifeCoachDrawer";
import { AuthPage } from "./components/AuthPage";
import { RewardsShop } from "./components/RewardsShop";
import { CommunityLeaderboard } from "./components/CommunityLeaderboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useStore } from "./store/useStore";
import { Trophy, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

function AppContent() {
  const levelUpModal      = useStore(s => s.levelUpModal);
  const closeLevelUpModal = useStore(s => s.closeLevelUpModal);
  const user              = useStore(s => s.user);
  const isAuthenticated   = useStore(s => s.isAuthenticated);
  const isDark            = useStore(s => s.isDark);
  const activeSidePanel   = useStore(s => s.activeSidePanel);

  const [initializing, setInitializing] = useState(true);

  // Watchdog-backed session verification
  useEffect(() => {
    let cancelled = false;

    // Safety watchdog: Guarantee the app never stays frozen in loading state
    const watchdog = setTimeout(() => {
      if (!cancelled) setInitializing(false);
    }, 2500);

    useStore.getState().initSession()
      .catch((err) => {
        console.warn("Session init error caught:", err);
      })
      .finally(() => {
        clearTimeout(watchdog);
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
    };
  }, []);

  // Sync theme class to <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  /* ── Phase 1: Loading spinner ── */
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/30 mb-2 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="font-display font-black text-white text-xl tracking-tight">LiFixify</p>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Checking session...</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Phase 2: Auth wall ── */
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  /* ── Phase 3: Authenticated app ── */
  const mainBg = isDark ? "bg-[#080c14] text-slate-100" : "bg-slate-100 text-slate-900";

  return (
    <div className={`min-h-screen ${mainBg} flex font-sans selection:bg-indigo-500 selection:text-white relative`}>

      {/* ── Left Sidebar (desktop) ── */}
      <ErrorBoundary>
        <LeftSidebar />
      </ErrorBoundary>

      {/* ── Main Content Column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile-only slim header */}
        <ErrorBoundary>
          <GamifiedHeader />
        </ErrorBoundary>

        {/* Module filter nav */}
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>

        {/* Page content */}
        <main className="flex-1 pb-16 overflow-y-auto">
          <ErrorBoundary>
            {activeSidePanel === "rewards" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="mb-4">
                  <button
                    onClick={() => useStore.getState().setActiveSidePanel(null)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>
                <RewardsShop />
              </div>
            )}
            {activeSidePanel === "leaderboard" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="mb-4">
                  <button
                    onClick={() => useStore.getState().setActiveSidePanel(null)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </button>
                </div>
                <CommunityLeaderboard />
              </div>
            )}
            {!activeSidePanel && <DashboardGrid />}
          </ErrorBoundary>
        </main>

        {/* AI Coach */}
        <ErrorBoundary>
          <AiLifeCoachDrawer />
        </ErrorBoundary>

        {/* Level-Up Modal */}
        {levelUpModal?.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-[#0e1424] rounded-3xl border-2 border-amber-500/50 p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="w-full h-full rounded-2xl bg-slate-900 border-2 border-amber-400 flex flex-col items-center justify-center shadow-xl">
                  <Trophy className="w-8 h-8 text-amber-400 mb-0.5 animate-bounce" />
                  <span className="font-display font-black text-xl text-white">LVL {levelUpModal.newLevel}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />LEVEL ASCENDED!
              </span>
              <h3 className="font-display font-black text-2xl text-white mt-1">{levelUpModal.unlockedTitle || "New Rank Achieved"}</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
                Congratulations, <strong>{user?.name || "Player"}</strong>! Your discipline has evolved your rank.
              </p>
              <button
                onClick={closeLevelUpModal}
                className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <span>Claim Rewards &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={`border-t py-4 px-4 text-center text-xs text-slate-500 ${isDark ? "border-slate-800/60 bg-[#060910]" : "border-slate-200 bg-white"}`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LiFixify Gamified Life OS · Express / MongoDB Atlas / Gemini AI
            </p>
            <p className={isDark ? "text-slate-600" : "text-slate-400"}>Full Feature Suite Online</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
