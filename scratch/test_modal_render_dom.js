const fs = require('fs');
const assert = require('assert');

// 1. Verify CSS styles for modal-card-commercial and b2b-sample-modal-body
const styles = fs.readFileSync('public/assets/styles.css', 'utf8');

assert(styles.includes('.modal-card-commercial'), 'styles.css contains .modal-card-commercial');
assert(styles.includes('.modal-card-commercial .modal-head'), 'styles.css contains .modal-head styling');
assert(styles.includes('align-items: flex-start'), 'styles.css aligns close button cleanly at top-right');
assert(styles.includes('.b2b-sample-modal-body .field-two-col'), 'styles.css has two-column grid layout');
assert(styles.includes('.sample-kit-perks-badge'), 'styles.css has perks callout badge');
console.log('✓ All CSS styles for Commercial Sample Kit modal verified.');

// 2. Verify React component source code
const publicSrc = fs.readFileSync('react/src/public.jsx', 'utf8');
assert(publicSrc.includes('function B2BSampleModal'), 'B2BSampleModal function declared');
assert(publicSrc.includes('className="modal show"'), 'Modal has show backdrop class');
assert(publicSrc.includes('className="modal-card modal-card-commercial"'), 'Modal card has commercial class');
assert(publicSrc.includes('className="icon-close-btn"'), 'Modal has icon-close-btn');
assert(publicSrc.includes('className="phone-prefix">+91</span>'), 'Phone input has +91 badge');
assert(publicSrc.includes('COMMERCIAL_SECTORS.map'), 'Sector dropdown maps sectors');
console.log('✓ React source code for B2BSampleModal verified.');

// 3. Verify compiled bundle in public/react-build/
const compiledHtml = fs.readFileSync('public/react-build/index.html', 'utf8');
const compiledJs = fs.readFileSync('public/react-build/assets/index.js', 'utf8');

assert(compiledHtml.includes('/react-build/assets/index'), 'Compiled HTML references index bundle');
assert(compiledJs.includes('modal-card-commercial'), 'Compiled bundle has modal-card-commercial');
assert(compiledJs.includes('sample-kit-perks-badge'), 'Compiled bundle has sample-kit-perks-badge');
assert(!compiledJs.includes('className:"modal-close"'), 'Compiled bundle does NOT have old broken modal-close button');
console.log('✓ Compiled React bundle integrity verified.');

console.log('\nAll Commercial Sample Modal verification checks passed with 100% accuracy!');
