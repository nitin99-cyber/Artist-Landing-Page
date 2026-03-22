/* =====================================================
   ARIJIT SINGH — Premium Landing Page
   script.js — All Interactivity & Animations
   ===================================================== */

'use strict';

// ── GSAP Registration ──────────────────────────────────
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Utility ────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp  = (a, b, t) => a + (b - a) * t;

// ═══════════════════════════════════════════════════════
// 1. CUSTOM CURSOR
// ═══════════════════════════════════════════════════════
(function initCursor() {
  const cursor   = qs('#cursor');
  const follower = qs('#cursorFollower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animateFollower() {
    fx = lerp(fx, mx, 0.1);
    fy = lerp(fy, my, 0.1);
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();

  // Hovered state for interactive elements
  qsa('a, button, .song-card, .genre-card, .info-card, .nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); follower.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovered'); follower.classList.remove('hovered'); });
  });
})();

// ═══════════════════════════════════════════════════════
// 2. NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════════════════════
(function initNavbar() {
  const navbar = qs('#navbar');
  const toggle = qs('#navToggle');
  const links  = qs('.nav-links');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    links?.classList.toggle('open');
  });

  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => links?.classList.remove('open'));
  });
})();

// ═══════════════════════════════════════════════════════
// 3. HERO PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════
(function initParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const PARTICLE_COUNT = 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4 - 0.2;
      this.r  = Math.random() * 2.5 + 0.5;
      this.alpha = Math.random() * 0.6 + 0.1;
      // Colour: gold, purple, teal
      const cols = ['245,200,66','139,92,246','6,182,212','244,63,94'];
      this.color = cols[Math.floor(Math.random() * cols.length)];
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.03;
      if (this.y < -5 || this.x < -5 || this.x > W + 5) this.reset();
    }
    draw() {
      const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${a})`;
      ctx.fill();
    }
  }

  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  // Connection lines between close particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(245,200,66,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ═══════════════════════════════════════════════════════
// 4. HERO WAVEFORM ANIMATION
// ═══════════════════════════════════════════════════════
(function initHeroWave() {
  const canvas = qs('#waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawWave() {
    ctx.clearRect(0, 0, W, H);
    const waves = [
      { amp: 28, freq: 0.012, speed: 0.025, col: '139,92,246', alpha: 0.5, offset: 0 },
      { amp: 18, freq: 0.018, speed: 0.04,  col: '245,200,66', alpha: 0.3, offset: 1 },
      { amp: 12, freq: 0.022, speed: 0.055, col: '6,182,212',  alpha: 0.25, offset: 2 },
    ];
    waves.forEach(w => {
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, `rgba(${w.col},0)`);
      grad.addColorStop(0.3, `rgba(${w.col},${w.alpha})`);
      grad.addColorStop(0.7, `rgba(${w.col},${w.alpha})`);
      grad.addColorStop(1, `rgba(${w.col},0)`);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      for (let x = 0; x <= W; x += 2) {
        const y = H * 0.5 + Math.sin(x * w.freq + t * w.speed + w.offset) * w.amp
                          + Math.sin(x * w.freq * 0.5 + t * w.speed * 0.7) * w.amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    });
    t++;
    requestAnimationFrame(drawWave);
  }
  drawWave();
})();

// ═══════════════════════════════════════════════════════
// 5. MOUSE FOLLOW GLOW
// ═══════════════════════════════════════════════════════
(function initMouseGlow() {
  const hero = qs('.hero');
  const glow = qs('#mouseGlow');
  if (!hero || !glow) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top)  + 'px';
  });
})();

// ═══════════════════════════════════════════════════════
// 6. SCROLL-BASED REVEAL & TIMELINE GLOW LINE
// ═══════════════════════════════════════════════════════
(function initScrollReveal() {
  // Generic reveal
  const revealEls = qsa('.section-header, .info-card, .trait-block, .stat-card, .genre-card, .story-para, .timeline-card');
  revealEls.forEach(el => el.classList.add('reveal-element'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));

  // Lyric scroll reveal
  const lyricText = qs('#lyricScrollText');
  if (lyricText) {
    const lyricObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) lyricText.classList.add('visible'); });
    }, { threshold: 0.5 });
    lyricObs.observe(lyricText);
  }

  // Timeline glow line
  const glowLine = qs('#glowLine');
  if (glowLine) {
    const timelineSec = qs('#journey');
    const lineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) glowLine.style.width = '100%';
      });
    }, { threshold: 0.3 });
    lineObs.observe(timelineSec);
  }

  // Genre bars animation
  const genreFills = qsa('.genre-fill');
  const genreObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('animated');
    });
  }, { threshold: 0.5 });
  genreFills.forEach(f => genreObs.observe(f));
})();

// ═══════════════════════════════════════════════════════
// 7. ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════
(function initCounters() {
  const counters = qsa('.stat-number');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const duration = 2000;
        const stepTime = 16;
        const steps = duration / stepTime;
        const increment = target / steps;
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) { start = target; clearInterval(timer); }
          el.textContent = Math.floor(start) + suffix;
        }, stepTime);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));
})();

// ═══════════════════════════════════════════════════════
// 8. MUSIC STYLE SOUNDWAVE
// ═══════════════════════════════════════════════════════
(function initStyleWave() {
  const canvas = qs('#styleWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0, bars = [];
  const BAR_COUNT = 60;

  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
    bars = Array.from({ length: BAR_COUNT }, () => ({
      h: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.04 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const barW = W / BAR_COUNT;
    bars.forEach((bar, i) => {
      const h = (0.4 + 0.5 * Math.abs(Math.sin(t * bar.speed + bar.phase))) * H * 0.8;
      const x = i * barW + barW * 0.2;
      const bw = barW * 0.6;
      const y = (H - h) / 2;
      const prog = i / BAR_COUNT;
      const r = Math.round(lerp(139, 245, prog));
      const g = Math.round(lerp(92,  200, prog));
      const b = Math.round(lerp(246, 66,  prog));
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.1)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, h, 3);
      ctx.fill();
    });
    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══════════════════════════════════════════════════════
// 9. SONG CARD 3D TILT
// ═══════════════════════════════════════════════════════
(function initSongCards() {
  qsa('.song-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = clamp((e.clientY - cy) / (rect.height / 2) * 5, -8, 8);
      const ry = clamp((e.clientX - cx) / (rect.width  / 2) * 5, -8, 8);
      card.style.transform = `translateY(-8px) rotateX(${-rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Mini waveforms on each card
  qsa('.mini-wave').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;
    function resize() {
      W = canvas.width  = canvas.parentElement.offsetWidth;
      H = canvas.height = 40;
    }
    resize();
    const cardColor = ['245,200,66','139,92,246','6,182,212','244,63,94'];
    const col = cardColor[Math.floor(Math.random() * cardColor.length)];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.03 + t * 0.05) * 10 * Math.sin(x * 0.01 + 1);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${col},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      t++;
      requestAnimationFrame(draw);
    }
    draw();
  });
})();

// ═══════════════════════════════════════════════════════
// 10. MUSIC PLAYER MODAL
// ═══════════════════════════════════════════════════════
(function initPlayer() {
  const modal      = qs('#playerModal');
  const overlay    = qs('#playerOverlay');
  const closeBtn   = qs('#playerClose');
  const playPause  = qs('#playPauseBtn');
  const title      = qs('#playerTitle');
  const movie      = qs('#playerMovie');
  const art        = qs('#playerArt');
  const progFill   = qs('#progressFill');
  const progThumb  = qs('#progressThumb');
  const curTime    = qs('#currentTime');
  const lyricLine  = qs('#lyricLine');
  const playerWave = qs('#playerWave');
  const playerUI   = qs('.player-ui');
  if (!modal) return;

  const lyrics = [
    '♪ Tum hi ho... aashiqui ab tum hi ho ♪',
    '♪ Channa mereya... mereya... ♪',
    '♪ Kesariya tera ishq hai... piya ♪',
    '♪ Main raabta... main raabta ♪',
    '♪ Hawayein bhi hain... mujhe aawaazen de... ♪',
    '♪ Mast magan... hoon main teri aankh se ♪',
  ];

  let isPlaying = false;
  let progress = 0;
  let playerTimer = null;
  let lyricIndex = 0;

  const songs = qsa('.song-card');
  songs.forEach((card, i) => {
    card.addEventListener('click', () => openPlayer(card, i));
  });

  function openPlayer(card, idx) {
    const songName = card.dataset.song;
    const songMovie = `${card.dataset.movie} · ${card.dataset.year}`;
    const emoji = card.dataset.emoji || '🎵';
    title.textContent = songName;
    movie.textContent = songMovie;
    art.textContent = emoji;
    art.style.background = `linear-gradient(135deg, hsl(${idx * 60},70%,40%), hsl(${idx * 60 + 60},70%,30%))`;
    lyricLine.textContent = lyrics[idx % lyrics.length];
    progress = 0;
    updateProgress();
    modal.classList.add('active');
    isPlaying = false;
    togglePlay();
  }

  function closePlayer() {
    modal.classList.remove('active');
    playerUI.classList.remove('playing');
    isPlaying = false;
    clearInterval(playerTimer);
    playPause.textContent = '▶';
  }
  closeBtn.addEventListener('click', closePlayer);
  overlay.addEventListener('click', closePlayer);

  function togglePlay() {
    isPlaying = !isPlaying;
    playPause.textContent = isPlaying ? '⏸' : '▶';
    playerUI.classList.toggle('playing', isPlaying);
    if (isPlaying) {
      playerTimer = setInterval(() => {
        progress = Math.min(100, progress + 0.045);
        updateProgress();
        if (progress >= 100) { clearInterval(playerTimer); isPlaying = false; playPause.textContent = '▶'; playerUI.classList.remove('playing'); }
      }, 50);
      // Cycle lyrics
      lyricIndex = 0;
      setInterval(() => {
        lyricIndex = (lyricIndex + 1) % lyrics.length;
        lyricLine.textContent = lyrics[lyricIndex];
      }, 3000);
    } else {
      clearInterval(playerTimer);
    }
  }
  playPause.addEventListener('click', togglePlay);

  function updateProgress() {
    const timeTotal = 227; // 3:47
    const timeCur   = Math.floor(timeTotal * progress / 100);
    const m = Math.floor(timeCur / 60);
    const s = timeCur % 60;
    curTime.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    progFill.style.width  = progress + '%';
    progThumb.style.left  = progress + '%';
  }

  // Player waveform
  if (playerWave) {
    const ctx = playerWave.getContext('2d');
    let W, H, t = 0;
    function resize() {
      W = playerWave.width  = playerWave.parentElement?.offsetWidth || 300;
      H = playerWave.height = 60;
    }
    resize();
    function drawPlayerWave() {
      ctx.clearRect(0, 0, W, H);
      const amp = isPlaying ? 18 : 4;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.04 + t * 0.08) * amp + Math.sin(x * 0.08 + t * 0.12) * (amp * 0.4);
        ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(139,92,246,0.8)');
      grad.addColorStop(1, 'rgba(245,200,66,0.8)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
      t++;
      requestAnimationFrame(drawPlayerWave);
    }
    drawPlayerWave();
  }
})();

// ═══════════════════════════════════════════════════════
// 11. PERSONALITY FLOATING PARTICLES
// ═══════════════════════════════════════════════════════
(function initPersonalityParticles() {
  const container = qs('#personalityParticles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute;
      width:${Math.random()*4+2}px;
      height:${Math.random()*4+2}px;
      background:rgba(245,200,66,${Math.random()*0.3+0.05});
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation: floatDot ${Math.random()*8+6}s ease-in-out ${Math.random()*5}s infinite;
      pointer-events:none;
    `;
    container.appendChild(dot);
  }

  // Add keyframe via stylesheet
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatDot {
      0%,100% { transform:translateY(0px) scale(1); opacity:0.3; }
      33% { transform:translateY(-${Math.random()*30+20}px) scale(1.2); opacity:0.7; }
      66% { transform:translateY(${Math.random()*20+10}px) scale(0.8); opacity:0.2; }
    }
  `;
  document.head.appendChild(style);
})();

// ═══════════════════════════════════════════════════════
// 12. FOOTER WAVE
// ═══════════════════════════════════════════════════════
(function initFooterWave() {
  const canvas = qs('#footerWave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;
  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = 100;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const y = H * 0.5 + Math.sin(x * 0.01 + t * 0.02) * 20 + Math.sin(x * 0.02 + t * 0.03) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(139,92,246,0.3)');
    grad.addColorStop(0.5, 'rgba(245,200,66,0.25)');
    grad.addColorStop(1, 'rgba(6,182,212,0.3)');
    ctx.fillStyle = grad;
    ctx.fill();
    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══════════════════════════════════════════════════════
// 13. SCROLL SPEED BACKGROUND EFFECT
// ═══════════════════════════════════════════════════════
(function initScrollSpeedBg() {
  let lastY = 0;
  let speed = 0;
  window.addEventListener('scroll', () => {
    speed = Math.abs(window.scrollY - lastY);
    lastY = window.scrollY;
    // Intensify background hue based on speed
    const intensity = clamp(speed / 80, 0, 1);
    document.body.style.setProperty('--scroll-intensity', intensity.toFixed(3));
  }, { passive: true });
})();

// ═══════════════════════════════════════════════════════
// 14. GSAP PARALLAX (if GSAP loaded)
// ═══════════════════════════════════════════════════════
(function initGSAP() {
  if (typeof gsap === 'undefined') return;

  // Hero content subtle parallax
  gsap.to('.hero-content', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Story orb parallax
  gsap.to('.story-orb', {
    y: -60,
    ease: 'none',
    scrollTrigger: { trigger: '.early-life', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Timeline items stagger
  gsap.from('.timeline-item', {
    opacity: 0,
    y: 50,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.timeline-track', start: 'top 80%' },
  });

  // Impact stats 3D entrance
  gsap.from('.stat-card', {
    rotationY: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 1,
    ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '.impact-stats', start: 'top 80%' },
  });

  // Section headers slide in
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
})();

// ═══════════════════════════════════════════════════════
// 15. SMOOTH SCROLL FOR ANCHOR LINKS
// ═══════════════════════════════════════════════════════
qsa('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = qs(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ═══════════════════════════════════════════════════════
// 16. CANVAS roundRect Polyfill (for older Chrome/Firefox)
// ═══════════════════════════════════════════════════════
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

console.log('%c🎵 Arijit Singh — The Voice of Emotions', 'color:#f5c842;font-size:18px;font-family:serif;font-weight:bold;');
console.log('%cFan Tribute Page | Built with ❤️', 'color:#8b5cf6;font-size:12px;');
