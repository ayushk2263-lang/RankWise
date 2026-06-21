import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PredictorTab from './components/PredictorTab';
import MarksVsRankTab from './components/MarksVsRankTab';
import AnalyticsTab from './components/AnalyticsTab';
import CollegesTab from './components/CollegesTab';
import CompareTab from './components/CompareTab';
import AdvisorTab from './components/AdvisorTab';
import DashboardTab from './components/DashboardTab';
import ArchitectureTab from './components/ArchitectureTab';
import ErrorBoundary from './components/ErrorBoundary';
import { TabType, UserSession } from './types';
import { Sparkles, Trophy, Landmark, GraduationCap } from 'lucide-react';
import { collegesData } from './data/collegeData';
import { initDb, cacheCollegeCatalog, saveOfflineShortlist, getOfflineShortlist } from './lib/offlineDb';

// Setup high-quality guest session so predictor works instantly
const GUEST_DEFAULT: UserSession = {
  email: "guest@rankwise.in",
  name: "Guest Aspirant",
  rank: 1850,
  category: "OPEN",
  gender: "Gender-Neutral",
  homeState: "Maharashtra",
  examType: "JEE-Advanced",
  shortlist: ["iit-bombay:ME", "iit-delhi:EE", "nit-trichy:CSE"],
  emailAlertsEnabled: true,
  alertOnCutoffChange: true,
  alertOnPlacementUpdate: false,
  alertFrequency: "daily"
};

export default function App() {
  const [currentTab, setTab] = useState<TabType>('predictor');
  const [user, setUser] = useState<UserSession | null>(GUEST_DEFAULT);
  
  // Preset state for comparisons
  const [comparePreset, setComparePreset] = useState<{ collegeId: string; branchCode: string } | null>(null);

  // Load saved credentials from localStorage if present & seed offline database
  useEffect(() => {
    const saved = localStorage.getItem('rankwise_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        // Seed user's shortlist offline
        if (parsed.shortlist) {
          saveOfflineShortlist(parsed.shortlist).catch(() => {});
        }
      } catch (e) {
        console.error("Failed to parse cached session:", e);
      }
    }

    // Initialize and prime IndexedDB offline catalog
    const syncOfflineStore = async () => {
      try {
        await initDb();
        await cacheCollegeCatalog(collegesData);
        console.log("IndexedDB successfully seeded with full college catalog.");
      } catch (err) {
        console.warn("Could not sync IndexedDB college data:", err);
      }
    };
    syncOfflineStore();
  }, []);

  // Sync profile edits with server and local storage
  const handleUpdateUser = async (updatedFields: Partial<UserSession>) => {
    if (!user) return;
    
    const merged: UserSession = { ...user, ...updatedFields };
    setUser(merged);
    localStorage.setItem('rankwise_session', JSON.stringify(merged));

    // Persist shortlist and preferences in local IndexedDB offline storage
    if (merged.shortlist) {
      saveOfflineShortlist(merged.shortlist).catch(err => {
        console.warn("IndexedDB shortlist write postponed:", err);
      });
    }

    // Try synchronizing session with DB in background
    try {
      await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    } catch (err) {
      console.log("Session synchronized locally (offline first mode active).");
    }
  };

  const handleLogin = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('rankwise_session', JSON.stringify(data.user));
        
        // Caching shortlist offline
        if (data.user.shortlist) {
          await saveOfflineShortlist(data.user.shortlist).catch(() => {});
        }
        
        setTab('predictor'); // Redirect back to active cockpit
        return true;
      }
    } catch {
      // Fallback local registry if server is starting up
      const customMock: UserSession = {
        email: email.toLowerCase(),
        name: email.split('@')[0].toUpperCase(),
        rank: 4500,
        category: "OPEN",
        gender: "Gender-Neutral",
        homeState: "Delhi",
        examType: "JEE-Main",
        shortlist: []
      };
      setUser(customMock);
      localStorage.setItem('rankwise_session', JSON.stringify(customMock));
      await saveOfflineShortlist([]).catch(() => {});
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rankwise_session');
    setTab('dashboard'); // Redirect to login
  };

  const triggerComparePreset = (collegeId: string, branchCode: string) => {
    setComparePreset({ collegeId, branchCode });
    setTab('compare'); // Swap tab instantly
  };

  return (
    <div className="min-h-screen bg-[#060813] text-slate-200 flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      {/* Frosted Glass Mesh Gradient Background elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-cyan-600/30 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[35%] w-[45%] h-[45%] rounded-full bg-purple-600/25 blur-[120px]"></div>
      </div>

      {/* Structural Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setTab('dashboard')}
      />

      {/* Primary content Workspace details */}
      <main className="flex-1 md:ml-64 min-h-screen p-4 sm:p-6 lg:p-12 pb-20 relative z-10 overflow-x-hidden">        {/* App Shell top bar */}
        <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-8 mb-8 border-b border-white/10">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-sans uppercase">
              <span>Predictive Command Portal</span>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono lowercase select-none">
                beta v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active Session: <strong className="text-slate-300">{user ? user.name : 'Unregistered Guest'}</strong> 
              {user && (
                <>
                  {' '}• JEE {user.examType === 'JEE-Advanced' ? 'Adv' : 'Main'} Rank <strong className="text-indigo-400 font-mono">#{user.rank}</strong>
                </>
              )}
            </p>
          </div>

          {/* Quick global stats metrics widget */}
          <div className="flex gap-4 font-mono text-[10px]">
            <div className="backdrop-blur-md bg-white/5 p-2 px-3 border border-white/10 rounded-xl shadow-lg shadow-black/10">
              <span className="text-slate-500 block uppercase font-bold text-[8px]">Seating Database</span>
              <span className="text-slate-300 font-bold text-[11px]">JoSAA 2021-2025</span>
            </div>
            <div className="backdrop-blur-md bg-white/5 p-2 px-3 border border-white/10 rounded-xl shadow-lg shadow-black/10">
              <span className="text-slate-500 block uppercase font-bold text-[8px]">Target Ranks Pool</span>
              <span className="text-indigo-400 font-bold text-[11px]">1 to 500,000</span>
            </div>
          </div>
        </header>

        {/* Viewport page mount */}
        <ErrorBoundary>
          {currentTab === 'predictor' && (
            <PredictorTab 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onTriggerCompare={triggerComparePreset}
            />
          )}
          {currentTab === 'marks-vs-rank' && <MarksVsRankTab />}
          {currentTab === 'analytics' && <AnalyticsTab />}
          {currentTab === 'colleges' && (
            <CollegesTab 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onTriggerCompare={triggerComparePreset}
            />
          )}
          {currentTab === 'compare' && (
            <CompareTab 
              comparePreset={comparePreset} 
              onClearPreset={() => setComparePreset(null)}
            />
          )}
          {currentTab === 'advisor' && <AdvisorTab user={user} />}
          {currentTab === 'dashboard' && (
            <DashboardTab 
              user={user} 
              onLogin={handleLogin} 
              onUpdateUser={handleUpdateUser}
              onTriggerCompare={triggerComparePreset}
            />
          )}
          {currentTab === 'architecture' && <ArchitectureTab />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
