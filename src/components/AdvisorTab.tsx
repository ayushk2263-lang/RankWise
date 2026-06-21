import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Sliders, 
  RefreshCw,
  Info,
  GraduationCap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { predictColleges } from '../data/collegeData';
import { UserSession } from '../types';
import CareerPredictorPanel from './CareerPredictorPanel';

interface AdvisorTabProps {
  user: UserSession | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AdvisorTab({ user }: AdvisorTabProps) {
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `### Welcome to RankWise AI Admissions Advisory! 🎓
I have compiled your JEE statistics and matched choices behind the scene.

I am ready to help you with:
- **JoSAA choice-filling order** priorities based on your rank.
- **IIT vs NIT brand** tradeoff evaluations.
- High-level branch explanations (e.g., Core Electrical vs Computer Science).
- **Freeze, Float, or Slide** strategy counseling per round.

Ask below, or click any suggestion chip to begin!`
    }
  ]);

  const [loadingStep, setLoadingStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(false);
  const [activeSpeakingMsgIndex, setActiveSpeakingMsgIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakAdvice = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setActiveSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // strip markdown formatting characters to sound clean
    const plainText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/-\s+/g, '')
      .replace(/:\s+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => {
      setActiveSpeakingMsgIndex(null);
    };
    utterance.onerror = () => {
      setActiveSpeakingMsgIndex(null);
    };

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setActiveSpeakingMsgIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Set to Indian context/English

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserQuery(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
    }
  };

  const suggestionChips = [
    "Should I prioritize IIT Bombay Mech over NIT Trichy CS?",
    "What are my best options with my current rank?",
    "Explain JoSAA Float vs Slide vs Freeze rules clearly.",
    "Which is better: BITS Goa CS or newer IIT Electrical?"
  ];

  const triggerCounselSubmit = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    // Shut down speech if someone starts typing or sending new messages
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeakingMsgIndex(null);
    }

    const userMessage: ChatMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMessage]);
    setUserQuery('');
    setLoading(true);

    // Simulated loading phase steps
    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 4);
    }, 1500);

    try {
      // Gather predictions for context to assist advisor
      const targetRank = user?.rank || 2500;
      const targetCat = user?.category || 'OPEN';
      const targetState = user?.homeState || 'Maharashtra';
      const targetGender = user?.gender || 'Gender-Neutral';
      const targetExam = user?.examType || 'JEE-Advanced';

      const matches = predictColleges({
        rank: targetRank,
        category: targetCat,
        gender: targetGender,
        homeState: targetState,
        examType: targetExam
      });

      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rank: targetRank,
          category: targetCat,
          gender: targetGender,
          homeState: targetState,
          examType: targetExam,
          predictedList: matches,
          userQuery: queryText
        })
      });

      const data = await response.json();
      clearInterval(loadingInterval);

      if (response.ok && data.success) {
        setMessages(prev => {
          const nextMsgs: ChatMessage[] = [...prev, {
            role: 'assistant',
            content: data.advice
          }];

          if (voiceResponsesEnabled) {
            setTimeout(() => {
              speakAdvice(data.advice, nextMsgs.length - 1);
            }, 100);
          }

          return nextMsgs;
        });
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠ **Advisor is off-duty:** ${data.error || "Could not fetch advisor analysis. Confirm if GEMINI_API_KEY is configured in your Secrets menu."}`
        } as ChatMessage]);
      }
    } catch (err: any) {
      clearInterval(loadingInterval);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error contacting advisor server. Make sure the backend dev server is active and secrets have been initialized correctly.`
      } as ChatMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadingStepsText = [
    "Parsing your scorecards and state eligibility statistics...",
    "Querying JoSAA Round 6 cutoffs directory...",
    "Calculating Safe, Dream and Target threshold variances...",
    "Synthesizing customized branch filling advisory with Gemini AI..."
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in animate-duration-300">
      {/* Advisor Header */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <MessageSquareCode className="w-32 h-32 text-indigo-400 stroke-[1]" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">AI Admissions Advisor</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Personalized counselor powered by server-side Gemini to assist you with choice-filling tactics.
            </p>
          </div>
        </div>

        {/* User context badge */}
        <div className="flex gap-2 relative z-10">
          <div className="bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 shadow-inner">
            <span className="text-slate-500 font-sans">Active Session:</span>{' '}
            <span className="text-indigo-400 font-bold">#{user?.rank || 2500}</span> ({user?.category || 'OPEN'})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Logs panel */}
        <div className="lg:col-span-7 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-2xl relative">
          {/* Messages list container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar indicator */}
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-extrabold text-xs shrink-0 font-sans shadow-sm">
                    RW
                  </div>
                )}

                {/* Message Content Bubble */}
                <div className={`max-w-[80%] rounded-2xl p-4.5 text-xs tracking-wide leading-relaxed shadow-lg border relative ${
                  m.role === 'user'
                    ? 'bg-indigo-650/15 text-slate-100 border-indigo-500/35 rounded-tr-none'
                    : 'backdrop-blur-sm bg-black/35 border-white/5 rounded-tl-none text-slate-200 pr-11'
                }`}>
                  {m.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakAdvice(m.content, idx)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group shrink-0"
                      title={activeSpeakingMsgIndex === idx ? "Mute Speech" : "Read Aloud"}
                    >
                      {activeSpeakingMsgIndex === idx ? (
                        <div className="flex items-center gap-1">
                          <div className="w-0.5 h-2 bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-0.5 h-3 bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-0.5 h-1.5 bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          <VolumeX className="w-3.5 h-3.5 text-indigo-400 ml-1 shrink-0" />
                        </div>
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
                      )}
                    </button>
                  )}

                  {m.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none text-slate-250 prose-sm prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : (
                    <p className="font-medium">{m.content}</p>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                  RW
                </div>
                <div className="backdrop-blur-sm bg-black/40 border border-white/5 rounded-2xl rounded-tl-none p-5 space-y-3 max-w-[70%] shadow-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="font-sans font-semibold text-xs text-white">Advisory model working</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono transition-all">
                    {loadingStepsText[loadingStep]}
                  </p>
                  {/* Simulated bar */}
                  <div className="w-full bg-black/50 h-1 rounded overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded transition-all duration-500" style={{ width: `${(loadingStep + 1) * 25}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested inputs chips row */}
          {!loading && (
            <div className="px-6 py-3.5 border-t border-white/5 bg-black/30 flex flex-wrap gap-2 items-center overflow-x-auto whitespace-nowrap scrollbar-none">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold shrink-0">Helper:</span>
              {suggestionChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => triggerCounselSubmit(chip)}
                  className="text-[10px] bg-white/5 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-xl transition-all font-sans cursor-pointer active:scale-95 shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input prompt box */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                triggerCounselSubmit(userQuery);
              }} 
              className="flex flex-col gap-2"
            >
              <div className="flex gap-3">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95 duration-200 ${
                      isListening
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30'
                    }`}
                    title={isListening ? "Recording voice... Click to pause" : "Record voice query"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <Mic className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                )}

                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    disabled={loading}
                    placeholder={isListening ? "Listening... Speak clearly now" : "Ask anything (e.g. 'Is IIT Bombay CS worth it?')" }
                    className="w-full bg-black/30 border border-white/10 text-slate-100 pl-4 pr-11 py-3 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  />

                  {/* Speaker icon for toggle auto voice response readout */}
                  <button
                    type="button"
                    onClick={() => setVoiceResponsesEnabled(!voiceResponsesEnabled)}
                    className={`absolute right-3.5 p-1 rounded-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      voiceResponsesEnabled
                        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                    title={voiceResponsesEnabled ? "AI Voice response readout enabled" : "AI Voice response readout disabled"}
                  >
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!userQuery.trim() || loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 p-2.5 px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <span>Consult</span>
                  <Send className="w-3.5 h-3.5 mt-0.5 text-indigo-250 shrink-0" />
                </button>
              </div>

              {/* Speech recognition visualizer / Helper tip */}
              {isListening && (
                <div className="px-3.5 py-2 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-center justify-between text-[10px] text-rose-400 font-mono animate-fade-in shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Mic is open. Start talking. Your spoken words will populate the field...</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsListening(false)}
                    className="text-rose-300 hover:underline cursor-pointer"
                  >
                    Mute Mic
                  </button>
                </div>
              )}

              {/* Status footer for general speech info */}
              {!isListening && voiceResponsesEnabled && (
                <div className="px-1 text-[9px] text-indigo-400 font-sans tracking-wide flex items-center gap-1.5 opacity-80 select-none animate-fade-in shrink-0">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Interactive Voice Response readout active. Advisor will speak answers aloud.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right column: Career Path Predictor Dashboard */}
        <div className="lg:col-span-5 h-[520px] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 rounded-2xl">
          <CareerPredictorPanel />
        </div>
      </div>
    </div>
  );
}
