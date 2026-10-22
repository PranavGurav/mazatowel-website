const fs = require('fs');

console.log('=== ADMIN.CSS FORM RULES ===');
const adminCss = fs.readFileSync('public/assets/admin.css', 'utf8');
const gridRules = adminCss.match(/[^{}]+{[^{}]*grid[^{}]*}/g) || [];
gridRules.forEach(r => {
  if (r.includes('form') || r.includes('field') || r.includes('col') || r.includes('input')) {
    console.log(r.trim().replace(/\s+/g, ' '));
  }
});

console.log('\n=== STYLES.CSS FORM RULES ===');
const stylesCss = fs.readFileSync('public/assets/styles.css', 'utf8');
const stylesGridRules = stylesCss.match(/[^{}]+{[^{}]*grid[^{}]*}/g) || [];
stylesGridRules.forEach(r => {
  if (r.includes('form') || r.includes('field') || r.includes('col') || r.includes('input')) {
    console.log(r.trim().replace(/\s+/g, ' '));
  }
});
