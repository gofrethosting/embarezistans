/**
 * fields.js — Asilgen Mühendislik (v2)
 * Normal (Takılmasız) Intersection Observer tabanlı Staggered Kart Giriş Animasyonu
 */

'use strict';

function init() {
  const section = document.querySelector('.fields-section');
  if (!section) return;

  const header = section.querySelector('.fields-header');
  const boxes = Array.from(section.querySelectorAll('.field-box'));

  // Header Animasyonu
  if (header) {
    const headerObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          header.classList.add('is-visible');
          headerObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    headerObs.observe(header);
  }

  // Kartların Staggered (Sırayla) Animasyonu
  if (boxes.length) {
    let delayIndex = 0; // Aynı anda ekrana girenlerin sırayla gelmesi için
    
    const boxObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.classList.add('is-visible');
          }, delayIndex * 150); // 150ms gecikmeli sırayla giriş
          
          delayIndex++;
          boxObs.unobserve(e.target);
        }
      });
      // Bir sonraki scroll partisinde gecikmeyi sıfırla ki yeni girenler hemen gelsin
      setTimeout(() => { delayIndex = 0; }, 500);
      
    }, { threshold: 0.15 });

    boxes.forEach(box => boxObs.observe(box));
  }

  initAboutAnimations();
}

function initAboutAnimations() {
  const targets = document.querySelectorAll('.about-title, .about-text, .about-stats');
  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  targets.forEach(el => obs.observe(el));

  const img = document.querySelector('.about-bg-image');
  if (img) {
    if (img.complete) img.classList.add('is-loaded');
    else img.addEventListener('load', () => img.classList.add('is-loaded'));
  }
}

document.addEventListener('DOMContentLoaded', init);
export { init as initFields };
