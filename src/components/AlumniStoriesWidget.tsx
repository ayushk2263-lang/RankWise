import React, { useState, useEffect } from 'react';
import { Briefcase, Award, Lightbulb, Compass, Loader2, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface AlumniStory {
  name: string;
  year: string;
  branch: string;
  role: string;
  trajectory: string;
  achievement: string;
  qualitativeAdvice: string;
}

interface AlumniResponse {
  success: boolean;
  source: string;
  stories: AlumniStory[];
  note?: string;
}

interface AlumniStoriesWidgetProps {
  collegeId: string;
  collegeName: string;
  branches: Array<{ code: string; name: string }>;
}

export default function AlumniStoriesWidget({ collegeId, collegeName, branches }: AlumniStoriesWidgetProps) {
  // Prefer common top branches or filter existing branches
  const availableBranches = branches.filter(b => 
    ['CSE', 'CS', 'ECE', 'EE', 'EEE', 'ME', 'MECH', 'CE', 'CIVIL', 'IT'].includes(b.code)
  );
  
  // Use first available branch or default to CSE
  const initialBranch = availableBranches.length > 0 ? availableBranches[0].code : 'CSE';
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [stories, setStories] = useState<AlumniStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/alumni/stories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collegeId,
            collegeName,
            branchCode: selectedBranch
          })
        });
        
        if (!res.ok) {
          throw new Error('Alumni stories endpoint unavailable.');
        }

        const data: AlumniResponse = await res.json();
        if (active) {
          if (data.success && data.stories) {
            setStories(data.stories);
            setSourceInfo(data.source === 'gemini' 
              ? '✨ Live AI Generated' 
              : `📂 Verified Catalog Trajectories${data.note ? ` (${data.note})` : ''}`
            );
          } else {
            throw new Error('Malformed stories payload received.');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Could not fetch alumni trajectories.');
          // Use safe static backup if server errors out
          setStories([
            {
              name: "Priya Nair",
              year: "Class of 2017",
              branch: selectedBranch,
              role: "Principal Product Architect, Autonomous Grid Solutions",
              trajectory: "Graduated with honors and pursued structured domain exposure in distributed embedded control networks. Secured key technology positions before transitioning to infrastructure policy advisory.",
              achievement: "Led deployment of decentralized solar microgrids across 40 high-density rural clusters in Southern India.",
              qualitativeAdvice: "Do not let salary package races define your early exploration. Engineering is about real stewardship. Work on actual physically constrained modules to build unbeatable intuition."
            }
          ]);
          setSourceInfo('💾 Client Sandbox Backup');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchStories();
    return () => {
      active = false;
    };
  }, [collegeId, selectedBranch]);

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 font-sans text-slate-300">
      {/* Header element */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25">
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-white">Alumni Career Trajectories</h3>
            <p className="text-[10px] text-slate-400">Qualitative outcomes beyond packages & recruiter logos.</p>
          </div>
        </div>

        {sourceInfo && (
          <span className="text-[8px] uppercase tracking-wider font-mono font-bold bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">
            {sourceInfo}
          </span>
        )}
      </div>

      {/* Dynamic Branch filter buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Select Academic Division:</span>
        <div className="flex flex-wrap gap-1.5">
          {(availableBranches.length > 0 ? availableBranches : [{ code: 'CSE', name: 'Computer Science' }]).slice(0, 4).map((b) => (
            <button
              key={b.code}
              onClick={() => setSelectedBranch(b.code)}
              className={`text-[10.5px] font-medium py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                selectedBranch === b.code
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-bold'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Display */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 bg-black/20 border border-white/5 rounded-xl">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="text-[10.5px] text-slate-450 font-mono">Synthesizing alumni pathways...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story, idx) => (
            <div 
              key={idx} 
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3 hover:border-white/10 transition-all shadow-inner relative overflow-hidden"
            >
              {/* Profile header */}
              <div className="flex items-start justify-between gap-1 border-b border-white/5 pb-2">
                <div>
                  <h4 className="font-bold text-xs text-white">{story.name}</h4>
                  <p className="text-[10px] text-indigo-400 font-medium font-mono">{story.role}</p>
                </div>
                <span className="text-[9px] font-bold font-mono text-slate-450 bg-white/5 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">
                  {story.year}
                </span>
              </div>

              {/* Trajectory */}
              <div className="space-y-1 text-xs">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  Career Evolution Pathway
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed pl-4 border-l border-white/5">
                  {story.trajectory}
                </p>
              </div>

              {/* Achievement highlight */}
              <div className="space-y-1 text-xs">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  Selected Milestone / Contribution
                </span>
                <p className="text-emerald-350 text-[11.5px] leading-relaxed bg-emerald-950/10 border border-emerald-900/20 p-2.5 rounded-lg flex items-start gap-1.5 font-medium">
                  <span>🏆</span>
                  <span>{story.achievement}</span>
                </p>
              </div>

              {/* Core Qualitative Advice */}
              <div className="space-y-1 text-xs bg-indigo-950/10 border border-indigo-900/20 p-3 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Qualitative Advice to Aspirants
                </span>
                <p className="text-slate-300 text-[10.5px] leading-relaxed italic mt-1 font-sans">
                  "{story.qualitativeAdvice}"
                </p>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-amber-300 text-[10.5px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Offline Ready Backup generated. Configured AI secrets would unlock fully customized regional tracks.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
