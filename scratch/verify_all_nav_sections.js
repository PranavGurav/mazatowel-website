const fs = require('fs');
const http = require('http');

console.log('\n======================================================');
console.log('       VERIFYING COMPLETE NAVBAR SECTIONS             ');
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

// 1. Verify all 13 section links exist in public.jsx Header
console.log('--- 1. Navbar Header Links Definition ---');
const expectedLinks = [
  ['Towels', '#shop'],
  ['T-Shirts', '#tshirts'],
  ['Family Sets', '#family-sets'],
  ['Designs', '#designs'],
  ['Gallery', '#gallery'],
  ['How It Works', '#how'],
  ['Why Personalize', '#why'],
  ['Hygiene', '#hygiene'],
  ['Reviews', '#reviews'],
  ['Customers', '#customers'],
  ['Corporate', '#corporate'],
  ['About', '#about'],
  ['FAQ', '#faq']
];

expectedLinks.forEach(([name, href]) => {
  assert(
    publicJsx.includes(`['${name}', '${href}']`),
    `Navbar contains link: "${name}" (${href})`
  );
});

// 2. Verify all 13 target anchor elements exist on the page
console.log('\n--- 2. Corresponding Target Sections in DOM ---');
expectedLinks.forEach(([name, href]) => {
  const id = href.replace('#', '');
  const hasId = publicJsx.includes(`id="${id}"`);
  assert(hasId, `Page contains target section with id="${id}" (for ${name})`);
});

// 3. Verify Scroll Spy & Active State Logic
console.log('\n--- 3. Active Nav Link Scroll Spy ---');
assert(publicJsx.includes('activeSection'), 'Header component tracks activeSection state');
assert(publicJsx.includes('handleScroll'), 'Header attaches scroll listener for active section indicator');
assert(publicJsx.includes('mobile-nav-grid'), 'Mobile menu uses responsive mobile-nav-grid');
assert(publicJsx.includes('mobile-arrow'), 'Mobile menu links have visual arrow indicators');

// 4. Verify CSS Layout & Usability Rules
console.log('\n--- 4. Stylesheet Usability & Breakpoint Rules ---');
assert(stylesCss.includes('scroll-margin-top:84px') || stylesCss.includes('scroll-margin-top: 84px'), 'styles.css defines scroll-margin-top so sticky header does not obscure section tops');
assert(stylesCss.includes('@media(max-width:1120px)'), 'styles.css defines 1120px media query breakpoint for collapsing nav links');
assert(stylesCss.includes('.nav-links a.active'), 'styles.css defines active highlight styling for current section');
assert(stylesCss.includes('.mobile-nav-grid'), 'styles.css styles .mobile-nav-grid layout');

// 5. Verify Production Build Bundle
console.log('\n--- 5. Production Built Bundle ---');
const builtIndexJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');
expectedLinks.forEach(([name, href]) => {
  assert(builtIndexJs.includes(href), `Built bundle includes anchor ${href}`);
});

// 6. Test Live HTTP Endpoint
console.log('\n--- 6. Live HTTP Request ---');
const req = http.get('http://localhost:3000/', (res) => {
  assert(res.statusCode === 200, `Live server root responds with HTTP 200 (got ${res.statusCode})`);

  // 7. Strict placeholder check
  console.log('\n--- 7. Placeholder Strict Compliance ---');
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
