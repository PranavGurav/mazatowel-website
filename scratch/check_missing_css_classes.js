const fs = require('fs');

const adminJsx = fs.readFileSync('react/src/admin.jsx', 'utf8');
const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');
const adminCss = fs.readFileSync('public/assets/admin.css', 'utf8');
const publicCss = fs.readFileSync('public/assets/styles.css', 'utf8');

function extractDefinedClasses(css) {
  const classes = new Set();
  const re = /\.([a-zA-Z0-9_-]+)/g;
  let m;
  while ((m = re.exec(css))) {
    classes.add(m[1]);
  }
  return classes;
}

const admCssClasses = extractDefinedClasses(adminCss);
const pubCssClasses = extractDefinedClasses(publicCss);

// Common SVG or HTML utility classes or icons that might not need CSS
const ignoredClasses = new Set([
  'active', 'open', 'show', 'hide', 'hidden', 'visible', 'disabled', 'selected',
  'live', 'off', 'danger', 'primary', 'secondary', 'warning', 'info',
  'dark', 'light', 'success', 'error', 'loading', 'dragover', 'dropzone'
]);

function findMissingClasses(jsx, cssClasses, label) {
  console.log(`Checking class names used in ${label}...`);
  const classMatches = [...jsx.matchAll(/className=(?:["']([^"']+)["']|{`([^`]+)`})/g)];
  const used = new Set();
  
  classMatches.forEach(m => {
    const raw = m[1] || m[2] || '';
    // remove template literals
    const cleaned = raw.replace(/\$\{[^}]+\}/g, ' ');
    cleaned.split(/\s+/).forEach(c => {
      const trimmed = c.trim();
      if (trimmed && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        used.add(trimmed);
      }
    });
  });

  const missing = [];
  used.forEach(c => {
    if (!cssClasses.has(c) && !ignoredClasses.has(c)) {
      missing.push(c);
    }
  });

  console.log(`  Total classes used: ${used.size}`);
  console.log(`  Missing in CSS: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`  Missing classes sample:`, missing.slice(0, 30));
  }
  console.log('');
  return missing;
}

findMissingClasses(adminJsx, admCssClasses, 'admin.jsx (vs admin.css)');
findMissingClasses(publicJsx, pubCssClasses, 'public.jsx (vs styles.css)');

