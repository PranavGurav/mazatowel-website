const fs = require('fs');
const http = require('http');

console.log('\n======================================================');
console.log('       VERIFYING TAGLINE REMOVAL & CLEANUP            ');
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

// 1. Verify removal from footer-bottom
console.log('--- 1. Footer Bottom Bar Checks ---');
assert(!publicJsx.includes('footer-bottom-tagline'), 'public.jsx: Removed footer-bottom-tagline');
assert(!publicJsx.includes('<span className="footer-bottom-tagline">'), 'public.jsx: No tagline span in footer-bottom');
assert(publicJsx.includes('<span>© {new Date().getFullYear()} {settings.brand}</span>'), 'public.jsx: Clean copyright preserved in footer-bottom');

// 2. Verify removal from footer brand column
console.log('\n--- 2. Footer Brand Column Checks ---');
assert(!publicJsx.includes('footer-tagline-motto'), 'public.jsx: Removed footer-tagline-motto');
assert(publicJsx.includes('className="footer-logo"'), 'public.jsx: Small brand logo retained in footer');

// 3. Verify removal from hero
console.log('\n--- 3. Hero Section Checks ---');
assert(!publicJsx.includes('className="hero-motto"'), 'public.jsx: Removed hero-motto from hero');
assert(publicJsx.includes('<h1>{content.heroHeading}</h1>'), 'public.jsx: Hero heading preserved');

// 4. Verify preserved in Why Personalize section
console.log('\n--- 4. Preserved in Meaningful Section ---');
assert(publicJsx.includes('title={content.whyTitle}'), 'public.jsx: Preserved in Why Personalize section');
const siteContent = JSON.parse(fs.readFileSync('data/site-content.json', 'utf8'));
assert(siteContent.whyTitle === 'Your Towel. Your Name. Your Story.', 'site-content.json: whyTitle is "Your Towel. Your Name. Your Story."');

// 5. Verify built bundle
console.log('\n--- 5. Production Built Bundle Checks ---');
const builtIndexJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');
assert(!builtIndexJs.includes('footer-bottom-tagline'), 'Built index.js does not contain footer-bottom-tagline');
assert(!builtIndexJs.includes('footer-tagline-motto'), 'Built index.js does not contain footer-tagline-motto');
assert(!builtIndexJs.includes('hero-motto-spark'), 'Built index.js does not contain hero-motto-spark');

// 6. Test live HTTP endpoint
console.log('\n--- 6. Live HTTP Request Check ---');
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
