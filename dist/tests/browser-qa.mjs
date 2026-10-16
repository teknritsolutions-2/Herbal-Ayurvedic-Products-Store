import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.VANAVEDA_BASE_URL || 'http://127.0.0.1:4173/pages';
const output = process.env.VANAVEDA_SCREENSHOT_DIR || new URL('./screenshots/', import.meta.url).pathname;
const pages = ['index','home2','products','ingredients','consultation','certifications','contact'];
const widths = [320,360,390,430,640,768,820,1024,1280,1440,1920];
const browser = await chromium.launch({ headless: true, executablePath: process.env.VANAVEDA_CHROMIUM_PATH || undefined });
const problems = [];
const loadFullPage = page => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  window.scrollTo(0, 0);
});

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  for (const name of pages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) problems.push(`${name} overflows at ${width}px`);
  }
  await page.close();
}

const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
await interaction.goto(`${base}/products.html`, { waitUntil: 'networkidle' });
if (await interaction.locator('.product-card').count() !== 22) problems.push('Catalog did not render 22 products');
await interaction.locator('[data-filter-open]').click();
await interaction.locator('[data-category-filter][value="Herbal Teas"]').check();
if (await interaction.locator('.product-card').count() !== 5) problems.push('Category filter did not return 5 teas');
await interaction.locator('[data-filter-close]').click();
await interaction.locator('[data-shop-search]').fill('no-such-product');
if (!(await interaction.locator('.shop-empty').isVisible())) problems.push('No-results state did not appear');
await interaction.locator('[data-clear-filters]').last().click();
await interaction.locator('.quick-add').first().click();
if (!(await interaction.locator('[data-cart-drawer]').evaluate(el => el.classList.contains('is-open')))) problems.push('Mini cart did not open after add');
if (await interaction.locator('[data-cart-count]').textContent() !== '1') problems.push('Bag count did not update');
await interaction.locator('[data-close-cart]').click();
await interaction.goto(`${base}/cart.html`, { waitUntil: 'networkidle' });
if (await interaction.locator('.cart-lines .mini-line').count() !== 1) problems.push('Bag did not persist to cart page');
await interaction.goto(`${base}/product-details.html?id=rose-hibiscus`, { waitUntil: 'networkidle' });
if ((await interaction.locator('.detail-copy h1').textContent()) !== 'Rose & Hibiscus Infusion') problems.push('Dynamic product route failed');
await interaction.locator('[data-theme-toggle]').click();
if (await interaction.locator('html').getAttribute('data-theme') !== 'dark') problems.push('Theme toggle failed');
await interaction.locator('[data-dir-toggle]').evaluate(element => element.click());
if (await interaction.locator('html').getAttribute('dir') !== 'rtl') problems.push('RTL toggle failed');
await interaction.goto(`${base}/consultation.html`, { waitUntil: 'networkidle' });
await interaction.locator('input[name="name"]').fill('QA Visitor');
await interaction.locator('input[name="email"]').fill('qa@example.com');
await interaction.locator('select[name="age"]').selectOption({ label: '25–34' });
await interaction.locator('select[name="contact"]').selectOption({ label: 'Email' });
await interaction.locator('[data-next]').click();
if (await interaction.locator('[data-step="2"]').getAttribute('hidden') !== null) problems.push('Consultation did not advance to step 2');
await interaction.close();

await fs.mkdir(output, { recursive: true });
for (const [name,width,height] of [['home-desktop',1440,1100],['home2-desktop',1440,1100],['products-desktop',1440,1100],['ingredients-desktop',1440,1100],['consultation-desktop',1440,1100],['certifications-desktop',1440,1100],['contact-desktop',1440,1100],['home-mobile',390,844],['products-mobile',390,844],['consultation-mobile',390,844]]) {
  const target = name.split('-')[0] === 'home' ? 'index' : name.split('-')[0] === 'home2' ? 'home2' : name.split('-')[0];
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${base}/${target}.html`, { waitUntil: 'networkidle' });
  await loadFullPage(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  await page.close();
}
for (const name of ['index','products','ingredients']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => localStorage.setItem('vanaveda-theme','dark'));
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await loadFullPage(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/${name}-dark.png`, fullPage: true });
  await page.close();
}
await browser.close();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('Responsive overflow checks passed.');
