/* =========================================================
   SANA'S BIRTHDAY WEBSITE — JAVASCRIPT
   ========================================================= */

/* ---- Age counter (live) ---- */
function updateAgeCounter() {
  const birthday = new Date('2005-11-22T00:00:00');
  const now      = new Date();
  const diff     = now - birthday;        // ms since birth

  const totalSec  = Math.floor(diff / 1000);
  const totalMin  = Math.floor(totalSec  / 60);
  const totalHour = Math.floor(totalMin  / 60);
  const totalDay  = Math.floor(totalHour / 24);

  const years  = now.getFullYear() - birthday.getFullYear() -
                 (now < new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate()) ? 1 : 0);
  const months = Math.floor((totalDay % 365) / 30);
  const days   = totalDay  % 30;
  const hours  = totalHour % 24;
  const mins   = totalMin  % 60;
  const secs   = totalSec  % 60;

  document.getElementById('years').textContent   = years;
  document.getElementById('months').textContent  = months;
  document.getElementById('days').textContent    = days;
  document.getElementById('hours').textContent   = hours;
  document.getElementById('minutes').textContent = mins;
  document.getElementById('seconds').textContent = secs;

  // Update age in hero
  document.getElementById('age').textContent = years;
}
updateAgeCounter();
setInterval(updateAgeCounter, 1000);

/* ---- Star canvas ---- */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 2800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height,
        r:    Math.random() * 1.6 + 0.2,
        a:    Math.random(),
        da:   (Math.random() - 0.5) * 0.008,
        hue:  Math.random() > 0.85 ? 15 : 0   // some pinkish stars
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue
        ? `hsla(${s.hue}, 80%, 85%, ${s.a})`
        : `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ---- Floating hearts ---- */
(function spawnHearts() {
  const container = document.querySelector('.floating-hearts');
  const emojis    = ['❤️', '🌙', '✨', '💕', '🌸', '💖', '🩷'];

  function createHeart() {
    const el = document.createElement('span');
    el.className   = 'heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left  = Math.random() * 100 + 'vw';
    el.style.animationDuration = (8 + Math.random() * 10) + 's';
    el.style.animationDelay    = (Math.random() * 4) + 's';
    el.style.fontSize          = (10 + Math.random() * 18) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }

  for (let i = 0; i < 12; i++) createHeart();
  setInterval(createHeart, 1200);
})();

/* ---- Scroll reveal ---- */
(function scrollReveal() {
  const targets = document.querySelectorAll('.message-card, .photo-wrapper, .countdown-grid, .count-box');
  targets.forEach(el => el.setAttribute('data-reveal', ''));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* ---- Parallax on the couple photo ---- */
document.addEventListener('mousemove', (e) => {
  const photo = document.getElementById('couple-photo');
  if (!photo) return;
  const rect = photo.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const dx   = (e.clientX - cx) / window.innerWidth;
  const dy   = (e.clientY - cy) / window.innerHeight;
  photo.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
});

document.getElementById('couple-photo')?.addEventListener('mouseleave', () => {
  const photo = document.getElementById('couple-photo');
  photo.style.transform = '';
});
