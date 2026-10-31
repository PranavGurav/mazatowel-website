const fs = require('fs');
const enquiries = JSON.parse(fs.readFileSync('data/enquiries.json', 'utf8'));

console.log('Total enquiries:', enquiries.length);
enquiries.slice(0, 8).forEach((e, idx) => {
  console.log(`\n--- Order #${idx + 1} (${e.id}) ---`);
  console.log('Customer:', e.customerName, '| Phone:', e.phone, '| City:', e.city);
  console.log('Product:', e.product, '| Size:', e.size, '| Qty:', e.quantity, '| Color:', e.towelColor);
  console.log('Embroidery:', e.embroideryName, '| Multiple:', e.embroideryNames);
  console.log('Status:', e.status, '| Created:', e.createdAt);
  if (e.notes) console.log('Notes:', e.notes);
  if (e.adminNotes) console.log('AdminNotes:', e.adminNotes);
  if (e.logoAttachment) console.log('Logo:', e.logoAttachment);
});

