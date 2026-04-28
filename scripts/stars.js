/* stars.js — STAR_COUNT:130, parallax+depth, mouse spring flee */
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let mouse = { x: -9999, y: -9999 };
const STAR_COUNT       = 130;
const MAX_FLEE_DIST    = 80;
const PARALLAX_FACTOR  = 0.25;  // scroll'un %25'i kadar kayma

let scrollY       = 0;
let targetScrollY = 0;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = {
      originX: Math.random() * canvas.width,
      originY: Math.random() * canvas.height,
      x: 0,
      y: 0,
      radius:  Math.random() * 1.2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      phase:   Math.random() * Math.PI * 2,
      speed:   Math.random() * 0.0004 + 0.0002,
      vx: 0,
      vy: 0,
      depth: Math.random() * 0.8 + 0.2,  // parallax derinliği (0.2–1.0)
    };
    star.x = star.originX;
    star.y = star.originY;
    stars.push(star);
  }
}

function getStarColor() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? '0,0,0'
    : '255,255,255';
}

function animate(time) {
  // Smooth scroll lerp
  scrollY += (targetScrollY - scrollY) * 0.08;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = getStarColor();

  for (const s of stars) {
    // Minimal titreme
    const twinkle = Math.sin(time * s.speed + s.phase) * 0.06;
    const currentOpacity = Math.max(0.05, s.opacity + twinkle);

    // Mouse kaçma (s.x, s.y'ye göre)
    const dx   = s.x - mouse.x;
    const dy   = s.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MAX_FLEE_DIST && dist > 0) {
      const force = (MAX_FLEE_DIST - dist) / MAX_FLEE_DIST;
      s.vx += (dx / dist) * force * 1.5;
      s.vy += (dy / dist) * force * 1.5;
    }

    // Orijin'e geri çekme (spring)
    s.vx += (s.originX - s.x) * 0.04;
    s.vy += (s.originY - s.y) * 0.04;

    // Sönümleme
    s.vx *= 0.85;
    s.vy *= 0.85;

    s.x += s.vx;
    s.y += s.vy;

    // Parallax: depth yüksek → daha hızlı kayar
    const parallaxOffset = scrollY * PARALLAX_FACTOR * s.depth;
    // Wrap: ekranın üstünden çıkınca alttan tekrar girer
    const drawY = ((s.y - parallaxOffset) % canvas.height + canvas.height) % canvas.height;

    ctx.beginPath();
    ctx.arc(s.x, drawY, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${currentOpacity})`;
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
}, { passive: true });

window.addEventListener('resize', () => {
  resize();
  createStars();
});

resize();
createStars();
requestAnimationFrame(animate);
