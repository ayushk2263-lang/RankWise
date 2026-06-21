import { 
  josaaIITCutoffs, 
  josaaNITCutoffs, 
  josaaIIITCutoffs, 
  josaaGFTICutoffs,
  CutoffHistoryRecord,
  Category,
  Gender,
  Quota
} from './cutoffHistory';

export interface YoYTrend {
  fromYear: number;
  toYear: number;
  change: number;        // raw change (to - from)
  percentChange: number; // percentage change
  type: 'Inflation' | 'Deflation' | 'Stable'; // Inflation = ranks decrease (tighter); Deflation = ranks increase (easier)
}

export interface CutoffTrendSummary {
  instituteId: string;
  branchCode: string;
  category: string;
  quota: string;
  gender: string;
  
  // Historical data points scanned (only actual values)
  availableYearsCount: number;
  availableYears: number[];
  actualRecords: { year: number; round: number; closingRank: number; openingRank: number }[];
  
  // Coverage Tracking
  historicalCoverage: number;
  yearsAvailable: number[];
  recordCount: number;
  confidenceLevel: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';

  // Metric 1: Average closing rank over available years
  averageClosingRank: number;

  // Metric 2: Weighted recent average (recent years given higher weights)
  weightedRecentAverage: number;

  // Metric 3: Rank Inflation / Deflation metrics
  oldestClosingRank: number;
  newestClosingRank: number;
  absoluteRankShift: number; // newest - oldest
  percentageRankShift: number; // (newest - oldest) / oldest * 100
  recentYoYChange: YoYTrend | null; // YoY change 2024 -> 2025 if available

  // Metric 4: Cutoff trend direction
  trendDirection: 'Upward (Easier)' | 'Downward (Tighter)' | 'Stable'; // cutoffs going up means easier, down means tighter
  volatility: 'High' | 'Medium' | 'Low'; // based on standard deviation or variance
  
  // Additional business rules for counselor advice
  recommendationNote: string;
}

// Map gender terms uniformly to support any UI discrepancy
function normalizeGender(g: string): string {
  const lowercase = g.toLowerCase();
  if (lowercase.includes('female')) {
    return 'Female-only (including Supernumerary)';
  }
  return 'Gender-Neutral';
}

// Map quota terms uniformly specifically handling JAC Delhi and other variations
export function normalizeQuota(q: string): 'HS' | 'OS' | 'AI' {
  const clean = q.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean === 'HS' || clean === 'HOMESTATE' || clean === 'DL' || clean === 'DELHI') {
    return 'HS';
  }
  if (clean === 'OS' || clean === 'OTHERSTATE' || clean === 'OD' || clean === 'OUTSIDEDELHI') {
    return 'OS';
  }
  if (clean === 'AI' || clean === 'ALLINDIA') {
    return 'AI';
  }
  if (clean.includes('HOME') || clean.includes('DELHI')) return 'HS';
  if (clean.includes('OTHER') || clean.includes('OUTSIDE')) return 'OS';
  if (clean.includes('ALL') || clean.includes('INDIA')) return 'AI';
  return 'OS';
}

// Combined collection of all actual historical entries (formula-free)
export const allActualHistoricalRecords: CutoffHistoryRecord[] = [
  ...josaaIITCutoffs,
  ...josaaNITCutoffs,
  ...josaaIIITCutoffs,
  ...josaaGFTICutoffs
];

/**
 * Calculates trend metrics for a specific college-branch pairing under selection parameters
 * using solely verified historical records. No formula extrapolation is used.
 */
export function analyzeCutoffTrend(
  collegeId: string,
  branchCode: string,
  category: string,
  quota: string,
  gender: string
): CutoffTrendSummary | null {
  const normGender = normalizeGender(gender);
  const normQuota = normalizeQuota(quota);
  const targetBranch = branchCode.toUpperCase();
  const targetCollege = collegeId.toLowerCase();
  const isIIT = targetCollege.startsWith('iit-');

  // Check if any actual historical records exist for this branch-college pairing
  const hasBranchHistory = allActualHistoricalRecords.some(
    r => r.instituteId.toLowerCase() === targetCollege &&
         r.branchCode.toUpperCase() === targetBranch
  );
  if (!hasBranchHistory) {
    return null;
  }

  // Filter raw historical records
  const records = allActualHistoricalRecords.filter(r => {
    const isCollegeMatch = r.instituteId.toLowerCase() === targetCollege;
    const isBranchMatch = r.branchCode.toUpperCase() === targetBranch;
    const isCategoryMatch = r.category === category;
    
    // For IITs, quota in historical data is 'AI'.
    // In UI, users might pass 'OS' or 'HS' or 'AI'. We must handle IIT quota safely.
    const isQuotaMatch = isIIT ? true : (normalizeQuota(r.quota) === normQuota);

    const isGenderMatch = r.gender === normGender;

    return isCollegeMatch && isBranchMatch && isCategoryMatch && isQuotaMatch && isGenderMatch;
  });

  if (records.length === 0) {
    return null;
  }

  // Deduplicate and group by year (in case CSAB and JoSAA rounds overlap, get the maximum round or latest round per year)
  const yearlyRecordsMap = new Map<number, CutoffHistoryRecord>();
  for (const rec of records) {
    const existing = yearlyRecordsMap.get(rec.year);
    if (!existing || rec.round > existing.round) {
      yearlyRecordsMap.set(rec.year, rec);
    }
  }

  const yearlyRecords = Array.from(yearlyRecordsMap.values())
    .sort((a, b) => a.year - b.year);

  const parsedRecords = yearlyRecords.map(r => ({
    year: r.year,
    round: r.round,
    closingRank: r.closingRank,
    openingRank: r.openingRank
  }));

  const closingRanks = parsedRecords.map(r => r.closingRank);
  const years = parsedRecords.map(r => r.year);

  // 1. Average Closing Rank
  const sumClosing = closingRanks.reduce((acc, val) => acc + val, 0);
  const averageClosingRank = Math.round(sumClosing / closingRanks.length);

  // 2. Weighted Recent Average (higher weight for more recent years)
  // Standard weights for available years: weight increases linearly or with recency
  // E.g., if we have 2021, 2022, 2023, 2024, 2025:
  // We can assign weight (year - 2020), i.e., 2021=1, 2022=2, 2023=3, 2024=4, 2025=5
  let weightedSum = 0;
  let totalWeights = 0;
  for (const item of parsedRecords) {
    const weight = item.year - 2020; // 2021 is weight 1, 2025 is weight 5
    weightedSum += item.closingRank * weight;
    totalWeights += weight;
  }
  const weightedRecentAverage = Math.round(weightedSum / totalWeights);

  // 3. Rank Shift metrics (oldest vs newest)
  const oldestRecord = parsedRecords[0];
  const newestRecord = parsedRecords[parsedRecords.length - 1];
  
  const oldestClosingRank = oldestRecord.closingRank;
  const newestClosingRank = newestRecord.closingRank;
  const absoluteRankShift = newestClosingRank - oldestClosingRank;
  const percentageRankShift = parseFloat(((absoluteRankShift / oldestClosingRank) * 100).toFixed(2));

  // Recent YoY Change (2024 to 2025 if both exist)
  let recentYoYChange: YoYTrend | null = null;
  const rec2024 = parsedRecords.find(r => r.year === 2024);
  const rec2025 = parsedRecords.find(r => r.year === 2025);
  if (rec2024 && rec2025) {
    const change = rec2025.closingRank - rec2024.closingRank;
    const pct = parseFloat(((change / rec2024.closingRank) * 100).toFixed(2));
    recentYoYChange = {
      fromYear: 2024,
      toYear: 2025,
      change,
      percentChange: pct,
      type: change < 0 ? 'Inflation' : (change > 0 ? 'Deflation' : 'Stable')
    };
  }

  // 4. Trend Direction & Volatility
  // Cutoffs going DOWN (- change) means competition got tougher/tighter
  // Cutoffs going UP (+ change) means competition got easier/deflated
  let trendDirection: 'Upward (Easier)' | 'Downward (Tighter)' | 'Stable' = 'Stable';
  if (percentageRankShift < -3.5) {
    trendDirection = 'Downward (Tighter)';
  } else if (percentageRankShift > 3.5) {
    trendDirection = 'Upward (Easier)';
  }

  // Calculate volatility (standard deviation divided by mean - Coefficient of Variation)
  let volatility: 'High' | 'Medium' | 'Low' = 'Low';
  if (closingRanks.length > 1) {
    const mean = sumClosing / closingRanks.length;
    const variance = closingRanks.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / closingRanks.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of variation
    if (cv > 0.15) {
      volatility = 'High';
    } else if (cv > 0.06) {
      volatility = 'Medium';
    }
  }

  // Custom actionable recommendation insight for students
  let recommendationNote = "";
  if (trendDirection === 'Downward (Tighter)') {
    recommendationNote = `The cutoff ranks for this branch are contracting rapidly (-${Math.abs(percentageRankShift)}%). This indicates heavily rising popularity and demand. Aim for a rank at least 5-10% better than the 2025 closing rank to be safe.`;
  } else if (trendDirection === 'Upward (Easier)') {
    recommendationNote = `Cutoffs are expanding (+${percentageRankShift}%), making admission comparatively easier over the years. This present-year cushion offers an excellent target/safe backup option.`;
  } else {
    recommendationNote = `Cutoffs are highly stable (fluctuating within $\\pm 3.5\\%$). You can rely confidently on the 2025 historical benchmark as a reliable predictor threshold.`;
  }

  if (volatility === 'High') {
    recommendationNote += " Caution: Wide year-on-year variations mean you should have a solid safer option on standby.";
  }

  const yearsAvailable = Array.from(new Set(parsedRecords.map(r => r.year))).sort((a,b)=>a-b);
  const historicalCoverage = yearsAvailable.length;
  const recordCount = records.length;

  let confidenceLevel: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low' = 'Very Low';
  if (historicalCoverage === 5) confidenceLevel = 'Very High';
  else if (historicalCoverage === 4) confidenceLevel = 'High';
  else if (historicalCoverage === 3) confidenceLevel = 'Moderate';
  else if (historicalCoverage === 2) confidenceLevel = 'Low';
  else if (historicalCoverage === 1) confidenceLevel = 'Very Low';

  return {
    instituteId: collegeId,
    branchCode,
    category,
    quota: isIIT ? 'AI' : quota,
    gender,
    availableYearsCount: parsedRecords.length,
    availableYears: years,
    actualRecords: parsedRecords,
    historicalCoverage,
    yearsAvailable,
    recordCount,
    confidenceLevel,
    averageClosingRank,
    weightedRecentAverage,
    oldestClosingRank,
    newestClosingRank,
    absoluteRankShift,
    percentageRankShift,
    recentYoYChange,
    trendDirection,
    volatility,
    recommendationNote
  };
}

/**
 * Searches for all branches with the most severe rank inflation (most competitive tightening)
 * or rank deflation (ranks opening up) for general analysis.
 */
export function getTopTrendingBranches(
  category: string,
  quota: string,
  gender: string,
  type: 'Inflation' | 'Deflation',
  limit: number = 5
): Array<{ collegeName: string; branchName: string; branchCode: string; changePercent: number; summary: CutoffTrendSummary }> {
  // Let's import collegesData inside or lazily to avoid circular imports
  // But wait! collegesData is in collegeData.ts which also imports this or cutoffHistory.
  // To avoid circular dependency, we can search dynamically using our known records list!
  const results: Array<{ collegeName: string; branchName: string; branchCode: string; changePercent: number; summary: CutoffTrendSummary }> = [];
  
  // We need to identify valid collegeName and branchName from existing indices
  // Let's declare a simple list of unique instituteId and branchCodes from raw records
  const tempMap = new Map<string, Set<string>>();
  for (const r of allActualHistoricalRecords) {
    if (!tempMap.has(r.instituteId)) {
      tempMap.set(r.instituteId, new Set());
    }
    tempMap.get(r.instituteId)!.add(r.branchCode);
  }

  // To map college names, we can have a lightweight lookup or use collegesData if available safely at runtime,
  // let's do a dynamic require/import of collegesData or look it up directly.
  // Actually, we can just do the analysis on available items.
  for (const [instId, branchCodes] of tempMap.entries()) {
    for (const bcode of branchCodes) {
      const summary = analyzeCutoffTrend(instId, bcode, category, quota, gender);
      if (summary && summary.availableYearsCount >= 3) { // Need at least 3 years to claim a reliable trend
        results.push({
          collegeName: instId, // Will map to beautiful names in the UI easily
          branchName: bcode,
          branchCode: bcode,
          changePercent: summary.percentageRankShift,
          summary
        });
      }
    }
  }

  // Sort: 
  // Inflation: most negative changePercent first
  // Deflation: most positive changePercent first
  if (type === 'Inflation') {
    results.sort((a, b) => a.changePercent - b.changePercent);
  } else {
    results.sort((a, b) => b.changePercent - a.changePercent);
  }

  return results.slice(0, limit);
}
