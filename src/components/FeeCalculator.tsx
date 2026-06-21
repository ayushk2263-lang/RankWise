import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BadgeIndianRupee, 
  Info, 
  Percent, 
  CreditCard, 
  HelpCircle,
  PiggyBank,
  CheckCircle,
  TrendingUp,
  School,
  Wallet,
  Coins,
  ShieldCheck,
  ChevronRight,
  Award
} from 'lucide-react';
import { College } from '../data/collegeData';

interface FeeCalculatorProps {
  college: College;
}

interface FeeStats {
  annualTuition: number;
  semesterHostel: number;
  semesterMess: number;
  oneTimeAdmission: number;
}

interface Scholarship {
  id: string;
  name: string;
  amount: number; // Annual value in INR
  type: 'merit' | 'means' | 'special';
  eligibility: string;
  description: string;
}

const getScholarships = (col: College): Scholarship[] => {
  const list: Scholarship[] = [
    {
      id: 'mcm_scholarship',
      name: 'Merit-Cum-Means (MCM) Scholarship',
      amount: 40000,
      type: 'means',
      eligibility: 'CGPA ≥ 6.0 & Annual Family Income below ₹5L (GEN/OBC)',
      description: 'Provides ₹1,000 pocket allowance per month + standard tuition exemption cover for outstanding middle-class students.'
    },
    {
      id: 'alumni_endowment',
      name: 'Institute Alumni Endowment Waiver',
      amount: 25000,
      type: 'special',
      eligibility: 'Open to all academic branches with single parent or medical overheads',
      description: 'Funded by the elite alumni directory to protect students in sudden financial distress or hardship.'
    }
  ];

  if (col.type === 'IIT') {
    list.unshift({
      id: 'aditya_birla',
      name: 'Aditya Birla Merit Scholarship',
      amount: 250000,
      type: 'merit',
      eligibility: 'Top 25 rankers in JEE Advanced enrolling in the B.Tech program',
      description: 'Extremely prestigious national award covering full tuition, course material, and auxiliary boarding expenses.'
    });
    list.push({
      id: 'da_fee_concession',
      name: 'Direct Merit Fee Concession',
      amount: 50000,
      type: 'merit',
      eligibility: 'Students with JEE Advanced CRL rank under 1000',
      description: 'An institutional waiver applied automatically on admission fees to promote top JEE rankers.'
    });
  } else if (col.type === 'NIT') {
    list.unshift({
      id: 'nit_merit_scholarship',
      name: 'NIT Local Domicile Merit Waiver',
      amount: 30000,
      type: 'merit',
      eligibility: 'Top 5% of home-state quota candidates in respective branches',
      description: 'Provides state-government sponsored boarding and tuition rebates for home-state toppers.'
    });
  } else if (col.type === 'IIIT') {
    list.unshift({
      id: 'iiit_corporate_fellowship',
      name: 'Corporate Industry Fellowship (Tech Partners)',
      amount: 60000,
      type: 'merit',
      eligibility: 'CGPA ≥ 8.5 maintained in subsequent college years',
      description: 'Industry-partnered (Infosys/TCS) stipend packages designed for premium CS/ECE stream toppers.'
    });
  }

  // Common schemes
  list.push({
    id: 'opjems',
    name: 'OP Jindal Engineering Merit Scholarship (OPJEMS)',
    amount: 150000,
    type: 'merit',
    eligibility: 'Top 3 rankers in stream from selected flagship branches',
    description: 'Promotes academic excellence in top-tier technology institutes across India.'
  });

  return list;
};

export default function FeeCalculator({ college }: FeeCalculatorProps) {
  // State for selectors
  const [category, setCategory] = useState<'GEN_OBC_EWS' | 'SC_ST_PWD'>('GEN_OBC_EWS');
  const [incomeSlab, setIncomeSlab] = useState<'BELOW_1L' | 'BETWEEN_1L_5L' | 'ABOVE_5L'>('ABOVE_5L');
  const [timeframe, setTimeframe] = useState<'semester' | 'annual' | 'program'>('annual');
  const [includeOneTime, setIncludeOneTime] = useState<boolean>(true);
  const [applyStateScholarship, setApplyStateScholarship] = useState<boolean>(true);
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([]);

  useEffect(() => {
    setSelectedScholarships([]);
  }, [college.id]);

  // 1. Core Base Fee mapping for different colleges
  const getBaseFees = (col: College): FeeStats => {
    const id = col.id.toLowerCase();
    const type = col.type;

    // Custom high-fidelity parameters matching official institute profiles
    if (id.includes('bombay')) {
      return { annualTuition: 200000, semesterHostel: 22000, semesterMess: 26000, oneTimeAdmission: 18000 };
    }
    if (id.includes('delhi')) {
      return { annualTuition: 200000, semesterHostel: 20000, semesterMess: 25000, oneTimeAdmission: 15050 };
    }
    if (id.includes('madras')) {
      return { annualTuition: 200000, semesterHostel: 21000, semesterMess: 24000, oneTimeAdmission: 16000 };
    }
    if (id.includes('kanpur')) {
      return { annualTuition: 200000, semesterHostel: 19500, semesterMess: 23000, oneTimeAdmission: 15000 };
    }
    if (id.includes('kharagpur')) {
      return { annualTuition: 200000, semesterHostel: 18000, semesterMess: 22000, oneTimeAdmission: 16500 };
    }
    if (id === 'iiit-hyderabad') {
      return { annualTuition: 400000, semesterHostel: 34000, semesterMess: 28000, oneTimeAdmission: 10000 };
    }
    if (id === 'iiit-allahabad') {
      return { annualTuition: 240000, semesterHostel: 19000, semesterMess: 23000, oneTimeAdmission: 20000 };
    }
    if (id === 'iiit-lucknow') {
      return { annualTuition: 260000, semesterHostel: 22000, semesterMess: 24000, oneTimeAdmission: 18000 };
    }

    // Standard types
    if (type === 'IIT') {
      return { annualTuition: 200000, semesterHostel: 18500, semesterMess: 22000, oneTimeAdmission: 15000 };
    }
    if (type === 'NIT') {
      return { annualTuition: 125000, semesterHostel: 15000, semesterMess: 19500, oneTimeAdmission: 12000 };
    }
    if (type === 'IIIT') {
      return { annualTuition: 280000, semesterHostel: 25000, semesterMess: 24000, oneTimeAdmission: 18000 };
    }

    // Default other colleges
    return { annualTuition: 160000, semesterHostel: 16000, semesterMess: 18000, oneTimeAdmission: 12000 };
  };

  const base = getBaseFees(college);

  // 2. Derive Tuition Fee Waivers
  let waiverPercent = 0;
  let hasGovWaiverSupport = college.type === 'IIT' || college.type === 'NIT';
  let isPPPOrSelfFinance = college.type === 'IIIT' || college.type === 'Non-JoSAA';

  if (hasGovWaiverSupport) {
    if (category === 'SC_ST_PWD') {
      waiverPercent = 100; // 100% Tuition Fee waiver for SC/ST/PwD
    } else {
      // General / OBC-NCL / EWS
      if (incomeSlab === 'BELOW_1L') {
        waiverPercent = 100; // 100% tuition waiver
      } else if (incomeSlab === 'BETWEEN_1L_5L') {
        waiverPercent = 66.67; // 2/3rd tuition waiver
      } else {
        waiverPercent = 0; // No tuition waiver
      }
    }
  } else if (isPPPOrSelfFinance && applyStateScholarship) {
    // IIITs/Private generally do not have full auto waiver, but simulate scholarships
    if (category === 'SC_ST_PWD' || incomeSlab === 'BELOW_1L') {
      waiverPercent = 50; // Custom 50% state scholarship
    } else if (incomeSlab === 'BETWEEN_1L_5L') {
      waiverPercent = 25; // Custom 25% state scholarship
    }
  }

  // Cost estimates
  const multiplier = timeframe === 'semester' ? 0.5 : timeframe === 'program' ? 4 : 1;
  const hostelMultiplier = timeframe === 'semester' ? 1 : timeframe === 'program' ? 8 : 2;
  const messMultiplier = timeframe === 'semester' ? 1 : timeframe === 'program' ? 8 : 2;

  const originalTuition = base.annualTuition * multiplier;
  const rawWaiver = originalTuition * (waiverPercent / 100);
  // Round waiver cleanly
  const waiverAmount = Math.round(rawWaiver);
  const effectiveTuition = originalTuition - waiverAmount;

  const totalHostel = base.semesterHostel * hostelMultiplier;
  const totalMess = base.semesterMess * messMultiplier;
  const oneTimeFee = (includeOneTime && (timeframe === 'program' || timeframe === 'semester')) ? base.oneTimeAdmission : 0;

  const scholarships = getScholarships(college);

  const getScholarshipDeduction = (s: Scholarship) => {
    if (timeframe === 'semester') return s.amount / 2;
    if (timeframe === 'program') return s.amount * 4;
    return s.amount;
  };

  const totalScholarshipRefund = selectedScholarships.reduce((acc, id) => {
    const s = scholarships.find(item => item.id === id);
    return s ? acc + getScholarshipDeduction(s) : acc;
  }, 0);

  const totalCostOfAttendance = Math.max(0, effectiveTuition + totalHostel + totalMess + oneTimeFee - totalScholarshipRefund);

  // Format currency nicely
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper labels
  const getTimeframeLabel = () => {
    if (timeframe === 'semester') return 'Per Semester';
    if (timeframe === 'program') return 'Full 4-Year B.Tech Program';
    return 'Annual (2 Semesters)';
  };

  const getWaiverFeedbackTag = () => {
    if (waiverPercent === 100) {
      return {
        label: '100% Tuition Waived',
        style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        desc: category === 'SC_ST_PWD' 
          ? 'SC/ST/PwD government tuition protection activated.' 
          : 'Low-income full tuition waiver scheme applied.'
      };
    }
    if (waiverPercent > 0) {
      return {
        label: `${Math.round(waiverPercent)}% Scholarship/Waiver Applied`,
        style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        desc: isPPPOrSelfFinance 
          ? 'Estimated state/institutional assistance applied.' 
          : '2/3rds Middle-Class income tuition concession applied.'
      };
    }
    return {
      label: 'Full Standard Fees',
      style: 'bg-slate-500/10 text-slate-300 border-white/5',
      desc: isPPPOrSelfFinance 
        ? 'Self-funded / PPP institution fees. Government-sponsored waivers are limited.' 
        : 'Family income exceeds eligibility criteria for tuition concessions.'
    };
  };

  const waiverTag = getWaiverFeedbackTag();

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">
            Fee & Cost of Attendance Calculator
          </h3>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">
            Estimate tuition, hostel, and mess expenses tailored to your demographic bracket.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="space-y-3 text-xs text-slate-350">
        
        {/* Category Selector */}
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide mb-1 font-mono">
            Reservation Category
          </span>
          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setCategory('GEN_OBC_EWS')}
              className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                category === 'GEN_OBC_EWS'
                  ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/30'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              General / OBC / EWS
            </button>
            <button
              onClick={() => setCategory('SC_ST_PWD')}
              className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                category === 'SC_ST_PWD'
                  ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/30'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              SC / ST / PwD
            </button>
          </div>
        </div>

        {/* Income Slab Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide font-mono">
              Annual Family Income Slab
            </span>
            {category === 'SC_ST_PWD' && hasGovWaiverSupport && (
              <span className="text-[9px] text-emerald-400 font-mono font-bold">Waiver Guaranteed!</span>
            )}
          </div>
          <select
            value={incomeSlab}
            onChange={(e) => setIncomeSlab(e.target.value as any)}
            className="w-full bg-black/50 border border-white/5 text-slate-200 rounded-xl px-2.5 py-1.8 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            disabled={category === 'SC_ST_PWD' && hasGovWaiverSupport}
          >
            <option className="bg-[#0f172a] text-slate-200" value="BELOW_1L">Below ₹1 Lakh (Lower Income Bracket)</option>
            <option className="bg-[#0f172a] text-slate-200" value="BETWEEN_1L_5L">₹1 Lakh - ₹5 Lakhs (Middle Class Bracket)</option>
            <option className="bg-[#0f172a] text-slate-200" value="ABOVE_5L">Above ₹5 Lakhs (Higher Class Bracket)</option>
          </select>
        </div>

        {/* IIIT-specific Option Toggles */}
        {isPPPOrSelfFinance && (
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wide">PPP/Private Support Concessions</span>
              <Info className="w-3 h-3 text-slate-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-[10.5px]">
              <input
                type="checkbox"
                checked={applyStateScholarship}
                onChange={(e) => setApplyStateScholarship(e.target.checked)}
                className="rounded text-indigo-505 bg-black/50 border-white/10 w-3.5 h-3.5"
              />
              <span className="text-slate-300">Apply potential State/Institute Schemes</span>
            </label>
            <p className="text-[9px] text-slate-500 leading-relaxed leading-normal">
              PPP & private entities are self-funded. Government-mandated central waivers do not automatically trigger, but dynamic merits-means aid can offset costs.
            </p>
          </div>
        )}

        {/* Timeframe Controller */}
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide mb-1 font-mono">
            Time Assessment Duration
          </span>
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-center">
            <button
              onClick={() => setTimeframe('semester')}
              className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === 'semester'
                  ? 'bg-slate-700/60 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semester
            </button>
            <button
              onClick={() => setTimeframe('annual')}
              className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === 'annual'
                  ? 'bg-slate-700/60 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setTimeframe('program')}
              className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === 'program'
                  ? 'bg-slate-700/60 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Program
            </button>
          </div>
        </div>
        {/* First Semester Deposit Switch */}
        {(timeframe === 'program' || timeframe === 'semester') && (
          <label className="flex items-center gap-2 cursor-pointer pt-1 pl-1 text-[11px]">
            <input
              type="checkbox"
              checked={includeOneTime}
              onChange={(e) => setIncludeOneTime(e.target.checked)}
              className="rounded text-indigo-605 bg-black/50 border-white/10 w-3.5 h-3.5"
            />
            <span className="text-slate-300">Include first-semester one-time deposit ({formatCurrency(base.oneTimeAdmission)})</span>
          </label>
        )}
      </div>

      {/* Institutional Scholarships & Fee Waivers checklist */}
      <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="block text-[10px] uppercase font-bold text-slate-300 tracking-wider font-mono">
              Institutional Scholarships & Aid Concessions
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 font-medium">Factor in Merit/Means assistance</span>
        </div>

        <p className="text-[10.5px] text-slate-400 leading-normal">
          Select available scholarships or waivers at {college.name} to view your personalized net cost:
        </p>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
          {scholarships.map((s) => {
            const isSelected = selectedScholarships.includes(s.id);
            const deductionAmount = getScholarshipDeduction(s);
            const displayAmt = formatCurrency(deductionAmount);
            
            // Highlight checking compatibility
            let meetsIncome = true;
            if (s.id === 'mcm_scholarship' && incomeSlab === 'ABOVE_5L') {
              meetsIncome = false;
            }

            return (
              <div 
                key={s.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedScholarships(prev => prev.filter(id => id !== s.id));
                  } else {
                    setSelectedScholarships(prev => [...prev, s.id]);
                  }
                }}
                className={`p-3 rounded-xl border text-left select-none relative overflow-hidden group transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/5' 
                    : 'bg-[#1e293b]/20 border-white/5 hover:border-white/10'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-sans font-bold text-[11.5px] text-slate-200 leading-snug group-hover:text-amber-300 transition-colors">
                        {s.name}
                      </span>
                      {s.type === 'merit' && (
                        <span className="text-[8px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded uppercase tracking-wider">Merit</span>
                      )}
                      {s.type === 'means' && (
                        <span className="text-[8px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded uppercase tracking-wider">Means-Based</span>
                      )}
                      {s.type === 'special' && (
                        <span className="text-[8px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1 py-0.2 rounded uppercase tracking-wider">Endowment</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {s.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono pt-0.5">
                      <span className="text-slate-500 uppercase font-black">Eligibility:</span>
                      <span className={`${meetsIncome ? 'text-slate-350' : 'text-rose-450 font-semibold'}`}>
                        {s.eligibility}
                        {!meetsIncome && " (Current household income bracket above threshold)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11.5px] font-mono font-extrabold text-[#facc15] block">
                      -{displayAmt}
                    </span>
                    <span className="text-[8px] text-slate-500 block uppercase font-mono mt-0.5">
                      {timeframe === 'semester' ? 'semester' : timeframe === 'program' ? '4-yrs total' : 'annual'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex justify-end">
                  <span className={`text-[9px] font-mono uppercase font-black tracking-wide px-2 py-0.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 text-[#facc15] border-amber-400/40'
                      : 'bg-black/20 text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-slate-200'
                  }`}>
                    {isSelected ? "✓ Aid factored into Net Cost" : "+ Apply Concession"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Results Panel */}
      <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">{getTimeframeLabel()} Quote</span>
          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${waiverTag.style}`}>
            {waiverTag.label}
          </span>
        </div>

        {/* Cost Stack visual components */}
        <div className="space-y-2.5 text-xs">
          
          {/* Tuition Row */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-450">
                <School className="w-3.5 h-3.5 text-indigo-400" />
                Tuition Fees
              </span>
              <div className="text-right">
                {waiverAmount > 0 && (
                  <span className="line-through text-[10px] text-slate-500 mr-1.5 font-mono">
                    {formatCurrency(originalTuition)}
                  </span>
                )}
                <span className="font-bold text-white font-mono">{formatCurrency(effectiveTuition)}</span>
              </div>
            </div>
            {waiverAmount > 0 && (
              <div className="flex justify-between items-center text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-500/5 rounded border border-emerald-500/10 font-mono">
                <span>Tuition Refund Waiver</span>
                <span>- {formatCurrency(waiverAmount)} ({Math.round(waiverPercent)}% Off)</span>
              </div>
            )}
          </div>

          {/* Hostel Row */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-450">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              Hostel Accommodation & Utilities
            </span>
            <span className="font-semibold text-white font-mono">{formatCurrency(totalHostel)}</span>
          </div>

          {/* Mess Row */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-450">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Mess Charges (Food & Catering)
            </span>
            <span className="font-semibold text-white font-mono">{formatCurrency(totalMess)}</span>
          </div>

          {/* One-time admission fee */}
          {oneTimeFee > 0 && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-450">
                <Coins className="w-3.5 h-3.5 text-indigo-400" />
                Security Deposit & Admission (One-Time)
              </span>
              <span className="font-semibold text-white font-mono">{formatCurrency(oneTimeFee)}</span>
            </div>
          )}

          {/* Scholarship Concessions Row */}
          {totalScholarshipRefund > 0 && (
            <div className="space-y-1 pt-1 border-t border-dashed border-white/10 animate-fade-in text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                  Scholarship Deductions
                </span>
                <span className="font-bold text-[#facc15] font-mono">-{formatCurrency(totalScholarshipRefund)}</span>
              </div>
              <div className="text-[9.5px] text-amber-305/90 px-2 py-0.5 bg-amber-500/5 rounded border border-amber-500/10 font-mono">
                Factored in {selectedScholarships.length} active institutional aid program(s)
              </div>
            </div>
          )}

          {/* CSS Horizontal stack graph visualization (100% distribution slider) */}
          <div className="space-y-1 pt-1">
            <div className="text-[9px] uppercase font-bold text-slate-550 tracking-wider font-mono">Gross Expense Allocation Weighting</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {(() => {
                const baseExpenseSum = effectiveTuition + totalHostel + totalMess + oneTimeFee;
                if (baseExpenseSum > 0) {
                  return (
                    <>
                      <div 
                        style={{ width: `${(effectiveTuition / baseExpenseSum) * 100}%` }} 
                        className="h-full bg-indigo-500" 
                        title={`Tuition: ${Math.round((effectiveTuition / baseExpenseSum) * 100)}%`}
                      />
                      <div 
                        style={{ width: `${(totalHostel / baseExpenseSum) * 100}%` }} 
                        className="h-full bg-cyan-500" 
                        title={`Hostel: ${Math.round((totalHostel / baseExpenseSum) * 100)}%`}
                      />
                      <div 
                        style={{ width: `${(totalMess / baseExpenseSum) * 100}%` }} 
                        className="h-full bg-amber-500" 
                        title={`Mess: ${Math.round((totalMess / baseExpenseSum) * 100)}%`}
                      />
                      {oneTimeFee > 0 && (
                        <div 
                          style={{ width: `${(oneTimeFee / baseExpenseSum) * 100}%` }} 
                          className="h-full bg-slate-400" 
                          title={`One-time fee: ${Math.round((oneTimeFee / baseExpenseSum) * 100)}%`}
                        />
                      )}
                    </>
                  );
                }
                return <div className="w-full bg-slate-700 h-full" />;
              })()}
            </div>
            
            {/* Color index indicators */}
            <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 font-mono">
              {(() => {
                const baseExpenseSum = effectiveTuition + totalHostel + totalMess + oneTimeFee;
                return (
                  <>
                    <span className="flex items-center gap-1 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Tuition ({baseExpenseSum > 0 ? Math.round((effectiveTuition / baseExpenseSum) * 100) : 0}%)
                    </span>
                    <span className="flex items-center gap-1 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      Hostel ({baseExpenseSum > 0 ? Math.round((totalHostel / baseExpenseSum) * 100) : 0}%)
                    </span>
                    <span className="flex items-center gap-1 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Mess ({baseExpenseSum > 0 ? Math.round((totalMess / baseExpenseSum) * 100) : 0}%)
                    </span>
                    {oneTimeFee > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Inst. ({baseExpenseSum > 0 ? Math.round((oneTimeFee / baseExpenseSum) * 100) : 0}%)
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* NET CALCULATED RESULT */}
          <div className="border-t border-white/5 pt-3.5 mt-3 flex justify-between items-center bg-white/[0.01] -mx-4 px-4 py-2 text-indigo-200">
            <div>
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                {totalScholarshipRefund > 0 ? "Personalized Net Cost" : "Total Estimated Pay"}
              </span>
              <span className="text-[10px] text-slate-500">
                {totalScholarshipRefund > 0 ? "Concessions & aid included" : "Hostel, food & tuition combined"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-mono font-extrabold text-[#facc15]">
                {formatCurrency(totalCostOfAttendance)}
              </span>
              {timeframe === 'program' && (
                <p className="text-[8px] uppercase tracking-widest text-[#a78bfa] font-black font-mono">4-Year Net Total</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Advisory Scheme Insights Desk */}
      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed">
        <PiggyBank className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5 animate-bounce animate-duration-1000" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 block">JoSAA Financial Counseling Guard</span>
          <p className="text-slate-400">
            {waiverPercent === 100 ? (
              <span>Your bracket entitles you to a base fee waiver. Only Hostel rent and standard messing operations require personal budgeting. Check out national scholarship support for further relief.</span>
            ) : category === 'SC_ST_PWD' ? (
              <span>SC/ST/PwD category grants 100% tuition coverage across all IITs/NITs. IIITs can be offset using state-sponsored central schemes.</span>
            ) : waiverPercent > 0 ? (
              <span>With 2/3rds tuition waived, your major recurring costs shift to hostel living. Many PSU bank nodes offer pre-approved, collatral-free educational loans covering both.</span>
            ) : (
              <span>Standard fee plans apply, but national banks offer collatral-free loans up to ₹20 Lakhs for Premier Category-1 Institutes. The CSIS scheme protects interest indices post-graduation.</span>
            )}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold font-mono">
            <span>Learn about CSIS Education Scheme</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
