import React from 'react';
import { useEvent } from '../../events/EventManager.tsx';
import './DevControls.scss';

export const DevControls: React.FC = () => {
  const { triggerEvent, activeEvent } = useEvent();

  // Only show in dev mode or if explicitly enabled
  // For this demo, we'll always show it, or check import.meta.env.DEV
  const isDev = import.meta.env.DEV;

  if (!isDev) return null;

  return (
    <div className="dev-controls">
      <button 
        onClick={() => triggerEvent('BIRD_FLYBY')}
        disabled={activeEvent !== 'NONE'}
        className={`btn ${
          activeEvent !== 'NONE' 
            ? 'btn-disabled' 
            : 'btn-enabled'
        }`}
      >
        Dev: Fly Bird 🐦
      </button>
      <button 
        onClick={() => triggerEvent('SPEECH_BUBBLE')}
        disabled={activeEvent !== 'NONE'}
        className={`btn ${
          activeEvent !== 'NONE' 
            ? 'btn-disabled' 
            : 'btn-enabled'
        }`}
      >
        Dev: Speech Bubble 💬
      </button>
      <button 
        onClick={() => triggerEvent('THOUGHT_BUBBLE')}
        disabled={activeEvent !== 'NONE'}
        className={`btn ${
          activeEvent !== 'NONE' 
            ? 'btn-disabled' 
            : 'btn-enabled'
        }`}
      >
        Dev: Thought Bubble 🫧
      </button>
    </div>
  );
};
