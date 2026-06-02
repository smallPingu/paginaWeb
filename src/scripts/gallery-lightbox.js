/**
 * Simple lightbox for gallery images
 * Lightweight, no dependencies, keyboard accessible
 */

export function initLightbox(gallerySelector = '#gallery-grid') {
  const gallery = document.querySelector(gallerySelector);
  if (!gallery) return;

  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.className = 'fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300';
  overlay.innerHTML = `
    <button class="absolute top-4 right-4 text-white/80 hover:text-white text-2xl p-2" id="lb-close" aria-label="Cerrar">&times;</button>
    <button class="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl p-2" id="lb-prev" aria-label="Anterior">&#8249;</button>
    <img class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" id="lb-img" src="" alt="" />
    <button class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl p-2" id="lb-next" aria-label="Siguiente">&#8250;</button>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('#lb-img');
  const close = overlay.querySelector('#lb-close');
  const prev = overlay.querySelector('#lb-prev');
  const next = overlay.querySelector('#lb-next');

  const items = Array.from(gallery.querySelectorAll('[data-gallery-item]'));
  let currentIndex = 0;

  function open(index) {
    currentIndex = index;
    const item = items[index];
    const src = item.getAttribute('data-full') || item.querySelector('img')?.src || '';
    const alt = item.querySelector('img')?.alt || '';
    img.src = src;
    img.alt = alt;
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  function showPrev() {
    if (currentIndex > 0) open(currentIndex - 1);
  }

  function showNext() {
    if (currentIndex < items.length - 1) open(currentIndex + 1);
  }

  // Event listeners
  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      open(i);
    });
    item.style.cursor = 'pointer';
  });

  close.addEventListener('click', closeLightbox);
  prev.addEventListener('click', showPrev);
  next.addEventListener('click', showNext);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('opacity-0')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
  });

  return { open, close: closeLightbox };
}
