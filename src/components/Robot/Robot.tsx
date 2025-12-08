import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Robot.css';
import { useMousePosition } from '../../hooks/useMousePosition';

interface RobotProps {
  targetPoint?: { x: number; y: number };
  isTrackingCursor?: boolean;
}

export const Robot: React.FC<RobotProps> = ({ targetPoint, isTrackingCursor = true }) => {
  const mousePos = useMousePosition();
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [wallRepeatN, setWallRepeatN] = useState(0);
  const robotYOffset = 12.5;
  const isChristmas = useMemo(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return m === 12 && (d === 24 || d === 25);
  }, []);

  useEffect(() => {
    // Determine target coordinates
    let targetX = 0;
    let targetY = 0;

    if (isTrackingCursor) {
      targetX = mousePos.x;
      targetY = mousePos.y;
    } else if (targetPoint) {
      targetX = targetPoint.x;
      targetY = targetPoint.y;
    } else {
      // Default to center if no target
      targetX = window.innerWidth / 2;
      targetY = window.innerHeight / 2;
    }

    // Calculate offset based on target position relative to window center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    
    // Max offset in pixels for the eyes to move within the head
    const maxOffset = 6;
    
    // Calculate angle and distance
    const angle = Math.atan2(dy, dx);
    // Dampen the distance
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 15, maxOffset);
    
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    
    setEyeOffset({ x: offsetX, y: offsetY });
  }, [mousePos, targetPoint, isTrackingCursor]);

  useEffect(() => {
    const updateRepeats = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const unitToPx = Math.max(rect.width, 1) / 200;
      const totalUnitsNeeded = window.innerWidth / unitToPx;
      const n = Math.max(0, Math.ceil((totalUnitsNeeded - 300) / 200));
      setWallRepeatN(n);
    };

    updateRepeats();
    window.addEventListener('resize', updateRepeats);
    return () => window.removeEventListener('resize', updateRepeats);
  }, []);


  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 200 200" 
      className="robot-svg"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sketchy Robot"
    >
      <g id="wall" className="robot-stroke">
        {Array.from({ length: 2 * wallRepeatN + 1 }, (_, i) => i - wallRepeatN).map((k) => (
          <g key={k} transform={`translate(${k * 100}, 0)`}>
            <>
              <path d="M -50 140 C 0 138, 50 142, 100 140 C 150 138, 200 142, 250 140" />
              <path d="M -50 165 C 0 168, 60 162, 110 165 C 160 168, 220 162, 270 165" />
              {k === 0 && (
                <ellipse cx={100} cy={154.5} rx={22} ry={4} fill="#000" opacity={0.22} />
              )}
            </>
          </g>
        ))}
      </g>
      <g id="robot" transform={`translate(0, ${robotYOffset})`}>
        <g id="leg-left" className="robot-stroke">
          <path d="M 90 140 Q 80 160 82 175 Q 83 185 80 195" fill="none" />
        </g>
        <g id="leg-right" className="robot-stroke">
          <path d="M 110 140 Q 120 160 118 175 Q 117 185 120 195" fill="none" />
        </g>

        <g id="body-group">
          <line x1="100" y1="75" x2="100" y2="90" className="robot-stroke" />

          <rect x="70" y="90" width="60" height="50" className="robot-stroke robot-fill-white" />

          <g id="arm-left" className="robot-stroke">
            <path d="M 70 90 Q 40 110 45 135" fill="none" />
            <circle cx="45" cy="138" r="3" />
          </g>
          <g id="arm-right" className="robot-stroke">
            <path d="M 130 90 Q 160 110 155 135" fill="none" />
            <circle cx="155" cy="138" r="3" />
          </g>

          <g id="head">
            <rect x="80" y="50" width="40" height="25" className="robot-stroke robot-fill-white" />
            <g id="eyes" transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="90" cy="62" r="2" className="robot-eye" />
              <circle cx="110" cy="62" r="2" className="robot-eye" />
            </g>
            {isChristmas && (
              <g id="santa-hat">
                <rect x="78" y="48" width="44" height="6" fill="#ffffff" className="robot-stroke" />
                <path d="M 84 48 L 102 22 L 120 48 Z" fill="#d90429" className="robot-stroke" />
                <circle cx="102" cy="22" r="4" fill="#ffffff" className="robot-stroke" />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
};
