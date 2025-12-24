import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Card3D.scss';

export interface Card3DProps {
  title: string;
  description: string;
  theme: 'dark' | 'light' | 'christmas' | 'christmas_white';
  intensity?: number;
  interactive?: boolean;
  footer?: string;
  variant?: 'default' | 'scratch';
  hint?: string;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const Card3D: React.FC<Card3DProps> = ({
  title,
  description,
  theme,
  intensity = 1,
  interactive = true,
  footer,
  variant = 'default',
  hint,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entered, setEntered] = useState(false);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [scale, setScale] = useState(0.96);
  const [opacity, setOpacity] = useState(0);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [lowPerf, setLowPerf] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const gridRef = useRef<{ w: number; h: number; cells: Uint8Array } | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    setCoarsePointer(isCoarse);
    const low = (navigator.hardwareConcurrency ?? 4) <= 2 || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setLowPerf(low);
  }, []);

  useEffect(() => {
    setEntered(false);
    setScale(0.96);
    setOpacity(0);
    setRx(6);
    setRy(0);
    const raf = requestAnimationFrame(() => {
      setEntered(true);
      setScale(1);
      setOpacity(1);
      setRx(0);
      setRy(0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!interactive || coarsePointer) return;
    const el = rootRef.current;
    if (!el) return;
    let rect: DOMRect | null = null;
    let rafId = 0;
    let nextEvt: PointerEvent | null = null;

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };
    const onLeave = () => {
      nextEvt = null;
      setRx(0);
      setRy(0);
    };
    const onMove = (e: PointerEvent) => {
      nextEvt = e;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const tick = () => {
      rafId = 0;
      if (!rect || !nextEvt) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = nextEvt.clientX - cx;
      const dy = nextEvt.clientY - cy;
      const nx = clamp(dx / (rect.width / 2), -1, 1);
      const ny = clamp(dy / (rect.height / 2), -1, 1);
      const maxDeg = 8 * clamp(intensity, 0, 1);
      const nextRy = -nx * maxDeg;
      const nextRx = ny * maxDeg;
      setRy(nextRy);
      setRx(nextRx);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [interactive, intensity, coarsePointer]);

  useEffect(() => {
    if (variant !== 'scratch') return;
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    let dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const resize = () => {
      const r = card.getBoundingClientRect();
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r2 = 2 + Math.random() * 3;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(x, y, r2, 0, Math.PI * 2);
        ctx.fill();
      }
      const gw = 64;
      const gh = 64;
      gridRef.current = { w: gw, h: gh, cells: new Uint8Array(gw * gh) };
      setRevealDone(false);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [variant]);

  useEffect(() => {
    if (variant !== 'scratch') return;
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let rafId = 0;
    let lastEvt: PointerEvent | null = null;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const eraseRadius = 24 * dpr;
    const handleDown = (e: PointerEvent) => {
      drawingRef.current = true;
      lastEvt = e;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const handleUp = () => {
      drawingRef.current = false;
      lastEvt = null;
    };
    const handleMove = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      lastEvt = e;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const tick = () => {
      rafId = 0;
      if (!lastEvt || !drawingRef.current) return;
      const rect = card.getBoundingClientRect();
      const x = (lastEvt.clientX - rect.left) * dpr;
      const y = (lastEvt.clientY - rect.top) * dpr;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, eraseRadius, 0, Math.PI * 2);
      ctx.fill();
      const grid = gridRef.current;
      if (grid && !revealDone) {
        const gx = Math.floor(((lastEvt.clientX - rect.left) / rect.width) * grid.w);
        const gy = Math.floor(((lastEvt.clientY - rect.top) / rect.height) * grid.h);
        const rCells = Math.ceil((eraseRadius / (canvas.width / grid.w)));
        let marked = 0;
        for (let iy = -rCells; iy <= rCells; iy++) {
          for (let ix = -rCells; ix <= rCells; ix++) {
            const cx = gx + ix;
            const cy = gy + iy;
            if (cx < 0 || cy < 0 || cx >= grid.w || cy >= grid.h) continue;
            const dx = ix;
            const dy = iy;
            if (dx * dx + dy * dy <= rCells * rCells) {
              const idx = cy * grid.w + cx;
              if (grid.cells[idx] === 0) {
                grid.cells[idx] = 1;
                marked++;
              }
            }
          }
        }
        if (marked > 0) {
          const filled = grid.cells.reduce((a, b) => a + (b ? 1 : 0), 0);
          const ratio = filled / (grid.w * grid.h);
          if (ratio >= 0.6) {
            setRevealDone(true);
          }
        }
      }
    };
    card.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    card.addEventListener('pointermove', handleMove);
    if (coarsePointer) {
      const onTap = () => setRevealDone(true);
      card.addEventListener('click', onTap);
      return () => {
        card.removeEventListener('pointerdown', handleDown);
        window.removeEventListener('pointerup', handleUp);
        card.removeEventListener('pointermove', handleMove);
        card.removeEventListener('click', onTap);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
    return () => {
      card.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      card.removeEventListener('pointermove', handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [variant, coarsePointer, revealDone]);

  const floating = useMemo(() => {
    if (!interactive) return false;
    return coarsePointer;
  }, [interactive, coarsePointer]);

  const maxRotate = useMemo(() => (floating ? 4 : 8) * clamp(intensity, 0, 1), [floating, intensity]);
  // Use fixed shadow opacity to prevent "darkening" effect on hover
  const shadowOpacity = 0.4;

  const themeVars = useMemo(() => {
    if (theme === 'dark') {
      return {
        '--card-bg-start': '#0f172a',
        '--card-bg-end': '#1f2937',
        '--card-text': '#e5e7eb',
        '--card-subtext': '#9ca3af',
        '--card-highlight': 'rgba(255,255,255,0.55)',
        '--card-shadow': 'rgba(0,0,0,0.65)',
        '--card-frame': 'rgba(255,255,255,0.12)',
        '--card-accent': '#22c55e',
        '--card-accent-2': '#ef4444',
        '--card-gold': '#eab308',
      } as React.CSSProperties;
    }
    if (theme === 'christmas') {
      return {
        '--card-bg-start': '#7c0a02',
        '--card-bg-end': '#3b0d0d',
        '--card-text': '#fff7ed',
        '--card-subtext': 'rgba(255,247,237,0.85)',
        '--card-highlight': 'rgba(255,244,199,0.55)',
        '--card-shadow': 'rgba(0,0,0,0.5)',
        '--card-frame': 'rgba(234,179,8,0.55)',
        '--card-accent': '#0f5132',
        '--card-accent-2': '#b91c1c',
        '--card-gold': '#f6c453',
      } as React.CSSProperties;
    }
    if (theme === 'christmas_white') {
      return {
        '--card-bg-start': '#ffffff',
        '--card-bg-end': '#f7fafc',
        '--card-text': '#0f172a',
        '--card-subtext': '#334155',
        '--card-highlight': 'rgba(255,255,255,0.9)',
        '--card-shadow': 'rgba(0,0,0,0.22)',
        '--card-frame': 'rgba(234,179,8,0.35)',
        '--card-accent': '#0f5132',
        '--card-accent-2': '#b91c1c',
        '--card-gold': '#f59e0b',
      } as React.CSSProperties;
    }
    return {
      '--card-bg-start': '#ffffff',
      '--card-bg-end': '#f3f4f6',
      '--card-text': '#111827',
      '--card-subtext': '#6b7280',
      '--card-highlight': 'rgba(255,255,255,0.8)',
      '--card-shadow': 'rgba(0,0,0,0.18)',
      '--card-frame': 'rgba(17,24,39,0.12)',
      '--card-accent': '#22c55e',
      '--card-accent-2': '#ef4444',
      '--card-gold': '#eab308',
    } as React.CSSProperties;
  }, [theme]);

  const cardStyle = useMemo(() => {
    const rxf = clamp(rx, -maxRotate, maxRotate);
    const ryf = clamp(ry, -maxRotate, maxRotate);
    return {
      transform: `translateZ(0) rotateX(${rxf}deg) rotateY(${ryf}deg) scale(${scale})`,
      opacity,
    } as React.CSSProperties;
  }, [rx, ry, scale, opacity, maxRotate]);

  return (
    <div
      className="card3d-root"
      ref={rootRef}
      data-floating={floating ? 'true' : 'false'}
      style={themeVars}
    >
      <div
        className={`card3d${entered ? ' entered' : ''}`}
        ref={cardRef}
        style={cardStyle}
      >
        <div className="card3d-layer card3d-bg" />
        <div className="card3d-layer card3d-content">
          <div className="card3d-header">
            <div className="card3d-holly" aria-hidden="true">
              <svg viewBox="0 0 120 40">
                <circle cx="20" cy="20" r="6" fill="var(--card-accent-2)" />
                <circle cx="30" cy="16" r="6" fill="var(--card-accent-2)" />
                <circle cx="26" cy="26" r="6" fill="var(--card-accent-2)" />
                <path d="M60 20 C 48 10, 40 12, 28 18 C 40 26, 48 30, 60 20 Z" fill="var(--card-accent)" />
                <path d="M86 20 C 98 10, 106 12, 118 18 C 106 26, 98 30, 86 20 Z" fill="var(--card-accent)" />
              </svg>
            </div>
            <h3 className="card3d-title">{title}</h3>
          </div>
          <div className="card3d-body">
            <p className="card3d-desc">{description}</p>
          </div>
          {footer && (
            <div className="card3d-footer">
              <span className="card3d-sign">{footer}</span>
            </div>
          )}
        </div>
        {variant === 'scratch' && (
          <div className={`card3d-layer card3d-reveal${revealDone ? ' reveal-done' : ''}`}>
            {hint && <div className="card3d-reveal-hint">{hint}</div>}
            <canvas ref={canvasRef} className="card3d-reveal-canvas" />
          </div>
        )}
        {!lowPerf && <div className="card3d-layer card3d-highlight" />}
        <div className="card3d-layer card3d-shadow" style={{ opacity: shadowOpacity }} />
      </div>
    </div>
  );
};

export default Card3D;
