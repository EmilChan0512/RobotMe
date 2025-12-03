import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";

interface PaperExplosionProps {
  trigger: boolean;
  origin: { x: number; y: number };
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotVx: number;
  rotVy: number;
  alpha: number;
}

export default function PaperExplosion({ trigger, origin, onComplete }: PaperExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const body = document.body;
    const width = (canvas.width = body.clientWidth);
    const height = (canvas.height = body.clientHeight);

    let particles: Particle[] = [];
    let animationFrame = 0;

    if (canvasRef.current) canvasRef.current.style.visibility = "hidden";
    html2canvas(document.documentElement, {
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      useCORS: true,
      foreignObjectRendering: true,
    }).then((screenshotCanvas) => {
      const screenshot = screenshotCanvas;
      if (canvasRef.current) canvasRef.current.style.visibility = "visible";
      const rootEl = document.getElementById("root");
      if (rootEl) rootEl.style.visibility = "hidden";

      const baseTile = 24;
      const cols = Math.ceil(width / baseTile);
      const rows = Math.ceil(height / baseTile);
      const baseCount = cols * rows;
      const maxParticles = 5000;
      const strideFactor = Math.max(1, Math.ceil(Math.sqrt(baseCount / maxParticles)));
      const tileSize = baseTile * strideFactor;

      const scaleX = screenshot.width / width;
      const scaleY = screenshot.height / height;

      for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
          const dx = x - origin.x;
          const dy = y - origin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = 2 + dist * 0.02;

          particles.push({
            x,
            y,
            size: tileSize,
            sx: x,
            sy: y,
            vx: dx / force + Math.random() * 2 - 1,
            vy: dy / force + Math.random() * 2 - 1,
            rotX: 0,
            rotY: 0,
            rotVx: Math.random() * 0.3 - 0.15,
            rotVy: Math.random() * 0.3 - 0.15,
            alpha: 1,
          });
        }
      }

      const gravity = 0.06;
      const friction = 0.99;
      const fadeSpeed = 0.008;
      const startTime = performance.now();
      const rampDuration = 800;

      function animate() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / rampDuration, 1);
        const speed = t * t;
        ctx.clearRect(0, 0, width, height);

        let aliveCount = 0;

        for (const p of particles) {
          p.vy += gravity * speed;
          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx * speed;
          p.y += p.vy * speed;

          p.rotX += p.rotVx * speed;
          p.rotY += p.rotVy * speed;

          p.alpha -= fadeSpeed;

          if (p.alpha > 0) {
            aliveCount++;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            ctx.rotate(p.rotX * 0.6);
            ctx.transform(1, p.rotY * 0.1, p.rotY * 0.1, 1, 0, 0);
            ctx.drawImage(
              screenshot,
              p.sx * scaleX,
              p.sy * scaleY,
              p.size * scaleX,
              p.size * scaleY,
              -p.size / 2,
              -p.size / 2,
              p.size,
              p.size
            );
            ctx.restore();
          }
        }

        if (aliveCount > 0) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      }

      animate();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [trigger, origin, onComplete]);

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        zIndex: 99999,
      }}
    />,
    document.body
  );
}
