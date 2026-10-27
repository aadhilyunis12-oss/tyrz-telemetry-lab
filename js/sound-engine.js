/**
 * FERRARI F40 TELEMETRY SOUND SYNTHESIS ENGINE
 * Procedural Web Audio API sound generator with:
 * - Tunnel reverberating Twin-Turbo V8 high-speed sound & wastegate flutter
 * - Radial laser telemetry sweep chime
 * - UI tactile engagement clicks & ignition flourish
 */

class F40SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.isInitialized = false;
    this.engineGain = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.tunnelReverb = null;
    this.isPlayingEngine = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    } else if (!this.muted && this.isPlayingEngine && this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0.14, this.ctx.currentTime, 0.1);
    }
    return !this.muted;
  }

  // Ferrari F40 2.9L Twin-Turbo V8 Speeding inside Tunnel Acoustics
  startTunnelEngine() {
    if (!this.isInitialized) this.init();
    if (this.isPlayingEngine || !this.ctx) return;
    this.resume();

    try {
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      const turboOsc = this.ctx.createOscillator(); // High-pitched turbo whistle
      const turboGain = this.ctx.createGain();

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      // Higher revs for speeding inside tunnel (~5,500 - 6,800 RPM equivalent)
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(82, this.ctx.currentTime); // Base harmonic
      this.engineOsc1.frequency.exponentialRampToValueAtTime(135, this.ctx.currentTime + 3.0); // Accelerating in tunnel

      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(164, this.ctx.currentTime);
      this.engineOsc2.frequency.exponentialRampToValueAtTime(270, this.ctx.currentTime + 3.0);

      // Turbo Spool Whistle in tunnel
      turboOsc.type = 'sine';
      turboOsc.frequency.setValueAtTime(1800, this.ctx.currentTime);
      turboOsc.frequency.linearRampToValueAtTime(3200, this.ctx.currentTime + 2.5);
      turboGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      turboOsc.connect(turboGain);

      // Rapid firing pulses in tunnel echo
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(28, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(12, this.ctx.currentTime);
      lfo.connect(this.engineOsc1.frequency);

      // Bandpass / Lowpass filter for tunnel resonance echo
      this.engineFilter.type = 'bandpass';
      this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

      // Master gain
      this.engineGain.gain.setValueAtTime(this.muted ? 0 : 0.001, this.ctx.currentTime);
      this.engineGain.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.14, this.ctx.currentTime + 1.2);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      turboGain.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      turboOsc.start();
      lfo.start();
      this.isPlayingEngine = true;
    } catch (e) {
      console.warn('Could not start tunnel engine audio:', e);
    }
  }

  stopTunnelEngine() {
    if (!this.isPlayingEngine || !this.ctx || !this.engineGain) return;
    try {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      setTimeout(() => {
        if (this.engineOsc1) {
          this.engineOsc1.stop();
          this.engineOsc1.disconnect();
        }
        if (this.engineOsc2) {
          this.engineOsc2.stop();
          this.engineOsc2.disconnect();
        }
        this.isPlayingEngine = false;
      }, 500);
    } catch (e) {
      console.warn(e);
    }
  }

  // Radial Laser Telemetry Sweep Chime
  playLaserSweep() {
    if (!this.isInitialized) this.init();
    if (this.muted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2600, this.ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.7);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.Q.setValueAtTime(4, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.warn(e);
    }
  }

  // Data Ping
  playDataPing() {
    if (!this.isInitialized) this.init();
    if (this.muted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2100, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn(e);
    }
  }

  // Tactile Click
  playClick() {
    if (!this.isInitialized) this.init();
    if (this.muted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(190, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn(e);
    }
  }

  // Access Granted Flourish
  playIgnitionSuccess() {
    if (!this.isInitialized) this.init();
    if (this.muted || !this.ctx) return;
    this.resume();

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.65);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

window.f40Audio = new F40SoundEngine();
