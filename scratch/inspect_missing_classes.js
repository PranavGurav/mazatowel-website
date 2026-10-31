const fs = require('fs');

const adminJsx = fs.readFileSync('react/src/admin.jsx', 'utf8');
const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');

const admMissing = ['req-star', 'link-action-btn', 'settings-tabs-bar', 'btn-sm', 'dash-visitor-title-col', 'is-live', 'is-closed'];
const pubMissing = ['step-num-badge', 'color-card-placeholder', 'qty-col', 'qty-stepper-input', 'pricing-col', 'thread-selector-title', 'preview-label', 'pill-val', 'studio-form-col'];

console.log('=== ADMIN USAGES ===');
admMissing.forEach(cls => {
  const re = new RegExp(`className=[^>]*\\b${cls}\\b[^>]*`, 'g');
  let m;
  while ((m = re.exec(adminJsx))) {
    const lineNum = adminJsx.slice(0, m.index).split('\n').length;
    console.log(`[admin.jsx] line ${lineNum}: ${m[0]}`);
  }
});

console.log('\n=== PUBLIC USAGES ===');
pubMissing.forEach(cls => {
  const re = new RegExp(`className=[^>]*\\b${cls}\\b[^>]*`, 'g');
  let m;
  while ((m = re.exec(publicJsx))) {
    const lineNum = publicJsx.slice(0, m.index).split('\n').length;
    console.log(`[public.jsx] line ${lineNum}: ${m[0]}`);
  }
});

