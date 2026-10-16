import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..');

// Simple static server for testing dist/
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer(async (req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 4174;
await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

const base = `http://127.0.0.1:${PORT}/pages`;
const output = process.env.VANAVEDA_SCREENSHOT_DIR || path.join(__dirname, 'screenshots');
const pages = ['index', 'home2', 'products', 'ingredients', 'consultation', 'certifications', 'contact', 'about', 'cart', 'faq', 'shipping-returns'];
const widths = [320, 360, 390, 430, 640, 768, 820, 1024, 1280, 1440, 1920];

const executablePath = process.env.VANAVEDA_CHROMIUM_PATH ||
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

const browser = await chromium.launch({
  headless: true,
  executablePath
});

const problems = [];
const loadFullPage = async page => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
  });
};

console.log('Running responsive overflow test across 11 breakpoints...');
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  for (const name of ['index', 'home2', 'products', 'ingredients', 'consultation', 'certifications', 'contact']) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) problems.push(`Responsive error: ${name}.html overflows horizontally at ${width}px`);
  }
  await page.close();
}

console.log('Validating Shared Navbar & Mobile Menu...');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });

  // 1. Navbar order on desktop
  const navText = await page.evaluate(() => {
    const nav = document.querySelector('.desktop-nav');
    const items = [...nav.children].map(el => {
      if (el.matches('[data-nav-dropdown]')) {
        return el.querySelector('button span').textContent.trim();
      }
      return el.textContent.trim();
    });
    return items.join(' | ');
  });

  const expectedNav = 'Home | About | Products | Ingredients | Doctor Consultation | Certifications | Contact';
  if (navText !== expectedNav) {
    problems.push(`Desktop navbar order mismatch. Expected "${expectedNav}", got "${navText}"`);
  }

  // 2. Home Dropdown
  const dropdownTrigger = page.locator('[data-nav-dropdown-trigger]');
  await dropdownTrigger.click();
  const dropdownOpen = await page.locator('[data-nav-dropdown]').evaluate(el => el.classList.contains('is-open'));
  if (!dropdownOpen) problems.push('Home dropdown did not open on click');

  const dropdownLinks = await page.locator('[data-nav-dropdown-menu] a').allTextContents();
  if (dropdownLinks.length !== 2 || dropdownLinks[0].trim() !== 'Home 1' || dropdownLinks[1].trim() !== 'Home 2') {
    problems.push(`Home dropdown must contain exactly Home 1 and Home 2. Got: ${JSON.stringify(dropdownLinks)}`);
  }

  // Escape closes dropdown
  await page.keyboard.press('Escape');
  const dropdownClosed = !(await page.locator('[data-nav-dropdown]').evaluate(el => el.classList.contains('is-open')));
  if (!dropdownClosed) problems.push('Escape key did not close Home dropdown');

  await page.close();
}

console.log('Validating Mobile Drawer & Lifecycle...');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });

  await page.locator('[data-menu-toggle]').click();
  await page.waitForTimeout(400);
  const drawerOpen = await page.locator('[data-mobile-panel]').evaluate(el => el.classList.contains('is-open'));
  const bodyNoScroll = await page.evaluate(() => document.body.classList.contains('no-scroll'));
  if (!drawerOpen) problems.push('Mobile panel did not open on toggle');
  if (!bodyNoScroll) problems.push('body did not gain no-scroll on mobile menu open');

  const mobileNavText = await page.locator('[data-mobile-panel] nav').innerText();
  for (const requiredItem of ['Home 1', 'Home 2', 'About', 'Products', 'Ingredients', 'Doctor Consultation', 'Certifications', 'Contact', 'Bag']) {
    if (!mobileNavText.includes(requiredItem)) {
      problems.push(`Mobile nav is missing required link: ${requiredItem}`);
    }
  }

  // Theme & RTL toggles in mobile drawer
  const mobileThemeBtn = page.locator('[data-mobile-panel] [data-theme-toggle]');
  if (!(await mobileThemeBtn.isVisible())) {
    problems.push('Theme toggle is not visible in mobile panel');
  }
  const mobileDirBtn = page.locator('[data-mobile-panel] [data-dir-toggle]');
  if (!(await mobileDirBtn.isVisible())) {
    problems.push('Direction toggle is not visible in mobile panel');
  }

  // Escape key closes mobile drawer and restores page scroll
  await page.keyboard.press('Escape');
  const drawerClosedOnEsc = !(await page.locator('[data-mobile-panel]').evaluate(el => el.classList.contains('is-open')));
  const scrollRestored = !(await page.evaluate(() => document.body.classList.contains('no-scroll')));
  if (!drawerClosedOnEsc) problems.push('Escape key did not close mobile panel');
  if (!scrollRestored) problems.push('Escape key did not restore page scrolling');

  await page.close();
}

console.log('Validating Products & Hair Care Category...');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/products.html`, { waitUntil: 'domcontentloaded' });

  const totalProducts = await page.locator('.product-card').count();
  if (totalProducts < 22) {
    problems.push(`Products catalog rendered only ${totalProducts} products. Expected at least 22.`);
  }

  // Check Hair Care filter exists
  const hairCareFilter = page.locator('[data-category-filter][value="Hair Care"]');
  if (!(await hairCareFilter.isVisible())) {
    problems.push('Hair Care category filter checkbox is missing on products.html');
  }

  // Filter by Hair Care
  await hairCareFilter.check();
  const hairCardCount = await page.locator('.product-card').count();
  if (hairCardCount < 4) {
    problems.push(`Hair Care filter returned only ${hairCardCount} items. Expected at least 4.`);
  }

  // Verify Hair Care product details navigation
  await page.goto(`${base}/product-details.html?id=bhringraj-hair-oil`, { waitUntil: 'domcontentloaded' });
  const detailTitle = await page.locator('.detail-copy h1').textContent();
  if (!detailTitle.includes('Bhringraj')) {
    problems.push(`Product details page failed to load Bhringraj Hair Oil. Got "${detailTitle}"`);
  }

  // Test Quick Add to cart
  await page.locator('[data-buy-form] button[type="submit"]').click();
  const cartOpen = await page.locator('[data-cart-drawer]').evaluate(el => el.classList.contains('is-open'));
  if (!cartOpen) problems.push('Cart drawer did not open after adding product');

  const cartCount = await page.locator('[data-cart-count]').first().textContent();
  if (Number(cartCount) < 1) problems.push('Cart item counter did not update');

  await page.close();
}

console.log('Validating Doctor Consultation Booking Request...');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/consultation.html`, { waitUntil: 'domcontentloaded' });

  // Step 1: Mode
  const step1 = await page.locator('[data-step="1"]').isVisible();
  if (!step1) problems.push('Consultation step 1 is not visible');
  await page.locator('[data-next]').click();

  // Step 2: Date
  const dateInput = page.locator('input[type="date"]');
  const minDate = await dateInput.getAttribute('min');
  const todayStr = new Date().toISOString().split('T')[0];
  if (!minDate || minDate < todayStr) {
    problems.push(`Consultation date picker does not enforce min date (${minDate} vs ${todayStr})`);
  }

  // Fill Step 2
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  await dateInput.fill(tomorrow.toISOString().split('T')[0]);
  await page.locator('select[name="time_window"]').selectOption({ index: 1 });
  await page.locator('[data-next]').click();

  // Fill Step 3
  await page.locator('input[name="name"]').fill('Aditi Rao');
  await page.locator('input[name="email"]').fill('aditi@example.com');
  await page.locator('input[name="phone"]').fill('+91 98765 00000');
  await page.locator('select[name="age"]').selectOption({ index: 2 });
  await page.locator('[data-next]').click();

  // Fill Step 4
  await page.locator('select[name="reason_category"]').selectOption({ index: 1 });
  await page.locator('textarea[name="reason_notes"]').fill('Seeking guidance on daily scalp oiling routine and evening tea herbs.');
  await page.locator('[data-next]').click();

  // Step 5: Review
  const summaryText = await page.locator('[data-review-summary]').innerText();
  if (!summaryText.includes('Aditi Rao') || !summaryText.toLowerCase().includes('awaiting provider confirmation')) {
    problems.push('Consultation Step 5 review does not reflect selections and honest pending status');
  }

  // Check required checkboxes and submit
  const checkboxes = page.locator('[data-step="5"] input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }

  await page.locator('[data-submit-consult]').click();
  const receiptVisible = await page.locator('.booking-receipt').isVisible();
  if (!receiptVisible) {
    problems.push('Consultation booking receipt not displayed after submission');
  }

  await page.close();
}

console.log('Validating Contact & Dedicated Wholesale Enquiry...');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/contact.html`, { waitUntil: 'domcontentloaded' });

  // Check store location module
  const locationCard = await page.locator('.store-location-card').isVisible();
  if (!locationCard) problems.push('Store location card is missing on contact page');

  // Toggle to Wholesale Mode
  const wholesaleBtn = page.locator('[data-contact-mode-btn="wholesale"]');
  await wholesaleBtn.click();

  const wholesaleFormVisible = await page.locator('[data-wholesale-form]').isVisible();
  if (!wholesaleFormVisible) {
    problems.push('Clicking Wholesale tab did not reveal dedicated wholesale form');
  }

  // Check wholesale-specific fields
  const companyInput = page.locator('input[name="company_name"]');
  const businessTypeSelect = page.locator('select[name="business_type"]');
  const quantitySelect = page.locator('select[name="order_quantity"]');
  const cityInput = page.locator('input[name="delivery_city"]');

  if (!(await companyInput.isVisible())) problems.push('Wholesale company name input is missing');
  if (!(await businessTypeSelect.isVisible())) problems.push('Wholesale business type select is missing');
  if (!(await quantitySelect.isVisible())) problems.push('Wholesale order quantity select is missing');
  if (!(await cityInput.isVisible())) problems.push('Wholesale delivery city input is missing');

  await page.close();
}

console.log('Capturing verified screenshots across public pages and themes...');
await fs.mkdir(output, { recursive: true });

const captureList = [
  ['home-desktop', 'index', 1440, 1100],
  ['home2-desktop', 'home2', 1440, 1100],
  ['products-desktop', 'products', 1440, 1100],
  ['ingredients-desktop', 'ingredients', 1440, 1100],
  ['consultation-desktop', 'consultation', 1440, 1100],
  ['certifications-desktop', 'certifications', 1440, 1100],
  ['contact-desktop', 'contact', 1440, 1100],
  ['about-desktop', 'about', 1440, 1100],
  ['home-mobile', 'index', 390, 844],
  ['products-mobile', 'products', 390, 844],
  ['consultation-mobile', 'consultation', 390, 844]
];

for (const [outName, pageName, w, h] of captureList) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/${pageName}.html`, { waitUntil: 'domcontentloaded' });
  await loadFullPage(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, `${outName}.png`), fullPage: true });
  await page.close();
}

// Dark mode captures
for (const pageName of ['index', 'products', 'ingredients', 'consultation']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => localStorage.setItem('vanaveda-theme', 'dark'));
  await page.goto(`${base}/${pageName}.html`, { waitUntil: 'domcontentloaded' });
  await loadFullPage(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, `${pageName}-dark.png`), fullPage: true });
  await page.close();
}

// RTL mode capture
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => localStorage.setItem('vanaveda-dir', 'rtl'));
  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await loadFullPage(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, `home-rtl.png`), fullPage: true });
  await page.close();
}

await browser.close();
await new Promise(resolve => server.close(resolve));

if (problems.length) {
  console.error('\n❌ QA TEST FAILURES:\n' + problems.join('\n'));
  process.exit(1);
}

console.log('\n✅ ALL QA TESTS & SCREENSHOT AUDITS PASSED WITH ZERO ERRORS.');
