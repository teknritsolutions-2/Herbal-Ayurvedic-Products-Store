# Herbal & Ayurvedic Products Store (VanaVeda)

🌿 **VanaVeda** is a thoughtfully crafted, botanical and Ayurvedic e-commerce storefront designed for daily rituals and conscious living.

## 🚀 Live Demo

**[View Live Storefront on GitHub Pages](https://teknritsolutions-2.github.io/Herbal-Ayurvedic-Products-Store/)**

---

## ✨ Key Storefront Features

- **Rebuilt Shared Navigation**: Semantic order `Home | About | Products | Ingredients | Doctor Consultation | Certifications | Contact`. Home is an accessible desktop and mobile dropdown containing strictly `Home 1` and `Home 2`.
- **5 Mandatory Client Categories**: Complete 27-product catalog organized into **Herbal Teas**, **Oils**, **Supplements**, **Skincare**, and dedicated **Hair Care** (featuring Bhringraj Hair Oil, Amla Hair Oil, Herbal Cleanser, Scalp Care Oil, and Botanical Mask).
- **Home 1 (The Herbal Sanctuary)**: 9 substantial store-focused sections including Shop by Category, Featured Hair Care collection, Interactive Botanical Discovery (Tulsi, Turmeric, Amla, Ashwagandha, Neem, Bhringraj), Quality Transparency preview, and Doctor Consultation booking CTA.
- **Home 2 (Rituals & Remedies)**: 8 distinct editorial shopping sections including Herbal Oils showcase, Hair & Skin rituals grid, scroll-revealed botanical journey, and certifications feature.
- **Doctor Consultation Booking**: 5-step accessible appointment-request workflow (Consultation Mode, Preferred Date & Window with past-date prevention, Contact Details, Purpose, and Review Summary with honest unconfirmed status disclaimer).
- **Quality & Certifications Transparency**: Verification and document register page educating customers on testing standards, batch records, and genuine certificates without fabricated claims.
- **Contact & Wholesale Trade**: Dedicated toggle between general customer enquiries and a full Wholesale Application (business type, volume, delivery location), paired with a configurable Store Location module and FAQ.
- **Searchable Ingredient Glossary**: Interactive directory linking botanical entries directly to live catalog products, along with formulation guides and FAQ.
- **Cart & Bag Experience**: Interactive slide-out cart drawer with local storage persistence and quick quantity adjustments.
- **Comprehensive Responsive & RTL Quality**: Tested across 11 breakpoints (320px to 1920px), Light/Dark themes, and full LTR/RTL reading layouts.

---

## 📁 Project Structure

```text
├── dist/                     # Client template package
│   ├── assets/
│   │   ├── css/              # style.css, dark-mode.css, rtl.css
│   │   ├── js/               # main.js, shop.js, forms.js, plugins/
│   │   ├── images/           # Curated herbal and botanical imagery
│   │   ├── fonts/            # Local web fonts
│   │   └── brand/            # Vector logos
│   ├── pages/                # Storefront pages (index.html, about.html, contact.html, etc.)
│   ├── documentation/        # Customization guides and image credits
│   └── README.md             # Template guide
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## 💻 Local Development & Preview

Serve the `dist/` directory using any local static file server:

### Using Python 3:
```sh
python3 -m http.server 4173 --directory dist
```
Then visit: [http://localhost:4173/pages/index.html](http://localhost:4173/pages/index.html)

### Using Node.js (npx serve):
```sh
npx serve dist
```
