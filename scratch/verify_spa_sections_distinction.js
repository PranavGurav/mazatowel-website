const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('\n================================================================');
console.log('       VERIFYING SPA SECTIONS DISTINCTION & IDENTIFICATION      ');
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
const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');
const builtIndexJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'index.js'), 'utf8');

// 1. Separate Section Class Names & Identification
console.log('--- 1. Separate Visual Class Identifiers ---');
const sectionClasses = [
  'hero-atelier-luxury',
  'section-stats-atelier',
  'section-trust-atelier',
  'section-featured-lookbook',
  'section-family-heirloom',
  'section-journey-timeline',
  'section-gallery-archive',
  'section-about-heritage',
  'section-hygiene-cleanroom',
  'section-clients-prestige',
  'section-reviews-verified',
  'section-faq-concierge',
  'section-cta-finale'
];

sectionClasses.forEach(cls => {
  assert(publicJsx.includes(cls), `public.jsx uses distinctive class "${cls}"`);
  assert(stylesCss.includes(`.${cls}`), `styles.css defines distinctive class ".${cls}"`);
  assert(builtIndexJs.includes(cls), `Built index.js bundles class "${cls}"`);
});

// 2. Interactive Features on SPA
console.log('\n--- 2. Interactive SPA Features ---');
assert(publicJsx.includes('galleryFilter') && publicJsx.includes('setGalleryFilter'), 'Gallery has interactive category filter state');
assert(publicJsx.includes('activeGalleryModal') && publicJsx.includes('setActiveGalleryModal'), 'Gallery has interactive Lightbox Modal state');
assert(publicJsx.includes('reviewFilter') && publicJsx.includes('setReviewFilter'), 'Customer Reviews has category filter state');
assert(publicJsx.includes('faqCategory') && publicJsx.includes('setFaqCategory'), 'FAQ has category filter state');
assert(publicJsx.includes('gallery-lightbox-overlay'), 'Lightbox overlay markup included in public.jsx');

// 3. Eyebrow Badges & Clean Unnumbered Headings
console.log('\n--- 3. Eyebrow Badges & Clean Unnumbered Headings ---');
assert(!publicJsx.includes('✦ 01 /'), 'No "01 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 02 /'), 'No "02 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 03 /'), 'No "03 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 05 /'), 'No "05 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 06 /'), 'No "06 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 07 /'), 'No "07 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 09 /'), 'No "09 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 10 /'), 'No "10 /" numbering in public.jsx');
assert(!publicJsx.includes('✦ 11 /'), 'No "11 /" numbering in public.jsx');

assert(publicJsx.includes('✦ ATELIER BENCHMARKS'), 'Clean benchmark header present');
assert(publicJsx.includes('✦ THE MAZATOWEL STANDARD'), 'Clean standard header present');
assert(publicJsx.includes('✦ SIGNATURE COLLECTIONS'), 'Clean signature collections header present');
assert(publicJsx.includes('✦ THE BESPOKE JOURNEY'), 'Clean journey roadmap header present');
assert(publicJsx.includes('✦ REAL WORK GALLERY'), 'Clean real work archive header present');
assert(publicJsx.includes('✦ ATELIER HERITAGE'), 'Clean heritage header present');
assert(publicJsx.includes('✦ TRUSTED BY PRESTIGE BRANDS'), 'Clean prestige clients header present');
assert(publicJsx.includes('✦ CUSTOMER EXPERIENCES'), 'Clean verified reviews header present');
assert(publicJsx.includes('✦ FREQUENTLY ASKED QUESTIONS'), 'Clean FAQ header present');
assert(publicJsx.includes('✦ BESPOKE ATELIER INVITATION ✦'), 'Grand finale invitation header present');

// 3b. Removal of Image Overlay Content & Right-Side Clutter
console.log('\n--- 3b. Removal of Image Overlay Content & Right-Side Clutter ---');
assert(!publicJsx.includes('className="stage-pills"'), 'No stage pills overlaying hero product image');
assert(!publicJsx.includes('className="towel-tag'), 'No towel tags overlaying hero towels');
assert(!publicJsx.includes('className="hero-mini-pill"'), 'No mini pill floating over hero image');
assert(!publicJsx.includes('className="lookbook-badge-pill"'), 'No badge pill overlaying lookbook images');
assert(!publicJsx.includes('className="gallery-card-overlay"'), 'No text overlay covering gallery photos');
assert(!publicJsx.includes('className="b2b-perks-grid"'), 'No redundant b2b perks grid cluttering client section');
assert(!publicJsx.includes('className="faq-concierge-card"'), 'No redundant side concierge card splitting FAQ');

// 4. Clean Room & Hygiene Protocol Integrity
console.log('\n--- 4. Clean Room & Hygiene Protocol Integrity ---');
assert(publicJsx.includes('Medical-Grade Cleanliness Protocol'), 'Hygiene clean-room protocol present');
assert(stylesCss.includes('.section-hygiene-cleanroom'), 'styles.css defines .section-hygiene-cleanroom');

// 5. Live Server HTTP Response
http.get('http://localhost:3000/', res => {
  assert(res.statusCode === 200, `Live server root responds with HTTP 200 (got ${res.statusCode})`);
  
  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}).on('error', err => {
  console.error('Server connection error:', err.message);
  process.exit(1);
});
