---
title: "Art & Creative Portfolio"
layout: single
permalink: /art/
---

# **Art & Creative Work**
My passion for programming is complemented by a strong foundation in visual arts. I use this dual skill set to bring a design eye to software.

---

<div class="art-carousel-wrapper">
  <div class="art-carousel" id="artCarousel">
    <div class="art-carousel__track" id="carouselTrack">
      <div class="art-carousel__slide">
        <img src="/assets/images/art/1.png" alt="Art piece 1" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/35.png" alt="Art piece 2" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/44.png" alt="Art piece 3" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/30.png" alt="Art piece 4" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/27.png" alt="Art piece 5" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/24.png" alt="Art piece 6" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/34.png" alt="Art piece 7" />
      </div>
      <div class="art-carousel__slide">
        <img src="/assets/images/art/38.png" alt="Art piece 8" />
      </div>
    </div>
  </div>

  <button class="art-carousel__btn art-carousel__btn--prev" id="prevBtn" aria-label="Previous">&#8592;</button>
  <button class="art-carousel__btn art-carousel__btn--next" id="nextBtn" aria-label="Next">&#8594;</button>

  <div class="art-carousel__dots" id="carouselDots"></div>
</div>

<div style="text-align:center; margin-top:1.5rem;">
  <a href="https://www.instagram.com/talonpencil/" target="_blank" rel="noopener" class="btn btn--primary">
    <i class="fab fa-instagram"></i>&nbsp; See more on Instagram &rarr; @talonpencil
  </a>
</div>

<style>
.art-carousel-wrapper {
  position: relative;
  max-width: 720px;
  margin: 1.5rem auto;
  user-select: none;
}

.art-carousel {
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(100,255,218,0.18);
  background: #0a0a0a;
}

.art-carousel__track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.art-carousel__slide {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.art-carousel__slide img {
  width: 100%;
  height: 480px;
  object-fit: contain;
  display: block;
  background: #0a0a0a;
}

.art-carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10,10,10,0.75);
  color: #64ffda;
  border: 1px solid rgba(100,255,218,0.35);
  border-radius: 4px;
  width: 38px;
  height: 52px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, border-color 0.2s;
  line-height: 1;
}
.art-carousel__btn:hover {
  background: rgba(100,255,218,0.12);
  border-color: #64ffda;
}
.art-carousel__btn--prev { left: -48px; }
.art-carousel__btn--next { right: -48px; }

@media (max-width: 860px) {
  .art-carousel__btn--prev { left: 4px; }
  .art-carousel__btn--next { right: 4px; }
}

.art-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}
.art-carousel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(100,255,218,0.25);
  border: 1px solid rgba(100,255,218,0.4);
  cursor: pointer;
  transition: background 0.2s;
}
.art-carousel__dot--active {
  background: #64ffda;
}
</style>

<script>
(function() {
  const track    = document.getElementById('carouselTrack');
  const dotsEl   = document.getElementById('carouselDots');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const slides   = track.querySelectorAll('.art-carousel__slide');
  const total    = slides.length;
  let current    = 0;
  let timer;

  // Build dots
  slides.forEach(function(_, i) {
    const d = document.createElement('button');
    d.className = 'art-carousel__dot' + (i === 0 ? ' art-carousel__dot--active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', function() { goTo(i); resetTimer(); });
    dotsEl.appendChild(d);
  });

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dotsEl.querySelectorAll('.art-carousel__dot').forEach(function(d, i) {
      d.classList.toggle('art-carousel__dot--active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 4000);
  }

  nextBtn.addEventListener('click', function() { next(); resetTimer(); });
  prevBtn.addEventListener('click', function() { prev(); resetTimer(); });

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetTimer(); }
  }, { passive: true });

  resetTimer();
})();
</script>
