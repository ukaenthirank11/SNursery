const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const revealEls = document.querySelectorAll('.reveal');
const statNumbers = document.querySelectorAll('.stat-card strong[data-count]');
const form = document.getElementById('enquiryForm');
const successMessage = document.getElementById('successMessage');
const heroVisual = document.querySelector('.hero-visual');
const faqItems = document.querySelectorAll('.faq-item');

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: targetId === '#home' ? 'start' : 'start' });
    mainNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (event) => {
  if (mainNav && menuToggle && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.16 });

revealEls.forEach((el) => observer.observe(el));

statNumbers.forEach((node) => observer.observe(node.closest('.stat-card')));

function animateCount(node) {
  const target = Number(node.dataset.count || 0);
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    node.textContent = `${value}${target >= 100 ? (target === 100 ? '%' : '+') : ''}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const node = entry.target.querySelector('strong[data-count]');
    if (node && !node.dataset.counted) {
      node.dataset.counted = 'true';
      animateCount(node);
    }
    obs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach((card) => statObserver.observe(card));

if (heroVisual && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  let rafId = null;

  heroVisual.addEventListener('pointermove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      heroVisual.style.setProperty('--hero-x', `${x * 10}px`);
      heroVisual.style.setProperty('--hero-y', `${y * 10}px`);
    });
  });

  heroVisual.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--hero-x', '0px');
    heroVisual.style.setProperty('--hero-y', '0px');
  });
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  button?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach((other) => {
      other.classList.remove('open');
    });
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

const validators = {
  name: (value) => value.trim().length >= 2,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  phone: (value) => /^[0-9]{10}$/.test(value.replace(/\s+/g, '')),
  description: (value) => value.trim().length >= 8,
};

function setError(field, message) {
  const label = field.closest('label');
  const error = label?.querySelector('.error');
  if (error) error.textContent = message;
}

function clearErrors() {
  form?.querySelectorAll('.error').forEach((el) => {
    el.textContent = '';
  });
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  if (successMessage) successMessage.hidden = true;

  const formData = new FormData(form);
  let isValid = true;

  const messages = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid 10-digit phone number.',
    description: 'Please add a short description.',
  };

  for (const [name, validate] of Object.entries(validators)) {
    const value = String(formData.get(name) ?? '');
    const input = form.elements.namedItem(name);
    if (!validate(value)) {
      isValid = false;
      if (input) setError(input, messages[name]);
    }
  }

  if (!isValid) return;

  form.reset();
  if (successMessage) {
    successMessage.hidden = false;
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
