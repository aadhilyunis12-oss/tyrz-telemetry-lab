/**
 * CLEAN & NEAT RADIAL LASER TELEMETRY SWEEP
 * Tracks across the authentic Pirelli P-Zero Asimmetrico tread surface and Speedline rim
 */

class TelemetryCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
    
    this.sweepAngle = -Math.PI * 0.4;
    this.sweepSpeed = 0.024;
    this.isSweeping = true;
    this.particles = [];
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Ambient micro-particles
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * (this.width || 700),
        y: Math.random() * (this.height || 700),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.35 + 0.15
      });
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // Center point aligned with Speedline rim center (~x: 68%, y: 78% of frame)
    this.centerX = this.width * 0.68;
    this.centerY = this.height * 0.76;
    this.radius = Math.min(this.width, this.height) * 0.85;
  }

  animate() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.isSweeping) {
      this.sweepAngle += this.sweepSpeed;
      if (this.sweepAngle > Math.PI * 1.6) {
        this.sweepAngle = -Math.PI * 0.4; // Sweep arc covering tread & rim
      }
    }

    this.drawLaserSweep();
    this.drawParticles();

    requestAnimationFrame(this.animate);
  }

  drawLaserSweep() {
    const ctx = this.ctx;
    ctx.save();

    const beamAngle = this.sweepAngle;
    const beamLength = this.radius;

    // 1. Phosphor Sweep Fan Trail (Trailing soft glow)
    const fanSpan = Math.PI * 0.28;
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const a1 = beamAngle - (i / segments) * fanSpan;
      const a2 = beamAngle - ((i + 1) / segments) * fanSpan;
      const alpha = (1 - (i / segments)) * 0.12;

      ctx.beginPath();
      ctx.moveTo(this.centerX, this.centerY);
      ctx.arc(this.centerX, this.centerY, beamLength, a2, a1);
      ctx.closePath();
      ctx.fillStyle = `rgba(212, 0, 0, ${alpha})`;
      ctx.fill();
    }

    // 2. Primary Luminous Laser Sweep Line
    const xStart = this.centerX + Math.cos(beamAngle) * (this.radius * 0.15);
    const yStart = this.centerY + Math.sin(beamAngle) * (this.radius * 0.15);
    const xEnd = this.centerX + Math.cos(beamAngle) * beamLength;
    const yEnd = this.centerY + Math.sin(beamAngle) * beamLength;

    // Outer glow
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Laser Core
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#ff1e27';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Highlight Contact Spark Point along Tyre Tread
    ctx.beginPath();
    ctx.arc(xEnd, yEnd, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(xEnd, yEnd, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff1e27';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Directional Sipe Contact Markers
    const grooveFactors = [0.88, 0.76, 0.65, 0.54, 0.42];
    grooveFactors.forEach((factor, idx) => {
      const gx = this.centerX + Math.cos(beamAngle) * (this.radius * factor);
      const gy = this.centerY + Math.sin(beamAngle) * (this.radius * factor);
      
      const perp = beamAngle + Math.PI / 2 + (idx % 2 === 0 ? 0.3 : -0.3);
      const sLen = 6 + idx;
      
      ctx.beginPath();
      ctx.moveTo(gx - Math.cos(perp) * sLen, gy - Math.sin(perp) * sLen);
      ctx.lineTo(gx + Math.cos(perp) * sLen, gy + Math.sin(perp) * sLen);
      ctx.strokeStyle = '#ff1e27';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.25})`;
      ctx.fill();
    });

    ctx.restore();
  }
}

window.TelemetryCanvas = TelemetryCanvas;
