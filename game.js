/* =====================================================
   CUPID'S ARROW — INTRO GAME
   Move mouse to aim · Click to shoot · Hit the heart
   ===================================================== */

(function () {
  const overlay  = document.getElementById('intro-overlay');
  const canvas   = document.getElementById('gameCanvas');
  const ctx      = canvas.getContext('2d');
  const hint     = document.getElementById('intro-hint');
  const ripple   = document.getElementById('burst-ripple');

  let W, H;
  let mouse      = { x: 0, y: 0 };
  let arrow      = null;       // flying arrow object
  let particles  = [];         // burst particles
  let bgStars    = [];         // background star field
  let heartScale = 1;
  let heartPulse = 0;
  let shot       = false;
  let done       = false;
  let raf;

  // ── Heart target position (centre of screen) ──────
  function heartPos() { return { x: W / 2, y: H / 2 - 20 }; }

  // ── Bow position (bottom-left area) ───────────────
  function bowPos() { return { x: 90, y: H - 110 }; }

  /* ------------------------------------------------
     RESIZE
  ------------------------------------------------ */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  /* ------------------------------------------------
     BACKGROUND STARS
  ------------------------------------------------ */
  function buildStars() {
    bgStars = [];
    const n = Math.floor((W * H) / 3000);
    for (let i = 0; i < n; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.006,
      });
    }
  }

  function drawStars() {
    bgStars.forEach(s => {
      s.a += s.da;
      if (s.a < 0.1 || s.a > 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
  }

  /* ------------------------------------------------
     DRAW HEART (canvas path)
  ------------------------------------------------ */
  function heartPath(cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo( 25, -50,  60, -20,  0,  20);
    ctx.bezierCurveTo(-60, -20, -25, -50,  0, -20);
    ctx.restore();
  }

  function drawHeart(glow) {
    const { x, y } = heartPos();
    heartPulse += 0.04;
    const sc = heartScale * (1 + Math.sin(heartPulse) * 0.04);

    // outer glow rings
    if (glow) {
      for (let i = 3; i >= 1; i--) {
        ctx.save();
        heartPath(x, y, sc * (1 + i * 0.18));
        ctx.fillStyle = `rgba(232,99,122,${0.04 * i})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // main heart
    heartPath(x, y, sc);
    const grad = ctx.createRadialGradient(x - 8 * sc, y - 15 * sc, 2, x, y, 55 * sc);
    grad.addColorStop(0, '#ff8fa3');
    grad.addColorStop(0.5, '#e8637a');
    grad.addColorStop(1, '#c0415a');
    ctx.fillStyle = grad;
    ctx.fill();

    // inner shine
    heartPath(x, y, sc * 0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();

    // stroke
    heartPath(x, y, sc);
    ctx.strokeStyle = 'rgba(255,180,190,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ------------------------------------------------
     BOW & AIM LINE
  ------------------------------------------------ */
  function drawBow() {
    const bp = bowPos();
    const hp = heartPos();

    // angle from bow to mouse
    const angle = Math.atan2(mouse.y - bp.y, mouse.x - bp.x);

    ctx.save();
    ctx.translate(bp.x, bp.y);
    ctx.rotate(angle);

    // dotted aim line to heart
    if (!shot) {
      const dist = Math.hypot(hp.x - bp.x, hp.y - bp.y);
      ctx.setLineDash([6, 10]);
      ctx.strokeStyle = 'rgba(232,99,122,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(dist, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // BOW ARC
    ctx.strokeStyle = '#d4a96a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 30, -Math.PI * 0.65, Math.PI * 0.65);
    ctx.stroke();

    // bow string
    ctx.strokeStyle = 'rgba(255,220,160,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30 * Math.cos(-Math.PI * 0.65), 30 * Math.sin(-Math.PI * 0.65));
    ctx.lineTo(shot ? 20 : -6, 0);
    ctx.lineTo(30 * Math.cos(Math.PI * 0.65), 30 * Math.sin(Math.PI * 0.65));
    ctx.stroke();

    // ARROW on bow (before firing)
    if (!shot) {
      drawArrowShape(shot ? 20 : -6, 0, 48, '#f0c27f', '#fff8e7');
    }

    ctx.restore();
  }

  /* draw an arrow shape at local coords */
  function drawArrowShape(tailX, tailY, len, shaftColor, tipColor) {
    // shaft
    ctx.strokeStyle = shaftColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX + len, tailY);
    ctx.stroke();

    // arrowhead
    ctx.fillStyle = tipColor;
    ctx.beginPath();
    ctx.moveTo(tailX + len + 10, tailY);
    ctx.lineTo(tailX + len - 2, tailY - 5);
    ctx.lineTo(tailX + len - 2, tailY + 5);
    ctx.closePath();
    ctx.fill();

    // fletching (feathers)
    ctx.strokeStyle = 'rgba(255,180,180,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tailX + 10, tailY);
    ctx.lineTo(tailX,      tailY - 8);
    ctx.moveTo(tailX + 10, tailY);
    ctx.lineTo(tailX,      tailY + 8);
    ctx.stroke();
  }

  /* ------------------------------------------------
     FLYING ARROW
  ------------------------------------------------ */
  function drawFlyingArrow() {
    if (!arrow) return;
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle);
    drawArrowShape(-24, 0, 48, '#f0c27f', '#fff8e7');
    ctx.restore();

    // Check hit
    const { x: hx, y: hy } = heartPos();
    if (Math.hypot(arrow.x - hx, arrow.y - hy) < 50 * heartScale) {
      hitHeart();
    }

    // Off screen — miss, reset
    if (arrow.x < -100 || arrow.x > W + 100 || arrow.y < -100 || arrow.y > H + 100) {
      arrow = null;
      shot  = false;
    }
  }

  /* ------------------------------------------------
     SHOOT
  ------------------------------------------------ */
  function shoot() {
    if (shot || done) return;
    shot = true;
    hint.style.opacity = '0';

    const bp    = bowPos();
    const angle = Math.atan2(mouse.y - bp.y, mouse.x - bp.x);
    const speed = 18;

    arrow = {
      x: bp.x + Math.cos(angle) * 30,
      y: bp.y + Math.sin(angle) * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
    };
  }

  /* ------------------------------------------------
     HIT HEART — burst + reveal
  ------------------------------------------------ */
  function hitHeart() {
    if (done) return;
    done  = true;
    arrow = null;

    const { x, y } = heartPos();

    // Spawn particles
    for (let i = 0; i < 90; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 2 + Math.random() * 9;
      const size   = 4 + Math.random() * 10;
      const isHeart = Math.random() > 0.4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        alpha: 1,
        size,
        isHeart,
        color: isHeart
          ? `hsl(${340 + Math.random() * 30},85%,${55 + Math.random() * 20}%)`
          : `hsl(${35 + Math.random() * 20},90%,${65 + Math.random() * 20}%)`,
        decay: 0.012 + Math.random() * 0.016,
      });
    }

    // Ripple ring
    ripple.style.left   = x + 'px';
    ripple.style.top    = y + 'px';
    ripple.classList.add('active');

    // After burst animation — fade overlay & show page
    setTimeout(() => {
      overlay.style.transition = 'opacity 1.2s cubic-bezier(.4,0,.2,1)';
      overlay.style.opacity    = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        cancelAnimationFrame(raf);
      }, 1300);
    }, 900);
  }

  /* ------------------------------------------------
     DRAW PARTICLES
  ------------------------------------------------ */
  function drawParticles() {
    particles = particles.filter(p => p.alpha > 0.02);
    particles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.18;   // gravity
      p.vx    *= 0.97;
      p.alpha -= p.decay;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.isHeart) {
        // mini heart
        ctx.translate(p.x, p.y);
        ctx.scale(p.size / 55, p.size / 55);
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.bezierCurveTo( 25, -50,  60, -20,  0,  20);
        ctx.bezierCurveTo(-60, -20, -25, -50,  0, -20);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        // sparkle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /* ------------------------------------------------
     LABEL ABOVE HEART (before shot)
  ------------------------------------------------ */
  function drawHeartLabel() {
    if (shot) return;
    const { x, y } = heartPos();
    ctx.save();
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(244,163,181,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 hit me!', x, y - 72);
    ctx.restore();
  }

  /* ------------------------------------------------
     MAIN LOOP
  ------------------------------------------------ */
  function loop() {
    ctx.clearRect(0, 0, W, H);

    // deep dark bg
    ctx.fillStyle = '#07050f';
    ctx.fillRect(0, 0, W, H);

    drawStars();

    if (!done) {
      drawHeart(true);
      drawHeartLabel();
      drawBow();
      drawFlyingArrow();
    } else {
      // heart shatters — scale down
      if (heartScale > 0) {
        heartScale = Math.max(0, heartScale - 0.08);
        drawHeart(false);
      }
      drawParticles();
    }

    raf = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------
     EVENTS
  ------------------------------------------------ */
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Touch support
  window.addEventListener('touchmove', e => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('click', shoot);

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    shoot();
  });

  window.addEventListener('resize', resize);

  /* ------------------------------------------------
     INIT
  ------------------------------------------------ */
  resize();
  // start mouse near bow to feel natural
  mouse = { x: bowPos().x + 200, y: bowPos().y - 150 };
  loop();

})();
