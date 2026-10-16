# VanaVeda storefront

Frontend-only static storefront with 22 centralized products, a searchable and filterable catalog, dynamic product details, persistent local bag, ingredient glossary, theme/RTL controls, responsive navigation, local-only forms and a five-step consultation request.

## Preview

Serve `dist/` over HTTP. From the repository root:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/pages/index.html`.

## Important launch boundaries

- Checkout, payment, stock, tax and fulfilment are not connected.
- Contact, newsletter and consultation forms validate locally but transmit nothing.
- Product names, prices, label directions and ingredient lists must be reconciled with final client data.
- No certification claims are published. Add them only after document review.
- Business identity, address, support email, legal terms, privacy, shipping and return information require operator and legal review.

See `documentation/customization.md` for the launch checklist and `documentation/image-credits.md` for stock-image sources.
