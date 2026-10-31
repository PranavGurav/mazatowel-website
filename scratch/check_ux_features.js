const fs = require('fs');
const pub = fs.readFileSync('react/src/public.jsx', 'utf8');
const adm = fs.readFileSync('react/src/admin.jsx', 'utf8');

console.log('--- Checking Public Features ---');
console.log('localStorage used in public:', pub.includes('localStorage'));
console.log('Live preview in modal commented out:', pub.includes('LIVE EMBROIDERY CONTRAST PREVIEW PAUSED'));
console.log('Trust badges in modal:', pub.includes('trust-badge') || pub.includes('trust-strip'));
console.log('Sticky footer in modal:', pub.includes('modal-sticky-footer') || pub.includes('customizer-footer-sticky'));

console.log('\n--- Checking Admin Features ---');
console.log('CSV Export:', adm.includes('exportToCsv') || adm.includes('Export CSV') || adm.includes('text/csv'));
console.log('Bulk actions in lists:', adm.includes('selectedIds') || adm.includes('bulkAction'));
console.log('Internal notes on enquiries:', adm.includes('internalNotes') || adm.includes('adminNotes'));

