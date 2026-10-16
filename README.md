# Herbal & Ayurvedic Products Store (VanaVeda)

🌿 **VanaVeda** is a thoughtfully crafted, botanical and Ayurvedic e-commerce storefront designed for daily rituals and conscious living.

## 🚀 Live Demo

**[View Live Storefront on GitHub Pages](https://teknritsolutions-2.github.io/Herbal-Ayurvedic-Products-Store/)**

---

## ✨ Features

- **Rich Product Catalog**: 22 curated botanical products categorized into Herbal Teas, Ayurvedic Oils, Supplements, Natural Skincare, and Wellness Essentials.
- **Dynamic Search & Filtering**: Instant client-side search across product names, categories, and ingredients.
- **Product Details**: Comprehensive views including ingredients breakdown, ritual instructions, usage guidance, and certifications.
- **Cart & Bag Experience**: Interactive slide-out cart drawer with local storage persistence and quick quantity adjustments.
- **Dark Mode & RTL Support**: Seamless switching between light/dark themes and LTR/RTL reading layouts.
- **5-Step Consultation Workflow**: Guided interactive consultation request form for personalized wellness recommendations.
- **Searchable Ingredient Glossary**: Deep-dive into Ayurvedic herbs, roots, and botanicals with educational contexts.
- **Fully Responsive & Accessible**: Optimized for mobile, tablet, and desktop viewing with semantic HTML and keyboard navigation.

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

## 🛠️ Deployment

This project deploys automatically to **GitHub Pages** via GitHub Actions whenever changes are pushed to the `main` branch.

- **Workflow file**: `.github/workflows/deploy.yml`
- **Publish directory**: `dist`
