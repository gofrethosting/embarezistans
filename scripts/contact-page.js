/**
 * contact-page.js
 * İletişim sayfasındaki tıklanabilir bilgi kartları için Action Menu (Seçenekler)
 */

export function initContactPage() {
  const contactBoxes = document.querySelectorAll('.contact-box');
  if (contactBoxes.length === 0) return;

  // Menü DOM'unu oluştur
  const actionMenu = document.createElement('div');
  actionMenu.className = 'action-menu';
  
  const copyBtn = document.createElement('button');
  const openBtn = document.createElement('button');
  const whatsappBtn = document.createElement('button'); // 3. Seçenek WhatsApp
  
  actionMenu.appendChild(copyBtn);
  actionMenu.appendChild(openBtn);
  actionMenu.appendChild(whatsappBtn);

  let currentTarget = null;
  let currentValue = '';
  let currentActionUrl = '';

  const hideMenu = () => {
    actionMenu.classList.remove('is-active');
  };

  contactBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Aynı kutuya tekrar tıklanırsa kapat
      if (currentTarget === box && actionMenu.classList.contains('is-active')) {
        hideMenu();
        return;
      }

      currentTarget = box;
      currentValue = box.getAttribute('data-value');
      currentActionUrl = box.getAttribute('data-action');
      const actionType = box.getAttribute('data-type'); // "address", "mail", "phone"

      // Buton metinlerini türüne göre ayarla
      copyBtn.innerText = 'Kopyala';
      
      if (actionType === 'address') {
        openBtn.innerText = 'Haritaları Aç';
        whatsappBtn.style.display = 'none'; // Sadece telefonda görünsün
      } else if (actionType === 'mail') {
        openBtn.innerText = 'Mail Uygulamasını Aç';
        whatsappBtn.style.display = 'none'; // Sadece telefonda görünsün
      } else if (actionType === 'phone') {
        openBtn.innerText = 'Telefonu Aç';
        whatsappBtn.innerText = 'WhatsApp\'tan Yaz';
        whatsappBtn.style.display = 'block'; // Telefon kutusunda görünür
      }

      // Menüyü tıklanan kutunun içine taşı ve göster
      box.appendChild(actionMenu);
      
      // CSS transition'ın tetiklenmesi için bir frame bekle
      requestAnimationFrame(() => {
        actionMenu.classList.add('is-active');
      });
    });
  });

  // Kopyala Aksiyonu
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentValue).then(() => {
      copyBtn.innerText = 'Kopyalandı!';
      setTimeout(() => {
        hideMenu();
      }, 1000); // 1 saniye sonra menüyü kapat
    }).catch(err => {
      console.error('Kopyalama başarısız', err);
      copyBtn.innerText = 'Hata Oluştu';
    });
  });

  // Uygulama/Link Açma Aksiyonu
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMenu();
    // Mailto, tel gibi linkleri doğrudan window.location ile açmak daha iyidir
    if (currentActionUrl.startsWith('http')) {
      window.open(currentActionUrl, '_blank');
    } else {
      window.location.href = currentActionUrl;
    }
  });

  // WhatsApp Açma Aksiyonu
  whatsappBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMenu();
    // Sadece rakamları ayıkla (Örn: +90 500 123 45 67 -> 905001234567)
    const cleanNumber = currentValue.replace(/\D/g, ''); 
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  });

  // Kutuların dışına tıklayınca menüyü kapat
  document.addEventListener('click', hideMenu);
  
  // ESC tuşuyla menüyü kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });
}
