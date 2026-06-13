import React, { useEffect, useRef, useState } from 'react';
import { BrainCircuit, ChevronDown, Loader2, Send, Sparkles } from '../icons/Icons';
import { getChartHighlights, chatWithPatientData } from '../../services/aiService';

interface ChatMessage {
  role: 'doctor' | 'ai';
  text: string;
}

interface MediSaathiPanelProps {
  patientName: string;
  patientContextJSON: string;
}

/* ── tiny markdown-ish renderer for AI chat answers ─────────────────── */
const Answer: React.FC<{ text: string }> = ({ text }) => (
  <div className="space-y-1 text-sm leading-relaxed">
    {text.split('\n').map((line, i) => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <p key={i} className="flex gap-2">
            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </p>
        );
      }
      if (!line.trim()) return <div key={i} className="h-1" />;
      return <p key={i}>{line}</p>;
    })}
  </div>
);

const MediSaathiPanel: React.FC<MediSaathiPanelProps> = ({ patientName, patientContextJSON }) => {
  const [expanded, setExpanded] = useState(false);
  const [highlights, setHighlights] = useState<string[] | null>(null);
  const [highlightsLoading, setHighlightsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded || highlights !== null || highlightsLoading) return;
    setHighlightsLoading(true);
    getChartHighlights(patientContextJSON)
      .then(setHighlights)
      .finally(() => setHighlightsLoading(false));
  }, [expanded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleAsk = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q || chatLoading) return;
    const history = [...messages, { role: 'doctor' as const, text: q }];
    setMessages(history);
    setInput('');
    setChatLoading(true);
    const answer = await chatWithPatientData(q, patientContextJSON, messages);
    setMessages([...history, { role: 'ai', text: answer }]);
    setChatLoading(false);
  };

  return (
    <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold font-heading text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              MediSaathi <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">AI</span>
            </p>
            <p className="text-xs text-muted-foreground">Ambient insights & chart Q&A for {patientName}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-indigo-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-in fade-in duration-200">
          {/* Highlights */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Things to know
            </p>
            {highlightsLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Scanning chart...
              </div>
            )}
            {!highlightsLoading && highlights && highlights.length === 0 && (
              <p className="text-xs text-muted-foreground">Nothing notable surfaced from this patient's record.</p>
            )}
            {!highlightsLoading && highlights && highlights.length > 0 && (
              <ul className="space-y-1">
                {highlights.map((h, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat */}
          <div className="space-y-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ask about this patient</p>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {['Active medications?', 'Any allergies on record?', 'Latest vitals trend?', 'Anything overdue for follow-up?'].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/40 bg-background hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'doctor' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-card border border-border/50 shadow-sm rounded-tl-sm'}`}>
                      {msg.role === 'ai' ? <Answer text={msg.text} /> : msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl bg-card border border-border/50 shadow-sm flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-500" /> Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAsk(); } }}
                placeholder="Ask anything about this patient's records..."
                className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={chatLoading || !input.trim()}
                className="h-9 w-9 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediSaathiPanel;
