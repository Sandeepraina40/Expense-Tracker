import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles,
  MessageCircle,
  Zap,
  X,
  Send,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Heart,
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const TABS = [
  { id: 'insights', label: 'Full Analysis', icon: Sparkles },
  { id: 'quick', label: 'Quick Tips', icon: Zap },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle },
];

const SAMPLE_QUESTIONS = [
  'Where am I overspending the most?',
  'How can I cut my spending by 20%?',
  'Compare this month to last month.',
  'What budget should I set for Food?',
];

function HealthScore({ score }) {
  const value = Math.min(10, Math.max(1, Number(score) || 5));
  const color =
    value >= 8 ? 'text-emerald-400' : value >= 5 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-4 min-w-[100px]">
      <span className={`text-4xl font-extrabold ${color}`}>{value}</span>
      <span className="text-xs text-slate-400 mt-1">Health / 10</span>
    </div>
  );
}

function StructuredInsights({ data }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
        <HealthScore score={data.healthScore} />
        <div className="flex-1 space-y-3">
          <p className="text-white leading-relaxed">{data.summary}</p>
          {data.topInsight && (
            <p className="text-purple-300 text-sm border-l-2 border-purple-500 pl-3">
              {data.topInsight}
            </p>
          )}
        </div>
      </div>

      {data.patterns?.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Spending patterns
          </h4>
          <ul className="space-y-2">
            {data.patterns.map((item, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-blue-400 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.savingsTips?.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Savings tips
          </h4>
          <ul className="space-y-2">
            {data.savingsTips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-slate-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.monthComparison && (
        <section className="text-sm text-slate-300 bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="font-semibold text-white mb-1">Month over month</h4>
          {data.monthComparison}
        </section>
      )}

      {data.budgetAdvice && (
        <section className="text-sm text-slate-300">
          <h4 className="font-semibold text-white mb-1">Budget advice</h4>
          <p className="leading-relaxed">{data.budgetAdvice}</p>
        </section>
      )}

      {data.encouragement && (
        <p className="text-sm text-pink-300/90 flex items-start gap-2 pt-2 border-t border-white/10">
          <Heart className="h-4 w-4 shrink-0 mt-0.5" />
          {data.encouragement}
        </p>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  const isKeyError =
    message?.toLowerCase().includes('api key') || message?.toLowerCase().includes('not configured');

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex gap-3 mb-4">
      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="text-sm text-rose-100 space-y-2">
        <p>{message}</p>
        {isKeyError && (
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-rose-300 underline hover:text-white"
          >
            Get a new Gemini API key →
          </a>
        )}
      </div>
    </div>
  );
}

const AIAssistant = ({ getAuthHeaders, expenseCount, onClose }) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [insightsData, setInsightsData] = useState(null);
  const [plainInsights, setPlainInsights] = useState(null);
  const [quickTips, setQuickTips] = useState(null);
  const [chatAnswer, setChatAnswer] = useState(null);
  const [question, setQuestion] = useState('');

  const runInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInsightsData(null);
    setPlainInsights(null);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/expenses/insights`, {
        headers: getAuthHeaders(),
      });
      if (data.structured) {
        setInsightsData(data);
      } else {
        setPlainInsights(data.insights);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insights.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const runQuickTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuickTips(null);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/expenses/insights/quick`, {
        headers: getAuthHeaders(),
      });
      setQuickTips(data.tips);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tips.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const runAsk = useCallback(
    async (q) => {
      const text = (q ?? question).trim();
      if (!text) return;

      setLoading(true);
      setError(null);
      setChatAnswer(null);
      setQuestion(text);

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/expenses/ai/ask`,
          { question: text },
          { headers: getAuthHeaders() }
        );
        setChatAnswer(data.answer);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to get an answer.');
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, question]
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setError(null);

    if (tabId === 'insights' && !insightsData && !plainInsights && expenseCount > 0) {
      runInsights();
    } else if (tabId === 'quick' && !quickTips && expenseCount > 0) {
      runQuickTips();
    }
  };

  useEffect(() => {
    if (expenseCount > 0) {
      runInsights();
    }
  }, [expenseCount, runInsights]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="AI Financial Assistant"
    >
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">AI Financial Assistant</h3>
              <p className="text-sm text-slate-400">
                Powered by Google Gemini · {expenseCount} transaction{expenseCount !== 1 ? 's' : ''}{' '}
                in your account
              </p>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium py-2.5 px-2 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-4 custom-scrollbar min-h-[200px]">
          {expenseCount === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Add some expenses first — then AI can analyze your spending, suggest savings, and answer
              questions about your data.
            </p>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="animate-pulse text-purple-300 text-sm">Working with Gemini AI...</p>
            </div>
          ) : (
            <>
              {error && <ErrorBanner message={error} />}

              {activeTab === 'insights' && !error && (
                <>
                  {insightsData && <StructuredInsights data={insightsData} />}
                  {plainInsights && (
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{plainInsights}</div>
                  )}
                  {!insightsData && !plainInsights && (
                    <button
                      onClick={runInsights}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium"
                    >
                      Generate full analysis
                    </button>
                  )}
                  {(insightsData || plainInsights) && (
                    <button
                      onClick={runInsights}
                      className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Regenerate analysis
                    </button>
                  )}
                </>
              )}

              {activeTab === 'quick' && !error && (
                <>
                  {quickTips?.length > 0 ? (
                    <ul className="space-y-3">
                      {quickTips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-slate-300 bg-white/5 rounded-xl p-3 border border-white/10"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                            {i + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      onClick={runQuickTips}
                      className="w-full py-3 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-medium"
                    >
                      Get 5 quick tips
                    </button>
                  )}
                  {quickTips?.length > 0 && (
                    <button
                      onClick={runQuickTips}
                      className="mt-4 text-sm text-amber-400 hover:text-amber-300"
                    >
                      Refresh tips
                    </button>
                  )}
                </>
              )}

              {activeTab === 'ask' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => runAsk(q)}
                        disabled={loading}
                        className="text-xs text-left px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {chatAnswer && !loading && (
                    <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {chatAnswer}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runAsk();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about your spending..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button
                      type="submit"
                      disabled={loading || !question.trim()}
                      className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white"
                      aria-label="Send question"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
