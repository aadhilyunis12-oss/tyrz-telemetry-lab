/**
 * FERRARI F40 // FULL-SCREEN TYRE PORTAL CONTROLLER
 * Controls full-screen tyre presentation, radial laser sweep,
 * tab navigation (Auto Sequence, Inspect Tyre, Login Bar), and authentication.
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    activeTab: 'auto', // 'auto' | 'inspect' | 'login'
    theme: 'red',
    inspecting: false,
    mousePos: { x: 0, y: 0 },
    currentParallax: { x: 0, y: 0 },
    targetParallax: { x: 0, y: 0 }
  };

  // DOM Elements
  const els = {
    portalViewport: document.getElementById('portalViewport'),
    heroTyreFullscreen: document.getElementById('heroTyreFullscreen'),
    tyreParallaxWrapper: document.getElementById('tyreParallaxWrapper'),
    portalLoginSection: document.getElementById('portalLoginSection'),
    laserSweepCanvas: document.getElementById('laserSweepCanvas'),
    
    // Bottom Tabs
    tabAutoSequence: document.getElementById('tabAutoSequence'),
    tabInspectTyre: document.getElementById('tabInspectTyre'),
    tabLoginBar: document.getElementById('tabLoginBar'),
    
    // Top Actions
    replayIntroBtn: document.getElementById('replayIntroBtn'),
    colorDots: document.querySelectorAll('.color-dot'),
    
    // Login Form
    portalLoginForm: document.getElementById('portalLoginForm'),
    pilotIdInput: document.getElementById('pilotIdInput'),
    passcodeInput: document.getElementById('passcodeInput'),
    togglePassVisibility: document.getElementById('togglePassVisibility'),
    engageTelemetryBtn: document.getElementById('engageTelemetryBtn'),
    quickAutofillBtn: document.getElementById('quickAutofillBtn'),
    authStatusBanner: document.getElementById('authStatusBanner'),
    
    // Session Dialog
    sessionDialog: document.getElementById('sessionDialog'),
    dialogPilotTag: document.getElementById('dialogPilotTag'),
    dialogDismissBtn: document.getElementById('dialogDismissBtn')
  };

  // Initialize Radial Laser Telemetry Canvas
  let telemetryCanvas = null;
  if (window.TelemetryCanvas) {
    telemetryCanvas = new window.TelemetryCanvas('laserSweepCanvas');
  }

  // =========================================================================
  // PRESENTATION SEQUENCE
  // =========================================================================

  function playAutoSequence() {
    state.activeTab = 'auto';
    updateTabsUI('auto');
    state.inspecting = false;
    state.targetParallax = { x: 0, y: 0 };

    if (window.f40Audio) {
      window.f40Audio.playClick();
      window.f40Audio.startTunnelEngine();
    }

    // 1. Initial framing: Tyre scales gently into place
    els.heroTyreFullscreen.style.transform = 'scale(1.05)';
    els.portalLoginSection.style.transform = 'translateY(-50%) translateX(110%)';
    els.portalLoginSection.style.opacity = '0';

    // 2. Trigger Laser Telemetry Sweep
    setTimeout(() => {
      els.heroTyreFullscreen.style.transform = 'scale(1.0)';
      if (window.f40Audio) {
        window.f40Audio.playLaserSweep();
      }
      if (telemetryCanvas) {
        telemetryCanvas.isSweeping = true;
      }
    }, 600);

    // 3. Smoothly reveal the F40 Tyre Portal card from the right
    setTimeout(() => {
      els.portalLoginSection.style.transform = 'translateY(-50%) translateX(0)';
      els.portalLoginSection.style.opacity = '1';
      if (window.f40Audio) {
        window.f40Audio.playDataPing();
      }
    }, 1800);
  }

  function setInspectMode() {
    state.activeTab = 'inspect';
    updateTabsUI('inspect');
    state.inspecting = true;

    if (window.f40Audio) {
      window.f40Audio.playClick();
    }

    // Keep login card visible but slightly transparent to focus on tyre
    els.portalLoginSection.style.opacity = '0.4';
    els.portalLoginSection.style.transform = 'translateY(-50%) translateX(0)';
  }

  function focusLoginBar() {
    state.activeTab = 'login';
    updateTabsUI('login');
    state.inspecting = false;
    state.targetParallax = { x: 0, y: 0 };

    if (window.f40Audio) {
      window.f40Audio.playClick();
    }

    // Highlight and focus login card
    els.portalLoginSection.style.opacity = '1';
    els.portalLoginSection.style.transform = 'translateY(-50%) translateX(0) scale(1.02)';
    setTimeout(() => {
      els.portalLoginSection.style.transform = 'translateY(-50%) translateX(0) scale(1.0)';
      if (els.pilotIdInput) els.pilotIdInput.focus();
    }, 200);
  }

  function updateTabsUI(tabName) {
    if (els.tabAutoSequence) els.tabAutoSequence.classList.toggle('active', tabName === 'auto');
    if (els.tabInspectTyre) els.tabInspectTyre.classList.toggle('active', tabName === 'inspect');
    if (els.tabLoginBar) els.tabLoginBar.classList.toggle('active', tabName === 'login');
  }

  // =========================================================================
  // MOUSE PARALLAX ON FULL-SCREEN TYRE
  // =========================================================================

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;

    if (state.inspecting) {
      state.targetParallax.x = normX * 45;
      state.targetParallax.y = normY * 35;
    } else {
      state.targetParallax.x = normX * 12;
      state.targetParallax.y = normY * 8;
    }
  });

  function updateParallaxLoop() {
    state.currentParallax.x += (state.targetParallax.x - state.currentParallax.x) * 0.08;
    state.currentParallax.y += (state.targetParallax.y - state.currentParallax.y) * 0.08;

    if (els.tyreParallaxWrapper) {
      els.tyreParallaxWrapper.style.transform = 
        `translate3d(${state.currentParallax.x}px, ${state.currentParallax.y}px, 0)`;
    }

    requestAnimationFrame(updateParallaxLoop);
  }
  requestAnimationFrame(updateParallaxLoop);

  // =========================================================================
  // THEME SWITCHER (Top Right Dots)
  // =========================================================================

  els.colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      state.theme = color;
      
      els.colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      if (color === 'yellow') {
        document.documentElement.setAttribute('data-theme', 'yellow');
      } else if (color === 'cyan') {
        document.documentElement.setAttribute('data-theme', 'cyan');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      if (window.f40Audio) {
        window.f40Audio.playDataPing();
      }
    });
  });

  // =========================================================================
  // LOGIN FORM & TELEMETRY ACCESS
  // =========================================================================

  if (els.togglePassVisibility) {
    els.togglePassVisibility.addEventListener('click', () => {
      const isPass = els.passcodeInput.type === 'password';
      els.passcodeInput.type = isPass ? 'text' : 'password';
      els.togglePassVisibility.textContent = isPass ? '🙈' : '👁️';
    });
  }

  if (els.quickAutofillBtn) {
    els.quickAutofillBtn.addEventListener('click', () => {
      els.pilotIdInput.value = 'pilot@f40-telemetry.it';
      els.passcodeInput.value = 'F40-RossoCorsa#1987';
      if (window.f40Audio) window.f40Audio.playDataPing();
    });
  }

  if (els.portalLoginForm) {
    els.portalLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pilotId = els.pilotIdInput.value.trim() || 'pilot@f40-telemetry.it';

      // Feedback banner
      els.authStatusBanner.className = 'auth-status-banner show';
      els.authStatusBanner.innerHTML = `
        <div class="auth-spinner"></div>
        <span>Authenticating with Maranello Telemetry Cloud...</span>
      `;

      if (window.f40Audio) window.f40Audio.playClick();

      setTimeout(() => {
        els.authStatusBanner.innerHTML = `
          <div class="auth-spinner"></div>
          <span>Syncing Pirelli P-Zero 335/35 ZR17 diagnostics bus...</span>
        `;
        if (window.f40Audio) window.f40Audio.playLaserSweep();
      }, 700);

      setTimeout(() => {
        els.authStatusBanner.className = 'auth-status-banner show success';
        els.authStatusBanner.innerHTML = `
          <span>✓ Telemetry Access Granted // Welcome, Pilot</span>
        `;
        if (window.f40Audio) window.f40Audio.playIgnitionSuccess();

        setTimeout(() => {
          if (els.dialogPilotTag) els.dialogPilotTag.textContent = pilotId;
          els.sessionDialog.classList.add('active');
        }, 600);
      }, 1600);
    });
  }

  if (els.dialogDismissBtn) {
    els.dialogDismissBtn.addEventListener('click', () => {
      els.sessionDialog.classList.remove('active');
      els.authStatusBanner.classList.remove('show');
      if (window.f40Audio) window.f40Audio.playClick();
    });
  }

  // =========================================================================
  // TAB & DOCK BUTTONS
  // =========================================================================

  if (els.tabAutoSequence) {
    els.tabAutoSequence.addEventListener('click', () => {
      playAutoSequence();
    });
  }

  if (els.tabInspectTyre) {
    els.tabInspectTyre.addEventListener('click', () => {
      setInspectMode();
    });
  }

  if (els.tabLoginBar) {
    els.tabLoginBar.addEventListener('click', () => {
      focusLoginBar();
    });
  }

  if (els.replayIntroBtn) {
    els.replayIntroBtn.addEventListener('click', () => {
      playAutoSequence();
    });
  }

  // First click unlocks Web Audio
  window.addEventListener('click', () => {
    if (window.f40Audio && !window.f40Audio.isInitialized) {
      window.f40Audio.init();
      window.f40Audio.startTunnelEngine();
    }
  }, { once: true });

  // Start with auto sequence
  playAutoSequence();
});
