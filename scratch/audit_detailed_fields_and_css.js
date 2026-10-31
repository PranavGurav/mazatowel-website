const fs = require('fs');

const adminJsx = fs.readFileSync('react/src/admin.jsx', 'utf8');
const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');
const adminCss = fs.readFileSync('public/assets/admin.css', 'utf8');
const publicCss = fs.readFileSync('public/assets/styles.css', 'utf8');

console.log('=== DETAILED FORM FIELD & CSS AUDIT ===\n');

function auditFields(fileLabel, jsxContent) {
  console.log(`Auditing form fields in ${fileLabel}...`);
  // Match all <input ... />, <select ...>...</select>, <textarea ...>...</textarea>
  const tagRegex = /<(input|select|textarea)([\s\S]*?)(\/?>)/g;
  let match;
  let total = 0;
  let unbound = 0;
  let noOnChange = 0;

  while ((match = tagRegex.exec(jsxContent)) !== null) {
    total++;
    const tag = match[1];
    const attrs = match[2];
    const lineNum = jsxContent.slice(0, match.index).split('\n').length;
    const type = attrs.match(/type=["']([^"']+)["']/)?.[1] || (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text');

    if (type === 'file') {
      // File inputs usually have onChange
      if (!attrs.includes('onChange')) {
        console.warn(`  [WARN] File input without onChange at line ${lineNum}`);
      }
      continue;
    }

    if (type === 'hidden') continue;

    const hasValue = attrs.includes('value=') || attrs.includes('checked=');
    const hasOnChange = attrs.includes('onChange') || attrs.includes('readOnly') || attrs.includes('disabled');

    if (!hasValue && !attrs.includes('ref=')) {
      console.warn(`  [WARN] ${tag} (type=${type}) at line ${lineNum} missing value/checked binding!`);
      unbound++;
    }
    if (!hasOnChange) {
      console.warn(`  [WARN] ${tag} (type=${type}) at line ${lineNum} missing onChange/readOnly/disabled handler!`);
      noOnChange++;
    }
  }

  console.log(`  Total fields checked in ${fileLabel}: ${total}`);
  console.log(`  Unbound fields: ${unbound}, Missing onChange: ${noOnChange}\n`);
}

auditFields('react/src/public.jsx', publicJsx);
auditFields('react/src/admin.jsx', adminJsx);

