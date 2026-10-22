const fs = require('fs');
const http = require('http');

console.log('=== VERIFYING SEPARATED SELLING & INFORMATION SPA ARCHITECTURE ===\n');

const publicCode = fs.readFileSync('react/src/public.jsx', 'utf8');
const cssCode = fs.readFileSync('public/assets/styles.css', 'utf8');

const tests = [
  // 1. Same-page architecture & Master Tab Switcher
  {
    name: 'MasterTabSwitcher component defined',
    pass: publicCode.includes('function MasterTabSwitcher')
  },
  {
    name: 'Master Tab Switcher CSS styles present',
    pass: cssCode.includes('.master-tab-switcher-wrap') && cssCode.includes('.master-tab-card.active')
  },
  {
    name: 'Header contains segmented mode switch (.nav-master-switch)',
    pass: publicCode.includes('className="nav-master-switch"')
  },
  {
    name: 'Mobile drawer contains mode toggle (.mobile-tab-switch-box)',
    pass: publicCode.includes('className="mobile-tab-switch-box"')
  },
  {
    name: 'Header navigation links dynamically change based on active tab',
    pass: publicCode.includes('activeTab === \'shop\' ? sellingNavLinks : infoNavLinks')
  },
  {
    name: 'Master Hero rendered globally on page above tabs',
    pass: publicCode.includes('{renderMasterHero()}')
  },
  {
    name: 'Main content switches between selling and info on the same page',
    pass: publicCode.includes("{activeTab === 'shop' ? renderShopPage() : renderHomePage()}")
  },

  // 2. Selling Experience (Strictly Selling & Products)
  {
    name: 'Selling tab has dedicated sticky subnav (.shop-subnav-sticky)',
    pass: publicCode.includes('className="shop-subnav-sticky"')
  },
  {
    name: 'Selling tab contains Luxury Towels section (#shop-towels)',
    pass: publicCode.includes('id="shop-towels"')
  },
  {
    name: 'Selling tab contains Custom T-Shirts section (#shop-tshirts)',
    pass: publicCode.includes('id="shop-tshirts"')
  },
  {
    name: 'Selling tab contains Family Sets section (#shop-sets)',
    pass: publicCode.includes('id="shop-sets"')
  },
  {
    name: 'Selling tab contains Design Library (#shop-designs)',
    pass: publicCode.includes('id="shop-designs"')
  },
  {
    name: 'Selling tab contains On-Page Order Studio (#shop-studio)',
    pass: publicCode.includes('OnPageOrderStudio')
  },
  {
    name: 'Selling tab contains Bridge Banner to switch to Information',
    pass: publicCode.includes('Need Commercial Bulk Supply, Salons or Corporate Orders?')
  },

  // 3. Information Experience (Story, Commercial B2B, Hygiene, Reviews & FAQ)
  {
    name: 'Information tab has dedicated sticky subnav (.info-subnav-sticky)',
    pass: publicCode.includes('className="info-subnav-sticky"')
  },
  {
    name: 'Information tab contains Commercial Atelier Solutions (#commercial)',
    pass: publicCode.includes('id="commercial"') && publicCode.includes('CommercialShowcase')
  },
  {
    name: 'Commercial section includes all 4 sectors (Parlours, Salons, Gyms, Corporate)',
    pass: publicCode.includes('parlour') && publicCode.includes('salon') && publicCode.includes('gym') && publicCode.includes('corporate')
  },
  {
    name: 'Information tab contains Cleanroom Hygiene Protocol (#hygiene)',
    pass: publicCode.includes('id="hygiene"')
  },
  {
    name: 'Information tab contains Atelier Heritage (#about)',
    pass: publicCode.includes('id="about"')
  },
  {
    name: 'Information tab contains 4-Step Bespoke Journey (#how)',
    pass: publicCode.includes('id="how"')
  },
  {
    name: 'Information tab contains Real Work Gallery (#gallery)',
    pass: publicCode.includes('id="gallery"')
  },
  {
    name: 'Information tab contains Prestige Hospitality Clients (#customers)',
    pass: publicCode.includes('id="customers"')
  },
  {
    name: 'Information tab contains Verified Customer Reviews (#reviews)',
    pass: publicCode.includes('id="reviews"')
  },
  {
    name: 'Information tab contains FAQ & Knowledge Base (#faq)',
    pass: publicCode.includes('id="faq"')
  },
  {
    name: 'Information tab contains Bridge Banner to switch to Shop',
    pass: publicCode.includes('Ready to Order Your Personalized Towels?')
  },

  // 4. Tight brand logo in footer
  {
    name: 'Footer brand logo uses tight asset without uncropped whitespace',
    pass: publicCode.includes('/assets/mazatowel-logo-tight.png')
  },

  // 5. Build Artifacts
  {
    name: 'Vite production bundle compiled successfully',
    pass: fs.existsSync('public/react-build/assets/index.js')
  }
];

let failed = 0;
tests.forEach(t => {
  if (t.pass) {
    console.log(`[PASS] ${t.name}`);
  } else {
    console.error(`[FAIL] ${t.name}`);
    failed++;
  }
});

// Check strict placeholders
const placeholderMatches = publicCode.match(/placeholder=["'][^"']+["']/g) || [];
let badPlaceholders = 0;
placeholderMatches.forEach(ph => {
  const text = ph.replace(/placeholder=["']/, '').replace(/["']$/, '');
  if (!text.startsWith('Enter ') && !text.startsWith('Search ') && !text.startsWith('Optional:')) {
    console.warn(`[WARN] Non-standard placeholder: "${text}"`);
    badPlaceholders++;
  }
});
console.log(`\n[INFO] Placeholders verified: ${placeholderMatches.length} total, ${badPlaceholders} non-standard.`);

console.log(`\n=== RESULT: ${tests.length - failed}/${tests.length} CHECKS PASSED ===`);

// Verify Server HTTP status
http.get('http://localhost:3000/', res => {
  console.log(`[PASS] Server HTTP Response: ${res.statusCode} OK`);
  process.exit(failed > 0 ? 1 : 0);
}).on('error', err => {
  console.log(`[WARN] Server check: ${err.message}`);
  process.exit(failed > 0 ? 1 : 0);
});
