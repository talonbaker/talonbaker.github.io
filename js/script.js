// Update active nav link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Button scroll handling
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', (e) => {
    if (button.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = button.getAttribute('href').slice(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Art carousel
class Carousel {
  constructor(el) {
    this.track = el.querySelector('.carousel-track');
    this.slides = Array.from(el.querySelectorAll('.carousel-slide'));
    this.prevBtn = el.querySelector('.carousel-prev');
    this.nextBtn = el.querySelector('.carousel-next');
    this.index = 0;

    this.prevBtn.addEventListener('click', () => this.move(-1));
    this.nextBtn.addEventListener('click', () => this.move(1));
    window.addEventListener('resize', () => this.update());
    this.update();
  }

  visibleCount() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  maxIndex() {
    return Math.max(0, this.slides.length - this.visibleCount());
  }

  move(dir) {
    this.index = Math.max(0, Math.min(this.maxIndex(), this.index + dir));
    this.update();
  }

  update() {
    const max = this.maxIndex();
    this.index = Math.min(this.index, max);
    const slide = this.slides[0];
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(this.track).gap) || 24;
    const step = slide.getBoundingClientRect().width + gap;
    this.track.style.transform = `translateX(-${this.index * step}px)`;
    this.prevBtn.disabled = this.index === 0;
    this.nextBtn.disabled = this.index >= max;
  }
}

document.querySelectorAll('.carousel').forEach(el => new Carousel(el));

// Point-up hand — show only when scrolled to the very bottom
const pointUpHand = document.querySelector('.point-up-hand');
if (pointUpHand) {
  function checkScrollBottom() {
    const distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    pointUpHand.style.opacity = distFromBottom < 80 ? '1' : '0';
  }
  window.addEventListener('scroll', checkScrollBottom, { passive: true });
  checkScrollBottom();
}
