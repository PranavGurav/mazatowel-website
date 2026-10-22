const fs = require('fs');
const http = require('http');

console.log('\n======================================================');
console.log('       VERIFYING FOOTER LOGO INTEGRATION              ');
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

// 1. Check public.jsx
console.log('--- 1. public.jsx Footer Checks ---');
const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');

assert(publicJsx.includes('className="footer-brand"'), 'public.jsx includes footer-brand container');
assert(publicJsx.includes('className="footer-logo"'), 'public.jsx includes footer-logo image');
assert(publicJsx.includes('src="/assets/mazatowel-logo-tight.png"'), 'public.jsx references /assets/mazatowel-logo-tight.png');
assert(publicJsx.includes('alt={`${settings.brand} logo`}'), 'public.jsx has accessible alt attribute for footer logo');
assert(publicJsx.includes('aria-label={`${settings.brand} Home`}'), 'public.jsx has accessible aria-label on footer link');
assert(!publicJsx.includes('className="footer-text-brand"'), 'public.jsx completely replaced text brand name in footer with logo');

// 2. Check styles.css
console.log('\n--- 2. styles.css Stylesheet Checks ---');
const stylesCss = fs.readFileSync('public/assets/styles.css', 'utf8');

assert(stylesCss.includes('.footer-brand'), 'styles.css defines .footer-brand');
assert(stylesCss.includes('.footer-logo'), 'styles.css defines .footer-logo');
assert(stylesCss.includes('height:48px') || stylesCss.includes('height: 48px'), 'styles.css sets small height (48px) for footer logo');
assert(stylesCss.includes('max-width:148px') || stylesCss.includes('max-width: 148px'), 'styles.css sets max-width for footer logo');
assert(stylesCss.includes('filter:brightness(1.12)'), 'styles.css applies brightness filter for dark footer contrast');

// 3. Check built bundle
console.log('\n--- 3. Built Production Bundle Checks ---');
const builtIndexJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');
assert(builtIndexJs.includes('footer-brand'), 'Built index.js contains footer-brand class');
assert(builtIndexJs.includes('footer-logo'), 'Built index.js contains footer-logo class');
assert(builtIndexJs.includes('/assets/mazatowel-logo-tight.png'), 'Built index.js references mazatowel-logo-tight.png in footer');

// 4. Check HTTP live response
console.log('\n--- 4. HTTP Live Response Check ---');
const req = http.get('http://localhost:3000/', (res) => {
  assert(res.statusCode === 200, `Live server root responds with HTTP 200 (got ${res.statusCode})`);
  
  // 5. Placeholder compliance check
  console.log('\n--- 5. Placeholder Strict Compliance Check ---');
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
  if (invalidPlaceholders.length > 0) {
    console.error('Invalid placeholders:', invalidPlaceholders);
  }

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
