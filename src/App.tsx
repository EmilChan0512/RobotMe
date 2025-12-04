import React, { useMemo, useRef, useState } from 'react';
import { EventProvider, useEvent } from './events/EventManager';
import { Robot } from './components/Robot/Robot';
import { Bird } from './components/Bird/Bird';
import { SpeechBubble } from './components/SpeechBubble/SpeechBubble';
import { ThoughtBubble } from './components/ThoughtBubble/ThoughtBubble';
import { DevControls } from './components/DevControls/DevControls';
import PaperExplosion from './components/PaperExplosion/PaperExplosion';
import SakuraFallen from './components/FALLEN/SakuraFallen';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
          className="btn btn-enabled"
          style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}
        >
          进入下一页
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
            navigate('/next');
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

  return (
    <EventProvider>
      <Routes>
        <Route path="/" element={<Scene />} />
        <Route path="/next" element={<NextPage />} />
      </Routes>
    </EventProvider>
  );
}

export default App;
