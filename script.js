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
  
  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
  
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

  function init() {
    resize();
    createStars();
    draw(0);
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      cancelAnimationFrame(animId);
      init();
    }, 250);
  });

  init();
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
      text: 'It started with pixels and curiosity. A semester of media technology at TU Ilmenau — first contact with digital systems, code, and the question of how technology shapes perception.',
      meta: 'TU ILMENAU · MEDIA TECHNOLOGY · 2 SEMESTERS' },
    { year: '2001', tag: 'CRAFT', major: true, density: 3,
      text: 'Apprenticeship at DiehlDesign in Frankfurt am Main. Building interfaces for Allianz Dresdner, ARD Sales & Services, IKW. Corporate design systems, screen layouts, Flash animations. Learning the craft of making digital things work — certified by IHK.',
      meta: 'DIEHLDESIGN GMBH · FRANKFURT · MEDIENGESTALTER · IHK 2003' },
    { year: '2004', tag: 'FIRST CLIENTS', density: 2,
      text: 'First own clients. BGM Bayerisches Gesundheitsmanagement: full corporate design, web, image film, viral marketing. EFBE Elektrogeräte: Flash microsites. VS Verlag: DVD production for Bundeskongress Soziale Arbeit.',
      meta: 'BGM · EFBE · VS VERLAG · FREELANCE LAUNCH' },
    { year: '2006', tag: 'EXPANSION', major: true, density: 5,
      text: 'Rapid expansion: Schauenburg Consulting, LASOTEC, Hotel Zum Steinhof, MBA FH Coburg website, Roland Berger recycling logo competition. Began studying Communication Science at Universität Erfurt. Media sociology, interactive media, international media systems.',
      meta: 'UNIVERSITÄT ERFURT · B.A. START · 8 NEW CLIENTS' },
    { year: '2007', tag: 'GLOBAL', density: 4,
      text: 'Global Communications Project — international PR with final presentation in Lisbon. Landrover Deutschland event documentation. CLIQS Switzerland: corporate design and product CD-ROM. Rhetoric seminars with Konrad Adenauer Stiftung.',
      meta: 'LISBON · LANDROVER · CLIQS CH · KAS SEMINAR' },
    { year: '2008', tag: 'RESEARCH', density: 4,
      text: 'Research group at Universität Erfurt studying local television and public discourse. Hanns-Seidel-Stiftung rhetoric seminar. Media sociology deep dive. Joined Mediencluster Thüringen board. Parallel: FINESTAS, H-S Feinblechbau, LANGGUTH management consulting.',
      meta: 'FORSCHUNGSGRUPPE · MEDIENCLUSTER TH · BOARD MEMBER' },
    { year: '2009', tag: 'B.A.', major: true, density: 3,
      text: 'Bachelor of Arts in Kommunikationswissenschaft, grade 1.7. AMBITON Leipzig — first post-degree project. The lens widened permanently: from craft to communication systems. Self-employed full-time. The practice begins.',
      meta: 'B.A. GRADE 1.7 · AMBITON LEIPZIG · SELF-EMPLOYED' },
    { year: '2010', tag: 'BUILDING', density: 6,
      text: 'Building the practice. Brand strategy and media design for KMU across Germany. Neumann Bauelemente, Beetz Bauelemente, Avenida Therme, Stausee Hohenfelden, Ziegler Käsespezialitäten, Malburg Versicherungen, Derma Cultura, PORR Deutschland, FK Funk. ~20 projects per year.',
      meta: '~20 PROJECTS P.A. · 9+ RETAINER CLIENTS · KMU FOCUS' },
    { year: '2014', tag: 'BRANDNEXT', major: true, density: 7,
      text: 'brandnext founded — consulting that thinks implementation. First clients: Ziegler Käse (complete marketing process overhaul), Solicity Energy (market positioning, online strategy). Not just strategy decks — real structural change.',
      meta: 'BRANDNEXT FOUNDED · ZIEGLER · SOLICITY · CONSULTING' },
    { year: '2015', tag: 'DEEPENING', density: 5,
      text: 'Polymer Engineering: revamping strategy with new sales dimensions. Optimum Steuerberatung: unified communication strategy. Avenida-Therme: brand strategy, integration of premium spa segment into tourism marketing.',
      meta: 'POLYMER ENG · OPTIMUM · AVENIDA THERME · STRATEGY' },
    { year: '2016', tag: 'DIGITAL MARKETS', density: 5,
      text: 'Digital market penetration: Beetz Bauelemente — e-commerce platform with industry interface and payment integration. Bergfeld & Söhne Kassel — Asian supplier integration, Leitbild development, corporate culture transformation.',
      meta: 'E-COMMERCE · BEETZ · BERGFELD · DIGITAL TRANSFORMATION' },
    { year: '2017', tag: 'PROCESS ERA', major: true, density: 8,
      text: 'The deepest work yet. Beetz: personnel management, knowledge systems, new org chart, Leitbild from employee survey, mediation between board and executives. Avenida: wellness restructuring. HEPALO: intercultural leadership, equality framework. Conflict resolution training.',
      meta: 'PROCESS CONSULTING · MEDIATION · LEITBILD · 3 ORGS' },
    { year: '2018', tag: 'STARTUP', density: 4,
      text: 'AMBULANTICA — nursing startup consulting. Thüringer Gründerpreis participant. Brand strategy and business development from zero. Meanwhile: enterprise clients growing — Barmenia, Nestlé, BSH. ~20 projects annually.',
      meta: 'AMBULANTICA · GRÜNDERPREIS · ENTERPRISE ENTRY' },
    { year: '2019', tag: 'M.A.', major: true, density: 5,
      text: 'Back to university — ZukunftsDesign at Hochschule Coburg. Innovation theory, ethics & values, organizational development, leadership, digital business management. How do you design futures, not just products?',
      meta: 'HOCHSCHULE COBURG · ZUKUNFTSDESIGN · M.A. START' },
    { year: '2020', tag: 'CRISIS', density: 4,
      text: 'BAFA Corona consulting: rapid crisis pivots. SAUNASHOW — complete business field change enabling survival. FRANZOSENLAGER — business expansion. SCHAUMBERG — workforce crisis communication. Speed consulting under pressure.',
      meta: 'BAFA · COVID RESPONSE · 3 CRISIS PIVOTS · RAPID' },
    { year: '2021', tag: 'OVERHAUL', density: 5,
      text: 'Full marketing overhauls: Trasela Logistik and Avenida-Therme. IST-analysis, brand repositioning, target group redefinition, Leitbild, online strategy, budget planning, implementation roadmaps. Structure from chaos.',
      meta: 'TRASELA · AVENIDA · FULL OVERHAUL · IMPLEMENTATION' },
    { year: '2022', tag: 'M.A. + ENTERPRISE', major: true, density: 6,
      text: 'Master of Arts ZukunftsDesign, grade 1.7. Heinz-Glas: digitalization consulting for Supply Chain Act (LkSG). SAP evaluation, software research across ecovadis, riskmethods, IntegrityNext. Preparing enterprise integration.',
      meta: 'M.A. 1.7 · HEINZ-GLAS · LKSG · SAP · ENTERPRISE' },
    { year: '2023', tag: 'SYNTHESIS', major: true, density: 9,
      text: 'Everything converges. brandmediale GmbH (Agency MD & Art Director), brandnext (Strategic Consulting), Smyvia (Dental tourism startup). AI integration, future systems, signal engineering. Two decades of pattern recognition compressed into one question: What\'s the real problem — and what would clarity look like?',
      meta: 'BRANDMEDIALE · BRANDNEXT · SMYVIA · AI · CONVERGENCE' },
    { year: '2024', tag: 'BSH TRANSFORMATION', major: true, density: 8,
      text: 'Deep inside BSH — 17 years of partnership reaching its most intensive phase. Digital transformation at scale: 500+ employees, solar energy, photovoltaic systems, storage solutions. Communication architecture, brand strategy, growth frameworks. Managing a multi-year transition while building new structures from within.',
      meta: 'BSH · 500+ EMPLOYEES · SOLAR/PV · 17 YRS PARTNERSHIP' },
    { year: '2025', tag: 'FUTURE SYSTEMS', major: true, density: 10,
      text: 'The year of AI-native work. BSH partnership entering managed transition. BÜCHEL emerging as next major client. Smyvia scaling dental tourism across DACH. Building with AI as co-pilot — not as tool, but as thinking partner. Every workflow reimagined. Every assumption questioned. The seed became the system.',
      meta: 'BSH TRANSITION · BÜCHEL · SMYVIA DACH · AI-NATIVE · NOW' }
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

    // Animate detail panel
    if (!detailVisible) {
      // First time: show panel
      detailPanel.style.display = 'block';
      detailYear.textContent = d.year;
      detailTag.textContent = d.tag;
      detailText.textContent = d.text;
      detailMeta.textContent = d.meta;
      // Force reflow then animate in
      void detailPanel.offsetHeight;
      detailPanel.classList.add('visible');
      detailVisible = true;
    } else if (changing) {
      // Cross-fade: briefly fade out, update, fade in
      detailPanel.classList.remove('visible');
      detailPanel.classList.add('updating');
      setTimeout(function () {
        detailYear.textContent = d.year;
        detailTag.textContent = d.tag;
        detailText.textContent = d.text;
        detailMeta.textContent = d.meta;
        detailPanel.classList.remove('updating');
        detailPanel.classList.add('visible');
      }, 180);
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
      if (glowPhase < Math.PI * 60) {
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

  // SCRUBBER: click anywhere on the track to find nearest point
  track.addEventListener('click', function (e) {
    var rect = track.getBoundingClientRect();
    var clickX = (e.clientX - rect.left) / rect.width;
    // Find nearest point
    var nearest = 0;
    var nearestDist = Infinity;
    for (var i = 0; i < data.length; i++) {
      var pct = i / (data.length - 1);
      var dist = Math.abs(clickX - pct);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }
    setActive(nearest);
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
  
  canvas.addEventListener('click', function (e) {
    var rect = canvas.getBoundingClientRect();
    var clickPct = (e.clientX - rect.left) / rect.width;
    var nearest = Math.round(clickPct * (data.length - 1));
    nearest = Math.max(0, Math.min(data.length - 1, nearest));
    setActive(nearest);
  });
  
  function drawCrosshair() {
    if (mouseX < 0) { crosshairRunning = false; return; }
    drawMountain(activeIdx, glowPhase);
    
    var w = canvas.width, h = canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, h);
    ctx.strokeStyle = 'rgba(255,87,90,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
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
      items.forEach(function (item) {
        var isTarget = item === targetBg;
        item.classList.toggle('active', isTarget);
        // Pause/play videos
        var vid = item.querySelector('video');
        if (vid) {
          if (isTarget) vid.play(); else vid.pause();
        }
      });
      currentBg = targetBg;
    }
  }
  
  window.addEventListener('scroll', updateBg, { passive: true });
  updateBg();
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
