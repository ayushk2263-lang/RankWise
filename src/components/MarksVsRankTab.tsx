import React, { useState } from 'react';
import { 
  Award, 
  ChevronRight, 
  HelpCircle, 
  Info, 
  TrendingUp, 
  Calendar, 
  SlidersHorizontal,
  Table,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';
import { 
  mainsHistoricalTrends, 
  advancedHistoricalTrends, 
  predictMainsRank, 
  predictAdvancedRank 
} from '../data/marksRankData';

export default function MarksVsRankTab() {
  const [examType, setExamType] = useState<'mains' | 'advanced'>('mains');
  const [marksInput, setMarksInput] = useState<number>(180);
  const [category, setCategory] = useState<'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>('OPEN');
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const mainsMaxMarks = 300;
  const advancedMaxMarks = 360;
  const currentMax = examType === 'mains' ? mainsMaxMarks : advancedMaxMarks;

  // Handle input boundary corrections safely
  const handleMarksChange = (val: string) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
      setMarksInput(0);
      return;
    }
    const safeVal = Math.min(currentMax, Math.max(0, parsed));
    setMarksInput(safeVal);
  };

  // Run real-time prediction
  const mainsPrediction = predictMainsRank(marksInput, category, selectedYear);
  const advancedPrediction = predictAdvancedRank(marksInput, category, selectedYear);

  // Load trend definitions for charts and tables
  const mainsEntries = mainsHistoricalTrends[selectedYear] || mainsHistoricalTrends[2025];
  const advancedEntries = advancedHistoricalTrends[selectedYear] || advancedHistoricalTrends[2025];

  // Helper to resolve category specific rank key
  const getCatKey = (): 'rankCRL' | 'rankObc' | 'rankSc' | 'rankSt' | 'rankEws' => {
    if (category === 'OBC-NCL') return 'rankObc';
    if (category === 'SC') return 'rankSc';
    if (category === 'ST') return 'rankSt';
    if (category === 'EWS') return 'rankEws';
    return 'rankCRL';
  };

  const currentCatKey = getCatKey();

  // Formulate data points for Charting (Sorted by marks ascending)
  const chartData = (examType === 'mains' ? mainsEntries : advancedEntries)
    .map(entry => ({
      marks: entry.marks,
      rank: entry[currentCatKey],
      percentile: 'percentile' in entry ? (entry as any).percentile : undefined
    }))
    .sort((a, b) => a.marks - b.marks);

  // Year meta explanation descriptions
  const getYearExplanation = () => {
    if (examType === 'mains') {
      if (selectedYear === 2024) {
        return "2024 was historically a high-scoring year. Easy-to-moderate shifts in exam sessions combined with an unprecedented candidate surge (14+ Lakhs) meant that individuals needed higher raw marks to secure standard percentiles/ranks.";
      }
      if (selectedYear === 2022) {
        return "2022 was a low-scoring, highly difficult year. Moderate-tough sessions meant lower marks (e.g. 175/300) yielded outstanding 99.1+ percentiles, making it a very favorable year for core engineering candidates.";
      }
      if (selectedYear === 2023) {
        return "2023 followed a balanced difficulty bell curve with standard, stable rank outcomes matching official seat allocations.";
      }
      return "2025 predictions incorporate early trends with moderate difficulty benchmarks and realistic candidate volumes for JoSAA forecasting.";
    } else {
      if (selectedYear === 2022) {
        return "2022 Advanced had one of the toughest papers in IIT history. Extremely low raw marks (only 50% score) yielded top AIR 300 ranks. Standard qualifying cutoffs were very low.";
      }
      if (selectedYear === 2023) {
        return "2023 was high-scoring due to approachable physics and mathematics sections. Candidates required high scores to retain leading ranks.";
      }
      if (selectedYear === 2024) {
        return "2024 Advanced witnessed intense preparation and higher score density around middle ranks (120-180 marks range).";
      }
      return "2025 features moderate-tough calibrated projections based on IIT trends.";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            <span>Marks vs Rank vs Percentile Insights</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare previous years' official trends and convert your raw scores into predicted CRL & Category ranks.
          </p>
        </div>
      </div>

      {/* Main Switchers and Input Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selection Variables Widget */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Parameters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-505/20 rounded-full font-bold uppercase">
                {examType === 'mains' ? 'JEE Main' : 'JEE Adv'}
              </span>
            </div>

            {/* Exam selection toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Exam Category</label>
              <div className="grid grid-cols-2 bg-[#0c1221] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => { setExamType('mains'); setMarksInput(180); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examType === 'mains'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JEE Main
                </button>
                <button
                  type="button"
                  onClick={() => { setExamType('advanced'); setMarksInput(170); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    examType === 'advanced'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JEE Advanced
                </button>
              </div>
            </div>

            {/* Raw Marks input with slide */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Enter Raw Marks</label>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Max: <span className="text-indigo-400">{currentMax}</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={currentMax}
                  value={marksInput === 0 ? '' : marksInput}
                  onChange={(e) => handleMarksChange(e.target.value)}
                  className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono font-bold"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-mono">MARKS</span>
              </div>
              <input
                type="range"
                min="10"
                max={currentMax}
                value={marksInput}
                onChange={(e) => setMarksInput(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quota Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#080c16] border border-white/10 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer font-semibold"
              >
                <option value="OPEN">General (CRL)</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>

            {/* Selected Trend Year Toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historical Trend Reference</label>
              <div className="grid grid-cols-4 bg-[#0c1221] p-1 rounded-xl border border-white/5 gap-1">
                {[2025, 2024, 2023, 2022].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedYear === year
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="bg-indigo-950/15 border border-indigo-500/20 rounded-xl p-3 mt-4 text-[11px] text-slate-300 flex gap-2.5 items-start leading-relaxed shadow-inner">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">{selectedYear} Paper Difficulty:</span>
              <span>{getYearExplanation()}</span>
            </div>
          </div>
        </div>

        {/* Prediction Results Board */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Predicted Percentile (Main only) */}
            {examType === 'mains' && (
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 block mb-1">Predicted Percentile</span>
                <p className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
                  {mainsPrediction.percentile}%
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 mt-3 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Based on {selectedYear} statistics</span>
                </div>
              </div>
            )}

            {/* Predicted CRL Rank */}
            <div className={`backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${examType !== 'mains' ? 'md:col-span-1.5' : ''}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 block mb-1">Predicted CRL Rank</span>
              <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                #{examType === 'mains' ? mainsPrediction.rankCRL.toLocaleString() : advancedPrediction.rankCRL.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-450 mt-3 font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Common Rank List AIR position</span>
              </div>
            </div>

            {/* Predicted Category Rank */}
            <div className={`backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all duration-300 ${examType !== 'mains' ? 'md:col-span-1.5' : ''}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-colors" />
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 block mb-1">Category Rank ({category})</span>
              <p className="text-3xl font-black text-pink-400 font-mono tracking-tight">
                #{examType === 'mains' ? mainsPrediction.categoryRank.toLocaleString() : advancedPrediction.categoryRank.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-450 mt-3 font-medium">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>For choice locking eligibility</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div>
                <span className="text-xs font-bold text-white block">Difficulty Curve (Marks vs. Rank)</span>
                <span className="text-[10px] text-slate-400">Y-Axis represents Ranks (Lower is better). Highlight lines show where your target stands.</span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-semibold uppercase">{category}</span>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-56 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="marks" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    label={{ value: 'Raw Marks Obtained', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    reversed 
                    tickLine={false}
                    label={{ value: 'AIR position (Reversed)', angle: -95, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8', fontSize: '11px' }}
                    formatter={(value: any) => [`Rank: #${Number(value).toLocaleString()}`]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rank" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorRank)" 
                  />
                  {/* Reference indicator line for user's marks inputs */}
                  <ReferenceLine 
                    x={marksInput} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: `Your Score (${marksInput})`, fill: '#10b981', fontSize: 10, position: 'top' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Historical Trend Lookups Grid Table */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {selectedYear} Verified Reference Catalog ({examType === 'mains' ? 'JEE Mains' : 'JEE Advanced'})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            Showing all comparative nodes for category is {category}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-450 uppercase font-bold tracking-wider font-mono text-left">
                <th className="py-2 px-3">Raw Marks</th>
                <th className="py-2 px-3">Percentage Score</th>
                {examType === 'mains' && <th className="py-2 px-3">Percentile Target</th>}
                <th className="py-2 px-3">CRL AIR Rank</th>
                <th className="py-2 px-3">Category AIR Rank ({category})</th>
                <th className="py-2 px-3 text-right">Action Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(examType === 'mains' ? mainsHistoricalTrends[selectedYear] : advancedHistoricalTrends[selectedYear]).map((item, index) => {
                const percentage = 'percentPercentage' in item 
                  ? `${(item as any).percentPercentage}%` 
                  : `${((item.marks / 300) * 100).toFixed(1)}%`;
                
                const rankCRL = item.rankCRL;
                const catField = getCategoryKey(category);
                const categoryRank = (item as any)[catField] as number;

                // Check if current row represents the bracket of user's marks
                const isSelectedBracket = marksInput >= item.marks && (index === 0 || marksInput < (examType === 'mains' ? mainsHistoricalTrends[selectedYear][index-1].marks : advancedHistoricalTrends[selectedYear][index-1].marks));

                return (
                  <tr 
                    key={index} 
                    className={`transition-colors duration-150 ${
                      isSelectedBracket 
                        ? 'bg-indigo-500/10 text-white font-semibold' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-xs font-bold text-indigo-300">
                      {item.marks} <span className="text-[9px] text-slate-500">marks</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{percentage}</td>
                    {examType === 'mains' && (
                      <td className="py-3 px-3 text-indigo-400 font-bold font-mono">
                        {(item as any).percentile}%
                      </td>
                    )}
                    <td className="py-3 px-3 font-bold font-mono">
                      #{rankCRL.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-pink-400 font-bold font-mono">
                      #{categoryRank.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setMarksInput(item.marks)}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          isSelectedBracket
                            ? 'bg-indigo-505/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        Try score
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getCategoryKey(cat: string): 'rankCRL' | 'rankObc' | 'rankSc' | 'rankSt' | 'rankEws' {
  if (cat === 'OBC-NCL') return 'rankObc';
  if (cat === 'SC') return 'rankSc';
  if (cat === 'ST') return 'rankSt';
  if (cat === 'EWS') return 'rankEws';
  return 'rankCRL';
}
