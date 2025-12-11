import React, { useMemo, useRef, useState, useEffect } from 'react';
import { EventProvider, useEvent } from './events/EventManager';
import { Robot } from './components/Robot/Robot';
import { Bird } from './components/Bird/Bird';
import { SpeechBubble } from './components/SpeechBubble/SpeechBubble';
import { ThoughtBubble } from './components/ThoughtBubble/ThoughtBubble';
import { DevControls } from './components/DevControls/DevControls';
import PaperExplosion from './components/PaperExplosion/PaperExplosion';
import SakuraFallen from './components/FALLEN/SakuraFallen';
import SnowFallen from './components/FALLEN/SnowFallen';
import { Routes, Route, useNavigate, useParams, useLocation, useOutlet } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';
import gsap from 'gsap';
import './App.scss';
 

const Scene = () => {
  const { activeEvent, eventProgress, bubbleText } = useEvent();
  const navigate = useNavigate();
  const [explode, setExplode] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const envRef = useRef<HTMLButtonElement>(null);
  const [envAnimActive, setEnvAnimActive] = useState(false);
  const [envPos, setEnvPos] = useState<{ x: number; y: number } | null>(null);
  const envActiveRef = useRef(false);

  // Calculate bird position for Robot to look at
  // Bird flies from left (-10%) to right (110%)
  // We use a fixed Y position for the bird
  const birdX = (eventProgress * 1.2 - 0.1) * window.innerWidth;
  const birdY = 100 + Math.sin(eventProgress * Math.PI * 2) * 12;
  const birdTilt = Math.sin(eventProgress * Math.PI * 2) * 6;
  const bubbleOpacity = eventProgress < 0.1 ? eventProgress / 0.1 : eventProgress > 0.9 ? 1 - (eventProgress - 0.9) / 0.1 : 1;
  const bubbleDy = Math.sin(eventProgress * Math.PI * 2) * 4;

  const onClickExplode = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setExplode(true);
  };

  const onClickEnvelope = () => {
    navigate('/letters');
  };

  useEffect(() => {
    const el = envRef.current;
    if (!el) return;
    setEnvAnimActive(true);
    envActiveRef.current = true;
    const tl = gsap.timeline({ onComplete: () => { envActiveRef.current = false; setEnvAnimActive(false); } });
    tl.fromTo(
      el,
      { left: '-8%', top: '-10%', opacity: 0, rotate: -20 },
      { left: '14%', top: '52%', opacity: 1, rotate: 0, duration: 2.2, ease: 'power2.out' }
    );
    const wobble = gsap.to(el, {
      x: 10,
      rotate: 6,
      duration: 0.8,
      yoyo: true,
      repeat: Math.ceil(2.2 / 0.8),
      ease: 'sine.inOut'
    });
    let rafId = 0;
    const updatePos = () => {
      const r = el.getBoundingClientRect();
      setEnvPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      if (envActiveRef.current) rafId = requestAnimationFrame(updatePos);
    };
    rafId = requestAnimationFrame(updatePos);
    return () => {
      envActiveRef.current = false;
      if (rafId) cancelAnimationFrame(rafId);
      tl.kill();
      wobble.kill();
    };
  }, []);

  return (
    <div className="scene safe-area">
      {activeEvent === 'SAKURA_FALLEN' && <SakuraFallen />}
      {activeEvent === 'CHRISTMAS_SNOW' && <SnowFallen />}
      {activeEvent === 'BIRD_FLYBY' && (
        <Bird style={{ left: `${birdX}px`, top: `${birdY}px`, transform: `rotate(${birdTilt}deg)`, transformOrigin: 'center' }} />
      )}

      <div className="scene-robot">
        <Robot
          isTrackingCursor={activeEvent === 'NONE' && !envAnimActive}
          targetPoint={
            envAnimActive && envPos ? envPos : (activeEvent === 'BIRD_FLYBY' ? { x: birdX, y: birdY } : undefined)
          }
        />
        {activeEvent === 'SPEECH_BUBBLE' && (
          <SpeechBubble text={bubbleText ?? '你好！'} style={{ opacity: bubbleOpacity, transform: `translateY(${bubbleDy}px)` }} />
        )}
        {activeEvent === 'THOUGHT_BUBBLE' && (
          <ThoughtBubble text="在想…" style={{ opacity: bubbleOpacity, transform: `translateY(${bubbleDy}px)` }} />
        )}
        <button
          ref={btnRef}
          onClick={onClickExplode}
          className="heart-button"
          style={{ left: '58%', top: '58%' }}
          aria-label="进入下一页"
        >
          <Heart size={28} />
        </button>
        <button
          onClick={onClickEnvelope}
          className="envelope-button"
          style={{ left: '14%', top: '52%' }}
          aria-label="进入信件列表"
          ref={envRef}
        >
          <Mail size={26} />
        </button>
      </div>

      <DevControls />

      {/* Debug Info (Optional) */}
      <div className="scene-debug">
        Event: {activeEvent}
      </div>

      {explode && (
        <PaperExplosion
          trigger={explode}
          origin={origin}
          onComplete={() => {
            const todayTitle = new Date().toISOString().slice(0, 10);
            navigate(`/myheart/${todayTitle}`);
            requestAnimationFrame(() => {
              const el = document.getElementById('root');
              if (el) el.style.visibility = '';
            });
          }}
        />
      )}
    </div>
  );
};

function App() {
  const NextPage = useMemo(() => {
    return () => (
      <div
        className="scene safe-area"
        style={{ display: 'grid', placeItems: 'center' }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1>下一页</h1>
        </div>
      </div>
    );
  }, []);

  const MyHeartPage = useMemo(() => {
    return () => {
      const { title } = useParams();
      const [content, setContent] = useState<string>('');
      const [loading, setLoading] = useState(true);
      const [showLoader, setShowLoader] = useState(false);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        if (!title) {
          setError('未指定日记标题');
          setLoading(false);
          return;
        }
        fetch(`/myheart/${title}.md`)
          .then(async (res) => {
            if (!res.ok) throw new Error('未找到对应的日记');
            const text = await res.text();
            setContent(text);
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      }, [title]);
      
      useEffect(() => {
        let t: number | undefined;
        if (loading) {
          t = window.setTimeout(() => setShowLoader(true), 250);
        } else {
          setShowLoader(false);
        }
        return () => {
          if (t) clearTimeout(t);
        };
      }, [loading]);

      return (
        <div className="scene safe-area" style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          {loading && showLoader && <div>加载中…</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <article style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content}</article>
          )}
        </div>
      );
    };
  }, []);

  const LettersPage = useMemo(() => {
    return () => {
      const [entries, setEntries] = useState<Array<{ date: string; title: string; file: string }>>([]);
      const [loading, setLoading] = useState(true);
      const [showLoader, setShowLoader] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const navigate = useNavigate();

      useEffect(() => {
        fetch('/myheart/index.json')
          .then(async (res) => {
            if (!res.ok) throw new Error('未找到信件索引');
            const data = await res.json();
            setEntries(data.entries ?? []);
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      }, []);
      
      useEffect(() => {
        let t: number | undefined;
        if (loading) {
          t = window.setTimeout(() => setShowLoader(true), 250);
        } else {
          setShowLoader(false);
        }
        return () => {
          if (t) clearTimeout(t);
        };
      }, [loading]);

      return (
        <div className="scene safe-area" style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>我的信件</h2>
          {loading && showLoader && <div>加载中…</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {entries.map((e) => (
                <li key={e.file} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{e.title}</span>
                  <button className="btn btn-enabled" onClick={() => navigate(`/myheart/${e.title}`)}>打开</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    };
  }, []);

  const TransitionRouter: React.FC = () => {
    const location = useLocation();
    const outlet = useOutlet();
    const [pages, setPages] = useState<Array<{ id: string; element: React.ReactNode; state: 'enter' | 'exit' }>>([]);
    const lastIdRef = useRef<string | null>(null);
    const isLetters = location.pathname === '/letters';

    useEffect(() => {
      if (!outlet) return;
      const id = String(location.key ?? location.pathname);
      if (lastIdRef.current === id) return;
      lastIdRef.current = id;
      if (isLetters) {
        setPages((prev) => {
          const next = [...prev.filter((p) => p.id !== id)];
          next.push({ id, element: outlet, state: 'enter' });
          if (next.length >= 2) {
            next[next.length - 2] = { ...next[next.length - 2], state: 'exit' };
          }
          return next;
        });
        const timer = setTimeout(() => {
          setPages((prev) => prev.filter((p) => p.state !== 'exit'));
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setPages([{ id, element: outlet, state: 'enter' }]);
        return;
      }
    }, [location, outlet]);

    if (!isLetters) {
      return <>{outlet}</>;
    }

    return (
      <div className="page-container">
        {pages.map((p) => (
          <div key={p.id} className={`page ${p.state}`}>{p.element}</div>
        ))}
      </div>
    );
  };

  return (
    <EventProvider>
      <Routes>
        <Route element={<TransitionRouter />}> 
          <Route path="/" element={<Scene />} />
          <Route path="/next" element={<NextPage />} />
          <Route path="/letters" element={<LettersPage />} />
          <Route path="/myheart/:title" element={<MyHeartPage />} />
        </Route>
      </Routes>
    </EventProvider>
  );
}

export default App;
