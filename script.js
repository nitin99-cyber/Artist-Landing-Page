/* =========================================================
   ARIJIT SINGH — Cinematic Emotion Flow JS
   ========================================================= */

'use strict';

// ── UTILITIES ──
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── CUSTOM CURSOR ──
(function initCursor() {
  const dot = qs('#cursorDot');
  const ring = qs('#cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  function renderCursor() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    if (ring) {
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  qsa('a, button, .tilt-card, .song-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// ── EMOTION BACKGROUND ENGINE ──
(function initEmotionScroll() {
  const sections = qsa('.emotion-section');
  const navDots = qsa('.nav-dot');

  const emotionColors = {
    'intro': '#050505',
    'love': '#1a050f',        // deep dark pink
    'heartbreak': '#050a1a',  // deep dark blue
    'timeline': '#0a0515',    // deep purple
    'passion': '#1f0505',     // deep red
    'legacy': '#1a1505'       // dark gold
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const emotion = entry.target.dataset.emotion;
        if (emotion && emotionColors[emotion]) {
          document.body.style.setProperty('--bg-color', emotionColors[emotion]);

          // Update Nav Map
          navDots.forEach(d => {
            d.classList.toggle('active', d.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => observer.observe(sec));
})();

// ── TEXT TEXT REVEAL & GSAP ──
(function initGSAP() {
  if (typeof gsap === 'undefined') return;

  // Hero Parallax
  gsap.to('.hero-bg img', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: '#intro', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Reveal Text
  qsa('.reveal-text').forEach(text => {
    let delay = 0;
    if (text.classList.contains('delay-1')) delay = 0.2;
    if (text.classList.contains('delay-2')) delay = 0.4;
    if (text.classList.contains('delay-3')) delay = 0.6;

    gsap.to(text, {
      opacity: 1, y: 0, duration: 1, delay: delay, ease: 'power3.out',
      scrollTrigger: { trigger: text, start: 'top 85%' }
    });
  });

  // Timeline Progress
  const timelineLine = qs('#timelineProgress');
  if (timelineLine) {
    gsap.to(timelineLine, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: '.timeline-wrapper', start: 'top 60%', end: 'bottom 80%', scrub: true }
    });
  }

  // Gallery Parallax
  gsap.utils.toArray('.parallax-img').forEach(img => {
    gsap.to(img, {
      yPercent: 15, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // WOW Section Background Parallax
  gsap.to('.wow-bg img', {
    yPercent: 40, ease: 'none',
    scrollTrigger: { trigger: '#wow', start: 'top bottom', end: 'bottom top', scrub: true }
  });
})();

// ── 3D TILT EFFECT ──
(function initTilt() {
  qsa('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
})();

// ── AUDIO PLAYER ──
(function initAudio() {
  const songs = qsa('.song-card');
  const player = qs('#audioPlayer');
  const nativeAudio = qs('#nativeAudio');
  const playBtn = qs('#playerPlay');
  const closeBtn = qs('#closePlayer');
  const titleUI = qs('#playerTitle');
  const loader = qs('#playerLoader');
  const canvas = qs('#miniWaveCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  if (!nativeAudio || !player) return;

  // Optional: Global ambient
  const ambient = qs('#ambientAudio');
  if (ambient) ambient.volume = 0.1;

  let isPlaying = false;
  let waveTimer;
  let waveT = 0;

  function setWaveCanvasSize() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', setWaveCanvasSize);
  setWaveCanvasSize();

  function drawWave() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const amp = isPlaying ? 8 : 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * 0.05 + waveT * 0.1) * amp * Math.sin(x * 0.02 + waveT * 0.05);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#ff4ecd';
    ctx.lineWidth = 2;
    ctx.stroke();
    waveT++;
    waveTimer = requestAnimationFrame(drawWave);
  }

  songs.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.src;
      const title = card.dataset.song;

      titleUI.textContent = title;
      nativeAudio.src = src;
      player.classList.add('active');

      // Pause ambient if playing
      if (ambient && !ambient.paused) ambient.pause();

      nativeAudio.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '⏸';
      }).catch(err => {
        console.warn("Audio play failed or file missing:", err);
        // Fake play state for UI demonstration even if file is missing
        isPlaying = true;
        playBtn.textContent = '⏸';
        // Mock progress
        let p = 0;
        setInterval(() => { if (isPlaying) p += 0.1; loader.style.width = Math.min(p, 100) + '%'; }, 100);
      });

      if (!waveTimer) drawWave();
    });
  });

  playBtn.addEventListener('click', () => {
    if (nativeAudio.paused && nativeAudio.src) {
      nativeAudio.play().catch(e => console.warn(e));
      isPlaying = true;
      playBtn.textContent = '⏸';
    } else {
      nativeAudio.pause();
      isPlaying = false;
      playBtn.textContent = '▶';
    }
  });

  closeBtn.addEventListener('click', () => {
    nativeAudio.pause();
    isPlaying = false;
    player.classList.remove('active');
    cancelAnimationFrame(waveTimer);
    waveTimer = null;
    loader.style.width = '0%';
  });

  nativeAudio.addEventListener('timeupdate', () => {
    if (nativeAudio.duration) {
      const p = (nativeAudio.currentTime / nativeAudio.duration) * 100;
      loader.style.width = p + '%';
    }
  });
})();

// ── WOW SPECTRUM (MIC PARTICLES) ──
(function initSpectrum() {
  const container = qs('.spectrum-container');
  if (container) {
    for (let i = 0; i < 40; i++) {
      const bar = document.createElement('div');
      bar.className = 'spec-bar';
      bar.style.height = (Math.random() * 60 + 10) + '%';
      bar.style.animation = `pulseBar ${Math.random() * 0.5 + 0.5}s infinite alternate ease-in-out`;
      container.appendChild(bar);
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes pulseBar { 0% { transform: scaleY(0.5); } 100% { transform: scaleY(1.5); } }`;
    document.head.appendChild(style);
  }
})();

// ── HERO WAVEFORM ──
(function initHeroWave() {
  const canvas = qs('#heroWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() { W = canvas.width = canvas.parentElement.offsetWidth; H = canvas.height = canvas.parentElement.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    for (let x = 0; x < W; x += 2) {
      ctx.lineTo(x, H / 2 + Math.sin(x * 0.01 + t * 0.02) * 15 + Math.sin(x * 0.02 + t * 0.015) * 10);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    // Line outline
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    for (let x = 0; x < W; x += 2) ctx.lineTo(x, H / 2 + Math.sin(x * 0.01 + t * 0.02) * 15 + Math.sin(x * 0.02 + t * 0.015) * 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    t++; requestAnimationFrame(draw);
  }
  draw();
})();
