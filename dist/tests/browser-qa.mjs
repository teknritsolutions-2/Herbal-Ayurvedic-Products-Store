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
    document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every(image => image.complete), null, { timeout: 8000 }).catch(() => {});
};

const majorPages = ['index', 'home2', 'products', 'ingredients', 'consultation', 'certifications', 'contact', 'about'];
const stickyPages = ['index', 'products', 'ingredients', 'contact'];
const stickyWidths = [390, 820, 1440];

async function getContrastAudit(page) {
  return page.evaluate(() => {
    const parseColor = value => {
      const match = value.match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?\)/);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
    };
    const luminance = rgb => {
      const channel = value => {
        const n = value / 255;
        return n <= .03928 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
      };
      return .2126 * channel(rgb[0]) + .7152 * channel(rgb[1]) + .0722 * channel(rgb[2]);
    };
    const ratio = (a, b) => {
      const l1 = luminance(a);
      const l2 = luminance(b);
      return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
    };
    const effectiveBackground = element => {
      let current = element;
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color && color[3] >= .96) return color;
        current = current.parentElement;
      }
      return parseColor(getComputedStyle(document.body).backgroundColor);
    };
    const selector = 'main h1,main h2,main h3,main p,.eyebrow,.product-card__category,.result-count,.field span,.button,.quick-add,.footer a,.footer p';
    return [...document.querySelectorAll(selector)].flatMap((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!element.textContent.trim() || rect.width < 1 || rect.height < 1 || style.visibility === 'hidden') return [];
      if (element.closest('.editorial-hero') || element.closest('.category-card')) return [];
      const foreground = parseColor(style.color);
      const background = effectiveBackground(element);
      if (!foreground || !background) return [];
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = Number(style.fontWeight) || 400;
      const threshold = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
      const contrast = ratio(foreground, background);
      if (contrast + .02 >= threshold) return [];
      return [{
        selector: `${element.tagName.toLowerCase()}${element.className ? '.' + String(element.className).trim().replace(/\s+/g, '.') : ''}[${index}]`,
        text: element.textContent.trim().slice(0, 45),
        contrast: contrast.toFixed(2),
        threshold
      }];
    });
  });
}

console.log('Validating sticky header geometry at desktop, tablet, and mobile widths...');
for (const width of stickyWidths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of stickyPages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    const initial = await page.locator('.site-header').boundingBox();
    const announcementHeight = await page.locator('.announcement').evaluate(element => element.getBoundingClientRect().height);
    if (!initial || Math.abs(initial.y - announcementHeight) > 2) {
      problems.push(`Sticky setup error: ${name}.html header should begin below announcement at ${width}px`);
    }
    for (const y of [500, 1500]) {
      await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(80);
      const geometry = await page.evaluate(() => ({
        headerTop: document.querySelector('.site-header')?.getBoundingClientRect().top,
        announcementBottom: document.querySelector('.announcement')?.getBoundingClientRect().bottom
      }));
      if (geometry.headerTop === undefined || Math.abs(geometry.headerTop) > 1.5) {
        problems.push(`Sticky error: ${name}.html header top is ${geometry.headerTop} after ${y}px scroll at ${width}px`);
      }
      if (geometry.announcementBottom > 1) {
        problems.push(`Announcement error: ${name}.html announcement remained visible after ${y}px scroll at ${width}px`);
      }
    }
  }
  await page.close();
}

console.log('Validating shared horizontal content grid...');
for (const width of [390, 820, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of majorPages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    const edges = await page.evaluate(() => {
      const brand = document.querySelector('.site-header .brand')?.getBoundingClientRect().left;
      const heroCopy = (document.querySelector('.hero__copy') || document.querySelector('.page-hero__inner > :first-child') || document.querySelector('.editorial-hero__copy'))?.getBoundingClientRect().left;
      const footer = document.querySelector('.footer__main')?.getBoundingClientRect().left;
      return { brand, heroCopy, footer };
    });
    for (const [edgeName, edge] of Object.entries(edges)) {
      if (edge === undefined || edge === null) continue;
      if (Math.abs(edge - edges.brand) > 2.5) {
        problems.push(`Gutter alignment error: ${name}.html ${edgeName}=${edge.toFixed(1)} vs navbar=${edges.brand.toFixed(1)} at ${width}px`);
      }
    }
  }
  await page.close();
}

console.log('Running responsive overflow test across 11 breakpoints...');
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  for (const name of majorPages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) problems.push(`Responsive error: ${name}.html overflows horizontally at ${width}px`);
  }
  await page.close();
}

console.log('Checking bounded controls, cards, and critical sibling overlaps...');
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const name of majorPages) {
    await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      const visible = el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const closedOverlay = el.closest('.filter-panel:not(.is-open),.mobile-panel:not(.is-open),[inert]');
        return !closedOverlay && r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      document.querySelectorAll('.button,.quick-add,input,select,textarea,.product-card,.glossary-card').forEach(el => {
        if (!visible(el)) return;
        const r = el.getBoundingClientRect();
        if (r.left < -1 || r.right > document.documentElement.clientWidth + 1) {
          issues.push(`${el.tagName.toLowerCase()}.${String(el.className).replace(/\s+/g, '.')} “${el.textContent.trim().slice(0, 40)}” outside viewport (${r.left.toFixed(1)}–${r.right.toFixed(1)} / ${document.documentElement.clientWidth})`);
        }
      });
      document.querySelectorAll('.product-card__bottom,.hero__actions,.form-actions,.discovery-actions,.steps>div>div').forEach(group => {
        const children = [...group.children].filter(visible);
        for (let i = 0; i < children.length; i++) {
          for (let j = i + 1; j < children.length; j++) {
            const a = children[i].getBoundingClientRect();
            const b = children[j].getBoundingClientRect();
            const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
            if (overlap) issues.push(`${group.className}: sibling controls overlap`);
          }
        }
      });
      return [...new Set(issues)];
    });
    layoutIssues.forEach(issue => problems.push(`Layout error: ${name}.html at ${width}px — ${issue}`));
  }
  await page.close();
}

console.log('Auditing dark-mode text and interactive contrast...');
for (const name of majorPages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => localStorage.setItem('vanaveda-theme', 'dark'));
  await page.goto(`${base}/${name}.html`, { waitUntil: 'domcontentloaded' });
  await loadFullPage(page);
  const contrastIssues = await getContrastAudit(page);
  contrastIssues.slice(0, 12).forEach(issue => {
    problems.push(`Dark contrast error: ${name}.html ${issue.selector} “${issue.text}” ratio ${issue.contrast} < ${issue.threshold}`);
  });
  const hoverTargets = page.locator('.button:visible,.quick-add:visible');
  const hoverCount = Math.min(await hoverTargets.count(), 8);
  for (let index = 0; index < hoverCount; index++) {
    const target = hoverTargets.nth(index);
    await target.hover();
    await page.waitForTimeout(260);
    const hoverResult = await target.evaluate(element => {
      const parse = value => (value.match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/) || []).slice(1, 4).map(Number);
      const lum = rgb => rgb.map(v => { const n = v / 255; return n <= .03928 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const style = getComputedStyle(element);
      const fg = parse(style.color);
      let node = element;
      let bg = [];
      while (node && !bg.length) {
        const color = getComputedStyle(node).backgroundColor;
        if (!color.endsWith(', 0)') && color !== 'rgba(0, 0, 0, 0)') bg = parse(color);
        node = node.parentElement;
      }
      if (fg.length !== 3 || bg.length !== 3) return null;
      const a = lum(fg); const b = lum(bg);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
    if (hoverResult !== null && hoverResult < 4.5) {
      problems.push(`Hover contrast error: ${name}.html button ${index + 1} ratio ${hoverResult.toFixed(2)} < 4.5`);
    }
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

  const totalProducts = await page.locator('[data-product-grid] .product-card').count();
  if (totalProducts !== 27) {
    problems.push(`Products catalog rendered ${totalProducts} products. Expected 27 after adding the fourth Oils item.`);
  }

  // Check Hair Care filter exists
  const hairCareFilter = page.locator('[data-category-filter][value="Hair Care"]');
  if (!(await hairCareFilter.isVisible())) {
    problems.push('Hair Care category filter checkbox is missing on products.html');
  }

  // Filter by Hair Care
  await hairCareFilter.check();
  const hairCardCount = await page.locator('[data-product-grid] .product-card').count();
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

console.log('Validating screenshot-specific collection and composition fixes...');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  const hairCards = await page.locator('.hair-showcase .product-card').evaluateAll(cards => cards.map(card => ({
    name: card.querySelector('h3')?.textContent.trim(),
    image: card.querySelector('img')?.getAttribute('src'),
    addId: card.querySelector('[data-add-to-cart]')?.getAttribute('data-add-to-cart')
  })));
  const expectedHair = [
    'Bhringraj Scalp & Hair Oil',
    'Botanical Herbal Hair Cleanser',
    'Botanical Hair Conditioning Mask',
    'Neem & Tea Tree Scalp Oil'
  ];
  if (JSON.stringify(hairCards.map(card => card.name)) !== JSON.stringify(expectedHair)) {
    problems.push(`Hair Care screenshot regression: expected four named cards, got ${JSON.stringify(hairCards)}`);
  }
  if (new Set(hairCards.map(card => card.image)).size !== 4 || hairCards.some(card => !card.addId)) {
    problems.push('Hair Care screenshot regression: images must be distinct and every card must retain an Add action');
  }

  await page.goto(`${base}/home2.html`, { waitUntil: 'domcontentloaded' });
  const oilCards = await page.locator('#oils .product-card').evaluateAll(cards => cards.map(card => ({
    name: card.querySelector('h3')?.textContent.trim(),
    image: card.querySelector('img')?.getAttribute('src')
  })));
  if (oilCards.length !== 4 || !oilCards.some(card => card.name === 'Almond & Manjistha Body Oil')) {
    problems.push(`Home 2 Oils screenshot regression: expected four products including Almond & Manjistha Body Oil, got ${JSON.stringify(oilCards)}`);
  }
  if (new Set(oilCards.map(card => card.image)).size !== 4) {
    problems.push('Home 2 Oils screenshot regression: the four curated products must use varied imagery');
  }

  const chapterLinks = await page.locator('.editorial-index a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  const expectedChapters = ['#morning', '#oils', '#rituals', '#journey', '#quality', '#consultation'];
  if (JSON.stringify(chapterLinks) !== JSON.stringify(expectedChapters)) {
    problems.push(`Home 2 chapter index must contain six exact destinations. Got ${JSON.stringify(chapterLinks)}`);
  }
  for (const destination of chapterLinks) {
    if (await page.locator(destination).count() !== 1) {
      problems.push(`Home 2 chapter destination is missing or duplicated: ${destination}`);
    }
  }
  const chapterColumns = await page.locator('.editorial-index').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  if (chapterColumns !== 3) problems.push(`Home 2 desktop chapter index uses ${chapterColumns} columns instead of 3`);

  await page.goto(`${base}/contact.html`, { waitUntil: 'domcontentloaded' });
  const contactGeometry = await page.evaluate(() => {
    const hero = document.querySelector('.page-hero').getBoundingClientRect();
    const layout = document.querySelector('.contact-layout').getBoundingClientRect();
    const aside = document.querySelector('.contact-aside').getBoundingClientRect();
    const forms = document.querySelector('.contact-forms-container').getBoundingClientRect();
    const location = document.querySelector('.location-section').getBoundingClientRect();
    return { gap: layout.top - hero.bottom, asideHeight: aside.height, formsHeight: forms.height, locationTop: location.top, layoutBottom: layout.bottom };
  });
  if (contactGeometry.gap < 39 || contactGeometry.gap > 58) {
    problems.push(`Contact hero transition is ${contactGeometry.gap.toFixed(1)}px; expected roughly 40–56px`);
  }
  if (contactGeometry.asideHeight / contactGeometry.formsHeight < .55) {
    problems.push(`Contact intro is still disproportionately short (${contactGeometry.asideHeight.toFixed(1)} vs ${contactGeometry.formsHeight.toFixed(1)}px)`);
  }
  if (contactGeometry.locationTop < contactGeometry.layoutBottom - 1) {
    problems.push('Store Location must appear below, not beside, the enquiry layout');
  }
  const locationText = await page.locator('.store-location-card').innerText();
  for (const unverified of ['09:30', '18:30', 'Flagship Store & Dispensary', 'accredited partner']) {
    if (locationText.includes(unverified)) problems.push(`Contact location still publishes unverified detail: ${unverified}`);
  }

  await page.goto(`${base}/consultation.html`, { waitUntil: 'domcontentloaded' });
  const consultationGeometry = await page.evaluate(() => {
    const process = document.querySelector('.consultation-process-section').getBoundingClientRect();
    const booking = document.querySelector('.booking-section').getBoundingClientRect();
    const form = document.querySelector('.consult-form').getBoundingClientRect();
    return { processBottom: process.bottom, bookingTop: booking.top, formWidth: form.width };
  });
  if (Math.abs(consultationGeometry.processBottom - consultationGeometry.bookingTop) > 2) {
    problems.push('Consultation process and booking workflow should be consecutive independent sections');
  }
  if (consultationGeometry.formWidth > 950) {
    problems.push(`Consultation form is ${consultationGeometry.formWidth.toFixed(1)}px wide; expected a compact centered workflow`);
  }

  await page.goto(`${base}/certifications.html`, { waitUntil: 'domcontentloaded' });
  const registrySizing = await page.evaluate(() => {
    const panel = document.querySelector('.registry-toolbar').getBoundingClientRect();
    const badge = document.querySelector('.registry-toolbar .status-badge').getBoundingClientRect();
    return { panelWidth: panel.width, badgeWidth: badge.width };
  });
  if (registrySizing.badgeWidth > registrySizing.panelWidth * .42) {
    problems.push(`Registry status control still reserves excessive width (${registrySizing.badgeWidth.toFixed(1)} of ${registrySizing.panelWidth.toFixed(1)}px)`);
  }

  await page.goto(`${base}/products.html`, { waitUntil: 'domcontentloaded' });
  const productsSpacing = await page.evaluate(() => {
    const hero = document.querySelector('.page-hero').getBoundingClientRect();
    const strip = document.querySelector('.ingredient-filter-strip').getBoundingClientRect();
    const toolbar = document.querySelector('.shop-toolbar').getBoundingClientRect();
    return { heroToStrip: strip.top - hero.bottom, stripToToolbar: toolbar.top - strip.bottom };
  });
  if (productsSpacing.heroToStrip < 35 || productsSpacing.heroToStrip > 50) {
    problems.push(`Products hero-to-botanical spacing is ${productsSpacing.heroToStrip.toFixed(1)}px; expected roughly 36–48px`);
  }
  if (productsSpacing.stripToToolbar < 23 || productsSpacing.stripToToolbar > 34) {
    problems.push(`Products botanical-to-toolbar spacing is ${productsSpacing.stripToToolbar.toFixed(1)}px; expected roughly 24–32px`);
  }

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
  ['home-tablet', 'index', 820, 1180],
  ['home2-tablet', 'home2', 768, 1180],
  ['products-tablet', 'products', 820, 1180],
  ['consultation-tablet', 'consultation', 768, 1180],
  ['certifications-tablet', 'certifications', 768, 1180],
  ['contact-tablet', 'contact', 768, 1180],
  ['home-mobile', 'index', 390, 844],
  ['home2-mobile', 'home2', 390, 844],
  ['products-mobile', 'products', 390, 844],
  ['ingredients-mobile', 'ingredients', 390, 844],
  ['consultation-mobile', 'consultation', 390, 844],
  ['certifications-mobile', 'certifications', 390, 844],
  ['contact-mobile', 'contact', 390, 844]
];

for (const [outName, pageName, w, h] of captureList) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/${pageName}.html`, { waitUntil: 'domcontentloaded' });
  await loadFullPage(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, `${outName}.png`), fullPage: true });
  await page.close();
}

// Dark mode captures for every major public page
for (const pageName of majorPages) {
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
