const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');

function makeRequest(method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: reqPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, body: data, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// 1x1 transparent PNG data URL for testing
const SAMPLE_PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAregion=test';
// Simple dummy PDF data URL for testing
const SAMPLE_PDF_DATA_URL = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZz4+ZW5kb2JqCnRyYWlsZXI8PC9Sb290IDEgMCBSPj4KJSVFT0YK';

async function runTests() {
  console.log('=== STARTING OPTIONAL LOGO ATTACHMENT VERIFICATION ===\n');

  // Test 1: Upload a logo via /api/upload-logo
  console.log('1. Testing POST /api/upload-logo with PNG data URL...');
  const uploadRes = await makeRequest('POST', '/api/upload-logo', {}, {
    dataUrl: SAMPLE_PNG_DATA_URL,
    name: 'test_brand_logo.png'
  });
  assert.strictEqual(uploadRes.status, 200, `Expected 200, got ${uploadRes.status}: ${uploadRes.body}`);
  assert.strictEqual(uploadRes.json.ok, true, 'Expected ok: true');
  assert(uploadRes.json.url.startsWith('/uploads/logos/'), `Expected URL in /uploads/logos/, got ${uploadRes.json.url}`);
  const uploadedLogoUrl = uploadRes.json.url;
  console.log('   ✓ Logo uploaded successfully:', uploadedLogoUrl);

  const diskPath = path.join(__dirname, '..', 'public', uploadedLogoUrl.replace(/^\//, ''));
  assert(fs.existsSync(diskPath), `Uploaded logo should exist on disk at ${diskPath}`);
  console.log('   ✓ Confirmed file exists on disk locally');

  // Test 2: Upload a PDF document logo/artwork
  console.log('\n2. Testing POST /api/upload-logo with PDF vector artwork...');
  const uploadPdfRes = await makeRequest('POST', '/api/upload-logo', {}, {
    dataUrl: SAMPLE_PDF_DATA_URL,
    name: 'vector_crest.pdf'
  });
  assert.strictEqual(uploadPdfRes.status, 200, `Expected 200, got ${uploadPdfRes.status}`);
  assert(uploadPdfRes.json.url.endsWith('.pdf'), `Expected .pdf extension, got ${uploadPdfRes.json.url}`);
  const uploadedPdfUrl = uploadPdfRes.json.url;
  console.log('   ✓ Vector PDF uploaded successfully:', uploadedPdfUrl);

  // Test 3: Towel Order WITH Logo Attachment
  console.log('\n3. Testing Towel Order WITH Optional Logo Attachment...');
  const towelWithLogoRes = await makeRequest('POST', '/api/enquiries', {}, {
    customerName: 'Aarav Patel',
    phone: '9876543210',
    productId: 'P001',
    product: 'Signature Egyptian Cotton Bath Towel',
    category: 'Towels',
    size: '30 × 60 inch',
    quantity: 2,
    embroideryName: 'Aarav & Meera',
    logoAttachment: uploadedLogoUrl,
    notes: 'Please position the monogram centered above the border.'
  });
  assert.strictEqual(towelWithLogoRes.status, 200, `Expected 200, got ${towelWithLogoRes.status}: ${towelWithLogoRes.body}`);
  const towelWithLogoId = towelWithLogoRes.json.enquiryId;
  console.log('   ✓ Towel order with logo saved with ID:', towelWithLogoId);

  // Test 4: Towel Order WITHOUT Logo Attachment (100% Optional Verification)
  console.log('\n4. Testing Towel Order WITHOUT Logo (Optional verification)...');
  const towelNoLogoRes = await makeRequest('POST', '/api/enquiries', {}, {
    customerName: 'Pooja Sharma',
    phone: '9876543211',
    productId: 'P002',
    product: 'Royal Egyptian Cotton Hand Towel',
    category: 'Towels',
    size: '20 × 40 inch',
    quantity: 1,
    embroideryName: 'Pooja'
  });
  assert.strictEqual(towelNoLogoRes.status, 200, `Expected 200, got ${towelNoLogoRes.status}`);
  const towelNoLogoId = towelNoLogoRes.json.enquiryId;
  console.log('   ✓ Towel order without logo saved successfully, ID:', towelNoLogoId);

  // Test 5: T-Shirt Order WITH Logo Attachment
  console.log('\n5. Testing T-Shirt Order WITH Optional Logo Attachment...');
  const tshirtWithLogoRes = await makeRequest('POST', '/api/orders', {}, {
    customerName: 'Vikram Sethi',
    phone: '9876543212',
    productId: 'P011',
    product: 'Custom Embroidered Classic Pique Polo',
    category: 'Custom T-Shirts',
    size: '42 inch',
    quantity: 1,
    embroideryName: 'TechVibe Systems',
    placement: 'Left Chest Crest',
    logoAttachment: uploadedLogoUrl,
    notes: 'Gold thread accent on black polo'
  });
  assert.strictEqual(tshirtWithLogoRes.status, 200, `Expected 200, got ${tshirtWithLogoRes.status}: ${tshirtWithLogoRes.body}`);
  const tshirtWithLogoId = tshirtWithLogoRes.json.enquiryId;
  console.log('   ✓ T-Shirt order with logo saved with ID:', tshirtWithLogoId);

  // Test 6: T-Shirt Order WITHOUT Logo Attachment (Optional verification)
  console.log('\n6. Testing T-Shirt Order WITHOUT Logo (Optional verification)...');
  const tshirtNoLogoRes = await makeRequest('POST', '/api/orders', {}, {
    customerName: 'Ananya Roy',
    phone: '9876543213',
    productId: 'P012',
    product: 'Bespoke Heavyweight Oversized Tee',
    category: 'Custom T-Shirts',
    size: '40 inch',
    quantity: 1,
    embroideryName: 'Ananya',
    placement: 'Center Chest'
  });
  assert.strictEqual(tshirtNoLogoRes.status, 200, `Expected 200, got ${tshirtNoLogoRes.status}`);
  const tshirtNoLogoId = tshirtNoLogoRes.json.enquiryId;
  console.log('   ✓ T-Shirt order without logo saved successfully, ID:', tshirtNoLogoId);

  // Test 7: Verify data persistence in data/enquiries.json
  console.log('\n7. Verifying Database Integrity in data/enquiries.json...');
  const enquiriesDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf8'));

  const savedTowelWithLogo = enquiriesDb.find(e => e.id === towelWithLogoId);
  assert(savedTowelWithLogo, 'Towel with logo record found');
  assert.strictEqual(savedTowelWithLogo.logoAttachment, uploadedLogoUrl, 'Towel logoAttachment matches uploaded URL');
  console.log('   ✓ Towel order record has correct logoAttachment:', savedTowelWithLogo.logoAttachment);

  const savedTowelNoLogo = enquiriesDb.find(e => e.id === towelNoLogoId);
  assert(savedTowelNoLogo, 'Towel without logo record found');
  assert.strictEqual(savedTowelNoLogo.logoAttachment, '', 'Towel without logo has empty logoAttachment');
  console.log('   ✓ Towel order without logo has empty logoAttachment (correctly non-mandatory)');

  const savedTshirtWithLogo = enquiriesDb.find(e => e.id === tshirtWithLogoId);
  assert(savedTshirtWithLogo, 'T-Shirt with logo record found');
  assert.strictEqual(savedTshirtWithLogo.logoAttachment, uploadedLogoUrl, 'T-Shirt logoAttachment matches uploaded URL');
  console.log('   ✓ T-Shirt order record has correct logoAttachment:', savedTshirtWithLogo.logoAttachment);

  const savedTshirtNoLogo = enquiriesDb.find(e => e.id === tshirtNoLogoId);
  assert(savedTshirtNoLogo, 'T-Shirt without logo record found');
  assert.strictEqual(savedTshirtNoLogo.logoAttachment, '', 'T-Shirt without logo has empty logoAttachment');
  console.log('   ✓ T-Shirt order without logo has empty logoAttachment');

  // Test 8: Code Inspection for Frontend WhatsApp Integration and Optional UI
  console.log('\n8. Inspecting React JSX for WhatsApp message & optional UI formatting...');
  const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');
  const adminJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'admin.jsx'), 'utf8');

  // CustomizationModal
  assert(publicJsx.includes('label="Attach Logo"'), 'CustomizationModal has Attach Logo field');
  assert(!publicJsx.includes('Preview ↗'), 'Preview button has been removed');
  assert(publicJsx.includes('handleLogoChange'), 'CustomizationModal has handleLogoChange');
  assert(publicJsx.includes('handleWhatsAppDirect'), 'CustomizationModal has handleWhatsAppDirect');
  assert(publicJsx.includes('- Attached Logo / Reference:'), 'WhatsApp message generator includes logo link');
  console.log('   ✓ CustomizationModal has optional simplified Attach Logo and WhatsApp order button');

  // OnPageOrderStudio
  assert(publicJsx.includes('handleLogoUpload'), 'OnPageOrderStudio has handleLogoUpload');
  assert(publicJsx.includes('logoAttachment || \'\''), 'OnPageOrderStudio submits logoAttachment');
  console.log('   ✓ OnPageOrderStudio has optional logo attachment and includes logo in WhatsApp');

  // Admin Panel
  assert(adminJsx.includes('View Logo File'), 'Admin panel orders queue has View Logo link');
  assert(adminJsx.includes('Customer Logo / Reference Artwork'), 'Admin ItemEditor has logo viewer');
  assert(adminJsx.includes('Attached Logo / Artwork: Received ✓'), 'Admin WhatsApp reply acknowledges logo');
  console.log('   ✓ Admin panel displays customer logo link and handles logo in ItemEditor');

  // Cleanup test records
  console.log('\n9. Cleaning up test enquiries and uploaded files...');
  const cleanedEnquiries = enquiriesDb.filter(e =>
    ![towelWithLogoId, towelNoLogoId, tshirtWithLogoId, tshirtNoLogoId].includes(e.id)
  );
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), JSON.stringify(cleanedEnquiries, null, 2));
  console.log('   ✓ Removed 4 test records from data/enquiries.json');

  try { fs.unlinkSync(diskPath); } catch {}
  try {
    const pdfDiskPath = path.join(__dirname, '..', 'public', uploadedPdfUrl.replace(/^\//, ''));
    fs.unlinkSync(pdfDiskPath);
  } catch {}
  console.log('   ✓ Removed test upload files from disk');

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY (100% GREEN) ===');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
