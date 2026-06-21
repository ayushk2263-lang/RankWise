import React, { useState } from 'react';
import { 
  FolderGit2, 
  Database, 
  Terminal, 
  Globe, 
  Cpu, 
  Layers, 
  FileCode,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react';

type SubTab = 'folder' | 'schema' | 'api' | 'stack' | 'deployment';

export default function ArchitectureTab() {
  const [activeSub, setActiveSub] = useState<SubTab>('folder');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const prismaSchemaCode = `// datasource & generator configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum AdmissionType {
  JEE_MAIN
  JEE_ADVANCED
}

enum QuotaType {
  AI  // All India
  HS  // Home State
  OS  // Other State
}

enum GenderPool {
  GENDER_NEUTRAL
  FEMALE_ONLY
}

enum CategoryType {
  OPEN
  OBC_NCL
  SC
  ST
  EWS
}

model User {
  id         String      @id @default(uuid())
  email      String      @unique
  name       String
  rank       Int
  category   CategoryType @default(OPEN)
  gender     GenderPool   @default(GENDER_NEUTRAL)
  homeState  String
  examType   AdmissionType @default(JEE_ADVANCED)
  shortlists Shortlist[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model College {
  id            String        @id
  name          String
  shortName     String
  type          String        // IIT, NIT, IIIT, GFTI
  location      String
  nirfRank      Int
  established   Int
  campusArea    String
  description   String        @db.Text
  admissionType AdmissionType
  placements    Placement?
  branches      Branch[]
}

model Placement {
  id         String   @id @default(uuid())
  collegeId  String   @unique
  highest    Float    // LPA
  average    Float    // LPA
  median     Float    // LPA
  recruiters String[] // e.g., ["Google", "Microsoft"]
  narrative  String   @db.Text
  college    College  @relation(fields: [collegeId], references: [id], onDelete: Cascade)
}

model Branch {
  id                  String     @id @default(uuid())
  collegeId           String
  code                String     // e.g., "CSE"
  name                String
  baseClosingRankOPEN Int
  cutoffs             Cutoff[]
  college             College    @relation(fields: [collegeId], references: [id], onDelete: Cascade)
  shortlists          Shortlist[]

  @@unique([collegeId, code])
}

model Cutoff {
  id          String       @id @default(uuid())
  branchId    String
  year        Int
  category    CategoryType
  quota       QuotaType
  gender      GenderPool
  openingRank Int
  closingRank Int
  branch      Branch       @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@index([branchId, year, category, quota, gender])
}

model Shortlist {
  id        String   @id @default(uuid())
  userId    String
  branchId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@unique([userId, branchId])
}`;

  const foldersStructureTree = `rankwise-production-app/
├── prisma/
│   ├── schema.prisma         # Multi-model relational PostgreSQL schema
│   └── seed.ts               # Seed script populated with 5-year JoSAA cutoffs
├── src/
│   ├── app/                  # Next.js 15 App Router directory
│   │   ├── layout.tsx        # Global theme frame and metadata layouts
│   │   ├── page.tsx          # Landing page with summary and CTA buttons
│   │   ├── api/              # Rest API endpoints proxying database & AI
│   │   │   ├── auth/         # Serverless credential verification
│   │   │   │   └── route.ts  # POST/GET endpoints for JWT-based auth
│   │   │   ├── predict/      # Match analytics endpoint
│   │   │   │   └── route.ts  # Computes Dream/Target/Safe matches
│   │   │   └── counsel/      # Server Gemini coach integration
│   │   │       └── route.ts  # Choice-filling logic generator
│   │   ├── colleges/         # Directory subfolders
│   │   │   ├── page.tsx      # All Colleges grid index
│   │   │   └── [id]/         # Dynamic profile details path resolver (SSR)
│   │   └── dashboard/        # Safe credentials editor path
│   │       └── page.tsx      # Lists saved selections
│   ├── components/           # Modular visual components
│   │   ├── ui/               # Radix / Shadcn primitives (Dialog, Select, Button)
│   │   ├── CutoffsChart.tsx  # Dynamic Recharts trajectory curve
│   │   └── CompareTable.tsx  # Interactive side-by-side matrices
│   ├── lib/                  # Server-safe utilities
│   │   ├── prisma.ts         # Singleton client instantiation
│   │   └── gemini.ts         # Server-side @google/genai module
│   └── types/                # Strict TypeScript declaration types
│       └── index.ts          
├── .env.example              # Documents PostgreSQL and Gemini credentials
├── tailwind.config.ts        # Design systems extensions (Inter & Mono fonts)
└── package.json              # Directing devDependencies & build compilation`;

  const nextJsRouteCode = `// src/app/api/counsel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: NextRequest) {
  try {
    const { rank, category, gender, homeState, examType, query } = await req.json();

    // 1. Query client's compatible programs from PostgreSQL via Prisma
    const mockQuota = examType === "JEE_ADVANCED" ? "AI" : "OS";
    
    const matchedCutoffs = await prisma.cutoff.findMany({
      where: {
        year: 2025,
        category,
        quota: mockQuota,
        gender,
        closingRank: { gte: rank * 0.8, lte: rank * 1.25 }
      },
      include: {
        branch: { include: { college: true } }
      },
      take: 8
    });

    const listSummary = matchedCutoffs.map(c => 
      \`- \${c.branch.college.shortName} (\${c.branch.code}) - Closing: \${c.closingRank}\`
    ).join("\\n");

    // 2. Query Gemini models for strategic JoSAA counselling answers
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: \`Analyze my options considering I ranked \${rank} (\${category}) and wants advice on: \${query}. Matches: \\n\${listSummary}\`,
      config: {
        systemInstruction: "You are the lead JoSAA IIT/NIT college placement counselor.",
        temperature: 0.7
      }
    });

    return NextResponse.json({ success: true, advice: response.text });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`;

  return (
    <div className="space-y-6 animate-fade-in animate-duration-300">
      {/* Intro Blueprint Header */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FolderGit2 className="w-40 h-40 text-indigo-400 stroke-[1]" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">Whitepaper Document</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none font-sans">RankWise Production Architecture</h2>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            This dashboard lays out our proposed production-grade Blueprint utilizing a Next.js 15 App Router architecture, a robust PostgreSQL schema mapped with Prisma ORM, and high-performance serverless endpoints and deployments.
          </p>
        </div>
      </div>

      {/* Horizontal subtabs selector */}
      <div className="flex backdrop-blur-md bg-white/5 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSub('folder')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeSub === 'folder' ? 'bg-white/10 text-white border border-white/10 shadow-lg font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Folder Structure</span>
        </button>

        <button
          onClick={() => setActiveSub('schema')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeSub === 'schema' ? 'bg-white/10 text-white border border-white/10 shadow-lg font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Prisma Schema</span>
        </button>

        <button
          onClick={() => setActiveSub('api')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeSub === 'api' ? 'bg-white/10 text-white border border-white/10 shadow-lg font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>API Routes Router</span>
        </button>

        <button
          onClick={() => setActiveSub('stack')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeSub === 'stack' ? 'bg-white/10 text-white border border-white/10 shadow-lg font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Technology Stack</span>
        </button>

        <button
          onClick={() => setActiveSub('deployment')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeSub === 'deployment' ? 'bg-white/10 text-white border border-white/10 shadow-lg font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Deployment Strategy</span>
        </button>
      </div>

      {/* Structured Blueprint Displays */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative min-h-[460px]">
        {activeSub === 'folder' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Next.js 15 App Router File Layout</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Perfect separation of SSR page structures, server proxy routes, and static schemas.</p>
              </div>
              <button 
                onClick={() => copyToClipboard(foldersStructureTree)}
                className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3 text-indigo-400" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            {/* Visual Folder code block */}
            <pre className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
              {foldersStructureTree}
            </pre>
          </div>
        )}

        {activeSub === 'schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Relational PostgreSQL prisma.schema declarations</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Strict database models mapping user credentials, placements packages, colleges, and catalog volatility.</p>
              </div>
              <button 
                onClick={() => copyToClipboard(prismaSchemaCode)}
                className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3 text-indigo-400" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            {/* Schema code content */}
            <pre className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] text-[#94a3b8] overflow-y-auto max-h-[420px] leading-normal scrollbar shadow-inner">
              {prismaSchemaCode}
            </pre>
          </div>
        )}

        {activeSub === 'api' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">RESTful API Architecture Route Example</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sample Next.js 15 Serverless route merging Postgres database queries with Gemini AI counseling.</p>
              </div>
              <button 
                onClick={() => copyToClipboard(nextJsRouteCode)}
                className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3 text-indigo-400" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            <pre className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] text-indigo-200 overflow-y-auto max-h-[420px] leading-relaxed shadow-inner">
              {nextJsRouteCode}
            </pre>
          </div>
        )}

        {activeSub === 'stack' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3">Technology Stack Breakdown</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 space-y-1.5 shadow-xl">
                <span className="text-indigo-400 font-bold block">Next.js 15 (React 19) Framework</span>
                <p className="text-slate-305 text-[11px]">
                  Leverages Server Components (RSC) to handle rapid Server-side rendering for detailed college dynamic paths, and Client components for instant predictor calculations and interactive search interfaces.
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 space-y-1.5 shadow-xl">
                <span className="text-indigo-400 font-bold block">PostgreSQL Database + Prisma ORM</span>
                <p className="text-slate-305 text-[11px]">
                  PostgreSQL handles multi-row relational consistency for JEE quotas, category cutoffs mapping, and user shortlists profiles. Prisma provides native type schemas and database queries safety checks.
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 space-y-1.5 shadow-xl">
                <span className="text-indigo-400 font-bold block">Gemini 3.5 Flash server-side integration</span>
                <p className="text-slate-305 text-[11px]">
                  Processes user ranks alongside database eligibility matches to produce strategic choice-priorities order, evaluating computer science core versus brand value trades.
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl border border-white/10 space-y-1.5 shadow-xl">
                <span className="text-indigo-400 font-bold block">Tailwind CSS v4 & Motion animations</span>
                <p className="text-slate-305 text-[11px]">
                  Tailwind v4's supersonic compiler drives the dark visual canvas, paired with robust components for responsive transitions and micro interactions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSub === 'deployment' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3">Cloud Deployment Roadmap</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-7 h-7 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[11px] mt-0.5 shadow-inner">
                  1
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Vercel Serverless Hosting</span>
                  <p className="text-slate-305 text-[11px] mt-1 pr-6 leading-relaxed">
                    Deploy the Next.js 15 App directly to Vercel. Global Edge distribution handles static college directory pages instantly. Express/Next APIs run on serverless cloud functions mapping DB lookups under 35ms.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[11px] mt-0.5 shadow-inner">
                  2
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Neon serverless PostgreSQL database</span>
                  <p className="text-slate-305 text-[11px] mt-1 pr-6 leading-relaxed">
                    Host the PostgreSQL relational records on Neon. Set the scale-to-zero free tier to optimize costs, and connect Prisma with pool managers to handle concurrent JEE counselor lookups during JoSAA result leaks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[11px] mt-0.5 shadow-inner">
                  3
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Edge caching for Cutoffs Seating data</span>
                  <p className="text-slate-305 text-[11px] mt-1 pr-6 leading-relaxed">
                    Since JoSAA cutoffs are historical files (records do not change once published per year), set highly optimized Next.js ISR (Incremental Static Regeneration) cache rules like <code className="text-indigo-400 font-mono text-[10px] bg-black/30 px-2.5 py-0.5 rounded border border-white/5">revalidate: 86450</code>. This serves seating databases completely static off Vercel's global CDN cache, preserving Zero database load during high traffic!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-slate-300 text-xs flex gap-3.5 shadow-xl backdrop-blur-md">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The code schemas presented on this whitepaper tab represent the physical specifications for migrating this local Express full-stack development app to serverless scale-out Next.js 15 production environments.
        </p>
      </div>
    </div>
  );
}
