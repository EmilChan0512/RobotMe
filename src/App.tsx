import React, { useMemo, useRef, useState, useEffect } from 'react';
import { EventProvider, useEvent } from './events/EventManager';
import { Robot } from './components/Robot/Robot';
import { Bird } from './components/Bird/Bird';
import { SpeechBubble } from './components/SpeechBubble/SpeechBubble';
import { ThoughtBubble } from './components/ThoughtBubble/ThoughtBubble';
import { DevControls } from './components/DevControls/DevControls';
import PaperExplosion from './components/PaperExplosion/PaperExplosion';
import SakuraFallen from './components/FALLEN/SakuraFallen';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './App.scss';

const Scene = () => {
  const { activeEvent, eventProgress } = useEvent();
  const navigate = useNavigate();
  const [explode, setExplode] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="scene safe-area">
      {activeEvent === 'SAKURA_FALLEN' && <SakuraFallen />}
      {activeEvent === 'BIRD_FLYBY' && (
        <Bird style={{ left: `${birdX}px`, top: `${birdY}px`, transform: `rotate(${birdTilt}deg)`, transformOrigin: 'center' }} />
      )}

      <div className="scene-robot">
        <Robot
          isTrackingCursor={activeEvent === 'NONE'}
          targetPoint={activeEvent === 'BIRD_FLYBY' ? { x: birdX, y: birdY } : undefined}
        />
        {activeEvent === 'SPEECH_BUBBLE' && (
          <SpeechBubble text="你好！" style={{ opacity: bubbleOpacity, transform: `translateY(${bubbleDy}px)` }} />
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
      <div className="scene safe-area" style={{ display: 'grid', placeItems: 'center' }}>
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

      return (
        <div className="scene safe-area" style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>我的日记：{title}</h1>
          {loading && <div>加载中…</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <article style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content}</article>
          )}
        </div>
      );
    };
  }, []);

  return (
    <EventProvider>
      <Routes>
        <Route path="/" element={<Scene />} />
        <Route path="/next" element={<NextPage />} />
        <Route path="/myheart/:title" element={<MyHeartPage />} />
      </Routes>
    </EventProvider>
  );
}

export default App;
