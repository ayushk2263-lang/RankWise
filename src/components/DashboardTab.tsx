import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings2, 
  BookmarkCheck, 
  Trash2, 
  Shuffle, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  BadgeIndianRupee,
  GraduationCap,
  KeyRound,
  Bell,
  Mail,
  Clock,
  Sliders,
  ShieldCheck,
  HardDrive,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Newspaper,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserSession, CATEGORIES, INDIAN_STATES } from '../types';
import { collegesData } from '../data/collegeData';

const MOCK_NEWS_DATA = [
  {
    id: 1,
    title: "JoSAA 2026 Registration and Choice Filling schedule released",
    source: "JoSAA Official Portal",
    tag: "Schedule",
    date: "June 15, 2026",
    summary: "Choice filling will commence on June 18, 2026, immediately after the declaration of regional JEE Advanced ranks.",
    content: "The Joint Seat Allocation Authority (JoSAA) has released the detailed counseling information brochure and schedule for JoSAA 2026. Online registration, candidate profile verification, and choice-filling for academic programs under IITs, NITs, IIITs, and other GFTIs will begin on June 18, 2026 at 10:00 IST. Candidates are advised to fill as many choices as possible to maximize potential stream entry thresholds on their category ranks.",
    importance: "high"
  },
  {
    id: 2,
    title: "JEE Advanced 2026 results announced; download link active",
    source: "IIT Delhi (Admissions Office)",
    tag: "JEE-Advanced",
    date: "June 14, 2026",
    summary: "Cutoff criteria for inclusion in JoSAA rank list declared. Check subject-wise cutoff scores.",
    content: "IIT Delhi has successfully uploaded the final answer key and candidate rank list for JEE Advanced 2026 on the candidate interface. The overall open category qualifying criteria marks are 35% with minimum of 8.6% of marks in Physics, Chemistry, and Mathematics separately. Category rank sheets have been distributed to JoSAA systems for upcoming seat matrix integration.",
    importance: "high"
  },
  {
    id: 3,
    title: "Revision in seat matrix for newly introduced AI & Robotics branch in NIT Surathkal",
    source: "CSAB / NTA Board",
    tag: "JEE-Main",
    date: "June 12, 2026",
    summary: "40 new co-education seats added for the academic program commencing this winter semester.",
    content: "The Central Seat Allocation Board (CSAB) has approved a curriculum update and seat matrix expansion for National Institute of Technology Karnataka (NITK) Surathkal. A state-of-the-art branch in 'Artificial Intelligence & Robotics' (4-Year B.Tech) is open for seat allocation starting Round 1 of JoSAA 2026, offering 40 co-education seats under both local and home-state quota allotments.",
    importance: "medium"
  },
  {
    id: 4,
    title: "Mandatory Multi-Factor Authentication (MFA) enabled for choice locking",
    source: "National Informatics Centre (NIC)",
    tag: "Official",
    date: "June 10, 2026",
    summary: "Students must verify active email and mobile number to complete registrations.",
    content: "To prevent cyber security threats and unauthorized change of academic branch priority choices, NIC has integrated an dual OTP-based authentication system. Every preference choice locking step and seat allocation confirmation round must be approved with active verification codes.",
    importance: "medium"
  },
  {
    id: 5,
    title: "Physical Document Verification centers finalized for JoSAA 2026 candidate verification",
    source: "JoSAA Secretariat",
    tag: "JoSAA",
    date: "June 08, 2026",
    summary: "Under no circumstances will offline verification be condoned prior to physically reporting.",
    content: "Certificates including Class XII marksheets, JEE Main/Advanced scorecards, medical certificates, and category certificates must be uploaded online during seat acceptance rounds. Physical reporting and double verification will happen at the designated Reporting and Verification Centres (RC/VCs). Check the full list of centers in the official PDF guide.",
    importance: "low"
  }
];

interface DashboardTabProps {
  user: UserSession | null;
  onLogin: (email: string) => Promise<boolean>;
  onUpdateUser: (updatedUser: Partial<UserSession>) => void;
  onTriggerCompare: (collegeId: string, branchCode: string) => void;
}

export default function DashboardTab({ user, onLogin, onUpdateUser, onTriggerCompare }: DashboardTabProps) {
  // News Feed State
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [expandedNewsId, setExpandedNewsId] = useState<number | null>(null);
  const [newsToast, setNewsToast] = useState<string | null>(null);

  useEffect(() => {
    // Synchronize initial news feed loading on mount
    setLoadingNews(true);
    const timer = setTimeout(() => {
      setNews(MOCK_NEWS_DATA);
      setLoadingNews(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshNews = () => {
    setLoadingNews(true);
    setExpandedNewsId(null);
    setTimeout(() => {
      setNews(MOCK_NEWS_DATA);
      setLoadingNews(false);
      setNewsToast("News feed synced with official JoSAA / JEE Portals!");
      setTimeout(() => setNewsToast(null), 3000);
    }, 900);
  };

  // Login fields
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Profile fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editRank, setEditRank] = useState<number>(user?.rank || 2500);
  const [editCategory, setEditCategory] = useState(user?.category || 'OPEN');
  const [editGender, setEditGender] = useState(user?.gender || 'Gender-Neutral');
  const [editState, setEditState] = useState(user?.homeState || 'Maharashtra');
  const [editExam, setEditExam] = useState(user?.examType || 'JEE-Advanced');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Email Notification Preference fields
  const [alertsEnabled, setAlertsEnabled] = useState(user?.emailAlertsEnabled ?? false);
  const [alertOnCutoffs, setAlertOnCutoffs] = useState(user?.alertOnCutoffChange ?? true);
  const [alertOnPlacements, setAlertOnPlacements] = useState(user?.alertOnPlacementUpdate ?? false);
  const [alertFreq, setAlertFreq] = useState<'immediate' | 'daily' | 'weekly'>(user?.alertFrequency ?? 'weekly');
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  // IndexedDB Offline State Elements
  const [offlineStatus, setOfflineStatus] = useState<{ initialized: boolean; collegesCached: number; shortlistCount: number; lastUpdated: string | null } | null>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [offlineFeedback, setOfflineFeedback] = useState<string | null>(null);

  // Sync offline database status when user/shortlist changes
  useEffect(() => {
    if (user) {
      import('../lib/offlineDb').then(({ getOfflineStatus }) => {
        getOfflineStatus().then(status => {
          setOfflineStatus(status);
        });
      }).catch(err => console.error("Could not load offline storage utilities:", err));
    }
  }, [user, user?.shortlist]);

  const handleForceOfflineSync = async () => {
    setSyncingOffline(true);
    setOfflineFeedback(null);
    try {
      const { cacheCollegeCatalog, saveOfflineShortlist, getOfflineStatus } = await import('../lib/offlineDb');
      await cacheCollegeCatalog(collegesData);
      if (user?.shortlist) {
        await saveOfflineShortlist(user.shortlist);
      }
      const updatedStatus = await getOfflineStatus();
      setOfflineStatus(updatedStatus);
      setOfflineFeedback('IndexedDB storage optimized and offline database synced!');
      setTimeout(() => setOfflineFeedback(null), 4000);
    } catch (err) {
      setOfflineFeedback('Failed to synchronize local storage.');
      setTimeout(() => setOfflineFeedback(null), 4000);
    } finally {
      setSyncingOffline(false);
    }
  };

  const handleToggleOfflineSimulation = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    if (nextState) {
      setOfflineFeedback('Simulation Mode: Disconnected from network, utilizing local IndexedDB pipeline.');
    } else {
      setOfflineFeedback('Network connectivity re-established successfully.');
    }
    setTimeout(() => setOfflineFeedback(null), 4000);
  };

  // Sync preference state reactively
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditRank(user.rank || 2500);
      setEditCategory(user.category || 'OPEN');
      setEditGender(user.gender || 'Gender-Neutral');
      setEditState(user.homeState || 'Maharashtra');
      setEditExam(user.examType || 'JEE-Advanced');
      
      setAlertsEnabled(user.emailAlertsEnabled ?? false);
      setAlertOnCutoffs(user.alertOnCutoffChange ?? true);
      setAlertOnPlacements(user.alertOnPlacementUpdate ?? false);
      setAlertFreq(user.alertFrequency ?? 'weekly');
    }
  }, [user]);

  const handleUpdateNotifications = async (updatedFields: Partial<UserSession>) => {
    if (!user) return;
    setNotifSaving(true);
    setNotifFeedback(null);
    try {
      onUpdateUser(updatedFields);
      setNotifFeedback('Pref updates synced!');
      setTimeout(() => setNotifFeedback(null), 3505);
    } catch {
      setNotifFeedback('Registration sync offline.');
      setTimeout(() => setNotifFeedback(null), 4005);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleToggleAlerts = (checked: boolean) => {
    setAlertsEnabled(checked);
    handleUpdateNotifications({ emailAlertsEnabled: checked });
  };

  const handleToggleCutoffs = (checked: boolean) => {
    setAlertOnCutoffs(checked);
    handleUpdateNotifications({ alertOnCutoffChange: checked });
  };

  const handleTogglePlacements = (checked: boolean) => {
    setAlertOnPlacements(checked);
    handleUpdateNotifications({ alertOnPlacementUpdate: checked });
  };

  const handleSelectFreq = (freq: 'immediate' | 'daily' | 'weekly') => {
    setAlertFreq(freq);
    handleUpdateNotifications({ alertFrequency: freq });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please input a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const success = await onLogin(email);
      if (!success) {
        setErrorMsg('Failed to log in. Try another account email.');
      }
    } catch {
      setErrorMsg('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      onUpdateUser({
        name: editName,
        rank: Number(editRank),
        category: editCategory as any,
        gender: editGender as any,
        homeState: editState,
        examType: editExam as any
      });
      setFeedback('Admissions profile updated successfully!');
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback('Failed to update credentials.');
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const removeShortlistItem = (collegeId: string, branchCode: string) => {
    const token = `${collegeId}:${branchCode}`;
    const current = user?.shortlist || [];
    const updated = current.filter(t => t !== token);
    onUpdateUser({ shortlist: updated });
  };

  // Extract shortlisted items
  const shortlistedItemsDetailed = (user?.shortlist || []).map(token => {
    const [cId, bCode] = token.split(':');
    const college = collegesData.find(c => c.id === cId);
    const branch = college?.branches.find(b => b.code === bCode);
    return {
      collegeId: cId,
      branchCode: bCode,
      collegeShortName: college?.shortName || cId,
      branchName: branch?.name || bCode,
      averageSalary: college?.placements.average || 0,
      refOpening: branch?.baseClosingRankOPEN || 1000
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {!user ? (
        /* Guest / Authentication form */
        <div className="max-w-md mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-12 animate-fade-in">
          <div className="p-8 border-b border-white/10 text-center space-y-3 bg-white/[0.02]">
            <div className="mx-auto w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Join RankWise admissions portal</h3>
              <p className="text-xs text-slate-400">
                Register or log in with your email to persist shortlists and unlock AI coaching.
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="candidate@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-slate-150 pl-3 pr-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 leading-relaxed font-mono bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                ⚠ {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-550 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 mt-2 flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? 'Consulting security database...' : 'Gain Instant Admissions Access'}
            </button>
          </form>

          <div className="p-4 px-8 border-t border-white/10 bg-white/[0.01]/25 text-[10px] text-slate-500 leading-normal text-center">
            * No password is required for this sandboxed developer instance. Simply provide any mock email (e.g., demo@rankwise.in) to create an account immediately.
          </div>
        </div>
      ) : (
        /* Active Logged-in Dashboard */
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-400" />
              <span>Candidate Dashboard Portal</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyze your shortlist metrics and maintain synchronized JoSAA parameters.
            </p>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#0d1222] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <BookmarkCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Shortlisted Choices</span>
                <span className="block text-xl font-bold font-mono text-white mt-0.5">{shortlistedItemsDetailed.length} Programs</span>
              </div>
            </div>

            <div className="bg-[#0d1222] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <BadgeIndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Max Shortlist Potential</span>
                <span className="block text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {shortlistedItemsDetailed.length > 0 
                    ? `${Math.max(...shortlistedItemsDetailed.map(i => i.averageSalary))} LPA` 
                    : "0.0 LPA"}
                </span>
              </div>
            </div>

            <div className="bg-[#0d1222] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Active Channel</span>
                <span className="block text-xs font-bold uppercase text-slate-200 mt-1 pb-0.5">
                  {user.examType === 'JEE-Advanced' ? 'IIT Channel (Adv)' : 'NIT / IIIT Channel (Main)'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side parameters updates form & Alert Preferences: 5 Columns */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <form onSubmit={handleProfileSave} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 w-full">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span>Adjust Scorecards</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Candidate Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Scorecard channel */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Scorecard Exam
                  </label>
                  <select
                    value={editExam}
                    onChange={(e) => setEditExam(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="JEE-Main" className="bg-slate-900 text-white">JEE Main (predicts NITs and IIITs) </option>
                    <option value="JEE-Advanced" className="bg-slate-900 text-white">JEE Advanced (predicts IITs) </option>
                  </select>
                </div>

                {/* Rank */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Scorecard Category Rank (Round 6 Equiv.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editRank}
                    onChange={(e) => setEditRank(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-2.5 py-2 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Reserved Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>                {/* Native State with quota */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Native State
                  </label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Gender quota
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Gender-Neutral" className="bg-slate-900 text-white">Gender-Neutral</option>
                    <option value="Female-Only" className="bg-slate-900 text-white">Female-Only</option>
                  </select>
                </div>
              </div>

              {feedback && (
                <div className={`p-2.5 rounded-xl text-xs font-mono font-semibold relative text-center border animate-fade-in ${
                  feedback.includes('Failed') 
                    ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' 
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                }`}>
                  {feedback}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-550 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 mt-4 cursor-pointer"
              >
                {saving ? 'Synchronizing...' : 'Save and Update Profile'}
              </button>
            </form>

            {/* Email Alerts & Counseling Notifications settings */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Bell className="w-4 h-4 text-indigo-405 shrink-0" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">Counseling Alert Settings</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Stay updated on cutoff deviations and placement revisions.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Master switch */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-205 block">Email Counseling Alerts</span>
                    <span className="text-[10px] text-slate-450 block font-sans">Receive automated notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsEnabled}
                      onChange={(e) => handleToggleAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {alertsEnabled && (
                  <div className="space-y-3.5 pl-1 animate-fade-in">
                    {/* Alert Options */}
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-350 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          Notify on Cutoff threshold change
                        </span>
                        <input
                          type="checkbox"
                          checked={alertOnCutoffs}
                          onChange={(e) => handleToggleCutoffs(e.target.checked)}
                          className="rounded text-indigo-600 bg-black/50 border-white/10 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-355 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          Notify on verified placement update
                        </span>
                        <input
                          type="checkbox"
                          checked={alertOnPlacements}
                          onChange={(e) => handleTogglePlacements(e.target.checked)}
                          className="rounded text-indigo-600 bg-black/50 border-white/10 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Frequency Selection */}
                    <div className="space-y-2 border-t border-white/5 pt-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block font-mono">
                        Notification Frequency
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 text-center text-[10.5px]">
                        {(['immediate', 'daily', 'weekly'] as const).map(freq => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => handleSelectFreq(freq)}
                            className={`py-1.5 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                              alertFreq === freq
                                ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/30 font-semibold'
                                : 'text-slate-400 hover:text-slate-205'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback line */}
                {notifFeedback && (
                  <div className={`p-2 rounded-xl text-[11px] font-mono font-semibold text-center border animate-fade-in ${
                    notifFeedback.includes('offline') 
                      ? 'bg-rose-500/10 text-rose-455 border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {notifFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* IndexedDB Offline Storage Dashboard Panel */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-white flex items-center gap-1.5">
                    <span>IndexedDB Offline Storage</span>
                    {offlineStatus?.initialized && (
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                        Standby Ready
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Optimized local database caching for seamless disconnected workflow.</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Stats list */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Catalog Cached</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {offlineStatus?.collegesCached || 0} / {collegesData.length}
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5 block">Colleges Offline-Ready</span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Shortlist Saved</span>
                    <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">
                      {offlineStatus?.shortlistCount || 0} Programs
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5 block">IndexedDB Sync Safe</span>
                  </div>
                </div>

                {/* Connection Status Mock / Sim */}
                <div className="flex items-center justify-between bg-black/35 border border-white/5 p-3 rounded-xl">
                  <div>
                    <span className="font-semibold text-slate-200 block">Device Connectivity Mode</span>
                    <span className="text-[10px] text-slate-450 block font-sans">
                      {isSimulatedOffline ? 'Simulating offline (Standalone client)' : 'Live server connectivity: Cloud active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleOfflineSimulation}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isSimulatedOffline
                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-emerald-500/5 border-emerald-500/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
                    }`}
                    title={isSimulatedOffline ? 'Switch to server live' : 'Simulate offline disconnected experience'}
                  >
                    {isSimulatedOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  </button>
                </div>

                {/* Last Sync Timestamp */}
                {offlineStatus?.lastUpdated && (
                  <div className="text-[10px] text-slate-450 flex items-center gap-1.5 justify-center font-mono">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Last catalog backup: {new Date(offlineStatus.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                )}

                {/* Operations */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={syncingOffline}
                    onClick={handleForceOfflineSync}
                    className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-98 disabled:opacity-50 text-white rounded-xl py-2 px-3 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${syncingOffline ? 'animate-spin' : ''}`} />
                    <span>{syncingOffline ? 'Recalibrating...' : 'Optimise Sync DB'}</span>
                  </button>
                </div>

                {offlineFeedback && (
                  <div className={`p-2 rounded-xl text-[10.5px] font-mono font-medium text-center border animate-pulse ${
                    isSimulatedOffline || offlineFeedback.includes('Fail')
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {offlineFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Right side Shortlisted tables list & News Feed: 7 Columns */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              
              {/* Shortlist Card */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                  <span>My Shortlisted Programs ({shortlistedItemsDetailed.length})</span>
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5 animate-fade-in">
                  {shortlistedItemsDetailed.length > 0 ? (
                    shortlistedItemsDetailed.map((item, idx) => (
                      <div 
                        key={`${item.collegeId}:${item.branchCode}:${idx}`}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-white/20 transition-all duration-150"
                      >
                        <div>
                          {/* College short details */}
                          <div className="flex items-center gap-1.5 text-[9px] mb-1">
                            <span className="font-extrabold uppercase tracking-widest text-[#475569] bg-black/40 border border-white/5 px-1.5 py-0.5 rounded">
                              {item.branchCode}
                            </span>
                          </div>
                          <h4 className="font-sans font-bold text-xs text-white">
                            {item.collegeShortName}
                          </h4>
                          <p className="text-[11px] text-slate-300">
                            {item.branchName}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-white/10 sm:border-0 pt-2 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Placements average</span>
                            <span className="font-mono text-xs font-semibold text-indigo-400">{item.averageSalary} LPA</span>
                          </div>

                          <div className="flex gap-1.5">
                            {/* Compare trigger shortcut */}
                            <button
                              onClick={() => onTriggerCompare(item.collegeId, item.branchCode)}
                              title="Cross reference programs side-by-side"
                              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            >
                              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                            </button>

                            {/* Delete shortlist */}
                            <button
                              onClick={() => removeShortlistItem(item.collegeId, item.branchCode)}
                              title="Remove from shortlist"
                              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-rose-900/40 text-slate-400 hover:text-rose-450 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <BookmarkCheck className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <p className="font-bold text-white">Your shortlist is currently empty.</p>
                      <p className="text-[10px] text-slate-450 max-w-xs leading-relaxed">
                        Toggle the shortlist bookmark icon beside colleges in the <strong>Rank Predictor</strong> or <strong>Catalog</strong> to save premium choices here!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* News Feed Card */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-sans font-bold text-sm text-white">
                      JoSAA & JEE Official Portal Updates
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {newsToast && (
                      <span className="text-[10px] text-emerald-400 font-mono animate-fade-in py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        {newsToast}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleRefreshNews}
                      disabled={loadingNews}
                      title="Refresh official portals"
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Tag filters + Search bar row */}
                <div className="space-y-3">
                  {/* Search bar input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search announcements (e.g. 'schedule', 'cutoff', 'MFA')..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
                    {['All', 'Schedule', 'JEE-Advanced', 'JEE-Main', 'Official', 'JoSAA'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag);
                          setExpandedNewsId(null);
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* News items list container */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {loadingNews ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-mono text-center">Syncing securely with official API endpoints...</span>
                    </div>
                  ) : (news.filter(item => {
                    const matchesTag = selectedTag === 'All' || item.tag === selectedTag;
                    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesTag && matchesSearch;
                  })).length > 0 ? (
                    (news.filter(item => {
                      const matchesTag = selectedTag === 'All' || item.tag === selectedTag;
                      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            item.content.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesTag && matchesSearch;
                    })).map((item) => {
                      const isExpanded = expandedNewsId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all duration-200 ${
                            isExpanded 
                              ? 'bg-white/5 border-emerald-500/30' 
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                          }`}
                        >
                          {/* Header metadata row */}
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg font-mono uppercase">
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.date}
                            </span>
                          </div>

                          {/* Title & expand arrow */}
                          <button
                            type="button"
                            onClick={() => setExpandedNewsId(isExpanded ? null : item.id)}
                            className="w-full text-left font-bold text-slate-250 hover:text-emerald-300 text-xs flex justify-between items-start gap-4 transition-colors p-0 border-0 bg-transparent cursor-pointer"
                          >
                            <span className="leading-snug">{item.title}</span>
                            <span className="shrink-0 p-0.5 rounded-md hover:bg-white/5 mt-0.5">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </span>
                          </button>

                          {/* Source annotation */}
                          <div className="text-[10px] text-slate-400 font-medium italic mt-1 font-mono">
                            Source: {item.source}
                          </div>

                          {/* Short Summary */}
                          {!isExpanded && (
                            <p className="text-[11px] text-slate-400 leading-normal mt-2 select-text">
                              {item.summary}
                            </p>
                          )}

                          {/* Long expanded content details */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-300 leading-relaxed space-y-2.5 animate-fade-in font-sans select-text">
                              <p className="font-normal">{item.content}</p>
                              <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5 flex-wrap gap-2 text-[9.5px]">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.importance === 'high' ? 'bg-rose-500 animate-pulse' : item.importance === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                  <span className="capitalize text-slate-400">Level of Importance: {item.importance} priority</span>
                                </div>
                                <a
                                  href="https://josaa.nic.in"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline shrink-0 font-bold"
                                >
                                  <span>Visit Portal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-450 text-xs flex flex-col items-center justify-center gap-2">
                      <Newspaper className="w-8 h-8 text-slate-500 animate-pulse" />
                      <p className="font-bold text-white">No updates matched your filters.</p>
                      <p className="text-[10px] text-slate-450 max-w-xs leading-relaxed text-center">
                        Try resetting your keyword filters or tapping a different tag above!
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
