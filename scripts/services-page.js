/**
 * services-page.js
 * Hizmet kartları için Expanding Card (FLIP-like) Yönetimi - Daha Yavaş Animasyonlu
 */

export function initServicesPage() {
  const cards = document.querySelectorAll('.sp-card');
  if (cards.length === 0) return;

  const spSection = document.querySelector('.sp-section');

  const overlay = document.createElement('div');
  overlay.className = 'sp-card-backdrop';
  document.body.appendChild(overlay);

  let activeCard = null;
  let placeholder = null;

  const expandCard = (card) => {
    if (activeCard) return;

    if (spSection) spSection.style.zIndex = '10000';

    const rect = card.getBoundingClientRect();
    
    const content = card.querySelector('.card-content');
    if (content) content.style.overflowY = 'hidden';

    placeholder = document.createElement('div');
    placeholder.className = 'sp-card-placeholder';
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    card.parentNode.insertBefore(placeholder, card);

    card.style.position = 'fixed';
    card.style.top = rect.top + 'px';
    card.style.left = rect.left + 'px';
    card.style.width = rect.width + 'px';
    card.style.height = rect.height + 'px';
    card.style.zIndex = '99999';
    card.style.margin = '0';

    card.getBoundingClientRect(); // reflow

    card.classList.add('is-expanded');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';

    // Yeni Hedefler
    card.style.top = '5vh';
    card.style.left = '5vw';
    card.style.width = '90vw';
    card.style.height = '90vh';

    const glow = card.querySelector('.card-glow');
    const particles = card.querySelector('.card-particles');
    if(glow) glow.style.opacity = '0';
    if(particles) particles.style.opacity = '0';

    // Daha yavaş animasyon için 800ms
    setTimeout(() => {
      if (activeCard === card && content) {
        content.style.overflowY = 'auto';
      }
    }, 800);

    activeCard = card;
  };

  const shrinkCard = () => {
    if (!activeCard || !placeholder) return;

    const content = activeCard.querySelector('.card-content');
    if (content) content.style.overflowY = 'hidden';

    const rect = placeholder.getBoundingClientRect();

    activeCard.classList.remove('is-expanded');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';

    activeCard.style.top = rect.top + 'px';
    activeCard.style.left = rect.left + 'px';
    activeCard.style.width = rect.width + 'px';
    activeCard.style.height = rect.height + 'px';

    const glow = activeCard.querySelector('.card-glow');
    const particles = activeCard.querySelector('.card-particles');
    if(glow) glow.style.opacity = '';
    if(particles) particles.style.opacity = '';

    // Küçülme tamamlanınca (800ms)
    setTimeout(() => {
      if (!activeCard) return; // Zaten null ise çık

      activeCard.style.position = '';
      activeCard.style.top = '';
      activeCard.style.left = '';
      activeCard.style.width = '';
      activeCard.style.height = '';
      activeCard.style.zIndex = '';
      activeCard.style.margin = '';
      if (content) content.style.overflowY = '';

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      placeholder = null;
      activeCard = null;

      if (spSection) spSection.style.zIndex = '';
    }, 800);
  };

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.sp-card-close-btn')) return;
      expandCard(card);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'sp-card-close-btn';
    closeBtn.setAttribute('aria-label', 'Kapat');
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      shrinkCard();
    });
    
    card.appendChild(closeBtn);
  });

  overlay.addEventListener('click', shrinkCard);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') shrinkCard();
  });
}
