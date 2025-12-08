import React, { useEffect } from 'react';

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

const SnowFallen: React.FC = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = canvas.style as CSSStyleDeclaration;
    s.position = 'fixed';
    s.left = '0';
    s.top = '0';
    s.width = '100%';
    s.height = '100%';
    s.pointerEvents = 'none';
    s.zIndex = '0';
    document.body.appendChild(canvas);

    let flakes: Flake[] = [];
    let running = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetDensity = 0.08; // flakes per 10,000 px
      const maxFlakes = 240;
      const desired = Math.min(maxFlakes, Math.floor(w * h * targetDensity / 10000));
      if (desired > flakes.length) {
        const add = desired - flakes.length;
        for (let i = 0; i < add; i++) flakes.push(makeFlake(w, h));
      } else if (desired < flakes.length) {
        flakes.length = desired;
      }
      for (let j = 0; j < flakes.length; j++) {
        // ensure flakes remain within bounds after resize
        flakes[j].x = Math.max(0, Math.min(w, flakes[j].x));
        flakes[j].y = Math.max(0, Math.min(h, flakes[j].y));
      }
    };

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const makeFlake = (w: number, h: number): Flake => {
      const r = rand(1.2, 3.2);
      const vx = rand(-0.4, 0.4);
      const vy = rand(0.6, 1.6);
      return { x: rand(0, w), y: rand(-h * 0.2, 0), vx, vy, r, alpha: rand(0.6, 0.95) };
    };

    const update = (w: number, h: number, dt: number) => {
      const swayT = performance.now() * 0.0016;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        const sway = Math.sin(swayT + i * 0.35) * 0.4;
        f.vx += (sway - f.vx) * 0.02 * dt;
        f.x += (f.vx) * dt;
        f.y += f.vy * dt;
        if (f.x < -f.r * 2) f.x = w + f.r * 2;
        if (f.x > w + f.r * 2) f.x = -f.r * 2;
        if (f.y > h + f.r * 2) {
          flakes[i] = makeFlake(w, h);
        }
      }
    };

    const draw = () => {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    resize();
    let last = performance.now();
    const loop = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const dt = (t - last) / 16.6667;
      last = t;
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      update(w, h, dt);
      draw();
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, []);

  return null;
};

export default SnowFallen;
