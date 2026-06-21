import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { LineChart as ChartIcon, HelpCircle, AlertCircle, Info, Landmark, Trophy, ArrowDownUp } from 'lucide-react';
import { collegesData } from '../data/collegeData';
import { CATEGORIES } from '../types';
import { analyzeCutoffTrend } from '../data/trendEngine';

export default function AnalyticsTab() {
  // Local active selectors
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(collegesData[0].id);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('CSE');
  const [category, setCategory] = useState<'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>('OPEN');
  const [quota, setQuota] = useState<'AI' | 'HS' | 'OS'>('AI');
  const [gender, setGender] = useState<'Gender-Neutral' | 'Female-Only'>('Gender-Neutral');

  // Load college and branch
  const college = collegesData.find(c => c.id === selectedCollegeId) || collegesData[0];
  
  // Set default branch if the catalog shifts (e.g. going from IIT to IIIT which lacks mechanical)
  useEffect(() => {
    const branches = college.branches;
    const hasBranch = branches.some(b => b.code === selectedBranchCode);
    if (!hasBranch && branches.length > 0) {
      setSelectedBranchCode(branches[0].code);
    }
  }, [selectedCollegeId, college]);

  // Adjust quota options based on IIT vs NIT/IIIT
  useEffect(() => {
    if (college.type === 'IIT') {
      setQuota('AI');
    } else if (quota === 'AI') {
      setQuota('OS');
    }
  }, [college, quota]);

  const branch = college.branches.find(b => b.code === selectedBranchCode) || college.branches[0];

  // Extract Cutoff points for years
  const getChartData = () => {
    if (!branch || !branch.cutoffs) return [];
    
    const filteredCutoffs = branch.cutoffs.filter(
      c => c.category === category &&
           c.quota === quota &&
           c.gender === gender
    );

    // Sort by year ascending: 2021, 2022, 2023, 2024, 2025
    const remapped = filteredCutoffs.map(c => ({
      year: String(c.year),
      'Closing Rank': c.closingRank,
      'Opening Rank': c.openingRank,
    })).sort((a, b) => Number(a.year) - Number(b.year));

    return remapped;
  };

  const chartData = getChartData();

  const trendSummary = analyzeCutoffTrend(
    selectedCollegeId,
    selectedBranchCode,
    category,
    quota,
    gender
  );

  // Calculate trends
  const calculateChange = () => {
    if (chartData.length < 2) return null;
    const first = chartData[0]['Closing Rank'];
    const last = chartData[chartData.length - 1]['Closing Rank'];
    const diff = last - first;
    const percent = ((diff / first) * 100).toFixed(1);
    return {
      diff,
      percent,
      isIncrease: diff > 0 // in JEE, a positive diff means rank went up (easier to get in, less competitive now)
    };
  };

  const trend = calculateChange();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ChartIcon className="w-6 h-6 text-indigo-400" />
            <span>JoSAA 5-Year Cutoff Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare year-on-year volatility and seat allocation drops for premium branches.
          </p>
        </div>
      </div>

      {/* Selectors Panel */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* College Choice */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1.5">
            College
          </label>
          <select
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            {collegesData.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.shortName} ({c.type})</option>
            ))}
          </select>
        </div>

        {/* Branch Choice */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1.5">
            Specialization Branch
          </label>
          <select
            value={selectedBranchCode}
            onChange={(e) => setSelectedBranchCode(e.target.value)}
            className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            {college.branches.map(b => (
              <option key={b.code} value={b.code} className="bg-slate-900 text-white">{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        {/* Reservation Category */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
            ))}
          </select>
        </div>

        {/* Quota Category */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1.5">
            Seat Quota
          </label>
          <select
            value={quota}
            onChange={(e) => setQuota(e.target.value as any)}
            disabled={college.type === 'IIT'}
            className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {college.type === 'IIT' ? (
              <option value="AI" className="bg-slate-900 text-white">AI (All India)</option>
            ) : (
              <>
                <option value="OS" className="bg-slate-900 text-white">OS (Other State)</option>
                <option value="HS" className="bg-slate-900 text-white">HS (Home State)</option>
              </>
            )}
          </select>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1.5">
            Gender Pool
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="Gender-Neutral" className="bg-slate-900 text-white">Gender-Neutral</option>
            <option value="Female-Only" className="bg-slate-900 text-white">Female-Only</option>
          </select>
        </div>
      </div>

      {/* Main Trends & Technical Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Interactive Recharts Column: 3 Columns */}
        <div className="lg:col-span-3 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl relative min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-200">
                  {college.shortName} <span className="text-slate-500">•</span> {branch ? branch.name : ""}
                </h3>
                <span className="text-slate-400 text-[10px] tracking-wide font-mono uppercase">
                  Closing & Opening Rank Trajectory ({category} - {quota} - {gender})
                </span>
              </div>
            </div>

            {/* Recharts Wrapper */}
            <div className="h-72 w-full mt-2 text-xs font-mono">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#94a3b8" 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b0f19', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#818cf8' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Closing Rank" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ fill: '#ec4899', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Opening Rank" 
                      stroke="#6366f1" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-450 gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-650" />
                  <span>No cutoff data matches the selected configuration filters.</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed flex items-center gap-1.5 border-t border-slate-850 pt-2">
            <Info className="w-3.5 h-3.5 text-slate-450 text-emerald-400 shrink-0" />
            <span>A decreasing closing rank line signifies increasing competition (higher demand) for this institute's branch.</span>
          </p>
        </div>
        {/* Breakdown Panel Column: 1 Column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Trend Analysis Card */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-200 tracking-wider">
                Historical Trend Engine
              </h4>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                Formula-Free
              </span>
            </div>

            {trendSummary ? (
              <div className="space-y-4">
                {/* Trend Direction Badge */}
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">Cutoff Trend Direction</span>
                  <div className={`text-sm font-bold mt-1 ${
                    trendSummary.trendDirection === 'Upward (Easier)' 
                      ? 'text-emerald-400' 
                      : trendSummary.trendDirection === 'Downward (Tighter)' 
                      ? 'text-pink-400' 
                      : 'text-indigo-300'
                  }`}>
                    {trendSummary.trendDirection}
                  </div>
                  <div className="mt-1.5 flex justify-center items-center gap-1">
                    <span className="text-[9px] text-slate-400">Volatility:</span>
                    <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      trendSummary.volatility === 'High' 
                        ? 'text-red-400 bg-red-500/10' 
                        : trendSummary.volatility === 'Medium' 
                        ? 'text-amber-400 bg-amber-500/10' 
                        : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {trendSummary.volatility}
                    </span>
                  </div>
                </div>

                {/* Primary Calculated Metrics */}
                <div className="space-y-2.5">
                  {/* Weighted Recent Average */}
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Weighted Recent Avg</span>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">
                        {trendSummary.weightedRecentAverage.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">
                      Weights (2021-25)
                    </span>
                  </div>

                  {/* Simple 5-Year Average */}
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">5-Year Avg Closing</span>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">
                        {trendSummary.averageClosingRank.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                      N = {trendSummary.availableYearsCount}
                    </span>
                  </div>

                  {/* Inflation / Deflation Shift */}
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-medium">Rank Shift ({trendSummary.availableYears[0]} → 2025)</span>
                      <span className={`text-[10px] font-bold ${
                        trendSummary.percentageRankShift > 0 ? 'text-emerald-400' : 'text-pink-400'
                      }`}>
                        {trendSummary.percentageRankShift > 0 ? 'Deflation' : 'Inflation'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="p-1.5 bg-black/20 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Change</span>
                        <span className={`font-mono text-xs font-bold leading-none ${trendSummary.absoluteRankShift > 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                          {trendSummary.absoluteRankShift > 0 ? '+' : ''}{trendSummary.absoluteRankShift.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-1.5 bg-black/20 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Percent</span>
                        <span className={`font-mono text-xs font-bold leading-none ${trendSummary.percentageRankShift > 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                          {trendSummary.percentageRankShift > 0 ? '+' : ''}{trendSummary.percentageRankShift}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* YoY Highlight if available */}
                {trendSummary.recentYoYChange && (
                  <div className="text-[10px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span>YoY {trendSummary.recentYoYChange.fromYear} ➔ {trendSummary.recentYoYChange.toYear}</span>
                    <span className={`font-mono font-bold ${
                      trendSummary.recentYoYChange.change < 0 ? 'text-pink-400' : 'text-emerald-400'
                    }`}>
                      {trendSummary.recentYoYChange.change > 0 ? '+' : ''}
                      {trendSummary.recentYoYChange.change.toLocaleString()} ({trendSummary.recentYoYChange.percentChange}%)
                    </span>
                  </div>
                )}

                {/* Human/Counselor Advice Note */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-xl text-[11px] leading-relaxed text-indigo-200">
                  <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded w-max text-[9.5px] uppercase tracking-wider">
                    <Info className="w-3 h-3 text-indigo-400" />
                    <span>Counselor Insight</span>
                  </div>
                  {trendSummary.recommendationNote}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <AlertCircle className="w-5 h-5 mx-auto text-slate-500" />
                <p className="text-xs">No matching historical cutoffs.</p>
                <p className="text-[10px] text-slate-500 font-mono">Only actual verified historical values are processed.</p>
              </div>
            )}
          </div>

          {/* Quick Stats Column: Placement details */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Profile</span>
            </h4>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Est. Year</span>
                <span className="font-semibold text-white font-mono">{college.established}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">NIRF rank</span>
                <span className="font-semibold text-indigo-400 font-mono"># {college.nirfRank}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Average Pack</span>
                <span className="font-semibold text-indigo-400 font-mono">{college.placements.average} LPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Size</span>
                <span className="font-semibold text-white">{college.campusArea}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
