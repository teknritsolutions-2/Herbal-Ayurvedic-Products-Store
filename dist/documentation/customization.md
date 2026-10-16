# Customization and launch checklist

## Catalog

Edit `assets/js/products.js`. The same data powers the shop, global search, product-detail routes, related products and the bag. Preserve each unique `id`; bookmarked details and saved bags depend on it.

For each real product, verify:

- name, category, size variants, price and availability;
- complete ingredient list and allergen information;
- on-pack use directions, warnings and required regulatory wording;
- image accuracy and permission.

## Brand and theme

- Core tokens are at the top of `assets/css/style.css`.
- Dark overrides are in `assets/css/dark-mode.css`.
- Directional overrides are in `assets/css/rtl.css`.
- Light and dark logos are separate SVG assets in `assets/brand/`; neither uses CSS inversion.
- Fraunces and DM Sans are bundled under `assets/fonts/`.

## Services to connect

1. Commerce: price authority, inventory, tax, shipping, payment, order confirmation and refunds.
2. Forms: secure endpoints, spam controls, server-side validation and accessible success/error states.
3. Privacy: consent, retention, processors, access/deletion requests and a verified privacy contact.
4. Consultation: approved scope, qualified responder, encrypted storage and response-time language.
5. Certification documents: issuer, scope, record number, dates and accessible source documents.

## Business information still required

No physical address, phone, email inbox, business registration identity, fulfilment policy or governing jurisdiction was supplied. The live site intentionally does not invent them.

## QA

The layout targets 320, 360, 390, 430, 640, 768, 820, 1024, 1280, 1440 and 1920 px. Re-run the browser test in `tests/browser-qa.mjs` after changing data, copy or CSS.
