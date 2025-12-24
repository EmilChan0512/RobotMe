import React, { useState } from "react";
import "./AnnualReportCard.css";

const AnnualReportCard: React.FC = () => {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x, y });
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setPointer({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="annual-report-card-scene">
      <div
        className="annual-report-card"
        data-active="true"
        aria-label="你的原型"
        data-hovered={isHovered}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
        style={
          {
            "--pointer-x": pointer.x,
            "--pointer-y": pointer.y,
            "--mouse-x": `${mousePos.x}px`,
            "--mouse-y": `${mousePos.y}px`,
            transform: `rotateX(${pointer.y * 15}deg) rotateY(${pointer.x * 15}deg)`,
            transition: isHovered ? "transform 0.1s" : "transform 0.5s",
          } as React.CSSProperties
        }
      >
        {/* Front */}
        <div
          className={`annual-report-card__front ${isFlipped ? "rotate-y-180" : ""
            }`}
        >
          <div className="card-spotlight" />
          <div className="card-watermark">
            <div className="card-watermark-refraction" />
          </div>
          {/* Front Content */}
          <div
            className="card-content"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80")',
            }}
          >
            <div className="card-header">
              <h3 className="card-header-text" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>圣诞快乐</h3>
              <h3 className="card-header-text" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>2025 年</h3>
            </div>
            <div className="card-image-container">
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
                <div className="card-shine" />
                {/* <img
                  alt="Christmas Tree"
                  loading="lazy"
                  className="card-image"
                  src="https://images.unsplash.com/photo-1544967082-d9d3f02b1bd0?auto=format&fit=crop&w=800&q=80"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', display: 'block' }}
                /> */}
              </div>
            </div>
          </div>
          <div className="card-footer">
            <h1 className="card-title">To Wang,</h1>
            <h3 className="card-subtitle">
              Thank you for your constancy this year.
            </h3>
          </div>
        </div>

        {/* Rear */}
        <div
          className={`annual-report-card__rear ${isFlipped ? "" : "rotate-y-180"
            }`}
        >
          <div className="card-spotlight" />
          <div className="card-watermark">
            <div className="card-watermark-refraction" />
          </div>
          {/* Rear Content */}
          <div
            className="card-content"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80")',
            }}
          >
            <div className="card-header">
              <h3 className="card-header-text" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>节日清单</h3>
              <h3 className="card-header-text" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>2025 年</h3>
            </div>
            <div className="card-image-container" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '30px', background: 'rgba(255,255,255,0.9)', margin: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
              <div className="card-shine" />
              <div style={{ width: '100%' }}>
                <p style={{ fontSize: '14px', color: '#d13232', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>收到礼物</span>
                  <span style={{ fontWeight: '800' }}>100</span>
                </p>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', width: '100%', marginBottom: '16px' }}>
                  <div style={{ height: '100%', background: '#d13232', borderRadius: '3px', width: '100%' }}></div>
                </div>

                <p style={{ fontSize: '14px', color: '#2f855a', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>吃掉姜饼</span>
                  <span style={{ fontWeight: '800' }}>52</span>
                </p>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', width: '100%', marginBottom: '16px' }}>
                  <div style={{ height: '100%', background: '#2f855a', borderRadius: '3px', width: '80%' }}></div>
                </div>

                <p style={{ fontSize: '14px', color: '#d69e2e', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>快乐指数</span>
                  <span style={{ fontWeight: '800' }}>∞</span>
                </p>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', width: '100%' }}>
                  <div style={{ height: '100%', background: '#d69e2e', borderRadius: '3px', width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <h1 className="card-title">节日快乐</h1>
            <h3 className="card-subtitle">
              点击卡片翻转
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReportCard;
