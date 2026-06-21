# RankWise: Engineering Admissions Predictor & Analytics Terminal

RankWise is a professional, high-precision full-stack prediction engine and comparison suite for engineering admissions under standard entry channels. It analyzes historical cutoff data across JoSAA (IITs, NITs, IIITs, GFTIs) and JAC Delhi (IIIT-Delhi, DTU, NSUT) to advise candidates on safety nets, admission pathways, fee structures, and placement prospects.

---

## 🚀 Key Modules & Capabilities

1. **Precision Admissions Predictor**: Incorporates dynamic margin windows calibrated per rank bucket (Elite $< 5\text{k}$, High $< 20\text{k}$, and General Mid-ranks) to identify **Safe**, **Target**, and **Dream** admissions.
2. **Interactive Comparison Suite**: Direct side-by-side college vs. college evaluation mapping base cutoffs, branch placements, tuition fees, and average CTC levels.
3. **Multi-Year Trend Analytics**: D3 and Recharts-powered interactive analytics visualizing cutoff volatility and career prospects.
4. **Autonomous Career Advisor**: Generates career forecasts and course advisories integrating modern trends and branch-specific placement metrics.
5. **Fee Calculator**: Dynamically adjusts curriculum expenditures based on category concessions, merit waivers, and parental income bounds.

---

## ⚙️ Technical Architecture

The application implements a full-stack, single-page application served via an Express server integrated with Vite middleware. 

* **Frontend**: React 19, Vite, Tailwind CSS, Motion animations (from `motion/react`), Recharts, Lucide-React.
* **Backend**: Express.js with custom ESM/CJS esbuild bundlers optimizing production filesystem footprints.
* **Linter & Static Type Analysis**: Strict TypeScript configuration ensuring 100% type-safety and robust null-guards.
* **Storage Layer**: IndexedDB & LocalStorage adapters facilitating state consistency for compared lists and customized preferences.

---

## 🛠️ Development & Deployment

### Required Environment Variable (`.env.example`)
Ensure you define and specify all environment parameters prior to startup:
```env
# Server Port Configuration
PORT=3000

# Client-side configuration (if needed)
VITE_APP_ENV=production
```

### Installation
Installs base runtime dependencies:
```bash
npm install
```

### Direct Development Mode
Boots the Express backend containing Vite-HMR dev servers:
```bash
npm run dev
```

### Standalone Production Build
The production build compiles the client-side SPA bundle to `/dist`, and bundles `server.ts` into a lightweight, self-contained CommonJS target (`dist/server.cjs`) using `esbuild` to optimize Container start performance:
```bash
npm run build
```

### Boot Production Container
Runs the compiled commonJS server under Node.js:
```bash
npm run start
```

---

## 📊 Directory Structure

```text
├── src/
│   ├── components/            # Isolated view tabs and widget modules
│   │   ├── AdvisorTab.tsx     # Career forecast & advising interface
│   │   ├── AnalyticsTab.tsx   # Visual multi-year analytics reporting
│   │   ├── CollegesTab.tsx    # Interactive catalog listing & details
│   │   ├── CompareTab.tsx     # Dual-entity detail comparison module
│   │   ├── DashboardTab.tsx   # Workspace main console & entry point
│   │   ├── ErrorBoundary.tsx  # Global rendering-interruption safeguard
│   │   ├── PredictorTab.tsx   # Margin-calibrated admissions engine
│   │   └── ...
│   ├── data/                  # Immutable database stores
│   │   ├── collegeData.ts     # Curated campus metadata, fees, and placements
│   │   ├── cutoffHistory.ts   # JoSAA & JAC historical cutoffs dataset
│   │   └── ...
│   ├── types.ts               # Shared global TypeScript definitions
│   └── main.tsx               # SPA React mount point
├── server.ts                  # Production-ready Express & Vite-middleware router
└── vite.config.ts             # Client bundle configurations & Tailwind hooks
```

---

## 📄 License

This repository is distributed under the **MIT License**. Check the `/LICENSE` file for details.
