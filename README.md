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
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for automated Pages deployment
├── dist/                     # Production-ready static storefront files
│   ├── index.html            # Entrypoint (redirects cleanly to pages/index.html)
│   ├── 404.html              # Custom 404 error handler
│   ├── sitemap.xml           # SEO sitemap
│   ├── robots.txt            # Search engine crawler configuration
│   ├── pages/                # Storefront pages (index, products, cart, etc.)
│   ├── assets/               # Stylesheets, JavaScript modules, fonts, brand logos, images
│   ├── documentation/        # Customization guides and image credits
│   └── tests/                # Automated browser QA scripts and screenshots
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
Then visit: [http://localhost:4173](http://localhost:4173)

### Using Node.js (npx serve):
```sh
npx serve dist
```

---

## 🧪 Automated QA & Visual Regression Testing

The test suite validates responsive rendering across 11 standard viewport breakpoints (320px, 360px, 390px, 430px, 640px, 768px, 820px, 1024px, 1280px, 1440px, 1920px), Home dropdown lifecycle, 5-category filtering, Doctor Consultation multi-step booking, Wholesale form mode switching, Dark Mode contrast, and RTL layout:

```sh
# Run browser QA and screenshot generation
npm test
```

---

## 🛠️ Deployment

This project deploys automatically to **GitHub Pages** via GitHub Actions whenever changes are pushed to the `main` branch.

- **Workflow file**: `.github/workflows/deploy.yml`
- **Publish directory**: `dist`
