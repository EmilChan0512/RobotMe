import React, { useEffect } from 'react';
import '../../index.scss';
import './sakura.js';

const SakuraFallen: React.FC = () => {
  useEffect(() => {
    const Sakura = (window as any).Sakura;
    if (!Sakura) return;
    const svgPetal = "data:image/svg+xml;utf8,\n      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>\n        <path fill='%23f6a7c1' d='M50 6c13 1 23 9 28 19 6 13 2 24-9 35-9 9-19 16-19 16s-10-7-19-16C20 49 16 38 22 25c5-10 15-18 28-19z'/>\n        <path fill='rgba(255,255,255,0.25)' d='M52 18c6 1 10 5 12 10 2 6 0 11-5 16-5 5-10 9-10 9s-5-4-10-9c-5-5-7-10-5-16 2-5 6-9 12-10z'/>\n      </svg>";
    const svgPaperLarge = "data:image/svg+xml;utf8,\n      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>\n        <path fill='%23f2d9d9' d='M12 25c18-10 48-12 70 2 10 6 12 22-1 34-17 15-47 20-70 2-10-8-9-20 1-38z'/>\n        <path fill='rgba(255,255,255,0.18)' d='M22 32c16-8 40-10 56 2 8 5 10 18-1 28-15 12-39 16-56 2-8-6-7-16 1-32z'/>\n      </svg>";
    const bg = Sakura.createSakuraBackground({
      zIndex: 0,
      density: 0.1,
      maxPetals: 220,
      minSize: 4,
      maxSize: 10,
      rotationSpeed: 0.7,
      drifterRatio: 0.45,
      drifterLargeRatio: 0.15,
      noSpinDrifter: 0.6,
      noSpinDrifterLarge: 0.85,
      verticalDrag: 0.05,
      largeVerticalDrag: 0.09,
      largeSizeMultiplier: 1.9,
      largeSwayMultiplier: 2.4,
      imageSrc: svgPetal,
      imageSrcLarge: svgPaperLarge,
    });
    bg.start();
    return () => {
      bg.destroy();
    };
  }, []);

  return null;
};

export default SakuraFallen;

