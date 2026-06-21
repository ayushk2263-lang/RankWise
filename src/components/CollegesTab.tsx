import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Trophy, 
  Calendar, 
  Scaling, 
  BadgeIndianRupee, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Shuffle, 
  Bookmark, 
  BookmarkCheck, 
  Building,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  LayoutGrid,
  Globe,
  Compass,
  ZoomIn,
  Navigation,
  Activity
} from 'lucide-react';
import { collegesData, College, getBranchPlacements, getBranchSeats } from '../data/collegeData';
import { UserSession } from '../types';
import FeeCalculator from './FeeCalculator';
import AlumniStoriesWidget from './AlumniStoriesWidget';

interface CollegesTabProps {
  user: UserSession | null;
  onUpdateUser: (updatedUser: Partial<UserSession>) => void;
  onTriggerCompare: (collegeId: string, branchCode: string) => void;
}

function getCollegeProgramsBreakdown(college: any) {
  // Otherwise calculate dynamically from the actual college branches & degrees populated
  let btech = 0;
  let bs = 0;
  let barch = 0;
  let dual = 0;

  college.branches.forEach((b: any) => {
    const code = b.code.toUpperCase();
    const name = b.name.toLowerCase();
    
    // Check if it's B.Arch
    if (code === 'BARCH' || name.includes('architecture')) {
      barch++;
    } 
    // Check if it's B.S. or BS program
    else if (code.startsWith('BS-') || name.includes('bachelor of science') || name.includes('(research)')) {
      bs++;
    } 
    // General B.Tech
    else {
      btech++;
    }

    // Check if branch degrees lists Dual or Integrated M.S./M.Tech
    if (b.degrees && b.degrees.some((d: string) => d.toLowerCase().includes('dual') || d.toLowerCase().includes('integrated') || d.toLowerCase().includes('ms') || d.toLowerCase().includes('split'))) {
      dual++;
    }
  });

  return {
    btech,
    bs,
    barch,
    dual,
    total: btech + bs + barch // unique primary programs
  };
}

function matchesProgramType(
  degrees: string[] | undefined,
  branchName: string,
  branchCode: string,
  programType: 'All' | 'B.Tech' | 'BS' | 'Dual' | 'B.Arch'
): boolean {
  if (programType === 'All') return true;
  
  const target = programType.toLowerCase();
  
  // Normalized degrees to check
  const degreesToCheck = degrees && degrees.length > 0 
    ? degrees.map(d => d.toLowerCase()) 
    : ['b.tech']; // assume B.Tech by default if no degrees populated
    
  if (target === 'b.tech') {
    return degreesToCheck.some(d => d.includes('b.tech') || d.includes('btech') || d.includes('bachelor of technology') || d.includes('b.e.'));
  }
  
  if (target === 'bs') {
    return degreesToCheck.some(d => d.includes('b.s.') || d.includes('bachelor of science') || d.includes('bs') || d.includes('research'));
  }
  
  if (target === 'dual') {
    return degreesToCheck.some(d => d.includes('dual') || d.includes('integrated') || d.includes('5 years') || d.includes('b.tech + m.tech') || d.includes('b.tech + m.s.') || d.includes('m.tech') || d.includes('m.s.'));
  }
  
  if (target === 'b.arch') {
    return branchCode.toUpperCase() === 'BARCH' || branchName.toLowerCase().includes('architecture') || degreesToCheck.some(d => d.includes('b.arch') || d.includes('architecture'));
  }
  
  return true;
}

// Coordinate lookup for all college cities/locations
const locationCoordinates: Record<string, { lat: number; lon: number }> = {
  "kharagpur": { lat: 22.32, lon: 87.31 },
  "mumbai": { lat: 19.07, lon: 72.87 },
  "delhi": { lat: 28.61, lon: 77.21 },
  "narela": { lat: 28.61, lon: 77.21 },
  "chennai": { lat: 13.08, lon: 80.27 },
  "kanpur": { lat: 26.44, lon: 80.33 },
  "roorkee": { lat: 29.85, lon: 77.89 },
  "guwahati": { lat: 26.14, lon: 91.73 },
  "kandi": { lat: 17.38, lon: 78.48 },
  "hyderabad": { lat: 17.38, lon: 78.48 },
  "varanasi": { lat: 25.31, lon: 82.97 },
  "dhanbad": { lat: 23.79, lon: 86.41 },
  "indore": { lat: 22.71, lon: 75.85 },
  "rupnagar": { lat: 30.96, lon: 76.52 },
  "ropar": { lat: 30.96, lon: 76.52 },
  "patna": { lat: 25.59, lon: 85.13 },
  "bhubaneswar": { lat: 20.30, lon: 85.82 },
  "tirupati": { lat: 13.62, lon: 79.41 },
  "palakkad": { lat: 10.78, lon: 76.65 },
  "dharwad": { lat: 15.45, lon: 75.00 },
  "raipur": { lat: 21.25, lon: 81.63 },
  "goa": { lat: 15.49, lon: 73.82 },
  "farmagudi": { lat: 15.49, lon: 73.82 },
  "cuncolim": { lat: 15.49, lon: 73.82 },
  "jodhpur": { lat: 26.23, lon: 73.01 },
  "jaipur": { lat: 26.91, lon: 75.78 },
  "kurukshetra": { lat: 29.96, lon: 76.81 },
  "jamshedpur": { lat: 22.80, lon: 86.20 },
  "durgapur": { lat: 23.50, lon: 87.31 },
  "jalandhar": { lat: 31.32, lon: 75.57 },
  "hamirpur": { lat: 31.68, lon: 76.52 },
  "silchar": { lat: 24.83, lon: 92.77 },
  "srinagar": { lat: 34.08, lon: 74.79 },
  "aizawl": { lat: 23.72, lon: 92.71 },
  "nagaland": { lat: 25.90, lon: 93.72 },
  "chumukedima": { lat: 25.90, lon: 93.72 },
  "imphal": { lat: 24.81, lon: 93.94 },
  "shillong": { lat: 25.57, lon: 91.88 },
  "meghalaya": { lat: 25.57, lon: 91.88 },
  "yupia": { lat: 27.10, lon: 93.60 },
  "arunachal": { lat: 27.10, lon: 93.60 },
  "ravangla": { lat: 27.33, lon: 88.61 },
  "sikkim": { lat: 27.33, lon: 88.61 },
  "karaikal": { lat: 10.92, lon: 79.83 },
  "puducherry": { lat: 10.92, lon: 79.83 },
  "tadepalligudem": { lat: 16.83, lon: 81.53 },
  "howrah": { lat: 22.58, lon: 88.30 },
  "shibpur": { lat: 22.58, lon: 88.30 },
  "pune": { lat: 18.52, lon: 73.85 },
  "ranpur": { lat: 25.18, lon: 75.83 },
  "kota": { lat: 25.18, lon: 75.83 },
  "vadodara": { lat: 22.30, lon: 73.18 },
  "sri city": { lat: 13.55, lon: 80.02 },
  "kalyani": { lat: 22.97, lon: 88.43 },
  "una": { lat: 31.46, lon: 76.27 },
  "sonepat": { lat: 28.98, lon: 77.01 },
  "kottayam": { lat: 9.68, lon: 76.64 },
  "nagpur": { lat: 21.14, lon: 79.08 },
  "ranchi": { lat: 23.34, lon: 85.30 },
  "surat": { lat: 21.17, lon: 72.83 },
  "bhopal": { lat: 23.25, lon: 77.41 },
  "bhagalpur": { lat: 25.24, lon: 86.97 },
  "agartala": { lat: 23.83, lon: 91.28 },
  "raichur": { lat: 16.21, lon: 77.35 },
  "tiruchirappalli": { lat: 10.79, lon: 78.70 },
  "trichy": { lat: 10.79, lon: 78.70 },
  "kurnool": { lat: 15.82, lon: 78.03 },
  "chandigarh": { lat: 30.73, lon: 76.77 },
  "bengaluru": { lat: 12.97, lon: 77.59 },
  "thiruvananthapuram": { lat: 8.52, lon: 76.93 },
  "amethi": { lat: 26.25, lon: 81.40 },
  "jais": { lat: 26.25, lon: 81.40 },
  "prayagraj": { lat: 25.43, lon: 81.84 },
  "allahabad": { lat: 25.43, lon: 81.84 },
  "visakhapatnam": { lat: 17.68, lon: 83.21 },
  "mandi": { lat: 31.72, lon: 76.93 },
  "jammu": { lat: 32.72, lon: 74.85 },
  "gandhinagar": { lat: 23.21, lon: 72.63 },
  "gwalior": { lat: 26.21, lon: 78.17 },
  "jabalpur": { lat: 23.16, lon: 79.98 },
  "lucknow": { lat: 26.84, lon: 80.94 }
};

// Safe lookup return lat/lon
function getCollegeCoordinates(location: string): { lat: number; lon: number } {
  const norm = location.toLowerCase();
  for (const [key, value] of Object.entries(locationCoordinates)) {
    if (norm.includes(key)) {
      return value;
    }
  }
  // Safe region-level state fallbacks
  if (norm.includes("uttarakhand")) return { lat: 30.06, lon: 79.01 };
  if (norm.includes("bihar")) return { lat: 25.59, lon: 85.13 };
  if (norm.includes("assam")) return { lat: 26.14, lon: 91.73 };
  if (norm.includes("telangana")) return { lat: 17.38, lon: 78.48 };
  if (norm.includes("karnataka")) return { lat: 12.97, lon: 77.59 };
  if (norm.includes("maharashtra")) return { lat: 19.07, lon: 72.87 };
  if (norm.includes("west bengal")) return { lat: 22.97, lon: 88.43 };
  return { lat: 20.59, lon: 78.96 }; // Centre of India fallback
}

// India detailed outline borders for custom premium vectors map
const BOUNDARY_POINTS = [
  { lat: 35.5, lon: 74.8 },
  { lat: 37.0, lon: 75.5 },
  { lat: 35.5, lon: 77.5 },
  { lat: 34.0, lon: 78.8 },
  { lat: 32.5, lon: 78.5 },
  { lat: 31.0, lon: 79.0 },
  { lat: 30.1, lon: 80.2 },
  { lat: 28.9, lon: 80.5 },
  { lat: 27.5, lon: 84.0 },
  { lat: 26.6, lon: 88.0 },
  { lat: 28.0, lon: 88.5 },
  { lat: 27.2, lon: 88.8 },
  { lat: 26.8, lon: 90.0 },
  { lat: 27.8, lon: 91.5 },
  { lat: 28.2, lon: 94.0 },
  { lat: 28.3, lon: 96.0 },
  { lat: 27.0, lon: 96.2 },
  { lat: 25.5, lon: 94.5 },
  { lat: 24.2, lon: 93.5 },
  { lat: 22.0, lon: 93.0 },
  { lat: 23.0, lon: 91.8 },
  { lat: 24.3, lon: 91.8 },
  { lat: 25.2, lon: 91.8 },
  { lat: 25.8, lon: 89.8 },
  { lat: 24.0, lon: 88.5 },
  { lat: 22.2, lon: 89.0 },
  { lat: 21.5, lon: 88.0 },
  { lat: 20.2, lon: 86.5 },
  { lat: 17.8, lon: 83.5 },
  { lat: 16.0, lon: 81.0 },
  { lat: 13.5, lon: 80.2 },
  { lat: 10.3, lon: 79.9 },
  { lat: 9.3, lon: 79.1 },
  { lat: 8.1, lon: 77.5 },
  { lat: 9.5, lon: 76.3 },
  { lat: 12.0, lon: 75.3 },
  { lat: 15.0, lon: 73.8 },
  { lat: 19.0, lon: 72.8 },
  { lat: 21.0, lon: 72.5 },
  { lat: 20.8, lon: 70.8 },
  { lat: 22.0, lon: 69.0 },
  { lat: 23.0, lon: 68.5 },
  { lat: 23.8, lon: 68.0 },
  { lat: 24.5, lon: 71.0 },
  { lat: 26.5, lon: 69.8 },
  { lat: 28.5, lon: 72.5 },
  { lat: 31.0, lon: 74.3 },
  { lat: 32.5, lon: 74.3 },
  { lat: 34.5, lon: 73.8 },
  { lat: 35.5, lon: 74.8 }
];

// Linear coordinate projector
function project(lat: number, lon: number, width: number, height: number): { x: number; y: number } {
  const latMin = 6.5;
  const latMax = 37.0;
  const lonMin = 68.0;
  const lonMax = 97.5;
  
  const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
  const y = height - ((lat - latMin) / (latMax - latMin)) * height;
  
  return { x, y };
}

export default function CollegesTab({ user, onUpdateUser, onTriggerCompare }: CollegesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Non-JoSAA' | 'JEE-Adv-Other'>('All');
  const [filterProgramType, setFilterProgramType] = useState<'All' | 'B.Tech' | 'BS' | 'Dual' | 'B.Arch'>('All');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string | null>(null);

  // Collapsible Hierarchy Explorer States
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy' | 'map'>('grid');
  const [expandedColleges, setExpandedColleges] = useState<Record<string, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({}); // key is "collegeId:branchCode"

  // Map Explorer States
  const [mapRegion, setMapRegion] = useState<'all' | 'north' | 'south' | 'east' | 'west'>('all');
  const [hoveredCollegeId, setHoveredCollegeId] = useState<string | null>(null);
  const [inspectedCollegeId, setInspectedCollegeId] = useState<string | null>(null);

  // Cutoff drilling profile sub-filters inside Hierarchy View (prefilled by user's configuration)
  const [hierarchyCategory, setHierarchyCategory] = useState<'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>(
    user?.category || 'OPEN'
  );
  const [hierarchyQuota, setHierarchyQuota] = useState<'HS' | 'OS'>('OS');
  const [hierarchyGender, setHierarchyGender] = useState<'Gender-Neutral' | 'Female-Only'>(
    user?.gender || 'Gender-Neutral'
  );

  const toggleCollege = (collegeId: string) => {
    setExpandedColleges(prev => ({
      ...prev,
      [collegeId]: !prev[collegeId]
    }));
  };

  const toggleBranch = (collegeId: string, branchCode: string) => {
    const key = `${collegeId}:${branchCode}`;
    setExpandedBranches(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAllColleges = () => {
    const keys: Record<string, boolean> = {};
    filteredColleges.forEach(c => {
      keys[c.id] = true;
    });
    setExpandedColleges(keys);
  };

  const collapseAllColleges = () => {
    setExpandedColleges({});
    setExpandedBranches({});
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

  // Find college if detailed view is active
  const activeCollege = collegesData.find(c => c.id === selectedCollegeId);

  // Filter lists
  const filteredColleges = collegesData.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All' || c.type === filterType;
    
    const matchesProgType = filterProgramType === 'All' || c.branches.some(b => 
      matchesProgramType(b.degrees, b.name, b.code, filterProgramType)
    );
    
    return matchesSearch && matchesType && matchesProgType;
  });

  return (
    <div className="space-y-8 animate-fade-in animate-duration-300">
      {activeCollege ? (
        /* Detailed College Page View */
        <div className="space-y-8">
          {/* Back button */}
          <button
            onClick={() => { setSelectedCollegeId(null); setSelectedBranchCode(null); }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to College Catalog</span>
          </button>

          {/* Hero Banner Area */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Building className="w-40 h-40 text-indigo-400 stroke-[1]" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-extrabold uppercase tracking-wide bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  {activeCollege.type}
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-slate-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {activeCollege.location}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {activeCollege.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
                  {activeCollege.shortName} • JoSAA Seating Portal ID: {activeCollege.id}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                {activeCollege.description}
              </p>
            </div>
          </div>

          {/* Grid Layout splits: Facts & Placements vs Branches */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side facts: 4 Columns */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-6">
              {/* Institution Profiles */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Campus Profile
                </h3>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-indigo-405" />
                      NIRF India ranking
                    </span>
                    <span className="font-bold text-indigo-400 font-mono"># {activeCollege.nirfRank}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-405" />
                      Established
                    </span>
                    <span className="font-mono text-white font-semibold">{activeCollege.established}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Scaling className="w-3.5 h-3.5 text-indigo-405" />
                      Campus Area
                    </span>
                    <span className="font-semibold text-white">{activeCollege.campusArea}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-405" />
                      Entrance Requirement
                    </span>
                    <span className="font-semibold text-slate-200 uppercase tracking-wider">{activeCollege.admissionType}</span>
                  </div>
                </div>
              </div>

              {/* Academic Programs Breakdown Sourced from JoSAA/College Websites */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-450" />
                  <span>JoSAA Academic Intake</span>
                </h3>

                {(() => {
                  const breakdown = getCollegeProgramsBreakdown(activeCollege);
                  return (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">B.Tech Programs</span>
                        <span className="font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{breakdown.btech} Offered</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Bachelor of Science (B.S.)</span>
                        <span className="font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">{breakdown.bs} Offered</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Architecture (B.Arch)</span>
                        <span className="font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{breakdown.barch} Offered</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Dual Degree / Integrated</span>
                        <span className="font-bold font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">{breakdown.dual} Offered</span>
                      </div>

                      <div className="bg-white/5 p-2 rounded-xl text-[10px] text-slate-400 border border-white/5 text-center leading-relaxed font-sans">
                        Verified across <strong className="text-slate-300">official JoSAA portals</strong> for counseling accuracy.
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Placement packages breakdown */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <BadgeIndianRupee className="w-4 h-4 text-indigo-450 animate-pulse" />
                    <span>LPA Salary Stats</span>
                  </h3>
                  {selectedBranchCode && (
                    <button
                      onClick={() => setSelectedBranchCode(null)}
                      className="text-[9px] bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-600 px-2 py-0.5 rounded border border-indigo-500/30 transition-all cursor-pointer"
                    >
                      Reset overall
                    </button>
                  )}
                </div>

                {selectedBranchCode ? (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-2.5 rounded-xl text-[10px] text-indigo-300">
                    Inspecting <strong className="text-white">{selectedBranchCode} Specialization</strong>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 bg-black/10 p-2 text-center rounded-xl">
                    Showing overall averages. Click any program branch list card to inspect branch-specific placements.
                  </div>
                )}

                {(() => {
                  const currentPlacements = selectedBranchCode 
                    ? getBranchPlacements(activeCollege, selectedBranchCode) 
                    : activeCollege.placements;

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[8px] block uppercase">Highest</span>
                          <span className="font-extrabold text-white text-[14px]">{currentPlacements.highest}</span>
                          <span className="text-slate-500 block text-[9px] mt-0.5">LPA</span>
                        </div>
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/25">
                          <span className="text-indigo-400 text-[8px] block uppercase font-bold">Average</span>
                          <span className="font-extrabold text-indigo-300 text-[14px]">{currentPlacements.average}</span>
                          <span className="text-indigo-400 block text-[9px] mt-0.5">LPA</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[8px] block uppercase">Median</span>
                          <span className="font-extrabold text-white text-[14px]">{currentPlacements.median}</span>
                          <span className="text-slate-500 block text-[9px] mt-0.5">LPA</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-350 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-white/5">
                        {currentPlacements.description}
                      </p>

                      {/* Major Recruiters */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Key Corporate Recruiters</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(currentPlacements.recruiters || activeCollege.placements.recruiters).map(r => (
                            <span key={r} className="text-[10px] bg-white/5 border border-white/10 text-slate-200 px-2.5 py-0.8 rounded-xl font-medium">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Fee Structure Calculator */}
              <FeeCalculator college={activeCollege} />

              {/* Alumni Success Stories Career Trajectories Widget */}
              <AlumniStoriesWidget 
                collegeId={activeCollege.id} 
                collegeName={activeCollege.name} 
                branches={activeCollege.branches} 
              />
            </div>

            {/* Right side Branches catalog: 8 Columns */}
            <div className="lg:col-span-12 xl:col-span-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              {(() => {
                const visibleBranches = activeCollege.branches.filter(b => 
                  matchesProgramType(b.degrees, b.name, b.code, filterProgramType)
                );
                
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>Offered Engineering programs ({visibleBranches.length} {filterProgramType !== 'All' ? `of ${activeCollege.branches.length}` : ''})</span>
                      </h3>
                    </div>

                    {/* Quick Degree-Type filter within page */}
                    <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 space-y-1.5 shadow-inner">
                      <span className="text-[10px] uppercase font-extrabold text-indigo-305 tracking-wider block font-mono">
                        Isolate Specific Degree Path
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['All', 'B.Tech', 'BS', 'Dual', 'B.Arch'] as const).map(pt => (
                          <button
                            key={pt}
                            onClick={() => setFilterProgramType(pt)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition-all cursor-pointer border ${
                              filterProgramType === pt
                                ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200 shadow-sm'
                                : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {pt === 'All' ? '🎓 All degree paths' : pt === 'B.Tech' ? '⚙️ B.Tech / B.E.' : pt === 'BS' ? '🔬 B.S. (Science)' : pt === 'Dual' ? '⚡ Dual Degree' : '🏛️ B.Arch'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 animate-fade-in">
                      {visibleBranches.length === 0 ? (
                        <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl space-y-2">
                          <p className="text-xs text-slate-400 font-medium">
                            No degrees categorized as <strong className="text-indigo-400">{filterProgramType}</strong> are offered by this institution.
                          </p>
                          <button
                            onClick={() => setFilterProgramType('All')}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold font-sans cursor-pointer"
                          >
                            Reset filter to view all programs
                          </button>
                        </div>
                      ) : (
                        visibleBranches.map(b => {
                          const shortlisted = isShortlisted(activeCollege.id, b.code);
                          const isSelected = selectedBranchCode === b.code;
                          const bPlacements = getBranchPlacements(activeCollege, b.code);
                          return (
                            <div 
                              key={b.code}
                              onClick={() => setSelectedBranchCode(isSelected ? null : b.code)}
                              className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-150 cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600/15 border border-indigo-500/50 shadow-lg shadow-indigo-600/5' 
                                  : 'bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                              }`}
                            >
                              <div>
                                {/* Branch Title & Code */}
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    {b.code}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[9px] text-indigo-400 font-sans font-bold uppercase bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                      Inspecting Stats
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-sans font-bold text-xs text-white mt-1.5">
                                  {b.name}
                                </h4>
                                
                                {/* Degrees Offered for this Branch */}
                                {b.degrees && b.degrees.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {b.degrees.map((deg, idx) => (
                                      <span 
                                        key={idx}
                                        className="text-[9px] font-sans font-medium text-emerald-350 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded"
                                      >
                                        {deg}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Placement Statistics right inside the branch card */}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[10px] text-slate-400 font-mono">
                                  <div>Avg: <strong className="text-indigo-300">{bPlacements.average} LPA</strong></div>
                                  <div className="border-r border-white/5 h-2.5 self-center sm:block hidden"></div>
                                  <div>Highest: <strong className="text-white">{bPlacements.highest} LPA</strong></div>
                                  <div className="border-r border-white/5 h-2.5 self-center sm:block hidden"></div>
                                  <div>Median: <strong className="text-slate-300">{bPlacements.median} LPA</strong></div>
                                </div>
                              </div>

                              {/* Quick action triggers */}
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t border-white/10 sm:border-0 pt-2.5 sm:pt-0">
                                <div className="text-left sm:text-right">
                                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Reference OPEN cutoff</span>
                                  <span className="font-mono text-xs font-semibold text-slate-200"># {b.baseClosingRankOPEN}</span>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTriggerCompare(activeCollege.id, b.code);
                                    }}
                                    title="Add to comparative portal"
                                    className="p-1 px-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-indigo-455 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Shuffle className="w-3 h-3 text-indigo-400" />
                                    <span>Compare</span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleShortlist(activeCollege.id, b.code);
                                    }}
                                    className={`p-1 px-2 rounded-xl border text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                                      shortlisted
                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-450 font-bold font-sans'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-300'
                                    }`}
                                  >
                                    {shortlisted ? (
                                      <BookmarkCheck className="w-3 h-3 text-indigo-405" />
                                    ) : (
                                      <Bookmark className="w-3 h-3 text-slate-405" />
                                    )}
                                    <span className="sm:inline hidden">{shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* College Directory Listing View & Collapsible Hierarchy View */
        <div className="space-y-6">
          <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4 animate-fade-in">
            {/* Top Row: Search & Channels & View Switcher */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campus by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* College channel toggles */}
                <div className="flex flex-wrap bg-white/5 p-1 rounded-xl border border-white/10 gap-1 w-full lg:w-auto">
                  {['All', 'IIT', 'NIT', 'IIIT', 'GFTI', 'Non-JoSAA', 'JEE-Adv-Other'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                        filterType === type 
                          ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/30' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {type === 'All' ? 'All' : type === 'Non-JoSAA' ? 'Non-JoSAA' : type === 'JEE-Adv-Other' ? 'JEE-Adv Other' : `${type}s`}
                    </button>
                  ))}
                </div>

                {/* View Mode Switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1 w-full sm:w-auto font-sans">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid Catalogue</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      viewMode === 'map' 
                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Interactive Map</span>
                  </button>
                  <button
                    onClick={() => setViewMode('hierarchy')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      viewMode === 'hierarchy' 
                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-650/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Hierarchy Explorer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Program-Type / Degree Path filter */}
            <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-xs text-slate-350 font-bold tracking-tight">Filter by Program Type / Degree Path:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'B.Tech', 'BS', 'Dual', 'B.Arch'] as const).map(pt => (
                  <button
                    key={pt}
                    onClick={() => setFilterProgramType(pt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer border ${
                      filterProgramType === pt
                        ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-600/5'
                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pt === 'All' ? '🎓 All Degree Paths' : pt === 'B.Tech' ? '⚙️ B.Tech / B.E.' : pt === 'BS' ? '🔬 B.S. (Science)' : pt === 'Dual' ? '⚡ Dual Degree' : '🏛️ B.Arch (Architecture)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            /* Directory Listings Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.length > 0 ? (
                filteredColleges.map(college => (
                  <div 
                    key={college.id}
                    onClick={() => setSelectedCollegeId(college.id)}
                    className="backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full shadow-xl relative"
                  >
                    <div>
                      {/* Header line */}
                      <div className="flex items-center justify-between text-[10px] mb-3">
                        <span className="font-extrabold uppercase tracking-widest bg-black/40 border border-white/5 text-slate-300 px-2 py-0.5 rounded-lg">
                          {college.type === 'Non-JoSAA' ? 'Non-JoSAA IIIT' : college.type === 'JEE-Adv-Other' ? 'JEE-Adv (Other)' : college.type}
                        </span>
                        <span className="font-mono text-indigo-400 font-bold flex items-center gap-1">
                          NIRF #{college.nirfRank}
                        </span>
                      </div>

                      <h3 className="font-sans font-bold text-sm text-white group-hover:text-indigo-400 transition-all leading-snug">
                        {college.name}
                      </h3>
                      
                      <p className="font-mono text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {college.location}
                      </p>

                      {/* Distinct Degrees */}
                      {(() => {
                        const distinctDegrees = Array.from(new Set(college.branches.flatMap(b => b.degrees || [])));
                        if (distinctDegrees.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {distinctDegrees.map((deg, i) => (
                              <span 
                                key={i}
                                className="text-[9px] font-sans font-semibold text-emerald-350 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                              >
                                {deg}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                        {college.description}
                      </p>
                    </div>

                    {/* Salary Package strip */}
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[9px] block uppercase font-mono">Average pack</span>
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 inline-block mt-0.5">
                          {college.placements.average} LPA
                        </span>
                      </div>

                      <span className="text-[10px] text-indigo-400 group-hover:text-white font-bold flex items-center gap-0.5 transition-all">
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-2xl space-y-3 shadow-xl">
                  <p className="text-xs text-slate-450">No campuses matched the search query filter.</p>
                </div>
              )}
            </div>
          ) : viewMode === 'map' ? (
            /* Combined Interactive Geo-Plotter Map Dashboard */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
              
              {/* Left Pane: Interactive SVG Map (7 Columns) */}
              <div className="lg:col-span-7 flex flex-col backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-3xl relative shadow-2xl overflow-hidden min-h-[500px]">
                
                {/* Header indicators */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 z-10">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Geoplotting Control Center</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Hover nodes to inspect or select institutes. Click map controls to change regional focus.
                    </p>
                  </div>
                  
                  {/* Floating count badge in map */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-indigo-405 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded">
                      {filteredColleges.length} Active Nodes
                    </span>
                  </div>
                </div>

                {/* Map Control Buttons: Zoom to regions */}
                <div className="flex flex-wrap gap-1.5 py-4 z-10">
                  <span className="text-[9px] font-mono uppercase text-slate-400 self-center mr-1">Region Preset:</span>
                  {(['all', 'north', 'south', 'east', 'west'] as const).map(reg => (
                    <button
                      key={reg}
                      onClick={() => setMapRegion(reg)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight transition-all cursor-pointer border ${
                        mapRegion === reg
                          ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-600/5'
                          : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {reg === 'all' ? '🗺️ All India' : reg === 'north' ? '🏔️ North' : reg === 'south' ? '🌴 South' : reg === 'east' ? '⛩️ East' : '🌅 West'}
                    </button>
                  ))}
                </div>

                {/* Interactive SVG Stage Canvas Area */}
                <div className="relative flex-1 flex items-center justify-center p-3 bg-slate-950/20 rounded-2xl border border-white/5 min-h-[460px] select-none">
                  
                  {/* Fine lat/lon background grid coordinate markers */}
                  <div className="absolute top-4 left-4 pointer-events-none font-mono text-[8px] text-slate-500 bg-black/20 rounded px-1.5 py-0.5 border border-white/5 flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SYSTEM ONLINE</span>
                  </div>

                  {/* SVG Map Projection */}
                  {(() => {
                    // Coordinates boundary for active zoom presets
                    let vb = "0 0 500 550";
                    if (mapRegion === 'north') vb = "50 0 380 325";
                    if (mapRegion === 'south') vb = "100 240 320 310";
                    if (mapRegion === 'east') vb = "180 120 320 280";
                    if (mapRegion === 'west') vb = "0 140 320 285";

                    return (
                      <svg
                        viewBox={vb}
                        className="w-full h-full max-h-[500px] transition-all duration-700 ease-out fill-none stroke-none font-sans"
                      >
                        {/* Define glowing filter patterns for gorgeous map nodes */}
                        <defs>
                          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Latitude lines */}
                        {[10, 15, 20, 25, 30, 35].map(lat => {
                          const p1 = project(lat, 68, 500, 550);
                          const p2 = project(lat, 97.5, 500, 550);
                          return (
                            <g key={`lat-${lat}`} className="opacity-15 font-mono">
                              <line
                                x1={p1.x}
                                y1={p1.y}
                                x2={p2.x}
                                y2={p2.y}
                                stroke="#6366f1"
                                strokeWidth="0.5"
                                strokeDasharray="3,3"
                              />
                              <text
                                x="10"
                                y={p1.y - 3}
                                fill="#818cf8"
                                className="text-[7px]"
                                stroke="none"
                              >
                                {lat}° N
                              </text>
                            </g>
                          );
                        })}

                        {/* Longitude lines */}
                        {[70, 75, 80, 85, 90, 95].map(lon => {
                          const p1 = project(6.5, lon, 500, 550);
                          const p2 = project(37, lon, 500, 550);
                          return (
                            <g key={`lon-${lon}`} className="opacity-15 font-mono">
                              <line
                                x1={p1.x}
                                y1={p1.y}
                                x2={p2.x}
                                y2={p2.y}
                                stroke="#6366f1"
                                strokeWidth="0.5"
                                strokeDasharray="3,3"
                              />
                              <text
                                x={p1.x - 10}
                                y="540"
                                fill="#818cf8"
                                className="text-[7px]"
                                stroke="none"
                              >
                                {lon}° E
                              </text>
                            </g>
                          );
                        })}

                        {/* Main India schematic land boundary */}
                        {(() => {
                          const pointsStr = BOUNDARY_POINTS.map(p => {
                            const { x, y } = project(p.lat, p.lon, 500, 550);
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <polygon
                              points={pointsStr}
                              className="fill-indigo-950/10 stroke-indigo-550/30 hover:stroke-indigo-455/55 transition-all duration-500"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          );
                        })()}

                        {/* Selected College Connection Indicator */}
                        {(() => {
                          const activeCol = filteredColleges.find(c => c.id === inspectedCollegeId || c.id === hoveredCollegeId);
                          if (!activeCol) return null;
                          const coords = getCollegeCoordinates(activeCol.location);
                          const p = project(coords.lat, coords.lon, 500, 550);

                          return (
                            <g>
                              {/* Radial indicator rings radiating from selected node */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="18"
                                className="stroke-indigo-400/25 stroke-[1]"
                                fill="none"
                                strokeDasharray="4,2"
                              />
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="28"
                                className="stroke-indigo-500/10 stroke-[0.5]"
                                fill="none"
                              />
                            </g>
                          );
                        })()}

                        {/* Individual College Plotted Nodes */}
                        {filteredColleges.map(college => {
                          const coords = getCollegeCoordinates(college.location);
                          const p = project(coords.lat, coords.lon, 500, 550);
                          const isHovered = hoveredCollegeId === college.id;
                          const isInspected = inspectedCollegeId === college.id;
                          const isSelectedOrHovered = isHovered || isInspected;

                          // Color schemes
                          let pinColor = 'fill-indigo-400 stroke-indigo-350 text-indigo-405 border-none';
                          let glowColor = 'rgba(99, 102, 241, 0.45)';
                          if (college.type === 'IIT') {
                            pinColor = 'fill-amber-400 stroke-amber-300 text-amber-400 border-none';
                            glowColor = 'rgba(245, 158, 11, 0.5)';
                          } else if (college.type === 'NIT') {
                            pinColor = 'fill-blue-400 stroke-blue-300 text-blue-405 border-none';
                            glowColor = 'rgba(59, 130, 246, 0.5)';
                          } else if (college.type === 'IIIT' || college.type === 'Non-JoSAA') {
                            pinColor = 'fill-emerald-400 stroke-emerald-305 text-emerald-405 border-none';
                            glowColor = 'rgba(16, 185, 129, 0.5)';
                          }

                          return (
                            <g
                              key={college.id}
                              onMouseEnter={() => setHoveredCollegeId(college.id)}
                              onMouseLeave={() => setHoveredCollegeId(null)}
                              onClick={() => setInspectedCollegeId(college.id)}
                              className="cursor-pointer"
                            >
                              {/* Dynamic glowing ripple rings behind college node */}
                              {isSelectedOrHovered && (
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="9"
                                  className="stroke-none"
                                  fill={glowColor}
                                />
                              )}
                              
                              {/* Small central core marker node */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={isSelectedOrHovered ? "5.5" : "3.5"}
                                className={`${pinColor} transition-all duration-250`}
                                filter="url(#nodeGlow)"
                              />

                              {/* Hover tooltip banner layer floating slightly above mark */}
                              {isHovered && (
                                <g className="pointer-events-none z-50">
                                  {/* Tooltip Background Card */}
                                  <rect
                                    x={p.x - 70}
                                    y={p.y - 25}
                                    width="140"
                                    height="18"
                                    rx="4"
                                    fill="rgba(15, 23, 42, 0.95)"
                                    stroke="rgba(255, 255, 255, 0.15)"
                                    strokeWidth="0.7"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 13}
                                    fill="#ffffff"
                                    textAnchor="middle"
                                    className="font-sans font-extrabold text-[7.5px]"
                                    stroke="none"
                                  >
                                    {college.shortName} (NIRF #{college.nirfRank})
                                  </text>
                                </g>
                              )}

                              {/* Wider interactive hotzone circle to ease clicking node */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="12"
                                className="fill-transparent stroke-none"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Right Pane: College Detail Inspector & Search Index List (5 Columns) */}
              <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
                
                {/* 1. Selected Node Inspector Panel */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-3xl relative shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-5 opacity-5">
                    <Building className="w-20 h-20 text-indigo-400 stroke-[1]" />
                  </div>

                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Institute Inspector</span>
                  </h3>

                  {(() => {
                    const selectedCollege = filteredColleges.find(c => c.id === inspectedCollegeId) || 
                                           filteredColleges.find(c => c.id === hoveredCollegeId) ||
                                           filteredColleges[0];

                    if (!selectedCollege) {
                      return (
                        <div className="py-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl">
                          <Compass className="w-8 h-8 text-slate-500 mx-auto opacity-30 stroke-[1.5] mb-2" />
                          <p className="text-xs text-slate-400 font-semibold">No institutes found matching current filters.</p>
                          <p className="text-[10px] text-slate-500 mt-1">Try resetting the College type search headers.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4 relative z-10">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold">
                            <span className="uppercase bg-indigo-505/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                              {selectedCollege.type === 'Non-JoSAA' ? 'Non-JoSAA IIIT' : selectedCollege.type === 'JEE-Adv-Other' ? 'JEE-Adv' : selectedCollege.type}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              NIRF #{selectedCollege.nirfRank}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 font-mono">Est. {selectedCollege.established}</span>
                          </div>

                          <h4 className="text-base font-extrabold text-white mt-2 leading-tight">
                            {selectedCollege.name}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-405 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-405" />
                            {selectedCollege.location}
                          </p>
                        </div>

                        <p className="text-xs text-slate-350 leading-relaxed line-clamp-3 bg-black/20 p-3 rounded-xl border border-white/5">
                          {selectedCollege.description}
                        </p>

                        {/* Mini Quick Fact Strip */}
                        <div className="grid grid-cols-2 gap-3.5 pt-1">
                          {/* Average placements info */}
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                            <span className="text-[8px] font-mono uppercase text-slate-455 block">Average Placement</span>
                            <span className="font-mono text-xs font-extrabold text-indigo-400 mt-0.5 block">{selectedCollege.placements.average} LPA</span>
                          </div>
                          {/* Highest placements info */}
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                            <span className="text-[8px] font-mono uppercase text-slate-455 block">Highest Package</span>
                            <span className="font-mono text-xs font-extrabold text-emerald-400 mt-0.5 block">{selectedCollege.placements.highest} LPA</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <button
                            onClick={() => setSelectedCollegeId(selectedCollege.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all py-2.5 px-3 rounded-xl cursor-pointer"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Explore Cutoffs & Admission</span>
                          </button>
                          
                          <button
                            onClick={() => onTriggerCompare(selectedCollege.id, selectedCollege.branches?.[0]?.code || 'CSE')}
                            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-350 hover:text-indigo-200 hover:bg-indigo-500/10 bg-white/5 border border-white/10 hover:border-indigo-500/30 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span className="sm:inline">Compare</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Interactive quick index of active colleges */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-3xl relative shadow-xl flex-1 flex flex-col max-h-[350px]">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5 font-mono">
                    <span>Institutes Directory ({filteredColleges.length})</span>
                  </h3>
                  
                  {/* Scrollable list matching exact map nodes */}
                  <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map(college => {
                        const isSelected = inspectedCollegeId === college.id;
                        return (
                          <div
                            key={college.id}
                            onClick={() => {
                              setInspectedCollegeId(college.id);
                              // Smooth zoom mapping focus depending on college type
                              if (college.location.includes("Srinagar") || college.location.includes("Jammu") || college.location.includes("Mandi") || college.location.includes("Roorkee") || college.location.includes("Delhi")) {
                                setMapRegion('north');
                              } else if (college.location.includes("Chennai") || college.location.includes("Tiruchirappalli") || college.location.includes("Surathkal") || college.location.includes("Warangal") || college.location.includes("Hyderabad") || college.location.includes("Calicut")) {
                                setMapRegion('south');
                              } else if (college.location.includes("Kharagpur") || college.location.includes("Guwahati") || college.location.includes("Silchar") || college.location.includes("Agartala") || college.location.includes("Rourkela")) {
                                setMapRegion('east');
                              } else if (college.location.includes("Mumbai") || college.location.includes("Surat") || college.location.includes("Bhopal") || college.location.includes("Gandhinagar")) {
                                setMapRegion('west');
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? 'bg-indigo-650/20 border-indigo-500/45 text-white shadow-md'
                                : 'bg-white/[0.02] border-white/5 text-slate-350 hover:bg-white/[0.06] hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-slate-400">
                                  {college.shortName}
                                </span>
                                <span className="text-[8px] font-mono text-slate-500">NIRF rank: #{college.nirfRank}</span>
                              </div>
                              <h5 className="font-sans font-bold text-xs truncate max-w-[210px] sm:max-w-xs">{college.name}</h5>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[8px] font-mono uppercase text-slate-400 block leading-none">Placement Avg</span>
                              <span className="font-mono text-xs font-extrabold text-indigo-400 mt-1 block leading-none">{college.placements.average} LPA</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-450">No campuses matched the search parameters.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsible Hierarchy Explorer View */
            <div className="space-y-6">
              {/* Global drilling controls */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                      <span>Cutoff Exploration Settings</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Configure Category, Quotas, and Gender parameters to inspect specific historical opening and closing cutoff brackets below.
                    </p>
                  </div>
                  
                  {/* Action triggers */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={expandAllColleges}
                      className="flex-1 sm:flex-none text-[10px] bg-indigo-500/10 hover:bg-indigo-600 hover:text-white hover:border-indigo-650 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all cursor-pointer font-semibold"
                    >
                      Expand All ({filteredColleges.length})
                    </button>
                    <button
                      onClick={collapseAllColleges}
                      className="flex-1 sm:flex-none text-[10px] bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all cursor-pointer font-semibold"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {/* Category chip selectors */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-indigo-305 uppercase tracking-wider mb-2 font-mono">
                      Category Seat Pool
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {(['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setHierarchyCategory(cat)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-tight transition-all cursor-pointer ${
                            hierarchyCategory === cat
                              ? 'bg-indigo-650/45 border border-indigo-500/50 text-indigo-200'
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quota choices */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-indigo-305 uppercase tracking-wider mb-2 font-mono">
                      NIT/IIIT State Quota
                    </label>
                    <div className="flex gap-1">
                      {(['OS', 'HS'] as const).map(qt => (
                        <button
                          key={qt}
                          onClick={() => setHierarchyQuota(qt)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-tight transition-all cursor-pointer ${
                            hierarchyQuota === qt
                              ? 'bg-indigo-650/45 border border-indigo-500/50 text-indigo-200'
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {qt === 'OS' ? 'OS (Other State)' : 'HS (Home State)'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1.5 font-mono">
                      * IIT category matches dynamically default to AI (All India) quota rules.
                    </p>
                  </div>

                  {/* Gender pool selector */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-indigo-305 uppercase tracking-wider mb-2 font-mono">
                      Gender Allocation Pool
                    </label>
                    <div className="flex gap-1">
                      {(['Gender-Neutral', 'Female-Only'] as const).map(gd => (
                        <button
                          key={gd}
                          onClick={() => setHierarchyGender(gd)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-tight transition-all cursor-pointer ${
                            hierarchyGender === gd
                              ? 'bg-indigo-650/45 border border-indigo-500/50 text-indigo-200'
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {gd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Hierarchy Cards List */}
              <div className="space-y-4">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college) => {
                    const isExpanded = !!expandedColleges[college.id];
                    return (
                      <div 
                        key={college.id}
                        className={`backdrop-blur-md rounded-2xl border overflow-hidden transition-all duration-300 ${
                          isExpanded 
                            ? 'bg-[#0f172a]/60 border-indigo-500/30' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* College Header row */}
                        <div 
                          onClick={() => toggleCollege(college.id)}
                          className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none border-b border-transparent"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-350 shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-[9px] uppercase tracking-wider bg-black/40 border border-white/5 text-indigo-300 px-2 py-0.5 rounded">
                                  {college.type}
                                </span>
                                <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                  NIRF #{college.nirfRank}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">Estd {college.established}</span>
                              </div>

                              <h4 className="font-sans font-bold text-sm text-white mt-1.5">
                                {college.name} <span className="text-xs text-indigo-450 font-mono font-bold">({college.shortName})</span>
                              </h4>

                              <p className="font-mono text-[9px] text-slate-400 mt-1 flex items-center gap-1 uppercase tracking-wide">
                                <MapPin className="w-3 h-3 text-indigo-400" />
                                {college.location}
                              </p>
                            </div>
                          </div>

                          {/* Quick Stats Block for Right header area */}
                          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto border-t border-white/5 md:border-t-0 pt-3 md:pt-0 justify-between md:justify-end">
                            <div className="text-left md:text-right">
                              <span className="text-slate-400 text-[8px] block uppercase font-mono">Placements average</span>
                              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 inline-block mt-0.5">
                                {college.placements.average} LPA
                              </span>
                            </div>

                            <div className="text-left md:text-right">
                              <span className="text-slate-400 text-[8px] block uppercase font-mono">Academic Branches</span>
                              <span className="font-mono text-xs font-bold text-slate-305 bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/5 inline-block mt-0.5">
                                {(() => {
                                  const matchingCount = college.branches.filter(b => 
                                    matchesProgramType(b.degrees, b.name, b.code, filterProgramType)
                                  ).length;
                                  return filterProgramType !== 'All' 
                                    ? `${matchingCount} matches`
                                    : `${college.branches.length} Programs`;
                                })()}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCollegeId(college.id);
                              }}
                              className="px-3 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 hover:text-white text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-md cursor-pointer"
                            >
                              <span>Inspect Campus</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible programs (branches) listing inside college block */}
                        {isExpanded && (
                          <div className="bg-[#0b101d]/60 border-t border-white/10 p-5 space-y-4">
                            <div className="flex items-center justify-between text-[11px] text-slate-450 border-b border-white/5 pb-2">
                              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Academic disciplines hierarchy</span>
                              </span>
                              <span className="text-xs text-indigo-400 font-semibold font-mono sm:block hidden">
                                Filtering: {hierarchyCategory} ({college.type === 'IIT' ? 'AI' : hierarchyQuota}) • {hierarchyGender}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {(() => {
                                const visibleBranches = college.branches.filter(b => 
                                  matchesProgramType(b.degrees, b.name, b.code, filterProgramType)
                                );
                                
                                if (visibleBranches.length === 0) {
                                  return (
                                    <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                                      <p className="text-[10px] text-slate-400 font-semibold">
                                        No departments matching the selected degree path of <strong className="text-indigo-400">{filterProgramType}</strong> are offered in this branch directory.
                                      </p>
                                    </div>
                                  );
                                }
                                
                                return visibleBranches.map((b) => {
                                  const bKey = `${college.id}:${b.code}`;
                                const isBranchExpanded = !!expandedBranches[bKey];
                                const shortlisted = isShortlisted(college.id, b.code);
                                const bPlacements = getBranchPlacements(college, b.code);

                                // Query matched historical cutoffs
                                const matchedQuota = college.type === 'IIT' ? 'AI' : hierarchyQuota;
                                const filteredCutoffs = b.cutoffs?.filter(
                                  c => c.category === hierarchyCategory &&
                                       c.quota === matchedQuota &&
                                       c.gender === hierarchyGender
                                ) || [];

                                // Sort from latest to oldest
                                const sortedCutoffs = [...filteredCutoffs].sort((x, y) => y.year - x.year);

                                return (
                                  <div 
                                    key={b.code}
                                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                      isBranchExpanded 
                                        ? 'bg-[#1e293b]/50 border-indigo-500/40' 
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    {/* Branch Item row */}
                                    <div 
                                      onClick={() => toggleBranch(college.id, b.code)}
                                      className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-305 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                            {b.code}
                                          </span>
                                          <span className="font-bold text-xs text-white">
                                            {b.name}
                                          </span>
                                          {b.degrees && b.degrees.map((deg, ix) => (
                                            <span 
                                              key={ix}
                                              className="text-[8px] font-sans font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full"
                                            >
                                              {deg}
                                            </span>
                                          ))}
                                          <span className="text-[8px] font-mono font-bold text-amber-305 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                            🎟️ {getBranchSeats(college, b.code)} Seats
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9px] text-slate-400 font-mono">
                                          <div>Avg placement: <strong className="text-emerald-400">{bPlacements.average} LPA</strong></div>
                                          <div className="text-slate-750">•</div>
                                          <div>Highest offer: <strong className="text-slate-205">{bPlacements.highest} LPA</strong></div>
                                          <div className="text-slate-750">•</div>
                                          <div>Seat Intake: <strong className="text-amber-305">{getBranchSeats(college, b.code)} seats</strong></div>
                                          <div className="text-slate-750">•</div>
                                          <div>Baseline CRL Closing code: <strong className="text-indigo-400"># {b.baseClosingRankOPEN}</strong></div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-0 pt-2.5 sm:pt-0 shrink-0">
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onTriggerCompare(college.id, b.code);
                                            }}
                                            title="Add to comparator portal"
                                            className="p-1 px-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:text-white text-slate-350 text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                                          >
                                            <Shuffle className="w-2.5 h-2.5 text-indigo-400" />
                                            <span>Compare</span>
                                          </button>

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleShortlist(college.id, b.code);
                                            }}
                                            className={`p-1 px-2 rounded-lg border text-[9px] flex items-center gap-1 transition-all cursor-pointer ${
                                              shortlisted
                                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-205'
                                            }`}
                                          >
                                            {shortlisted ? (
                                              <BookmarkCheck className="w-2.5 h-2.5 text-indigo-405" />
                                            ) : (
                                              <Bookmark className="w-2.5 h-2.5 text-slate-405" />
                                            )}
                                            <span>{shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                                          </button>
                                        </div>

                                        <div className={`p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 transition-colors ${
                                          isBranchExpanded ? 'rotate-180 bg-indigo-500/10 text-indigo-405 border-indigo-500/20' : ''
                                        }`}>
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Embedded 5-Year Cutoff Ranges Drill Down Display */}
                                    {isBranchExpanded && (
                                      <div className="bg-[#030712]/75 border-t border-white/5 p-4 space-y-4 font-sans text-slate-300">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                          <div>
                                            <span className="text-[9px] font-bold text-indigo-305 uppercase tracking-widest font-mono">
                                              Historical Admissions Drift (2021 - 2025)
                                            </span>
                                            <p className="text-[10px] text-slate-450 mt-0.5">
                                              Showing cutoff boundaries of the final allotment rounds for category <strong className="text-indigo-400">{hierarchyCategory}</strong>, quota <strong className="text-indigo-400">{matchedQuota}</strong>, gender <strong className="text-indigo-400">{hierarchyGender}</strong>.
                                            </p>
                                          </div>
                                          <div className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-350 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                                            {college.type === 'IIT' ? 'JoSAA Round 6 Equivalency' : 'CSAB Special Spot R3'}
                                          </div>
                                        </div>

                                        {/* Dynamic Seat Intake Capacity & Context alert */}
                                        <div className="flex flex-col md:flex-row gap-3 items-stretch bg-indigo-950/20 border border-indigo-500/15 p-3.5 rounded-xl shadow-inner text-slate-300">
                                          <div className="flex items-center gap-2.5 shrink-0">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">
                                              🎟️
                                            </div>
                                            <div>
                                              <span className="text-[8.5px] text-slate-450 block font-mono uppercase tracking-wide leading-none">Total Seat Capacity</span>
                                              <span className="text-xs font-bold text-white font-mono flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                                <span className="text-amber-300 text-sm font-black">{getBranchSeats(college, b.code)}</span> 
                                                <span>Annual Open Intake</span>
                                              </span>
                                            </div>
                                          </div>
                                          <div className="hidden md:block w-px bg-white/5 self-stretch"></div>
                                          <div className="flex-1 flex items-center">
                                            <p className="text-[10px] text-slate-400 leading-normal">
                                              <strong className="text-indigo-305 font-semibold">Probability Cushion:</strong> A larger seat buffer of <strong className="text-amber-300 font-mono font-bold">{getBranchSeats(college, b.code)} seats</strong> increases ranks tolerance bandwidth. This widens the absolute entry-to-cutoff margin, keeping predicted cutoff predictability stable over JoSAA counselling allocation rounds.
                                            </p>
                                          </div>
                                        </div>

                                        {sortedCutoffs.length > 0 ? (
                                          <div className="space-y-2.5">
                                            {sortedCutoffs.map((cutoff) => {
                                              const isLatest = cutoff.year === 2025;
                                              const selectiveBracketRange = Math.max(1, cutoff.closingRank - cutoff.openingRank);
                                              
                                              return (
                                                <div 
                                                  key={cutoff.year} 
                                                  className={`p-3 rounded-xl border flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5 hover:bg-white/[0.02] transition-colors ${
                                                    isLatest 
                                                      ? 'bg-indigo-955/20 border-indigo-500/35 shadow-indigo-500/10 shadow-sm' 
                                                      : 'bg-black/40 border-white/5'
                                                  }`}
                                                >
                                                  {/* Year Flag */}
                                                  <div className="flex items-center gap-3 shrink-0">
                                                    <div className="text-center w-12 border-r border-white/5 pr-2">
                                                      <span className="text-xs font-black text-white block font-mono">
                                                        {cutoff.year}
                                                      </span>
                                                      {isLatest && (
                                                        <span className="text-[7.5px] uppercase tracking-wide text-indigo-400 font-extrabold block mt-0.5">
                                                          LATEST
                                                        </span>
                                                      )}
                                                    </div>
                                                    <div>
                                                      <span className="text-[8px] text-slate-455 block uppercase font-mono">Counseling Channel</span>
                                                      <span className="text-[10px] font-semibold text-slate-300 font-mono block">
                                                        {cutoff.counselingRound || (college.type === 'IIT' ? 'JoSAA Round 6' : 'CSAB Special Round 3')}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Visual Slider/Meter representation */}
                                                  <div className="flex-1 md:px-4 flex flex-col justify-center">
                                                    <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-1">
                                                      <span>Opening Allocation: <strong className="text-slate-300"># {cutoff.openingRank.toLocaleString()}</strong></span>
                                                      <span>Closing Cutoff: <strong className="text-indigo-400"># {cutoff.closingRank.toLocaleString()}</strong></span>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
                                                      {/* Elegant representative range band */}
                                                      <div 
                                                        className={`h-full absolute rounded-full ${isLatest ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                                        style={{
                                                          left: '20%',
                                                          width: '60%'
                                                        }}
                                                      ></div>
                                                    </div>

                                                    <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1 flex-wrap gap-1">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span>Seat opening-to-closing size:</span>
                                                        <span className="text-[7.5px] bg-indigo-500/10 text-amber-300 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                                                          {Math.round(selectiveBracketRange / getBranchSeats(college, b.code)).toLocaleString()} ranks/seat density
                                                        </span>
                                                      </div>
                                                      <span className="font-bold text-slate-450">{selectiveBracketRange.toLocaleString()} ranks wide</span>
                                                    </div>
                                                  </div>

                                                  {/* Final Closing Cutoff value block */}
                                                  <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end border-t border-white/5 md:border-0 pt-2.5 md:pt-0 shrink-0">
                                                    <span className="text-[8px] text-slate-455 uppercase tracking-tight font-mono">Closing seat value</span>
                                                    <span className="font-mono text-xs font-black text-indigo-300 block mt-0.5">
                                                      # {cutoff.closingRank.toLocaleString()}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <div className="text-center p-6 bg-black/30 border border-white/5 rounded-xl space-y-1">
                                            <p className="text-xs text-slate-300 font-bold">No historical allocation data for this pool combo.</p>
                                            <p className="text-[10px] text-slate-450 leading-relaxed max-w-lg mx-auto">
                                              This academic category has no allocated seat records at this department. This usually happens under rare/restricted sub-quotas (e.g., ST + Female-Only seats inside specialized branch programs). Try altering Category/Gender filters at the top control bar.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-2xl space-y-3 shadow-xl">
                    <p className="text-xs text-slate-400 font-semibold">No campuses matched the filtered query tree.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
