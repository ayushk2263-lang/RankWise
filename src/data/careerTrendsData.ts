export interface CareerTrend {
  branchCode: string;
  branchName: string;
  category: 'Tech & AI' | 'Semiconductors & Circuits' | 'Automotive & Core Tech' | 'Infrastructure & Process';
  growthScore2026: number; // 0-10 score in 2026
  growthScore2030: number; // projected 2030 score
  marketDemand: 'Skyrocketing' | 'Exceptional' | 'Steady Growth' | 'In Transformation' | 'Cyclical Core';
  averageStartingLPA: number;
  tenYearCeilingLPA: number;
  coreRetentionRate: number; // percentage who stay in pure vertical vs software/MBA pivot
  primaryDrivers: string[];
  emergingRoles: string[];
  alumniPlacements: { company: string; role: string; countPercent: number }[];
  prospectAnalysis: string;
}

export const careerTrendsData: CareerTrend[] = [
  {
    branchCode: 'AI/ML',
    branchName: 'Artificial Intelligence & Machine Learning',
    category: 'Tech & AI',
    growthScore2026: 9.8,
    growthScore2030: 9.9,
    marketDemand: 'Skyrocketing',
    averageStartingLPA: 26,
    tenYearCeilingLPA: 120,
    coreRetentionRate: 92,
    primaryDrivers: ['Generative AI foundational models', 'Agentic workflows', 'Edge LLM orchestration'],
    emergingRoles: ['AI Systems Engineer', 'Large Language Model Optimizer', 'Cognitive Architect'],
    alumniPlacements: [
      { company: 'Google DeepMind', role: 'Research Scientist', countPercent: 25 },
      { company: 'OpenAI', role: 'Alignment Engineer', countPercent: 20 },
      { company: 'Microsoft Research', role: 'NLP Engineer', countPercent: 30 }
    ],
    prospectAnalysis: 'Unprecedented institutional funding and continuous venture investments define this vertical. Alumni transition directly from undergraduate research publications to high-latitude AI labs globally. Retention in domain is very high, prioritizing core R&D roles.'
  },
  {
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'Tech & AI',
    growthScore2026: 9.5,
    growthScore2030: 9.4,
    marketDemand: 'Exceptional',
    averageStartingLPA: 22,
    tenYearCeilingLPA: 95,
    coreRetentionRate: 85,
    primaryDrivers: ['Decentralized applications', 'Cloud architecture scaling', 'Cybersecurity defense frameworks'],
    emergingRoles: ['Platform Reliability Engineer', 'Distributed Systems Architect', 'Security Protocol dev'],
    alumniPlacements: [
      { company: 'Amazon AWS', role: 'Cloud Architect', countPercent: 35 },
      { company: 'Stripe', role: 'Core API Engineer', countPercent: 25 },
      { company: 'HackerRank', role: 'Compiler Architect', countPercent: 15 }
    ],
    prospectAnalysis: 'The foundational baseline of modern industry. While generic consumer web development is seeing optimization through helper agents, deep distributed system engineers, low-latency compiler architects, and cloud scaling masterminds remain highly sought after.'
  },
  {
    branchCode: 'ECE',
    branchName: 'Electronics & Communication Engineering',
    category: 'Semiconductors & Circuits',
    growthScore2026: 9.2,
    growthScore2030: 9.6,
    marketDemand: 'Skyrocketing',
    averageStartingLPA: 18,
    tenYearCeilingLPA: 80,
    coreRetentionRate: 68,
    primaryDrivers: ['National Semiconductor Mission', '5G Advanced & 6G Telecom', 'Custom silicon (ASIC) design'],
    emergingRoles: ['VLSI Physical Design Engineer', 'RTL Verification Specialist', '6G Firmware Engineer'],
    alumniPlacements: [
      { company: 'NVIDIA', role: 'ASIC Design Engineer', countPercent: 30 },
      { company: 'Qualcomm', role: 'RF Systems Architect', countPercent: 25 },
      { company: 'Texas Instruments', role: 'Analog Designer', countPercent: 20 }
    ],
    prospectAnalysis: 'Experiencing a major hardware renaissance. With international chip fabrication clusters migrating locally and the massive demand for custom AI acceleration chips, ECE alumni are commanding record packages in physical block placement and validation.'
  },
  {
    branchCode: 'EE',
    branchName: 'Electrical Engineering & Power Grids',
    category: 'Semiconductors & Circuits',
    growthScore2026: 8.6,
    growthScore2030: 9.1,
    marketDemand: 'Steady Growth',
    averageStartingLPA: 15,
    tenYearCeilingLPA: 65,
    coreRetentionRate: 58,
    primaryDrivers: ['Smart EV battery management', 'Grid-level energy storage', 'Renewable microgrid control'],
    emergingRoles: ['Battery Control Algorithm Scientist', 'Grid Ingress Protocol Architect', 'Power Electronics Lead'],
    alumniPlacements: [
      { company: 'Tesla Motors', role: 'BMS Architect', countPercent: 20 },
      { company: 'Schneider Electric', role: 'Grid Automation Lead', countPercent: 30 },
      { company: 'Ather Energy', role: 'Powertrain System Engineer', countPercent: 25 }
    ],
    prospectAnalysis: 'The core electrical landscape is shifting from legacy generator controls towards low-carbon solid-state grids and dynamic vehicle electronics. Alumni excel in power conversion topologies and real-time battery thermal cycles.'
  },
  {
    branchCode: 'MECH',
    branchName: 'Mechanical & Autonomous Systems',
    category: 'Automotive & Core Tech',
    growthScore2026: 7.8,
    growthScore2030: 8.5,
    marketDemand: 'Steady Growth',
    averageStartingLPA: 11,
    tenYearCeilingLPA: 50,
    coreRetentionRate: 45,
    primaryDrivers: ['Industrial collaborative robotics', 'Aerospace components CAD/CAM', '3D additive metal synthesis'],
    emergingRoles: ['Mechatronics Control Expert', 'Aerodynamics Analytics Specialist', 'Materials Synthesis Engineer'],
    alumniPlacements: [
      { company: 'ISRO / Space startups', role: 'Structural Analyst', countPercent: 15 },
      { company: 'L&T Defense', role: 'Robotic Cell Architect', countPercent: 25 },
      { company: 'Mercedes-Benz R&D', role: 'Kinematics Modeler', countPercent: 20 }
    ],
    prospectAnalysis: 'A heavy pivot towards cyber-physical convergence. Traditional CAD draftspeople are transforming into dynamic mechatronics specialists writing custom control loops. Core mechanical graduates with minor specialization in robotics command excellent premiums.'
  },
  {
    branchCode: 'CHEM',
    branchName: 'Chemical & Molecular Engineering',
    category: 'Infrastructure & Process',
    growthScore2026: 7.5,
    growthScore2030: 8.2,
    marketDemand: 'In Transformation',
    averageStartingLPA: 10,
    tenYearCeilingLPA: 45,
    coreRetentionRate: 40,
    primaryDrivers: ['Green Hydrogen reformers', 'Carbon capture chemistry', 'Polycrystalline cell production'],
    emergingRoles: ['Hydrocarbon Transition Scientist', 'Process Simulation Modeler', 'Carbon Audit Assessor'],
    alumniPlacements: [
      { company: 'Reliance New Energy', role: 'Catalyst Researcher', countPercent: 20 },
      { company: 'Shell Global', role: 'Process Optimization Lead', countPercent: 25 },
      { company: 'BASF Chemicals', role: 'Synthetic Materials Expert', countPercent: 15 }
    ],
    prospectAnalysis: 'Decarbonization is reshaping the chemical process field. Alumni focus on simulation modeling of highly efficient thermodynamic cells and green energy fuels, blending numerical simulation with molecular analytics.'
  },
  {
    branchCode: 'CIVIL',
    branchName: 'Civil & Smart Infrastructure',
    category: 'Infrastructure & Process',
    growthScore2026: 7.0,
    growthScore2030: 7.6,
    marketDemand: 'Cyclical Core',
    averageStartingLPA: 9,
    tenYearCeilingLPA: 38,
    coreRetentionRate: 35,
    primaryDrivers: ['High-speed transit tunneling', 'Urban digital twins', 'Adaptive modular concrete'],
    emergingRoles: ['Digital Twin Integration Engineer', 'Geo-spatial Structural Analyst', 'Resilience Auditor'],
    alumniPlacements: [
      { company: 'NHAI / IRCON', role: 'Chief Project Architect', countPercent: 30 },
      { company: 'Bentley Systems', role: 'Digital Simulation Lead', countPercent: 15 },
      { company: 'Tata Projects', role: 'Urban Transit Planner', countPercent: 20 }
    ],
    prospectAnalysis: 'Civil engineers are adopting dynamic GIS intelligence and digital software frameworks to run finite element stress models on mega-structures in real-time. Favorable prospects lie in critical urban transport and green-retrofit tunnels.'
  }
];
