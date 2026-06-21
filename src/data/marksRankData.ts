export interface MainsTrendEntry {
  marks: number;
  percentile: number;
  rankCRL: number;
  rankObc: number;
  rankSc: number;
  rankSt: number;
  rankEws: number;
}

export interface AdvancedTrendEntry {
  marks: number;
  percentPercentage: number;
  rankCRL: number;
  rankObc: number;
  rankSc: number;
  rankSt: number;
  rankEws: number;
}

// Previous years statistical distribution for JEE Mains (out of 300)
// To represent shifts: 
// 2025: Standard-High competition
// 2024: Historically high-scoring (easier papers, massive candidate counts, high rank for same marks)
// 2023: Moderate-standard paper
// 2022: High-difficult paper (low marks required for high percentile)
export const mainsHistoricalTrends: Record<number, MainsTrendEntry[]> = {
  2025: [
    { marks: 285, percentile: 99.99, rankCRL: 120, rankObc: 25, rankSc: 8, rankSt: 3, rankEws: 12 },
    { marks: 260, percentile: 99.91, rankCRL: 1050, rankObc: 240, rankSc: 72, rankSt: 22, rankEws: 98 },
    { marks: 235, percentile: 99.72, rankCRL: 3200, rankObc: 780, rankSc: 210, rankSt: 68, rankEws: 310 },
    { marks: 215, percentile: 99.45, rankCRL: 6400, rankObc: 1540, rankSc: 420, rankSt: 135, rankEws: 620 },
    { marks: 195, percentile: 99.12, rankCRL: 10200, rankObc: 2550, rankSc: 710, rankSt: 220, rankEws: 990 },
    { marks: 180, percentile: 98.65, rankCRL: 15500, rankObc: 3950, rankSc: 1100, rankSt: 340, rankEws: 1520 },
    { marks: 165, percentile: 98.05, rankCRL: 22500, rankObc: 5800, rankSc: 1620, rankSt: 510, rankEws: 2220 },
    { marks: 145, percentile: 96.85, rankCRL: 36000, rankObc: 9400, rankSc: 2650, rankSt: 820, rankEws: 3550 },
    { marks: 125, percentile: 95.12, rankCRL: 56000, rankObc: 14800, rankSc: 4100, rankSt: 1320, rankEws: 5500 },
    { marks: 105, percentile: 92.05, rankCRL: 91000, rankObc: 24500, rankSc: 6900, rankSt: 2150, rankEws: 9100 },
    { marks: 85, percentile: 86.40, rankCRL: 155000, rankObc: 42000, rankSc: 12100, rankSt: 3900, rankEws: 15600 },
    { marks: 65, percentile: 76.50, rankCRL: 270000, rankObc: 74000, rankSc: 21000, rankSt: 6800, rankEws: 27500 }
  ],
  2024: [
    { marks: 288, percentile: 99.99, rankCRL: 145, rankObc: 35, rankSc: 10, rankSt: 4, rankEws: 15 },
    { marks: 270, percentile: 99.91, rankCRL: 1300, rankObc: 310, rankSc: 92, rankSt: 28, rankEws: 125 },
    { marks: 245, percentile: 99.72, rankCRL: 4050, rankObc: 990, rankSc: 280, rankSt: 85, rankEws: 390 },
    { marks: 225, percentile: 99.45, rankCRL: 8100, rankObc: 1980, rankSc: 540, rankSt: 172, rankEws: 790 },
    { marks: 205, percentile: 99.12, rankCRL: 12800, rankObc: 3100, rankSc: 890, rankSt: 280, rankEws: 1250 },
    { marks: 190, percentile: 98.65, rankCRL: 19500, rankObc: 4850, rankSc: 1410, rankSt: 420, rankEws: 1925 },
    { marks: 175, percentile: 98.05, rankCRL: 28000, rankObc: 7200, rankSc: 2050, rankSt: 620, rankEws: 2780 },
    { marks: 155, percentile: 96.85, rankCRL: 45000, rankObc: 11800, rankSc: 3310, rankSt: 1020, rankEws: 4450 },
    { marks: 135, percentile: 95.12, rankCRL: 70000, rankObc: 18500, rankSc: 5120, rankSt: 1610, rankEws: 6900 },
    { marks: 115, percentile: 92.05, rankCRL: 114000, rankObc: 30500, rankSc: 8600, rankSt: 2700, rankEws: 11400 },
    { marks: 95, percentile: 86.40, rankCRL: 195000, rankObc: 52500, rankSc: 15200, rankSt: 4700, rankEws: 19500 },
    { marks: 75, percentile: 76.50, rankCRL: 338000, rankObc: 92000, rankSc: 26000, rankSt: 8400, rankEws: 34000 }
  ],
  2023: [
    { marks: 280, percentile: 99.99, rankCRL: 110, rankObc: 22, rankSc: 7, rankSt: 2, rankEws: 11 },
    { marks: 250, percentile: 99.91, rankCRL: 980, rankObc: 220, rankSc: 65, rankSt: 20, rankEws: 90 },
    { marks: 225, percentile: 99.72, rankCRL: 3050, rankObc: 740, rankSc: 195, rankSt: 62, rankEws: 295 },
    { marks: 205, percentile: 99.45, rankCRL: 6020, rankObc: 1450, rankSc: 395, rankSt: 125, rankEws: 590 },
    { marks: 185, percentile: 99.12, rankCRL: 9600, rankObc: 2380, rankSc: 660, rankSt: 205, rankEws: 920 },
    { marks: 170, percentile: 98.65, rankCRL: 14800, rankObc: 3720, rankSc: 1040, rankSt: 320, rankEws: 1450 },
    { marks: 155, percentile: 98.05, rankCRL: 21300, rankObc: 5450, rankSc: 1520, rankSt: 475, rankEws: 2110 },
    { marks: 135, percentile: 96.85, rankCRL: 34500, rankObc: 8900, rankSc: 2510, rankSt: 780, rankEws: 3400 },
    { marks: 115, percentile: 95.12, rankCRL: 53500, rankObc: 14100, rankSc: 3920, rankSt: 1250, rankEws: 5250 },
    { marks: 95, percentile: 92.05, rankCRL: 87000, rankObc: 23200, rankSc: 6550, rankSt: 2040, rankEws: 8600 },
    { marks: 75, percentile: 86.40, rankCRL: 148000, rankObc: 40000, rankSc: 11500, rankSt: 3700, rankEws: 14600 },
    { marks: 55, percentile: 76.50, rankCRL: 256000, rankObc: 70000, rankSc: 20100, rankSt: 6400, rankEws: 25500 }
  ],
  2022: [
    { marks: 270, percentile: 99.99, rankCRL: 95, rankObc: 18, rankSc: 6, rankSt: 2, rankEws: 9 },
    { marks: 240, percentile: 99.91, rankCRL: 900, rankObc: 200, rankSc: 59, rankSt: 18, rankEws: 82 },
    { marks: 215, percentile: 99.72, rankCRL: 2800, rankObc: 680, rankSc: 180, rankSt: 55, rankEws: 270 },
    { marks: 195, percentile: 99.45, rankCRL: 5500, rankObc: 1320, rankSc: 360, rankSt: 112, rankEws: 530 },
    { marks: 175, percentile: 99.12, rankCRL: 8800, rankObc: 2180, rankSc: 600, rankSt: 185, rankEws: 840 },
    { marks: 160, percentile: 98.65, rankCRL: 13500, rankObc: 3400, rankSc: 940, rankSt: 290, rankEws: 1310 },
    { marks: 145, percentile: 98.05, rankCRL: 19500, rankObc: 5000, rankSc: 1390, rankSt: 430, rankEws: 1910 },
    { marks: 125, percentile: 96.85, rankCRL: 31500, rankObc: 8150, rankSc: 2280, rankSt: 710, rankEws: 3100 },
    { marks: 105, percentile: 95.12, rankCRL: 48900, rankObc: 12900, rankSc: 3580, rankSt: 1120, rankEws: 4800 },
    { marks: 85, percentile: 92.05, rankCRL: 79500, rankObc: 21200, rankSc: 5950, rankSt: 1850, rankEws: 7800 },
    { marks: 65, percentile: 86.40, rankCRL: 135000, rankObc: 36500, rankSc: 10400, rankSt: 3350, rankEws: 13200 },
    { marks: 45, percentile: 76.50, rankCRL: 235000, rankObc: 64100, rankSc: 18300, rankSt: 5900, rankEws: 23200 }
  ]
};

// Previous years statistical distribution for JEE Advanced (out of 360 marks total)
// Difficulty dynamics:
// 2025: Standard-moderately tough
// 2024: Moderate-high candidate count (cutoff marks were slightly higher for standard ranks)
// 2023: Comparatively easy paper (ranks drops at higher scores, extremely competitive)
// 2022: Historically tough paper (extremely low marks yielded high ranks, eg: 180 was under AIR 1000)
export const advancedHistoricalTrends: Record<number, AdvancedTrendEntry[]> = {
  2025: [
    { marks: 320, percentPercentage: 88.8, rankCRL: 15, rankObc: 2, rankSc: 1, rankSt: 1, rankEws: 1 },
    { marks: 285, percentPercentage: 79.1, rankCRL: 150, rankObc: 30, rankSc: 10, rankSt: 3, rankEws: 12 },
    { marks: 255, percentPercentage: 70.8, rankCRL: 520, rankObc: 105, rankSc: 34, rankSt: 11, rankEws: 45 },
    { marks: 230, percentPercentage: 63.8, rankCRL: 1100, rankObc: 230, rankSc: 74, rankSt: 23, rankEws: 99 },
    { marks: 205, percentPercentage: 56.9, rankCRL: 2150, rankObc: 460, rankSc: 151, rankSt: 46, rankEws: 205 },
    { marks: 185, percentPercentage: 51.3, rankCRL: 3600, rankObc: 790, rankSc: 260, rankSt: 82, rankEws: 350 },
    { marks: 165, percentPercentage: 45.8, rankCRL: 5950, rankObc: 1350, rankSc: 450, rankSt: 140, rankEws: 590 },
    { marks: 145, percentPercentage: 40.2, rankCRL: 9200, rankObc: 2200, rankSc: 720, rankSt: 230, rankEws: 915 },
    { marks: 125, percentPercentage: 34.7, rankCRL: 14100, rankObc: 3500, rankSc: 1150, rankSt: 360, rankEws: 1410 },
    { marks: 105, percentPercentage: 29.1, rankCRL: 21500, rankObc: 5500, rankSc: 1850, rankSt: 580, rankEws: 2185 },
    { marks: 85, percentPercentage: 23.6, rankCRL: 32000, rankObc: 8800, rankSc: 2900, rankSt: 920, rankEws: 3250 }
  ],
  2024: [
    { marks: 325, percentPercentage: 90.2, rankCRL: 18, rankObc: 3, rankSc: 1, rankSt: 1, rankEws: 1 },
    { marks: 292, percentPercentage: 81.1, rankCRL: 165, rankObc: 35, rankSc: 11, rankSt: 4, rankEws: 14 },
    { marks: 262, percentPercentage: 72.7, rankCRL: 580, rankObc: 120, rankSc: 38, rankSt: 12, rankEws: 52 },
    { marks: 238, percentPercentage: 66.1, rankCRL: 1250, rankObc: 265, rankSc: 89, rankSt: 27, rankEws: 115 },
    { marks: 212, percentPercentage: 58.8, rankCRL: 2400, rankObc: 520, rankSc: 172, rankSt: 52, rankEws: 230 },
    { marks: 192, percentPercentage: 53.3, rankCRL: 4050, rankObc: 895, rankSc: 295, rankSt: 93, rankEws: 395 },
    { marks: 172, percentPercentage: 47.7, rankCRL: 6600, rankObc: 1500, rankSc: 505, rankSt: 156, rankEws: 650 },
    { marks: 152, percentPercentage: 42.2, rankCRL: 10200, rankObc: 2450, rankSc: 805, rankSt: 255, rankEws: 1010 },
    { marks: 132, percentPercentage: 36.6, rankCRL: 15700, rankObc: 3910, rankSc: 1290, rankSt: 405, rankEws: 1570 },
    { marks: 112, percentPercentage: 31.1, rankCRL: 24000, rankObc: 6150, rankSc: 2070, rankSt: 650, rankEws: 2440 },
    { marks: 92, percentPercentage: 25.5, rankCRL: 35800, rankObc: 9800, rankSc: 3250, rankSt: 1030, rankEws: 3630 }
  ],
  2023: [
    { marks: 330, percentPercentage: 91.6, rankCRL: 24, rankObc: 4, rankSc: 1, rankSt: 1, rankEws: 2 },
    { marks: 298, percentPercentage: 82.7, rankCRL: 180, rankObc: 38, rankSc: 12, rankSt: 4, rankEws: 16 },
    { marks: 268, percentPercentage: 74.4, rankCRL: 650, rankObc: 140, rankSc: 44, rankSt: 14, rankEws: 59 },
    { marks: 244, percentPercentage: 67.7, rankCRL: 1450, rankObc: 310, rankSc: 102, rankSt: 31, rankEws: 135 },
    { marks: 218, percentPercentage: 60.5, rankCRL: 2750, rankObc: 595, rankSc: 198, rankSt: 59, rankEws: 265 },
    { marks: 198, percentPercentage: 55.0, rankCRL: 4600, rankObc: 1010, rankSc: 335, rankSt: 105, rankEws: 445 },
    { marks: 178, percentPercentage: 49.4, rankCRL: 7500, rankObc: 1705, rankSc: 575, rankSt: 178, rankEws: 740 },
    { marks: 158, percentPercentage: 43.8, rankCRL: 11600, rankObc: 2795, rankSc: 915, rankSt: 290, rankEws: 1150 },
    { marks: 138, percentPercentage: 38.3, rankCRL: 17800, rankObc: 4435, rankSc: 1465, rankSt: 460, rankEws: 1780 },
    { marks: 118, percentPercentage: 32.7, rankCRL: 27000, rankObc: 6920, rankSc: 2330, rankSt: 735, rankEws: 2750 },
    { marks: 98, percentPercentage: 27.2, rankCRL: 40000, rankObc: 11000, rankSc: 3630, rankSt: 1150, rankEws: 4060 }
  ],
  2022: [
    { marks: 280, percentPercentage: 77.7, rankCRL: 12, rankObc: 1, rankSc: 1, rankSt: 1, rankEws: 1 },
    { marks: 245, percentPercentage: 68.0, rankCRL: 98, rankObc: 19, rankSc: 7, rankSt: 1, rankEws: 8 },
    { marks: 215, percentPercentage: 59.7, rankCRL: 320, rankObc: 65, rankSc: 20, rankSt: 6, rankEws: 26 },
    { marks: 190, percentPercentage: 52.8, rankCRL: 710, rankObc: 152, rankSc: 48, rankSt: 15, rankEws: 62 },
    { marks: 170, percentPercentage: 47.2, rankCRL: 1300, rankObc: 282, rankSc: 92, rankSt: 28, rankEws: 121 },
    { marks: 152, percentPercentage: 42.2, rankCRL: 2200, rankObc: 480, rankSc: 158, rankSt: 49, rankEws: 210 },
    { marks: 135, percentPercentage: 37.5, rankCRL: 3800, rankObc: 840, rankSc: 275, rankSt: 86, rankEws: 375 },
    { marks: 118, percentPercentage: 32.8, rankCRL: 6500, rankObc: 1480, rankSc: 485, rankSt: 152, rankEws: 640 },
    { marks: 102, percentPercentage: 28.3, rankCRL: 10500, rankObc: 2510, rankSc: 825, rankSt: 260, rankEws: 1050 },
    { marks: 88, percentPercentage: 24.4, rankCRL: 16500, rankObc: 4120, rankSc: 1380, rankSt: 435, rankEws: 1670 },
    { marks: 74, percentPercentage: 20.6, rankCRL: 25000, rankObc: 6605, rankSc: 2210, rankSt: 700, rankEws: 2550 }
  ]
};

export interface PredictionResult {
  percentile: number;
  rankCRL: number;
  categoryRank: number;
  exactMatch: boolean;
}

// Predict JEE Mains rank based on input marks, category, and selected year
export function predictMainsRank(marks: number, category: string, year: number): PredictionResult {
  const table = mainsHistoricalTrends[year] || mainsHistoricalTrends[2025];
  
  // Bound checks
  if (marks >= 300) {
    return { percentile: 100.00, rankCRL: 1, categoryRank: 1, exactMatch: true };
  }
  if (marks <= 0) {
    return { percentile: 0.00, rankCRL: 1200000, categoryRank: 350000, exactMatch: true };
  }

  // Find surrounding points for linear extrapolation/interpolation
  let upper = table[0];
  let lower = table[table.length - 1];

  if (marks >= upper.marks) {
    // Extrapolate upward till 300
    const ratio = (300 - marks) / (300 - upper.marks);
    const percentile = 100 - (100 - upper.percentile) * ratio;
    const rankCRL = Math.max(1, Math.round(1 + (upper.rankCRL - 1) * ratio));
    const catField = getCategoryKey(category);
    const categoryRank = Math.max(1, Math.round(1 + (upper[catField] - 1) * ratio));
    return { percentile: Number(percentile.toFixed(4)), rankCRL, categoryRank, exactMatch: false };
  }

  if (marks <= lower.marks) {
    // Extrapolate downwards till 0
    const ratio = marks / lower.marks; // 1 at lower.marks, 0 at 0 marks
    const percentile = lower.percentile * ratio;
    const rankCRL = Math.round(1200000 - (1200000 - lower.rankCRL) * ratio);
    
    const catField = getCategoryKey(category);
    const maxCatRank = category === 'OPEN' ? 1200000 : category === 'OBC-NCL' ? 350000 : category === 'SC' ? 150000 : category === 'ST' ? 65000 : 120000;
    const categoryRank = Math.round(maxCatRank - (maxCatRank - lower[catField]) * ratio);
    return { percentile: Number(percentile.toFixed(2)), rankCRL, categoryRank, exactMatch: false };
  }

  // Find exact interpolation window
  for (let i = 0; i < table.length - 1; i++) {
    if (marks <= table[i].marks && marks >= table[i+1].marks) {
      upper = table[i];
      lower = table[i+1];
      break;
    }
  }

  // Linear Interpolation
  const dMarks = upper.marks - lower.marks;
  const ratio = (marks - lower.marks) / dMarks; // 0 at lower, 1 at upper

  const percentile = lower.percentile + (upper.percentile - lower.percentile) * ratio;
  const rankCRL = Math.round(lower.rankCRL + (upper.rankCRL - lower.rankCRL) * ratio);
  
  const catField = getCategoryKey(category);
  const categoryRank = Math.round(lower[catField] + (upper[catField] - lower[catField]) * ratio);

  return {
    percentile: Number(percentile.toFixed(4)),
    rankCRL: Math.max(1, rankCRL),
    categoryRank: Math.max(1, categoryRank),
    exactMatch: false
  };
}

// Predict JEE Advanced rank based on input marks, category, and selected year
export function predictAdvancedRank(marks: number, category: string, year: number): { rankCRL: number; categoryRank: number; exactMatch: boolean } {
  const table = advancedHistoricalTrends[year] || advancedHistoricalTrends[2025];
  
  if (marks >= 360) {
    return { rankCRL: 1, categoryRank: 1, exactMatch: true };
  }
  if (marks <= 0) {
    return { rankCRL: 180000, categoryRank: 42000, exactMatch: true };
  }

  let upper = table[0];
  let lower = table[table.length - 1];

  if (marks >= upper.marks) {
    // Extrapolate upward to 360
    const ratio = (360 - marks) / (360 - upper.marks);
    const rankCRL = Math.max(1, Math.round(1 + (upper.rankCRL - 1) * ratio));
    const catField = getCategoryKey(category);
    const categoryRank = Math.max(1, Math.round(1 + (upper[catField] - 1) * ratio));
    return { rankCRL, categoryRank, exactMatch: false };
  }

  if (marks <= lower.marks) {
    // Extrapolate downward to 0
    const ratio = marks / lower.marks;
    const rankCRL = Math.round(180000 - (180000 - lower.rankCRL) * ratio);
    const catField = getCategoryKey(category);
    const maxCatRank = category === 'OPEN' ? 180000 : category === 'OBC-NCL' ? 42000 : category === 'SC' ? 16000 : category === 'ST' ? 7000 : 15000;
    const categoryRank = Math.round(maxCatRank - (maxCatRank - lower[catField]) * ratio);
    return { rankCRL, categoryRank, exactMatch: false };
  }

  for (let i = 0; i < table.length - 1; i++) {
    if (marks <= table[i].marks && marks >= table[i+1].marks) {
      upper = table[i];
      lower = table[i+1];
      break;
    }
  }

  const dMarks = upper.marks - lower.marks;
  const ratio = (marks - lower.marks) / dMarks;

  const rankCRL = Math.round(lower.rankCRL + (upper.rankCRL - lower.rankCRL) * ratio);
  const catField = getCategoryKey(category);
  const categoryRank = Math.round(lower[catField] + (upper[catField] - lower[catField]) * ratio);

  return {
    rankCRL: Math.max(1, rankCRL),
    categoryRank: Math.max(1, categoryRank),
    exactMatch: false
  };
}

function getCategoryKey(cat: string): 'rankCRL' | 'rankObc' | 'rankSc' | 'rankSt' | 'rankEws' {
  if (cat === 'OBC-NCL') return 'rankObc';
  if (cat === 'SC') return 'rankSc';
  if (cat === 'ST') return 'rankSt';
  if (cat === 'EWS') return 'rankEws';
  return 'rankCRL';
}
