/**
 * services.js — Asilgen Mühendislik (v2)
 * - 3D tilt (hover'da) + translateY kalkma
 * - Partiküller statik (hover değilken hiç hareket etmez, sadece bir kez çizilir)
 * - Hover'da partiküller hafif canlanır (requestAnimationFrame yalnızca hover'da)
 * - Kıvılcım efekti: CTA buton viewport'a ilk girdiğinde tetiklenir
 * - Scroll entrance animasyonu
 */

'use strict';

const TILT_MAX    = 8;
const LIFT_PX     = 8;
const reduced     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROMAN       = ['I','II','III','IV','V','VI','VII','VIII'];

// ── Başlatma ─────────────────────────────────────────────────────────────────
function init() {
  const cards = Array.from(document.querySelectorAll('.service-card'));
  if (!cards.length) return;

  cards.forEach((card, idx) => {
    initParticles(card);
    if (!reduced) {
      card.addEventListener('mousemove',  e => onMove(e, card), { passive: true });
      card.addEventListener('mouseleave', () => onLeave(card));
      card.addEventListener('mouseenter', () => onEnter(card));
    }
    card.addEventListener('mousemove', e => updateGlow(e, card), { passive: true });

    // Karta tıklandığında hizmetlerimiz.html sayfasına yönlendir
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.location.href = 'hizmetlerimiz.html';
    });
  });

  initEntrance(cards);
}

// ── Scroll entrance ───────────────────────────────────────────────────────────
function initEntrance(cards) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = cards.indexOf(e.target);
        setTimeout(() => e.target.classList.add('is-visible'), idx * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  cards.forEach(c => obs.observe(c));
}

// ── 3D Tilt ───────────────────────────────────────────────────────────────────
function onMove(e, card) {
  const r = card.getBoundingClientRect();
  const rx = -((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * TILT_MAX;
  const ry =  ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * TILT_MAX;
  card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-${LIFT_PX}px)`;
  card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s, border-color 0.3s';
}
function onEnter(card) {
  card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s, border-color 0.3s';
}
function onLeave(card) {
  card.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s';
  card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
}

// ── Glow güncelle ─────────────────────────────────────────────────────────────
function updateGlow(e, card) {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width  * 100).toFixed(1)}%`);
  card.style.setProperty('--mouse-y', `${((e.clientY - r.top ) / r.height * 100).toFixed(1)}%`);
}

// ── Partikül sistemi ──────────────────────────────────────────────────────────
function initParticles(card) {
  const canvas = card.querySelector('.card-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let isHovered = false;
  let rafId     = null;
  let mx = -1, my = -1;

  function resize() {
    canvas.width  = card.offsetWidth;
    canvas.height = card.offsetHeight;
    build();
    drawStatic(); // İlk statik çizim
  }

  function build() {
    const count = Math.floor(Math.random() * 16) + 20; // 20–35
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r:  Math.random() * 1.2 + 0.5,
      opa: Math.random() * 0.25 + 0.15,
    }));
  }

  function drawStatic() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,197,24,${p.opa.toFixed(2)})`;
      ctx.fill();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      // Mouse etkisi
      if (mx > 0) {
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.hypot(dx, dy);
        if (d < 55 && d > 0) {
          const f = (1 - d / 55) * 0.35;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      // Damping
      p.vx *= 0.96; p.vy *= 0.96;
      // Brownian
      p.vx += (Math.random() - 0.5) * 0.006;
      p.vy += (Math.random() - 0.5) * 0.006;
      // Sınır
      p.x = (p.x + p.vx + canvas.width ) % canvas.width;
      p.y = (p.y + p.vy + canvas.height) % canvas.height;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,197,24,${p.opa.toFixed(2)})`;
      ctx.fill();
    }
    if (isHovered) rafId = requestAnimationFrame(loop);
    else { drawStatic(); rafId = null; }
  }

  card.addEventListener('mouseenter', () => {
    isHovered = true;
    if (!rafId && !reduced) rafId = requestAnimationFrame(loop);
  });
  card.addEventListener('mouseleave', () => {
    isHovered = false; mx = -1; my = -1;
  });
  card.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
  }, { passive: true });

  const ro = new ResizeObserver(debounce(resize, 100));
  ro.observe(card);
  resize();
}



// ── Yardımcı ─────────────────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

document.addEventListener('DOMContentLoaded', init);
export { init as initServices };
