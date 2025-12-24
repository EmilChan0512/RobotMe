import React, { useState } from "react";
import "./AnnualReportCard.css";
import bgImage from "../../assets/sdkl.avif";
import bgImage1 from "../../assets/cute-christmas.jpg";

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

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x, y });
    setMousePos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
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
        onTouchMove={handleTouchMove}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={handleMouseLeave}
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
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
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
          {/* Rear Content - 纯文字版本 */}
{/* Rear Content - 簡單可愛聖誕樹 + 禮物版 */}
<div
  className="card-content"
  style={{
    background: '#ffffff',                    // 純白背景
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  {/* 中央聖誕樹 + 禮物組合（可直接用 img，或 background） */}
  <div style={{
    position: 'relative',
    textAlign: 'center',
    maxWidth: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    {/* 聖誕樹圖片（建議用下面推薦的其中一張） */}
    <img
      src={bgImage1}  
      alt="Cute Christmas Tree with Gift"
      style={{
        maxWidth: '280px',
        width: '100%',
        height: 'auto',
        display: 'block',
        marginBottom: '20px',
      }}
    />

    {/* 如果想疊加禮物盒，可以再加一張小圖，或直接用下面靈感圖 */}
    {/* 可選：輕微陰影增加立體感 */}
    <div style={{
      position: 'absolute',
      bottom: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100px',
      height: '60px',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, transparent 70%)',
      filter: 'blur(8px)',
      zIndex: -1,
    }} />
  </div>

  {/* 極簡小裝飾（可選） */}
  <div style={{
    position: 'absolute',
    top: '10%',
    left: '10%',
    fontSize: '2rem',
    opacity: 0.15,
    pointerEvents: 'none',
  }}>❄</div>
  <div style={{
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    fontSize: '1.8rem',
    opacity: 0.15,
    pointerEvents: 'none',
  }}>✨</div>
</div>
          <div className="card-footer">
            <h1 className="card-title">              {/* todo */}
            </h1>
            <h3 className="card-subtitle">
              {/* todo */}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReportCard;
