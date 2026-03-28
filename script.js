/**
 * EMBA BOBİNAJ — Main JavaScript
 * Handles: Header scroll, Hamburger menu,
 *          Hero slider, Gallery slider
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────── */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  /* ─────────────────────────────────────────
     HEADER: scroll shadow
  ───────────────────────────────────────── */
  (function initHeader() {
    const header = $('#header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ─────────────────────────────────────────
     HAMBURGER MENU
  ───────────────────────────────────────── */
  (function initHamburger() {
    const btn      = $('#hamburger');
    const mobileNav = $('#mobileNav');
    if (!btn || !mobileNav) return;

    function toggle() {
      const isOpen = mobileNav.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    btn.addEventListener('click', toggle);

    // Close when a link is tapped
    $$('a', mobileNav).forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (!mobileNav.contains(e.target) && !btn.contains(e.target)) {
        mobileNav.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  })();

  /* ─────────────────────────────────────────
     HERO SLIDER
  ───────────────────────────────────────── */
  (function initHeroSlider() {
    const track   = $('#sliderTrack');
    const prevBtn = $('#sliderPrev');
    const nextBtn = $('#sliderNext');
    const dots    = $$('.dot', $('#sliderDots'));
    if (!track || !dots.length) return;

    const TOTAL     = 5;
    const INTERVAL  = 5500; // ms
    let current     = 0;
    let autoTimer   = null;
    let isAnimating = false;

    function goTo(index) {
      if (isAnimating) return;
      isAnimating = true;

      current = (index + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * 20}%)`;

      // Update dots
      dots.forEach((d, i) => d.classList.toggle('active', i === current));

      setTimeout(() => { isAnimating = false; }, 800);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, INTERVAL);
    }
    function resetAuto() {
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index, 10));
        resetAuto();
      });
    });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
        resetAuto();
      }
    }, { passive: true });

    // Pause on hover
    const heroSection = $('#hero');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', () => clearInterval(autoTimer));
      heroSection.addEventListener('mouseleave', startAuto);
    }

    startAuto();
  })();

  /* ─────────────────────────────────────────
     GALLERY SLIDER (Hakkımızda page)
  ───────────────────────────────────────── */
  (function initGallery() {
    const track   = $('#galleryTrack');
    const prevBtn = $('#galleryPrev');
    const nextBtn = $('#galleryNext');
    if (!track) return;

    const slides  = $$('.gallery-slide', track);
    const TOTAL   = slides.length;
    let current   = 0;

    function getSlidesVisible() {
      return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    }

    function getSlideWidth() {
      const visible = getSlidesVisible();
      const gap     = visible > 1 ? 18 : 0;
      return (track.parentElement.offsetWidth - gap * (visible - 1)) / visible;
    }

    function goTo(index) {
      const visible  = getSlidesVisible();
      const maxIndex = Math.max(0, TOTAL - visible);
      current        = Math.max(0, Math.min(index, maxIndex));

      const slideW = getSlideWidth();
      const offset = current * (slideW + 18);
      track.style.transform = `translateX(-${offset}px)`;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? goTo(current + 1) : goTo(current - 1);
      }
    }, { passive: true });

    // Reset on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current), 150);
    });
  })();

  /* ─────────────────────────────────────────
     SCROLL-IN ANIMATIONS
     Adds .visible class when elements enter viewport
  ───────────────────────────────────────── */
  (function initScrollReveal() {
    const targets = $$('.service-card, .usp-item, .logistics-item, .about-stat, .contact-block');

    if (!targets.length || !('IntersectionObserver' in window)) return;

    // Pre-hide
    targets.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(28px)';
      el.style.transition = `opacity 0.55s ease ${(i % 3) * 0.1}s, transform 0.55s ease ${(i % 3) * 0.1}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  })();

 document.addEventListener('DOMContentLoaded', () => {
  const mainFab = document.getElementById('mainFab');
  const fabContainer = document.getElementById('fabContainer');
  const optionBtns = document.querySelectorAll('.option-btn');

  // Ana butona tıklanınca yarılma animasyonunu başlat
  mainFab.addEventListener('click', (e) => {
    e.preventDefault(); 
    fabContainer.classList.add('is-open');
  });

  // Numaralardan birine tıklanınca aramaya geçerken buton tekrar eski haline dönsün
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        fabContainer.classList.remove('is-open');
      }, 350); // CSS animasyon süresiyle uyumlu bekleme
    });
  });

  // Yanlışlıkla açıldıysa boşluğa tıklayarak kapatabilmek için
  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target) && fabContainer.classList.contains('is-open')) {
      fabContainer.classList.remove('is-open');
    }
  });
});

})();
