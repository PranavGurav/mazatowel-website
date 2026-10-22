const fs = require('fs');
const http = require('http');

console.log('\n======================================================');
console.log('   VERIFYING DROPDOWN CONTAINMENT & CTA REMOVAL       ');
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

// 1. Verify Customize Towel button removed from desktop navbar
console.log('--- 1. Desktop Navbar CTA Removal ---');
assert(!publicJsx.includes('nav-cta-btn'), 'public.jsx: Removed nav-cta-btn from desktop navbar');
assert(!publicJsx.includes('nav-cta-wrap'), 'public.jsx: Removed nav-cta-wrap container from desktop navbar');

// 2. Verify Dropdown Positioning & Containment
console.log('\n--- 2. Dropdown Positioning & Boundary Containment ---');
assert(stylesCss.includes('right:0') || stylesCss.includes('right: 0'), 'styles.css: .nav-dropdown-menu positioned flush with right: 0');
assert(stylesCss.includes('white-space:normal') || stylesCss.includes('white-space: normal'), 'styles.css: .nav-dropdown-menu resets inherited white-space to normal');
assert(stylesCss.includes('minmax(0,1fr)') || stylesCss.includes('minmax(0, 1fr)'), 'styles.css: .nav-dropdown-grid uses minmax(0, 1fr) to prevent column overflow');
assert(stylesCss.includes('overflow:hidden') || stylesCss.includes('overflow: hidden'), 'styles.css: .nav-dropdown-item has overflow: hidden');
assert(!stylesCss.includes('.nav-dropdown-item:hover{background:var(--soft);transform:translateX(2px)}'), 'styles.css: Removed translateX(2px) on hover that pushed items outside border');

// 3. Verify All Sections Present
console.log('\n--- 3. Commercial & Informational Links Integrity ---');
const expectedAnchors = ['#shop', '#tshirts', '#family-sets', '#designs', '#corporate', '#gallery', '#reviews', '#customers', '#how', '#why', '#hygiene', '#about', '#faq'];
expectedAnchors.forEach(a => {
  assert(publicJsx.includes(a), `public.jsx contains section link ${a}`);
});

// 4. Production Built Bundle Check
console.log('\n--- 4. Production Built Bundle Checks ---');
const builtIndexJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');
assert(!builtIndexJs.includes('nav-cta-btn'), 'Built bundle does not contain desktop nav-cta-btn');
assert(builtIndexJs.includes('Explore & Story'), 'Built bundle contains Explore & Story dropdown');

// 5. Test Live HTTP Endpoint
console.log('\n--- 5. Live HTTP Server Response ---');
const req = http.get('http://localhost:3000/', (res) => {
  assert(res.statusCode === 200, `Live server root responds with HTTP 200 (got ${res.statusCode})`);

  // 6. Strict placeholder check
  console.log('\n--- 6. Placeholder Strict Compliance ---');
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
