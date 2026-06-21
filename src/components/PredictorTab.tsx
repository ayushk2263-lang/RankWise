import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Compass, 
  Search, 
  Layers, 
  TrendingUp, 
  Bookmark, 
  BookmarkCheck, 
  Shuffle, 
  Info, 
  Flame, 
  CheckCircle, 
  Sparkles,
  MapPin,
  GraduationCap,
  Download
} from 'lucide-react';
import { predictColleges, collegesData, PredictedBranch, getBranchPlacements } from '../data/collegeData';
import { CATEGORIES, INDIAN_STATES, UserSession } from '../types';

interface PredictorTabProps {
  user: UserSession | null;
  onUpdateUser: (updatedUser: Partial<UserSession>) => void;
  onTriggerCompare: (collegeId: string, branchCode: string) => void;
}

export default function PredictorTab({ user, onUpdateUser, onTriggerCompare }: PredictorTabProps) {
  // Setup local states based on current user session (guest fallback)
  const [examType, setExamType] = useState<'JEE-Main' | 'JEE-Advanced'>(
    user?.examType || 'JEE-Advanced'
  );
  const [rank, setRank] = useState<number>(user?.rank || 2500);
  const [category, setCategory] = useState<'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>(
    user?.category || 'OPEN'
  );
  const [gender, setGender] = useState<'Gender-Neutral' | 'Female-Only'>(
    user?.gender || 'Gender-Neutral'
  );
  const [homeState, setHomeState] = useState<string>(
    user?.homeState || 'Maharashtra'
  );
  const [referenceYear, setReferenceYear] = useState<number>(2025);

  const [predictions, setPredictions] = useState<PredictedBranch[]>([]);
  const [filterType, setFilterType] = useState<'All' | 'Dream' | 'Target' | 'Safe'>('All');
  const [collegeTypeFilter, setCollegeTypeFilter] = useState<'All' | 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Non-JoSAA' | 'JEE-Adv-Other'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Handle predictions whenever parameters change
  useEffect(() => {
    const results = predictColleges({
      rank: Number(rank) || 0,
      category,
      gender,
      homeState,
      examType,
      referenceYear
    });
    setPredictions(results);
  }, [rank, category, gender, homeState, examType, referenceYear]);

  // Sync user values if user logs in or updates
  useEffect(() => {
    if (user) {
      setExamType(user.examType);
      setRank(user.rank);
      setCategory(user.category);
      setGender(user.gender);
      setHomeState(user.homeState);
    }
  }, [user]);

  // Save current parameters to active dashboard
  const handleApplyToDashboard = () => {
    onUpdateUser({
      examType,
      rank: Number(rank),
      category,
      gender,
      homeState
    });
    setSyncFeedback("Parameters synced into session!");
    setTimeout(() => {
      setSyncFeedback(null);
    }, 3000);
  };

  const toggleShortlist = (collegeId: string, branchCode: string) => {
    const token = `${collegeId}:${branchCode}`;
    const currentShortlist = user?.shortlist || [];
    let updated: string[];
    
    if (currentShortlist.includes(token)) {
      updated = currentShortlist.filter(t => t !== token);
    } else {
      updated = [...currentShortlist, token];
    }
    onUpdateUser({ shortlist: updated });
  };

  const isShortlisted = (collegeId: string, branchCode: string) => {
    const token = `${collegeId}:${branchCode}`;
    return user?.shortlist?.includes(token) || false;
  };

  // Filter predictions based on UI selects
  const filteredPredictions = predictions.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      item.collegeName.toLowerCase().includes(query) ||
      item.collegeShortName.toLowerCase().includes(query) ||
      item.collegeType.toLowerCase().includes(query) ||
      item.branchName.toLowerCase().includes(query) ||
      item.branchCode.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);
    
    const matchesFilterType = filterType === 'All' || item.recommendationType === filterType;
    const matchesCollegeType = collegeTypeFilter === 'All' || item.collegeType === collegeTypeFilter;
    return matchesSearch && matchesFilterType && matchesCollegeType;
  });

  // Category counts (dynamically filtered by selected college type for active feedback, or total)
  const countDream = predictions.filter(p => (collegeTypeFilter === 'All' || p.collegeType === collegeTypeFilter) && p.recommendationType === 'Dream').length;
  const countTarget = predictions.filter(p => (collegeTypeFilter === 'All' || p.collegeType === collegeTypeFilter) && p.recommendationType === 'Target').length;
  const countSafe = predictions.filter(p => (collegeTypeFilter === 'All' || p.collegeType === collegeTypeFilter) && p.recommendationType === 'Safe').length;

  const countIIT = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'IIT').length;
  const countNIT = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'NIT').length;
  const countIIIT = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'IIIT').length;
  const countGFTI = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'GFTI').length;
  const countNonJosaa = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'Non-JoSAA').length;
  const countJeeAdvOther = predictions.filter(p => (filterType === 'All' || p.recommendationType === filterType) && p.collegeType === 'JEE-Adv-Other').length;

  const generatePdfReport = () => {
    const doc = new jsPDF();
    let y = 15;

    // Helper for adding new pages of details
    const checkPageSpace = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        
        // Print page header
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Admission Analytics & College Matching Strategic Brief", 15, 10);
        doc.setDrawColor(220, 224, 230);
        doc.line(15, 12, 195, 12);
        
        y = 20;
      }
    };

    // Print prime header
    doc.setFillColor(30, 41, 59); // Dark blue / gray banner
    doc.rect(15, y, 180, 24, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("JEE COLLEGE PREDICTOR & PLACEMENTS REPORT", 20, y + 9);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text("Personalized seat matching, historical cutoffs & placement strategic brief", 20, y + 16);
    
    y += 30;

    // Candidate Profile Summary Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y, 180, 32, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("CANDIDATE ADMISSION PROFILE", 20, y + 7);

    // Profile left column
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`JEE Exam Channel: `, 20, y + 14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(examType === 'JEE-Advanced' ? 'JEE Advanced (IIT Matcher)' : 'JEE Main (NIT / IIIT Matcher)', 52, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Candidate Rank: `, 20, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text(`# ${rank || 'N/A'}`, 52, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Category / Seat Pool: `, 20, y + 26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${category}  |  ${gender}`, 52, y + 26);

    // Profile right column
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Home State Quota: `, 115, y + 14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(examType === 'JEE-Advanced' ? 'None (IIT National Pool)' : homeState, 145, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Cutoff Base Year: `, 115, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${referenceYear}`, 145, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Matched Options: `, 115, y + 26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${filteredPredictions.length} Programs`, 145, y + 26);

    y += 40;

    // Section header: Top Recommendations
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("RECOMMENDED OPTIONS STRATEGIC ANALYSIS", 15, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y + 2, 195, y + 2);
    
    y += 10;

    // Display top 10 recommended colleges to keep report elegant and highly descriptive
    const reportData = filteredPredictions.slice(0, 10);
    
    if (reportData.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("No predicted colleges match your selected filters. Please adjust matching settings.", 15, y + 10);
      y += 20;
    } else {
      reportData.forEach((pred, index) => {
        // Find corresponding college object from collegesData to query full metadata and branch placements
        const col = collegesData.find(c => c.id === pred.collegeId);
        const branchPlacement = col ? getBranchPlacements(col, pred.branchCode) : null;
        
        // Check page overflow space before writing this card block (needs ~46mm)
        checkPageSpace(46);
        
        // Outer box for college card
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.rect(15, y, 180, 42, "FD");

        // Vertical bracket highlighting bar on the left
        let colorBar: [number, number, number] = [100, 116, 139]; // Slate gray for safe
        if (pred.recommendationType === 'Dream') colorBar = [219, 39, 119]; // pink-600
        if (pred.recommendationType === 'Target') colorBar = [79, 70, 229]; // indigo-600
        
        doc.setFillColor(...colorBar);
        doc.rect(15, y, 2.5, 42, "F");

        // College Short Name and Bracket Type
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. ${pred.collegeName}`, 20, y + 5);
        
        // Brackets indicator
        doc.setFillColor(...colorBar);
        doc.rect(195 - 28, y + 2.5, 24, 4.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(pred.recommendationType.toUpperCase(), 195 - 26, y + 5.7);

        // Branch Details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(67, 56, 202); // indigo-700
        doc.text(`${pred.branchName} (${pred.branchCode})`, 20, y + 11.5);

        // Metadata: Location, NIRF, established
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Location: ${pred.location}    |    NIRF Rank: #${pred.nirfRank}    |    Established: ${col?.established || 'N/A'}`, 25, y + 16.5);

        // Sub divider
        doc.setDrawColor(241, 245, 249);
        doc.line(20, y + 19.5, 190, y + 19.5);

        // HISTORICAL CUTOFF TRENDS (left pane inside college entry)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text("Historical Closing Cutoff Trend:", 20, y + 24.5);

        // Fetch cutoff trends
        const branchObj = col?.branches.find(b => b.code === pred.branchCode);
        const cutoffs = branchObj?.cutoffs || [];
        
        // Create an array of target years to query
        const yearsList = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
        let yearsString = "";
        
        yearsList.forEach((yr) => {
          const matchCutoff = cutoffs.find(
            c => c.year === yr &&
                 c.category === category &&
                 c.quota === pred.quotaUsed &&
                 c.gender === gender
          );
          if (matchCutoff) {
            yearsString += `${yr}: #${matchCutoff.closingRank}   `;
          }
        });
        
        if (!yearsString.trim()) {
          // fallback if explicit mapping is empty
          yearsString = `2025: #${pred.closingRank2025}`;
        }

        doc.setFont("helvetica", "mono");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(yearsString.trim(), 20, y + 29);

        // PLACEMENT STATS ANALYSIS (right pane inside college entry)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Branch-Specific Placement Profile:", 20, y + 34);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        
        const avgPkg = branchPlacement?.average ? `${branchPlacement.average} LPA` : `${pred.placementAverage} LPA`;
        const highestPkg = branchPlacement?.highest ? `${branchPlacement.highest} LPA` : `${col?.placements.highest} LPA`;
        const recruitersList = branchPlacement?.recruiters ? branchPlacement.recruiters.slice(0, 5).join(', ') : '';
        
        doc.text(`Avg Package: `, 20, y + 38.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(avgPkg, 37, y + 38.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Highest Package: `, 60, y + 38.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(highestPkg, 82, y + 38.5);

        if (recruitersList) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(`Top Recruiters: `, 110, y + 38.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(recruitersList.substring(0, 40), 130, y + 38.5);
        }

        y += 42 + 4; // Card height plus spacing
      });
      
      // If there are more predicted recommended colleges, append a note
      if (filteredPredictions.length > 10) {
        checkPageSpace(15);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`* Report highlights top 10 recommended streams. Additional ${filteredPredictions.length - 10} options are accessible within your interactive application table.`, 15, y + 5);
        y += 12;
      }
    }

    // Section: Strategy Recommendations Disclaimer
    checkPageSpace(30);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("ADMISSION COUNSELING STRATEGY GUIDELINE:", 15, y);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    
    const disclaimerLines = [
      "1. DREAM choices should be entered at the very top of your JoSAA / CSAB online lock-in checklist.",
      "2. TARGET choices must make up the core (middle section) of your list, as they offer the highest probability of placement success.",
      "3. SAFE selections should be added on the lower half to prevent state-wide seat redundancy or complete lack of allocation.",
      "Disclaimer: Ranks are based on extrapolative modeling from JoSAA and CSAB official cutoff reports and are intended for advisory guidance only."
    ];
    
    disclaimerLines.forEach((line, index) => {
      doc.text(line, 15, y + 4 + (index * 3));
    });

    // Make file download dynamic matching candidate AIR
    doc.save(`JEE_Seat_Predictor_Report_AIR_${rank || 'candidate'}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Visual Header */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <GraduationCap className="w-40 h-40 text-indigo-400 stroke-[1]" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Admission & Seat drift analyzer active</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Trend-Aware Seat Allocation Predictor
          </h2>
          <p className="text-sm text-slate-350 mt-2 leading-relaxed">
            Predicting matches using <strong className="text-indigo-300 font-mono">JoSAA Round 6 Closing Ranks</strong> for IITs and <strong className="text-indigo-300 font-mono">CSAB Special Round 3</strong> ranks for NITs & IIITs, incorporating the latest counselor trends and brand trade-offs.
          </p>
        </div>
      </div>

      {/* Inputs Panels & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Parameters Form: 5 Columns */}
        <div className="lg:col-span-12 xl:col-span-5 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Matching Parameters</span>
            </h3>
            <div className="flex items-center gap-2">
              {syncFeedback && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                  {syncFeedback}
                </span>
              )}
              {user && (
                <button 
                  onClick={handleApplyToDashboard}
                  className="text-[11px] font-semibold text-indigo-350 hover:text-white transition-all bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl cursor-pointer"
                >
                  Sync with Account
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Exam Type Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Predictor Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExamType('JEE-Advanced')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    examType === 'JEE-Advanced' 
                      ? 'bg-indigo-600 text-white border-indigo-505 shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  JEE Advanced (IITs)
                </button>
                <button
                  type="button"
                  onClick={() => setExamType('JEE-Main')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    examType === 'JEE-Main' 
                      ? 'bg-indigo-600 text-white border-indigo-505 shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  JEE Main (NITs/IIITs)
                </button>
              </div>
            </div>

            {/* Rank input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {category === 'OPEN' ? 'All India (CRL) Rank' : `${category} Category Rank`}
                </label>
                <span className="text-[10px] text-indigo-400 font-semibold font-mono">
                  {examType === 'JEE-Advanced' ? 'JoSAA Rd 6 Target' : 'CSAB Spl R3 Target'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500000"
                  value={rank || ''}
                  onChange={(e) => setRank(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-3 pr-10 py-2.5 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Enter rank..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <span className="text-[10px] font-bold font-mono">AIR</span>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admission Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-405 mt-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Enter your respective Category Rank (not CRL) for matching accuracy.</span>
              </p>
            </div>

            {/* State of Eligibility */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Home State quota
              </label>
              <select
                value={homeState}
                onChange={(e) => setHomeState(e.target.value)}
                disabled={examType === 'JEE-Advanced'}
                className="w-full bg-[#080c16] border border-white/10 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>
                ))}
              </select>
              {examType === 'JEE-Advanced' ? (
                <p className="text-[9px] text-[#475569] mt-1.5 font-mono">
                  * IIT allocations do not implement Home State quotas.
                </p>
              ) : (
                <p className="text-[9px] text-indigo-400 mt-1.5 font-mono">
                  * Activates advantageous 50% state quota for native NIT campuses.
                </p>
              )}
            </div>

            {/* Gender Pool selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gender Seat Pool
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Gender-Neutral')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    gender === 'Gender-Neutral' 
                      ? 'bg-white/10 text-white border-white/20 shadow-inner' 
                      : 'bg-transparent text-slate-455 border-white/10 hover:border-white/20'
                  }`}
                >
                  Gender-Neutral
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female-Only')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    gender === 'Female-Only' 
                      ? 'bg-white/15 text-pink-400 border-white/20 shadow-inner' 
                      : 'bg-transparent text-slate-455 border-white/10 hover:border-white/20'
                  }`}
                >
                  Female-Only
                </button>
              </div>
            </div>

            {/* Counseling Cutoff Reference Year */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cutoff Reference Year
                </label>
                <span className="text-[10px] text-indigo-400 font-bold font-mono">
                  {referenceYear === 2025 ? 'LATEST' : `${referenceYear} Cutoffs`}
                </span>
              </div>
              <select
                value={referenceYear}
                onChange={(e) => setReferenceYear(Number(e.target.value))}
                className="w-full bg-[#080c16] border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                id="reference-year-select"
              >
                <option value="2025" className="bg-slate-900 text-white">2025 (Latest Completed Year)</option>
                <option value="2024" className="bg-slate-900 text-white">2024 (Previous Year)</option>
                <option value="2023" className="bg-slate-900 text-white">2023 (Historical Round)</option>
                <option value="2022" className="bg-slate-900 text-white">2022 (Historical Round)</option>
                <option value="2021" className="bg-slate-900 text-white">2021 (Historical Round)</option>
              </select>
              <p className="text-[9px] text-indigo-405/80 mt-1.5 font-mono leading-normal">
                * Matching utilizes {referenceYear} JoSAA Round 6 closing ranks for IITs and CSAB Special Round 3 for other colleges.
              </p>
            </div>
          </div>

          {/* Quick Informational Stats */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              Available College Pool ({examType === 'JEE-Advanced' ? 'Advanced' : 'Mains'})
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                <span className="text-slate-405 block text-[9px]">IITs</span>
                <span className="font-bold text-white">
                  {collegesData.filter(c => c.type === 'IIT' && c.admissionType === examType).length}
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                <span className="text-slate-405 block text-[9px]">NITs</span>
                <span className="font-bold text-white">
                  {collegesData.filter(c => c.type === 'NIT' && c.admissionType === examType).length}
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-center">
                <span className="text-slate-405 block text-[9px]">IIITs</span>
                <span className="font-bold text-white">
                  {collegesData.filter(c => c.type === 'IIIT' && c.admissionType === examType).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Results Board: 7 Columns */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          {/* Matched Panel Title & Download Report trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <span>Matching Recommendations Range</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Analyzed and ranked based on JoSAA & CSAB admission cutoffs
              </p>
            </div>
            
            <button
              onClick={generatePdfReport}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-95 cursor-pointer self-start sm:self-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Filtering Widgets */}
          <div className="space-y-4 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search colleges (e.g. 'IIT Bombay', 'NIT')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Institution Type filters */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1 w-full md:w-auto overflow-x-auto">
                <span className="text-[10px] text-slate-400 self-center px-2 font-bold uppercase tracking-wider hidden sm:inline">Institution:</span>
                {[
                  { type: 'All', label: 'All', count: predictions.length },
                  { type: 'IIT', label: 'IITs', count: countIIT },
                  { type: 'NIT', label: 'NITs', count: countNIT },
                  { type: 'IIIT', label: 'IIITs', count: countIIIT },
                  { type: 'GFTI', label: 'GFTIs', count: countGFTI },
                  { type: 'Non-JoSAA', label: 'Non-JoSAA', count: countNonJosaa },
                  { type: 'JEE-Adv-Other', label: 'JEE-Adv Other', count: countJeeAdvOther }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setCollegeTypeFilter(item.type as any)}
                    className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      collegeTypeFilter === item.type 
                        ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] px-1 bg-black/30 text-slate-300 rounded font-mono">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Tab filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-white/5 gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prediction Bracket Filters:</span>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1 w-full sm:w-auto overflow-x-auto">
                {[
                  { type: 'All', count: predictions.filter(p => collegeTypeFilter === 'All' || p.collegeType === collegeTypeFilter).length, color: 'text-white' },
                  { type: 'Dream', count: countDream, color: 'text-pink-400' },
                  { type: 'Target', count: countTarget, color: 'text-indigo-400' },
                  { type: 'Safe', count: countSafe, color: 'text-slate-300' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setFilterType(item.type as any)}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      filterType === item.type 
                        ? 'bg-white/10 text-white font-bold border border-white/10 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={item.color}>{item.type}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-black/30 text-slate-300 rounded font-mono">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
            {filteredPredictions.length > 0 ? (
              filteredPredictions.map((predicted, index) => {
                const shortlisted = isShortlisted(predicted.collegeId, predicted.branchCode);
                
                // Color mapping for Dream, Target, Safe badges
                const isDream = predicted.recommendationType === 'Dream';
                const isTarget = predicted.recommendationType === 'Target';
                const isSafe = predicted.recommendationType === 'Safe';

                return (
                  <div 
                    key={`${predicted.collegeId}:${predicted.branchCode}:${predicted.quotaUsed}`}
                    className={`backdrop-blur-md rounded-xl border p-5 transition-all duration-150 relative overflow-hidden group ${
                      isDream 
                        ? 'border-pink-500/20 hover:border-pink-500/40 bg-gradient-to-r from-white/5 to-pink-500/5' 
                        : isTarget 
                        ? 'border-indigo-500/25 hover:border-indigo-500/40 bg-gradient-to-r from-white/5 to-indigo-500/5'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    {/* Corner category highlight bar */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      isDream ? 'bg-pink-500' : isTarget ? 'bg-indigo-500' : 'bg-slate-500'
                    }`} />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        {/* College level, stats badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-slate-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                            {predicted.collegeType === 'Non-JoSAA' ? 'Non-JoSAA IIIT' : predicted.collegeType === 'JEE-Adv-Other' ? 'JEE-Adv (Other)' : predicted.collegeType}
                          </span>
                          <span className="font-mono text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {predicted.location}
                          </span>
                          <span className="text-slate-550">•</span>
                          <span className="text-slate-400 font-semibold font-mono">NIRF #{predicted.nirfRank}</span>
                          {predicted.confidenceLevel && (
                            <>
                              <span className="text-slate-550">•</span>
                              <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] flex items-center gap-1 border ${
                                predicted.confidenceLevel === 'Very High' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : predicted.confidenceLevel === 'High'
                                  ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/15'
                                  : predicted.confidenceLevel === 'Moderate'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              }`}>
                                <span>Confidence: {predicted.confidenceLevel}</span>
                                <span className="opacity-60">({predicted.historicalCoverage} yrs)</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* College and branch name */}
                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                          {predicted.collegeShortName}
                        </h4>
                        <p className="text-xs text-slate-350 font-medium">
                          {predicted.branchName} <span className="text-indigo-400 font-bold font-mono text-[10px]/none bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 ml-1">{predicted.branchCode}</span>
                        </p>
                      </div>

                      {/* Dream / Target / Safe Tag */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right sm:block hidden">
                          <span className="text-[9px] text-indigo-400 block font-bold font-mono tracking-tight uppercase">
                            {predicted.cutoffYear || 2025} Cutoff ({predicted.counselingRound})
                          </span>
                          <span className="font-mono text-xs font-bold text-white"># {predicted.closingRank2025}</span>
                        </div>
                        
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isDream 
                            ? 'bg-pink-500/15 text-pink-400 border border-pink-500/20' 
                            : isTarget
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-700/15 text-slate-300 border border-slate-700/20'
                        }`}>
                          {predicted.recommendationType}
                        </div>
                      </div>
                    </div>                     {/* Stats strip */}
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <div>
                        <span className="text-slate-400 block uppercase font-mono">Counseling Channel</span>
                        <span className="font-semibold text-indigo-400 font-mono block">{predicted.quotaUsed} Quota • {predicted.counselingRound}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-mono text-right sm:text-left">Avg Placements</span>
                        <span className="font-semibold text-indigo-400 font-mono block text-right sm:text-left">{predicted.placementAverage} LPA</span>
                      </div>
                      <div className="text-right sm:text-left">
                        <span className="text-slate-400 block uppercase font-mono">Chance</span>
                        <span className="font-semibold text-slate-200">
                          {isDream ? 'Moderate (25-45%)' : isTarget ? 'High (80-95%)' : 'Guaranteed (100%)'}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end items-center gap-2 pt-2 sm:pt-0">
                        {/* Compare toggle */}
                        <button
                          onClick={() => onTriggerCompare(predicted.collegeId, predicted.branchCode)}
                          title="Compare with other branch"
                          className="p-1 px-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-indigo-400 text-slate-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Shuffle className="w-2.5 h-2.5 text-indigo-400" />
                          <span>Compare</span>
                        </button>

                        {/* Shortlist action */}
                        <button
                          onClick={() => toggleShortlist(predicted.collegeId, predicted.branchCode)}
                          className={`p-1 px-2.5 rounded-xl border text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                            shortlisted
                              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 font-semibold shadow-inner'
                              : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {shortlisted ? (
                            <>
                              <BookmarkCheck className="w-2.5 h-2.5 text-indigo-400" />
                              <span>Shortlisted</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-2.5 h-2.5 text-slate-400" />
                              <span>Shortlist</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-2xl relative space-y-3">
                <div className="mx-auto w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-bold text-sm text-white">No Predicted Program Matched</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Based on JEE cutoffs, no IIT or NIT programs match your registered rank of <span className="font-mono text-indigo-400">#{rank}</span> for the {category} category. Adjust your category pool or try a slightly higher JEE Main choice bracket instead.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
