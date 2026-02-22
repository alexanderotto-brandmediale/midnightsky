/* ── Dawn Gradient (Dark → Light) ─────────────────── */
(function () {
  var dawn = document.getElementById('dawn-gradient');
  var lightSections = document.querySelectorAll('.scene--light');
  if (!dawn || !lightSections.length) return;

  function updateDawn() {
    var first = lightSections[0];
    var rect = first.getBoundingClientRect();
    var vh = window.innerHeight;
    // Start transition 1 viewport before the light section
    var transitionStart = vh * 1.5;
    var progress = 0;

    if (rect.top < transitionStart) {
      progress = Math.min(1, (transitionStart - rect.top) / (vh * 1.2));
      // Ease in: slow start, then accelerate (like sunrise)
      progress = progress * progress;
    }

    dawn.style.opacity = progress * 0.85;
  }

  window.addEventListener('scroll', updateDawn, { passive: true });
  updateDawn();
})();

/* ── Hamburger Menu ───────────────────────────────── */
(function () {
  var btn = document.getElementById('hamburger');
  var overlay = document.getElementById('menu-overlay');
  if (!btn || !overlay) return;
  
  btn.addEventListener('click', function () {
    btn.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close on link click
  overlay.querySelectorAll('.menu-link').forEach(function (link) {
    link.addEventListener('click', function () {
      btn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Shrink on scroll
  window.addEventListener('scroll', function () {
    btn.classList.toggle('scrolled', window.scrollY > 100);
  }, { passive: true });
  
  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      btn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
})();

/* ── Noise Wall ───────────────────────────────────── */
(function () {
  var canvas = document.getElementById('noise-wall-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, dpr;
  var running = false;
  var animId;

  // Word pools
  var layerWords = {
    deep: [
      'neural networks', 'transformer architecture', 'gradient descent', 'tokenization',
      'reinforcement learning', 'diffusion models', 'attention mechanism', 'embeddings',
      'fine-tuning', 'RLHF', 'chain of thought', 'context window', 'inference',
      'backpropagation', 'latent space', 'multimodal', 'retrieval augmented',
      'autonomous agents', 'tool use', 'function calling', 'system prompt',
      'constitutional AI', 'alignment', 'scaling laws', 'emergent behavior',
      'quantum computing', 'photonic chips', 'neuromorphic', 'edge inference',
      'federated learning', 'synthetic data', 'world models', 'self-play',
      'digital twins', 'robotics foundation', 'protein folding', 'code generation',
      'voice synthesis', 'real-time translation', 'autonomous driving', 'brain-computer',
      'fusion energy', 'space manufacturing', 'carbon capture', 'biocomputing',
      'decentralized AI', 'open weights', 'mixture of experts', 'sparse attention',
      'agentic workflows', 'human-in-the-loop', 'AI safety', 'interpretability',
      'knowledge distillation', 'quantization', 'model merging', 'prompt engineering'
    ],
    mid: [
      'AI TRANSFORMS ENTERPRISE', 'AGENTS REPLACE WORKFLOWS', 'THE MODEL IS THE PRODUCT',
      'AUTOMATION AT SCALE', 'HUMAN-AI COLLABORATION', 'REAL-TIME INTELLIGENCE',
      'EVERY COMPANY BECOMES AI', 'DATA IS THE NEW OIL', 'COMPUTE IS THE NEW GOLD',
      'FROM TOOLS TO PARTNERS', 'STRATEGY MEETS ALGORITHM', 'DIGITAL-FIRST ECONOMY',
      'THE AGE OF AGENTS', 'INTELLIGENCE ON DEMAND', 'DISRUPTION IS THE NORM',
      'BRAND IN THE AGE OF AI', 'CONTENT AT MACHINE SPEED', 'DECISION ENGINES',
      'THE END OF TEMPLATES', 'PERSONALIZATION AT SCALE', 'ZERO-SHOT EVERYTHING',
      'VOICE-FIRST INTERFACES', 'AMBIENT COMPUTING', 'SPATIAL INTELLIGENCE',
      'POST-SEARCH ERA', 'CONVERSATIONAL COMMERCE', 'AI-NATIVE ORGANIZATIONS',
      'PREDICTIVE EVERYTHING', 'SYNTHETIC MEDIA', 'AUTONOMOUS OPERATIONS'
    ],
    flash: [
      'TRANSFORMATION', 'DISRUPTION', 'INTELLIGENCE', 'AUTONOMOUS', 'EMERGENCE',
      'SIGNAL', 'PATTERN', 'SYSTEM', 'FUTURE', 'AGENCY', 'CLARITY', 'SYNTHESIS',
      'CONVERGENCE', 'ACCELERATION', 'EVOLUTION', 'ARCHITECTURE', 'STRATEGY'
    ]
  };

  // Particles
  var deepLayer = [];
  var midLayer = [];
  var flashLayer = [];
  var synapses = [];
  var DEEP_COUNT = 120;
  var MID_COUNT = 25;
  var FLASH_MAX = 3;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight * 2.5;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomWord(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function createDeep() {
    deepLayer = [];
    for (var i = 0; i < DEEP_COUNT; i++) {
      deepLayer.push({
        text: randomWord(layerWords.deep),
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.2,
        size: 8 + Math.random() * 5,
        opacity: 0.015 + Math.random() * 0.02,
        rot: (Math.random() - 0.5) * 0.15
      });
    }
  }

  function createMid() {
    midLayer = [];
    for (var i = 0; i < MID_COUNT; i++) {
      midLayer.push({
        text: randomWord(layerWords.mid),
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.08 - Math.random() * 0.12,
        size: 11 + Math.random() * 8,
        opacity: 0.025 + Math.random() * 0.02,
        rot: (Math.random() - 0.5) * 0.08
      });
    }
  }

  function spawnFlash() {
    if (flashLayer.length >= FLASH_MAX) return;
    flashLayer.push({
      text: randomWord(layerWords.flash),
      x: Math.random() * w * 0.8 + w * 0.1,
      y: Math.random() * h * 0.6 + h * 0.1,
      size: 24 + Math.random() * 32,
      life: 0,
      maxLife: 80 + Math.random() * 60,
      opacity: 0
    });
  }

  // Synapse connections between nearby deep words
  function updateSynapses() {
    synapses = [];
    var maxDist = 120;
    for (var i = 0; i < deepLayer.length; i += 3) {
      for (var j = i + 3; j < deepLayer.length; j += 3) {
        var dx = deepLayer[i].x - deepLayer[j].x;
        var dy = deepLayer[i].y - deepLayer[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          synapses.push({
            x1: deepLayer[i].x, y1: deepLayer[i].y,
            x2: deepLayer[j].x, y2: deepLayer[j].y,
            opacity: (1 - d / maxDist) * 0.03
          });
        }
      }
    }
  }

  var scrollY = 0;
  window.addEventListener('scroll', function () { scrollY = window.pageYOffset; }, { passive: true });
  var frameCount = 0;

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    var parallax = scrollY * 0.1;
    frameCount++;

    // Spawn flash occasionally
    if (frameCount % 90 === 0) spawnFlash();
    // Update synapses every 30 frames
    if (frameCount % 30 === 0) updateSynapses();

    // Draw synapses
    for (var s = 0; s < synapses.length; s++) {
      var syn = synapses[s];
      ctx.beginPath();
      ctx.moveTo(syn.x1, syn.y1 - parallax);
      ctx.lineTo(syn.x2, syn.y2 - parallax);
      ctx.strokeStyle = 'rgba(255,87,90,' + syn.opacity + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Deep layer
    ctx.textBaseline = 'middle';
    for (var i = 0; i < deepLayer.length; i++) {
      var p = deepLayer[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; p.text = randomWord(layerWords.deep); }
      if (p.x < -100) p.x = w + 100;
      if (p.x > w + 100) p.x = -100;

      ctx.save();
      ctx.translate(p.x, (p.y - parallax * 0.5 + h) % h);
      ctx.rotate(p.rot);
      ctx.font = '300 ' + p.size + 'px Geist, monospace';
      ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }

    // Mid layer
    for (var m = 0; m < midLayer.length; m++) {
      var q = midLayer[m];
      q.x += q.vx;
      q.y += q.vy;
      if (q.y < -30) { q.y = h + 30; q.x = Math.random() * w; q.text = randomWord(layerWords.mid); }
      if (q.x < -200) q.x = w + 200;
      if (q.x > w + 200) q.x = -200;

      ctx.save();
      ctx.translate(q.x, (q.y - parallax * 0.3 + h) % h);
      ctx.rotate(q.rot);
      ctx.font = '200 ' + q.size + 'px Geist, monospace';
      ctx.fillStyle = 'rgba(255,255,255,' + q.opacity + ')';
      ctx.fillText(q.text, 0, 0);
      ctx.restore();
    }

    // Flash layer
    for (var f = flashLayer.length - 1; f >= 0; f--) {
      var fl = flashLayer[f];
      fl.life++;
      var progress = fl.life / fl.maxLife;
      // Fade in fast, hold, fade out
      if (progress < 0.15) fl.opacity = (progress / 0.15) * 0.07;
      else if (progress < 0.7) fl.opacity = 0.07;
      else fl.opacity = 0.07 * (1 - (progress - 0.7) / 0.3);

      if (fl.life >= fl.maxLife) { flashLayer.splice(f, 1); continue; }

      ctx.save();
      ctx.translate(fl.x, fl.y - parallax * 0.2);
      ctx.font = '100 ' + fl.size + 'px Geist, monospace';
      ctx.fillStyle = 'rgba(255,87,90,' + fl.opacity + ')';
      ctx.letterSpacing = '0.3em';
      ctx.fillText(fl.text, 0, 0);
      ctx.restore();
    }

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createDeep();
    createMid();
    flashLayer = [];
  }

  // Only run when visible
  var nwObs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      if (!running) { running = true; draw(); }
    } else {
      running = false;
      if (animId) cancelAnimationFrame(animId);
    }
  }, { threshold: 0 });
  nwObs.observe(canvas);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      init();
      if (canvas.getBoundingClientRect().bottom > 0) { running = true; draw(); }
    }, 250);
  });

  init();
})();

/* ── Hero Verb Cycle ───────────────────────────────── */
(function () {
  var el = document.getElementById('hero-verb-cycle');
  if (!el) return;
  var verbs = ['designs', 'builds', 'transforms', 'questions', 'creates', 'clarifies', 'strategizes', 'connects', 'reimagines'];
  var idx = 0;
  setInterval(function () {
    el.classList.add('out');
    setTimeout(function () {
      idx = (idx + 1) % verbs.length;
      el.textContent = verbs[idx];
      el.classList.remove('out');
    }, 400);
  }, 3000);
})();

/* ── Custom Cursor ─────────────────────────────────── */
(function () {
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  
  var mx = 0, my = 0, rx = 0, ry = 0;
  
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  
  var ringMoving = false;
  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    if (Math.abs(mx - rx) > 0.5 || Math.abs(my - ry) > 0.5) {
      requestAnimationFrame(animateRing);
    } else { ringMoving = false; }
  }
  document.addEventListener('mousemove', function () {
    if (!ringMoving) { ringMoving = true; requestAnimationFrame(animateRing); }
  });
  
  // Hover detection
  var hoverEls = 'a, button, .tl-point, .indicator, .contact-link, .gravity-item';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverEls)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverEls)) ring.classList.remove('hover');
  });
})();

/* ── Starfield Background ─────────────────────────── */
(function () {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars, animId;
  const STAR_COUNT = 200;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight * 3;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        baseO: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.008 + 0.003,
      });
    }
  }

  let scrollY = 0;
  window.addEventListener('scroll', function () {
    scrollY = window.pageYOffset;
  });

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    const parallax = scrollY * 0.15;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = Math.sin(time * s.speed + s.phase) * 0.3 + 0.7;
      const opacity = s.baseO * twinkle;
      const y = (s.y - parallax + h) % h;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  var starfieldRunning = false;
  function startStarfield() {
    if (starfieldRunning) return;
    starfieldRunning = true;
    draw(0);
  }
  function stopStarfield() {
    starfieldRunning = false;
    cancelAnimationFrame(animId);
  }

  function init() {
    resize();
    createStars();
  }

  // Only animate when visible
  var sfObs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) startStarfield(); else stopStarfield();
  }, { threshold: 0 });
  sfObs.observe(canvas);

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      stopStarfield();
      init();
      if (canvas.getBoundingClientRect().bottom > 0) startStarfield();
    }, 250);
  });

  init();
  startStarfield();
})();

/* ── Noise → Order Particle Animation ─────────────── */
(function () {
  const canvas = document.getElementById('noise-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('signal');
  const wordNoise = document.getElementById('word-noise');
  const wordDirection = document.getElementById('word-direction');
  
  const PARTICLE_COUNT = 500;
  const ACCENT = [255, 87, 90]; // #FF575A
  const GRID_COLS = 25;
  const GRID_ROWS = 20;
  
  let w, h, particles, phase, phaseTimer, animId, isVisible = false;
  let gridOpacity = 0; // for grid lines fade-in
  
  phase = 'noise';
  
  function resize() {
    const rect = section.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }
  
  function createParticles() {
    particles = [];
    const spacingX = w / (GRID_COLS + 1);
    const spacingY = h / (GRID_ROWS + 1);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const gridIdx = i % (GRID_COLS * GRID_ROWS);
      const col = gridIdx % GRID_COLS;
      const row = Math.floor(gridIdx / GRID_COLS);
      
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        targetX: spacingX * (col + 1),
        targetY: spacingY * (row + 1),
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        r: Math.random() * 1.8 + 0.4,
        baseO: Math.random() * 0.35 + 0.1,
      });
    }
  }
  
  function drawGridLines(opacity) {
    if (opacity <= 0) return;
    const spacingX = w / (GRID_COLS + 1);
    const spacingY = h / (GRID_ROWS + 1);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (opacity * 0.04) + ')';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let c = 1; c <= GRID_COLS; c++) {
      const x = spacingX * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Horizontal lines
    for (let r = 1; r <= GRID_ROWS; r++) {
      const y = spacingY * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
  
  function setPhase(newPhase) {
    phase = newPhase;
    clearTimeout(phaseTimer);
    
    if (newPhase === 'noise') {
      wordNoise.classList.add('active');
      wordDirection.classList.remove('active');
      particles.forEach(function (p) {
        p.vx = (Math.random() - 0.5) * 8;
        p.vy = (Math.random() - 0.5) * 8;
      });
      phaseTimer = setTimeout(function () { setPhase('ordering'); }, 3500);
    } else if (newPhase === 'ordering') {
      phaseTimer = setTimeout(function () { setPhase('ordered'); }, 3000);
    } else if (newPhase === 'ordered') {
      wordNoise.classList.remove('active');
      wordDirection.classList.add('active');
      phaseTimer = setTimeout(function () { setPhase('scattering'); }, 3000);
    } else if (newPhase === 'scattering') {
      wordDirection.classList.remove('active');
      particles.forEach(function (p) {
        p.vx = (Math.random() - 0.5) * 10;
        p.vy = (Math.random() - 0.5) * 10;
      });
      phaseTimer = setTimeout(function () { setPhase('noise'); }, 800);
    }
  }
  
  function draw() {
    ctx.clearRect(0, 0, w, h);
    
    // Grid opacity target
    const gridTarget = (phase === 'ordering' || phase === 'ordered') ? 1 : 0;
    gridOpacity += (gridTarget - gridOpacity) * 0.03;
    drawGridLines(gridOpacity);
    
    // Calculate global order level for this frame
    let totalOrder = 0;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      if (phase === 'noise' || phase === 'scattering') {
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.5;
        p.vy += (Math.random() - 0.5) * 0.5;
        p.vx *= 0.97;
        p.vy *= 0.97;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      } else if (phase === 'ordering' || phase === 'ordered') {
        const ease = phase === 'ordering' ? 0.035 : 0.1;
        p.x += (p.targetX - p.x) * ease;
        p.y += (p.targetY - p.y) * ease;
      }
      
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(w * w + h * h) * 0.25;
      const order = 1 - Math.min(dist / maxDist, 1);
      totalOrder += order;
      
      // Noise = bright white scattered, Order = light gray on grid
      const grey = Math.round(180 + 75 * (1 - order));
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + grey + ',' + grey + ',' + grey + ',' + (p.baseO * 0.7) + ')';
      ctx.fill();
    }
    
    if (isVisible) {
      animId = requestAnimationFrame(draw);
    }
  }
  
  const sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        resize();
        createParticles();
        setPhase('noise');
        draw();
      } else if (!entry.isIntersecting && isVisible) {
        isVisible = false;
        clearTimeout(phaseTimer);
        cancelAnimationFrame(animId);
        wordNoise.classList.remove('active');
        wordDirection.classList.remove('active');
      }
    });
  }, { threshold: 0.3 });
  
  sectionObs.observe(section);
  
  window.addEventListener('resize', function () {
    if (isVisible) {
      resize();
      const spacingX = w / (GRID_COLS + 1);
      const spacingY = h / (GRID_ROWS + 1);
      particles.forEach(function (p, i) {
        const gridIdx = i % (GRID_COLS * GRID_ROWS);
        p.targetX = spacingX * (gridIdx % GRID_COLS + 1);
        p.targetY = spacingY * (Math.floor(gridIdx / GRID_COLS) + 1);
      });
    }
  });
})();

/* ── Letter-by-Letter Animation Setup ─────────────── */
(function () {
  document.querySelectorAll('.letter-animate').forEach(function (el) {
    const spans = el.querySelectorAll('span');
    if (spans.length > 0) {
      // Multi-span (like hero name)
      spans.forEach(function (span) {
        const text = span.textContent;
        span.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
          const letter = document.createElement('span');
          letter.className = 'letter';
          letter.textContent = text[i] === ' ' ? '\u00A0' : text[i];
          letter.style.transitionDelay = (i * 0.06) + 's';
          span.appendChild(letter);
        }
      });
    } else {
      // Single text node
      const text = el.textContent;
      el.innerHTML = '';
      let delay = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') continue;
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        letter.style.transitionDelay = (delay * 0.04) + 's';
        el.appendChild(letter);
        delay++;
      }
    }
  });
})();

/* ── Typewriter Effect ────────────────────────────── */
(function () {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;
  const fullText = el.textContent;
  el.textContent = '';
  el.classList.add('typewriter');
  let started = false;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        el.classList.add('typing');
        let i = 0;
        function type() {
          if (i < fullText.length) {
            el.textContent += fullText.charAt(i);
            el.style.width = 'auto';
            i++;
            setTimeout(type, 55 + Math.random() * 40);
          } else {
            // Stop caret blink after done
            setTimeout(function () {
              el.style.borderRight = 'none';
            }, 2000);
          }
        }
        setTimeout(type, 800);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(el);
})();

/* ── Scroll Reveal with Stagger ───────────────────── */
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const parent = entry.target.closest('.scene') || entry.target.parentElement;
          const siblings = Array.from(parent.querySelectorAll('.reveal'));
          var index = siblings.indexOf(entry.target);
          if (index < 0) index = 0;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, index * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ── Section Indicator Tracking ───────────────────── */
(function () {
  var indicators = document.querySelectorAll('.indicator');
  var scenes = document.querySelectorAll('.scene');
  var nav = document.getElementById('nav');

  if (!scenes.length || !indicators.length) return;

  var sceneObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Array.from(scenes).indexOf(entry.target);
          indicators.forEach(function (ind, i) {
            if (i === idx) {
              ind.classList.add('active');
            } else {
              ind.classList.remove('active');
            }
          });

          if (idx > 0) {
            nav.classList.add('visible');
          } else {
            nav.classList.remove('visible');
          }
        }
      });
    },
    { threshold: 0.4 }
  );

  scenes.forEach(function (scene) {
    sceneObserver.observe(scene);
  });
})();

/* ── Video Bokeh Reveal on Scroll ──────────────────── */
(function () {
  const videoBgs = document.querySelectorAll('.video-bg');
  if (!videoBgs.length) return;
  
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // Find the video-bg inside the observed scene
      var vbg = entry.target.querySelector('.video-bg');
      if (!vbg) return;
      if (entry.isIntersecting) {
        vbg.classList.add('visible');
      } else {
        vbg.classList.remove('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  
  videoBgs.forEach(function (bg) {
    var scene = bg.closest('.scene');
    if (scene) observer.observe(scene);
  });
})();

/* ── HUD Interactive Timeline ─────────────────────── */
(function () {
  var container = document.getElementById('tl-points');
  var canvas = document.getElementById('tl-mountain');
  var track = container ? container.parentElement : null;
  var detailPanel = document.getElementById('tl-detail');
  var detailYear = document.getElementById('tl-detail-year');
  var detailTag = document.getElementById('tl-detail-tag');
  var detailText = document.getElementById('tl-detail-text');
  var detailMeta = document.getElementById('tl-detail-meta');
  var hudEl = container ? container.closest('.tl-hud') : null;
  if (!container || !canvas) return;

  var ctx = canvas.getContext('2d');
  var data = [
    { year: '2000', tag: 'ORIGIN', major: true, density: 1,
      text: 'First contact with digital systems. Media technology, code, and the question of how technology shapes perception.',
      meta: 'MEDIA TECHNOLOGY · DIGITAL SYSTEMS' },
    { year: '2001', tag: 'CRAFT', major: true, density: 3,
      text: 'Learning the craft in Frankfurt. Corporate design systems, interface design, screen layouts. Building digital things that work — before broadband was standard.',
      meta: 'INTERFACE DESIGN · CORPORATE SYSTEMS · IHK' },
    { year: '2004', tag: 'FIRST CLIENTS', density: 2,
      text: 'First own clients. Corporate design, web, image film, viral marketing. The beginning of translating business needs into visual systems.',
      meta: 'CORPORATE DESIGN · WEB · FREELANCE' },
    { year: '2006', tag: 'EXPANSION', major: true, density: 5,
      text: 'Rapid growth across industries. Parallel: studying Communication Science. Media sociology, interactive media, international media systems. The lens widened from craft to theory.',
      meta: 'COMMUNICATION SCIENCE · EXPANSION · THEORY' },
    { year: '2007', tag: 'GLOBAL', density: 4,
      text: 'International projects and presentations. Cross-border communication, event documentation, rhetoric training. Understanding how messages move across cultures.',
      meta: 'INTERNATIONAL · RHETORIC · CROSS-CULTURAL' },
    { year: '2008', tag: 'RESEARCH', density: 4,
      text: 'Academic research into media and public discourse. Board membership in regional media networks. The intersection of theory and practice deepened.',
      meta: 'MEDIA RESEARCH · BOARD MEMBER · DISCOURSE' },
    { year: '2009', tag: 'B.A.', major: true, density: 3,
      text: 'Bachelor of Arts in Communication Science. The lens widened permanently: from craft to communication systems. Self-employed full-time. The practice begins.',
      meta: 'B.A. COMMUNICATION · SELF-EMPLOYED' },
    { year: '2010', tag: 'BUILDING', density: 6,
      text: 'Building the practice. Brand strategy and media design across industries — construction, tourism, food, insurance, healthcare. ~20 projects per year. Same core question: how do you make the invisible visible?',
      meta: '~20 PROJECTS P.A. · MULTI-INDUSTRY · KMU' },
    { year: '2014', tag: 'CONSULTING', major: true, density: 7,
      text: 'Consulting practice founded. Not just strategy decks — real structural change. Marketing process overhauls, market positioning, online strategy. Implementation over theory.',
      meta: 'CONSULTING · IMPLEMENTATION · STRUCTURAL CHANGE' },
    { year: '2015', tag: 'DEEPENING', density: 5,
      text: 'Deeper strategic work. Revamping sales dimensions, unified communication strategies, brand integration into tourism marketing. Every engagement more systemic than the last.',
      meta: 'BRAND STRATEGY · SALES · TOURISM MARKETING' },
    { year: '2016', tag: 'DIGITAL MARKETS', density: 5,
      text: 'Digital market penetration. E-commerce platforms, international supplier integration, Leitbild development, corporate culture transformation. Digital as enabler, not endpoint.',
      meta: 'E-COMMERCE · DIGITAL TRANSFORMATION · CULTURE' },
    { year: '2017', tag: 'PROCESS ERA', major: true, density: 8,
      text: 'The deepest work yet. Personnel management, knowledge systems, organizational restructuring, mediation between leadership levels. Conflict resolution. Anonymous employee surveys turned into real change.',
      meta: 'PROCESS CONSULTING · MEDIATION · ORG DEVELOPMENT' },
    { year: '2018', tag: 'STARTUP', density: 4,
      text: 'Startup consulting from zero. Brand strategy and business development for new ventures. Meanwhile: enterprise-level clients entered the portfolio. Scale shifted upward.',
      meta: 'STARTUP · ENTERPRISE · SCALE SHIFT' },
    { year: '2019', tag: 'M.A.', major: true, density: 5,
      text: 'Back to university — Future Design. Innovation theory, ethics and values, organizational development, leadership, digital business management. How do you design futures, not just products?',
      meta: 'FUTURE DESIGN · INNOVATION · LEADERSHIP' },
    { year: '2020', tag: 'CRISIS', density: 4,
      text: 'Crisis consulting under pressure. Rapid business model pivots, workforce communication, survival strategies. Speed consulting when every week counts.',
      meta: 'CRISIS · RAPID RESPONSE · BUSINESS PIVOTS' },
    { year: '2021', tag: 'OVERHAUL', density: 5,
      text: 'Full marketing overhauls. IST-analysis, brand repositioning, target group redefinition, Leitbild development, budget planning, implementation roadmaps. Structure from chaos.',
      meta: 'REPOSITIONING · LEITBILD · IMPLEMENTATION' },
    { year: '2022', tag: 'M.A. + ENTERPRISE', major: true, density: 6,
      text: 'Master of Arts in Future Design. Enterprise digitalization consulting — supply chain compliance, software evaluation, integration architecture. Where strategy meets systems at scale.',
      meta: 'M.A. FUTURE DESIGN · DIGITALIZATION · ENTERPRISE' },
    { year: '2023', tag: 'SYNTHESIS', major: true, density: 9,
      text: 'Everything converges. Agency leadership, strategic consulting, startup founding. AI integration, future systems, signal engineering. Two decades compressed into one question: What\'s the real problem — and what would clarity look like?',
      meta: 'AGENCY · CONSULTING · STARTUP · AI · CONVERGENCE' },
    { year: '2024', tag: 'TRANSFORMATION', major: true, density: 8,
      text: 'Digital transformation at enterprise scale. Communication architecture, brand strategy, growth frameworks. Managing multi-year transitions while building new structures from within.',
      meta: 'ENTERPRISE · TRANSFORMATION · ARCHITECTURE' },
    { year: '2025', tag: 'FUTURE SYSTEMS', major: true, density: 10,
      text: 'AI-native work. Building with AI as thinking partner, not tool. Every workflow reimagined. Every assumption questioned. New ventures scaling internationally. The seed became the system.',
      meta: 'AI-NATIVE · INTERNATIONAL · FUTURE SYSTEMS' },
    { year: '2026', tag: 'AI TRANSFORMATION', major: true, density: 10,
      text: 'The age of agents. AI systems that reason, decide, and execute — not just assist. Autonomous workflows replacing manual processes. Every organization forced to rethink what humans do vs. what machines handle. Strategy becomes architecture. The transformation is no longer coming — it\'s here.',
      meta: 'AI AGENTS · AUTONOMOUS SYSTEMS · TRANSFORMATION · NOW' }
  ];

  var activeIdx = data.length - 1;
  var detailVisible = false;
  var glowPhase = 0;
  var glowAnimId = null;

  // Render timeline points
  function renderPoints() {
    container.innerHTML = '';
    data.forEach(function (d, i) {
      var pct = (i / (data.length - 1)) * 100;
      var el = document.createElement('div');
      el.className = 'tl-point' + (d.major ? ' major' : '') + (i === activeIdx ? ' active' : '');
      el.style.left = pct + '%';
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', d.year + ' — ' + d.tag);
      el.innerHTML = '<span class="tl-point-year">' + d.year + '</span>' +
        '<div class="tl-point-dot"></div>' +
        '<span class="tl-point-label">' + d.tag + '</span>';
      // click kept as fallback for mobile tap
      el.addEventListener('click', function (e) { e.stopPropagation(); setActive(i); });
      container.appendChild(el);
    });
  }

  function setActive(idx) {
    if (idx < 0) idx = 0;
    if (idx >= data.length) idx = data.length - 1;
    var changing = idx !== activeIdx;
    activeIdx = idx;
    var d = data[idx];

    // Update points
    var points = container.querySelectorAll('.tl-point');
    points.forEach(function (p, i) {
      if (i === idx) p.classList.add('active');
      else p.classList.remove('active');
    });

    // Typewriter for year + text
    if (window._detailTypeTimer) clearTimeout(window._detailTypeTimer);
    if (window._yearTypeTimer) clearTimeout(window._yearTypeTimer);
    
    // Year typewriter
    var yearStr = '◈ ' + d.year + ' — ' + d.tag;
    var yIdx = 0;
    detailYear.textContent = '';
    detailTag.textContent = '';
    detailMeta.textContent = d.meta;
    detailText.textContent = '';
    
    function yearType() {
      if (yIdx <= yearStr.length) {
        detailYear.textContent = yearStr.slice(0, yIdx) + '█';
        yIdx++;
        window._yearTypeTimer = setTimeout(yearType, 30);
      } else {
        detailYear.textContent = yearStr;
        // Then type the description
        var dtFullText = d.text;
        var dtIdx = 0;
        function dtType() {
          if (dtIdx <= dtFullText.length) {
            detailText.textContent = dtFullText.slice(0, dtIdx) + '█';
            dtIdx++;
            window._detailTypeTimer = setTimeout(dtType, 8);
          } else {
            detailText.textContent = dtFullText;
          }
        }
        dtType();
      }
    }
    yearType();
    showMilestones(d.year);

    // Update mobile detail panel
    var mYear = document.getElementById('tl-mobile-year');
    var mTag = document.getElementById('tl-mobile-tag');
    var mText = document.getElementById('tl-mobile-text');
    var mMeta = document.getElementById('tl-mobile-meta');
    if (mYear) {
      mYear.textContent = '◈ ' + d.year + ' — ' + d.tag;
      mTag.textContent = '';
      mText.textContent = d.text;
      mMeta.textContent = d.meta;
    }

    // Mobile: scroll timeline into view on first tap
    if (changing && window.innerWidth <= 900) {
      var tlEl = document.getElementById('tl-interactive');
      if (tlEl) {
        var nav = document.querySelector('.mobile-nav');
        var navH = nav ? nav.offsetHeight : 0;
        var rect = tlEl.getBoundingClientRect();
        var targetY = window.scrollY + rect.bottom - window.innerHeight + navH + 20;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }

    // Redraw mountain with animated glow
    startGlowAnimation(idx);
  }

  // Animated glow on mountain
  function startGlowAnimation(highlightIdx) {
    if (glowAnimId) cancelAnimationFrame(glowAnimId);
    glowPhase = 0;
    function animateGlow() {
      glowPhase += 0.03;
      drawMountain(highlightIdx, glowPhase);
      if (glowPhase < Math.PI * 4) {
        glowAnimId = requestAnimationFrame(animateGlow);
      }
    }
    animateGlow();
  }

  // Draw data mountain
  function drawMountain(highlightIdx, phase) {
    var w = canvas.width = canvas.offsetWidth * 2;
    var h = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, w, h);
    if (typeof phase === 'undefined') phase = 0;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (var gy = 0; gy < h; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
    for (var gx = 0; gx < w; gx += Math.floor(w / data.length)) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }

    // Mountain shape
    var points = [];
    var maxDensity = 10;
    for (var i = 0; i < data.length; i++) {
      var x = (i / (data.length - 1)) * w;
      var peakH = (data[i].density / maxDensity) * (h * 0.85);
      points.push({ x: x, y: h - peakH });
    }

    // Draw filled mountain
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var j = 0; j < points.length; j++) {
      if (j === 0) {
        ctx.lineTo(points[j].x, points[j].y);
      } else {
        var cx = (points[j - 1].x + points[j].x) / 2;
        ctx.quadraticCurveTo(points[j - 1].x + (cx - points[j - 1].x) * 0.5, points[j - 1].y,
          cx, (points[j - 1].y + points[j].y) / 2);
        ctx.quadraticCurveTo(points[j].x - (points[j].x - cx) * 0.5, points[j].y,
          points[j].x, points[j].y);
      }
    }
    ctx.lineTo(w, h);
    ctx.closePath();

    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255,87,90,0.12)');
    grad.addColorStop(1, 'rgba(255,87,90,0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Mountain outline
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var k = 1; k < points.length; k++) {
      var cx2 = (points[k - 1].x + points[k].x) / 2;
      ctx.quadraticCurveTo(points[k - 1].x + (cx2 - points[k - 1].x) * 0.5, points[k - 1].y,
        cx2, (points[k - 1].y + points[k].y) / 2);
      ctx.quadraticCurveTo(points[k].x - (points[k].x - cx2) * 0.5, points[k].y,
        points[k].x, points[k].y);
    }
    ctx.strokeStyle = 'rgba(255,87,90,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Highlight active point with glowing vertical line
    if (highlightIdx !== undefined && points[highlightIdx]) {
      var hp = points[highlightIdx];
      var pulse = 0.5 + Math.sin(phase) * 0.3;

      // Glowing vertical line — solid, with glow
      ctx.save();
      ctx.shadowColor = 'rgba(255,87,90,' + (0.6 * pulse) + ')';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(hp.x, 0);
      ctx.lineTo(hp.x, h);
      ctx.strokeStyle = 'rgba(255,87,90,' + (0.35 * pulse) + ')';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // Second pass: brighter core line
      ctx.beginPath();
      ctx.moveTo(hp.x, hp.y);
      ctx.lineTo(hp.x, h);
      ctx.strokeStyle = 'rgba(255,87,90,' + (0.5 + pulse * 0.3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing dot
      ctx.save();
      ctx.shadowColor = 'rgba(255,87,90,0.8)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 5 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,87,90,' + (0.7 + pulse * 0.3) + ')';
      ctx.fill();
      ctx.restore();

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 10 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,87,90,' + (0.15 * pulse) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Data label
      ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + pulse * 0.15) + ')';
      ctx.font = '16px Geist, monospace';
      ctx.fillText(data[highlightIdx].density + 'x', hp.x + 14, hp.y - 8);
    }

    // Scatter particles on mountain surface
    for (var p = 0; p < points.length; p++) {
      var pp = points[p];
      for (var s = 0; s < data[p].density; s++) {
        var px = pp.x + (Math.random() - 0.5) * (w / data.length) * 0.6;
        var py = pp.y + Math.random() * (h - pp.y) * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.15 + 0.05) + ')';
        ctx.fill();
      }
    }
  }

  // SCRUBBER: mousemove over track selects nearest point
  function findNearest(clientX) {
    var rect = track.getBoundingClientRect();
    var pct = (clientX - rect.left) / rect.width;
    var nearest = 0, nearestDist = Infinity;
    for (var i = 0; i < data.length; i++) {
      var d = Math.abs(pct - i / (data.length - 1));
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    }
    return nearest;
  }
  track.addEventListener('mousemove', function (e) {
    setActive(findNearest(e.clientX));
  });
  track.addEventListener('click', function (e) {
    setActive(findNearest(e.clientX));
  });

  // KEYBOARD NAVIGATION
  if (hudEl) {
    hudEl.setAttribute('tabindex', '0');
    hudEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIdx - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIdx + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActive(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActive(data.length - 1);
      }
    });
  }

  renderPoints();
  setActive(activeIdx);

  // Mouse crosshair on mountain canvas
  var mouseX = -1;
  var crosshairRunning = false;
  
  canvas.style.pointerEvents = 'auto';
  canvas.style.cursor = 'none';

  // Background year + milestones
  var bgYear = document.getElementById('tl-bg-year');
  var milestonesEl = document.getElementById('tl-milestones');
  var globalEvents = {
    '2000': ['Dot-Com Bubble Peaks', 'USB Flash Drives', 'PlayStation 2', 'First Camera Phones', 'Napster Disrupts Music', 'Human Genome Draft', 'AOL Time Warner Merger', 'ADSL Broadband', 'Palm Pilot Era', 'Y2K Survived'],
    '2001': ['Wikipedia Launches', 'iPod Released', 'Windows XP', 'Enron Collapse', '.com Crash', 'First Space Tourist', 'iTunes Store', 'Xbox Launch', 'Segway Unveiled', 'Bluetooth Mainstream'],
    '2004': ['Facebook Founded', 'Gmail Launches', 'Firefox 1.0', 'Google IPO', 'Flickr Launches', 'Skype Growth', 'SpaceShipOne', 'RSS Feeds Boom', 'Web 2.0 Era', 'Podcasting Born'],
    '2006': ['Twitter Launches', 'Google Buys YouTube', 'AWS Cloud Launch', 'Nintendo Wii', 'Blu-ray Released', 'Wikileaks Founded', 'Core 2 Duo CPUs', 'HD Video Mainstream', 'MySpace Peak', 'Ruby on Rails'],
    '2007': ['iPhone Released', 'Kindle Launched', 'Spotify Founded', 'Android Announced', 'Dropbox Founded', 'Subprime Crisis', 'Netflix Streaming', 'Git Mainstream', 'Cloud Computing Rise', 'Mobile Web Era'],
    '2008': ['Lehman Collapse', 'Global Recession', 'Airbnb Founded', 'Bitcoin Whitepaper', 'Chrome Browser', 'App Store Launch', 'Spotify Launches', 'GitHub Founded', 'Android First Phone', 'Tesla Roadster Ships'],
    '2009': ['Uber Founded', 'WhatsApp Launches', 'Bitcoin Network Live', 'Kickstarter Launches', 'Windows 7', '4G Networks', 'Square Founded', 'SaaS Boom', 'Node.js Released', 'Real-Time Web'],
    '2010': ['iPad Released', 'Instagram Launches', 'Pinterest Launches', 'Nest Founded', 'Tesla IPO', '4G Mainstream', 'Responsive Design', 'Cloud-First Strategy', 'Stuxnet Worm', 'Angular.js Era'],
    '2014': ['Amazon Echo Released', 'Alibaba IPO Record', 'Apple Pay Launch', 'Docker Containers', 'Stripe $3.5B', 'Swift Language', 'React.js Adoption', 'Microservices Rise', 'Uber $40B', 'Smartwatch Era'],
    '2015': ['SpaceX First Landing', 'Apple Watch Ships', 'Kubernetes 1.0', 'TensorFlow Open Source', 'Windows 10', 'GraphQL Released', 'Slack $2.8B', 'Serverless Computing', 'Paris Climate Deal', 'VW Dieselgate'],
    '2016': ['AlphaGo Beats Human', 'Tesla Autopilot', 'SpaceX Sea Landing', 'Pokémon Go AR', 'AirPods Released', 'Crypto Boom Begins', 'VR Headsets Ship', 'Progressive Web Apps', 'Edge Computing', 'Chatbot Hype'],
    '2017': ['Bitcoin Hits $20K', 'Transformer Paper', 'iPhone X Face ID', 'Ethereum Smart Contracts', 'Waymo Self-Driving', 'Figma Growth', 'Kotlin Official', 'ICO Boom', 'TensorFlow 2.0', 'Serverless Scale'],
    '2018': ['GDPR Takes Effect', 'GPT-1 Released', 'Crypto Winter', 'Zoom Growth Begins', '5G Trials Begin', 'Notion Breakout', 'TypeScript Adoption', 'Low-Code Platforms', 'Mars InSight Lands', 'Fortnite $3B'],
    '2019': ['5G Networks Launch', 'GPT-2 Released', 'Starlink Satellites', 'Quantum Supremacy', 'Disney+ Launches', 'Edge Computing Growth', 'Remote Tools Surge', 'JAMstack Movement', 'No-Code Boom', 'Libra Announced'],
    '2020': ['Remote Work Standard', 'SpaceX Crew Dragon', 'mRNA Vaccine Tech', 'GPT-3 Released', 'Apple M1 Chip', 'Zoom Becomes Standard', 'EV Push Accelerates', 'Digital Transformation', 'Robinhood Surge', 'TikTok Boom'],
    '2021': ['NFT Boom', 'Facebook to Meta', 'Crypto $3T Cap', 'GitHub Copilot', 'DALL-E Announced', 'Rivian IPO', 'Web3 Hype', 'Chip Shortage', 'Supply Chain Crisis', 'Creator Economy'],
    '2022': ['ChatGPT Released', 'James Webb Telescope', 'FTX Collapse', 'Stable Diffusion', 'Fusion Breakthrough', 'Midjourney Art', 'DALL-E 2 Public', 'Interest Rate Shock', 'Musk Buys Twitter', 'Inflation Surge'],
    '2023': ['GPT-4 Launches', 'AI Arms Race', 'Claude Released', 'SVB Bank Collapse', 'Open Source LLMs', 'AI Coding Assistants', 'Vision Pro Announced', 'AI Regulation Debate', 'Threads Launch', 'Altman Drama'],
    '2024': ['AI Agents Era', 'Sora Video AI', 'Neuralink Patient', 'EU AI Act', 'Claude 3 Opus', 'Apple Intelligence', 'Humanoid Robots', 'AI Energy Demands', 'Sovereign AI', 'Gemini Ultra'],
    '2025': ['AI-Native Workflows', 'DeepSeek Disruption', 'Quantum Leap', 'Humanoid Robots Ship', 'Digital Euro Pilot', 'Fusion Progress', 'Post-AI Economy', 'Starship Mars Prep', 'AGI Debate', 'Autonomous Scale'],
    '2026': ['AI Agents Mainstream', 'Autonomous Workflows', 'Claude Opus 4', 'Enterprise AI Adoption', 'Agent-to-Agent Protocols', 'AI Regulation Wave', 'Coding Agents Standard', 'Voice AI Everywhere', 'Agentic Economy', 'Human-AI Co-Leadership']
  };

  var currentMilestones = [];
  function showMilestones(year) {
    // big bg year removed
    if (!milestonesEl) return;
    milestonesEl.classList.add('visible');
    // Clear old
    currentMilestones.forEach(function (el) { el.classList.remove('visible'); });
    setTimeout(function () {
      milestonesEl.innerHTML = '';
      var events = globalEvents[year] || [];
      currentMilestones = [];
      events.forEach(function (evt, i) {
        var el = document.createElement('div');
        el.className = 'tl-milestone';
        el.textContent = evt;
        var sizes = [0.7, 0.9, 1.1, 1.4, 1.8, 2.2, 0.8, 1.0, 1.3, 1.6];
        el.style.fontSize = sizes[i % sizes.length] + 'rem';
        el.style.top = (8 + Math.random() * 75) + '%';
        el.style.left = (3 + Math.random() * 85) + '%';
        el.style.transform = 'rotate(' + (Math.random() * 6 - 3) + 'deg)';
        milestonesEl.appendChild(el);
        currentMilestones.push(el);
        el.style.setProperty('--pulse-delay', (Math.random() * 4) + 's');
        setTimeout(function () { el.classList.add('visible'); }, 80 * i);
      });
    }, 200);
  }

  function hideMilestones() {
    // bg year hidden
    if (milestonesEl) milestonesEl.classList.remove('visible');
    currentMilestones.forEach(function (el) { el.classList.remove('visible'); });
  }

  // Detail panel follows cursor
  var dpX = 0, dpY = 0, dpTX = 0, dpTY = 0, dpActive = false, dpRunning = false;
  function dpLoop() {
    if (dpActive) {
      dpX += (dpTX - dpX) * 0.12;
      dpY += (dpTY - dpY) * 0.12;
      detailPanel.style.left = Math.round(dpX) + 'px';
      detailPanel.style.top = Math.round(dpY) + 'px';
      if (Math.abs(dpTX - dpX) > 0.5 || Math.abs(dpTY - dpY) > 0.5) {
        requestAnimationFrame(dpLoop);
      } else { dpRunning = false; }
    } else { dpRunning = false; }
  }
  function startDpLoop() {
    if (!dpRunning) { dpRunning = true; requestAnimationFrame(dpLoop); }
  }

  var interactive = document.querySelector('.tl-interactive');
  if (interactive) {
    interactive.addEventListener('mousemove', function (e) {
      var panelW = detailPanel.offsetWidth || 300;
      var flipped = e.clientX + panelW + 40 > window.innerWidth;
      dpTX = flipped ? e.clientX - panelW - 20 : e.clientX + 20;
      dpTY = e.clientY - 200;
      if (!dpActive) {
        dpX = dpTX; dpY = dpTY;
        detailPanel.style.left = dpX + 'px';
        detailPanel.style.top = dpY + 'px';
      }
      dpActive = true;
      startDpLoop();
      detailPanel.classList.add('visible');
    });
    interactive.addEventListener('mouseleave', function () {
      dpActive = false;
      detailPanel.classList.remove('visible');
      hideMilestones();
    });
  }
  
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    if (!crosshairRunning) { crosshairRunning = true; drawCrosshair(); }
  });
  
  canvas.addEventListener('mouseleave', function () {
    mouseX = -1;
    crosshairRunning = false;
    drawMountain(activeIdx, glowPhase);
  });
  
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    // Also update active point when scrubbing over chart
    var nearest = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1));
    nearest = Math.max(0, Math.min(data.length - 1, nearest));
    setActive(nearest);
    if (!crosshairRunning) { crosshairRunning = true; drawCrosshair(); }
  });
  
  function drawCrosshair() {
    if (mouseX < 0) { crosshairRunning = false; return; }
    drawMountain(activeIdx, glowPhase);
    
    var w = canvas.width, h = canvas.height;
    
    // Solid vertical crosshair line
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, h);
    ctx.strokeStyle = 'rgba(255,87,90,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    var pct = mouseX / w;
    var idx = pct * (data.length - 1);
    var lo = Math.floor(idx), hi = Math.min(lo + 1, data.length - 1);
    var t = idx - lo;
    var loY = h - (data[lo].density / 10) * (h * 0.85);
    var hiY = h - (data[hi].density / 10) * (h * 0.85);
    var crossY = loY + (hiY - loY) * t;
    
    ctx.beginPath();
    ctx.moveTo(0, crossY);
    ctx.lineTo(w, crossY);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(mouseX, crossY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,87,90,0.7)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mouseX, crossY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,87,90,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    var yearIdx = Math.round(pct * (data.length - 1));
    yearIdx = Math.max(0, Math.min(data.length - 1, yearIdx));
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '18px Geist, monospace';
    ctx.fillText(data[yearIdx].year, mouseX + 12, crossY - 12);
    
    var densityVal = (data[lo].density + (data[hi].density - data[lo].density) * t).toFixed(1);
    ctx.fillStyle = 'rgba(255,87,90,0.4)';
    ctx.font = '14px Geist, monospace';
    ctx.fillText(densityVal + 'x', mouseX + 12, crossY + 20);
    
    requestAnimationFrame(drawCrosshair);
  }

  // Resize
  window.addEventListener('resize', function () {
    drawMountain(activeIdx, glowPhase);
    renderPoints();
  });
})();

/* ── Fixed BG Layer: crossfade on scroll ───────────── */
(function () {
  var items = document.querySelectorAll('.bg-layer-item');
  if (!items.length) return;
  
  // Map sections to bg items
  var bgMap = {};
  items.forEach(function (item) {
    bgMap[item.dataset.bgFor] = item;
  });
  
  var sections = document.querySelectorAll('.scene');
  var currentBg = null;
  
  // Pause ALL videos on init
  items.forEach(function (item) {
    var vid = item.querySelector('video');
    if (vid) { vid.pause(); vid.currentTime = 0; }
  });
  
  function updateBg() {
    var scrollY = window.scrollY + window.innerHeight * 0.4;
    var activeSectionId = null;
    
    sections.forEach(function (s) {
      if (s.offsetTop <= scrollY) {
        activeSectionId = s.id;
      }
    });
    
    // Find matching bg or fall back to hero
    var targetBg = bgMap[activeSectionId] || bgMap['hero'];
    
    if (targetBg !== currentBg) {
      // First: pause ALL videos
      items.forEach(function (item) {
        var vid = item.querySelector('video');
        if (vid) vid.pause();
        item.classList.remove('active');
      });
      // Then: play only the active one
      targetBg.classList.add('active');
      var activeVid = targetBg.querySelector('video');
      if (activeVid) activeVid.play();
      currentBg = targetBg;
    }
  }
  
  window.addEventListener('scroll', updateBg, { passive: true });
  updateBg();
})();

/* ── Side Data: Count-Up, Enterprise Cycle, Hover ──── */
(function () {
  // Count-up animation
  var countups = document.querySelectorAll('.tl-countup');
  var counted = false;
  function runCountup() {
    if (counted) return;
    counted = true;
    countups.forEach(function (el) {
      var target = parseInt(el.dataset.target);
      var suffix = el.dataset.suffix || '';
      var duration = 2000;
      var start = performance.now();
      function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  // Trigger when side-data visible
  var sideData = document.querySelector('.tl-side-data');
  if (sideData) {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCountup(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(sideData);
  }

  // Enterprise cycling
  var enterprises = ['BSH', 'febana group', 'MICROSTEP', 'Schaumberg Tierhygiene', 'Avenida-Therme'];
  var entEl = document.getElementById('tl-enterprise');
  if (entEl) {
    var entIdx = 0;
    setInterval(function () {
      entEl.style.opacity = '0';
      setTimeout(function () {
        entIdx = (entIdx + 1) % enterprises.length;
        entEl.textContent = enterprises[entIdx];
        entEl.style.opacity = '1';
      }, 400);
    }, 2500);
  }

  // HUD Hover Tooltip — follows cursor with typewriter
  var tooltip = document.getElementById('tl-hover-tooltip');
  var tooltipText = document.getElementById('tl-hover-text');
  if (!tooltip || !tooltipText) { console.log('tooltip not found'); return; }

  var items = document.querySelectorAll('.tl-side-item[data-hover]');
  var typeTimer = null;
  var fullText = '';
  var charIdx = 0;
  var ttX = 0, ttY = 0, ttTX = 0, ttTY = 0, ttActive = false, ttRunning = false;

  function ttLoop() {
    if (ttActive) {
      ttX += (ttTX - ttX) * 0.12;
      ttY += (ttTY - ttY) * 0.12;
      tooltip.style.left = Math.round(ttX) + 'px';
      tooltip.style.top = Math.round(ttY) + 'px';
      if (Math.abs(ttTX - ttX) > 0.5 || Math.abs(ttTY - ttY) > 0.5) {
        requestAnimationFrame(ttLoop);
      } else { ttRunning = false; }
    } else { ttRunning = false; }
  }
  function startTtLoop() {
    if (!ttRunning) { ttRunning = true; requestAnimationFrame(ttLoop); }
  }

  function typeWrite() {
    if (charIdx <= fullText.length) {
      tooltipText.textContent = fullText.slice(0, charIdx);
      charIdx++;
      typeTimer = setTimeout(typeWrite, 14);
    }
  }

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function (e) {
      clearTimeout(typeTimer);
      fullText = item.dataset.hover;
      charIdx = 0;
      tooltipText.textContent = '';
      ttTX = e.clientX + 20;
      ttTY = e.clientY;
      ttX = ttTX;
      ttY = ttTY;
      tooltip.style.left = Math.round(ttX) + 'px';
      tooltip.style.top = Math.round(ttY) + 'px';
      tooltip.classList.add('visible');
      ttActive = true;
      typeWrite();
    });
    item.addEventListener('mouseleave', function () {
      clearTimeout(typeTimer);
      tooltip.classList.remove('visible');
      ttActive = false;
      tooltipText.textContent = '';
    });
    item.addEventListener('mousemove', function (e) {
      ttTX = e.clientX + 20;
      ttTY = e.clientY;
      startTtLoop();
    });
  });
})();

/* ── Swipe Cards Navigation ────────────────────────── */
(function () {
  var track = document.getElementById('swipe-track');
  var dotsContainer = document.getElementById('swipe-dots');
  var prevBtn = document.getElementById('swipe-prev');
  var nextBtn = document.getElementById('swipe-next');
  if (!track || !dotsContainer) return;

  var cards = track.querySelectorAll('.swipe-card');
  var total = cards.length;
  var current = 0;

  // Generate dots
  var dots = [];
  for (var d = 0; d < total; d++) {
    var dot = document.createElement('div');
    dot.className = 'swipe-dot' + (d === 0 ? ' active' : '');
    dot.innerHTML = '<div class="swipe-dot-circle"></div><span class="swipe-dot-label">6.' + (d + 1) + '</span>';
    dot.dataset.idx = d;
    dot.addEventListener('click', (function (idx) {
      return function () {
        cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      };
    })(d));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function scrollToCard(idx) {
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Arrow buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', function () { scrollToCard(current - 1); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () { scrollToCard(current + 1); });
  }

  function updateActiveCard() {
    var trackRect = track.getBoundingClientRect();
    var center = trackRect.left + trackRect.width / 2;
    var closest = 0, closestDist = Infinity;
    cards.forEach(function (card, i) {
      var rect = card.getBoundingClientRect();
      var cardCenter = rect.left + rect.width / 2;
      var dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    current = closest;
    cards.forEach(function (card, i) {
      card.classList.toggle('active', i === closest);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === closest);
    });
  }

  track.addEventListener('scroll', updateActiveCard, { passive: true });
  updateActiveCard();
})();

/* ── Mobile Bottom Nav ─────────────────────────────── */
(function () {
  var mobileNav = document.getElementById('mobile-nav');
  if (!mobileNav) return;
  var shown = false;
  
  window.addEventListener('scroll', function () {
    if (window.scrollY > 200 && !shown) {
      mobileNav.classList.add('visible');
      shown = true;
    } else if (window.scrollY <= 200 && shown) {
      mobileNav.classList.remove('visible');
      shown = false;
    }
    
    // Update active item
    var sections = document.querySelectorAll('.scene');
    var scrollPos = window.scrollY + window.innerHeight * 0.5;
    var activeIdx = 0;
    sections.forEach(function (s, i) {
      if (s.offsetTop <= scrollPos) activeIdx = i;
    });
    mobileNav.querySelectorAll('.mobile-nav-item').forEach(function (item, i) {
      item.classList.toggle('active', i === activeIdx);
    });
  }, { passive: true });
})();

/* ── Smooth Anchor Scroll + URL Hash ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var href = this.getAttribute('href');
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    }
  });
});

// Jump to hash on page load
(function () {
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }
})();
