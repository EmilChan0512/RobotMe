import React from 'react';
import './SpeechBubble.css';

interface SpeechBubbleProps {
  text: string;
  style?: React.CSSProperties;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, style }) => {
  return (
    <div className="speech-bubble" style={style}>
      <div className="speech-bubble-inner">{text}</div>
      <svg className="speech-bubble-tail" viewBox="0 0 20 14">
        <path className="speech-bubble-tail-path" d="M 20 6 C 14 5 10 6 6 8 L 0 9 L 6 10 C 10 12 14 12 20 11 Z" />
      </svg>
    </div>
  );
};
