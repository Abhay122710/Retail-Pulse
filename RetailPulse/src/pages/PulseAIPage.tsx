import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { retailPulseApiService } from '../services/retailPulseApiService';
import {
  RotateCcw,
  User,
  ShieldCheck,
  AlertTriangle,
  Layers,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Package,
  Sliders,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronRight,
  ArrowUp
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

const TEMPLATE_QUESTIONS = [
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
    icon: Activity,
    title: 'Cross-Store Benchmarking',
    query: 'Compare ShopPulse and TechMart for the last 30 days'
  },
  {
    icon: Sliders,
    title: 'What-If Demand Surge',
    query: 'What happens if demand increases by 15%?'
  },
  {
    icon: DollarSign,
    title: 'Profitability & Low Margins',
    query: 'Which products have high revenue but low margins?'
  },
  {
    icon: AlertTriangle,
    title: 'Statistical Anomalies',
    query: 'Summarize the latest anomalies'
  }
];

export const PulseAIPage: React.FC = () => {
  const { selectedSource } = useDashboard();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openStepsId, setOpenStepsId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-page',
      sender: 'assistant',
      text: 'Welcome to PulseAI Retail Intelligence. I am directly integrated with RetailPulse\'s Python ML services, time-series forecasting, and supply chain telemetry. Ask any question below or click a template question to begin.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['RetailPulse Audited Data Lake']
    }
  ]);

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
          text: res?.message || 'The Python AI service is unreachable. Please verify port 8000 is active.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'Network error communicating with PulseAI.',
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
        text: 'Session reset. What performance metric or scenario would you like to investigate next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getClassificationBadge = (cls: Evidence['data_classification']) => {
    switch (cls) {
      case 'OBSERVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'ESTIMATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case 'PREDICTED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
      case 'SIMULATED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-white dark:bg-neutral-800 shadow-md ring-2 ring-indigo-500/30 p-1 flex items-center justify-center">
            <img src="/pulseai_avatar.png" alt="PulseAI" className="w-full h-full object-contain filter drop-shadow-sm animate-bot-bob" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight font-heading text-neutral-900 dark:text-white">PulseAI Intelligence Copilot</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Bounded & Evidence-Backed
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Evidence-backed conversational intelligence powered directly by Python statistical models and live lake telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors self-start md:self-auto cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Session
        </button>
      </div>

      {/* Suggested Template Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATE_QUESTIONS.map((t, idx) => {
          const Icon = t.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(t.query)}
              disabled={loading}
              className="p-3 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-500 hover:shadow-sm transition-all group disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t.title}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{t.query}</div>
            </button>
          );
        })}
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-neutral-200 dark:ring-white/10 flex items-center justify-center p-0.5">
                  <img src="/pulseai_avatar.png" alt="PulseAI" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-[24px] p-4 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#0B1536] dark:bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : msg.error
                    ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-tl-sm'
                    : 'bg-white dark:bg-neutral-800/95 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 rounded-tl-sm shadow-xs'
                }`}
              >
                {/* Message Body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* Multi-step Investigation Accordion */}
                {msg.execution_steps && msg.execution_steps.length > 0 && (
                  <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700/60">
                    <button
                      onClick={() => setOpenStepsId(openStepsId === msg.id ? null : msg.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
                    >
                      {openStepsId === msg.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>Investigation Plan: {msg.execution_steps.length} Tool Executions</span>
                    </button>

                    {openStepsId === msg.id && (
                      <div className="mt-2.5 space-y-2 pl-3 border-l-2 border-indigo-400 dark:border-indigo-600">
                        {msg.execution_steps.map((st) => (
                          <div
                            key={st.step}
                            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                Step {st.step}: {st.tool}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">{st.duration_ms}ms</span>
                            </div>
                            <div className="text-[11px] text-gray-500 italic">{st.output_summary}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Grid */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700/60 space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Supporting Empirical Evidence
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{ev.metric_name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {ev.comparison_value || `Source: ${ev.source}`}
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <div className="font-bold font-mono text-gray-900 dark:text-gray-100">{ev.actual_value}</div>
                              {ev.change_pct && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                  {ev.change_pct}
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getClassificationBadge(ev.data_classification)}`}>
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
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>{msg.caveats.join(' ')}</div>
                  </div>
                )}

                {/* Citations Footer */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Citations: {msg.citations.join(', ')}</span>
                  </div>
                )}

                <div className="text-[10px] text-gray-400 text-right">{msg.timestamp}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-sm text-neutral-500">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-neutral-200 dark:ring-white/10 flex items-center justify-center p-0.5">
                <img src="/pulseai_avatar.png" alt="PulseAI Thinking" className="w-full h-full object-contain filter drop-shadow-xs animate-bot-bob" />
              </div>
              <div className="p-3.5 rounded-[22px] rounded-tl-sm bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Orchestrating investigation across Python predictive engines & connector tools...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar matching Image 4 pill */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-200/80 dark:border-neutral-700/80 flex items-center gap-3"
        >
          <div className="flex-1 rounded-full bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/90 dark:border-white/10 shadow-inner pl-5 pr-2 py-2 flex items-center justify-between gap-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <input
              type="text"
              placeholder="Ask a question about sales variance, reorder quantities, store comparisons, or margin analysis..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none flex-1 py-1"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                inputQuery.trim() && !loading
                  ? 'bg-[#0B1536] dark:bg-indigo-600 text-white hover:scale-105 shadow-sm'
                  : 'bg-neutral-200 dark:bg-white/10 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Disclaimer Footer */}
        <div className="py-2 px-6 bg-gray-50 dark:bg-gray-900 text-xs text-gray-400 text-center border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>
            PulseAI operates strictly within approved read-only tools. Material metrics are cited from Python model inferences or stored event tables.
          </span>
        </div>
      </div>
    </div>
  );
};
export default PulseAIPage;
