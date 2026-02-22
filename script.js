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
  const ACCENT = [123, 140, 255];
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

/* ── Smooth Anchor Scroll ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
