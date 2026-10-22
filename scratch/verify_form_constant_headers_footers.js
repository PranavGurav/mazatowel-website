const fs = require('fs');
const path = require('path');
const http = require('http');

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

console.log('\n--- VERIFYING FORM CONSTANT HEADERS, CONSTANT FOOTERS & SCROLLABLE FIELDS ---');

// 1. Check admin.css
const adminCssPath = path.join(__dirname, '..', 'public', 'assets', 'admin.css');
const adminCss = fs.readFileSync(adminCssPath, 'utf8');

assert(adminCss.includes('.modal-card,'), 'admin.css has .modal-card rule');
assert(adminCss.includes('.category-modal-card'), 'admin.css has .category-modal-card rule');
assert(adminCss.includes('overflow: hidden !important'), 'admin.css has overflow: hidden on outer modal cards to prevent whole card from scrolling');
assert(adminCss.includes('display: flex !important') && adminCss.includes('flex-direction: column !important'), 'admin.css enforces flex column layout on modal cards');
assert(adminCss.includes('position: sticky !important') && adminCss.includes('top: 0 !important'), 'admin.css pins modal-head with sticky top: 0');
assert(adminCss.includes('overflow-y: auto !important') && adminCss.includes('flex: 1 1 auto !important'), 'admin.css ensures modal-body has flex: 1 1 auto and overflow-y: auto');
assert(adminCss.includes('position: sticky !important') && adminCss.includes('bottom: 0 !important'), 'admin.css pins modal-actions and modal-foot with sticky bottom: 0');
assert(adminCss.includes('.sticky-form-head') && adminCss.includes('.sticky-form-foot'), 'admin.css defines sticky headers and footers for panel forms');

// 2. Check admin.jsx
const adminJsxPath = path.join(__dirname, '..', 'react', 'src', 'admin.jsx');
const adminJsx = fs.readFileSync(adminJsxPath, 'utf8');

assert(!adminJsx.includes('style={{ maxHeight: \'78vh\', overflowY: \'auto\' }}'), 'admin.jsx: ItemEditor inline max-height and overflow removed in favor of responsive flex body');
assert(adminJsx.includes('id="settings-form"') && adminJsx.includes('form="settings-form"'), 'admin.jsx: SettingsEditor links sticky header and footer buttons to settings form');
assert(adminJsx.includes('id="stats-form"') && adminJsx.includes('form="stats-form"'), 'admin.jsx: StatsEditor links sticky header and footer buttons to stats form');
assert(adminJsx.includes('id="content-form"') && adminJsx.includes('form="content-form"'), 'admin.jsx: ContentEditor links sticky header and footer buttons to content form');

// 3. Check public styles.css
const stylesCssPath = path.join(__dirname, '..', 'public', 'assets', 'styles.css');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

assert(stylesCss.includes('.modal-head{flex:0 0 auto;position:sticky;top:0'), 'styles.css: public order modal has constant sticky header');
assert(stylesCss.includes('.modal-body{flex:1 1 auto;min-height:0;overflow-y:auto'), 'styles.css: public order modal has scrollable body container');
assert(stylesCss.includes('.request-submit{position:sticky;bottom:0'), 'styles.css: public order modal request submit button is sticky constant');

// 4. Verify Server Health & APIs
http.get('http://localhost:3000/api/site', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      assert(parsed && parsed.products && parsed.products.length > 0, 'Server is running and /api/site returns product data');
      assert(parsed.settings && parsed.settings.brand, 'Server returns brand settings');
    } catch (e) {
      assert(false, 'Failed to parse /api/site response: ' + e.message);
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('All form constant header/footer checks PASSED!\n');
    }
  });
}).on('error', (err) => {
  console.error('Server connection error:', err.message);
  process.exit(1);
});
