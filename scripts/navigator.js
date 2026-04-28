/**
 * navigator.js — Asilgen Mühendislik
 * Sağ kenar section göstergesi
 * - Dikey liste, her section bir madde
 * - IntersectionObserver (threshold 0.4) ile aktif section tespiti
 * - Aktif item: beyaz + bold + dolu nokta; diğerleri: opacity 0.3
 * - Tıklanınca smooth scroll
 * - Mobilde gizli (CSS ile)
 */

'use strict';

// Takip edilecek section'lar
const NAV_ITEMS = [
  { id: 'hero-section',     label: 'Ana Sayfa' },
  { id: 'hakkimizda',       label: 'Hakkımızda' },
  { id: 'alanlarimiz',      label: 'Alanlarımız' },
  { id: 'hizmetlerimiz',    label: 'Hizmetlerimiz' }
];

let activeId = NAV_ITEMS[0].id;

function buildNav() {
  const nav = document.createElement('nav');
  nav.className = 'section-nav';
  nav.setAttribute('aria-label', 'Sayfa bölümleri');

  NAV_ITEMS.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'section-nav__item';
    btn.dataset.target = item.id;
    btn.setAttribute('aria-label', `${item.label} bölümüne git`);

    btn.innerHTML = `
      <span class="section-nav__dot" aria-hidden="true"></span>
      <span class="section-nav__label">${item.label}</span>
    `;

    btn.addEventListener('click', () => {
      const target = document.getElementById(item.id) ||
                     document.querySelector(`.${item.id}`);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });

    nav.appendChild(btn);
  });

  document.body.appendChild(nav);
  return nav;
}

function updateActive(id) {
  activeId = id;
  document.querySelectorAll('.section-nav__item').forEach(btn => {
    const isActive = btn.dataset.target === id;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

function initObserver() {
  const observer = new IntersectionObserver(
    entries => {
      // En fazla görünür olan section'ı seç
      let best = null;
      let bestRatio = 0;
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          best = entry.target;
        }
      }
      if (best) {
        const id = best.id || best.className.split(' ')[0];
        updateActive(id);
      }
    },
    { threshold: 0.35 }
  );

  NAV_ITEMS.forEach(item => {
    const el = document.getElementById(item.id) ||
               document.querySelector(`.${item.id}`);
    if (el) {
      // hero-section için id ata
      if (item.id === 'hero-section' && !el.id) el.id = 'hero-section';
      observer.observe(el);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();

  // Hero section'a id ver (class ile bulunuyorsa)
  const hero = document.querySelector('.hero-section');
  if (hero && !hero.id) hero.id = 'hero-section';

  initObserver();
  // Başlangıçta ilk item aktif
  updateActive(NAV_ITEMS[0].id);
});

export {};
