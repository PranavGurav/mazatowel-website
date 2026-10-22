const fs = require('fs');
const path = require('path');

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

console.log('\n--- VERIFYING PLACEHOLDERS HAVE NO EXISTING / EXAMPLE VALUES ---');

const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');

// Public form placeholders
assert(publicJsx.includes('placeholder="Enter name"'), 'public.jsx: Towel row uses placeholder="Enter name"');
assert(publicJsx.includes('placeholder="Enter name to embroider"'), 'public.jsx: Single towel embroidery uses placeholder="Enter name to embroider"');
assert(publicJsx.includes('placeholder="Enter design code or motif"'), 'public.jsx: Design code uses placeholder="Enter design code or motif"');
assert(publicJsx.includes('placeholder="Enter full name"'), 'public.jsx: Customer name uses placeholder="Enter full name"');
assert(publicJsx.includes('placeholder="Enter mobile number"'), 'public.jsx: Mobile phone uses placeholder="Enter mobile number"');
assert(publicJsx.includes('placeholder="Enter special instructions or occasion notes"'), 'public.jsx: Notes use placeholder="Enter special instructions or occasion notes"');

// Ensure no existing/example values remain in public modal placeholders
assert(!publicJsx.includes('placeholder="Your full name"'), 'public.jsx: Removed "Your full name" placeholder');
assert(!publicJsx.includes('placeholder="98765'), 'public.jsx: Removed sample phone number digits from placeholder');
assert(!publicJsx.includes('placeholder="10-digit mobile number"'), 'public.jsx: Removed legacy phone placeholder');
assert(!publicJsx.includes('placeholder={`e.g.'), 'public.jsx: Removed dynamic e.g. names array from placeholder');

// Admin form placeholders
const adminJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'admin.jsx'), 'utf8');
assert(adminJsx.includes('placeholder="Enter product title"'), 'admin.jsx: Product uses placeholder="Enter product title"');
assert(adminJsx.includes('placeholder="Enter size in inches"'), 'admin.jsx: Size uses placeholder="Enter size in inches"');
assert(adminJsx.includes('placeholder="Enter color name"'), 'admin.jsx: Color uses placeholder="Enter color name"');
assert(adminJsx.includes('placeholder="Enter thread color name"'), 'admin.jsx: Thread uses placeholder="Enter thread color name"');
assert(adminJsx.includes('placeholder="Enter design code"'), 'admin.jsx: Design uses placeholder="Enter design code"');
assert(adminJsx.includes('placeholder="Enter design name"'), 'admin.jsx: Design name uses placeholder="Enter design name"');
assert(adminJsx.includes('placeholder="Enter customer name"'), 'admin.jsx: Customer uses placeholder="Enter customer name"');
assert(adminJsx.includes('placeholder="Enter mobile number"'), 'admin.jsx: Enquiry mobile uses placeholder="Enter mobile number"');
assert(adminJsx.includes('placeholder="Enter name to embroider"'), 'admin.jsx: Enquiry embroidery uses placeholder="Enter name to embroider"');
assert(adminJsx.includes('placeholder="Enter question"'), 'admin.jsx: FAQ uses placeholder="Enter question"');
assert(adminJsx.includes('placeholder="Enter answer"'), 'admin.jsx: FAQ answer uses placeholder="Enter answer"');
assert(adminJsx.includes('placeholder="Enter offer title"'), 'admin.jsx: Offer uses placeholder="Enter offer title"');
assert(adminJsx.includes('placeholder="Enter workshop address"'), 'admin.jsx: Settings address uses placeholder="Enter workshop address"');
assert(adminJsx.includes('placeholder="Enter hex code"'), 'admin.jsx: Hex uses placeholder="Enter hex code"');
assert(!adminJsx.includes('placeholder="Enter hex code (e.g.'), 'admin.jsx: Hex placeholder has no sample value');
assert(!/placeholder="[^"]*e\.g\./i.test(publicJsx), 'public.jsx: No placeholder contains "e.g."');
assert(!/placeholder="[^"]*e\.g\./i.test(adminJsx), 'admin.jsx: No placeholder contains "e.g."');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All placeholder checks PASSED!\n');
}
