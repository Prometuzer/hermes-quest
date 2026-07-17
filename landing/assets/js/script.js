// HERMES landing page — interactions légères
// Scroll reveal + parallax léger sur le hero

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll reveal
  const revealTargets = document.querySelectorAll(
    '.feature-card, .lore-text p, .lore-quote blockquote, .gateway-left, .gateway-right, .download-card'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));

  // 2. Parallax léger sur les étoiles du hero
  const stars = document.querySelector('.hero-stars');
  if (stars) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        stars.style.transform = `translateY(${y * 0.3}px)`;
      }
    }, { passive: true });
  }

  // 3. Boutons "Télécharger" — pour le MVP, scroll vers le repo
  document.querySelectorAll('.btn-primary').forEach(btn => {
    if (btn.getAttribute('href') === '#') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = document.createElement('div');
        msg.style.cssText = `
          position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
          background: rgba(212,255,138,0.1); border: 1px solid #d4ff8a;
          color: #d4ff8a; padding: 12px 24px; border-radius: 8px;
          font-size: 13px; z-index: 9999; backdrop-filter: blur(8px);
          font-family: 'Inter', sans-serif;
        `;
        msg.textContent = 'Builds binaires à venir — clone le repo GitHub pour jouer dès maintenant.';
        document.body.appendChild(msg);
        setTimeout(() => {
          msg.style.opacity = '0';
          msg.style.transition = 'opacity 0.4s';
          setTimeout(() => msg.remove(), 400);
        }, 3000);
      });
    }
  });
});
