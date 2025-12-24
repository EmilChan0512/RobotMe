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
          className={`annual-report-card__front ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <div className="card-shine" />
          <div className="card-spotlight" />
          {/* Front Content */}
          <div
            className="card-content"
            style={{
              backgroundImage:
                'url("https://persistent.oaistatic.com/cocoon/card-background-12-22-01-13.jpg")',
            }}
          >
            <div className="card-header">
              <h3 className="card-header-text">你的原型</h3>
              <h3 className="card-header-text">2025 年</h3>
            </div>
            <div className="card-image-container">
              <img
                alt="你的原型"
                loading="lazy"
                className="card-image"
                src="https://persistent.oaistatic.com/cocoon/archetypes/the_engineer.png"
              />
            </div>
          </div>
          <div className="card-footer">
            <h1 className="card-title">The Engineer</h1>
            <h3 className="card-subtitle">
              19.1% 的用户与你属于同一原型
            </h3>
          </div>
        </div>

        {/* Rear */}
        <div
          className={`annual-report-card__rear ${
            isFlipped ? "" : "rotate-y-180"
          }`}
        >
          <div className="card-shine" />
          <div className="card-spotlight" />
          {/* Rear Content */}
          <div
            className="card-content"
            style={{
              backgroundImage:
                'url("https://persistent.oaistatic.com/cocoon/card-background-12-22-01-13.jpg")',
            }}
          >
            <div className="card-header">
              <h3 className="card-header-text">详细数据</h3>
              <h3 className="card-header-text">2025 年</h3>
            </div>
            <div className="card-image-container" style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '30px', background: 'rgba(255,255,255,0.8)', margin: '20px', borderRadius: '8px'}}>
                 <div style={{width: '100%'}}>
                    <p style={{fontSize: '14px', color: '#333', marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span>代码提交</span>
                        <span style={{fontWeight: 'bold'}}>1,024</span>
                    </p>
                    <div style={{height: '4px', background: '#eee', borderRadius: '2px', width: '100%', marginBottom: '16px'}}>
                        <div style={{height: '100%', background: '#333', borderRadius: '2px', width: '80%'}}></div>
                    </div>
                    
                    <p style={{fontSize: '14px', color: '#333', marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span>修复 Bug</span>
                        <span style={{fontWeight: 'bold'}}>512</span>
                    </p>
                    <div style={{height: '4px', background: '#eee', borderRadius: '2px', width: '100%', marginBottom: '16px'}}>
                         <div style={{height: '100%', background: '#333', borderRadius: '2px', width: '60%'}}></div>
                    </div>

                    <p style={{fontSize: '14px', color: '#333', marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span>思考时间</span>
                        <span style={{fontWeight: 'bold'}}>∞</span>
                    </p>
                    <div style={{height: '4px', background: '#eee', borderRadius: '2px', width: '100%'}}>
                         <div style={{height: '100%', background: '#333', borderRadius: '2px', width: '100%'}}></div>
                    </div>
                 </div>
            </div>
          </div>
          <div className="card-footer">
            <h1 className="card-title">数据概览</h1>
            <h3 className="card-subtitle">
              点击卡片返回
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReportCard;
