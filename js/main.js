// main.js — final corrected version
// Fix: pixel-based translation using carousel container width, not carousel total width

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------- Video Carousel ----------------- */
  const carousel = document.getElementById('videoCarousel');
  const slides = carousel ? carousel.querySelectorAll('.video-slide') : [];
  let current = 0;

  // Load iframe for each slide
  slides.forEach(slide => {
    const url = slide.dataset.video;
    if (url) {
      const iframe = document.createElement('iframe');
      iframe.src = url + (url.includes('?') ? '&rel=0' : '?rel=0');
      iframe.frameBorder = '0';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      slide.appendChild(iframe);
    }
  });

  // Core translation logic
  function slideTo(index) {
    if (!carousel) return;
    const container = carousel.parentElement; // visible frame width
    const viewportWidth = container.getBoundingClientRect().width;
    current = (index + slides.length) % slides.length; // wrap around
    carousel.style.transform = `translateX(${-current * viewportWidth}px)`;
  }

  // Buttons
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  nextBtn?.addEventListener('click', () => slideTo(current + 1));
  prevBtn?.addEventListener('click', () => slideTo(current - 1));

  // On resize, keep alignment perfect
  window.addEventListener('resize', () => slideTo(current));

  // Initialize
  slideTo(0);

  /* ----------------- Sample Data ----------------- */
  const samplePlaces = [
    {
      name: 'Himalayan Retreat',
      images: [
        'https://picsum.photos/seed/himalaya1/1200/800',
        'https://picsum.photos/seed/himalaya2/1200/800',
        'https://picsum.photos/seed/himalaya3/1200/800'
      ],
      desc:
        'Nestled in the serene mountains — cozy homestays with guided treks.'
    },
    {
      name: 'Goa Beachfront',
      images: [
        'https://picsum.photos/seed/goa1/1200/800',
        'https://picsum.photos/seed/goa2/1200/800'
      ],
      desc:
        'Luxury beachfront homestays with private cabana and sea views.'
    },
    {
      name: 'Rajasthan Haveli',
      images: [
        'https://picsum.photos/seed/raj1/1200/800',
        'https://picsum.photos/seed/raj2/1200/800'
      ],
      desc: 'Palatial haveli stays — royal interiors and cultural evenings.'
    }
  ];

  const samplePackages = [
    {
      name: 'Royal Rajasthan',
      images: [
        'https://picsum.photos/seed/raja1/1200/800',
        'https://picsum.photos/seed/raja2/1200/800'
      ],
      desc:
        '7 days of regal desert charm — forts, palaces & private safaris.'
    },
    {
      name: 'Kerala Backwaters',
      images: [
        'https://picsum.photos/seed/kerala1/1200/800',
        'https://picsum.photos/seed/kerala2/1200/800'
      ],
      desc:
        'Houseboat experience, spice plantation visit, and Ayurveda relaxation.'
    },
    {
      name: 'Himalayan Wellness',
      images: [
        'https://picsum.photos/seed/hw1/1200/800',
        'https://picsum.photos/seed/hw2/1200/800'
      ],
      desc:
        'Yoga, meditation and mountain walks with homestay hospitality.'
    }
  ];

  /* ----------------- Render Cards ----------------- */
  const placesGrid = document.getElementById('placesGrid');
  const packagesGrid = document.getElementById('packagesGrid');

  function createCard(item) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${item.images[0]}" alt="${item.name}">
      <div class="card-content">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `;
    el.addEventListener('click', () => openModal(item));
    return el;
  }

  samplePlaces.forEach(p => placesGrid.appendChild(createCard(p)));
  samplePackages.forEach(p => packagesGrid.appendChild(createCard(p)));

  /* ----------------- Modal with Slider ----------------- */
  const modal = document.getElementById('modalContainer');
  const modalInner = document.getElementById('modalInner');
  const closeBtn = document.querySelector('.modal-close');
  let activeImages = [];
  let activeIndex = 0;

  function openModal(item) {
    activeImages = item.images;
    activeIndex = 0;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    renderModal(item);
  }

  function renderModal(item) {
    const slides = activeImages
      .map(
        (img, i) => `
        <div class="slide" data-idx="${i}" style="display:${
          i === activeIndex ? 'block' : 'none'
        }">
          <img src="${img}" alt="${item.name} ${i + 1}">
        </div>`
      )
      .join('');
    modalInner.innerHTML = `
      <div class="modal-slider" id="modalSlider">
        ${slides}
        <div class="slider-controls">
          <button class="slider-btn" id="prevImg">&larr;</button>
          <button class="slider-btn" id="nextImg">&rarr;</button>
        </div>
      </div>
      <div class="modal-body">
        <h2>${item.name}</h2>
        <p>${item.desc}</p>
      </div>
    `;

    document
      .getElementById('prevImg')
      .addEventListener('click', () => showSlide(activeIndex - 1));
    document
      .getElementById('nextImg')
      .addEventListener('click', () => showSlide(activeIndex + 1));
  }

  function showSlide(i) {
    if (i < 0) i = activeImages.length - 1;
    if (i >= activeImages.length) i = 0;
    activeIndex = i;
    const slides = modalInner.querySelectorAll('.slide');
    slides.forEach(s => (s.style.display = 'none'));
    slides[activeIndex].style.display = 'block';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    modalInner.innerHTML = '';
  }
});
