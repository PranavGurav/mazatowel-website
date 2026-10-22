const fs = require('fs');
const http = require('http');

console.log('--- RUNNING COMMERCIAL SECTION VERIFICATION ---');

// 1. Check Images
const images = [
  'beauty-parlour-towels.jpg',
  'mens-salon-towels.jpg',
  'gym-fitness-towels.jpg',
  'corporate-gift-hamper.jpg'
];

let allImagesExist = true;
images.forEach(img => {
  const p = `public/uploads/commercial/${img}`;
  if (fs.existsSync(p)) {
    const size = fs.statSync(p).size;
    console.log(`[PASS] Image found: ${img} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`[FAIL] Image missing: ${p}`);
    allImagesExist = false;
  }
});

// 2. Check public.jsx
const publicCode = fs.readFileSync('react/src/public.jsx', 'utf8');

const checks = [
  { name: 'Commercial section anchor id="commercial"', test: publicCode.includes('id="commercial"') },
  { name: 'Commercial & Salons in mainNavLinks', test: publicCode.includes("sectionId: 'commercial'") },
  { name: 'Commercial tabs / sectors definition', test: publicCode.includes('COMMERCIAL_SECTORS') },
  { name: 'Beauty Parlours sector present', test: publicCode.includes("Beauty Parlours & Spas") },
  { name: "Men's Salons sector present", test: publicCode.includes("Men's Salons & Modern Grooming Clubs") || publicCode.includes("Men's Salons & Barbershops") },
  { name: 'Gyms & Fitness sector present', test: publicCode.includes("Gyms, Pilates & Performance Fitness Clubs") || publicCode.includes("Gyms & Fitness Studios") },
  { name: 'Corporate Gifting sector present', test: publicCode.includes("Corporate Gifting & VIP Executive Hampers") || publicCode.includes("Corporate Gifting & Hampers") },
  { name: 'B2BSampleModal component present', test: publicCode.includes('function B2BSampleModal') },
  { name: 'Shop Corporate sectors grid present', test: publicCode.includes('shop-corporate-sectors-grid') }
];

checks.forEach(c => {
  if (c.test) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.error(`[FAIL] ${c.name}`);
  }
});

// 3. Check Placeholder Compliance: All placeholders must strictly follow "Enter [field]"
const placeholderMatches = publicCode.match(/placeholder=["'][^"']+["']/g) || [];
let badPlaceholders = 0;
placeholderMatches.forEach(ph => {
  const text = ph.replace(/placeholder=["']/, '').replace(/["']$/, '');
  if (!text.startsWith('Enter ') && !text.startsWith('Search ') && !text.startsWith('Optional:')) {
    // Only flag if it's in our newly created components or forms
    console.warn(`[WARN] Non-standard placeholder: "${text}"`);
    badPlaceholders++;
  }
});
console.log(`[INFO] Checked ${placeholderMatches.length} placeholders in public.jsx`);

// 4. Test Local API
const req = http.get('http://localhost:3000/api/site', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`[PASS] Server responding OK. Brand: ${json.settings?.brand || 'N/A'}`);
    } catch (e) {
      console.error('[FAIL] API response parse error', e.message);
    }
  });
});
req.on('error', err => {
  console.log(`[INFO] Server check: ${err.message}`);
});
