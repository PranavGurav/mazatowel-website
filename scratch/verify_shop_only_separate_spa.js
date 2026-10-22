const fs = require('fs');
const path = require('path');

console.log('\n================================================================');
console.log('       VERIFYING SHOP ONLY SEPARATE & ALL OTHERS AS SPA        ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');
const adminJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'admin.jsx'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');
const builtIndexJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'index.js'), 'utf8');

// 1. Navigation Architecture
console.log('--- 1. Navigation Architecture ---');
assert(publicJsx.includes("href: '/#home', sectionId: 'home'"), 'Navbar defines Home anchor link');
assert(publicJsx.includes("href: '/shop', isShop: true"), 'Navbar defines separate Shop Atelier link');
assert(publicJsx.includes("href: '/#gallery', sectionId: 'gallery'"), 'Navbar defines Work Gallery anchor link');
assert(publicJsx.includes("href: '/#about', sectionId: 'about'"), 'Navbar defines About Studio anchor link');
assert(publicJsx.includes("href: '/#reviews', sectionId: 'reviews'"), 'Navbar defines Customer Reviews anchor link');
assert(publicJsx.includes("href: '/#faq', sectionId: 'faq'"), 'Navbar defines Help & FAQ anchor link');
assert(publicJsx.includes('setActiveSection(id)'), 'Header implements Scroll Spy for active section highlighting on SPA');

// 2. Router: ONLY Shop is separate
console.log('\n--- 2. Router Implementation ---');
assert(publicJsx.includes("{currentPath === '/shop' ? renderShopPage() : renderHomePage()}"), 'Router strictly separates only /shop from SPA /');
assert(!publicJsx.includes('renderGalleryPage = () =>'), 'Removed obsolete standalone renderGalleryPage function');
assert(!publicJsx.includes('renderAboutPage = () =>'), 'Removed obsolete standalone renderAboutPage function');
assert(!publicJsx.includes('renderFaqPage = () =>'), 'Removed obsolete standalone renderFaqPage function');
assert(!publicJsx.includes('renderReviewsPage = () =>'), 'Removed obsolete standalone renderReviewsPage function');
assert(!publicJsx.includes('renderHowPage = () =>'), 'Removed obsolete standalone renderHowPage function');

// 3. Single Page Application Sections (renderHomePage)
console.log('\n--- 3. Single Page Application Structure ---');
const expectedSpaSections = ['home', 'stats', 'trust', 'featured', 'family-sets', 'how', 'gallery', 'about', 'hygiene', 'customers', 'reviews', 'faq'];
expectedSpaSections.forEach(id => {
  assert(publicJsx.includes(`id="${id}"`), `SPA contains section with id="${id}"`);
});

// 4. Shop Atelier Structure (renderShopPage)
console.log('\n--- 4. Dedicated Shop Atelier Structure ---');
const expectedShopAnchors = ['shop-towels', 'shop-tshirts', 'shop-sets', 'shop-designs', 'shop-corporate', 'shop-studio'];
expectedShopAnchors.forEach(id => {
  assert(publicJsx.includes(`id="${id}"`), `Shop contains shopping anchor with id="${id}"`);
});
assert(publicJsx.includes('shop-subnav-sticky'), 'Shop contains sticky subnavigation pill bar');

// 5. CSS & Layout Verification
console.log('\n--- 5. CSS Styling & Usability ---');
assert(stylesCss.includes('.nav-item-shop'), 'CSS defines .nav-item-shop badge styling');
assert(stylesCss.includes('.shop-subnav-sticky'), 'CSS defines .shop-subnav-sticky container');
assert(stylesCss.includes('.why-grid'), 'CSS defines .why-grid responsive cards');
assert(stylesCss.includes('.featured-shop-banner'), 'CSS defines .featured-shop-banner CTA block');
assert(stylesCss.includes('scroll-margin-top:84px') || stylesCss.includes('scroll-margin-top: 84px'), 'CSS defines scroll-margin-top for SPA sections');

// 6. Built Bundle Checks
console.log('\n--- 6. Built Production Bundle Verification ---');
assert(builtIndexJs.includes('nav-item-shop'), 'Built index.js contains nav-item-shop');
assert(builtIndexJs.includes('shop-towels'), 'Built index.js contains shop-towels');
assert(builtIndexJs.includes('shop-studio'), 'Built index.js contains shop-studio');
assert(builtIndexJs.includes('mazatowel-logo-tight.png'), 'Built index.js references footer brand logo');

// 7. Strict Placeholder Compliance Check
console.log('\n--- 7. Strict Placeholder Compliance Check ---');
const codebases = [
  { file: 'react/src/public.jsx', content: publicJsx },
  { file: 'react/src/admin.jsx', content: adminJsx }
];

let invalidPlaceholders = [];
for (const { file, content } of codebases) {
  const matches = content.match(/placeholder=["'][^"']+["']/g) || [];
  for (const m of matches) {
    const val = m.replace(/placeholder=["']/, '').replace(/["']$/, '');
    if (!val.startsWith('Enter ') && !val.startsWith('Select ')) {
      invalidPlaceholders.push(`${file}: ${m}`);
    }
  }
}
assert(invalidPlaceholders.length === 0, `All placeholders strictly follow "Enter [field]" (violations: ${invalidPlaceholders.length})`);
assert(!publicJsx.includes('placeholder="98765'), 'No demo phone digits in placeholders');
assert(!/placeholder="[^"]*e\.g\./i.test(publicJsx), 'No "e.g." in public placeholders');

// 8. Footer Brand Logo
console.log('\n--- 8. Footer Logo Integrity ---');
assert(publicJsx.includes('className="footer-logo"'), 'Footer uses .footer-logo image');
assert(publicJsx.includes('src="/assets/mazatowel-logo-tight.png"'), 'Footer links to tight logo');
assert(!publicJsx.includes('className="footer-text-brand"'), 'No text brand title in footer');

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('================================================================\n');

process.exit(failed > 0 ? 1 : 0);
