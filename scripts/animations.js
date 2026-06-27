/* ============================================================
   animations.js — Portfolio Animation Engine
   Covers: Loader · Trailing Cursor · Touch Tap Ripple
           Hero Particles · Typed.js · Scroll Reveal
           Skill Stagger · Mobile Nav · Nav Scroll
   ============================================================ */

/* ─── 1. PAGE LOADER ─────────────────────────────────────── */
(function initLoader() {
  const loader  = document.getElementById('page-loader');
  if (!loader) return;

  document.body.style.overflow = 'hidden';

  const bar     = loader.querySelector('.loader-bar');
  const numEl   = document.getElementById('loader-num');
  let progress  = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 14 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
    }
    const p = Math.floor(progress);
    if (bar)   bar.style.width = p + '%';
    if (numEl) numEl.textContent = p;

    if (progress >= 100) {
      setTimeout(() => {
        loader.classList.add('loader-done');
        document.body.style.overflow = '';
        // Trigger hero entrance
        setTimeout(() => {
          document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => {
            el.classList.add('revealed');
          });
        }, 250);
      }, 480);
    }
  }, 80);
})();


/* ─── 2. TYPED.JS ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Typed !== 'undefined' && document.getElementById('element')) {
    new Typed('#element', {
      strings: ['modern web apps.', 'clean interfaces.', 'scalable backends.', 'seamless UX.'],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 2200,
      loop: true,
      smartBackspace: true,
    });
  }
});


/* ─── 3. TRAILING CURSOR (desktop only) ──────────────────── */
(function initTrailCursor() {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return; // skip on touch devices

  const container = document.getElementById('cursor-trail-container');
  if (!container) return;

  const TRAIL_COUNT = 14;
  const trail = [];

  // Create trail dots
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    // Scale and opacity decrease toward tail
    const scale = 1 - (i / TRAIL_COUNT) * 0.72;
    const alpha = 1 - (i / TRAIL_COUNT) * 0.85;
    dot.style.cssText = `
      width: ${8 - i * 0.35}px;
      height: ${8 - i * 0.35}px;
      opacity: ${alpha.toFixed(2)};
      --scale: ${scale.toFixed(2)};
    `;
    container.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;
  let isHovering = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Detect hover over interactive elements
  const hoverSel = 'a, button, input, textarea, .skill-box, .work__img, .menu-toggle, label';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => { isHovering = true; });
    el.addEventListener('mouseleave', () => { isHovering = false; });
  });

  // Click burst — all dots flash
  document.addEventListener('mousedown', () => {
    trail.forEach(t => t.el.classList.add('trail-click'));
    setTimeout(() => trail.forEach(t => t.el.classList.remove('trail-click')), 350);
  });

  // Hide when leaving/entering window
  document.addEventListener('mouseleave', () => {
    container.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    container.style.opacity = '1';
  });

  // Animate — each dot chases the one ahead of it
  function animate() {
    // First dot chases mouse
    trail[0].x += (mouseX - trail[0].x) * 0.38;
    trail[0].y += (mouseY - trail[0].y) * 0.38;

    // Each subsequent dot chases the previous
    for (let i = 1; i < trail.length; i++) {
      const lag = 0.22 + i * 0.015;
      trail[i].x += (trail[i - 1].x - trail[i].x) * lag;
      trail[i].y += (trail[i - 1].y - trail[i].y) * lag;
    }

    trail.forEach((t, i) => {
      const hw = (8 - i * 0.35) / 2;
      t.el.style.transform = `translate(${t.x - hw}px, ${t.y - hw}px) scale(${isHovering ? 1.6 : 1})`;
    });

    requestAnimationFrame(animate);
  }
  animate();
})();


/* ─── 4. TOUCH TAP RIPPLE (mobile only) ──────────────────── */
(function initTouchRipple() {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) return;

  function spawnRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'tap-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top  = y + 'px';
    document.body.appendChild(ripple);

    // Spawn extra mini sparks
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'tap-spark';
      const angle = (i / 6) * Math.PI * 2;
      const dist  = 28 + Math.random() * 18;
      spark.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        --tx: ${Math.cos(angle) * dist}px;
        --ty: ${Math.sin(angle) * dist}px;
      `;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }

    ripple.addEventListener('animationend', () => ripple.remove());
  }

  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    spawnRipple(t.clientX, t.clientY);
  }, { passive: true });
})();


/* ─── 5. HERO PARTICLES CANVAS ───────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NUM = 55;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = init ? Math.random() * canvas.height : canvas.height + 10;
      this.r     = Math.random() * 1.8 + 0.4;
      this.vx    = (Math.random() - 0.5) * 0.4;
      this.vy    = -(Math.random() * 0.5 + 0.2);
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life  = Math.random() * 200 + 100;
      this.age   = 0;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.age++;
      if (this.age > this.life || this.y < -10) this.reset();
    }
    draw() {
      const fade = Math.min(this.age / 30, 1) * Math.min((this.life - this.age) / 30, 1);
      ctx.save();
      ctx.globalAlpha = this.alpha * fade;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < NUM; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 90) * 0.06;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ─── 6. SCROLL REVEAL ────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal-up, .skill-box, .work__img, .contact__form'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Stagger skill boxes within each container
  document.querySelectorAll('.container').forEach(container => {
    container.querySelectorAll('.skill-box').forEach((box, i) => {
      box.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // Stagger project cards
  document.querySelectorAll('.work__img').forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
  });
})();


/* ─── 7. MOBILE NAV TOGGLE ────────────────────────────────── */
(function initMobileNav() {
  const toggle   = document.getElementById('mobile-menu-toggle');
  const navRight = document.querySelector('nav .right');
  if (!toggle || !navRight) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navRight.classList.toggle('active');
  });

  navRight.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navRight.classList.remove('active');
    });
  });
})();


/* ─── 8. NAV SCROLL EFFECT ────────────────────────────────── */
(function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();


/* ─── 9. HERO TEXT LETTER SPLIT ANIMATION ─────────────────── */
(function initHeroLetters() {
  const nameEl = document.querySelector('.white');
  if (!nameEl) return;

  const walker    = document.createTreeWalker(nameEl, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) textNodes.push(node);
  }

  if (textNodes[0]) {
    const txt  = textNodes[0].textContent;
    const frag = document.createDocumentFragment();
    [...txt].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className   = 'hero-letter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = `${0.8 + i * 0.06}s`;
      frag.appendChild(span);
    });
    textNodes[0].replaceWith(frag);
  }
})();
