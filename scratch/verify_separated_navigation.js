const fs = require('fs');
const http = require('http');

console.log('\n======================================================');
console.log('   VERIFYING SEPARATED SALES & INFORMATION NAVIGATION  ');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');
const stylesCss = fs.readFileSync('public/assets/styles.css', 'utf8');

// 1. Sells / Commercial Links Check
console.log('--- 1. Sells & Commercial Categories ---');
const expectedShopLinks = ['#shop', '#tshirts', '#family-sets', '#designs', '#corporate'];
expectedShopLinks.forEach(href => {
  assert(publicJsx.includes(`href: '${href}'`), `shopLinks defines commercial category with anchor ${href}`);
});
assert(publicJsx.includes('className="nav-group-shop"'), 'public.jsx renders .nav-group-shop container for commercial items');

// 2. Information & Guides Dropdown Check
console.log('\n--- 2. Information & Story Dropdown ---');
const expectedInfoLinks = ['#gallery', '#reviews', '#customers', '#how', '#why', '#hygiene', '#about', '#faq'];
expectedInfoLinks.forEach(href => {
  assert(publicJsx.includes(`href: '${href}'`), `infoGroups defines informational item with anchor ${href}`);
});
assert(publicJsx.includes('nav-dropdown-trigger'), 'public.jsx renders Explore & Story dropdown trigger');
assert(publicJsx.includes('className="nav-dropdown-menu"'), 'public.jsx renders 3-column dropdown menu card');
assert(publicJsx.includes('Our Story & Proof'), 'Dropdown includes "Our Story & Proof" column');
assert(publicJsx.includes('Guides & Quality'), 'Dropdown includes "Guides & Quality" column');
assert(publicJsx.includes('Company & Help'), 'Dropdown includes "Company & Help" column');

// 3. Primary Conversion CTA Check
console.log('\n--- 3. Primary Conversion CTA ---');
assert(publicJsx.includes('Customize Towel'), 'Desktop navbar includes prominent "Customize Towel" CTA');
assert(publicJsx.includes('Customize Your Towel Now'), 'Mobile drawer includes prominent "Customize Your Towel Now" CTA');

// 4. Mobile Drawer Separation Check
console.log('\n--- 4. Mobile Drawer Structured Segmentation ---');
assert(publicJsx.includes('🛍 Shop & Products'), 'Mobile drawer clearly labels Shop & Products section');
assert(publicJsx.includes('📖 Guides & Our Story'), 'Mobile drawer clearly labels Guides & Our Story section');

// 5. CSS Stylesheet Rules Check
console.log('\n--- 5. Stylesheet Architecture Rules ---');
assert(stylesCss.includes('.nav-group-shop'), 'styles.css defines .nav-group-shop');
assert(stylesCss.includes('.nav-dropdown-menu'), 'styles.css defines .nav-dropdown-menu');
assert(stylesCss.includes('.nav-dropdown-grid'), 'styles.css defines .nav-dropdown-grid');
assert(stylesCss.includes('.nav-cta-btn'), 'styles.css defines .nav-cta-btn');
assert(stylesCss.includes('.mobile-section-group'), 'styles.css defines .mobile-section-group');
assert(stylesCss.includes('@media(max-width:1040px)'), 'styles.css defines 1040px breakpoint');

// 6. Production Built Bundle Check
console.log('\n--- 6. Production Built Bundle ---');
const builtIndexJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');
assert(builtIndexJs.includes('nav-group-shop'), 'Built index.js contains nav-group-shop');
assert(builtIndexJs.includes('Explore & Story'), 'Built index.js contains Explore & Story');
assert(builtIndexJs.includes('Customize Towel'), 'Built index.js contains Customize Towel');

// 7. Live Server Response Check
console.log('\n--- 7. Live HTTP Server Response ---');
const req = http.get('http://localhost:3000/', (res) => {
  assert(res.statusCode === 200, `Server responds with HTTP 200 (got ${res.statusCode})`);

  // 8. Strict Placeholder Compliance Check
  console.log('\n--- 8. Placeholder Strict Compliance ---');
  const codebases = [
    { file: 'react/src/public.jsx', content: publicJsx },
    { file: 'react/src/admin.jsx', content: fs.readFileSync('react/src/admin.jsx', 'utf8') }
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

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
});

req.on('error', (err) => {
  console.error('Server request failed:', err.message);
  process.exit(1);
});
