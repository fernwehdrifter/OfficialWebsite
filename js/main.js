// main.js - video carousel + places/packages + modal slider
document.addEventListener('DOMContentLoaded', () => {
  /* ----------------- Video carousel (robust) ----------------- */
  const carousel = document.getElementById('videoCarousel');
  const videoSlides = carousel ? carousel.querySelectorAll('.video-slide') : [];
  let vCurrent = 0;

  // Ensure carousel element has transition (in case CSS was overridden)
  if (carousel) {
    carousel.style.transition = carousel.style.transition || 'transform 0.5s ease';
    carousel.style.willChange = 'transform';
  }

  function loadVideo(slide) {
    if (!slide || slide.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    // add ?rel=0 to avoid related videos from other channels
    iframe.src = slide.dataset.video + '?rel=0';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    slide.appendChild(iframe);
  }

  function updateVideoCarousel() {
    if (!carousel) return;
    const offset = -vCurrent * 100;
    carousel.style.transform = `translateX(${offset}%)`;
    loadVideo(videoSlides[vCurrent]);
  }

  // next / prev handlers with safe guards
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (!videoSlides.length) return;
    vCurrent = (vCurrent + 1) % videoSlides.length;
    updateVideoCarousel();
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (!videoSlides.length) return;
    vCurrent = (vCurrent - 1 + videoSlides.length) % videoSlides.length;
    updateVideoCarousel();
  });

  // init
  if (videoSlides.length) loadVideo(videoSlides[0]);
  window.addEventListener('resize', updateVideoCarousel);

  /* ----------------- Sample data: places & packages ----------------- */
  const samplePlaces = [
    { name: 'Himalayan Retreat', images: ['https://picsum.photos/seed/himalaya1/1200/800','https://picsum.photos/seed/himalaya2/1200/800','https://picsum.photos/seed/himalaya3/1200/800'], desc: 'Nestled in the serene mountains — cozy homestays with guided treks.' },
    { name: 'Goa Beachfront', images: ['https://picsum.photos/seed/goa1/1200/800','https://picsum.photos/seed/goa2/1200/800'], desc: 'Luxury beachfront homestays with private cabana and sea views.' },
    { name: 'Rajasthan Haveli', images: ['https://picsum.photos/seed/raj1/1200/800','https://picsum.photos/seed/raj2/1200/800'], desc: 'Palatial haveli stays — royal interiors and cultural evenings.' }
  ];

  const samplePackages = [
    { name: 'Royal Rajasthan', images:['https://picsum.photos/seed/raja1/1200/800','https://picsum.photos/seed/raja2/1200/800'], desc: '7 days of regal desert charm — forts, palaces & private safaris.' },
    { name: 'Kerala Backwaters', images:['https://picsum.photos/seed/kerala1/1200/800','https://picsum.photos/seed/kerala2/1200/800'], desc: 'Houseboat experience, spice plantation visit, and Ayurveda relaxation.' },
    { name: 'Himalayan Wellness', images:['https://picsum.photos/seed/hw1/1200/800','https://picsum.photos/seed/hw2/1200/800'], desc: 'Yoga, meditation and mountain walks with homestay hospitality.' }
  ];

  /* ----------------- Render grids ----------------- */
  const placesGrid = document.getElementById('placesGrid');
  const packagesGrid = document.getElementById('packagesGrid');

  function createCard(item, type) {
    const article = document.createElement('article');
    article.className = 'card';
    const thumb = item.images && item.images[0] ? item.images[0] : 'https://picsum.photos/seed/default/800/600';
    article.innerHTML = `<img src="${thumb}" alt="${item.name}"><div class="card-content"><h3>${item.name}</h3><p>${item.desc}</p></div>`;
    article.addEventListener('click', () => openModal(item, type));
    return article;
  }

  samplePlaces.forEach(p => placesGrid.appendChild(createCard(p, 'place')));
  samplePackages.forEach(p => packagesGrid.appendChild(createCard(p, 'package')));

  /* ----------------- Modal + slider ----------------- */
  const modalContainer = document.getElementById('modalContainer');
  const modalInner = document.getElementById('modalInner');
  const modalCloseBtn = document.querySelector('.modal-close');

  let sliderState = { images: [], index: 0 };

  function openModal(item, type) {
    sliderState.images = item.images || [];
    sliderState.index = 0;
    modalInner.innerHTML = buildModalHTML(item);
    modalContainer.classList.remove('hidden');
    modalContainer.setAttribute('aria-hidden', 'false');
    // focus for accessibility
    const firstFocusable = modalInner.querySelector('#sliderPrev') || modalInner;
    firstFocusable && firstFocusable.focus();
    attachModalHandlers();
    updateSlider();
  }

  function buildModalHTML(item) {
    const imagesHTML = sliderState.images.map((src, i) => `<div class="slide" data-idx="${i}" style="display:${i===0?'block':'none'}"><img src="${src}" alt="${item.name} image ${i+1}"></div>`).join('');
    return `
      <div class="modal-slider" id="modalSlider">
        ${imagesHTML}
        <div class="slider-controls">
          <button class="slider-btn" id="sliderPrev" aria-label="Previous image">&larr;</button>
          <button class="slider-btn" id="sliderNext" aria-label="Next image">&rarr;</button>
        </div>
      </div>
      <div class="modal-body">
        <h2>${item.name}</h2>
        <p>${item.desc}</p>
      </div>
    `;
  }

  function attachModalHandlers() {
    // controls
    const prevBtn = modalInner.querySelector('#sliderPrev');
    const nextBtn = modalInner.querySelector('#sliderNext');
    prevBtn && prevBtn.addEventListener('click', () => showSlide(sliderState.index - 1));
    nextBtn && nextBtn.addEventListener('click', () => showSlide(sliderState.index + 1));

    // overlay click closes when clicked outside modal-content
    modalContainer.addEventListener('click', overlayClick);

    // keyboard events
    document.addEventListener('keydown', keyHandler);

    // swipe support
    const slider = modalInner.querySelector('#modalSlider');
    if (slider) {
      let startX = 0, endX = 0;
      slider.addEventListener('touchstart', e => startX = e.touches[0].clientX);
      slider.addEventListener('touchmove', e => endX = e.touches[0].clientX);
      slider.addEventListener('touchend', () => {
        if (startX - endX > 30) showSlide(sliderState.index + 1);
        if (endX - startX > 30) showSlide(sliderState.index - 1);
      });
    }
  }

  function overlayClick(e) {
    if (e.target === modalContainer) closeModal();
  }

  function keyHandler(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showSlide(sliderState.index - 1);
    if (e.key === 'ArrowRight') showSlide(sliderState.index + 1);
  }

  function closeModal() {
    modalContainer.classList.add('hidden');
    modalContainer.setAttribute('aria-hidden', 'true');
    modalInner.innerHTML = '';
    // cleanup
    modalContainer.removeEventListener('click', overlayClick);
    document.removeEventListener('keydown', keyHandler);
  }

  modalCloseBtn && modalCloseBtn.addEventListener('click', closeModal);

  function showSlide(idx) {
    if (!sliderState.images.length) return;
    if (idx < 0) idx = sliderState.images.length - 1;
    if (idx >= sliderState.images.length) idx = 0;
    sliderState.index = idx;
    updateSlider();
  }

  function updateSlider() {
    const slides = modalInner.querySelectorAll('.slide');
    slides.forEach(s => s.style.display = 'none');
    const active = modalInner.querySelector(`.slide[data-idx="${sliderState.index}"]`);
    if (active) active.style.display = 'block';
  }

});
