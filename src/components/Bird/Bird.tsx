import React from 'react';
import './Bird.css';

interface BirdProps {
  style?: React.CSSProperties;
}

export const Bird: React.FC<BirdProps> = ({ style }) => {
  return (
    <div className="bird" style={style}>
      <svg className="bird-svg" viewBox="0 0 60 40">
        <g className="bird-stroke">
          <path className="bird-body" d="M 8 22 C 18 16, 32 16, 44 22" />
          <circle className="bird-head" cx="48" cy="22" r="1.5" />
          <path className="bird-beak" d="M 50 22 L 54 21" />
          <path className="bird-tail" d="M 8 22 L 4 18" />
          <path className="bird-tail" d="M 8 22 L 4 26" />
        </g>
        <g className="bird-stroke wing-back" transform="translate(0,0)">
          <path d="M 20 22 C 28 12, 38 12, 46 22" />
        </g>
        <g className="bird-stroke wing-front" transform="translate(0,0)">
          <path d="M 24 22 C 32 10, 42 8, 50 16" />
        </g>
      </svg>
    </div>
  );
};
