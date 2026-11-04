import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import {
  X,
  ArrowUp,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Package,
  Activity,
  Sliders
} from 'lucide-react';

interface ToolStep {
  step: number;
  tool: string;
  arguments: any;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  duration_ms: number;
  output_summary: string;
}

interface Evidence {
  metric_name: string;
  actual_value: string;
  comparison_value?: string;
  change_pct?: string;
  source: string;
  data_classification: 'OBSERVED' | 'ESTIMATED' | 'PREDICTED' | 'SIMULATED';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  execution_steps?: ToolStep[];
  evidence?: Evidence[];
  citations?: string[];
  caveats?: string[];
  error?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Why did revenue decrease this week?',
  'Which products have the highest stockout risk?',
  'What happens if demand increases by 15%?',
  'Compare ShopPulse and TechMart for the last 30 days',
  'Which products have high revenue but low margins?',
  'Summarize the latest anomalies'
];

const STARTER_CARDS = [
  {
    icon: TrendingDown,
    title: 'Revenue Variance Analysis',
    query: 'Why did revenue decrease this week?'
  },
  {
    icon: Package,
    title: 'Supply Chain Stockout Risk',
    query: 'Which products have the highest stockout risk?'
  },
  {
    icon: Sliders,
    title: 'What-If Demand Surge',
    query: 'What happens if demand increases by 15%?'
  },
  {
    icon: Activity,
    title: 'Cross-Store Parity',
    query: 'Compare ShopPulse and TechMart for the last 30 days'
  }
];

export const PulseAIChatDrawer: React.FC = () => {
  const { selectedSource } = useDashboard();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openStepsMessageId, setOpenStepsMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am PulseAI, your evidence-backed Retail Intelligence Assistant. I query verified event telemetry, statistical Holt-Winters forecasts, deterministic ROP formulas, and price elasticity simulations directly from Python. How can I assist your business review today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['RetailPulse Audited Data Lake']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await retailPulseApiService.askPulseAI(q, selectedSource, historyPayload);

      if (res && res.success && res.data) {
        const d = res.data;
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: d.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          execution_steps: d.execution_steps,
          evidence: d.evidence,
          citations: d.citations,
          caveats: d.caveats_and_limitations
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: res?.message || 'The Python AI service is currently unavailable. Please verify port 8000 is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'Network error reaching PulseAI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation reset. Ask any question to inspect KPIs, evaluate model forecasts, simulate price scenarios, or investigate revenue drivers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getClassificationBadge = (cls: Evidence['data_classification']) => {
    switch (cls) {
      case 'OBSERVED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60';
      case 'ESTIMATED':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/60';
      case 'PREDICTED':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/60';
      case 'SIMULATED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/60';
    }
  };

  const isInitialWelcomeOnly = messages.length <= 1;

  return (
    <>
      {/* Floating Trigger Button (Round circular floating button with robot avatar) */}
      {!isOpen && (
        <button
          id="ask-pulseai-trigger-btn"
          onClick={() => setIsOpen(true)}
          title="Ask PulseAI"
          aria-label="Ask PulseAI"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer border border-white/25 select-none"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform">
            <img 
              src="/pulseai_avatar.png" 
              alt="PulseAI Robot" 
              className="w-full h-full object-contain filter drop-shadow-md animate-bot-bob" 
            />
          </div>
          <span 
            className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-neutral-900 animate-pulse" 
            title="PulseAI Online"
          />
        </button>
      )}

      {/* Floating Chat Drawer (Task 2: Redesigned matching Image 4 Navigator aesthetic) */}
      {isOpen && (
        <div
          id="pulseai-chat-drawer"
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-white/10 rounded-[32px] sm:rounded-[36px] shadow-[0_25px_80px_rgba(15,23,42,0.22)] flex flex-col overflow-hidden transition-all duration-300 select-none ${
            isExpanded ? 'w-[95vw] md:w-[780px] h-[88vh]' : 'w-[95vw] md:w-[480px] h-[670px]'
          }`}
        >
          {/* Header matching Image 4 clean minimalism */}
          <div className="px-5 py-3.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl text-neutral-900 dark:text-white flex items-center justify-between border-b border-neutral-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-neutral-100 dark:bg-white/10 p-0.5 flex items-center justify-center ring-2 ring-indigo-500/30">
                <img 
                  src="/pulseai_avatar.png" 
                  alt="PulseAI Robot" 
                  className="w-full h-full object-contain filter drop-shadow-xs" 
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight font-heading leading-tight flex items-center gap-1.5">
                  PulseAI
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                    Copilot
                  </span>
                </h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Bounded & Evidence-Backed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-bold px-2.5 py-1 rounded-full font-mono mr-1">
                {selectedSource}
              </span>
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors hidden md:block cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream Container with celestial soft gradient matching Image 4 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs bg-gradient-to-b from-[#EAF1F8] via-[#F4F8FB] to-[#FFFFFF] dark:from-[#0B132B] dark:via-[#0F172A] dark:to-[#0B0F19]">
            
            {/* Screen 1 / Welcome State matching Image 4 left screen */}
            {isInitialWelcomeOnly && (
              <div className="flex flex-col items-center justify-center text-center py-6 px-3 space-y-4">
                <div className="w-24 h-24 rounded-full p-2 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 blur-xl animate-pulse" />
                  <img 
                    src="/pulseai_avatar.png" 
                    alt="PulseAI Robot" 
                    className="w-full h-full object-contain filter drop-shadow-2xl animate-bot-bob relative z-10" 
                  />
                </div>

                <div className="max-w-xs space-y-1">
                  <h4 className="text-base font-extrabold text-neutral-900 dark:text-white font-heading">
                    Meet PulseAI
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Your autonomous retail copilot directly querying verified event telemetry & statistical Python engines.
                  </p>
                </div>

                {/* Starter Option Cards matching Image 4 choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm pt-2">
                  {STARTER_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.query)}
                      disabled={loading}
                      className="p-3 text-left rounded-2xl bg-white/90 dark:bg-neutral-800/90 border border-neutral-200/70 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xs hover:shadow-md transition-all group cursor-pointer"
                    >
                      <card.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-[11px] text-neutral-900 dark:text-white leading-tight">
                        {card.title}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {card.query}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Thread */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Robot Avatar from Image 2 */}
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-neutral-200 dark:ring-white/10 flex items-center justify-center p-0.5">
                    <img 
                      src="/pulseai_avatar.png" 
                      alt="PulseAI" 
                      className="w-full h-full object-contain filter drop-shadow-xs" 
                    />
                  </div>
                )}

                {/* Message Bubble matching Image 4 speech bubble cards */}
                <div
                  className={`max-w-[85%] rounded-[24px] p-4 space-y-2.5 transition-all ${
                    msg.sender === 'user'
                      ? 'bg-[#0B1536] dark:bg-indigo-600 text-white rounded-tr-sm shadow-md'
                      : msg.error
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-tl-sm shadow-sm'
                      : 'bg-white dark:bg-neutral-800/95 border border-neutral-100/90 dark:border-white/10 text-neutral-900 dark:text-neutral-100 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {/* Main Message Text */}
                  <div className="leading-relaxed whitespace-pre-wrap text-xs sm:text-[13px]">
                    {msg.text}
                  </div>

                  {/* Multi-Step Investigation Accordion */}
                  {msg.execution_steps && msg.execution_steps.length > 0 && (
                    <div className="pt-2.5 border-t border-neutral-100 dark:border-white/10">
                      <button
                        onClick={() =>
                          setOpenStepsMessageId(openStepsMessageId === msg.id ? null : msg.id)
                        }
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {openStepsMessageId === msg.id ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          Multi-Step Investigation ({msg.execution_steps.length} Tool Calls)
                        </span>
                      </button>

                      {openStepsMessageId === msg.id && (
                        <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-indigo-400 dark:border-indigo-600">
                          {msg.execution_steps.map((step) => (
                            <div
                              key={step.step}
                              className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-white/10 text-[10px] space-y-0.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                  Step {step.step}: {step.tool}
                                </span>
                                <span className="text-neutral-400 font-mono">{step.duration_ms}ms</span>
                              </div>
                              <div className="text-neutral-500 dark:text-neutral-400 italic">
                                {step.output_summary}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empirical Evidence Badges Grid */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="pt-2.5 border-t border-neutral-100 dark:border-white/10 space-y-2">
                      <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-indigo-500" /> Empirical Evidence Points
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-white/10 flex justify-between items-center text-[10px]"
                          >
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-white">
                                {ev.metric_name}
                              </div>
                              <div className="text-neutral-400 text-[9px]">
                                {ev.comparison_value ? `${ev.comparison_value}` : `Source: ${ev.source}`}
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <div className="font-mono font-bold text-neutral-900 dark:text-white">
                                  {ev.actual_value}
                                </div>
                                {ev.change_pct && (
                                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[9px]">
                                    {ev.change_pct}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getClassificationBadge(
                                  ev.data_classification
                                )}`}
                              >
                                {ev.data_classification}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caveats Alert */}
                  {msg.caveats && msg.caveats.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[10px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>{msg.caveats.join(' ')}</div>
                    </div>
                  )}

                  {/* Citations Footer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="text-[9px] text-neutral-400 flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      <span>Citations: {msg.citations.join(', ')}</span>
                    </div>
                  )}

                  <div className={`text-[9px] text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-neutral-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking / Loading State */}
            {loading && (
              <div className="flex gap-3 items-center text-xs text-neutral-500">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-neutral-200 dark:ring-white/10 flex items-center justify-center p-0.5">
                  <img 
                    src="/pulseai_avatar.png" 
                    alt="PulseAI Thinking" 
                    className="w-full h-full object-contain filter drop-shadow-xs animate-bot-bob" 
                  />
                </div>
                <div className="p-3.5 rounded-[22px] rounded-tl-sm bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-white/10 shadow-xs flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px]">Executing approved tools & reasoning across lake telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Option Pills Bar matching Image 4 pill choices */}
          <div className="px-4 py-2 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-100 dark:border-white/10 overflow-x-auto flex gap-2 no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-3.5 py-1.5 text-[11px] font-medium rounded-full bg-neutral-100/90 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-white transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar matching Image 4 rounded pill input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-100 dark:border-white/10 flex items-center gap-2"
          >
            <div className="flex-1 rounded-full bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/90 dark:border-white/10 shadow-inner pl-4 pr-1.5 py-1.5 flex items-center justify-between gap-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input
                id="pulseai-chat-input"
                type="text"
                placeholder="Ask PulseAI about revenue, stockouts, margins, what-if..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none flex-1 py-1"
              />
              <button
                id="pulseai-chat-send-btn"
                type="submit"
                disabled={!inputQuery.trim() || loading}
                aria-label="Send Message"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  inputQuery.trim() && !loading
                    ? 'bg-[#0B1536] dark:bg-indigo-600 text-white hover:scale-105 shadow-sm'
                    : 'bg-neutral-200 dark:bg-white/10 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Non-fabrication Footnote */}
          <div className="py-1.5 px-4 bg-neutral-50/90 dark:bg-neutral-950 text-[9px] text-neutral-400 dark:text-neutral-500 text-center border-t border-neutral-100 dark:border-white/10">
            PulseAI strictly cites audited database records & Python model engines. No fabricated figures.
          </div>
        </div>
      )}
    </>
  );
};

export default PulseAIChatDrawer;
