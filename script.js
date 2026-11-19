/* =========================================================
   SANA'S BIRTHDAY — JAVASCRIPT
   ========================================================= */

/* ---- Twinkling star canvas ---- */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const n = Math.floor((canvas.width * canvas.height) / 2600);
    for (let i = 0; i < n; i++) {
      stars.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.4 + 0.2,
        a:  Math.random(),
        da: (Math.random() - 0.5) * 0.007,
        pink: Math.random() > 0.88,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.pink
        ? `hsla(345, 80%, 85%, ${s.a})`
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
  if (!container) return;
  const emojis = ['❤️', '🌙', '✨', '💕', '🌸', '💖'];

  function create() {
    const el = document.createElement('span');
    el.className = 'heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left              = Math.random() * 100 + 'vw';
    el.style.animationDuration = (9 + Math.random() * 10) + 's';
    el.style.animationDelay   = (Math.random() * 3) + 's';
    el.style.fontSize          = (9 + Math.random() * 14) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 22000);
  }

  for (let i = 0; i < 10; i++) create();
  setInterval(create, 1400);
})();

/* ---- Scroll reveal ---- */
(function scrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => io.observe(el));
})();

/* ---- Subtle photo parallax (desktop only) ---- */
window.addEventListener('mousemove', e => {
  const photo = document.getElementById('couple-photo');
  if (!photo || window.innerWidth < 768) return;
  const rect = photo.getBoundingClientRect();
  const dx = (e.clientX - (rect.left + rect.width  / 2)) / window.innerWidth;
  const dy = (e.clientY - (rect.top  + rect.height / 2)) / window.innerHeight;
  photo.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg) scale(1.015)`;
});

document.getElementById('couple-photo')?.addEventListener('mouseleave', () => {
  const p = document.getElementById('couple-photo');
  if (p) p.style.transform = '';
});
