import { josaaIITCutoffs, josaaNITCutoffs, josaaIIITCutoffs, josaaGFTICutoffs } from './cutoffHistory';
import { analyzeCutoffTrend } from './trendEngine';

export interface PlacementStats {
  highest: number; // in LPA
  average: number; // in LPA
  median: number;  // in LPA
  recruiters: string[];
  description: string;
}

export interface BranchPlacement {
  highest: number;
  average: number;
  median: number;
  recruiters?: string[];
  description?: string;
}

export interface CutoffData {
  year: number;
  category: 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
  quota: 'AI' | 'HS' | 'OS';
  gender: 'Gender-Neutral' | 'Female-Only';
  openingRank: number;
  closingRank: number;
  counselingRound?: 'JoSAA Round 6' | 'CSAB Special Round 3';
}

export interface Branch {
  code: string;
  name: string;
  baseClosingRankOPEN: number; // reference for extrapolation
  cutoffs?: CutoffData[]; // programmatically populated for 5 years
  placements?: BranchPlacement;
  degrees?: string[]; // program degree paths (e.g. B.Tech, B.S., Dual Degree)
  seats?: number; // total seat intake capacity
}

export function getBranchSeats(college: College, branchCode: string): number {
  const code = branchCode.toUpperCase();
  const id = college.id.toLowerCase();
  
  // Base seats depending on college size/type
  let baseSeats = 60;
  if (college.type === 'IIT') {
    if (['bombay', 'delhi', 'madras', 'kharagpur', 'kanpur', 'roorkee', 'guwahati'].some(x => id.includes(x))) {
      baseSeats = 85;
    } else {
      baseSeats = 55;
    }
  } else if (college.type === 'NIT') {
    if (['trichy', 'surathkal', 'warangal', 'calicut', 'rourkela', 'allahabad'].some(x => id.includes(x))) {
      baseSeats = 110;
    } else {
      baseSeats = 80;
    }
  } else if (college.type === 'IIIT') {
    baseSeats = 100; // IIITs have larger single programs focused on IT
  } else {
    baseSeats = 60;
  }

  // Branch-specific multiplier/additions
  let seats = baseSeats;
  if (code.includes('CSE') || code === 'CS' || code === 'IT') {
    seats = baseSeats + (college.type === 'IIIT' ? 80 : college.type === 'NIT' ? 50 : 35);
  } else if (code.includes('ECE') || code === 'EE' || code === 'EEE' || code.includes('MNC') || code.includes('MAC')) {
    seats = baseSeats + (college.type === 'IIIT' ? 40 : college.type === 'NIT' ? 25 : 15);
  } else if (code.includes('ME') || code.includes('MECH')) {
    seats = Math.max(30, baseSeats);
  } else if (code.includes('CE') || code.includes('CIVIL') || code.includes('CHE') || code.includes('CHEM')) {
    seats = Math.max(20, Math.round(baseSeats * 0.75));
  } else if (code.includes('MTE') || code.includes('MIN') || code.includes('TT')) {
    seats = Math.max(15, Math.round(baseSeats * 0.45));
  }
  
  return seats;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  type: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Non-JoSAA' | 'JEE-Adv-Other';
  location: string;
  nirfRank: number;
  established: number;
  campusArea: string;
  description: string;
  admissionType: 'JEE-Advanced' | 'JEE-Main';
  placements: PlacementStats;
  branches: Branch[];
}

export function getBranchPlacements(college: College, branchCode: string): { highest: number; average: number; median: number; recruiters?: string[]; description?: string; isBranchSpecific: boolean } {
  // Try to find explicit branch-specific placement data
  const branch = college.branches.find(b => b.code === branchCode);
  if (branch && branch.placements) {
    return {
      highest: branch.placements.highest,
      average: branch.placements.average,
      median: branch.placements.median,
      recruiters: branch.placements.recruiters || college.placements.recruiters,
      description: branch.placements.description || college.placements.description,
      isBranchSpecific: true
    };
  }

  // Calculate realistic branch placements based on college average and branch code
  const code = branchCode.toUpperCase();
  let factor = 1.0;
  let customDescription = "";
  
  if (code === 'CSE' || code === 'CS' || code === 'CD' || code === 'IT') {
    factor = 1.35;
    customDescription = `Stellar elite placement outcomes in ${branchCode} including high-frequency trading systems, Silicon Valley software architecture, and global cloud engineering roles.`;
  } else if (code === 'ECE' || code === 'EE' || code === 'EEE' || code === 'EN') {
    factor = 1.1;
    customDescription = `Excellent placement stats for ${branchCode}, featuring prime corporate hiring in VLSI semiconductor systems, embedded hardware, and high-tier software.`;
  } else if (code === 'ME' || code === 'MECH' || code === 'AE' || code === 'CHE') {
    factor = 0.82;
    customDescription = `Strong core engineering and consulting track record, balancing prime PSU recruitment, analytics pathways, and global specialized manufacturing.`;
  } else if (code === 'CE' || code === 'CIVIL' || code === 'MTE' || code === 'TT' || code === 'MIN') {
    factor = 0.68;
    customDescription = `Stable core recruitment along with strong pathways into civil services preparation, management consulting, and computer science bootcamps.`;
  }

  const average = Math.round((college.placements.average * factor) * 10) / 10;
  const median = Math.round((college.placements.median * factor) * 10) / 10;
  
  // Highest is boosted higher for elite CSE / ECE
  const highestMultiplier = code === 'CSE' || code === 'CS' ? 1.4 : code === 'ECE' ? 1.15 : 0.85;
  const highest = Math.round(Math.max(college.placements.average + 5, college.placements.highest * highestMultiplier) * 10) / 10;

  return {
    highest,
    average,
    median,
    recruiters: college.placements.recruiters,
    description: customDescription || college.placements.description,
    isBranchSpecific: true
  };
}

// Top colleges with structured seed data
export const collegesData: College[] = [
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology, Bombay",
    shortName: "IIT Bombay",
    type: "IIT",
    location: "Mumbai, Maharashtra",
    nirfRank: 3,
    established: 1958,
    campusArea: "550 Acres",
    description: "IIT Bombay is globally renowned for its academic excellence, cutting-edge research, and unmatched student culture. Located in Powai, Mumbai, it serves as the premier destination for JEE Advanced toppers.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 168,
      average: 23.5,
      median: 20.1,
      recruiters: ["Google","Microsoft","Jane Street","Apple","Uber","Qualcomm","McKinsey","Rubrik"],
      description: "Exceptional placements with multiple international offers exceeding 1 Crore per annum. Over 90% placement rate for undergraduate students consistently."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 65 },
      { code: "ECE", name: "Electrical Engineering (with Microelectronics)", baseClosingRankOPEN: 300 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 273, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 1300 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 2100 },
      { code: "AE", name: "Aerospace Engineering", baseClosingRankOPEN: 1430, degrees: ["B.Tech (4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 3500 },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 650, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Metallurgical Engineering and Materials Science", baseClosingRankOPEN: 4200 },
      { code: "BS-MTH", name: "Mathematics (Bachelor of Science)", baseClosingRankOPEN: 1170, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "EN", name: "Energy Engineering", baseClosingRankOPEN: 1560, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EV", name: "Environmental Science and Engineering", baseClosingRankOPEN: 2535, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "BSTE", name: "Biosciences and Bioengineering", baseClosingRankOPEN: 2730, degrees: ["B.Tech (4 Years)"] },
      { code: "CSED", name: "Computer Science and Engineering with Dual Degree", baseClosingRankOPEN: 98, degrees: ["Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MEMG", name: "Mechanical Engineering with Dual Degree", baseClosingRankOPEN: 1170, degrees: ["Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHED", name: "Chemical Engineering with Dual Degree", baseClosingRankOPEN: 1625, degrees: ["Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "BS-CHM", name: "Chemistry (Bachelor of Science)", baseClosingRankOPEN: 2925, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-PHY", name: "Physics (Bachelor of Science)", baseClosingRankOPEN: 1820, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-ECO", name: "Economics (Bachelor of Science)", baseClosingRankOPEN: 780, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology, Delhi",
    shortName: "IIT Delhi",
    type: "IIT",
    location: "New Delhi, Delhi",
    nirfRank: 2,
    established: 1961,
    campusArea: "325 Acres",
    description: "Located in the heart of India's capital city, IIT Delhi is a global leader in engineering education, offering strong industry connection and a highly vibrant entrepreneurial ecosystem.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 150,
      average: 22.8,
      median: 19.5,
      recruiters: ["Microsoft","Goldman Sachs","Boston Consulting Group","Samsung","NVIDIA","Uber"],
      description: "Renowned for startup-culture with highest density of unicorn founders. Placements are stellar across tech, finance, and consulting sectors."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 110 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 550 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 1600 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 2300 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 4000 },
      { code: "TT", name: "Textile Technology", baseClosingRankOPEN: 6500 },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 1980, degrees: ["B.Tech (4 Years)"] },
      { code: "BT", name: "Biochemical Engineering and Biotechnology", baseClosingRankOPEN: 3850, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Materials Engineering", baseClosingRankOPEN: 3740, degrees: ["B.Tech (4 Years)"] },
      { code: "EE2", name: "Electrical Engineering (Power and Automation)", baseClosingRankOPEN: 715, degrees: ["B.Tech (4 Years)"] },
      { code: "PI", name: "Production and Industrial Engineering", baseClosingRankOPEN: 2420, degrees: ["B.Tech (4 Years)"] },
      { code: "EN", name: "Energy Science and Engineering", baseClosingRankOPEN: 2750, degrees: ["B.Tech (4 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 330, degrees: ["B.Tech (4 Years)"] },
      { code: "BS-ECO", name: "Economics (Bachelor of Science)", baseClosingRankOPEN: 1210, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "iit-madras",
    name: "Indian Institute of Technology, Madras",
    shortName: "IIT Madras",
    type: "IIT",
    location: "Chennai, Tamil Nadu",
    nirfRank: 1,
    established: 1959,
    campusArea: "617 Acres",
    description: "Ranked #1 in NIRF Engineering category in India for consecutive years. IIT Madras features a beautiful wooded campus and India's top academic research ecosystem with IITM Research Park.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 131,
      average: 21.4,
      median: 18.2,
      recruiters: ["Qualcomm","Intel","Honeywell","Citibank","Morgan Stanley","Shell","Tata Motors"],
      description: "Exceptional core and software placement opportunities. Outstanding research and higher education admission records globally."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 145 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 725, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 2200 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 3400 },
      { code: "AE", name: "Aerospace Engineering", baseClosingRankOPEN: 3000 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 5200 },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 2320, degrees: ["B.Tech (4 Years)"] },
      { code: "BT", name: "Biological Engineering", baseClosingRankOPEN: 5220, degrees: ["B.Tech (4 Years)","Dual Degree (5 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 4640, degrees: ["B.Tech (4 Years)"] },
      { code: "OE", name: "Naval Architecture and Ocean Engineering", baseClosingRankOPEN: 4930, degrees: ["B.Tech (4 Years)"] },
      { code: "ED", name: "Engineering Design", baseClosingRankOPEN: 2465, degrees: ["Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "BS-MD", name: "Medical Sciences and Engineering", baseClosingRankOPEN: 3045, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-PHY", name: "Physics (Bachelor of Science)", baseClosingRankOPEN: 5075, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-CHM", name: "Chemical Sciences (Bachelor of Science)", baseClosingRankOPEN: 5800, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "iit-kanpur",
    name: "Indian Institute of Technology, Kanpur",
    shortName: "IIT Kanpur",
    type: "IIT",
    location: "Kanpur, Uttar Pradesh",
    nirfRank: 4,
    established: 1959,
    campusArea: "1055 Acres",
    description: "IIT Kanpur is renowned for its intense academic curriculum, massive computational facilities, state-of-the-art wind tunnel, and pioneering aerospace department.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 140,
      average: 21.2,
      median: 18,
      recruiters: ["Optiver","Tower Research","Microsoft","NVIDIA","Barclays","ExxonMobil"],
      description: "Strong performance in high-frequency trading (HFT) firms, fintech, and advanced software development roles."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 220 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 1100 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 2800 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 4100 },
      { code: "AE", name: "Aerospace Engineering", baseClosingRankOPEN: 3200 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 5800 },
      { code: "BT", name: "Biological Sciences and Bioengineering", baseClosingRankOPEN: 7700, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Materials Science and Engineering", baseClosingRankOPEN: 6600, degrees: ["B.Tech (4 Years)"] },
      { code: "BS-MTH", name: "Mathematics and Scientific Computing", baseClosingRankOPEN: 1012, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-ECO", name: "Economics (Bachelor of Science)", baseClosingRankOPEN: 2200, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-PHY", name: "Physics (Bachelor of Science)", baseClosingRankOPEN: 5500, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-CHM", name: "Chemistry (Bachelor of Science)", baseClosingRankOPEN: 7920, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-GEO", name: "Earth Sciences (Bachelor of Science)", baseClosingRankOPEN: 8360, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "iit-kharagpur",
    name: "Indian Institute of Technology, Kharagpur",
    shortName: "IIT Kharagpur",
    type: "IIT",
    location: "Kharagpur, West Bengal",
    nirfRank: 5,
    established: 1951,
    campusArea: "2100 Acres",
    description: "The first IIT founded in India, featuring the largest campus and the highest number of student departments, schools, and research centers in the country.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 120,
      average: 19.8,
      median: 16.5,
      recruiters: ["De Shaw","Goldman Sachs","Apple","Schlumberger","PwC","Intel","John Deere"],
      description: "Huge batch size of over 1500 students placed within 2 weeks. Vast alumni base provides excellent corporate advantages worldwide."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 260 },
      { code: "ECE", name: "Electronics and Electrical Communication", baseClosingRankOPEN: 1050 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 1600 },
      { code: "INE", name: "Instrumentation Engineering", baseClosingRankOPEN: 2470, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 3100 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 4500 },
      { code: "AE", name: "Aerospace Engineering", baseClosingRankOPEN: 3770, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 6300 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 6448, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 6110, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 7670, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 9100, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] },
      { code: "BS-MTH", name: "Mathematics and Computing (Bachelor of Science)", baseClosingRankOPEN: 1170, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] },
      { code: "OE", name: "Ocean Engineering and Naval Architecture", baseClosingRankOPEN: 6890, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AG", name: "Agricultural and Food Engineering", baseClosingRankOPEN: 7410, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IE", name: "Industrial and Systems Engineering", baseClosingRankOPEN: 3510, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MFG", name: "Manufacturing Science and Engineering", baseClosingRankOPEN: 4810, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "FPE", name: "Food Process Engineering", baseClosingRankOPEN: 7930, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "BS-PHY", name: "Physics (Bachelor of Science)", baseClosingRankOPEN: 5070, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] },
      { code: "BS-CHM", name: "Chemistry (Bachelor of Science)", baseClosingRankOPEN: 7150, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] },
      { code: "BS-GEO", name: "Applied Geology (Bachelor of Science)", baseClosingRankOPEN: 8060, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] },
      { code: "BS-GPH", name: "Exploration Geophysics (Bachelor of Science)", baseClosingRankOPEN: 7280, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] },
      { code: "BS-ECO", name: "Economics (Bachelor of Science)", baseClosingRankOPEN: 3120, degrees: ["B.S. (Bachelor of Science, 4 Years)","MS (Master of Science, 5 Years)"] }
    ]
  },
  {
    id: "iit-roorkee",
    name: "Indian Institute of Technology, Roorkee",
    shortName: "IIT Roorkee",
    type: "IIT",
    location: "Roorkee, Uttarakhand",
    nirfRank: 6,
    established: 1847,
    campusArea: "365 Acres",
    description: "The oldest technical institution in Asia, IIT Roorkee possesses an illustrious history of engineering leadership and is the national hub for hydraulic and earthquake engineering study.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 112,
      average: 19.5,
      median: 16.2,
      recruiters: ["Uber","Texas Instruments","Salesforce","Visa","HUL","Schlumberger"],
      description: "Superb placements in civil core, modern electronic VLSI design, and software systems."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 380 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 1400 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 2000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 3600 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 4800 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 6000 },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 7220, degrees: ["B.Tech (4 Years)"] },
      { code: "PE", name: "Polymer Science and Engineering", baseClosingRankOPEN: 12160, degrees: ["B.Tech (4 Years)"] },
      { code: "BT", name: "Biotechnology", baseClosingRankOPEN: 11400, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 10640, degrees: ["B.Tech (4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 12920, degrees: ["B.Tech (4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 9500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] },
      { code: "DSE", name: "Data Science and Artificial Intelligence", baseClosingRankOPEN: 570, degrees: ["B.Tech (4 Years)"] },
      { code: "BS-ECO", name: "Economics (Bachelor of Science)", baseClosingRankOPEN: 4560, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-PHY", name: "Physics (Bachelor of Science)", baseClosingRankOPEN: 9880, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-CHM", name: "Chemistry (Bachelor of Science)", baseClosingRankOPEN: 13300, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "nit-trichy",
    name: "National Institute of Technology, Tiruchirappalli",
    shortName: "NIT Trichy",
    type: "NIT",
    location: "Tiruchirappalli, Tamil Nadu",
    nirfRank: 9,
    established: 1964,
    campusArea: "800 Acres",
    description: "Consistently ranked #1 among NITs. NIT Trichy is a premier institute with world-class facilities and high competition, accepting JEE Main ranks.",
    admissionType: "JEE-Main",
    placements: {
      highest: 52.8,
      average: 15.6,
      median: 12.5,
      recruiters: ["Amazon","Microsoft","Morgan Stanley","Qualcomm","Tata Steel","Reliance"],
      description: "NIT Trichy records almost 95%+ placements across all disciplines, with Computer Science averaging 27 LPA."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1500 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 3500 },
      { code: "EE", name: "Electrical and Electronics Engineering", baseClosingRankOPEN: 6200 },
      { code: "INE", name: "Instrumentation and Control Engineering", baseClosingRankOPEN: 4200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 10500 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 13000 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 17000 },
      { code: "PE", name: "Production and Industrial Engineering", baseClosingRankOPEN: 8700, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 9600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 11250, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-surathkal",
    name: "National Institute of Technology, Karnataka",
    shortName: "NIT Surathkal",
    type: "NIT",
    location: "Surathkal, Karnataka",
    nirfRank: 12,
    established: 1960,
    campusArea: "295 Acres",
    description: "Located right on the tranquil shores of the Arabian Sea, NITK Surathkal boasts its own private beach and stellar placement stats closely rivaling top IITs.",
    admissionType: "JEE-Main",
    placements: {
      highest: 54.7,
      average: 15.2,
      median: 12,
      recruiters: ["Microsoft","Adobe","Intel","Goldman Sachs","L&T","Volvo"],
      description: "Incredible placements, particularly for Computer Science, Information Technology, and Electronics and Communication streams."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1650 },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 1897, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 2063, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 4200 },
      { code: "EE", name: "Electrical and Electronics Engineering", baseClosingRankOPEN: 7000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 11200 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 14500 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 19000 },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 10560, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 11880, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-warangal",
    name: "National Institute of Technology, Warangal",
    shortName: "NIT Warangal",
    type: "NIT",
    location: "Warangal, Telangana",
    nirfRank: 21,
    established: 1959,
    campusArea: "256 Acres",
    description: "The first Regional Engineering College (REC) of India, launched by PM Jawaharlal Nehru. NIT Warangal is highly sought-after, featuring outstanding academic standards and vibrant campus life.",
    admissionType: "JEE-Main",
    placements: {
      highest: 88,
      average: 14.8,
      median: 11.5,
      recruiters: ["De Shaw","Oracle","Cisco","Intel","Honeywell","Belzabar"],
      description: "Superb statistics for CSE and ECE packages. Outstanding performance from core mechanical and electrical sectors as well."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2100 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 4900 },
      { code: "EE", name: "Electrical and Electronics Engineering", baseClosingRankOPEN: 8200 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 12400 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 15800 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 21500 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 12600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 13440, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-hyderabad",
    name: "International Institute of Information Technology, Hyderabad",
    shortName: "IIIT Hyderabad",
    type: "Non-JoSAA",
    location: "Hyderabad, Telangana",
    nirfRank: 55,
    established: 1998,
    campusArea: "66 Acres",
    description: "IIIT Hyderabad is widely regarded as one of India's absolute best computer science institutes. Its curriculum begins coding from Semester 1 and boasts world-class research coding groups (GSOC, ACM-ICPC toppers). ADMISSIONS: Admissions are conducted independently of JoSAA counseling via IIIT-H's own portal channels (including UGEE, JEE-Main Mode, SPEC, and DASA).",
    admissionType: "JEE-Main",
    placements: {
      highest: 102.5,
      average: 30.2,
      median: 28,
      recruiters: ["Google","Facebook","Microsoft","Salesforce","Apple","Uber","Cohesity"],
      description: "Stellar placements surpassing almost all IITs. CSE average stands at an unbelievable 32 LPA, and ECE average is 26 LPA."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering (4-year BTech)", baseClosingRankOPEN: 350 },
      { code: "ECE", name: "Electronics and Communication Engineering (4-year BTech)", baseClosingRankOPEN: 950 }
    ]
  },
  {
    id: "iiit-allahabad",
    name: "Indian Institute of Technology, Allahabad",
    shortName: "IIIT Allahabad",
    type: "IIIT",
    location: "Prayagraj, Uttar Pradesh",
    nirfRank: 89,
    established: 1999,
    campusArea: "100 Acres",
    description: "An Institute of National Importance specialized in Information Technology. IIIT Allahabad has a fierce reputation for ACM-ICPC, competitive programming, and stellar placements.",
    admissionType: "JEE-Main",
    placements: {
      highest: 82.5,
      average: 25.8,
      median: 22,
      recruiters: ["Amazon","Cisco","Morgan Sachs","Directi","CodeNation","Walmart"],
      description: "Insanely strong software-focused outcomes. Coding culture is among the strongest in Asia."
    },
    branches: [
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 4800 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 8500 },
      { code: "ITBI", name: "IT with Business Informatics", baseClosingRankOPEN: 5500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "mnnit-allahabad",
    name: "Motilal Nehru National Institute of Technology",
    shortName: "MNNIT Allahabad",
    type: "NIT",
    location: "Prayagraj, Uttar Pradesh",
    nirfRank: 47,
    established: 1961,
    campusArea: "222 Acres",
    description: "Motilal Nehru National Institute of Technology, Allahabad is a leading NIT famed for its remarkable computer science coding culture and its outstanding rankings in technology placements.",
    admissionType: "JEE-Main",
    placements: {
      highest: 135,
      average: 17.2,
      median: 13.5,
      recruiters: ["Google","Amazon","Directi","Goldman Sachs","Uber","De Shaw"],
      description: "Highly competitive developer placements. CSE branch average stands at an incredible 27.6 LPA, and overall campus average is 17.2 LPA."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1400 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 3800 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 6800 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 11200 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 5600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 18500 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 8400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 8960, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-calicut",
    name: "National Institute of Technology, Calicut",
    shortName: "NIT Calicut",
    type: "NIT",
    location: "Kozhikode, Kerala",
    nirfRank: 23,
    established: 1961,
    campusArea: "291 Acres",
    description: "National Institute of Technology Calicut is one of the premier national-level institutions for technical education in Kozhikode, Kerala. It features an exceptionally scenic green campus and high research output.",
    admissionType: "JEE-Main",
    placements: {
      highest: 50,
      average: 13.5,
      median: 10.5,
      recruiters: ["Oracle","Intel","Cisco","Siemens","Capgemini","Tata Motors"],
      description: "Consistent placement performance with solid engineering sector hiring and premium IT opportunities."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 3200 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 7500 },
      { code: "EE", name: "Electrical and Electronics Engineering", baseClosingRankOPEN: 11500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 18000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 12800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 29000 },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 24000, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-rourkela",
    name: "National Institute of Technology, Rourkela",
    shortName: "NIT Rourkela",
    type: "NIT",
    location: "Rourkela, Odisha",
    nirfRank: 16,
    established: 1961,
    campusArea: "1200 Acres",
    description: "National Institute of Technology Rourkela is one of the largest NIT campuses in the country, boasting brilliant infrastructure, high research excellence, and strong PSU partnerships.",
    admissionType: "JEE-Main",
    placements: {
      highest: 48,
      average: 13.8,
      median: 10.2,
      recruiters: ["Tata Steel","Schlumberger","PwC","Qualcomm","ExxonMobil","L&T"],
      description: "Top-tier recruitment across IT, Core Engineering, Analytics and Management Consulting tracks."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2600 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 5850 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 9500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 16000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 10400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 25000 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 15600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 16640, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 18720, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 19500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "vnit-nagpur",
    name: "Visvesvaraya National Institute of Technology",
    shortName: "VNIT Nagpur",
    type: "NIT",
    location: "Nagpur, Maharashtra",
    nirfRank: 41,
    established: 1960,
    campusArea: "215 Acres",
    description: "VNIT Nagpur is situated in Central India. It is highly valued for its intense academic quality, superb labs, and close industrial ties with Western Indian corporations.",
    admissionType: "JEE-Main",
    placements: {
      highest: 40.5,
      average: 11.8,
      median: 9.5,
      recruiters: ["Bain & Company","Maruti Suzuki","Cummins","Accenture","Infosys","Adani Group"],
      description: "Distinguished sector placement records with active participation of both tech and classical infrastructure enterprises."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 4500 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 8800 },
      { code: "EE", name: "Electrical and Electronics Engineering", baseClosingRankOPEN: 13500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 22000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 18000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 32000 },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 28800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 32400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 33750, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "svnit-surat",
    name: "Sardar Vallabhbhai National Institute of Technology",
    shortName: "SVNIT Surat",
    type: "NIT",
    location: "Surat, Gujarat",
    nirfRank: 59,
    established: 1961,
    campusArea: "250 Acres",
    description: "SVNIT Surat is a key node for engineering study in Western India, highly rated for chemical, electrical and civil academic pathways, backed by Gujarat's industrial belt.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 10.5,
      median: 8.8,
      recruiters: ["Reliance Industries","L&T","Shell","Tata Power","Capgemini","GIFT City"],
      description: "Consistent placement outputs across petrochemical domains, core mechanical pipelines, and commercial IT circles."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5500 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 10500 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 16000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 26050 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 22000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 38000 }
    ]
  },
  {
    id: "manit-bhopal",
    name: "Maulana Azad National Institute of Technology",
    shortName: "MANIT Bhopal",
    type: "NIT",
    location: "Bhopal, Madhya Pradesh",
    nirfRank: 80,
    established: 1960,
    campusArea: "650 Acres",
    description: "One of the earliest RECs of India. MANIT Bhopal comprises massive infrastructure and a sprawling campus supporting premium engineering programs.",
    admissionType: "JEE-Main",
    placements: {
      highest: 38,
      average: 10.2,
      median: 8.5,
      recruiters: ["Eicher","Tata Motors","Capgemini","Tech Mahindra","Wipro","HCL"],
      description: "Sound placement distributions supporting broad choices in mechanical, civil and computer engineering streams."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 6200 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 12000 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 18500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 28000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 24800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 41000 },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 46500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-raipur",
    name: "National Institute of Technology, Raipur",
    shortName: "NIT Raipur",
    type: "NIT",
    location: "Raipur, Chhattisgarh",
    nirfRank: 101,
    established: 1956,
    campusArea: "100 Acres",
    description: "A leading regional seat of engineering education in Raipur, Chhattisgarh, characterized by solid core placements and IT support.",
    admissionType: "JEE-Main",
    placements: {
      highest: 32.5,
      average: 9.2,
      median: 8,
      recruiters: ["Vedanta","BALCO","Wipro","Cognizant","L&T","JSW Steel"],
      description: "Generous recruitment in mining, metallurgical, civil, and computer software sectors."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 11000 },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 13750, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 18000 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 25000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 35000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 44000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 48000 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 66000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 70400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 79200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 82500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-srinagar",
    name: "National Institute of Technology, Srinagar",
    shortName: "NIT Srinagar",
    type: "NIT",
    location: "Srinagar, Jammu and Kashmir",
    nirfRank: 151,
    established: 1960,
    campusArea: "67 Acres",
    description: "Located near the pristine Dal Lake in Srinagar, this NIT offers beautiful academic facilities and caters to a large pool of high-rank aspirants under native state quotas.",
    admissionType: "JEE-Main",
    placements: {
      highest: 26,
      average: 8.4,
      median: 7.2,
      recruiters: ["L&T Construction","NHPC","Tata Consultancy Services","Capgemini","Infosys"],
      description: "Diverse selections across software consulting, infrastructural bodies, and central power generation PSUs."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 22000 },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 27500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 32000 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 45000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 55000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 88000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 68000 },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 140800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-agartala",
    name: "National Institute of Technology, Agartala",
    shortName: "NIT Agartala",
    type: "NIT",
    location: "Agartala, Tripura",
    nirfRank: 91,
    established: 1965,
    campusArea: "365 Acres",
    description: "NIT Agartala is a premium technology institute in Northeast India, providing highly stable academic avenues and comprehensive laboratory spaces.",
    admissionType: "JEE-Main",
    placements: {
      highest: 30,
      average: 8.9,
      median: 7.8,
      recruiters: ["TCS","Accenture","L&T","PowerGrid","ONGC","Vedanta"],
      description: "Excellent PSU selections and stable placements across service sector software players."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 19000 },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 28000 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 38000 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 49000 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 76000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 62000 },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 114000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-mandi",
    name: "Indian Institute of Technology, Mandi",
    shortName: "IIT Mandi",
    type: "IIT",
    location: "Mandi, Himachal Pradesh",
    nirfRank: 33,
    established: 2009,
    campusArea: "538 Acres",
    description: "Nestled in the picturesque Uhl River Valley, IIT Mandi is specialized in mountain-hazard modeling, modern computation sciences, and green technology.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 60.5,
      average: 15.8,
      median: 14,
      recruiters: ["Amazon","Microsoft","Yahoo","Texas Instruments","Qualcomm","Amdocs"],
      description: "Extremely strong showing in computing and microelectronics sectors with premium software roles."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2800 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 6500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 9500 },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 13500 }
    ]
  },
  {
    id: "iit-jammu",
    name: "Indian Institute of Technology, Jammu",
    shortName: "IIT Jammu",
    type: "IIT",
    location: "Jammu, Jammu and Kashmir",
    nirfRank: 67,
    established: 2016,
    campusArea: "400 Acres",
    description: "One of the younger, state-of-the-art IIT campuses featuring world-class digital learning labs and custom industry partnerships.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 48,
      average: 12.5,
      median: 11.2,
      recruiters: ["Intel","Cognizant","Nvidia","TCS","Axxela","Adani Group"],
      description: "Growing corporate ties backing fast rising ratios of graduate selections year-over-year."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5200 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 9800 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 13800 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 21840, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 16800 }
    ]
  },
  {
    id: "iit-gandhinagar",
    name: "Indian Institute of Technology, Gandhinagar",
    shortName: "IIT Gandhinagar",
    type: "IIT",
    location: "Gandhinagar, Gujarat",
    nirfRank: 18,
    established: 2008,
    campusArea: "400 Acres",
    description: "Eminent for its flexible academic curriculum, inter-disciplinary research initiatives, and extensive global student exchange connections.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 62,
      average: 16.9,
      median: 14.5,
      recruiters: ["Google","InMobi","Barclays","Oracle","HSBC","Tata Motors"],
      description: "Spectacular global and local offers across elite consulting agencies, fintech desks and computer graphics hubs."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1500 },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 4100 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 7200 },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 6300, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 10500 },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 9600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-gwalior",
    name: "Atal Bihari Vajpayee Indian Institute of Information Technology",
    shortName: "IIIT Gwalior",
    type: "IIIT",
    location: "Gwalior, Madhya Pradesh",
    nirfRank: 68,
    established: 1997,
    campusArea: "150 Acres",
    description: "An elite premier institute specialized in dual-degree programs, computer science and information technology in Gwalior.",
    admissionType: "JEE-Main",
    placements: {
      highest: 65,
      average: 18.5,
      median: 15,
      recruiters: ["Directi","Microsoft","Paypal","Goldman Sachs","Amazon","Myntra"],
      description: "Exceptional CP-driven placements and tech placements matching first tier NIT stats."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 7500 },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 8200 },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 9750, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 13500 }
    ]
  },
  {
    id: "iiit-jabalpur",
    name: "Indian Institute of Information Technology, Design and Manufacturing",
    shortName: "IIIT Jabalpur",
    type: "IIIT",
    location: "Jabalpur, Madhya Pradesh",
    nirfRank: 97,
    established: 2005,
    campusArea: "260 Acres",
    description: "An Institute of National Importance centered around smart manufacturing, high fidelity engineering product designs, and software systems.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 13.2,
      median: 11,
      recruiters: ["Amazon","Oracle","Cisco","Intel","Amadeus","Infosys"],
      description: "Highly stable IT and product hardware design sector recruitments with excellent career progression."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 12500 },
      { code: "CSD", name: "Computer Science and Design", baseClosingRankOPEN: 17500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 18500 },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 45000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-lucknow",
    name: "Indian Institute of Information Technology, Lucknow",
    shortName: "IIIT Lucknow",
    type: "IIIT",
    location: "Lucknow, Uttar Pradesh",
    nirfRank: 110,
    established: 2015,
    campusArea: "50 Acres",
    description: "Boasts some of the fastest growing tech placements in the region, highly focused on pure IT, artificial intelligence, and computing modules.",
    admissionType: "JEE-Main",
    placements: {
      highest: 59,
      average: 20.8,
      median: 18.5,
      recruiters: ["Flipkart","Amazon","Salesforce","Directi","Deloitte","Nutonix"],
      description: "Intense coding culture yielding software engineer placements averaging 20+ LPA across general batches."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 9500 },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 11500 },
      { code: "CSB", name: "Computer Science and Business Systems", baseClosingRankOPEN: 13775, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-guwahati",
    name: "Indian Institute of Technology, Guwahati",
    shortName: "IIT Guwahati",
    type: "IIT",
    location: "Guwahati, Assam",
    nirfRank: 7,
    established: 1994,
    campusArea: "700 Acres",
    description: "Nestled on the banks of the Brahmaputra River, IIT Guwahati is famous for its stunning scenery, world-class research facilities, and major academic contributions in supercomputing and design.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 120,
      average: 21.2,
      median: 18.2,
      recruiters: ["Google","Microsoft","Intel","TSMC","Goldman Sachs"],
      description: "Superb non-core and software recruitment rates with prominent global research fellowships."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 580, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 928, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 1276, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 2204, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 2436, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 3190, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 3480, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-hyderabad-iit",
    name: "Indian Institute of Technology, Hyderabad",
    shortName: "IIT Hyderabad",
    type: "IIT",
    location: "Kandi, Telangana",
    nirfRank: 8,
    established: 2008,
    campusArea: "576 Acres",
    description: "Highly ranked Second-Generation IIT noted for its extreme research density, strong collaboration with Japanese universities, and leading-edge AI, VLSI, and 5G networking courses.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 95,
      average: 20.4,
      median: 17.5,
      recruiters: ["Sony","Toyota","Suzuki","Microsoft","Uber","Nvidia"],
      description: "Elite placement metrics driven heavily by international corporate collaborations in deep-tech."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 620, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence", baseClosingRankOPEN: 713, degrees: ["B.Tech (4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 992, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 1364, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 2356, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 2604, degrees: ["B.Tech (4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 3410, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Materials Science and Metallurgical Engineering", baseClosingRankOPEN: 3968, degrees: ["B.Tech (4 Years)"] },
      { code: "BME", name: "Biomedical Engineering", baseClosingRankOPEN: 8500, degrees: ["B.Tech (4 Years)"] },
      { code: "BT", name: "Biotechnology and Bioinformatics", baseClosingRankOPEN: 9000, degrees: ["B.Tech (4 Years)"] },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 5500, degrees: ["B.Tech (4 Years)"] },
      { code: "COMPE", name: "Computational Engineering", baseClosingRankOPEN: 4200, degrees: ["B.Tech (4 Years)"] },
      { code: "IC", name: "Industrial Chemistry", baseClosingRankOPEN: 9500, degrees: ["B.Tech (4 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 1100, degrees: ["B.Tech (4 Years)"] },
      { code: "ES", name: "Engineering Science", baseClosingRankOPEN: 3800, degrees: ["B.Tech (4 Years)"] }
    ]
  },
  {
    id: "iit-bhu",
    name: "Indian Institute of Technology (BHU), Varanasi",
    shortName: "IIT BHU",
    type: "IIT",
    location: "Varanasi, Uttar Pradesh",
    nirfRank: 15,
    established: 1919,
    campusArea: "400 Acres",
    description: "One of the oldest engineering institutions in India, integrated into the prestigious Banaras Hindu University. Famed for its unmatched alumni network and deep core industrial research.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 120,
      average: 19.8,
      median: 16.5,
      recruiters: ["Google","Uber","Sprinklr","Tata Steel","Reliance"],
      description: "Stellar placements driven by high placement conversion rates and deep metallurgy, mining & CSE track records."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 850, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 1360, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 1870, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 3230, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 3570, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 4675, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 5440, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 6120, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 6375, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "iit-dhanbad",
    name: "Indian Institute of Technology (ISM), Dhanbad",
    shortName: "IIT ISM Dhanbad",
    type: "IIT",
    location: "Dhanbad, Jharkhand",
    nirfRank: 17,
    established: 1926,
    campusArea: "393 Acres",
    description: "Initiated by the Royal Commission of India on the model of Royal School of Mines London, specializing heavily in Earth Sciences, Mining, Petroleum, and robust computer sciences.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 83,
      average: 16.2,
      median: 13.8,
      recruiters: ["Cisco","Amazon","Coal India","ONGC","Walmart"],
      description: "Leading earth sciences and public sector (PSU) recruitment coupled with outstanding IT placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 6160, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 10640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 11760, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 15400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 17920, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 20160, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-indore",
    name: "Indian Institute of Technology, Indore",
    shortName: "IIT Indore",
    type: "IIT",
    location: "Indore, Madhya Pradesh",
    nirfRank: 14,
    established: 2009,
    campusArea: "501 Acres",
    description: "A premier research hub located in the commercial heart of Madhya Pradesh, emphasizing advanced clean energy, VLSI design, and biosensors research.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 68,
      average: 17.8,
      median: 15.2,
      recruiters: ["Microsoft","DE Shaw","Intel","Samsung","Deloitte"],
      description: "Strong Software and FinTech participation with rapid growth in electronics core placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 2420, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 4180, degrees: ["B.Tech (4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 6050, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Metallurgical Engineering and Materials Science", baseClosingRankOPEN: 7040, degrees: ["B.Tech (4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 7800, degrees: ["B.Tech (4 Years)"] },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 8200, degrees: ["B.Tech (4 Years)"] },
      { code: "SSE", name: "Space Sciences and Engineering", baseClosingRankOPEN: 9200, degrees: ["B.Tech (4 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 2100, degrees: ["B.Tech (4 Years)"] }
    ]
  },
  {
    id: "iit-ropar",
    name: "Indian Institute of Technology, Ropar",
    shortName: "IIT Ropar",
    type: "IIT",
    location: "Rupnagar, Punjab",
    nirfRank: 22,
    established: 2008,
    campusArea: "500 Acres",
    description: "Established on the banks of Satluj River, showing supreme research indexes in agricultural engineering, clean energy, and cyber-security integrations.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 55,
      average: 16.5,
      median: 14.1,
      recruiters: ["Amazon","Oracle","Goldman Sachs","Mahindra","Cognizant"],
      description: "Superb software engineering placements alongside growing core sector internship conversions."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 3960, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 6840, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 7560, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 9900, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 11520, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-patna",
    name: "Indian Institute of Technology, Patna",
    shortName: "IIT Patna",
    type: "IIT",
    location: "Patna, Bihar",
    nirfRank: 41,
    established: 2008,
    campusArea: "501 Acres",
    description: "Highly rising institute driving major research across smart grid technologies, computational linguistics, and advanced materials engineering.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 82,
      average: 15.9,
      median: 13.5,
      recruiters: ["Samsung","Byjus","TCS","Amazon","Wipro"],
      description: "Partially remote but top-tier consulting and computer science results with international offers."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2600, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 5720, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 9880, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 14300, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 10920, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 16640, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 3100, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 4200, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)", "Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EP", name: "Engineering Physics", baseClosingRankOPEN: 11500, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 4500, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)"] },
      { code: "CH", name: "Chemical and Biochemical Engineering", baseClosingRankOPEN: 12000, degrees: ["B.Tech (4 Years)", "Dual Degree (B.Tech + MBA, 5 Years)"] },
      { code: "BS-MTH", name: "Mathematics", baseClosingRankOPEN: 13000, degrees: ["B.S. (Bachelor of Science, 4 Years)", "Dual Degree (B.S. + M.S., 5 Years)"] }
    ]
  },
  {
    id: "iit-bhubaneswar",
    name: "Indian Institute of Technology, Bhubaneswar",
    shortName: "IIT Bhubaneswar",
    type: "IIT",
    location: "Bhubaneswar, Odisha",
    nirfRank: 47,
    established: 2008,
    campusArea: "936 Acres",
    description: "With one of the largest campus footprints, this institute runs deep maritime engineering, metal casting tech, and AI modeling programs.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 56,
      average: 15.1,
      median: 12.8,
      recruiters: ["L&T","Dassault","Directi","Publicis Sapient","Bosch"],
      description: "Solid steel, core power, and software development outreach across national corporations."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 2900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 4640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 6380, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 11020, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 15950, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 18560, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-tirupati",
    name: "Indian Institute of Technology, Tirupati",
    shortName: "IIT Tirupati",
    type: "IIT",
    location: "Tirupati, Andhra Pradesh",
    nirfRank: 59,
    established: 2015,
    campusArea: "548 Acres",
    description: "A third-generation IIT situated in the foothills of Tirumala, focused heavily on food technology, smart infrastructure, and next-gen communication systems.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 46,
      average: 13.9,
      median: 11.8,
      recruiters: ["Cisco","TCS","Cognizant","Arcesium","LTI"],
      description: "Emerging placement drive with stellar performance in core electronics and civil domains."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 12320, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 21280, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 23520, degrees: ["B.S. (Bachelor of Science, 4 Years)","Integrated M.S. (5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 30800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-palakkad",
    name: "Indian Institute of Technology, Palakkad",
    shortName: "IIT Palakkad",
    type: "IIT",
    location: "Palakkad, Kerala",
    nirfRank: 69,
    established: 2015,
    campusArea: "500 Acres",
    description: "Emphasizes sustainable energy, eco-friendly concrete systems, and strong robotics programs nestled among Kerala's Western Ghats.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 42,
      average: 13.5,
      median: 11.2,
      recruiters: ["Maruti","Broadcom","Mathworks","Infosys","IBM"],
      description: "Consistent software engineering and manufacturing operations roles with massive regional backing."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 12760, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 22040, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 31900, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-dharwad",
    name: "Indian Institute of Technology, Dharwad",
    shortName: "IIT Dharwad",
    type: "IIT",
    location: "Dharwad, Karnataka",
    nirfRank: 93,
    established: 2016,
    campusArea: "470 Acres",
    description: "A fast-developing academic site in Karnataka's educational hub, hosting key microelectronics and heavy machinery research structures.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 40,
      average: 12.8,
      median: 10.9,
      recruiters: ["Intel","Mercedes-Benz","Capgemini","Airtel","ZS Associates"],
      description: "Rapid scale-up in software development internships and core embedded systems hiring."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 11440, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 19760, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 28600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-bhilai",
    name: "Indian Institute of Technology, Bhilai",
    shortName: "IIT Bhilai",
    type: "IIT",
    location: "Raipur, Chhattisgarh",
    nirfRank: 81,
    established: 2016,
    campusArea: "432 Acres",
    description: "Chhattisgarh's premier advanced institute pioneering structural developments in defense manufacturing, automation, and data analytics.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 48,
      average: 13.1,
      median: 11,
      recruiters: ["DRDO","ISRO","Cognizant","Capgemini","Amazon"],
      description: "Rising defense-tech research and strong public-private sector employment listings."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 4600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 10120, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 17480, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 29440, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iit-goa",
    name: "Indian Institute of Technology, Goa",
    shortName: "IIT Goa",
    type: "IIT",
    location: "Farmagudi, Goa",
    nirfRank: 90,
    established: 2016,
    campusArea: "320 Acres",
    description: "Fosters creative coding environments and naval architecture modules along the scenic Indian west coast.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 60,
      average: 14.5,
      median: 12.5,
      recruiters: ["Intel","Cisco","Deloitte","Paytm","Google"],
      description: "Highly active tech-campuses hiring for full-stack, data scientist, and analytics associates."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 4600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 10120, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 17480, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iit-jodhpur",
    name: "Indian Institute of Technology, Jodhpur",
    shortName: "IIT Jodhpur",
    type: "IIT",
    location: "Jodhpur, Rajasthan",
    nirfRank: 30,
    established: 2008,
    campusArea: "852 Acres",
    description: "Recognized for its state-of-the-art virtual reality systems, IoT networks, and advanced desert environmental technologies.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 61,
      average: 15.8,
      median: 13.2,
      recruiters: ["Oracle","Goldman Sachs","Siemens","TCS","Nvidia"],
      description: "Well developed IT-track placements with significant industry focus on VR/AR and AI systems."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 1380, degrees: ["B.Tech (4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 2640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 4560, degrees: ["B.Tech (4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 5040, degrees: ["B.Tech (4 Years)"] },
      { code: "CE", name: "Civil and Infrastructure Engineering", baseClosingRankOPEN: 6600, degrees: ["B.Tech (4 Years)"] },
      { code: "MTE", name: "Materials Engineering", baseClosingRankOPEN: 7680, degrees: ["B.Tech (4 Years)"] },
      { code: "BE", name: "Bioengineering", baseClosingRankOPEN: 9200, degrees: ["B.Tech (4 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 3100, degrees: ["B.Tech (4 Years)"] },
      { code: "BS-PHY", name: "Physics", baseClosingRankOPEN: 11200, degrees: ["B.S. (Bachelor of Science, 4 Years)"] },
      { code: "BS-CHM", name: "Chemistry", baseClosingRankOPEN: 12500, degrees: ["B.S. (Bachelor of Science, 4 Years)"] }
    ]
  },
  {
    id: "nit-jaipur",
    name: "Malaviya National Institute of Technology, Jaipur",
    shortName: "MNIT Jaipur",
    type: "NIT",
    location: "Jaipur, Rajasthan",
    nirfRank: 37,
    established: 1963,
    campusArea: "317 Acres",
    description: "MNIT Jaipur is one of the premier NITs in North India, highly distinguished for its spectacular architecture, strong metallurgy, and premium silicon core placement ratios.",
    admissionType: "JEE-Main",
    placements: {
      highest: 64,
      average: 14.2,
      median: 12.1,
      recruiters: ["Salesforce","DE Shaw","Amazon","L&T","Deloitte"],
      description: "Stellar placements across all IT, consulting, and core infrastructure management streams."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 3800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 5700, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 8360, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 13680, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 15200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 19760, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 24320, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 28500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-kurukshetra",
    name: "National Institute of Technology, Kurukshetra",
    shortName: "NIT Kurukshetra",
    type: "NIT",
    location: "Kurukshetra, Haryana",
    nirfRank: 58,
    established: 1963,
    campusArea: "300 Acres",
    description: "National Institute of National Importance rooted in ancient cultural heritage, boasting heavy-industry labs, high-tech computer clusters, and extremely rigorous engineering systems.",
    admissionType: "JEE-Main",
    placements: {
      highest: 52,
      average: 13.5,
      median: 11.5,
      recruiters: ["Adani","Cisco","Walmart","Oracle","Symphony"],
      description: "Excellent high-intensity recruiting from civil services, engineering, and digital solutions sectors."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 5900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 7375, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 8850, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 12980, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 21240, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 30680, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-jamshedpur",
    name: "National Institute of Technology, Jamshedpur",
    shortName: "NIT Jamshedpur",
    type: "NIT",
    location: "Jamshedpur, Jharkhand",
    nirfRank: 79,
    established: 1960,
    campusArea: "340 Acres",
    description: "Famous for its close alignment with state heavy industrial centers like Tata Steel and Tata Motors. Excellent core metallurgy, mining, along with high percentage computer science outcomes.",
    admissionType: "JEE-Main",
    placements: {
      highest: 80,
      average: 14.8,
      median: 12,
      recruiters: ["Tata Motors","Tata Steel","Amazon","Samsung","Qualcomm"],
      description: "Exceptional placement rates exceeding 95% in mechanical, metallurgy, and software branches."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 7200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 10800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 15840, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 25920, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 37440, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "PE", name: "Production and Industrial Engineering", baseClosingRankOPEN: 41760, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 46080, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-durgapur",
    name: "National Institute of Technology, Durgapur",
    shortName: "NIT Durgapur",
    type: "NIT",
    location: "Durgapur, West Bengal",
    nirfRank: 43,
    established: 1960,
    campusArea: "250 Acres",
    description: "A historical institution driving steel belt and structural research in West Bengal. Exceptionally mature computer science laboratories and a long history of elite engineering alumni.",
    admissionType: "JEE-Main",
    placements: {
      highest: 51,
      average: 12.9,
      median: 11,
      recruiters: ["PwC","Capgemini","Cognizant","L&T","Microsoft"],
      description: "Solid IT consultancy, data science and structural manufacturing listings consistently each round."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 8500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 12750, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 18700, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 30600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 34000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 44200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 51000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 54400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-jalandhar",
    name: "Dr. B. R. Ambedkar National Institute of Technology",
    shortName: "NIT Jalandhar",
    type: "NIT",
    location: "Jalandhar, Punjab",
    nirfRank: 46,
    established: 1987,
    campusArea: "154 Acres",
    description: "Fosters rich research in industrial biomechanics, modern chemistry, texturing, cyber-systems and heavy machinery design operations.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 11.8,
      median: 10.1,
      recruiters: ["Indus Valley","Intel","IBM","TCS","Accenture"],
      description: "Outstanding performance in software design sectors with deep local textile and mechanical placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 9200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 13800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 20240, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "INE", name: "Instrumentation and Control Engineering", baseClosingRankOPEN: 25760, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 33120, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 36800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 47840, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 55200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 58880, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-hamirpur",
    name: "National Institute of Technology, Hamirpur",
    shortName: "NIT Hamirpur",
    type: "NIT",
    location: "Hamirpur, Himachal Pradesh",
    nirfRank: 120,
    established: 1986,
    campusArea: "320 Acres",
    description: "Situated in the serene, snowcapped Shiwalik hills, featuring top-notch architectural design courses and solar photovoltaic cell study laboratories.",
    admissionType: "JEE-Main",
    placements: {
      highest: 42,
      average: 11.2,
      median: 9.6,
      recruiters: ["Zomato","Uber","Oracle","Paytm","Standard Chartered"],
      description: "Breathtaking campus atmosphere boasting software, heavy telecom, and design engineering tracks."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 8000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 12000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 17600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 28800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 32000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 41600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 60000, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "nit-patna-nit",
    name: "National Institute of Technology, Patna",
    shortName: "NIT Patna",
    type: "NIT",
    location: "Patna, Bihar",
    nirfRank: 56,
    established: 1886,
    campusArea: "40 Acres",
    description: "One of India's historically oldest technical institutes. Known for incredibly dedicated coding, outstanding research index, and a brand new massive campus in Bihta.",
    admissionType: "JEE-Main",
    placements: {
      highest: 50,
      average: 12.1,
      median: 10.5,
      recruiters: ["Cognizant","Accenture","L&T","Sopra Steria","Amdocs"],
      description: "Extremely active coding community resulting in exceptional placement volumes on and off campus."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 12000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 18000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 26400, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 43200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 62400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-silchar",
    name: "National Institute of Technology, Silchar",
    shortName: "NIT Silchar",
    type: "NIT",
    location: "Silchar, Assam",
    nirfRank: 40,
    established: 1967,
    campusArea: "625 Acres",
    description: "With an outstandingly vast and lush green campus, it's considered a powerhouse of core electrical power grid and computational mathematics research.",
    admissionType: "JEE-Main",
    placements: {
      highest: 55,
      average: 13.1,
      median: 11.2,
      recruiters: ["Airtel","Microsoft","Paytm","L&T","Publicis Sapient"],
      description: "Excellent high-tier tech hiring combined with great public sector PSU allocation ratios."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 10500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 15750, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 23100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "INE", name: "Instrumentation and Control Engineering", baseClosingRankOPEN: 29400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 37800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 54600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-goa-nit",
    name: "National Institute of Technology, Goa",
    shortName: "NIT Goa",
    type: "NIT",
    location: "Cuncolim, Goa",
    nirfRank: 90,
    established: 2010,
    campusArea: "300 Acres",
    description: "A fast rising destination for technology and design enthusiasts along the west coast. Excellent computational math setups.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 12.5,
      median: 11,
      recruiters: ["Goldman Sachs","Cisco","Siemens","Intel","Persistent"],
      description: "Strong core software product company representation due to smaller competitive batches."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 11500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 17250, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 25300, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 41400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 59800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-delhi-nit",
    name: "National Institute of Technology, Delhi",
    shortName: "NIT Delhi",
    type: "NIT",
    location: "Narela, Delhi",
    nirfRank: 51,
    established: 2010,
    campusArea: "51 Acres",
    description: "Located in the national capital territory. Rapidly rising due to massive industry proximity, prime tech clusters, and strong research alliances.",
    admissionType: "JEE-Main",
    placements: {
      highest: 55,
      average: 13.9,
      median: 12.4,
      recruiters: ["Amazon","Cisco","Samsung","Adobe","Deloitte"],
      description: "Stellar location-advantaged software placements and rapid year-on-year growth curves."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 8800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 13200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 19360, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 31680, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 45760, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-uttarakhand",
    name: "National Institute of Technology, Uttarakhand",
    shortName: "NIT Uttarakhand",
    type: "NIT",
    location: "Srinagar (Garhwal), Uttarakhand",
    nirfRank: 150,
    established: 2010,
    campusArea: "150 Acres",
    description: "Surrounded by gorgeous Himalayan mountains, this institute trains elite civil, electrical grid, and software designers.",
    admissionType: "JEE-Main",
    placements: {
      highest: 36,
      average: 9.8,
      median: 8.5,
      recruiters: ["Ford","Capgemini","Infosys","TATA","Wipro"],
      description: "Outstanding performance in national design contests and core manufacturing streams."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 27000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 39600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 64800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 93600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-mizoram",
    name: "National Institute of Technology, Mizoram",
    shortName: "NIT Mizoram",
    type: "NIT",
    location: "Aizawl, Mizoram",
    nirfRank: 160,
    established: 2010,
    campusArea: "190 Acres",
    description: "Pioneering state-of-the-art computer networks, smart communication systems and environmental geology studies.",
    admissionType: "JEE-Main",
    placements: {
      highest: 32,
      average: 9.1,
      median: 8,
      recruiters: ["Tech Mahindra","Wipro","TCS","Cognizant"],
      description: "Strong northeast regional alignment with consistent IT and logistics placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 33000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 49500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 72600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 118800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 171600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-nagaland",
    name: "National Institute of Technology, Nagaland",
    shortName: "NIT Nagaland",
    type: "NIT",
    location: "Chumukedima, Nagaland",
    nirfRank: 170,
    established: 2010,
    campusArea: "291 Acres",
    description: "A central technical gateway in Nagaland, specialized in next-generation high frequency telecom propagation.",
    admissionType: "JEE-Main",
    placements: {
      highest: 28,
      average: 8.9,
      median: 7.8,
      recruiters: ["Cognizant","TCS","Accenture","Infosys"],
      description: "Consistent regional state board tech and communications hire statistics."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 25500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 38250, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 56100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 91800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 132600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-manipur",
    name: "National Institute of Technology, Manipur",
    shortName: "NIT Manipur",
    type: "NIT",
    location: "Imphal, Manipur",
    nirfRank: 95,
    established: 2010,
    campusArea: "341 Acres",
    description: "Famed for its high rating in astrophysics research, core civil structural designs, and software tools.",
    admissionType: "JEE-Main",
    placements: {
      highest: 34,
      average: 9.3,
      median: 8.1,
      recruiters: ["L&T","PowerGrid","Wipro","TCS","Amdocs"],
      description: "Solid placement rates in public construction corporations and software developer clusters."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 25500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 38250, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 56100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 91800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 132600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-meghalaya",
    name: "National Institute of Technology, Meghalaya",
    shortName: "NIT Meghalaya",
    type: "NIT",
    location: "Shillong, Meghalaya",
    nirfRank: 72,
    established: 2010,
    campusArea: "300 Acres",
    description: "Highly ranked in the beautiful landscape of Shillong, running premier research in energy conservation and IoT setups.",
    admissionType: "JEE-Main",
    placements: {
      highest: 41,
      average: 11.5,
      median: 10,
      recruiters: ["BPCL","L&T","Samsung","Deloitte","Zendesk"],
      description: "Strong analytics, petroleum core and information security hiring outcomes."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 36000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 54000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 79200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 129600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 187200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-arunachal",
    name: "National Institute of Technology, Arunachal Pradesh",
    shortName: "NIT Arunachal",
    type: "NIT",
    location: "Yupia, Arunachal Pradesh",
    nirfRank: 180,
    established: 2010,
    campusArea: "150 Acres",
    description: "Developing specialized technology systems for seismic monitoring, hydro power and remote wireless nodes.",
    admissionType: "JEE-Main",
    placements: {
      highest: 26,
      average: 8.5,
      median: 7.4,
      recruiters: ["Pioneer","Sasken","Wipro","Capgemini"],
      description: "Consistent software product testing and telemetry operator placement lines."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 27000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 39600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 64800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 93600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-sikkim",
    name: "National Institute of Technology, Sikkim",
    shortName: "NIT Sikkim",
    type: "NIT",
    location: "Ravangla, Sikkim",
    nirfRank: 190,
    established: 2010,
    campusArea: "150 Acres",
    description: "Prompts spectacular high-altitude micro-meteorological and climate computing modules in Sikkim.",
    admissionType: "JEE-Main",
    placements: {
      highest: 30,
      average: 9,
      median: 8,
      recruiters: ["Tech Mahindra","Infosys","Intel","Cognizant"],
      description: "Superb research track with stable regional consulting and software placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 33000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 49500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 72600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 118800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 171600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-puducherry",
    name: "National Institute of Technology, Puducherry",
    shortName: "NIT Puducherry",
    type: "NIT",
    location: "Karaikal, Puducherry",
    nirfRank: 101,
    established: 2010,
    campusArea: "258 Acres",
    description: "Prominent coastal institute known for great research in marine acoustics, satellite antennas, and computing logic.",
    admissionType: "JEE-Main",
    placements: {
      highest: 40,
      average: 10.9,
      median: 9.4,
      recruiters: ["Broadcom","ZOHO","Nokia","Tata Elxsi","Cognizant"],
      description: "High percentage placement lists particularly in core hardware VLSI and electronics."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 34500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 51750, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 75900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 124200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 179400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "nit-andhra",
    name: "National Institute of Technology, Andhra Pradesh",
    shortName: "NIT Andhra Pradesh",
    type: "NIT",
    location: "Tadepalligudem, Andhra Pradesh",
    nirfRank: 125,
    established: 2015,
    campusArea: "178 Acres",
    description: "The youngest NIT, showing record-breaking growth indices in cyber security, smart grid networks, and data modules.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 11.2,
      median: 9.8,
      recruiters: ["Amazon","Deloitte","Adani","Accenture","ADP"],
      description: "Fast expanding corporate tie-ups with superb software developer hiring trends."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 25500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 38250, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 56100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 91800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 102000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 132600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 153000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 163200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiest-shibpur",
    name: "Indian Institute of Engineering Science and Technology, Shibpur",
    shortName: "IIEST Shibpur",
    type: "NIT",
    location: "Howrah, West Bengal",
    nirfRank: 35,
    established: 1856,
    campusArea: "121 Acres",
    description: "One of the oldest technical universities in the country. Admitted under NIT category in JoSAA, famed for highly classical architecture, geology, and core sectors.",
    admissionType: "JEE-Main",
    placements: {
      highest: 55,
      average: 12.8,
      median: 11.2,
      recruiters: ["Microsoft","Wells Fargo","Price Waterhouse","Tata Steel","CESC"],
      description: "Classical, deep industrial hiring accompanied by premium finance and backend consulting offers."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 11200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 16800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 24640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 40320, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 58240, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 71680, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "MIN", name: "Mining Engineering", baseClosingRankOPEN: 80640, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 84000, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "iiit-kancheepuram",
    name: "Indian Institute of Information Technology, Design and Manufacturing, Kancheepuram",
    shortName: "IIIT DM Kancheepuram",
    type: "IIIT",
    location: "Chennai, Tamil Nadu",
    nirfRank: 101,
    established: 2007,
    campusArea: "180 Acres",
    description: "A center of excellence in smart cyber-physical manufacturing systems, microelectronics fabrication, and computer-integrated engineering graphics.",
    admissionType: "JEE-Main",
    placements: {
      highest: 37,
      average: 11.6,
      median: 9.8,
      recruiters: ["AMD","Nvidia","Samsung","Qualcomm","Cognizant"],
      description: "Excellent high-frequency corporate interest in product design engineering and database roles."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 14500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 26100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 52200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-pune",
    name: "Indian Institute of Information Technology, Pune",
    shortName: "IIIT Pune",
    type: "IIIT",
    location: "Pune, Maharashtra",
    nirfRank: 121,
    established: 2016,
    campusArea: "100 Acres",
    description: "Extremely robust tech-hub placements and coding environment, centered on cloud engineering, distributed ledger, and neural systems.",
    admissionType: "JEE-Main",
    placements: {
      highest: 53,
      average: 16.8,
      median: 14.5,
      recruiters: ["Adobe","Yandex","Nutonix","Google","Amazon"],
      description: "Outstanding performance in competitive programming and premium off-campus and on-campus IT placement ratios."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 7800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 14040, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-kota",
    name: "Indian Institute of Information Technology, Kota",
    shortName: "IIIT Kota",
    type: "IIIT",
    location: "Ranpur, Rajasthan",
    nirfRank: 130,
    established: 2013,
    campusArea: "120 Acres",
    description: "Mentored initially by MNIT Jaipur, this site hosts highly focused programming blocks, security labs and computer architectures.",
    admissionType: "JEE-Main",
    placements: {
      highest: 40,
      average: 12.2,
      median: 10.5,
      recruiters: ["Capgemini","Amazon","Samsung","TCS","Accenture"],
      description: "Consistently rising core IT product company selections driven by solid software training drills."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 33300, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-vadodara",
    name: "Indian Institute of Information Technology, Vadodara",
    shortName: "IIIT Vadodara",
    type: "IIIT",
    location: "Vadodara, Gujarat",
    nirfRank: 140,
    established: 2013,
    campusArea: "100 Acres",
    description: "Under the PPP model, delivering heavy output across machine learning models, cyber defenses and big data architecture labs.",
    admissionType: "JEE-Main",
    placements: {
      highest: 43,
      average: 13.5,
      median: 11.8,
      recruiters: ["Amazon","Adobe","Mathworks","QuickHeal","Nokia"],
      description: "Highly praised computer science outcomes with multi-million packages in software development."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 15500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 20150, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-sricity",
    name: "Indian Institute of Information Technology, Sri City",
    shortName: "IIIT Sri City",
    type: "IIIT",
    location: "Sri City, Andhra Pradesh",
    nirfRank: 112,
    established: 2013,
    campusArea: "80 Acres",
    description: "Located near massive industrial hubs, attracting stellar global computing research, cyber-physical automation, and IT infrastructure setups.",
    admissionType: "JEE-Main",
    placements: {
      highest: 45,
      average: 14.1,
      median: 12,
      recruiters: ["Microsoft","Amazon","Silicon Labs","Intel","IBM"],
      description: "Location advantage results in extreme placement conversion rates across multi-national software giants."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 12500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 14375, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 22500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-guwahati-iiit",
    name: "Indian Institute of Information Technology, Guwahati",
    shortName: "IIIT Guwahati",
    type: "IIIT",
    location: "Guwahati, Assam",
    nirfRank: 151,
    established: 2013,
    campusArea: "67 Acres",
    description: "A premier central IT gateway in the northeast, specializing in natural language processing and computer vision systems.",
    admissionType: "JEE-Main",
    placements: {
      highest: 38,
      average: 11.9,
      median: 10.1,
      recruiters: ["Wipro","TCS","Capgemini","Amazon","Broadcom"],
      description: "Outstanding performance in national hackathons and northeast data system consulting."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 14000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 25200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-kalyani",
    name: "Indian Institute of Information Technology, Kalyani",
    shortName: "IIIT Kalyani",
    type: "IIIT",
    location: "Kalyani, West Bengal",
    nirfRank: 161,
    established: 2014,
    campusArea: "50 Acres",
    description: "Providing modern research environments for cloud software design, cryptography, and image analytics.",
    admissionType: "JEE-Main",
    placements: {
      highest: 28,
      average: 9.8,
      median: 8.5,
      recruiters: ["Virtusa","Cognizant","TCS","Infosys"],
      description: "Solid software engineer trainee, cloud logistics and associate placement stats."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 29800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 53640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-una",
    name: "Indian Institute of Information Technology, Una",
    shortName: "IIIT Una",
    type: "IIIT",
    location: "Una, Himachal Pradesh",
    nirfRank: 115,
    established: 2014,
    campusArea: "125 Acres",
    description: "A marvelous campus located in beautiful Himachal, noted for superb programming culture and big data research labs.",
    admissionType: "JEE-Main",
    placements: {
      highest: 45,
      average: 12.4,
      median: 10.8,
      recruiters: ["Amazon","Nokia","Delhivery","Bosch","LTI"],
      description: "Highly rising software engineering hiring outcomes due to high academic standards."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 19500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 25350, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 35100, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-sonepat",
    name: "Indian Institute of Information Technology, Sonepat",
    shortName: "IIIT Sonepat",
    type: "IIIT",
    location: "Sonepat, Haryana",
    nirfRank: 155,
    established: 2014,
    campusArea: "50 Acres",
    description: "Proximity to Delhi-NCR facilitates highly interactive company talks, code hackathons and internships.",
    admissionType: "JEE-Main",
    placements: {
      highest: 44,
      average: 12.5,
      median: 11,
      recruiters: ["Paytm","Amazon","Flipkart","Accenture"],
      description: "Superb growth in software design and consulting pipelines due to ideal location."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 24570, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-dharwad",
    name: "Indian Institute of Information Technology, Dharwad",
    shortName: "IIIT Dharwad",
    type: "IIIT",
    location: "Dharwad, Karnataka",
    nirfRank: 126,
    established: 2015,
    campusArea: "61 Acres",
    description: "A fast expanding cyber academic system in Karnataka, training elite cloud software developers.",
    admissionType: "JEE-Main",
    placements: {
      highest: 35,
      average: 10.9,
      median: 9.4,
      recruiters: ["Intel","Zscaler","ZOHO","Infosys","IBM"],
      description: "Superb tech results in full-stack web, distributed system nodes and analytics."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 14000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "DSA", name: "Data Science and Artificial Intelligence", baseClosingRankOPEN: 16800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 25200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-kottayam",
    name: "Indian Institute of Information Technology, Kottayam",
    shortName: "IIIT Kottayam",
    type: "IIIT",
    location: "Kottayam, Kerala",
    nirfRank: 105,
    established: 2015,
    campusArea: "53 Acres",
    description: "Famed for its stellar computing labs, AI/ML specialization tracks and cybersecurity clubs in Kerala.",
    admissionType: "JEE-Main",
    placements: {
      highest: 42,
      average: 12.8,
      median: 11.2,
      recruiters: ["Amazon","Nvidia","Sasken","L&T","Mindtree"],
      description: "Stellar tech-campuses hiring for engineering, compiler design, and database systems."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 19800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 22770, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 25740, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 35640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-manipur",
    name: "Indian Institute of Information Technology, Senapati Manipur",
    shortName: "IIIT Manipur",
    type: "IIIT",
    location: "Imphal, Manipur",
    nirfRank: 195,
    established: 2015,
    campusArea: "40 Acres",
    description: "A central gateway for software and IT education, providing strong foundations in database systems and security.",
    admissionType: "JEE-Main",
    placements: {
      highest: 24,
      average: 8.5,
      median: 7.2,
      recruiters: ["Cognizant","TCS","Wipro","Capgemini"],
      description: "Consistent northeast regional government IT project and backend code job postings."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 37000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 66600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-nagpur",
    name: "Indian Institute of Information Technology, Nagpur",
    shortName: "IIIT Nagpur",
    type: "IIIT",
    location: "Nagpur, Maharashtra",
    nirfRank: 112,
    established: 2016,
    campusArea: "100 Acres",
    description: "A marvelous PPP institution with rapid tech placement expansion, offering IoT, AI, and big data computing tracks.",
    admissionType: "JEE-Main",
    placements: {
      highest: 40,
      average: 12.6,
      median: 11,
      recruiters: ["Amazon","Cisco","Intel","Salesforce","Deloitte"],
      description: "Stellar performance in national coding hackathons and software product hiring."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 13500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CSD", name: "Computer Science and Design", baseClosingRankOPEN: 18900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 17550, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 24300, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-ranchi",
    name: "Indian Institute of Information Technology, Ranchi",
    shortName: "IIIT Ranchi",
    type: "IIIT",
    location: "Ranchi, Jharkhand",
    nirfRank: 175,
    established: 2016,
    campusArea: "67 Acres",
    description: "Providing modern research setups for computational linguistics, data structures, and computer diagnostics.",
    admissionType: "JEE-Main",
    placements: {
      highest: 28,
      average: 9.6,
      median: 8.2,
      recruiters: ["Samsung","Flipkart","Accenture","TCS"],
      description: "Stable corporate software testing and IT network system configurations."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 37000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 66600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-surat",
    name: "Indian Institute of Information Technology, Surat",
    shortName: "IIIT Surat",
    type: "IIIT",
    location: "Surat, Gujarat",
    nirfRank: 135,
    established: 2016,
    campusArea: "50 Acres",
    description: "Close alignment with state industry and tech hubs in South Gujarat, specializing in software engineering.",
    admissionType: "JEE-Main",
    placements: {
      highest: 36,
      average: 11.8,
      median: 10.2,
      recruiters: ["QuickHeal","Nokia","Amazon","Capgemini"],
      description: "Consistently rising core IT development roles and computer science internships."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 32760, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-bhopal",
    name: "Indian Institute of Information Technology, Bhopal",
    shortName: "IIIT Bhopal",
    type: "IIIT",
    location: "Bhopal, Madhya Pradesh",
    nirfRank: 145,
    established: 2017,
    campusArea: "50 Acres",
    description: "Fosters creative coding environments and web design architectures in central India.",
    admissionType: "JEE-Main",
    placements: {
      highest: 35,
      average: 11.2,
      median: 9.8,
      recruiters: ["Intel","Informatica","Walmart","Infosys"],
      description: "Highly active tech-campuses hiring for full-stack developers and automation engineers."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 22000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 28600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 39600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-bhagalpur",
    name: "Indian Institute of Information Technology, Bhagalpur",
    shortName: "IIIT Bhagalpur",
    type: "IIIT",
    location: "Bhagalpur, Bihar",
    nirfRank: 185,
    established: 2017,
    campusArea: "50 Acres",
    description: "Delivering modern computational structures, AI analytics, and clean database engineering practices.",
    admissionType: "JEE-Main",
    placements: {
      highest: 30,
      average: 9.2,
      median: 8,
      recruiters: ["Virtusa","Persistent","TCS","Wipro"],
      description: "Stable corporate software developer associate placements."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 37000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 66600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 133200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-agartala",
    name: "Indian Institute of Information Technology, Agartala",
    shortName: "IIIT Agartala",
    type: "IIIT",
    location: "Agartala, Tripura",
    nirfRank: 198,
    established: 2018,
    campusArea: "50 Acres",
    description: "Specialized in distributed computational logic, advanced analytics, and computer communications systems.",
    admissionType: "JEE-Main",
    placements: {
      highest: 26,
      average: 8.8,
      median: 7.5,
      recruiters: ["Cognizant","Sopra Steria","TCS","Infosys"],
      description: "Consistent regional state board tech and communications system jobs."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 42400, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-raichur",
    name: "Indian Institute of Information Technology, Raichur",
    shortName: "IIIT Raichur",
    type: "IIIT",
    location: "Raichur, Karnataka",
    nirfRank: 152,
    established: 2019,
    campusArea: "60 Acres",
    description: "A young but fast-growing PPP IIIT in Karnataka, mentored by IIT Hyderabad. Strong cloud programming modules.",
    admissionType: "JEE-Main",
    placements: {
      highest: 32,
      average: 10.5,
      median: 9,
      recruiters: ["Broadcom","ZOHO","Persistent","Capgemini"],
      description: "Emerging placement drive with high percentage performance in core software coding."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 31600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 36340, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-trichy",
    name: "Indian Institute of Information Technology, Tiruchirappalli",
    shortName: "IIIT Trichy",
    type: "IIIT",
    location: "Tiruchirappalli, Tamil Nadu",
    nirfRank: 142,
    established: 2013,
    campusArea: "56 Acres",
    description: "Providing modern research in cloud programming structures, database administration and cryptography.",
    admissionType: "JEE-Main",
    placements: {
      highest: 34,
      average: 11,
      median: 9.5,
      recruiters: ["Nokia","Tata Elxsi","Informatica","Cognizant"],
      description: "Consistent software engineering and computer networks placement lines."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 19200, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 34560, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-nayaraipur",
    name: "Dr. Shyama Prasad Mukherjee International Institute of Information Technology, Naya Raipur",
    shortName: "IIIT Naya Raipur",
    type: "IIIT",
    location: "Naya Raipur, Chhattisgarh",
    nirfRank: 105,
    established: 2015,
    campusArea: "50 Acres",
    description: "A highly premium state-supported autonomous tech institute focusing heavily on computational networks, signal processing and smart energy.",
    admissionType: "JEE-Main",
    placements: {
      highest: 43,
      average: 12.9,
      median: 11.2,
      recruiters: ["Adobe","Amazon","American Express","S&P Global"],
      description: "Superb coding culture yielding premium placements on par with top NIT systems."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 14800, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "DSA", name: "Data Science and Artificial Intelligence", baseClosingRankOPEN: 17760, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 26640, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-kurnool",
    name: "Indian Institute of Information Technology, Design and Manufacturing, Kurnool",
    shortName: "IIIT DM Kurnool",
    type: "IIIT",
    location: "Kurnool, Andhra Pradesh",
    nirfRank: 115,
    established: 2015,
    campusArea: "151 Acres",
    description: "Initiated by MHRD, delivering high fidelity design models, computer-integrated graphics, and smart mechanical fabrications.",
    admissionType: "JEE-Main",
    placements: {
      highest: 35,
      average: 10.8,
      median: 9.2,
      recruiters: ["Oracle","TCS","Accenture","ZOHO","LTI"],
      description: "Excellent high-intensity testing engineering and full-stack software lists."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 37000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "AI", name: "Artificial Intelligence and Data Science", baseClosingRankOPEN: 42550, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 66600, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 133200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "pec-chandigarh",
    name: "Punjab Engineering College (Deemed to be University), Chandigarh",
    shortName: "PEC Chandigarh",
    type: "GFTI",
    location: "Chandigarh",
    nirfRank: 87,
    established: 1921,
    campusArea: "146 Acres",
    description: "One of the oldest and most prestigious technical universities in India, historically known as Maclagan Engineering College. Highly esteemed for its world-class aerospace engineering and computer science departments, and a stellar legendary alumnus base (such as Kalpana Chawla). Conducts admissions under JoSAA counseling through JEE Main.",
    admissionType: "JEE-Main",
    placements: {
      highest: 83,
      average: 15.9,
      median: 12,
      recruiters: ["Apple","Microsoft","Goldman Sachs","Amazon","Texas Instruments","JP Morgan Chase"],
      description: "Outstanding placements, especially in software, data sciences, aerospace, electronics, and core engineering."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 4500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 6750, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 9900, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 16200, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 23400, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "PE", name: "Production and Industrial Engineering", baseClosingRankOPEN: 26100, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 28800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "bit-mesra",
    name: "Birla Institute of Technology, Mesra",
    shortName: "BIT Mesra",
    type: "GFTI",
    location: "Ranchi, Jharkhand",
    nirfRank: 71,
    established: 1955,
    campusArea: "780 Acres",
    description: "A premier deemed-to-be university and classic participating GFTI in JoSAA. Highly distinguished for pioneering rocketry, space engineering, and material sciences, boasting modern laboratories and immense research facilities. Conducts admissions under JoSAA counseling through JEE Main.",
    admissionType: "JEE-Main",
    placements: {
      highest: 51,
      average: 11.5,
      median: 9.6,
      recruiters: ["Microsoft","Oracle","Walmart","Tata Steel","Aditya Birla Group","L&T"],
      description: "Exceptional job offers in product development, chemical sectors, space, and metallurgy fields."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 11000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 16500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 24200, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 39600, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 44000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 57200, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "PE", name: "Production and Industrial Engineering", baseClosingRankOPEN: 63800, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "BT", name: "Biotechnology and Biochemical Engineering", baseClosingRankOPEN: 66000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 82500, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] }
    ]
  },
  {
    id: "jnu-delhi",
    name: "Jawaharlal Nehru University, School of Engineering, New Delhi",
    shortName: "JNU Delhi",
    type: "GFTI",
    location: "New Delhi",
    nirfRank: 151,
    established: 2018,
    campusArea: "1019 Acres",
    description: "The School of Engineering at the renowned central campus of JNU. Offers top-flight interdisciplinary research matching classical JNU academic traditions with elite modern engineering disciplines. Conducts admissions under JoSAA counseling through JEE Main.",
    admissionType: "JEE-Main",
    placements: {
      highest: 33,
      average: 10.2,
      median: 8.5,
      recruiters: ["Adobe","Intel","Cisco","Samsung","Paytm","Google"],
      description: "Highly promising placement scaling rapidly for computer research and advanced software engineering."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 16000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 24000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "spa-delhi",
    name: "School of Planning and Architecture, New Delhi",
    shortName: "SPA New Delhi",
    type: "GFTI",
    location: "New Delhi",
    nirfRank: 5,
    established: 1941,
    campusArea: "20 Acres",
    description: "India's zenith national school for architecture, landscape design, and regional urban planning. SPA Delhi delivers supreme international fellowships, research pipelines, and leading urban development consultancies. Admissions are handled via JoSAA counseling through JEE Main Paper 1 (to B.Plan) and Paper 2 (to B.Arch).",
    admissionType: "JEE-Main",
    placements: {
      highest: 24,
      average: 8.8,
      median: 7.5,
      recruiters: ["L&T","Atkins","Dar Al-Handasah","Jones Lang LaSalle","CBRE"],
      description: "Phenomenal core placements in landscape architecture, global planning consulting, and structural modeling."
    },
    branches: [
      { code: "BARCH", name: "Architecture (Bachelor of Architecture)", baseClosingRankOPEN: 250, degrees: ["B.Arch (Bachelor of Architecture, 5 Years)"] },
      { code: "BPLAN", name: "Planning (Bachelor of Planning)", baseClosingRankOPEN: 450, degrees: ["B.Planning (Bachelor of Planning, 4 Years)"] }
    ]
  },
  {
    id: "niamt-ranchi",
    name: "National Institute of Advanced Manufacturing Technology, Ranchi",
    shortName: "NIAMT Ranchi",
    type: "GFTI",
    location: "Ranchi, Jharkhand",
    nirfRank: 110,
    established: 1966,
    campusArea: "67 Acres",
    description: "Formerly NIFFT (National Institute of Foundry and Forge Technology), setup via UNESCO and UNDP. Outstanding and unique engineering marvel specializing in metallurgy, foundry industry, forge technology, material science, and manufacturing design. Conducts admissions under JoSAA counseling through JEE Main.",
    admissionType: "JEE-Main",
    placements: {
      highest: 15,
      average: 8.5,
      median: 7.2,
      recruiters: ["Tata Motors","Maruti Suzuki","Steel Authority of India","Jindal Steel","Vedanta"],
      description: "Unrivaled industrial placements with complete dominance over metallurgical, foundry, and machinery streams."
    },
    branches: [
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 79200, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "PE", name: "Production and Industrial Engineering", baseClosingRankOPEN: 127600, degrees: ["B.E. (Bachelor of Engineering, 4 Years)"] },
      { code: "MTE", name: "Metallurgical and Materials Engineering", baseClosingRankOPEN: 140800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "jk-institute-allahabad",
    name: "J.K. Institute of Applied Physics and Technology, University of Allahabad",
    shortName: "JK Institute Allahabad",
    type: "GFTI",
    location: "Prayagraj, Uttar Pradesh",
    nirfRank: 151,
    established: 1956,
    campusArea: "12 Acres",
    description: "One of Northern India's oldest and most prestigious departments for applied physics, electronics, and computer science, hosted inside the historic central university of Allahabad. Cultivates some of India's top space researchers, software pioneers, and telecommunication chiefs. Participates in JoSAA counseling using JEE Main.",
    admissionType: "JEE-Main",
    placements: {
      highest: 35,
      average: 9,
      median: 8,
      recruiters: ["TCS","Infosys","BSNL","Wipro","DRDO","ISRO"],
      description: "Strong core engineering network, defense laboratories recruitment, and high placement ratios in private IT services."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 24000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 36000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iiit-bangalore",
    name: "International Institute of Information Technology, Bangalore",
    shortName: "IIIT Bangalore",
    type: "Non-JoSAA",
    location: "Bengaluru, Karnataka",
    nirfRank: 74,
    established: 1999,
    campusArea: "9 Acres",
    description: "Located in Electronics City, Bangalore. IIIT-B is a premium autonomous institute famous for dual degrees and pure research focus, admitting via its own JEE Main portal.",
    admissionType: "JEE-Main",
    placements: {
      highest: 65,
      average: 26.2,
      median: 23,
      recruiters: ["Apple","Google","Nvidia","Siber","Amazon","Cisco"],
      description: "Exceptional placement rates on par with top 5 IITs, specializing in VLSI chips and dynamic big data positions."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 1500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "DSA", name: "Data Science and Artificial Intelligence", baseClosingRankOPEN: 1800, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 2700, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] }
    ]
  },
  {
    id: "iiit-delhi",
    name: "Indraprastha Institute of Information Technology, Delhi",
    shortName: "IIIT Delhi",
    type: "Non-JoSAA",
    location: "New Delhi",
    nirfRank: 75,
    established: 2008,
    campusArea: "25 Acres",
    description: "A highly prestigious research-focused state university under the Delhi government. IIIT-D conducts admissions through JAC Delhi, renown for high computational biology and AI work.",
    admissionType: "JEE-Main",
    placements: {
      highest: 51.3,
      average: 20.4,
      median: 17.5,
      recruiters: ["Qualcomm","Microsoft","Goldman Sachs","Adobe","SanDisk"],
      description: "Top coding competition culture and high-average tech consulting and software engineering offers."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 3500, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CSD", name: "Computer Science and Design", baseClosingRankOPEN: 4900, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 6300, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "CSB", name: "Computer Science and Biosciences", baseClosingRankOPEN: 6875, degrees: ["B.Tech (4 Years)"] },
      { code: "MAC", name: "Mathematics and Computing", baseClosingRankOPEN: 5625, degrees: ["B.Tech (4 Years)"] }
    ]
  },
  {
    id: "iiit-bhubaneswar-nj",
    name: "International Institute of Information Technology, Bhubaneswar",
    shortName: "IIIT Bhubaneswar (Non-JoSAA)",
    type: "Non-JoSAA",
    location: "Bhubaneswar, Odisha",
    nirfRank: 151,
    established: 2006,
    campusArea: "48 Acres",
    description: "Established by the Government of Odisha, utilizing its own parallel portal and JoSAA modes. Outstanding focus on computing networks and communications engineering.",
    admissionType: "JEE-Main",
    placements: {
      highest: 39,
      average: 9.8,
      median: 8,
      recruiters: ["Dell","Capgemini","Cognizant","Infosys","Siemens"],
      description: "Highly stable campus placements with great tech assistance branches."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 18000, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "IT", name: "Information Technology", baseClosingRankOPEN: 23400, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 32400, degrees: ["B.Tech (4 Years)","Dual Degree (B.Tech + M.Tech, 5 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 39600, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "iisc-bangalore",
    name: "Indian Institute of Science, Bangalore",
    shortName: "IISc Bangalore",
    type: "JEE-Adv-Other",
    location: "Bengaluru, Karnataka",
    nirfRank: 2,
    established: 1909,
    campusArea: "400 Acres",
    description: "India's legendary research university, founded by Jamsetji Tata and Sri Krishnaraja Wadiyar IV. Under its undergraduate program, it offers B.Tech in Mathematics and Computing (admitted entirely through JEE Advanced ranks) and a highly specialized Bachelor of Science (Research) program (with multiple major tracks, accepting JEE Advanced, JEE Main, IAT, and NEET).",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 86,
      average: 28.5,
      median: 25,
      recruiters: ["Google Research","Meta AI","IBM Research","AstraZeneca","TSMC","Microsoft Research"],
      description: "Premium academic recruitment, PhD admissions in Ivy League universities, and select high-end HFT/AI research roles."
    },
    branches: [
      { code: "MTC", name: "Mathematics and Computing", baseClosingRankOPEN: 253, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] },
      { code: "BS-MTH", name: "Mathematics (Bachelor of Science)", baseClosingRankOPEN: 3960, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] }
    ]
  },
  {
    id: "iist-thiruvananthapuram",
    name: "Indian Institute of Space Science and Technology, Thiruvananthapuram",
    shortName: "IIST Thiruvananthapuram",
    type: "JEE-Adv-Other",
    location: "Thiruvananthapuram, Kerala",
    nirfRank: 102,
    established: 2007,
    campusArea: "100 Acres",
    description: "Asia's first space university, functioning as an autonomous body directly overseen by the Department of Space, Government of India. Highly sought after for its B.Tech in Aerospace Engineering and Electronics & Communication Engineering (Avionics). Offers direct absorption into ISRO centers as Scientist/Engineer 'SC' for students achieving specified GPA thresholds. Admissions are hosted via IIST's portal based purely on JEE Advanced ranks.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 33,
      average: 10.5,
      median: 9,
      recruiters: ["ISRO","DRDO","Bharat Electronics Limited","Intel","VSSC","Texas Instruments"],
      description: "Unrivaled absorption directly into the Indian Space Research Organisation (ISRO) and national defense labs."
    },
    branches: [
      { code: "ECE", name: "Electronics and Communication Engineering (Avionics)", baseClosingRankOPEN: 1365, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "AE", name: "Aerospace Engineering", baseClosingRankOPEN: 1050, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "DD", name: "Dual Degree (B.Tech + M.Tech/MS, Space Sciences)", baseClosingRankOPEN: 1208, degrees: ["B.Tech (4 Years) + Master of Science/M.Tech (5 Years)"] }
    ]
  },
  {
    id: "rgipt-jais",
    name: "Rajiv Gandhi Institute of Petroleum Technology, Amethi",
    shortName: "RGIPT Amethi",
    type: "JEE-Adv-Other",
    location: "Jais, Amethi, Uttar Pradesh",
    nirfRank: 101,
    established: 2007,
    campusArea: "47 Acres",
    description: "An Institute of National Importance established by the Ministry of Petroleum & Natural Gas, co-sponsored by leading petroleum public sector undertakings (IOCL, ONGC, GAIL, BPCL, HPCL, OIL). Offers elite engineering programs in Petroleum Engineering, Chemical Engineering, and Energy Transition, and conducts separate admissions based on JEE Advanced ranks.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 24.5,
      average: 10.3,
      median: 9,
      recruiters: ["ONGC","IOCL","BPCL","HPCL","Schlumberger","Shell","Halliburton"],
      description: "Outstanding core petroleum placements, with extensive PSU block-mentoring and direct recruitment."
    },
    branches: [
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 48300, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] },
      { code: "PE", name: "Petroleum Engineering", baseClosingRankOPEN: 78200, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] }
    ]
  },
  {
    id: "iipe-visakhapatnam",
    name: "Indian Institute of Petroleum and Energy, Visakhapatnam",
    shortName: "IIPE Visakhapatnam",
    type: "JEE-Adv-Other",
    location: "Visakhapatnam, Andhra Pradesh",
    nirfRank: 125,
    established: 2016,
    campusArea: "200 Acres",
    description: "An autonomous Institute of National Importance promoted by the Ministry of Petroleum and Natural Gas. Backed heavily by oil sector public giants, offering premium 4-year B.Tech programs in Petroleum, Chemical, and Sustainable Materials sectors, with entries conducted through a dedicated portal utilizing JEE Advanced ranks.",
    admissionType: "JEE-Advanced",
    placements: {
      highest: 22,
      average: 9.5,
      median: 8.5,
      recruiters: ["HPCL","GAIL","Shell","ExxonMobil","Reliance Industries"],
      description: "Excellent industry mentorship programs, immediate PSU onboarding, and global downstream petrochemical career opportunities."
    },
    branches: [
      { code: "CHE", name: "Chemical Engineering", baseClosingRankOPEN: 52500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] },
      { code: "PE", name: "Petroleum Engineering", baseClosingRankOPEN: 85000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)","Dual Degree (5 Years)"] }
    ]
  },
  {
    id: "assam-university",
    name: "Assam University, Silchar",
    shortName: "Assam University",
    type: "GFTI",
    location: "Silchar, Assam",
    nirfRank: 101,
    established: 1994,
    campusArea: "600 Acres",
    description: "A premier Central University established under the Parliament Act, offering reputable core and computing engineering studies in general and rural sectors, admitting via JEE Main counseling.",
    admissionType: "JEE-Main",
    placements: {
      highest: 16,
      average: 6.2,
      median: 5.5,
      recruiters: ["TCS","Wipro","Cognizant","Infosys"],
      description: "Decent software engineering services and highly active regional state PSU recruiting pipelines."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 49500, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 70000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 85000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "gurukula-kangri",
    name: "Gurukula Kangri Vishwavidyalaya, Haridwar",
    shortName: "GKV Haridwar",
    type: "GFTI",
    location: "Haridwar, Uttarakhand",
    nirfRank: 151,
    established: 1902,
    campusArea: "150 Acres",
    description: "A historic government-funded technical university. Its engineering faculty provides solid computational courses with integrated moral education and intensive hands-on mechanical workshops.",
    admissionType: "JEE-Main",
    placements: {
      highest: 12,
      average: 5.5,
      median: 4.8,
      recruiters: ["TCS","Wipro","Infosys","Tech Mahindra"],
      description: "Consistent recruitment in industrial systems development and robust government engineering pipelines."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 68000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 82000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 95000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 112000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "tezpur-university",
    name: "Tezpur University, Tezpur",
    shortName: "Tezpur University",
    type: "GFTI",
    location: "Tezpur, Assam",
    nirfRank: 69,
    established: 1994,
    campusArea: "262 Acres",
    description: "An outstanding Central University in northeast India. Known globally for its clean campus, energetic coding group profiles, and substantial scientific research foundation.",
    admissionType: "JEE-Main",
    placements: {
      highest: 31.5,
      average: 7.8,
      median: 6.5,
      recruiters: ["Intel","TCS","Wipro","Cognizant","Accenture","Oil India"],
      description: "Exceptional private software engineering roles and heavy recruitment by local chemical/oil PSUs."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering", baseClosingRankOPEN: 44000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ECE", name: "Electronics and Communication Engineering", baseClosingRankOPEN: 54000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "EE", name: "Electrical Engineering", baseClosingRankOPEN: 62000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "ME", name: "Mechanical Engineering", baseClosingRankOPEN: 70000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] },
      { code: "CE", name: "Civil Engineering", baseClosingRankOPEN: 78000, degrees: ["B.Tech (Bachelor of Technology, 4 Years)"] }
    ]
  },
  {
    id: "university-of-hyderabad",
    name: "University of Hyderabad, Hyderabad",
    shortName: "University of Hyderabad",
    type: "GFTI",
    location: "Hyderabad, Telangana",
    nirfRank: 10,
    established: 1974,
    campusArea: "2300 Acres",
    description: "A premier central research university. Offers an elite, highly selective 5-Year Integrated M.Tech in Computer Science, admitted completely through national JEE Main counseling.",
    admissionType: "JEE-Main",
    placements: {
      highest: 43.5,
      average: 12.8,
      median: 11,
      recruiters: ["TCS Research","Oracle","Adobe","Microsoft","HSBC","Deloitte"],
      description: "High placement ratios in research networks, big data analytics, and elite computational physics tracks."
    },
    branches: [
      { code: "CSE", name: "Computer Science and Engineering (Integrated M.Tech)", baseClosingRankOPEN: 18500, degrees: ["Integrated M.Tech (5 Years)"] }
    ]
  }
];

/**
 * Realistic extrapolation function to dynamically generate 5-year JoSAA/CSAB cutoffs
 * based on base closing ranks, categories, quotas, and genders.
 * IIT predict uses Round 6 closing ranks, NIT/IIIT predict uses Special Round 3.
 * Latest trends incorporated: tech branch tightening, core branch spot round slide,
 * newer college expansion, and supernumerary/gender pool adjustments.
 */
const historicalCutoffsMap = new Map<string, { openingRank: number; closingRank: number; round: number }>();

function initHistoricalMap() {
  if (historicalCutoffsMap.size > 0) return;
  const allHistory = [...josaaIITCutoffs, ...josaaNITCutoffs, ...josaaIIITCutoffs, ...josaaGFTICutoffs];
  for (const record of allHistory) {
    const genderKey = record.gender === 'Female-only (including Supernumerary)' ? 'Female-Only' : 'Gender-Neutral';
    const key = `${record.instituteId}:${record.branchCode.toUpperCase()}:${record.year}:${record.category}:${record.quota}:${genderKey}`;
    historicalCutoffsMap.set(key, {
      openingRank: record.openingRank,
      closingRank: record.closingRank,
      round: record.round
    });

    // Support both OS and HS options for GFTIs and IIITs in UI to ensure complete coverage
    const isGftiorIiit = record.instituteId.startsWith('iiit-') || 
                         ['jnu-delhi', 'spa-delhi', 'jk-institute-allahabad', 'niamt-ranchi', 'bit-mesra', 'pec-chandigarh', 'iiest-shibpur', 'assam-university', 'gurukula-kangri', 'tezpur-university', 'university-of-hyderabad'].includes(record.instituteId);
    if (isGftiorIiit && record.quota === 'OS') {
      const hsKey = `${record.instituteId}:${record.branchCode.toUpperCase()}:${record.year}:${record.category}:HS:${genderKey}`;
      if (!historicalCutoffsMap.has(hsKey)) {
        historicalCutoffsMap.set(hsKey, {
          openingRank: record.openingRank,
          closingRank: record.closingRank,
          round: record.round
        });
      }
    }
  }
}

export function generateCutoffs(): void {
  initHistoricalMap();
  for (const college of collegesData) {
    const isIIT = college.type === 'IIT' || college.type === 'JEE-Adv-Other';
    
    for (const branch of college.branches) {
      const cutoffs: CutoffData[] = [];
      
      // We will populate actual data for 5 years: 2025, 2024, 2023, 2022, 2021
      const years = [2025, 2024, 2023, 2022, 2021];
      
      for (const year of years) {
        const categories: Array<'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'> = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS'];
        
        for (const cat of categories) {
          // Quotas: IITs only have All India (AI). NITs/IIITs have HS and OS.
          const quotas: Array<'AI' | 'HS' | 'OS'> = isIIT ? ['AI'] : ['HS', 'OS'];
          
          for (const quota of quotas) {
            // Genders
            const genders: Array<'Gender-Neutral' | 'Female-Only'> = ['Gender-Neutral', 'Female-Only'];
            
            for (const gender of genders) {
              const historyKey = `${college.id}:${branch.code.toUpperCase()}:${year}:${cat}:${quota}:${gender}`;
              const histMatch = historicalCutoffsMap.get(historyKey);
              
              if (histMatch) {
                cutoffs.push({
                  year,
                  category: cat,
                  quota,
                  gender,
                  openingRank: histMatch.openingRank,
                  closingRank: histMatch.closingRank,
                  counselingRound: isIIT ? 'JoSAA Round 6' : 'CSAB Special Round 3'
                });
              }
            }
          }
        }
      }
      
      branch.cutoffs = cutoffs;
    }
  }
}

// Automatically generate cutoffs on import
generateCutoffs();

/**
 * Rank Predictor Algorithm
 */
export interface PredictionInput {
  rank: number;
  category: 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
  gender: 'Gender-Neutral' | 'Female-Only';
  homeState: string; // state name e.g. "Karnataka" or "Maharashtra"
  examType: 'JEE-Advanced' | 'JEE-Main';
  referenceYear?: number;
}

export interface PredictedBranch {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  collegeType: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Non-JoSAA' | 'JEE-Adv-Other';
  location: string;
  nirfRank: number;
  branchCode: string;
  branchName: string;
  closingRank2025: number;
  openingRank2025: number;
  recommendationType: 'Dream' | 'Target' | 'Safe';
  placementAverage: number;
  quotaUsed: 'AI' | 'HS' | 'OS';
  counselingRound: 'JoSAA Round 6' | 'CSAB Special Round 3';
  cutoffYear?: number;
  historicalCoverage?: number;
  confidenceLevel?: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
}

export function predictColleges(input: PredictionInput): PredictedBranch[] {
  const predictions: PredictedBranch[] = [];
  const { rank, category, gender, homeState, examType, referenceYear = 2025 } = input;
  
  const allHistory = [...josaaIITCutoffs, ...josaaNITCutoffs, ...josaaIIITCutoffs, ...josaaGFTICutoffs];
  
  for (const college of collegesData) {
    // Correct exam matching: IITs use JEE-Advanced, NITs/IIITs use JEE-Main
    if (college.admissionType !== examType) continue;
    
    // Determine quotas the applicant is eligible for
    const eligibleQuotas: Array<'AI' | 'HS' | 'OS'> = [];
    if (college.type === 'IIT' || college.type === 'JEE-Adv-Other') {
      eligibleQuotas.push('AI');
    } else {
      // Robust normalized Delhi and standard Home State detection
      let isHomeState = false;
      const normalizedHomeState = homeState.toLowerCase().trim();
      const normalizedLocation = college.location.toLowerCase().trim();
      
      if (normalizedHomeState.includes('delhi') || normalizedLocation.includes('delhi')) {
        if (normalizedHomeState.includes('delhi') && normalizedLocation.includes('delhi')) {
          isHomeState = true;
        }
      } else {
        isHomeState = normalizedLocation.includes(normalizedHomeState);
      }

      if (isHomeState) {
        // App is from college's state - eligible for both Home State and Other State pools
        eligibleQuotas.push('HS');
        eligibleQuotas.push('OS');
      } else {
        eligibleQuotas.push('OS');
      }
    }
    
    for (const branch of college.branches) {
      // 4. Exclude branches without actual historical records from prediction results
      const branchHasHistory = allHistory.some(
        r => r.instituteId.toLowerCase() === college.id.toLowerCase() &&
             r.branchCode.toUpperCase() === branch.code.toUpperCase()
      );
      if (!branchHasHistory) continue;
      
      for (const q of eligibleQuotas) {
        // Query the Trend Engine which checks ONLY actual historical records
        const trend = analyzeCutoffTrend(college.id, branch.code, category, q, gender);
        
        if (!trend || trend.availableYearsCount === 0) continue;
        
        const wAvg = trend.weightedRecentAverage;
        const newestRec = trend.actualRecords[trend.actualRecords.length - 1];
        const closing = newestRec ? newestRec.closingRank : 0;
        const opening = newestRec ? newestRec.openingRank : 0;
        
        let recType: 'Dream' | 'Target' | 'Safe' | null = null;
        
        // Rules based on Rank Ranges to reduce false positives in Elite and High Ranks
        if (rank < 5000) {
          if (rank <= wAvg * 0.95) {
            recType = 'Safe';
          } else if (rank <= wAvg * 1.08) {
            recType = 'Target';
          } else if (rank <= wAvg * 1.20) {
            recType = 'Dream';
          }
        } else if (rank <= 20000) {
          if (rank <= wAvg * 0.90) {
            recType = 'Safe';
          } else if (rank <= wAvg * 1.15) {
            recType = 'Target';
          } else if (rank <= wAvg * 1.35) {
            recType = 'Dream';
          }
        } else {
          // Ranks > 20000: Retain existing standard windows
          if (rank < 0.9 * wAvg) {
            recType = 'Safe';
          } else if (rank <= 1.1 * wAvg) {
            recType = 'Target';
          } else if (rank <= 1.4 * wAvg) {
            recType = 'Dream';
          }
        }
        
        if (recType) {
          predictions.push({
            collegeId: college.id,
            collegeName: college.name,
            collegeShortName: college.shortName,
            collegeType: college.type,
            location: college.location,
            nirfRank: college.nirfRank,
            branchCode: branch.code,
            branchName: branch.name,
            closingRank2025: closing,
            openingRank2025: opening,
            recommendationType: recType,
            placementAverage: college.placements.average,
            quotaUsed: q,
            counselingRound: (college.type === 'IIT' || college.type === 'JEE-Adv-Other') ? 'JoSAA Round 6' : 'CSAB Special Round 3',
            cutoffYear: newestRec ? newestRec.year : referenceYear,
            historicalCoverage: trend.historicalCoverage,
            confidenceLevel: trend.confidenceLevel
          });
        }
      }
    }
  }
  
  // Sort by recommendation rank, NIRF Rank, then average placements
  return predictions.sort((a, b) => {
    const recWeight = { 'Safe': 1, 'Target': 2, 'Dream': 3 };
    if (recWeight[a.recommendationType] !== recWeight[b.recommendationType]) {
      return recWeight[a.recommendationType] - recWeight[b.recommendationType];
    }
    return a.nirfRank - b.nirfRank;
  });
}
