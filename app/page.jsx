'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [theme, setThemeState] = useState('red');
  const [selectedPos, setSelectedPos] = useState('FL');
  const [isScanning, setIsScanning] = useState(false);
  const [vizMode, setVizMode] = useState('contour');
  const [previewImg, setPreviewImg] = useState('/f40_real_tyre.png');
  const [history, setHistory] = useState([
    { date: '29 Sep 2026', vehicle: 'Ferrari F40 (FL)', depth: '4.8 mm', condition: '🟢 Good', remaining: '28,500 km' },
    { date: '15 Jul 2026', vehicle: 'Ferrari F40 (FR)', depth: '5.6 mm', condition: '🟢 Good', remaining: '34,000 km' },
    { date: '02 May 2026', vehicle: 'Ferrari F40 (RR)', depth: '3.2 mm', condition: '🟡 Monitor', remaining: '14,000 km' }
  ]);

  const canvasRef = useRef(null);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPreviewImg(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = (e) => {
    e.preventDefault();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const newScan = {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        vehicle: `Pirelli P Zero (${selectedPos})`,
        depth: '4.8 mm',
        condition: '🟢 Good',
        remaining: '25,000–32,000 km'
      };
      setHistory([newScan, ...history]);
      document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 2500);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previewImg;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (vizMode === 'contour') {
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 3;
        ctx.strokeRect(60, 40, 480, 260);
        ctx.fillStyle = 'rgba(0, 230, 118, 0.9)';
        ctx.font = 'bold 14px "JetBrains Mono"';
        ctx.fillText('Detected Tread Region → 4.8 mm', 70, 70);
      } else if (vizMode === 'heatmap') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(255, 23, 68, 0.35)');
        grad.addColorStop(0.5, 'rgba(255, 171, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 230, 118, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(60, 40, 480, 260);
      }
    };
  }, [previewImg, vizMode]);

  return (
    <main>
      {/* HEADER NAVIGATION */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(4, 5, 7, 0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <img src={theme === 'yellow' ? '/tyrz_logo.jpg' : '/tyrz_logo_red.jpg'} alt="Logo" style={{ height: '36px', borderRadius: '6px' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem' }}>
            TYRZ <span style={{ color: 'var(--accent)' }}>// AI SCANNER</span>
          </div>
        </a>

        <nav style={{ display: 'flex', gap: '22px', fontSize: '0.9rem' }}>
          <a href="#home" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Home</a>
          <a href="#scan-section" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Scan Tyre</a>
          <a href="#report-section" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Health Report</a>
          <a href="#viz-section" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>AI Visualizer</a>
          <a href="#prediction-section" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Wear Life</a>
          <a href="#dashboard-section" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>My Vehicle</a>
          <a href="#about-ai" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>About AI</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px', gap: '4px' }}>
            <button className={`theme-btn red ${theme === 'red' ? 'active' : ''}`} onClick={() => setTheme('red')} style={{ width: 18, height: 18, borderRadius: '50%', background: '#e60000', border: 'none', cursor: 'pointer' }}></button>
            <button className={`theme-btn yellow ${theme === 'yellow' ? 'active' : ''}`} onClick={() => setTheme('yellow')} style={{ width: 18, height: 18, borderRadius: '50%', background: '#ffcc00', border: 'none', cursor: 'pointer' }}></button>
            <button className={`theme-btn cyan ${theme === 'cyan' ? 'active' : ''}`} onClick={() => setTheme('cyan')} style={{ width: 18, height: 18, borderRadius: '50%', background: '#00eeff', border: 'none', cursor: 'pointer' }}></button>
          </div>

          <Link href="/login" className="btn btn-outline">🔑 Login Portal</Link>
        </div>
      </header>

      {/* 1. HOME HERO */}
      <section id="home" style={{ padding: '90px 0 70px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', padding: '4px 12px', background: 'var(--accent-soft)', borderRadius: '20px', border: '1px solid var(--accent)' }}>AI-POWERED COMPUTER VISION</span>
            <h1 style={{ fontSize: '3.4rem', fontWeight: 800, margin: '20px 0 16px', lineHeight: 1.1 }}>AI Tyre Health <span style={{ color: 'var(--accent)' }}>Scanner</span></h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '32px' }}>Scan your tyre. Measure tread depth. Estimate remaining tyre life with Next.js & AI neural algorithms.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#scan-section" className="btn btn-primary" style={{ padding: '14px 32px' }}>⚡ Scan My Tyre</a>
              <Link href="/login" className="btn btn-outline" style={{ padding: '14px 28px' }}>Telemetry Portal →</Link>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '16px' }}>
            <img src={previewImg} alt="Tyre" style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px' }} />
          </div>
        </div>
      </section>

      {/* 2. SCAN SECTION */}
      <section id="scan-section" style={{ padding: '70px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>📷 Upload Tyre Photo or Scan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px' }}>
            <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--border)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
              <input type="file" accept="image/*" id="file-input" style={{ display: 'none' }} onChange={handleFileSelect} />
              <div onClick={() => document.getElementById('file-input').click()} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '12px' }}>📷</div>
                <h3>Drag & Drop Tyre Image</h3>
                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>or click to browse file</p>
              </div>
            </div>

            <form onSubmit={runAnalysis} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>🛞 Vehicle Details</h3>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Tyre Size</label>
                <input type="text" placeholder="205/55 R16" defaultValue="205/55 R16" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Position</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['FL', 'FR', 'RL', 'RR'].map(pos => (
                    <button key={pos} type="button" onClick={() => setSelectedPos(pos)} style={{ padding: '8px', background: selectedPos === pos ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedPos === pos ? 'var(--accent)' : 'var(--border)'}`, color: selectedPos === pos ? 'var(--accent)' : 'var(--text-dim)', borderRadius: '6px', cursor: 'pointer' }}>{pos}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>⚡ Run AI Tyre Health Scan</button>
            </form>
          </div>
        </div>
      </section>

      {/* 5 & 6. HEALTH REPORT & TABLE */}
      <section id="report-section" style={{ padding: '70px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>🛞 Tyre Health Report</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>ESTIMATED TREAD DEPTH</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '4rem', fontWeight: 800, color: 'var(--accent)', margin: '12px 0' }}>4.8 <span style={{ fontSize: '1.2rem' }}>mm</span></div>
              <div style={{ padding: '6px 16px', background: 'rgba(0,230,118,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '20px', display: 'inline-block', fontWeight: 700 }}>🟢 Condition: Good</div>
              <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', fontFamily: 'var(--font-mono)' }}>
                Estimated Remaining Life: <strong>25,000–32,000 km</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
              <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>📊 Parameter Analysis</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Tread Depth</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>4.8 mm</td></tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Estimated Wear</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>40%</td></tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Remaining Usable Tread</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>3.2 mm</td></tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '10px 0', color: 'var(--text-dim)' }}>AI Confidence</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>87%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 7. VISUALIZER */}
      <section id="viz-section" style={{ padding: '70px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'center' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', height: '320px' }}>
            <canvas ref={canvasRef} width="600" height="320" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></canvas>
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>AI Tread Detection Contour</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Switch between computer vision overlay modes to inspect depth channels.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setVizMode('contour')}>🟢 Contours</button>
              <button className="btn btn-outline" onClick={() => setVizMode('heatmap')}>🔥 Heatmap</button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. HISTORY */}
      <section id="history-section" style={{ padding: '70px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '24px' }}>📋 MongoDB Scan History</h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Vehicle / Position</th>
                  <th style={{ padding: '12px' }}>Tread Depth</th>
                  <th style={{ padding: '12px' }}>Condition</th>
                  <th style={{ padding: '12px' }}>Est. Remaining</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>{item.date}</td>
                    <td style={{ padding: '12px' }}>{item.vehicle}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent)' }}>{item.depth}</td>
                    <td style={{ padding: '12px' }}>{item.condition}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{item.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '36px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <p>© 2026 Next.js AI Tyre Health Scanner & Ferrari F40 Telemetry Portal.</p>
      </footer>
    </main>
  );
}
