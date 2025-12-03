import React from 'react';
import './ThoughtBubble.css';

interface ThoughtBubbleProps {
  text: string;
  style?: React.CSSProperties;
}

export const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ text, style }) => {
  return (
    <div className="thought-bubble" style={style}>
      <div className="thought-bubble-inner">{text}</div>
    </div>
  );
};

