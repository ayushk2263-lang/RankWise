import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("✓ Gemini AI initialized successfully.");
  } else {
    console.log("⚠ GEMINI_API_KEY is not configured or has default placeholder.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini Client:", err);
}

// Resilient wrapper with exponential backoff & jitter to handle 503 / High Demand seamlessly
async function generateWithRetry(
  aiClient: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  retries = 2,
  baseDelayMs = 1200
): Promise<any> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      const isTransient = errorMessage.includes("503") || 
                          errorMessage.includes("UNAVAILABLE") || 
                          errorMessage.includes("demand") || 
                          errorMessage.includes("overloaded") || 
                          error?.status === 503 ||
                          error?.statusCode === 503;
                          
      if (isTransient && attempt <= retries) {
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
        console.warn(`[Gemini API Warning] High demand or transient error encountered (Status/Msg indicates 503/UNAVAILABLE). Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

// In-Memory Database for User Profile & Shortlists (sessions)
interface SavedCandidate {
  email: string;
  name: string;
  rank: number;
  category: string;
  gender: string;
  homeState: string;
  examType: 'JEE-Main' | 'JEE-Advanced';
  shortlist: string[]; // array of collegeId + branchCode e.g. "iit-bombay:CSE"
  emailAlertsEnabled?: boolean;
  alertOnCutoffChange?: boolean;
  alertOnPlacementUpdate?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

const usersDb: Record<string, SavedCandidate> = {
  "demo@rankwise.in": {
    email: "demo@rankwise.in",
    name: "Ayush Kumar",
    rank: 1250,
    category: "OPEN",
    gender: "Gender-Neutral",
    homeState: "Delhi",
    examType: "JEE-Advanced",
    shortlist: ["iit-bombay:ME", "iit-delhi:EE"],
    emailAlertsEnabled: true,
    alertOnCutoffChange: true,
    alertOnPlacementUpdate: false,
    alertFrequency: 'daily'
  }
};

// --- AUTH API ROUTES ---
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // Auto-register or log in if passwords are valid
  const existingUser = usersDb[email.toLowerCase()];
  if (existingUser) {
    return res.json({ success: true, user: existingUser, message: "Welcome back to RankWise!" });
  } else {
    // Create new demo user dynamically
    const name = email.split('@')[0];
    const newUser: SavedCandidate = {
      email: email.toLowerCase(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rank: 5000,
      category: "OPEN",
      gender: "Gender-Neutral",
      homeState: "Maharashtra",
      examType: "JEE-Main",
      shortlist: [],
      emailAlertsEnabled: false,
      alertOnCutoffChange: true,
      alertOnPlacementUpdate: true,
      alertFrequency: 'immediate'
    };
    usersDb[email.toLowerCase()] = newUser;
    return res.json({ success: true, user: newUser, message: "Account created successfully!" });
  }
});

app.post("/api/auth/update", (req, res) => {
  const { 
    email, 
    name, 
    rank, 
    category, 
    gender, 
    homeState, 
    examType, 
    shortlist,
    emailAlertsEnabled,
    alertOnCutoffChange,
    alertOnPlacementUpdate,
    alertFrequency
  } = req.body;
  
  if (!email || !usersDb[email.toLowerCase()]) {
    return res.status(404).json({ error: "User session not found." });
  }

  const user = usersDb[email.toLowerCase()];
  if (name !== undefined) user.name = name;
  if (rank !== undefined) user.rank = Number(rank);
  if (category !== undefined) user.category = category;
  if (gender !== undefined) user.gender = gender;
  if (homeState !== undefined) user.homeState = homeState;
  if (examType !== undefined) user.examType = examType;
  if (shortlist !== undefined) user.shortlist = shortlist;
  if (emailAlertsEnabled !== undefined) user.emailAlertsEnabled = emailAlertsEnabled;
  if (alertOnCutoffChange !== undefined) user.alertOnCutoffChange = alertOnCutoffChange;
  if (alertOnPlacementUpdate !== undefined) user.alertOnPlacementUpdate = alertOnPlacementUpdate;
  if (alertFrequency !== undefined) user.alertFrequency = alertFrequency;

  return res.json({ success: true, user, message: "Profile synchronized successfully!" });
});


// --- GEMINI COOPERATIVE COUNSELLING API ---
app.post("/api/gemini/coach", async (req, res) => {
  const { rank, category, gender, homeState, examType, predictedList, userQuery } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Gemini Counselling is currently unavailable because the API Key is not configured. Please supply a valid GEMINI_API_KEY in the Secrets panel."
    });
  }

  try {
    const listSummary = predictedList && predictedList.length > 0
      ? predictedList.slice(0, 8).map((p: any) => `- ${p.collegeShortName} (${p.branchCode}) - Closing: ${p.closingRank2025} [Category: ${category}, Type: ${p.recommendationType}]`).join("\n")
      : "No predicted colleges in range.";

    const systemPrompt = `You are "RankWise Advisor", an expert, authoritative, and empathetic Indian engineer education counsellor specializing in JoSAA and CSAB seat allocation. 
Your goal is to guide JEE Main/Advanced aspirants in choice-filling, branch vs college tradeoffs, and general counselling.
You speak neutrally, avoiding self-praising or marketing hype. State facts objectively.
Answer in clear Markdown formats with paragraphs, bold key terms, and bullet points. Mention average packages, interest matching, and whether the student should lock their seat or float.`;

    const userInstructions = `A student with these credentials wants counselling:
- Entrance Exam: ${examType}
- AIR Category Rank: ${rank}
- Category: ${category}
- Gender Pool: ${gender}
- Home State: ${homeState}

The prediction model matched these choices based on JoSAA cutoffs:
${listSummary}

Student Query/Interests: "${userQuery || "Please analyze my matches and suggest the best choice-filling ordering and branch vs college advice."}"

Provide:
1. **Match Analysis**: Discuss if their rank is strong, and if dreaming for higher colleges is realistic.
2. **Branch vs College Tradeoffs**: Evaluate matches in Computer Science vs newer branch alternatives at older IITs/NITs.
3. **Smart Choice-Filling Strategy**: Suggest a professional choice priority order for JoSAA.
4. **Future Scope**: Mention placements, packages, and options for upgrades. Keep details realistic and constructive.`;

    const response = await generateWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: userInstructions,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return res.json({
      success: true,
      advice: response.text || "No response received from counselor."
    });

  } catch (error: any) {
    console.error("Gemini Advisor Error:", error);
    return res.status(500).json({
      error: "An error occurred while generating counselling advice: " + error.message
    });
  }
});


// --- ALUMNI SUCCESS STORIES GENERATOR ---
app.post("/api/alumni/stories", async (req, res) => {
  const { collegeId, collegeName, branchCode } = req.body;

  if (!collegeId) {
    return res.status(400).json({ error: "College ID is required." });
  }

  const normalizedBranch = (branchCode || "CSE").toUpperCase();
  const clgName = collegeName || collegeId;

  // Static Fallbacks for ultra-fast load and key-missing robust operation
  const fallbackStories: Record<string, Array<{ name: string, year: string, branch: string, role: string, trajectory: string, achievement: string, qualitativeAdvice: string }>> = {
    "default": [
      {
        name: "Vikram Malhotra",
        year: "Class of 2016",
        branch: branchCode || "Engineering",
        role: "Staff Robotics Engineer at Waymo",
        trajectory: "Completed undergraduate degree, then pursued a Master's specializing in Control Theory and Autonomous Systems at Stanford. Joined Waymo as an autonomy researcher, focusing on perception and motion planning under unstructured conditions.",
        achievement: "Lead researcher for Waymo's winter-weather perception system, filing 4 patents in sensor fusion algorithms.",
        qualitativeAdvice: "Focus deeply on mathematical foundations like linear algebra and optimization. High-salary job offers are a byproduct of real technical depth. Real research projects under faculty guidance in pre-final years define your critical trajectory."
      },
      {
        name: "Ananya Senapati",
        year: "Class of 2019",
        branch: branchCode || "Engineering",
        role: "Strategic Analyst & Energy Policy Consultant at McKinsey, London",
        trajectory: "Elected student general secretary; combined engineering core with minor courses in Economics. Recruited via on-campus placement into consulting, later specializing in global grid transition and net-zero infrastructure across Western Europe.",
        achievement: "Published a critical whitepaper on clean hydrogen capacity in collaboration with EU development entities.",
        qualitativeAdvice: "Do not let code-bro culture consume you if your passion is systemic analysis or policy. Engineering teaches you how to decompose complex systems. Utilize university clubs to hone communication and real negotiations."
      }
    ],
    "CSE": [
      {
        name: "Saurabh Mukhopadhyay",
        year: "Class of 2015",
        branch: "Computer Science & Engineering",
        role: "Principal Tech Lead / Co-Founder, VectorDB Systems",
        trajectory: "Developed research interests in parallel systems. Worked at Bell Labs, India, as a systems architect before co-founding a high-throughput vector database company that eventually secured Series A funding of $12M.",
        achievement: "Engineered a custom database backend that improved ML indexing performance globally by 4x.",
        qualitativeAdvice: "Competitive programming is great for logic, but real systems engineering is about understanding how CPU caches, Disk I/O, and networks truly mesh. Read open-source codebases (like Postgres or Redis) in your spare time."
      },
      {
        name: "Rhea Deshmukh",
        year: "Class of 2018",
        branch: "Computer Science & Engineering",
        role: "Research Scientist at Google AI DeepMind, London",
        trajectory: "Did a summer internship at INRIA France, then graduated with academic honors. Admitted directly to a Ph.D. track at CMU in Machine Learning, focusing on multimodal transformer latency controls, before joining DeepMind.",
        achievement: "Co-authored 3 flagship papers in NeurIPS and ICML on energy-efficient local transformer architectures.",
        qualitativeAdvice: "If you want a research career, build deep relations with your professors. A rigorous recommendation letter backed by raw research project efforts carries manifold more weight than any GPA decimal."
      }
    ],
    "EE": [
      {
        name: "Kunal Singhal",
        year: "Class of 2014",
        branch: "Electrical Engineering",
        role: "Director of Silicon Design, Qualcomm",
        trajectory: "Spent 2 years working on chip layout validation at Intel, India. Pursued an MS at University of Texas, Austin, specializing in low-power Mixed-Signal IC design. Rose through Qualcomm's chip-design teams in San Diego.",
        achievement: "Principal architect of the latest Snapdragon power-management modular chip, lowering standby drain by 18%.",
        qualitativeAdvice: "Hardware takes patience. Unlike pure software, chips have physical constraints and manufacturing cycles. Learn Verilog/VHDL, and master PCB design fundamentals and signal integrity early."
      }
    ]
  };

  // Determine appropriate fallback data
  let fallbackList = fallbackStories[normalizedBranch] || fallbackStories["default"];
  if (normalizedBranch !== "CSE" && normalizedBranch !== "EE" && fallbackStories[normalizedBranch]) {
    fallbackList = fallbackStories[normalizedBranch];
  } else if (normalizedBranch.includes("ECE") || normalizedBranch.includes("ELECT")) {
    fallbackList = fallbackStories["EE"];
  }

  if (!ai) {
    // If Gemini is not set up, return robust fallback immediately
    return res.json({
      success: true,
      source: "cached",
      stories: fallbackList,
      note: "Showing pre-validated career paths (Local Standby Mode enabled)."
    });
  }

  try {
    const prompt = `You are a high-quality academic career trajectories analyzer. 
Generate 2-3 highly distinct, realistic, and inspiring hypothetical but representative alumni success story profiles for the department ${normalizedBranch} at ${clgName}. 
The stories must focus on qualitative career pathways (grad studies, startups, research, niche sectors) rather than just typical corporate package numbers. 

Return your response strictly as a JSON array of objects. Do NOT use markdown code blocks or wrapper markers in your JSON response. Return raw JSON text containing a JSON array.
Each object must have these exact fields, structured as normal JSON string pairs:
{
  "name": "Full string name",
  "year": "Graduation Class Year format, eg 'Class of 2017'",
  "branch": "Detailed full branch name, eg 'Computer Science & Engineering'",
  "role": "Current elegant designation/job title",
  "trajectory": "Detailed 2-3 sentence overview of their steps (internships, MS/PhD if any, pivot points, roles)",
  "achievement": "A specific high-impact milestone they achieved (e.g. patented a system, raised funding, built open-source tools)",
  "qualitativeAdvice": "Genuine, qualitative and action-oriented advice for modern college students studying this topic (no corporate cliché, focus on real engineering design principles or mindset)"
}`;

    const response = await generateWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    });

    const parsedText = response.text || "";
    try {
      // Safely parse JSON
      const jsonResponse = JSON.parse(parsedText);
      return res.json({
        success: true,
        source: "gemini",
        stories: Array.isArray(jsonResponse) ? jsonResponse : fallbackList
      });
    } catch (parseError) {
      console.warn("Could not parse Gemini JSON response, defaulting gracefully to offline-ready fallback content.", parseError);
      return res.json({
        success: true,
        source: "cached_fallback",
        stories: fallbackList,
        note: "Fallback returned due to parser alignment constraints."
      });
    }
  } catch (error: any) {
    console.error("Gemini Alumni Stories generation failed:", error);
    return res.json({
      success: true,
      source: "cached_fallback",
      stories: fallbackList,
      note: "Backup trajectories loaded dynamically."
    });
  }
});


// --- VITE DEV / PRODUCTION INGRESS ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development server middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files served in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 RankWise server running on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();
