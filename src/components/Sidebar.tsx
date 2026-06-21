import React from 'react';
import { 
  Compass, 
  LineChart, 
  BookOpen, 
  Shuffle, 
  MessageSquareCode, 
  FolderGit2, 
  User, 
  Award,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { TabType, UserSession } from '../types';

interface SidebarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  user: UserSession | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Sidebar({ currentTab, setTab, user, onLogout, onOpenLogin }: SidebarProps) {
  const menuItems = [
    { id: 'predictor' as TabType, label: 'Rank Predictor', icon: Compass, badge: 'Hot' },
    { id: 'marks-vs-rank' as TabType, label: 'Marks vs Rank', icon: Award, badge: 'New' },
    { id: 'analytics' as TabType, label: 'JoSAA Analytics', icon: LineChart },
    { id: 'colleges' as TabType, label: 'College Catalog', icon: BookOpen },
    { id: 'compare' as TabType, label: 'Compare Colleges', icon: Shuffle },
    { id: 'advisor' as TabType, label: 'AI Coach (Adviser)', icon: MessageSquareCode, badge: 'AI' },
    { id: 'dashboard' as TabType, label: 'User Dashboard', icon: User },
  ];

  return (
   <aside className="flex w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 flex-col h-screen fixed top-0 left-0 z-20">      {/* App Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <GraduationCap className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-sans font-bold text-lg text-white leading-tight">RankWise</h1>
            <span className="flex h-1.5 w-1.5 relative mt-0.5" title="Offline Caching Enabled (IndexedDB)">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-indigo-400 tracking-wider uppercase font-semibold">AI Predictor</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Admissions Engine
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 group ${
                isActive 
                  ? 'bg-white/10 border border-white/10 text-white shadow-lg shadow-white/5 font-bold' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  item.badge === 'AI' 
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
                    : item.badge === 'Docs'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            
            {/* Quick Stats Indicator */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex justify-between text-[10px]">
              <div>
                <span className="text-slate-400 block font-mono">Exam</span>
                <span className="font-semibold text-white">{user.examType === 'JEE-Advanced' ? 'Adv' : 'Main'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-mono">AIR Rank</span>
                <span className="font-semibold text-indigo-400 font-mono">#{user.rank}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-xs font-semibold text-slate-300 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-[11px] text-slate-400">Save predictions and consult with our AI helper</p>
            <button
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-505/30 hover:border-indigo-500/50 transition-all font-sans cursor-pointer active:scale-98"
            >
              <User className="w-3.5 h-3.5 stroke-[2.5] text-indigo-200" />
              Connect Account
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
