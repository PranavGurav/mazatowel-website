const fs = require('fs');
const path = require('path');
const http = require('http');

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

async function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('   VERIFYING T-SHIRT SEPARATION & ADMIN MANAGEMENT   ');
  console.log('======================================================\n');

  const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');
  const adminJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'admin.jsx'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');
  const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  // --- 1. Towel Section Separation ---
  console.log('--- 1. Towel Section Separation ---');
  assert(!publicJsx.includes("categories = ['All', 'Custom T-Shirts'"), 'public.jsx: Towel section categories do not include "Custom T-Shirts"');
  assert(publicJsx.includes("towelProducts = allProducts.filter(p => p.category !== 'Custom T-Shirts')"), 'public.jsx: towelProducts strictly excludes T-shirts');
  assert(publicJsx.includes('product-cta-btn') && (publicJsx.includes('Customize This Towel') || publicJsx.includes('>Customize</button>') || publicJsx.includes('Customize\n                    </button>')), 'public.jsx: Towel card CTA button exists and is clean');
  assert(publicJsx.includes('id="tshirts"'), 'public.jsx: Dedicated separate #tshirts section exists');

  // --- 2. Customization Modal Adaptations for T-Shirts ---
  console.log('\n--- 2. Customization Modal Adaptations for T-Shirts ---');
  assert(publicJsx.includes('PLACEMENT_OPTIONS = ['), 'public.jsx: Defines apparel placement options');
  assert(publicJsx.includes('Left Chest Crest'), 'public.jsx: Includes Left Chest Crest placement');
  assert(publicJsx.includes('Center Chest'), 'public.jsx: Includes Center Chest placement');
  assert(publicJsx.includes('Left Sleeve'), 'public.jsx: Includes Left Sleeve placement');
  assert(publicJsx.includes('Upper Back / Collar'), 'public.jsx: Includes Upper Back / Collar placement');
  assert(publicJsx.includes('TSHIRT_SIZES = ['), 'public.jsx: Defines T-shirt apparel chest sizes');
  assert(publicJsx.includes('placement-selector-section'), 'public.jsx: Renders placement selector section for T-shirts');
  assert(publicJsx.includes('shirt-row-size-box'), 'public.jsx: Renders apparel size selector per row in multi-shirt mode');
  assert(publicJsx.includes('companyName'), 'public.jsx: Supports optional company / group name for T-shirt orders');

  // --- 3. Placement & Multi-shirt Sizing CSS ---
  console.log('\n--- 3. Placement & Multi-shirt Sizing CSS ---');
  assert(stylesCss.includes('.placement-selector-section'), 'styles.css: Contains .placement-selector-section');
  assert(stylesCss.includes('.placement-cards-grid'), 'styles.css: Contains .placement-cards-grid');
  assert(stylesCss.includes('.placement-card-btn'), 'styles.css: Contains .placement-card-btn');
  assert(stylesCss.includes('.shirt-row-size-select'), 'styles.css: Contains .shirt-row-size-select');

  // --- 4. Server API Validation & Storage for T-Shirts ---
  console.log('\n--- 4. Server API Validation & Storage for T-Shirts ---');
  assert(serverJs.includes("category: isTShirt ? 'Custom T-Shirts' : 'Towels'"), 'server.js: Categorizes T-shirts vs Towels properly');
  assert(serverJs.includes("placement: String(b.placement || (isTShirt ? 'Left Chest Crest' : '')).trim().slice(0, 60)"), 'server.js: Saves placement for T-shirts');

  let testEnquiryId = null;
  try {
    const postRes = await request('/api/enquiries', {
      method: 'POST',
      body: {
        customerName: 'Kunal Verma',
        phone: '9822012345',
        productId: 'P011',
        product: 'Classic Embroidered Polo T-Shirt',
        category: 'Custom T-Shirts',
        size: '42 inch',
        quantity: 2,
        towelColor: 'Classic Navy',
        thread: 'Metallic Gold',
        placement: 'Left Chest Crest',
        nameMode: 'different',
        embroideryName: 'Kunal, Rahul',
        embroideryNames: ['Kunal', 'Rahul'],
        sizesPerItem: ['42 inch', '44 inch'],
        notes: '[Company/Org: IronForge Tech] Team uniform order'
      }
    });

    assert(postRes.status === 200 && postRes.data.ok === true, 'Server: Creates T-shirt enquiry with HTTP 200');
    testEnquiryId = postRes.data.enquiry?.id || postRes.data.enquiryId;
    assert(Boolean(testEnquiryId), `Server: Generated enquiryId (${testEnquiryId})`);

    // Verify stored data in file
    const dbPath = path.join(__dirname, '..', 'data', 'enquiries.json');
    const enquiries = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const saved = enquiries.find(e => e.id === testEnquiryId);

    assert(Boolean(saved), 'Database: Enquiry found in data/enquiries.json');
    assert(saved.category === 'Custom T-Shirts', 'Database: Stored category is "Custom T-Shirts"');
    assert(saved.placement === 'Left Chest Crest', 'Database: Stored placement is "Left Chest Crest"');
    assert(Array.isArray(saved.sizesPerItem) && saved.sizesPerItem.length === 2, 'Database: Stored sizesPerItem correctly');
    assert(saved.sizesPerItem[0] === '42 inch' && saved.sizesPerItem[1] === '44 inch', 'Database: Individual shirt sizes match');
  } catch (err) {
    assert(false, `Server testing failed: ${err.message}`);
  }

  // --- 5. Admin Panel Management & Filtering ---
  console.log('\n--- 5. Admin Panel Management & Filtering ---');
  assert(adminJsx.includes('export const isTShirtItem ='), 'admin.jsx: Defines isTShirtItem helper');
  assert(adminJsx.includes('export const getWhatsAppConfirmLink ='), 'admin.jsx: Defines unified getWhatsAppConfirmLink helper');
  assert(adminJsx.includes("selectedEnquiryCategory === tab.id"), 'admin.jsx: Enquiry filter tabs implemented');
  assert(adminJsx.includes("selectedProductCategory === tab.id"), 'admin.jsx: Product catalog filter tabs implemented');
  assert(adminJsx.includes("{ id: 'T-Shirts', label: 'T-Shirts & Apparel'"), 'admin.jsx: T-Shirts filter tab available in Enquiries');
  assert(adminJsx.includes("isTShirtItem(item) ? '👕 T-Shirt' : '🏷 Towel'"), 'admin.jsx: Displays 👕 T-Shirt / 🏷 Towel badge in table');
  assert(adminJsx.includes("📍 {item.placement}"), 'admin.jsx: Details view displays embroidery placement tag');
  assert(adminJsx.includes("Order Category"), 'admin.jsx: ItemEditor supports switching Order Category');
  assert(adminJsx.includes("Embroidery Placement"), 'admin.jsx: ItemEditor supports editing Embroidery Placement');

  // --- 6. Clean Up Test Data ---
  if (testEnquiryId) {
    const dbPath = path.join(__dirname, '..', 'data', 'enquiries.json');
    const enquiries = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const filtered = enquiries.filter(e => e.id !== testEnquiryId);
    fs.writeFileSync(dbPath, JSON.stringify(filtered, null, 2), 'utf8');
    assert(true, `Cleaned up test enquiry (${testEnquiryId}) from database`);
  }

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
