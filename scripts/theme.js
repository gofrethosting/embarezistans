/**
 * theme.js — Asilgen Mühendislik
 * Dark / Light mod geçişi
 * - localStorage'a kaydeder
 * - HTML data-theme attribute'unu günceller
 * - Buton aria-pressed toggle'ı yapar
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Sabitler
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'asilgen-theme';
const DEFAULT_THEME = 'dark';  // Sistem tercihi dikkate alınmaz; varsayılan dark

// ─────────────────────────────────────────────────────────────────────────────
// Başlangıç: Tema yükleme (FOUC'u önlemek için mümkün olduğunca erken çağrılmalı)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sayfanın en başında çalışır.
 * LocalStorage'dan tema okur; bulamazsa dark mod uygular.
 */
function applyInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const theme = stored === 'light' ? 'light' : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', theme);
}

// İlk çağrı — script yüklendiği anda
applyInitialTheme();

// ─────────────────────────────────────────────────────────────────────────────
// Tema Geçiş Fonksiyonu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aktif temayı karşıt temaya geçirir.
 * Tüm .theme-toggle butonlarının aria-pressed'ini günceller.
 * Stars canvas yeniden çizim sinyali yayar.
 */
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') ?? DEFAULT_THEME;
  const next = current === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);

  // Tüm tema butonlarını güncelle (birden fazla olabilir: header + mobil nav)
  updateToggleButtons(next);

  // Yıldız sistemi tema değişikliğini dinler
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: next } }));
}

/**
 * Tüm .theme-toggle butonlarının aria-pressed ve title'ını günceller.
 * @param {string} theme — 'dark' | 'light'
 */
function updateToggleButtons(theme) {
  const buttons = document.querySelectorAll('.theme-toggle');
  buttons.forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    btn.setAttribute('title', theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM Hazır Olunca: Event Listener Ataması
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Buton(lar)a tıklama olayı ata
  const buttons = document.querySelectorAll('.theme-toggle');
  buttons.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Başlangıç aria-pressed değerini ayarla
  const currentTheme = document.documentElement.getAttribute('data-theme') ?? DEFAULT_THEME;
  updateToggleButtons(currentTheme);
});

// ─────────────────────────────────────────────────────────────────────────────
// Dışa Aktarım (ESM)
// ─────────────────────────────────────────────────────────────────────────────
export { toggleTheme, applyInitialTheme };
