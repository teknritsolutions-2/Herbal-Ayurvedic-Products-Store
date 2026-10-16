(function () {
  const items = [
    { name: 'Amla', latin: 'Phyllanthus emblica', type: 'Fruit', tradition: 'Revered in classical Ayurveda as Amalaki, a foundational rasayana fruit known for natural antioxidant tannins and nourishing vitality across hair and digestion traditions.', note: 'Confirm suitability with a qualified practitioner before ingesting concentrated dietary forms.' },
    { name: 'Ashwagandha', latin: 'Withania somnifera', type: 'Root', tradition: 'A grounding adaptogenic root historically infused in warm milk or medicated oils for nervous system equilibrium and restful rejuvenation.', note: 'Professional guidance is advised during pregnancy or alongside thyroid/sedative medications.' },
    { name: 'Bhringraj', latin: 'Eclipta prostrata', type: 'Leaf', tradition: 'Celebrated traditionally as Keshraja (“King of Hair”), steeped into sesame and coconut oils for root resilience and calm scalp massage.', note: 'Topical botanicals should be patch-tested on inner arm 24 hours prior to regular use.' },
    { name: 'Brahmi', latin: 'Bacopa monnieri', type: 'Leaf', tradition: 'A revered wetland herb associated with clarity and meditative calm, frequently formulated into balancing hair oils and cooling pastes.', note: 'Verify authentic botanical identity on final product testing documents.' },
    { name: 'Cardamom', latin: 'Elettaria cardamomum', type: 'Seed', tradition: 'An aromatic queen of spices utilized in traditional digestive chai infusions to harmonize cool water and warm culinary botanicals.', note: 'Contains volatile aromatic terpenes; use culinary quantities.' },
    { name: 'Chamomile', latin: 'Matricaria chamomilla', type: 'Flower', tradition: 'A gentle European botanical with a long history of evening tea rituals for unhurried rest and comforting warmth.', note: 'Avoid if sensitive to plants within the Asteraceae (daisy) family.' },
    { name: 'Ginger', latin: 'Zingiber officinale', type: 'Root', tradition: 'A universally treasured warming rhizome utilized across Ayurvedic deepana (digestive fire) teas and invigorating tonics.', note: 'Concentrated doses may irritate sensitive stomachs or interact with blood thinners.' },
    { name: 'Hibiscus', latin: 'Hibiscus sabdariffa', type: 'Flower', tradition: 'A vibrant crimson calyx prized for cooling pitta balance, tart hydration, and traditional strand-softening hair rinse infusions.', note: 'Naturally tart; consult a practitioner if managing delicate blood pressure ranges.' },
    { name: 'Lavender', latin: 'Lavandula angustifolia', type: 'Flower', tradition: 'A delicate Mediterranean flower steeped in aromatic water or gentle bedtime oils for sensorial calm and tension release.', note: 'Aromatics should be used with caution around acute respiratory sensitivities.' },
    { name: 'Lemongrass', latin: 'Cymbopogon citratus', type: 'Leaf', tradition: 'A clean, citrus-scented stalk brewed in daily household teas to uplift stagnant mornings and refresh digestion.', note: 'Safe in culinary infusions; avoid concentrated essential oils topically without carrier dilution.' },
    { name: 'Neem', latin: 'Azadirachta indica', type: 'Leaf', tradition: 'The classical “village pharmacy” tree, bitter and cooling, celebrated for clarifying skin cleansers, scalp care, and foot soaks.', note: 'Intended strictly for topical care unless prescribed by an Ayurvedic physician.' },
    { name: 'Rose', latin: 'Rosa damascena', type: 'Flower', tradition: 'Symbol of cooling heart-centered comfort (Sadhaka Pitta balance), distilled into hydrosols and folded into botanical body balms.', note: 'Fragrant natural petals can occasionally prompt allergen response in reactive skin.' },
    { name: 'Sandalwood', latin: 'Santalum album', type: 'Wood', tradition: 'A sacred aromatic heartwood revered for serene skin cooling and ceremonial clay mask rituals.', note: 'Sustainable origin certification is paramount due to protected species regulations.' },
    { name: 'Sesame', latin: 'Sesamum indicum', type: 'Seed', tradition: 'The golden queen of Ayurvedic carrier oils (Taila), prized for deep tissue penetration, lipid stability, and grounding abhyanga massage.', note: 'Contraindicated for individuals with diagnosed sesame seed allergies.' },
    { name: 'Tulsi', latin: 'Ocimum tenuiflorum', type: 'Leaf', tradition: 'Holy Basil, venerated as the “Incomparable One” for respiratory resilience, mental clarity, and sacred morning household decoctions.', note: 'Seek qualified guidance for therapeutic use during pregnancy or lactation.' },
    { name: 'Turmeric', latin: 'Curcuma longa', type: 'Rhizome', tradition: 'The revered golden rhizome of South Asian kitchens and wellness routines, famous for supporting natural inflammatory response.', note: 'Consult a medical doctor if you have gallbladder stones or use anticoagulant therapy.' }
  ];

  let active = items[0];
  let query = '';
  let type = 'All';

  const card = item => `
    <button class="glossary-card${item.name === active.name ? ' is-active' : ''}" data-ingredient="${item.name}" aria-pressed="${item.name === active.name}">
      <span>${item.type}</span>
      <strong>${item.name}</strong>
      <em>${item.latin}</em>
    </button>`;

  function getRelatedProducts(ingredientName) {
    const all = window.VANAVEDA_PRODUCTS || [];
    return all.filter(p => {
      return p.ingredients.some(ing => ing.toLowerCase().includes(ingredientName.toLowerCase()));
    });
  }

  function render() {
    const grid = document.querySelector('[data-glossary-grid]');
    if (!grid) return;

    const rows = items.filter(i => {
      const matchesType = type === 'All' || i.type.toLowerCase() === type.toLowerCase();
      const matchesQuery = !query || `${i.name} ${i.latin} ${i.tradition}`.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });

    grid.innerHTML = rows.length
      ? rows.map(card).join('')
      : `<div class="empty-state compact">
           <h3>No botanicals found</h3>
           <p>Try a different keyword or reset the category filter.</p>
         </div>`;

    renderSpotlight();
  }

  function renderSpotlight() {
    const el = document.querySelector('[data-ingredient-spotlight]');
    if (!el) return;

    const related = getRelatedProducts(active.name);
    const relatedHtml = related.length
      ? `
        <div class="spotlight-products">
          <p class="spotlight-products__title">Formulated with ${active.name} in our Apothecary:</p>
          <div class="spotlight-product-list">
            ${related.map(p => `
              <a class="spotlight-product-chip" href="product-details.html?id=${p.id}">
                <img src="../assets/images/${p.image}" alt="${p.name}">
                <div>
                  <strong>${p.name}</strong>
                  <span>${p.category} · ${window.VANAVEDA_FORMAT_PRICE(p.price)}</span>
                </div>
              </a>`).join('')}
          </div>
        </div>`
      : '<p class="spotlight-products-none">Currently curated as an educational botanical reference.</p>';

    el.innerHTML = `
      <div class="spotlight-inner" data-reveal>
        <p class="eyebrow">Botanical spotlight</p>
        <h2>${active.name}</h2>
        <p class="latin">${active.latin}</p>
        <dl>
          <div>
            <dt>Plant Part</dt>
            <dd>${active.type}</dd>
          </div>
          <div>
            <dt>Classical Tradition</dt>
            <dd>${active.tradition}</dd>
          </div>
        </dl>
        <p class="spotlight-note"><strong>Usage & Safety Note:</strong> ${active.note}</p>
        ${relatedHtml}
      </div>`;
    document.dispatchEvent(new CustomEvent('vanaveda:rerender'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('[data-glossary-grid]')) return;

    document.querySelector('[data-glossary-search]')?.addEventListener('input', e => {
      query = e.target.value.toLowerCase().trim();
      render();
    });

    document.querySelectorAll('[data-glossary-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        type = btn.dataset.glossaryFilter;
        document.querySelectorAll('[data-glossary-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
        render();
      });
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-ingredient]');
      if (btn) {
        active = items.find(i => i.name === btn.dataset.ingredient) || active;
        render();
        document.querySelector('[data-ingredient-spotlight]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    render();
  });
})();
