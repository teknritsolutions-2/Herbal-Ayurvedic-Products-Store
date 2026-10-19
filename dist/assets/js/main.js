(function () {
  const icon = name => ({
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>',
    chevron: '<svg class="dropdown-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>'
  })[name];

  const mainNav = [
    { label: 'About', href: 'about.html', page: 'about' },
    { label: 'Products', href: 'products.html', page: 'products' },
    { label: 'Ingredients', href: 'ingredients.html', page: 'ingredients' },
    { label: 'Doctor Consultation', href: 'consultation.html', page: 'consultation' },
    { label: 'Certifications', href: 'certifications.html', page: 'certifications' },
    { label: 'Contact', href: 'contact.html', page: 'contact' }
  ];

  function shell() {
    const page = document.body.dataset.page || '';
    const isHome = page === 'home' || page === 'home1' || page === 'home2';
    const isHome1 = page === 'home' || page === 'home1' || !page;
    const isHome2 = page === 'home2';

    const header = document.querySelector('[data-site-header]');
    if (header) {
      const headerMarkup = `
        <a class="skip-link" href="#main">Skip to content</a>
        <div class="announcement">Thoughtful botanical goods · Earthy wellness & conscious Ayurvedic rituals</div>
        <header class="site-header">
          <a class="brand" href="index.html" aria-label="VanaVeda home">
            <img class="brand-light" src="../assets/brand/logo-dark.svg" alt="VanaVeda">
            <img class="brand-dark" src="../assets/brand/logo-light.svg" alt="VanaVeda">
          </a>
          <nav class="desktop-nav" aria-label="Primary">
            <div class="nav-dropdown" data-nav-dropdown>
              <button class="nav-dropdown-trigger${isHome ? ' is-active' : ''}" data-nav-dropdown-trigger aria-expanded="false" aria-controls="home-dropdown-menu" aria-haspopup="true">
                <span>Home</span>
                ${icon('chevron')}
              </button>
              <div class="nav-dropdown-menu" id="home-dropdown-menu" data-nav-dropdown-menu role="menu">
                <a href="index.html" role="menuitem"${isHome1 ? ' aria-current="page"' : ''}>Home 1</a>
                <a href="home2.html" role="menuitem"${isHome2 ? ' aria-current="page"' : ''}>Home 2</a>
              </div>
            </div>
            ${mainNav.map(item => `<a href="${item.href}"${page === item.page ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}
          </nav>
          <div class="header-tools">
            <button class="icon-button" data-open-search aria-label="Search">${icon('search')}</button>
            <button class="bag-button" data-open-cart aria-label="Open bag">${icon('bag')}<span>Bag</span><b data-cart-count hidden>0</b></button>
            <button class="icon-button" data-theme-toggle aria-label="Toggle color theme">${icon('sun')}</button>
            <button class="direction-button" data-dir-toggle aria-label="Toggle text direction">RTL</button>
            <button class="icon-button menu-button" data-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="mobile-panel">${icon('menu')}</button>
          </div>
        </header>
        <div class="mobile-panel" id="mobile-panel" data-mobile-panel inert>
          <div class="mobile-panel__top">
            <span>Menu</span>
            <button class="icon-button" data-menu-close aria-label="Close menu">${icon('close')}</button>
          </div>
          <nav aria-label="Mobile">
            <div class="mobile-nav-group">
              <span class="mobile-nav-heading">Home</span>
              <div class="mobile-nav-sub">
                <a href="index.html"${isHome1 ? ' aria-current="page"' : ''}>Home 1</a>
                <a href="home2.html"${isHome2 ? ' aria-current="page"' : ''}>Home 2</a>
              </div>
            </div>
            <a href="about.html"${page === 'about' ? ' aria-current="page"' : ''}>About</a>
            <a href="products.html"${page === 'products' ? ' aria-current="page"' : ''}>Products</a>
            <a href="ingredients.html"${page === 'ingredients' ? ' aria-current="page"' : ''}>Ingredients</a>
            <a href="consultation.html"${page === 'consultation' ? ' aria-current="page"' : ''}>Doctor Consultation</a>
            <a href="certifications.html"${page === 'certifications' ? ' aria-current="page"' : ''}>Certifications</a>
            <a href="contact.html"${page === 'contact' ? ' aria-current="page"' : ''}>Contact</a>
            <a href="cart.html"${page === 'cart' ? ' aria-current="page"' : ''}>Bag (<span data-cart-count-mobile>0</span>)</a>
          </nav>
          <div class="mobile-panel__tools">
            <button class="button button--outline button--small button--full" data-theme-toggle>Toggle Theme (Light/Dark)</button>
            <button class="button button--outline button--small button--full" data-dir-toggle>Direction: <span data-dir-label>RTL</span></button>
          </div>
        </div>`;
      header.insertAdjacentHTML('beforebegin', headerMarkup);
      header.remove();
    }

    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
      footer.innerHTML = `
        <footer class="footer">
          <div class="footer__main">
            <div>
              <a class="footer-brand" href="index.html" aria-label="VanaVeda home">
                <img class="brand-light" src="../assets/brand/logo-light.svg" alt="VanaVeda">
                <img class="brand-dark" src="../assets/brand/logo-dark.svg" alt="VanaVeda">
              </a>
              <p>Botanical goods for considered daily rituals. Clear ingredients, practical directions, no miracle language.</p>
              <button class="button button--outline button--small back-to-top" data-back-to-top aria-label="Back to top">↑ Back to top</button>
            </div>
            <div>
              <h2>Shop</h2>
              <a href="products.html">All Products</a>
              <a href="products.html?category=Herbal%20Teas">Herbal Teas</a>
              <a href="products.html?category=Oils">Oils</a>
              <a href="products.html?category=Supplements">Supplements</a>
              <a href="products.html?category=Skincare">Skincare</a>
              <a href="products.html?category=Hair%20Care">Hair Care</a>
            </div>
            <div>
              <h2>Explore</h2>
              <a href="index.html">Home 1</a>
              <a href="home2.html">Home 2</a>
              <a href="about.html">About</a>
              <a href="ingredients.html">Ingredients Glossary</a>
              <a href="consultation.html">Doctor Consultation</a>
              <a href="certifications.html">Certifications</a>
            </div>
            <div>
              <h2>Support</h2>
              <a href="contact.html">Contact</a>
              <a href="contact.html#wholesale">Wholesale Enquiry</a>
              <a href="faq.html">FAQ</a>
              <a href="shipping-returns.html">Shipping & Returns</a>
              <a href="privacy.html">Privacy</a>
              <a href="terms.html">Terms</a>
              <div class="footer-newsletter">
                <p class="footer-newsletter__title">Stay close</p>
                <form data-local-form class="newsletter">
                  <label class="sr-only" for="footer-email">Email address</label>
                  <input id="footer-email" type="email" placeholder="Email address" required>
                  <button type="submit" aria-label="Join mailing list">→</button>
                  <small data-form-status aria-live="polite"></small>
                </form>
              </div>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© 2026 VanaVeda · Herbal & Ayurvedic Products Store</span>
            <span>Thoughtful botanical goods for daily ritual</span>
          </div>
        </footer>`;
    }

    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-backdrop" data-cart-backdrop></div>
      <aside class="cart-drawer" data-cart-drawer aria-label="Shopping bag">
        <div class="drawer-head">
          <h2>Your bag</h2>
          <button class="icon-button" data-close-cart aria-label="Close bag">${icon('close')}</button>
        </div>
        <div class="mini-cart-items" data-mini-cart-items></div>
        <div class="drawer-foot" data-mini-cart-footer hidden>
          <div>
            <span>Subtotal</span>
            <strong data-mini-subtotal></strong>
          </div>
          <a class="button button--full" href="cart.html">View bag</a>
        </div>
      </aside>
      <div class="search-overlay" data-search-overlay>
        <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search products">
          <button class="icon-button search-close" data-close-search aria-label="Close search">${icon('close')}</button>
          <label for="global-search">Search the store</label>
          <div class="search-field">
            ${icon('search')}
            <input id="global-search" data-global-search type="search" placeholder="Try tulsi, rose, hair oil, tea…" autocomplete="off">
          </div>
          <div class="search-results" data-search-results></div>
        </div>
      </div>`);
  }

  function interactions() {
    const dropdown = document.querySelector('[data-nav-dropdown]');
    const dropdownTrigger = document.querySelector('[data-nav-dropdown-trigger]');
    const dropdownMenu = document.querySelector('[data-nav-dropdown-menu]');
    let dropdownTimeout = null;

    function openDropdown() {
      clearTimeout(dropdownTimeout);
      dropdown?.classList.add('is-open');
      dropdownTrigger?.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      clearTimeout(dropdownTimeout);
      dropdown?.classList.remove('is-open');
      dropdownTrigger?.setAttribute('aria-expanded', 'false');
    }

    if (dropdown && dropdownTrigger) {
      let openedByHover = false;

      dropdownTrigger.addEventListener('click', e => {
        e.stopPropagation();
        if (openedByHover) {
          openedByHover = false;
          openDropdown();
        } else {
          const isOpen = dropdown.classList.contains('is-open');
          isOpen ? closeDropdown() : openDropdown();
        }
      });

      dropdown.addEventListener('mouseenter', () => {
        openDropdown();
        openedByHover = true;
      });

      dropdown.addEventListener('mouseleave', () => {
        openedByHover = false;
        dropdownTimeout = setTimeout(closeDropdown, 250);
      });

      dropdownTrigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown();
          dropdownMenu?.querySelector('a')?.focus();
        }
      });
    }

    function openMobileMenu() {
      const panel = document.querySelector('[data-mobile-panel]');
      const opener = document.querySelector('[data-menu-toggle]');
      if (!panel) return;
      panel.classList.add('is-open');
      panel.removeAttribute('inert');
      document.body.classList.add('no-scroll');
      opener?.setAttribute('aria-expanded', 'true');
      panel.querySelector('a, button')?.focus();
    }

    function closeMobileMenu() {
      const panel = document.querySelector('[data-mobile-panel]');
      const opener = document.querySelector('[data-menu-toggle]');
      if (!panel) return;
      panel.classList.remove('is-open');
      panel.setAttribute('inert', '');
      document.body.classList.remove('no-scroll');
      opener?.setAttribute('aria-expanded', 'false');
      opener?.focus();
    }

    function updateDirLabels(dir) {
      document.querySelectorAll('[data-dir-label]').forEach(el => {
        el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      });
      document.querySelectorAll('.direction-button').forEach(btn => {
        btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      });
    }

    document.addEventListener('click', e => {
      // Mobile menu toggle & close
      if (e.target.closest('[data-menu-toggle]')) {
        const panel = document.querySelector('[data-mobile-panel]');
        panel?.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
      }
      if (e.target.closest('[data-menu-close]')) {
        closeMobileMenu();
      }
      if (e.target.closest('[data-mobile-panel] a')) {
        closeMobileMenu();
      }

      // Close dropdown when clicking outside
      if (!e.target.closest('[data-nav-dropdown]')) {
        closeDropdown();
      }

      // Theme toggle
      if (e.target.closest('[data-theme-toggle]')) {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('vanaveda-theme', next);
      }

      // Direction toggle
      if (e.target.closest('[data-dir-toggle]')) {
        const next = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
        document.documentElement.dir = next;
        localStorage.setItem('vanaveda-dir', next);
        updateDirLabels(next);
      }

      // Search overlay open & close
      if (e.target.closest('[data-open-search]')) openSearch();
      if (e.target.closest('[data-close-search]') || e.target === document.querySelector('[data-search-overlay]')) closeSearch();

      // Back to top
      if (e.target.closest('[data-back-to-top]')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSearch();
        closeDropdown();
        closeMobileMenu();
        if (window.VanaVedaCart) {
          document.querySelector('[data-cart-drawer]')?.classList.remove('is-open');
          document.querySelector('[data-cart-backdrop]')?.classList.remove('is-open');
          document.body.classList.remove('no-scroll');
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1120) {
        closeMobileMenu();
      }
    });

    const search = document.querySelector('[data-global-search]');
    search?.addEventListener('input', () => renderSearch(search.value));

    const hero = document.querySelector('[data-hero-scene]');
    if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        hero.style.setProperty('--rx', `${-y * 8}deg`);
        hero.style.setProperty('--ry', `${x * 10}deg`);
      });
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--rx', '0deg');
        hero.style.setProperty('--ry', '0deg');
      });
    }

    setupReveal();
  }

  function openSearch() {
    const el = document.querySelector('[data-search-overlay]');
    if (!el) return;
    el.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(() => document.querySelector('[data-global-search]')?.focus(), 50);
    renderSearch('');
  }

  function closeSearch() {
    document.querySelector('[data-search-overlay]')?.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function renderSearch(value) {
    const q = value.trim().toLowerCase();
    const rows = (window.VANAVEDA_PRODUCTS || []).filter(p => {
      if (!q) return true;
      return `${p.name} ${p.category} ${p.ingredients.join(' ')}`.toLowerCase().includes(q);
    }).slice(0, 6);

    const el = document.querySelector('[data-search-results]');
    if (!el) return;
    el.innerHTML = rows.length
      ? rows.map(p => `
          <a href="product-details.html?id=${p.id}">
            <img src="../assets/images/${p.image}" alt="">
            <span>
              <small>${p.category}</small>
              <strong>${p.name}</strong>
            </span>
            <b>${window.VANAVEDA_FORMAT_PRICE(p.price)}</b>
          </a>`).join('')
      : '<p class="search-empty">No matching products found. Try a botanical, category, or ritual keyword.</p>';
  }

  function setupReveal() {
    const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 150px 0px' });
    els.forEach(el => io.observe(el));
    setTimeout(() => {
      els.forEach(el => el.classList.add('is-visible'));
    }, 350);
  }

  document.addEventListener('vanaveda:rerender', setupReveal);
  document.addEventListener('DOMContentLoaded', () => {
    shell();
    interactions();
    setupReveal();
    if (document.documentElement.dir === 'rtl') {
      document.querySelectorAll('[data-dir-label]').forEach(el => { el.textContent = 'LTR'; });
      document.querySelectorAll('.direction-button').forEach(btn => { btn.textContent = 'LTR'; });
    }
  });
})();
