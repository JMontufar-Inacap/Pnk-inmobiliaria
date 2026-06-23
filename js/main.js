
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar') || document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

const revealEls = document.querySelectorAll('.prop-card, .step, .kpi-card, .deco-card');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .5s ${i * 0.08}s ease, transform .5s ${i * 0.08}s ease`;
    obs.observe(el);
  });
}

const rutInputs = document.querySelectorAll('input[placeholder*="12.345"]');
rutInputs.forEach(input => {
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9kK]/g, '');
    if (val.length > 1) {
      const dv = val.slice(-1);
      let body = val.slice(0, -1);
      body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      e.target.value = body + '-' + dv;
    }
  });
});

const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
  else a.classList.remove('active');
});
