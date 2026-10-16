(function () {
  const products = window.VANAVEDA_PRODUCTS || [];
  const money = window.VANAVEDA_FORMAT_PRICE;
  const state = { query: '', categories: new Set(), sort: 'featured' };

  function normalizeCategory(cat) {
    if (!cat) return '';
    const c = cat.trim();
    if (c === 'Ayurvedic Oils' || c === 'Oils') return 'Oils';
    if (c === 'Natural Skincare' || c === 'Skincare') return 'Skincare';
    return c;
  }

  function matchesCategory(productCategory, selectedCategory) {
    const prodNorm = normalizeCategory(productCategory);
    const selNorm = normalizeCategory(selectedCategory);
    return prodNorm.toLowerCase() === selNorm.toLowerCase();
  }

  const productCard = p => `
    <article class="product-card" data-reveal>
      <a class="product-card__image" href="product-details.html?id=${p.id}">
        <img src="../assets/images/${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </a>
      <div class="product-card__body">
        <p class="product-card__category">${p.category}</p>
        <h3><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-card__bottom">
          <strong>${money(p.price)}</strong>
          <button class="quick-add" data-add-to-cart="${p.id}" aria-label="Quick add ${p.name}">Add</button>
        </div>
      </div>
    </article>`;

  function filtered() {
    let rows = products.filter(p => {
      const q = state.query;
      const matchesQuery = !q || `${p.name} ${p.category} ${p.ingredients.join(' ')}`.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (!state.categories.size) return true;
      for (const sel of state.categories) {
        if (matchesCategory(p.category, sel)) return true;
      }
      return false;
    });

    if (state.sort === 'price-low') rows.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-high') rows.sort((a, b) => b.price - a.price);
    if (state.sort === 'name') rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }

  function renderShop() {
    const grid = document.querySelector('[data-product-grid]');
    if (!grid) return;
    const rows = filtered();
    grid.innerHTML = rows.length
      ? rows.map(productCard).join('')
      : `<div class="empty-state shop-empty">
           <span>⌕</span>
           <h2>No products match those filters</h2>
           <p>Clear a filter or try a broader search.</p>
           <button class="button button--small" data-clear-filters>Clear filters</button>
         </div>`;

    document.querySelectorAll('[data-result-count]').forEach(el => {
      el.textContent = `${rows.length} ${rows.length === 1 ? 'product' : 'products'}`;
    });
    document.dispatchEvent(new CustomEvent('vanaveda:rerender'));
  }

  function initShop() {
    const grid = document.querySelector('[data-product-grid]');
    if (!grid) return;

    const incoming = new URLSearchParams(location.search).get('category');
    if (incoming) {
      state.categories.add(normalizeCategory(incoming));
    }

    document.querySelectorAll('[data-category-filter]').forEach(input => {
      const norm = normalizeCategory(input.value);
      input.checked = state.categories.has(norm) || state.categories.has(input.value);
      input.addEventListener('change', () => {
        if (input.checked) {
          state.categories.add(norm);
        } else {
          state.categories.delete(norm);
          state.categories.delete(input.value);
        }
        renderShop();
      });
    });

    document.querySelector('[data-shop-search]')?.addEventListener('input', e => {
      state.query = e.target.value.trim().toLowerCase();
      renderShop();
    });

    document.querySelector('[data-shop-sort]')?.addEventListener('change', e => {
      state.sort = e.target.value;
      renderShop();
    });

    document.addEventListener('click', e => {
      if (e.target.closest('[data-clear-filters]')) {
        state.query = '';
        state.categories.clear();
        const searchInput = document.querySelector('[data-shop-search]');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('[data-category-filter]').forEach(x => { x.checked = false; });
        renderShop();
      }
      if (e.target.closest('[data-filter-open]')) {
        document.querySelector('[data-filter-panel]')?.classList.add('is-open');
      }
      if (e.target.closest('[data-filter-close]')) {
        document.querySelector('[data-filter-panel]')?.classList.remove('is-open');
      }
    });

    renderShop();
  }

  function initFeatured() {
    document.querySelectorAll('[data-featured-products]').forEach(target => {
      const ids = (target.dataset.featuredProducts || '').split(',').map(s => s.trim()).filter(Boolean);
      const items = ids.length
        ? ids.map(id => products.find(p => p.id === id)).filter(Boolean)
        : products.slice(0, 4);
      target.innerHTML = items.map(productCard).join('');
    });
  }

  function initDetail() {
    const target = document.querySelector('[data-product-detail]');
    if (!target) return;
    const id = new URLSearchParams(location.search).get('id') || products[0].id;
    const p = products.find(item => item.id === id) || products[0];

    document.title = `${p.name} — VanaVeda`;
    target.innerHTML = `
      <div class="detail-media" data-reveal>
        <img src="../assets/images/${p.image}" alt="${p.name}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </div>
      <div class="detail-copy" data-reveal>
        <a class="text-link" href="products.html?category=${encodeURIComponent(p.category)}">${p.category}</a>
        <h1>${p.name}</h1>
        <p class="detail-price">${money(p.price)}</p>
        <p class="lead">${p.description}</p>
        <div class="detail-block">
          <h2>What is inside</h2>
          <ul class="ingredient-list">
            ${p.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
        <form class="buy-form" data-buy-form>
          <label>Size
            <select name="size">
              ${p.sizes.map(s => `<option>${s}</option>`).join('')}
            </select>
          </label>
          <label>Quantity
            <input name="quantity" type="number" min="1" max="9" value="1">
          </label>
          <button class="button button--full" type="submit">Add to bag</button>
        </form>
        <details open>
          <summary>How to use</summary>
          <p>${p.usage}</p>
        </details>
        <details>
          <summary>Please note</summary>
          <p>${p.caution}</p>
        </details>
        <p class="detail-note">Botanical products are not a substitute for professional medical advice. Packaging and final label directions take precedence.</p>
      </div>`;

    target.querySelector('[data-buy-form]')?.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      if (window.VanaVedaCart) {
        window.VanaVedaCart.add(p.id, data.get('size'), data.get('quantity'));
      }
    });

    const related = products.filter(x => normalizeCategory(x.category) === normalizeCategory(p.category) && x.id !== p.id).slice(0, 4);
    const relatedEl = document.querySelector('[data-related-products]');
    if (relatedEl) relatedEl.innerHTML = related.map(productCard).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initShop();
    initFeatured();
    initDetail();
    document.dispatchEvent(new CustomEvent('vanaveda:rerender'));
  });
})();
