import React, { useState } from 'react';
import { 
  TrendingUp, 
  LineChart, 
  Briefcase, 
  GraduationCap, 
  Lightbulb, 
  ChevronsRight, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Search
} from 'lucide-react';
import { careerTrendsData, CareerTrend } from '../data/careerTrendsData';

export default function CareerPredictorPanel() {
  const [selectedCode, setSelectedCode] = useState<string>('AI/ML');
  const [horizonYear, setHorizonYear] = useState<2026 | 2030>(2030);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareCodeA, setCompareCodeA] = useState<string>('AI/ML');
  const [compareCodeB, setCompareCodeB] = useState<string>('MECH');

  const currentTrend = careerTrendsData.find(t => t.branchCode === selectedCode) || careerTrendsData[0];
  const compareTrendA = careerTrendsData.find(t => t.branchCode === compareCodeA) || careerTrendsData[0];
  const compareTrendB = careerTrendsData.find(t => t.branchCode === compareCodeB) || careerTrendsData[1];

  // Colors based on branch scores/types
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Tech & AI': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'Semiconductors & Circuits': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Automotive & Core Tech': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getDemandBadgeColor = (demand: string) => {
    switch(demand) {
      case 'Skyrocketing': return 'bg-rose-500/10 border-rose-500/30 text-rose-350';
      case 'Exceptional': return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-350';
      case 'Steady Growth': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-350';
      default: return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl relative space-y-4 font-sans text-slate-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-white">Branch Career Path Predictor</h3>
            <p className="text-[10px] text-slate-400">Past alumni trends & projected macroeconomic growth pipelines.</p>
          </div>
        </div>
        
        {/* Toggle Compare mode */}
        <button
          type="button"
          onClick={() => setCompareMode(!compareMode)}
          className={`text-[9px] uppercase tracking-wider font-mono font-bold py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
            compareMode 
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-250'
          }`}
        >
          {compareMode ? 'Single View' : '⚖️ Compare Branches'}
        </button>
      </div>

      {!compareMode ? (
        // --- SINGLE DETAILED PREVIEW WINDOW ---
        <div className="space-y-4">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Branch Selector */}
            <div className="flex-1 space-y-1">
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">Focus Program:</label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 hover:border-white/20 text-xs text-white rounded-xl p-2 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-serif"
              >
                {careerTrendsData.map((t) => (
                  <option key={t.branchCode} value={t.branchCode} className="bg-slate-900 text-slate-200">
                    {t.branchCode} - {t.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Horizon Year Selector */}
            <div className="sm:w-36 space-y-1">
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">Growth Lens:</label>
              <div className="grid grid-cols-2 bg-black/30 border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setHorizonYear(2026)}
                  className={`text-[10.5px] font-mono py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    horizonYear === 2026 
                      ? 'bg-indigo-650/20 text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  2026
                </button>
                <button
                  type="button"
                  onClick={() => setHorizonYear(2030)}
                  className={`text-[10.5px] font-mono py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    horizonYear === 2030 
                      ? 'bg-indigo-650/20 text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  2030
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono block">Ecosystem Growth</span>
              <div className="flex items-baseline justify-center gap-1.5 mt-1">
                <span className="text-base font-black text-white font-mono leading-none">
                  {horizonYear === 2026 ? currentTrend.growthScore2026.toFixed(1) : currentTrend.growthScore2030.toFixed(1)}
                </span>
                <span className="text-[8px] text-slate-500 font-mono">/10</span>
              </div>
              <span className={`text-[7bp] text-[8px] px-1 px-1.5 rounded-full font-mono mt-1 inline-block uppercase font-bold ${
                currentTrend.growthScore2030 >= currentTrend.growthScore2026
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-amber-400 bg-amber-500/10'
              }`}>
                {(currentTrend.growthScore2030 - currentTrend.growthScore2026) >= 0 ? '📈 Upward' : '📉 Optimizing'}
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono block">Intl Demand</span>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border inline-block ${getDemandBadgeColor(currentTrend.marketDemand)}`}>
                  {currentTrend.marketDemand}
                </span>
              </div>
              <span className="text-[7.5px] text-slate-500 mt-1.5 block">Market Signal</span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono block">Core Retention</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-1">
                <span className="text-base font-black text-indigo-400 font-mono leading-none">
                  {currentTrend.coreRetentionRate}%
                </span>
              </div>
              <span className="text-[7.5px] text-slate-500 mt-1 block leading-none">Stay in pure vertical</span>
            </div>
          </div>

          {/* Salary Ceiling and Trajectory Bars */}
          <div className="bg-black/35 border border-white/5 rounded-xl p-3.5 space-y-2.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block">10-Year Career Trajectory Potential</span>
            
            <div className="space-y-2 text-xs">
              {/* Avg Starting package */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400 font-sans">Avg Campus Starting Package</span>
                  <span className="text-indigo-300 font-bold">{currentTrend.averageStartingLPA} LPA</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (currentTrend.averageStartingLPA / 120) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* 10-Yr package Ceiling */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400 font-sans">Projected Mid-Career Ceiling</span>
                  <span className="text-violet-300 font-bold">{currentTrend.tenYearCeilingLPA} LPA</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (currentTrend.tenYearCeilingLPA / 125) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal font-sans pt-1">
              *Mid-career ceiling quantifies average base packages of top 12% alumni leading systemic engineering/startup divisions 10 years post-convocation.
            </p>
          </div>

          {/* Qualitative analysis box */}
          <div className="space-y-1 text-xs">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Prospective Structural Outlook</span>
            <p className="text-[11px] text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 px-3 py-2.5 rounded-xl italic">
              "{currentTrend.prospectAnalysis}"
            </p>
          </div>

          {/* Primary drivers & Emerging Roles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-xs">
              <span className="text-[9.5px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Key Drivers ({horizonYear}):</span>
              <ul className="space-y-1 pl-1">
                {currentTrend.primaryDrivers.slice(0, 3).map((driver, idx) => (
                  <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1 leading-normal">
                    <span className="text-indigo-400 font-black shrink-0">→</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[9.5px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Evolving Designations:</span>
              <div className="flex flex-wrap gap-1">
                {currentTrend.emergingRoles.slice(0, 3).map((role, idx) => (
                  <span key={idx} className="text-[9px] bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-indigo-350 px-1.5 py-0.5 rounded font-mono block w-full truncate leading-normal" title={role}>
                    🛠️ {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- SIDE-BY-SIDE COMPARE VIEW WINDOW ---
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block mb-1">Branch Alpha:</label>
              <select
                value={compareCodeA}
                onChange={(e) => setCompareCodeA(e.target.value)}
                className="w-full bg-black/40 border border-white/10 hover:border-white/20 text-[10.5px] text-white rounded-lg p-1.5 focus:outline-none focus:border-indigo-505 cursor-pointer font-serif"
              >
                {careerTrendsData.map((t) => (
                  <option key={t.branchCode} value={t.branchCode} className="bg-slate-900 text-slate-200">
                    {t.branchCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold block mb-1">Branch Beta:</label>
              <select
                value={compareCodeB}
                onChange={(e) => setCompareCodeB(e.target.value)}
                className="w-full bg-black/40 border border-white/10 hover:border-white/20 text-[10.5px] text-white rounded-lg p-1.5 focus:outline-none focus:border-indigo-505 cursor-pointer font-serif"
              >
                {careerTrendsData.map((t) => (
                  <option key={t.branchCode} value={t.branchCode} className="bg-slate-900 text-slate-200">
                    {t.branchCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact comparison stats table */}
          <div className="bg-black/35 border border-white/5 rounded-xl overflow-hidden text-[10.5px]">
            <div className="grid grid-cols-3 bg-white/5 p-2 font-mono text-[9px] text-slate-450 uppercase tracking-wider border-b border-white/5">
              <span>Dimension</span>
              <span className="text-center text-indigo-400 font-bold">{compareTrendA.branchCode}</span>
              <span className="text-center text-amber-400 font-bold">{compareTrendB.branchCode}</span>
            </div>

            <div className="divide-y divide-white/5">
              {/* Category row */}
              <div className="grid grid-cols-3 p-2 items-center">
                <span className="text-slate-400">Vertical Group</span>
                <span className="text-center truncate text-[9.5px] text-slate-300">{compareTrendA.category}</span>
                <span className="text-center truncate text-[9.5px] text-slate-300">{compareTrendB.category}</span>
              </div>

              {/* Present growth score */}
              <div className="grid grid-cols-3 p-2 items-center">
                <span className="text-slate-400">Current Score (0-10)</span>
                <span className="text-center font-bold text-white font-mono">{compareTrendA.growthScore2026.toFixed(1)}</span>
                <span className="text-center font-bold text-white font-mono">{compareTrendB.growthScore2026.toFixed(1)}</span>
              </div>

              {/* 2030 growth projection */}
              <div className="grid grid-cols-3 p-2 items-center bg-indigo-950/10">
                <span className="text-slate-400 font-semibold text-indigo-300">Projected Score (2030)</span>
                <span className="text-center font-bold text-indigo-350 font-mono">{compareTrendA.growthScore2030.toFixed(1)}</span>
                <span className="text-center font-bold text-amber-305 font-mono">{compareTrendB.growthScore2030.toFixed(1)}</span>
              </div>

              {/* Starting Package */}
              <div className="grid grid-cols-3 p-2 items-center">
                <span className="text-slate-400">Avg Campus Start</span>
                <span className="text-center font-bold font-mono text-slate-200">{compareTrendA.averageStartingLPA} LPA</span>
                <span className="text-center font-bold font-mono text-slate-200">{compareTrendB.averageStartingLPA} LPA</span>
              </div>

              {/* Mid-career ceiling */}
              <div className="grid grid-cols-3 p-2 items-center">
                <span className="text-slate-400">10-Yr Peak Ceiling</span>
                <span className="text-center font-extrabold font-mono text-violet-350">{compareTrendA.tenYearCeilingLPA} LPA</span>
                <span className="text-center font-extrabold font-mono text-violet-350">{compareTrendB.tenYearCeilingLPA} LPA</span>
              </div>

              {/* Retention dynamics */}
              <div className="grid grid-cols-3 p-2 items-center">
                <span className="text-slate-400">Domain Retention %</span>
                <span className="text-center font-bold font-mono text-indigo-400">{compareTrendA.coreRetentionRate}%</span>
                <span className="text-center font-bold font-mono text-amber-400">{compareTrendB.coreRetentionRate}%</span>
              </div>
            </div>
          </div>

          {/* Insights comparative blurb */}
          <div className="bg-indigo-950/20 border border-indigo-500/15 p-3 rounded-xl text-[10px] leading-relaxed select-none">
            <span className="font-bold text-white block mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
              Comparative Macro Outlook Advice
            </span>
            <span>
              If choosing <strong className="text-indigo-300">{compareTrendA.branchCode}</strong>, focus early on systems programming, algorithmic foundations, and computational performance models. If choosing <strong className="text-amber-300">{compareTrendB.branchCode}</strong>, keep domain engineering as your bedrock but specialize in automation scripts, physics-informed simulations, and mechatronic design. Over a 10-year period, the career delta is capped principally by individual architectural depth rather than the initial division chosen.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
