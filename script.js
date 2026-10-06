/**
 * SENSEI SLOTS - INTERACTIVE ENGINE & FIRE FLAKES PARTICLE SYSTEM
 * Realistic rising fire flakes, embers & ash, knife-slice loader, audio synthesis, and leaderboard rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.CONFIG || {};

  window.isAudioMuted = !cfg.loader?.soundEnabledDefault;

  initAudioEngine();
  initLoadingScreen();
  initFireFlakesParticles();
  initLeaderboard();
  initCopyCode();
  initCountdown(cfg.countdown?.targetDate);
  initFaqAccordion();
  initSocialCardSpotlights();
  initLeftSlider();
  initStreamWidget();
});

/* -------------------------------------------------------------
 * 1. SYNTHESIZED WEB AUDIO ENGINE
 * ------------------------------------------------------------- */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSliceSound() {
  if (window.isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.22;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(3600, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);
    filter.Q.setValueAtTime(3.0, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.24);
  } catch (e) {}
}

function playSuccessTone() {
  if (window.isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {}
}

function initAudioEngine() {
  const loaderSoundBtn = document.getElementById('loader-sound-toggle');
  const globalSoundBtn = document.getElementById('global-sound-toggle');

  function updateIcons() {
    const iconName = window.isAudioMuted ? 'volume-x' : 'volume-2';
    const labelText = window.isAudioMuted ? 'Audio Muted' : 'Audio Active';

    const lIcon = document.getElementById('loader-sound-icon');
    const lLabel = document.getElementById('loader-sound-label');
    const gIcon = document.getElementById('global-sound-icon');

    if (lIcon) lIcon.setAttribute('data-lucide', iconName);
    if (lLabel) lLabel.innerText = labelText;
    if (gIcon) gIcon.setAttribute('data-lucide', iconName);

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function toggleAudio() {
    window.isAudioMuted = !window.isAudioMuted;
    if (!window.isAudioMuted) {
      getAudioContext();
      playSliceSound();
    }
    updateIcons();
  }

  if (loaderSoundBtn) loaderSoundBtn.addEventListener('click', toggleAudio);
  if (globalSoundBtn) globalSoundBtn.addEventListener('click', toggleAudio);

  document.addEventListener('click', () => {
    if (!audioCtx && !window.isAudioMuted) {
      getAudioContext();
    }
  }, { once: true });
}

/* -------------------------------------------------------------
 * 2. FIRE FLAKES & EMBERS PARTICLE SYSTEM (Canvas Physics)
 * ------------------------------------------------------------- */
function initFireFlakesParticles() {
  const canvas = document.getElementById('fire-flakes-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let isRunning = true;

  const cfg = (window.CONFIG && window.CONFIG.particles) || {};
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? (cfg.countMobile || 30) : (cfg.countDesktop || 80);
  const COLORS = cfg.colors || ["#ff5c70", "#e63950", "#ff8a3d", "#f5c542"];

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class FireFlake {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * (width + 100) - 50;
      this.y = initial ? Math.random() * height : height + Math.random() * 20;
      this.size = Math.random() * 5 + 2; // 2px to 7px
      this.speedY = Math.random() * 0.9 + 0.45;
      this.speedX = Math.random() * 0.35 + 0.2; // Leaning mild drift right
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.04;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.swayAmp = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.maxOpacity = this.opacity;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      // Depth of field: larger flakes in foreground are slightly blurred
      this.isForeground = this.size > 5.5 && Math.random() > 0.6;
      this.shape = Math.random() > 0.35 ? 'diamond' : 'circle'; // Irregular flakes & round sparks
    }

    update(time) {
      if (prefersReduced) return;

      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(time * this.swaySpeed + this.swayOffset) * this.swayAmp;
      this.angle += this.spinSpeed;

      // Flicker and fade out as it ascends
      const progress = this.y / height;
      this.opacity = Math.max(0, this.maxOpacity * (progress + (Math.sin(time * 0.1) * 0.1)));

      if (this.y < -20 || this.x > width + 60 || this.opacity <= 0) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.isForeground ? 16 : 8;

      if (this.shape === 'diamond') {
        // Irregular diamond / ash flake
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.6, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Round spark / glowing ember
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new FireFlake());
  }

  let lastTime = 0;
  function animate(time) {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter'; // Additive blending for fiery glow

    for (let p of particles) {
      p.update(time);
      p.draw();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Pause when tab is hidden to save CPU/battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
    } else {
      isRunning = true;
      requestAnimationFrame(animate);
    }
  });
}

/* -------------------------------------------------------------
 * 3. KNIFE-SLICE LOADING SCREEN
 * ------------------------------------------------------------- */
function initLoadingScreen() {
  const loaderContainer = document.getElementById('loader-container');
  const loaderContent = document.getElementById('loader-content');
  const progressBar = document.getElementById('loader-progress-bar');
  const percentageEl = document.getElementById('loader-percentage');
  const bladeEl = document.getElementById('loader-blade');
  const flashEl = document.getElementById('loader-flash');
  const topHalf = document.getElementById('loader-half-top');
  const bottomHalf = document.getElementById('loader-half-bottom');
  const laserTrail = document.getElementById('loader-slash-trail');
  const laserLine = document.getElementById('laser-line-element');

  if (!loaderContainer) return;

  const minTime = CONFIG.loader?.minDisplayTimeMs || 1800;
  const startTime = performance.now();
  let progress = 0;

  const interval = setInterval(() => {
    const elapsed = performance.now() - startTime;
    progress = Math.min(100, Math.floor((elapsed / minTime) * 100));

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (percentageEl) percentageEl.innerText = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(executeSliceTransition, 100);
    }
  }, 25);

  function executeSliceTransition() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      loaderContainer.style.transition = 'opacity 0.4s ease';
      loaderContainer.style.opacity = '0';
      setTimeout(() => loaderContainer.remove(), 400);
      return;
    }

    if (loaderContent) loaderContent.style.opacity = '0';

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const startX = -120;
    const startY = screenH * 0.15;
    const endX = screenW + 120;
    const endY = screenH * 0.85;

    const angleRad = Math.atan2(endY - startY, endX - startX);
    const angleDeg = angleRad * (180 / Math.PI);
    const distance = Math.hypot(endX - startX, endY - startY);

    if (laserTrail && laserLine) {
      laserTrail.style.opacity = '1';
      laserLine.style.width = `${distance}px`;
      laserLine.style.top = `${startY}px`;
      laserLine.style.left = `${startX}px`;
      laserLine.style.transform = `rotate(${angleDeg}deg) scaleX(0)`;
    }

    if (bladeEl) {
      bladeEl.style.opacity = '1';
      bladeEl.style.top = `${startY - 20}px`;
      bladeEl.style.left = `${startX}px`;
      bladeEl.style.transform = `rotate(${angleDeg}deg)`;
    }

    playSliceSound();

    if (typeof gsap !== 'undefined') {
      const sliceDuration = (CONFIG.loader?.sliceDurationMs || 400) / 1000;
      const splitDuration = (CONFIG.loader?.splitDurationMs || 600) / 1000;

      const tl = gsap.timeline();

      tl.to(bladeEl, {
        left: endX,
        top: endY - 20,
        duration: sliceDuration,
        ease: 'power2.inOut',
        onUpdate: function () {
          const p = this.progress();
          if (laserLine) {
            laserLine.style.transform = `rotate(${angleDeg}deg) scaleX(${p})`;
          }
        }
      });

      tl.add(() => {
        if (flashEl) {
          flashEl.style.opacity = '0.85';
          setTimeout(() => { flashEl.style.opacity = '0'; }, 120);
        }
      }, `-=${sliceDuration * 0.35}`);

      tl.add(() => {
        if (topHalf) topHalf.classList.add('loader-split-top');
        if (bottomHalf) bottomHalf.classList.add('loader-split-bottom');
      }, `-=${sliceDuration * 0.15}`);

      tl.to(loaderContainer, {
        opacity: 0,
        duration: splitDuration,
        onComplete: () => {
          loaderContainer.remove();
        }
      });
    } else {
      if (topHalf) topHalf.classList.add('loader-split-top');
      if (bottomHalf) bottomHalf.classList.add('loader-split-bottom');
      setTimeout(() => loaderContainer.remove(), 600);
    }
  }
}

/* -------------------------------------------------------------
 * 4. LEADERBOARD RENDERING (Side-by-Side Samurai Podium & Ranks)
 * ------------------------------------------------------------- */
function initLeaderboard() {
  const prizeBody = document.getElementById('prize-table-rows');
  if (!prizeBody || !CONFIG.prizePool?.prizes) return;

  const allPrizes = CONFIG.prizePool.prizes;
  const p1 = allPrizes[0]; // 1st Place (Gold)
  const p2 = allPrizes[1]; // 2nd Place (Silver)
  const p3 = allPrizes[2]; // 3rd Place (Bronze)
  const remaining = allPrizes.slice(3);

  // Grand Majestic Samurai Kabuto Crowns SVG Generator
  function getSamuraiCrownGraphic(tier) {
    if (tier === 'gold') {
      return `
        <svg class="w-16 h-14 sm:w-20 sm:h-16 filter drop-shadow-[0_0_15px_rgba(245,197,66,0.9)]" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="32" r="28" fill="url(#goldAura)" opacity="0.45"/>
          <path d="M22 34 Q 10 12 2 2 Q 14 16 28 26 Z" fill="url(#goldGrad1)" stroke="#FFF3A8" stroke-width="1.2"/>
          <path d="M58 34 Q 70 12 78 2 Q 66 16 52 26 Z" fill="url(#goldGrad1)" stroke="#FFF3A8" stroke-width="1.2"/>
          <path d="M40 4 C 30 18, 16 22, 10 20 C 18 31, 30 34, 40 36 C 50 34, 62 31, 70 20 C 64 22, 50 18, 40 4 Z" fill="url(#goldGrad2)" stroke="#FFE885" stroke-width="1.5" filter="drop-shadow(0 0 6px #F5C542)"/>
          <path d="M25 36 C 25 52, 55 52, 55 36 Q 40 40 25 36 Z" fill="#4A0F1A" stroke="#F5C542" stroke-width="2"/>
          <polygon points="40,16 46,24 40,32 34,24" fill="#E63950" stroke="#FFE885" stroke-width="1.2" filter="drop-shadow(0 0 8px #FF5C70)"/>
          <path d="M18 42 Q 22 56 40 58 Q 58 56 62 42" fill="none" stroke="#F5C542" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 48 Q 20 62 40 64 Q 60 62 66 48" fill="none" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="40" cy="46" r="3" fill="#F5C542"/>
          <line x1="38" y1="48" x2="34" y2="60" stroke="#F5C542" stroke-width="2" stroke-linecap="round"/>
          <line x1="42" y1="48" x2="46" y2="60" stroke="#F5C542" stroke-width="2" stroke-linecap="round"/>
          <defs>
            <radialGradient id="goldAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#F5C542" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#F5C542" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFBEB"/>
              <stop offset="40%" stop-color="#F5C542"/>
              <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>
            <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="30%" stop-color="#FFF3A8"/>
              <stop offset="70%" stop-color="#F5C542"/>
              <stop offset="100%" stop-color="#92400E"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    } else if (tier === 'silver') {
      return `
        <svg class="w-14 h-12 sm:w-16 sm:h-14 filter drop-shadow-[0_0_12px_rgba(226,232,240,0.85)]" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="32" r="26" fill="url(#silverAura)" opacity="0.35"/>
          <path d="M22 34 Q 10 12 2 2 Q 14 16 28 26 Z" fill="url(#silverGrad1)" stroke="#FFFFFF" stroke-width="1.2"/>
          <path d="M58 34 Q 70 12 78 2 Q 66 16 52 26 Z" fill="url(#silverGrad1)" stroke="#FFFFFF" stroke-width="1.2"/>
          <path d="M40 4 C 30 18, 16 22, 10 20 C 18 31, 30 34, 40 36 C 50 34, 62 31, 70 20 C 64 22, 50 18, 40 4 Z" fill="url(#silverGrad2)" stroke="#FFFFFF" stroke-width="1.5" filter="drop-shadow(0 0 5px #CBD5E1)"/>
          <path d="M25 36 C 25 52, 55 52, 55 36 Q 40 40 25 36 Z" fill="#1E293B" stroke="#CBD5E1" stroke-width="2"/>
          <polygon points="40,16 46,24 40,32 34,24" fill="#60A5FA" stroke="#FFFFFF" stroke-width="1.2" filter="drop-shadow(0 0 6px #93C5FD)"/>
          <path d="M18 42 Q 22 56 40 58 Q 58 56 62 42" fill="none" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 48 Q 20 62 40 64 Q 60 62 66 48" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="40" cy="46" r="3" fill="#E2E8F0"/>
          <line x1="38" y1="48" x2="34" y2="60" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <line x1="42" y1="48" x2="46" y2="60" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <defs>
            <radialGradient id="silverAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#E2E8F0" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="silverGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="50%" stop-color="#CBD5E1"/>
              <stop offset="100%" stop-color="#475569"/>
            </linearGradient>
            <linearGradient id="silverGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="40%" stop-color="#E2E8F0"/>
              <stop offset="80%" stop-color="#94A3B8"/>
              <stop offset="100%" stop-color="#334155"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    } else {
      return `
        <svg class="w-14 h-12 sm:w-16 sm:h-14 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="32" r="26" fill="url(#bronzeAura)" opacity="0.35"/>
          <path d="M22 34 Q 10 12 2 2 Q 14 16 28 26 Z" fill="url(#bronzeGrad1)" stroke="#FED7AA" stroke-width="1.2"/>
          <path d="M58 34 Q 70 12 78 2 Q 66 16 52 26 Z" fill="url(#bronzeGrad1)" stroke="#FED7AA" stroke-width="1.2"/>
          <path d="M40 4 C 30 18, 16 22, 10 20 C 18 31, 30 34, 40 36 C 50 34, 62 31, 70 20 C 64 22, 50 18, 40 4 Z" fill="url(#bronzeGrad2)" stroke="#FDBA74" stroke-width="1.5" filter="drop-shadow(0 0 5px #D97706)"/>
          <path d="M25 36 C 25 52, 55 52, 55 36 Q 40 40 25 36 Z" fill="#2B0A10" stroke="#D97706" stroke-width="2"/>
          <polygon points="40,16 46,24 40,32 34,24" fill="#F59E0B" stroke="#FED7AA" stroke-width="1.2" filter="drop-shadow(0 0 6px #FBBF24)"/>
          <path d="M18 42 Q 22 56 40 58 Q 58 56 62 42" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 48 Q 20 62 40 64 Q 60 62 66 48" fill="none" stroke="#78350F" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="40" cy="46" r="3" fill="#F59E0B"/>
          <line x1="38" y1="48" x2="34" y2="60" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
          <line x1="42" y1="48" x2="46" y2="60" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
          <defs>
            <radialGradient id="bronzeAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#D97706" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#D97706" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="bronzeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFEDD5"/>
              <stop offset="50%" stop-color="#D97706"/>
              <stop offset="100%" stop-color="#78350F"/>
            </linearGradient>
            <linearGradient id="bronzeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF7ED"/>
              <stop offset="40%" stop-color="#FDBA74"/>
              <stop offset="80%" stop-color="#B45309"/>
              <stop offset="100%" stop-color="#451A03"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }
  }

  function renderPodiumPillar(p, orderClass, heightClass, isChampion) {
    if (!p) return '';
    const isGold = p.rank === 1;
    const isSilver = p.rank === 2;
    const tierClass = isGold ? 'tier-gold' : isSilver ? 'tier-silver' : 'tier-bronze';
    const crownBadgeClass = isGold ? 'crown-gold' : isSilver ? 'crown-silver' : 'crown-bronze';
    const crownTitle = isGold ? '👑 SHŌGUN CROWN' : isSilver ? '👑 DAIMYŌ CROWN' : '👑 HATAMOTO CROWN';
    const prizeColor = isGold 
      ? 'text-[#f5c542] text-3xl sm:text-4xl drop-shadow-[0_0_16px_rgba(245,197,66,0.85)]' 
      : isSilver 
      ? 'text-slate-100 text-2xl sm:text-3xl drop-shadow-[0_0_12px_rgba(226,232,240,0.8)]' 
      : 'text-amber-400 text-2xl sm:text-3xl drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]';
    const stepLabel = isGold ? 'CHAMPION • 1ST' : isSilver ? 'RUNNER UP • 2ND' : 'THIRD • 3RD';

    return `
      <div class="podium-pillar-card ${tierClass} ${orderClass} ${heightClass} ${isChampion ? 'champion-pillar' : ''} group relative" data-rank="${p.rank}">
        <!-- Floating Samurai Crown Crest Badge on Top -->
        <div class="samurai-crown-badge ${crownBadgeClass}">
          <span class="crown-rank-tag">${crownTitle}</span>
        </div>

        <!-- Katana Blade Edge Left Border -->
        <div class="katana-blade-indicator"></div>

        <!-- Japanese Kanji Watermark -->
        <div class="kanji-watermark">${p.kanji}</div>

        <!-- Katana Slash Light Sheen on Hover -->
        <div class="katana-slash-sheen"></div>

        <div class="flex flex-col items-center justify-between h-full pt-8 pb-4 px-3.5 text-center relative z-10 w-full">
          <!-- Centerpiece: Majestic Samurai Kabuto Crown -->
          <div class="flex flex-col items-center space-y-2 w-full mt-1">
            <div class="podium-crown-showcase">
              ${getSamuraiCrownGraphic(p.tier)}
            </div>
            <div class="font-black text-white text-base tracking-wide">${p.place} Place</div>
            <div class="samurai-honor-pill ${tierClass}">
              <span>⚔️</span>
              <span>${p.samuraiRank}</span>
            </div>
          </div>

          <!-- Middle / Bottom: Prize Cash -->
          <div class="my-3 flex flex-col items-center">
            <span class="text-[10px] uppercase font-sans tracking-widest text-gray-400 font-bold mb-0.5">Prize Cash</span>
            <div class="font-mono font-black ${prizeColor}">
              ${p.prize}
            </div>
          </div>

          <!-- Bottom Step Badge -->
          <div class="podium-step-badge ${tierClass}">
            ${stepLabel}
          </div>
        </div>
      </div>
    `;
  }

  // 1. Render 3 Podium Pillars Side-by-Side (2nd | 1st | 3rd)
  const top3Html = `
    <div class="top3-podium-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end mb-8 pt-6">
      ${renderPodiumPillar(p2, 'order-2 md:order-1', 'md:min-h-[310px]', false)}
      ${renderPodiumPillar(p1, 'order-1 md:order-2', 'md:min-h-[355px]', true)}
      ${renderPodiumPillar(p3, 'order-3 md:order-3', 'md:min-h-[290px]', false)}
    </div>
  `;

  // 2. Section Divider between Top 3 and Standard Ranks
  const dividerHtml = `
    <div class="podium-section-divider my-6">
      <div class="divider-line"></div>
      <div class="divider-badge">
        <span>⚔️</span>
        <span>HONORABLE RANKS (4TH – 8TH)</span>
        <span>⚔️</span>
      </div>
      <div class="divider-line"></div>
    </div>
  `;

  // 3. Render Remaining Rows (4th to 8th)
  const remainingHtml = `
    <div class="space-y-3 font-mono">
      ${remaining.map((p) => {
        return `
          <div class="leaderboard-pill-row tier-standard group relative overflow-hidden" data-rank="${p.rank}">
            <div class="katana-blade-indicator"></div>
            <div class="kanji-watermark">${p.kanji || '侍'}</div>
            <div class="katana-slash-sheen"></div>

            <div class="flex items-center gap-3 relative z-10">
              <span class="text-xs text-gray-300 font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">${p.place}</span>
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm sm:text-base tracking-wide">${p.place} Place</span>
                <span class="samurai-honor-pill tier-standard">
                  <span class="text-[10px]">⚔️</span>
                  <span>${p.samuraiRank || 'WARRIOR'}</span>
                </span>
              </div>
            </div>

            <div class="text-right font-mono text-gray-100 font-bold text-base sm:text-lg relative z-10 flex items-center gap-1.5">
              <span class="text-[11px] opacity-60 font-sans uppercase hidden sm:inline-block tracking-wider">Prize</span>
              <span>${p.prize}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 4. Append Total Row
  const totalHtml = `
    <div class="leaderboard-pill-row tier-total mt-4 group relative overflow-hidden">
      <div class="katana-blade-indicator"></div>
      <div class="kanji-watermark">総額</div>
      <div class="katana-slash-sheen"></div>

      <div class="flex items-center gap-3 relative z-10">
        <div class="w-8 h-8 rounded-lg bg-[#f5c542]/20 border border-[#f5c542] flex items-center justify-center text-[#f5c542] font-black text-sm shadow-[0_0_12px_rgba(245,197,66,0.5)]">
          ⚔️
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
          <span class="font-black text-white text-sm sm:text-base tracking-wider uppercase">TOTAL SEASON POOL</span>
          <span class="samurai-honor-pill tier-gold">
            <span>8 WINNERS</span>
          </span>
        </div>
      </div>

      <div class="text-right font-black text-xl sm:text-2xl text-white font-mono drop-shadow-[0_0_15px_rgba(230,57,80,0.8)] relative z-10">
        $1,000
      </div>
    </div>
  `;

  prizeBody.innerHTML = top3Html + dividerHtml + remainingHtml + totalHtml;

  // Attach Katana Slash Sound Effect on Hover
  const rows = prizeBody.querySelectorAll('.leaderboard-pill-row, .podium-pillar-card');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      if (typeof playSliceSound === 'function') {
        playSliceSound();
      }
    });
  });
}

/* -------------------------------------------------------------
 * 5. COPY REFERRAL CODE
 * ------------------------------------------------------------- */
function initCopyCode() {
  const code = CONFIG.referral?.code || "SENSEI";
  const copyButtons = document.querySelectorAll('[data-action="copy-code"]');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  function showToast(msg) {
    if (!toast) return;
    if (toastMsg) toastMsg.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        playSuccessTone();

        const originalText = btn.innerHTML;
        btn.innerHTML = `
          <svg class="w-5 h-5 text-green-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="text-green-400 font-bold">COPIED!</span>
        `;
        showToast(`Promo Code "${code}" copied to clipboard!`);

        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2500);
      } catch (err) {
        showToast(`Promo Code "${code}" copied!`);
      }
    });
  });
}

/* -------------------------------------------------------------
 * 6. COUNTDOWN TIMER
 * ------------------------------------------------------------- */
function initCountdown(targetDateStr) {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDate = new Date(targetDateStr || Date.now() + 18 * 24 * 60 * 60 * 1000).getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* -------------------------------------------------------------
 * 7. FAQ ACCORDION
 * ------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));
        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    }
  });
}

/* -------------------------------------------------------------
 * 8. SOCIAL CARD SPOTLIGHTS
 * ------------------------------------------------------------- */
function initSocialCardSpotlights() {
  const cards = document.querySelectorAll('.social-card-crimson');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* -------------------------------------------------------------
 * 9. LEFT SLIDER TABS DRAWER
 * ------------------------------------------------------------- */
function initLeftSlider() {
  const drawer = document.getElementById('left-slider-drawer');
  const backdrop = document.getElementById('slider-backdrop');
  const toggleBtn = document.getElementById('slider-toggle-btn');
  const headerToggleBtn = document.getElementById('slider-header-toggle-btn');
  const closeBtn = document.getElementById('slider-close-btn');
  const navItems = document.querySelectorAll('.slider-nav-item');

  if (!drawer) return;

  function openSlider() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeSlider() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  function toggleSlider() {
    if (drawer.classList.contains('open')) {
      closeSlider();
    } else {
      openSlider();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSlider();
    });
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSlider();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSlider();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeSlider();
    });
  }

  // Keyboard navigation: Escape key closes the slider
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeSlider();
    }
  });

  // Close drawer on clicking any navigation tab link
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      closeSlider();
    });
  });

  // Track active section and update active tab indicator
  const sections = document.querySelectorAll('section[id]');
  function updateActiveTab() {
    let currentSectionId = 'hero';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      const tabTarget = item.getAttribute('data-tab');
      if (tabTarget === currentSectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveTab, { passive: true });
  updateActiveTab();
}

/* -------------------------------------------------------------
 * 10. LEFT-BOTTOM LIVE STREAM POP-UP WIDGET
 * ------------------------------------------------------------- */
function initStreamWidget() {
  const streamCfg = window.CONFIG?.stream || {};
  const channel = streamCfg.channel || "senseislots";
  
  const tabBtn = document.getElementById('stream-tab-btn');
  const popupCard = document.getElementById('stream-popup-card');
  const minimizeBtn = document.getElementById('stream-minimize-btn');
  const liveContainer = document.getElementById('stream-live-container');
  const offlineContainer = document.getElementById('stream-offline-container');
  const iframe = document.getElementById('kick-stream-frame');

  const dotTab = document.getElementById('stream-status-dot-tab');
  const dotInner = document.getElementById('stream-status-dot-inner');
  const badgeTag = document.getElementById('stream-badge-tag');
  const tabLabel = document.getElementById('stream-tab-label');
  const tabChevron = document.getElementById('stream-tab-chevron');
  const titleText = document.getElementById('stream-title-text');
  const offlineMsg = document.getElementById('stream-offline-msg');
  const offlineSub = document.getElementById('stream-offline-sub');

  if (!tabBtn || !popupCard) return;

  function updateStatusUI(isLive, customTitle) {
    if (isLive) {
      if (liveContainer) liveContainer.classList.remove('hidden');
      if (offlineContainer) offlineContainer.classList.add('hidden');
      
      const embedUrl = `https://player.kick.com/${channel}?autoplay=true&muted=true`;
      if (iframe && iframe.src !== embedUrl) {
        iframe.src = embedUrl;
      }

      if (dotTab) { dotTab.className = 'status-indicator-dot live'; }
      if (dotInner) { dotInner.className = 'status-indicator-dot live'; }
      if (badgeTag) {
        badgeTag.className = 'stream-status-tag live';
        badgeTag.textContent = '🔴 LIVE';
      }
      if (tabLabel) {
        tabLabel.textContent = '🔴 LIVE NOW';
        tabLabel.className = 'font-mono font-bold text-xs text-green-400 group-hover:text-white transition-colors';
      }
      if (titleText && customTitle) {
        titleText.textContent = customTitle;
      }
    } else {
      if (liveContainer) liveContainer.classList.add('hidden');
      if (offlineContainer) offlineContainer.classList.remove('hidden');
      if (iframe) { iframe.src = ''; } // Stop playing to save data

      if (dotTab) { dotTab.className = 'status-indicator-dot offline'; }
      if (dotInner) { dotInner.className = 'status-indicator-dot offline'; }
      if (badgeTag) {
        badgeTag.className = 'stream-status-tag offline';
        badgeTag.textContent = 'OFFLINE';
      }
      if (tabLabel) {
        tabLabel.textContent = 'OFFLINE RN';
        tabLabel.className = 'font-mono font-bold text-xs text-gray-300 group-hover:text-white transition-colors';
      }
      if (offlineMsg && streamCfg.offlineMessage) {
        offlineMsg.textContent = streamCfg.offlineMessage;
      }
      if (offlineSub && streamCfg.offlineSchedule) {
        offlineSub.textContent = streamCfg.offlineSchedule;
      }
    }
  }

  // Initial UI state from config
  updateStatusUI(streamCfg.isLive, streamCfg.streamTitle);

  // Attempt to check Kick live stream API
  async function checkKickLiveStatus() {
    try {
      const res = await fetch(`https://kick.com/api/v2/channels/${channel}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const isLive = Boolean(data.livestream && data.livestream.is_live);
        const title = data.livestream?.session_title || streamCfg.streamTitle;
        updateStatusUI(isLive, title);
      }
    } catch (e) {
      // Fallback to configured state gracefully
      updateStatusUI(streamCfg.isLive, streamCfg.streamTitle);
    }
  }

  checkKickLiveStatus();
  // Poll Kick status every 90 seconds
  setInterval(checkKickLiveStatus, 90000);

  // Toggle Popup open/closed
  function togglePopup() {
    const isHidden = popupCard.classList.contains('hidden');
    if (isHidden) {
      popupCard.classList.remove('hidden');
      if (tabChevron) tabChevron.style.transform = 'rotate(180deg)';
    } else {
      popupCard.classList.add('hidden');
      if (tabChevron) tabChevron.style.transform = 'rotate(0deg)';
    }
  }

  tabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopup();
  });

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popupCard.classList.add('hidden');
      if (tabChevron) tabChevron.style.transform = 'rotate(0deg)';
    });
  }
}
