import { useState, useMemo, useCallback } from 'react';

// Types
interface Task {
  id: string;
  platform: 'x' | 'instagram' | 'facebook' | 'tiktok';
  url: string;
  caption: string;
  hashtags: string;
  note: string;
}

interface CompletedState {
  [taskId: string]: { completedAt: string };
}

// Platform configs
const platformConfig = {
  x: {
    name: 'X',
    icon: '𝕏',
    gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
  },
  instagram: {
    name: 'IG',
    icon: '📸',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
  },
  facebook: {
    name: 'FB',
    icon: '👤',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
  tiktok: {
    name: 'TT',
    icon: '🎵',
    gradient: 'linear-gradient(135deg, #18181b 0%, #db2777 100%)',
  },
};

// Generate mock data - 150 items
const generateMockData = (): Task[] => {
  const platforms: Task['platform'][] = ['x', 'instagram', 'facebook', 'tiktok'];
  const notes = [
    'โพสต์ใหม่ล่าสุด 🔥', 'รูปคู่น่ารัก', 'คลิปเบื้องหลัง', 'Live สด', 'Story update',
    'Repost จากแฟน', 'ประกาศสำคัญ', 'Behind the scene', 'Interview clip', 'Teaser EP ใหม่',
    'ฉากหวาน', 'Photoshoot', 'Fan meeting', 'Concert update', 'Countdown post',
  ];
  const captions = [
    'น้ำตาลฟิล์มน่ารักมากเลยค่ะ 💕', 'หล่อสวยทั้งคู่ ฟินมาก ✨', 'ดูแล้วยิ้มตลอดเลย 🥰',
    'Chemistry ดีมากกก', 'รอติดตามตอนต่อไปค่ะ', 'สุดปังเลยวันนี้',
    'รักพี่ทั้งสองคนมากๆ', 'ขอให้มีผลงานอีกเยอะๆนะคะ',
  ];

  return Array.from({ length: 150 }, (_, i) => ({
    id: String(150 - i),
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    url: `https://example.com/post/${150 - i}`,
    caption: captions[Math.floor(Math.random() * captions.length)],
    hashtags: '#น้ำตาลฟิล์ม #NamtarnFilm',
    note: `${notes[Math.floor(Math.random() * notes.length)]} #${150 - i}`,
  }));
};

// Background image URL - เปลี่ยนตรงนี้ได้เลย
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80';

export default function App() {
  const [tasks] = useState<Task[]>(generateMockData);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState<CompletedState>({});
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterPlatform) result = result.filter(t => t.platform === filterPlatform);
    const pending = result.filter(t => !completed[t.id]);
    const done = result.filter(t => completed[t.id]);
    return showCompleted ? [...pending, ...done] : pending;
  }, [tasks, completed, filterPlatform, showCompleted]);

  const visibleTasks = useMemo(() => filteredTasks.slice(0, visibleCount), [filteredTasks, visibleCount]);
  const pendingCount = tasks.filter(t => !completed[t.id]).length;
  const completedCount = tasks.filter(t => completed[t.id]).length;

  const platformCounts = useMemo(() => {
    const counts: Record<string, { pending: number; done: number }> = {};
    tasks.forEach(t => {
      if (!counts[t.platform]) counts[t.platform] = { pending: 0, done: 0 };
      completed[t.id] ? counts[t.platform].done++ : counts[t.platform].pending++;
    });
    return counts;
  }, [tasks, completed]);

  const getFullText = (task: Task) => task.caption + '\n\n' + task.hashtags;

  const handleCopy = async (task: Task) => {
    try {
      await navigator.clipboard.writeText(getFullText(task));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleMarkComplete = (taskId: string) => {
    setCompleted(prev => ({ ...prev, [taskId]: { completedAt: new Date().toISOString() } }));
    setSelectedTask(null);
  };

  const handleUnmark = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(prev => { const s = { ...prev }; delete s[taskId]; return s; });
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setVisibleCount(prev => Math.min(prev + 20, filteredTasks.length));
    }
  }, [filteredTasks.length]);

  const handleQuickComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkComplete(task.id);
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      fontFamily: "'Noto Sans Thai', system-ui, sans-serif",
    }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0,
      }} />

      {/* Dark Overlay - ทำให้ภาพไม่ชัด */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(15, 10, 30, 0.92) 0%, rgba(20, 10, 40, 0.88) 50%, rgba(10, 5, 25, 0.95) 100%)',
        backdropFilter: 'blur(2px)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(20px)',
          background: 'rgba(15, 10, 30, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h1 style={{
                fontSize: 18,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #c4b5fd, #f9a8d4, #fcd34d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                ✨ Engagement Tracker
              </h1>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <span style={{ color: '#fcd34d', fontSize: 13, fontWeight: 600 }}>{pendingCount}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>/</span>
                <span style={{ color: '#86efac', fontSize: 13 }}>{completedCount}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 3,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              marginBottom: 12,
            }}>
              <div style={{
                height: '100%',
                width: `${(completedCount / tasks.length) * 100}%`,
                background: 'linear-gradient(90deg, #86efac, #67e8f9, #c4b5fd)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterPlatform(null)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: !filterPlatform ? 'linear-gradient(135deg, rgba(196, 181, 253, 0.3), rgba(249, 168, 212, 0.3))' : 'rgba(255,255,255,0.05)',
                  color: !filterPlatform ? 'white' : 'rgba(255,255,255,0.6)',
                  transition: 'all 0.2s ease',
                }}
              >
                ทั้งหมด ({pendingCount})
              </button>

              {(['x', 'instagram', 'facebook', 'tiktok'] as const).map(p => {
                const count = platformCounts[p]?.pending || 0;
                const isActive = filterPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(isActive ? null : p)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 20,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: isActive ? platformConfig[p].gradient : 'rgba(255,255,255,0.05)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{platformConfig[p].icon}</span>
                    <span>{count}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowCompleted(!showCompleted)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 12,
                  cursor: 'pointer',
                  background: showCompleted ? 'rgba(134, 239, 172, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: showCompleted ? '#86efac' : 'rgba(255,255,255,0.4)',
                  marginLeft: 'auto',
                }}
              >
                {showCompleted ? '✓ ซ่อน' : '○ แสดง'}
              </button>
            </div>
          </div>
        </header>

        {/* Task List */}
        <main 
          onScroll={handleScroll}
          style={{ 
            maxWidth: 480, 
            margin: '0 auto', 
            padding: '12px 12px 100px',
            height: 'calc(100vh - 130px)',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleTasks.map((task, index) => {
              const config = platformConfig[task.platform];
              const isCompleted = !!completed[task.id];
              const isFirstCompleted = isCompleted && (index === 0 || !completed[visibleTasks[index - 1]?.id]);

              return (
                <div key={task.id}>
                  {isFirstCompleted && showCompleted && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 0',
                    }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(134, 239, 172, 0.3)' }} />
                      <span style={{ color: 'rgba(134, 239, 172, 0.6)', fontSize: 11 }}>เสร็จแล้ว {completedCount}</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(134, 239, 172, 0.3)' }} />
                    </div>
                  )}

                  {/* Glass Card */}
                  <div
                    onClick={() => setSelectedTask(task)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: isCompleted 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isCompleted ? 'rgba(134, 239, 172, 0.15)' : 'rgba(255, 255, 255, 0.1)'}`,
                      opacity: isCompleted ? 0.5 : 1,
                      transition: 'all 0.15s ease',
                      boxShadow: isCompleted ? 'none' : '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: config.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}>
                      {isCompleted ? '✓' : config.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.95)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {task.note}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {task.caption}
                      </div>
                    </div>

                    {isCompleted ? (
                      <button
                        onClick={(e) => handleUnmark(task.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 11,
                          cursor: 'pointer',
                          padding: '4px 8px',
                        }}
                      >
                        ↩
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleQuickComplete(task, e)}
                        style={{
                          background: 'rgba(134, 239, 172, 0.15)',
                          border: '1px solid rgba(134, 239, 172, 0.3)',
                          color: '#86efac',
                          fontSize: 14,
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontWeight: 600,
                        }}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {visibleCount < filteredTasks.length && (
              <div style={{
                textAlign: 'center',
                padding: 16,
                color: 'rgba(255,255,255,0.4)',
                fontSize: 12,
              }}>
                เลื่อนเพื่อโหลดเพิ่ม... ({visibleCount}/{filteredTasks.length})
              </div>
            )}
          </div>

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎉</p>
              <p>ทำครบหมดแล้ว!</p>
            </div>
          )}
        </main>

        {/* Floating stats - Glass */}
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 10, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 30,
          padding: '10px 20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fcd34d' }}>{pendingCount}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>รอทำ</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#86efac' }}>{completedCount}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>เสร็จ</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#c4b5fd' }}>
              {Math.round((completedCount / tasks.length) * 100)}%
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>progress</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTask && (
        <div
          onClick={() => setSelectedTask(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
          }} />

          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{
              background: 'linear-gradient(180deg, rgba(30, 20, 50, 0.98) 0%, rgba(15, 10, 30, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
            }}>
              <div style={{
                width: 40,
                height: 4,
                background: 'rgba(255,255,255,0.3)',
                borderRadius: 2,
                margin: '12px auto',
              }} />

              <div style={{
                padding: '0 20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: platformConfig[selectedTask.platform].gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}>
                  {platformConfig[selectedTask.platform].icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                    {platformConfig[selectedTask.platform].name} - {selectedTask.note}
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                    Task #{selectedTask.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '0 20px 24px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <p style={{ color: 'white', fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {getFullText(selectedTask)}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => handleCopy(selectedTask)}
                    style={{
                      padding: '14px',
                      borderRadius: 12,
                      border: '1px solid rgba(196, 181, 253, 0.3)',
                      background: copied ? '#22c55e' : 'rgba(196, 181, 253, 0.15)',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ คัดลอกแล้ว!' : '📋 คัดลอกข้อความ'}
                  </button>

                  <button
                    onClick={() => window.open(selectedTask.url, '_blank')}
                    style={{
                      padding: '14px',
                      borderRadius: 12,
                      border: 'none',
                      background: platformConfig[selectedTask.platform].gradient,
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    }}
                  >
                    🚀 ไปโพสต์เลย!
                  </button>

                  {!completed[selectedTask.id] && (
                    <button
                      onClick={() => handleMarkComplete(selectedTask.id)}
                      style={{
                        padding: '14px',
                        borderRadius: 12,
                        border: '1px solid rgba(134, 239, 172, 0.3)',
                        background: 'rgba(134, 239, 172, 0.15)',
                        color: '#86efac',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ ทำเสร็จแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
