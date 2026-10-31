const fs = require('fs');
const path = require('path');

const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');
const adminJsx = fs.readFileSync('react/src/admin.jsx', 'utf8');
const publicCss = fs.readFileSync('public/assets/styles.css', 'utf8');
const adminCss = fs.readFileSync('public/assets/admin.css', 'utf8');

console.log('=== CSS & FORMS AUDIT ===\n');

// 1. Audit CSS validity (bracket matching)
function checkCssBrackets(name, css) {
  let open = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') open++;
    else if (css[i] === '}') open--;
    if (open < 0) {
      console.error(`[ERROR] ${name} has unmatched closing brace '}' at char ${i}`);
      return false;
    }
  }
  if (open !== 0) {
    console.error(`[ERROR] ${name} has ${open} unclosed brace(s) '{'`);
    return false;
  }
  console.log(`✓ ${name}: CSS braces are balanced perfectly.`);
  return true;
}

checkCssBrackets('styles.css', publicCss);
checkCssBrackets('admin.css', adminCss);

// 2. Extract CSS class definitions
function extractCssClasses(css) {
  const classes = new Set();
  const regex = /\.([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

const pubClasses = extractCssClasses(publicCss);
const admClasses = extractCssClasses(adminCss);
console.log(`Extracted ${pubClasses.size} CSS classes from styles.css`);
console.log(`Extracted ${admClasses.size} CSS classes from admin.css`);

// 3. Inspect JSX className usage
function extractJsxClassNames(jsx) {
  const classNames = new Set();
  const regex = /className=(?:["']([^"']+)["']|{`([^`]+)`})/g;
  let match;
  while ((match = regex.exec(jsx)) !== null) {
    const raw = match[1] || match[2] || '';
    // Split by spaces, strip expressions
    const parts = raw.split(/\s+/).map(p => p.replace(/\$\{[^}]+\}/g, '').trim()).filter(Boolean);
    parts.forEach(p => {
      // Split if multiple or compound
      p.split(/\s+/).forEach(c => {
        if (/^[a-zA-Z0-9_-]+$/.test(c)) classNames.add(c);
      });
    });
  }
  return classNames;
}

const pubUsedClasses = extractJsxClassNames(publicJsx);
const admUsedClasses = extractJsxClassNames(adminJsx);
console.log(`Found ${pubUsedClasses.size} unique static class names in public.jsx`);
console.log(`Found ${admUsedClasses.size} unique static class names in admin.jsx`);

// 4. Audit inputs, textareas, selects in public.jsx
console.log('\n--- Auditing public.jsx Form Elements ---');
const pubInputs = [...publicJsx.matchAll(/<(input|select|textarea|button)([^>]*)>/g)];
console.log(`Total interactive elements in public.jsx: ${pubInputs.length}`);

let issues = 0;
pubInputs.forEach((inp, idx) => {
  const tag = inp[1];
  const attrs = inp[2];
  // check for button without onClick or type=submit in a form
  if (tag === 'button') {
    const hasOnClick = attrs.includes('onClick');
    const isSubmit = attrs.includes('type="submit"') || (!attrs.includes('type=') && attrs.includes('submit'));
    const isClose = attrs.includes('aria-label="Close"') || attrs.includes('close');
    // If a button has no onClick and no submit
    if (!hasOnClick && !isSubmit) {
      console.warn(`[WARN] Button #${idx} may lack action: <button ${attrs.slice(0, 60)}...>`);
      issues++;
    }
  }
});

// 5. Audit inputs, textareas, selects in admin.jsx
console.log('\n--- Auditing admin.jsx Form Elements ---');
const admInputs = [...adminJsx.matchAll(/<(input|select|textarea|button)([^>]*)>/g)];
console.log(`Total interactive elements in admin.jsx: ${admInputs.length}`);

admInputs.forEach((inp, idx) => {
  const tag = inp[1];
  const attrs = inp[2];
  if (tag === 'button') {
    const hasOnClick = attrs.includes('onClick');
    const isSubmit = attrs.includes('type="submit"');
    if (!hasOnClick && !isSubmit) {
      console.warn(`[WARN] Admin Button #${idx} may lack action: <button ${attrs.slice(0, 60)}...>`);
      issues++;
    }
  }
});

console.log(`\nAudit finished with ${issues} potential button/form warnings.`);

