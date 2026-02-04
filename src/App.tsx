import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from './i18n/LanguageContext';

// Types
interface Task {
  id: string;
  platform: 'x' | 'instagram' | 'facebook' | 'tiktok';
  url: string;
  hashtags: string;
  title: string;
}

interface CompletedState {
  [taskId: string]: {
    completedAt: string;
  };
}

// SVG Icons for social platforms
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

// Platform configs
const platformConfig = {
  x: {
    name: 'X',
    icon: <XIcon />,
    color: 'from-zinc-800 to-zinc-900',
    hoverColor: 'hover:from-zinc-700 hover:to-zinc-800',
  },
  instagram: {
    name: 'IG',
    icon: <InstagramIcon />,
    color: 'from-pink-500 to-purple-600',
    hoverColor: 'hover:from-pink-400 hover:to-purple-500',
  },
  facebook: {
    name: 'FB',
    icon: <FacebookIcon />,
    color: 'from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-500 hover:to-blue-600',
  },
  tiktok: {
    name: 'TT',
    icon: <TikTokIcon />,
    color: 'from-zinc-900 to-pink-600',
    hoverColor: 'hover:from-zinc-800 hover:to-pink-500',
  },
};

// ===========================================
// ⚙️ SETTINGS - แก้ไขตรงนี้
// ===========================================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1toYmcphQ3KYfqCAt35G_ml8fh9f8qgEASUPHpAksLjk/export?format=csv&gid=0';
const BACKGROUND_IMAGE = 'https://pbs.twimg.com/media/HAOoaBRaUAAtTqq?format=jpg&name=large'; // ใส่ URL รูปพื้นหลัง หรือเว้นว่างไว้
// ===========================================

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize completed state from localStorage immediately (no race condition)
  const [completed, setCompleted] = useState<CompletedState>(() => {
    try {
      const saved = localStorage.getItem('social-tracker-completed');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    return {};
  });

  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [visibleCount, setVisibleCount] = useState(30);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Mark as loaded after first render
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // Save completed state to localStorage (only after initial load)
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('social-tracker-completed', JSON.stringify(completed));
  }, [completed, hasLoaded]);

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEET_URL);
        let csvText = await response.text();

        // Remove Byte Order Mark (BOM) if exists
        csvText = csvText.replace(/^\uFEFF/, '');

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const parsedTasks: Task[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Handle CSV with commas in quoted strings
          const values = parseCSVLine(lines[i]);

          const getVal = (headerName: string) => {
            const idx = headers.indexOf(headerName);
            return idx !== -1 ? values[idx] : '';
          };

          const task: Task = {
            id: getVal('id') || String(i),
            platform: (getVal('platform') || 'x').toLowerCase() as Task['platform'],
            url: getVal('url') || '',
            hashtags: getVal('hashtags') || '',
            title: getVal('title') || getVal('note') || '',
          };

          if (task.url) {
            parsedTasks.push(task);
          }
        }

        // Reverse to show latest (bottom of sheet) first
        setTasks(parsedTasks.reverse());
        setError(null);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Google Sheet URL');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Parse CSV line handling quoted strings
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterPlatform) {
      result = result.filter(t => t.platform === filterPlatform);
    }
    const pending = result.filter(t => !completed[t.id]);
    const done = result.filter(t => completed[t.id]);
    return showCompleted ? [...pending, ...done] : pending;
  }, [tasks, completed, filterPlatform, showCompleted]);

  // Lazy load
  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(0, visibleCount);
  }, [filteredTasks, visibleCount]);

  const pendingCount = tasks.filter(t => !completed[t.id]).length;
  const completedCount = tasks.filter(t => completed[t.id]).length;

  // Platform counts
  const platformCounts = useMemo(() => {
    const counts: Record<string, { pending: number; done: number }> = {};
    tasks.forEach(t => {
      if (!counts[t.platform]) counts[t.platform] = { pending: 0, done: 0 };
      if (completed[t.id]) {
        counts[t.platform].done++;
      } else {
        counts[t.platform].pending++;
      }
    });
    return counts;
  }, [tasks, completed]);

  // Get hashtags for platform
  const getCaption = (task: Task): string => {
    return task.hashtags || '';
  };

  // Copy to clipboard
  const handleCopy = async (task: Task) => {
    const text = getCaption(task);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Open the actual post URL
  const handleGoToPost = (task: Task) => {
    window.open(task.url, '_blank');
  };

  // Mark task as complete
  const handleMarkComplete = (taskId: string) => {
    setCompleted(prev => ({
      ...prev,
      [taskId]: { completedAt: new Date().toISOString() },
    }));
    setSelectedTask(null);
  };

  // Unmark task
  const handleUnmark = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(prev => {
      const newState = { ...prev };
      delete newState[taskId];
      return newState;
    });
  };

  // Quick complete without modal
  const handleQuickComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkComplete(taskId);
  };

  // Load more on scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setVisibleCount(prev => Math.min(prev + 30, filteredTasks.length));
    }
  }, [filteredTasks.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {BACKGROUND_IMAGE && (
        <div
          className="fixed inset-0 bg-cover bg-top bg-fixed z-0"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
        />
      )}

      {/* Dark Overlay */}
      <div className={`fixed inset-0 z-[1] ${BACKGROUND_IMAGE ? 'bg-slate-950/90 backdrop-blur-sm' : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900'}`} />

      {/* Content */}
      <div className="relative z-[2]">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
          <div className="max-w-lg mx-auto px-4 py-3">
            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>

              <div className="flex items-center gap-2">
                {/* Language Buttons */}
                <div className="flex rounded-full overflow-hidden border border-white/20">
                  <button
                    onClick={() => setLanguage('th')}
                    className={`px-2 py-1 text-xs font-bold transition-all ${language === 'th'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                  >
                    TH
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-xs font-bold transition-all ${language === 'en'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                  >
                    EN
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-amber-300 text-sm font-semibold">{pendingCount}</span>
                  <span className="text-white/30 text-xs">/</span>
                  <span className="text-green-300 text-sm">{completedCount}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterPlatform(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!filterPlatform
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
              >
                {t('all')} ({pendingCount})
              </button>

              {(['x', 'instagram', 'facebook', 'tiktok'] as const).map(p => {
                const count = platformCounts[p]?.pending || 0;
                const isActive = filterPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(isActive ? null : p)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${isActive
                      ? `bg-gradient-to-r ${platformConfig[p].color} border-white/20 text-white`
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    <span>{platformConfig[p].icon}</span>
                    <span>{count}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`px-2.5 py-1.5 rounded-full text-xs border transition-all ml-auto ${showCompleted
                  ? 'bg-green-500/20 border-green-500/30 text-green-300'
                  : 'bg-white/5 border-white/10 text-white/40'
                  }`}
              >
                {showCompleted ? t('hide') : t('show')}
              </button>
            </div>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200">
              {t('error')}
            </div>
          </div>
        )}

        {/* Task List */}
        <main
          onScroll={handleScroll}
          className="max-w-lg mx-auto px-3 py-3 h-[calc(100vh-140px)] overflow-y-auto"
        >
          <div className="flex flex-col gap-1.5 pb-24">
            {visibleTasks.map((task, index) => {
              const config = platformConfig[task.platform];
              const isCompleted = !!completed[task.id];
              const isFirstCompleted = isCompleted &&
                (index === 0 || !completed[visibleTasks[index - 1]?.id]);

              return (
                <div key={task.id}>
                  {/* Divider before completed section */}
                  {isFirstCompleted && showCompleted && (
                    <div className="flex items-center gap-2 py-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
                      <span className="text-green-400/60 text-xs">{t('completed')} {completedCount}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
                    </div>
                  )}

                  {/* Compact Task Card */}
                  <div
                    onClick={() => setSelectedTask(task)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border backdrop-blur-sm ${isCompleted
                      ? 'bg-white/[0.03] border-green-500/20 opacity-50'
                      : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.1] shadow-lg shadow-black/20'
                      }`}
                  >
                    {/* Platform badge */}
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-base flex-shrink-0 shadow-md`}>
                      {isCompleted ? '✓' : config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">
                        {task.title || t('noTitle')}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {task.hashtags}
                      </div>
                    </div>

                    {/* Actions */}
                    {isCompleted ? (
                      <button
                        onClick={(e) => handleUnmark(task.id, e)}
                        className="text-white/30 text-xs hover:text-white/60 px-2 py-1"
                      >
                        ↩
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleQuickComplete(task.id, e)}
                        className="bg-green-500/20 border border-green-500/30 text-green-400 text-sm px-2.5 py-1.5 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load more indicator */}
            {visibleCount < filteredTasks.length && (
              <div className="text-center py-4 text-white/40 text-xs">
                {t('scrollToLoad')} ({visibleCount}/{filteredTasks.length})
              </div>
            )}

            {tasks.length === 0 && !error && !loading && (
              <div className="text-center py-12 text-purple-300/60">
                <p className="text-4xl mb-4">📭</p>
                <p>{t('noTasks')}</p>
              </div>
            )}

            {filteredTasks.length === 0 && tasks.length > 0 && (
              <div className="text-center py-12 text-white/40">
                <p className="text-4xl mb-4">🎉</p>
                <p>{t('allDone')}</p>
              </div>
            )}
          </div>
        </main>

        {/* Floating stats */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/10 flex items-center gap-4 shadow-2xl shadow-black/50 z-30">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-300">{pendingCount}</div>
            <div className="text-[10px] text-white/50">{t('pending')}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{completedCount}</div>
            <div className="text-[10px] text-white/50">{t('done')}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-bold text-purple-300">
              {tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%
            </div>
            <div className="text-[10px] text-white/50">{t('progress')}</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setSelectedTask(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

          {/* Modal Content */}
          <div
            className="relative w-full max-w-lg mx-4 mb-0 sm:mb-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-b from-slate-800/98 to-slate-900/98 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Handle bar (mobile) */}
              <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-3 sm:hidden" />

              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${platformConfig[selectedTask.platform].color} px-5 py-4 mt-2 sm:mt-0`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platformConfig[selectedTask.platform].icon}</span>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {platformConfig[selectedTask.platform].name}
                      </h2>
                      <p className="text-white/60 text-sm">{selectedTask.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Caption Box */}
                <div>
                  <label className="text-purple-300 text-sm font-medium mb-2 block">
                    {t('hashtagsLabel')}
                  </label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-40 overflow-y-auto">
                    <p className="text-white whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedTask.hashtags || t('noHashtags')}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(selectedTask)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${copied
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                    }`}
                >
                  {copied ? t('copied') : t('copyText')}
                </button>

                {/* Go to Post Button */}
                <button
                  onClick={() => handleGoToPost(selectedTask)}
                  className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${platformConfig[selectedTask.platform].color} ${platformConfig[selectedTask.platform].hoverColor} transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]`}
                >
                  {t('goPost')}
                </button>

                {/* Mark Complete Button */}
                {!completed[selectedTask.id] && (
                  <button
                    onClick={() => handleMarkComplete(selectedTask.id)}
                    className="w-full py-3 rounded-xl font-semibold bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 transition-all duration-300"
                  >
                    {t('markDone')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
