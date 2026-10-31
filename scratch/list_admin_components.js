const fs = require('fs');
const adm = fs.readFileSync('react/src/admin.jsx', 'utf8');

// Find all function declarations or const declarations for modals or forms
const matches = adm.match(/(function\s+[A-Z][a-zA-Z0-9]*(?:Modal|Form|View|Details)[^{]*\{)/g);
console.log('Modals, Forms, Views in admin.jsx:');
console.log(matches);

