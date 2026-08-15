document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const navLinks = nav ? [...nav.querySelectorAll('a')] : [];

function closeMenu(returnFocus = false) {
  if (!toggle || !nav) return;
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) toggle.focus();
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    if (willOpen && navLinks.length) navLinks[0].focus();
  });

  navLinks.forEach(link => link.addEventListener('click', () => closeMenu(false)));

  document.addEventListener('keydown', event => {
    if (!nav.classList.contains('open')) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const focusable = [toggle, ...navLinks];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu(false);
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = [...document.querySelectorAll('.reveal')];

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(el => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(el);
  });
}

const counters = [...document.querySelectorAll('.counter[data-count]')];
if (!reducedMotion && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const duration = 900;
      const animate = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterObserver.unobserve(el);
    });
  }, { threshold: .6 });
  counters.forEach(el => counterObserver.observe(el));
}

const form = document.querySelector('#interest-form');
if (form) {
  const name = form.querySelector('#name');
  const email = form.querySelector('#email');
  const status = form.querySelector('#form-status');
  const nameError = form.querySelector('#name-error');
  const emailError = form.querySelector('#email-error');

  const validate = () => {
    let valid = true;
    nameError.textContent = '';
    emailError.textContent = '';
    name.removeAttribute('aria-invalid');
    email.removeAttribute('aria-invalid');

    if (!name.value.trim()) {
      nameError.textContent = 'Please enter your name.';
      name.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (!email.value.trim()) {
      emailError.textContent = 'Please enter your email address.';
      email.setAttribute('aria-invalid', 'true');
      valid = false;
    } else if (!email.validity.valid) {
      emailError.textContent = 'Please enter a valid email address.';
      email.setAttribute('aria-invalid', 'true');
      valid = false;
    }
    return valid;
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = '';
    if (!validate()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    status.textContent = 'Thank you. This demo form is ready to be connected to the campaign’s email or CRM service.';
  });
}
