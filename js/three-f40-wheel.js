/**
 * TRUE 3D FERRARI F40 WHEEL & TYRE SETUP (Three.js WebGL Engine)
 * Features:
 * - Speedline 3-piece modular forged alloy rim with 5-star silver face
 * - Deep stepped polished dish & 24 circumferential assembly rivets
 * - Single center-lock hex nut with Ferrari emblem
 * - Authentic wide rear Pirelli P-Zero Asimmetrico tyre (335/35 ZR17)
 * - Directional herringbone tread blocks & lateral water drainage channels
 * - Real 3D red racing suspension coilover spring & drilled brake rotor
 * - 3D dynamic radial laser telemetry sweep with point-light tread illumination
 * - Smooth camera transitions between Tunnel Zoom, Showcase Left, and 3D Inspect Orbit
 */

class F40Wheel3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // 3D Groups
    this.wheelRoot = null;
    this.tyreMesh = null;
    this.rimGroup = null;
    this.brakeGroup = null;
    this.suspensionGroup = null;
    this.laserBeamGroup = null;
    this.laserLight = null;

    // Animation & State
    this.sweepAngle = 0;
    this.sweepSpeed = 0.025;
    this.isSweeping = true;
    this.wheelRotationSpeed = 0.002;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Euler(0, 0, 0);
    this.targetCameraPos = new THREE.Vector3(0, 0, 5.2);
    
    // Spark particles
    this.sparks = [];
    this.sparkGeo = null;
    this.sparkMat = null;
    this.sparkPoints = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent canvas over dark background

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5.2);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (for Inspect Mode)
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 8.5;
      this.controls.minDistance = 2.4;
      this.controls.enablePan = true;
      this.controls.enabled = false; // Enabled during Inspect Mode
    }

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Build the 3D Ferrari F40 Wheel & Tyre Model
    this.buildWheelModel();

    // 7. Build 3D Radial Laser Telemetry Sweep
    this.buildLaserSweep();

    // 8. Event Listeners & Loop
    window.addEventListener('resize', () => this.onResize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Subtle ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    // Main studio key light (creates specular reflections on Speedline rim dish)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 5, 6);
    this.scene.add(keyLight);

    // Fill light with cool tone
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.6);
    fillLight.position.set(-5, 2, 4);
    this.scene.add(fillLight);

    // Rim backlight for edge definition
    const rimLight = new THREE.DirectionalLight(0xff2233, 1.2);
    rimLight.position.set(0, -4, -3);
    this.scene.add(rimLight);

    // Top soft light illuminating suspension coil
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(2, 6, -1);
    this.scene.add(topLight);
  }

  // =========================================================================
  // 3D MODEL BUILDER: WHEEL, RIM, TYRE, BRAKES, RED COILOVER
  // =========================================================================

  buildWheelModel() {
    this.wheelRoot = new THREE.Group();
    this.scene.add(this.wheelRoot);

    // Generate Pirelli P-Zero Asimmetrico Tread Texture Procedurally
    const treadTexture = this.createPirelliTreadTexture();
    const sidewallTexture = this.createSidewallTexture();

    // -----------------------------------------------------------------------
    // A. TYRE (Iconic Pirelli P-Zero Asimmetrico 335/35 ZR17)
    // -----------------------------------------------------------------------
    // Broad, aggressive rear profile: Outer diameter ~1.9, width ~0.9
    const tyreRadius = 1.85;
    const tyreWidth = 0.95;
    const rimRadius = 1.28;

    // Tread surface mesh (Outer cylinder with rounded shoulder curvature)
    const tyreGeo = new THREE.CylinderGeometry(
      tyreRadius, tyreRadius, tyreWidth, 64, 16, true
    );
    // Rotate so axle is along Z axis
    tyreGeo.rotateX(Math.PI / 2);

    const tyreMat = new THREE.MeshStandardMaterial({
      color: 0x141517, // Deep matte vulcanized rubber
      roughness: 0.88,
      metalness: 0.08,
      map: treadTexture,
      bumpMap: treadTexture,
      bumpScale: 0.04
    });

    this.tyreMesh = new THREE.Mesh(tyreGeo, tyreMat);
    this.wheelRoot.add(this.tyreMesh);

    // Outer and Inner Rounded Shoulders / Sidewalls
    const sidewallGeo = new THREE.RingGeometry(rimRadius, tyreRadius, 64, 8);
    const sidewallMat = new THREE.MeshStandardMaterial({
      color: 0x16181b,
      roughness: 0.78,
      metalness: 0.12,
      map: sidewallTexture,
      bumpMap: sidewallTexture,
      bumpScale: 0.02,
      side: THREE.DoubleSide
    });

    // Front Sidewall
    const frontSidewall = new THREE.Mesh(sidewallGeo, sidewallMat);
    frontSidewall.position.z = tyreWidth / 2;
    this.wheelRoot.add(frontSidewall);

    // Rear Sidewall
    const rearSidewall = new THREE.Mesh(sidewallGeo, sidewallMat);
    rearSidewall.position.z = -tyreWidth / 2;
    this.wheelRoot.add(rearSidewall);

    // -----------------------------------------------------------------------
    // B. SPEEDLINE 3-PIECE MODULAR FORGED ALLOY RIM
    // -----------------------------------------------------------------------
    this.rimGroup = new THREE.Group();
    this.wheelRoot.add(this.rimGroup);

    // 1. Deep Stepped Polished Dish / Rim Barrel
    // Lathe geometry creates the iconic stepped deep lip
    const dishPoints = [
      new THREE.Vector2(rimRadius, tyreWidth / 2),
      new THREE.Vector2(rimRadius - 0.05, tyreWidth / 2 - 0.05),
      new THREE.Vector2(rimRadius - 0.08, tyreWidth / 2 - 0.28), // Step 1 (Rivet shelf)
      new THREE.Vector2(rimRadius - 0.22, tyreWidth / 2 - 0.32), // Step 2 (Deep dish recess)
      new THREE.Vector2(0.92, 0.02),                              // Spokes plane
      new THREE.Vector2(0.36, -0.06),                             // Center hub recess
      new THREE.Vector2(0.36, -tyreWidth / 2),                    // Inner barrel
      new THREE.Vector2(rimRadius, -tyreWidth / 2)
    ];

    const dishGeo = new THREE.LatheGeometry(dishPoints, 64);
    const polishedAluminumMat = new THREE.MeshStandardMaterial({
      color: 0xe0e3eb, // Mirror polished forged alloy
      roughness: 0.18,
      metalness: 0.94
    });
    const dishMesh = new THREE.Mesh(dishGeo, polishedAluminumMat);
    this.rimGroup.add(dishMesh);

    // 2. Legendary Speedline 5-Star Silver Face
    const starFaceMat = new THREE.MeshStandardMaterial({
      color: 0xc8cbd4, // Satin silver star face
      roughness: 0.32,
      metalness: 0.78
    });

    const numSpokes = 5;
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i * Math.PI * 2) / numSpokes;

      // 5-Star Spoke: Tapered trapezoid shape
      const spokeShape = new THREE.Shape();
      const wInner = 0.24;
      const wOuter = 0.42;
      const rInner = 0.32;
      const rOuter = 1.05;

      spokeShape.moveTo(-wInner / 2, rInner);
      spokeShape.lineTo(wInner / 2, rInner);
      spokeShape.lineTo(wOuter / 2, rOuter);
      spokeShape.lineTo(-wOuter / 2, rOuter);
      spokeShape.closePath();

      // Recessed center groove on each spoke (authentic Speedline feature)
      const holePath = new THREE.Path();
      holePath.moveTo(-wInner * 0.25, rInner + 0.12);
      holePath.lineTo(wInner * 0.25, rInner + 0.12);
      holePath.lineTo(wOuter * 0.22, rOuter - 0.12);
      holePath.lineTo(-wOuter * 0.22, rOuter - 0.12);
      holePath.closePath();
      spokeShape.holes.push(holePath);

      const extrudeSettings = {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02
      };

      const spokeGeo = new THREE.ExtrudeGeometry(spokeShape, extrudeSettings);
      const spokeMesh = new THREE.Mesh(spokeGeo, starFaceMat);
      spokeMesh.rotation.z = angle;
      spokeMesh.position.z = 0.04;
      this.rimGroup.add(spokeMesh);
    }

    // 3. Circumferential Assembly Rivets (24 individual 3D bolts around the rim shelf)
    const rivetGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12);
    rivetGeo.rotateX(Math.PI / 2);
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.98
    });

    const rivetRadius = 1.16;
    const numRivets = 24;
    for (let i = 0; i < numRivets; i++) {
      const a = (i * Math.PI * 2) / numRivets;
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      rivet.position.set(
        Math.cos(a) * rivetRadius,
        Math.sin(a) * rivetRadius,
        0.18
      );
      this.rimGroup.add(rivet);
    }

    // 4. Center-Lock Hex Nut & Locking Collar
    // Black collar
    const collarGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.4,
      metalness: 0.8
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.z = 0.08;
    this.rimGroup.add(collar);

    // Large Center-Lock Hex Nut (Single nut)
    const hexNutGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.14, 6);
    hexNutGeo.rotateX(Math.PI / 2);
    const hexNutMat = new THREE.MeshStandardMaterial({
      color: 0xdedede,
      roughness: 0.22,
      metalness: 0.88
    });
    const hexNut = new THREE.Mesh(hexNutGeo, hexNutMat);
    hexNut.position.z = 0.14;
    this.rimGroup.add(hexNut);

    // Ferrari Red Center Cap / Cavallino Hub
    const capGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.03, 32);
    capGeo.rotateX(Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe50012, // Rosso Corsa Red
      roughness: 0.25,
      metalness: 0.3
    });
    const centerCap = new THREE.Mesh(capGeo, capMat);
    centerCap.position.z = 0.22;
    this.rimGroup.add(centerCap);

    // -----------------------------------------------------------------------
    // C. DRILLED STEEL BRAKE ROTOR & BREMBO CALIPER
    // -----------------------------------------------------------------------
    this.brakeGroup = new THREE.Group();
    this.wheelRoot.add(this.brakeGroup);

    // Drilled Brake Disc
    const discGeo = new THREE.CylinderGeometry(1.02, 1.02, 0.04, 48);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x8a909a,
      roughness: 0.3,
      metalness: 0.85
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.z = -0.12;
    this.brakeGroup.add(discMesh);

    // Brembo Caliper (Black with Ferrari branding)
    const caliperGeo = new THREE.BoxGeometry(0.28, 0.65, 0.18);
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0x111214,
      roughness: 0.35,
      metalness: 0.7
    });
    const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
    caliperMesh.position.set(-0.85, 0.15, -0.06);
    this.brakeGroup.add(caliperMesh);

    // -----------------------------------------------------------------------
    // D. AUTHENTIC RED SUSPENSION COILOVER SPRING
    // -----------------------------------------------------------------------
    this.suspensionGroup = new THREE.Group();
    this.wheelRoot.add(this.suspensionGroup);

    // 3D Helical Coil Spring
    class HelixCurve extends THREE.Curve {
      constructor(radius, height, turns) {
        super();
        this.radius = radius;
        this.height = height;
        this.turns = turns;
      }
      getPoint(t) {
        const angle = 2 * Math.PI * this.turns * t;
        const x = this.radius * Math.cos(angle);
        const y = this.height * (t - 0.5);
        const z = this.radius * Math.sin(angle);
        return new THREE.Vector3(x, y, z);
      }
    }

    const springPath = new HelixCurve(0.22, 1.25, 7.5);
    const springGeo = new THREE.TubeGeometry(springPath, 160, 0.045, 12, false);
    const redSpringMat = new THREE.MeshStandardMaterial({
      color: 0xe50012, // Iconic Ferrari red coilover spring
      roughness: 0.28,
      metalness: 0.25
    });
    const springMesh = new THREE.Mesh(springGeo, redSpringMat);

    // Damper Piston Rod inside spring
    const damperGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 24);
    const damperMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.1,
      metalness: 0.95
    });
    const damperMesh = new THREE.Mesh(damperGeo, damperMat);

    this.suspensionGroup.add(springMesh);
    this.suspensionGroup.add(damperMesh);

    // Position spring at top-right (~1:30 position) behind spokes
    this.suspensionGroup.position.set(0.65, 0.92, -0.45);
    this.suspensionGroup.rotation.z = -Math.PI / 4.8;
  }

  // =========================================================================
  // 3D RADIAL LASER TELEMETRY SWEEP
  // =========================================================================

  buildLaserSweep() {
    this.laserBeamGroup = new THREE.Group();
    this.wheelRoot.add(this.laserBeamGroup);

    // 1. Radial Laser Sweep Line (Glowing 3D ribbon)
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0.52,             // Hub center
      1.88, 0, 0.52            // Outer tyre edge
    ]);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff3344,
      linewidth: 3
    });
    const laserLine = new THREE.Line(lineGeo, lineMat);
    this.laserBeamGroup.add(laserLine);

    // 2. Phosphor Sweep Fan Trail (Trailing 3D arc)
    const fanGeo = new THREE.RingGeometry(0.4, 1.9, 32, 1, 0, Math.PI * 0.35);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0xff1122,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const fanMesh = new THREE.Mesh(fanGeo, fanMat);
    fanMesh.position.z = 0.50;
    fanMesh.rotation.z = -Math.PI * 0.35; // Trail behind the beam
    this.laserBeamGroup.add(fanMesh);

    // 3. Dynamic Laser PointLight (Casts real red glow onto the tyre & rim)
    this.laserLight = new THREE.PointLight(0xff2233, 2.5, 3.2);
    this.laserLight.position.set(1.4, 0, 0.6);
    this.laserBeamGroup.add(this.laserLight);

    // 4. Tread Hit Spark Point at edge
    const tipGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.set(1.88, 0, 0.52);
    this.laserBeamGroup.add(tipMesh);
  }

  // =========================================================================
  // PROCEDURAL HIGH-RES TEXTURE GENERATORS (Zero CORS risk in local file://)
  // =========================================================================

  createPirelliTreadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark vulcanized rubber
    ctx.fillStyle = '#18191b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle rubber grain
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const c = 20 + Math.floor(Math.random() * 8);
      ctx.fillStyle = `rgb(${c},${c},${c})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // 4 Continuous Circumferential Water Drainage Grooves
    const groovesY = [240, 420, 600, 780];
    ctx.fillStyle = '#060708'; // Deep dark grooves
    groovesY.forEach(y => {
      ctx.fillRect(0, y - 18, canvas.width, 36);
    });

    // Directional Herringbone Center Blocks & Lateral Drainage Sipes
    ctx.strokeStyle = '#050506';
    ctx.lineWidth = 10;
    const chevronStep = 48;
    for (let x = 0; x < canvas.width; x += chevronStep) {
      // Center herringbone chevron: points in direction of tire rotation
      ctx.beginPath();
      ctx.moveTo(x, 420);
      ctx.lineTo(x + 28, 510);
      ctx.lineTo(x, 600);
      ctx.stroke();

      // Outer lateral drainage sipes
      ctx.beginPath();
      ctx.moveTo(x, 240);
      ctx.lineTo(x + 24, 80);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 780);
      ctx.lineTo(x + 24, 940);
      ctx.stroke();
    }

    // Outer Shoulder Stiff Traction Blocks (Notched sipes)
    ctx.lineWidth = 6;
    for (let x = 0; x < canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 12, 60);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.lineTo(x + 12, 964);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 1);
    return tex;
  }

  createSidewallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Transparent / dark ring base
    ctx.fillStyle = '#16181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Embossed circular text around sidewall
    ctx.save();
    ctx.translate(512, 512);

    ctx.font = 'bold 32px "Orbitron", sans-serif';
    ctx.fillStyle = '#2c3038';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sidewall Typography: PIRELLI P-ZERO ASIMMETRICO 335/35 ZR17
    const drawCurvedText = (text, radius, startAngle) => {
      const anglePerChar = 0.045;
      for (let i = 0; i < text.length; i++) {
        const angle = startAngle + i * anglePerChar;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, -radius);
        ctx.restore();
      }
    };

    drawCurvedText('PIRELLI P-ZERO ASIMMETRICO', 420, -1.2);
    drawCurvedText('335/35 ZR17  RADIAL TUBELESS', 420, 1.2);

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // =========================================================================
  // CAMERA & STAGE TRANSITIONS
  // =========================================================================

  setStageState(stage) {
    if (stage === 1) {
      // Approach (Wheel hidden/ready behind scenes)
      this.wheelRoot.visible = false;
      if (this.controls) this.controls.enabled = false;
    } else if (stage === 2 || stage === 3) {
      // Wheel Zoom & Telemetry: Center position
      this.wheelRoot.visible = true;
      this.targetPosition.set(0, 0, 0);
      this.targetRotation.set(0, 0, 0);
      this.targetCameraPos.set(0, 0, 5.2);
      if (this.controls) this.controls.enabled = false;
    } else if (stage === 4) {
      // Login Reveal: 3D Wheel smoothly shifts to Left showcase
      this.wheelRoot.visible = true;
      this.targetPosition.set(-1.6, 0, 0);
      this.targetRotation.set(0, 0.38, 0); // Dynamic 3/4 perspective angle
      this.targetCameraPos.set(-0.3, 0, 5.4);
      if (this.controls) this.controls.enabled = false;
    }
  }

  enableInspectMode(enabled) {
    if (this.controls) {
      this.controls.enabled = enabled;
      if (enabled) {
        this.targetPosition.set(0, 0, 0);
        this.targetRotation.set(0, 0, 0);
      }
    }
  }

  focusTread() {
    this.targetCameraPos.set(1.5, 0.4, 2.8);
    this.targetRotation.set(0.2, -0.65, 0);
  }

  focusFace() {
    this.targetCameraPos.set(0, 0, 4.8);
    this.targetRotation.set(0, 0, 0);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // =========================================================================
  // ANIMATION LOOP
  // =========================================================================

  animate(time) {
    requestAnimationFrame(this.animate);

    // 1. Radial Laser Sweep Rotation
    if (this.isSweeping && this.laserBeamGroup) {
      this.sweepAngle += this.sweepSpeed;
      this.laserBeamGroup.rotation.z = this.sweepAngle;

      // Pulse laser intensity
      if (this.laserLight) {
        this.laserLight.intensity = 2.2 + Math.sin(time * 0.008) * 0.6;
      }
    }

    // 2. Smooth Lerp Position & Rotation
    if (!this.controls || !this.controls.enabled) {
      this.wheelRoot.position.lerp(this.targetPosition, 0.08);
      this.wheelRoot.rotation.x += (this.targetRotation.x - this.wheelRoot.rotation.x) * 0.08;
      this.wheelRoot.rotation.y += (this.targetRotation.y - this.wheelRoot.rotation.y) * 0.08;
      this.wheelRoot.rotation.z += (this.targetRotation.z - this.wheelRoot.rotation.z) * 0.08;
      this.camera.position.lerp(this.targetCameraPos, 0.08);
      this.camera.lookAt(this.wheelRoot.position.x * 0.5, 0, 0);
    } else {
      this.controls.update();
    }

    // 3. Render
    this.renderer.render(this.scene, this.camera);
  }
}

window.F40Wheel3D = F40Wheel3D;
