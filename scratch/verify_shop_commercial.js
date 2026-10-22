const fs = require('fs');

const src = fs.readFileSync('react/src/public.jsx', 'utf8');

const hasShopCommercial = src.includes('id="shop-commercial"');
const sellIdx = src.indexOf('const renderSellingPage');
const busIdx = src.indexOf('const renderBusinessPage');
const commIdx = src.indexOf('id="shop-commercial"');

console.log('shop-commercial exists:', hasShopCommercial);
console.log('renderSellingPage index:', sellIdx);
console.log('renderBusinessPage index:', busIdx);
console.log('shop-commercial index:', commIdx);
console.log('Located inside renderSellingPage:', commIdx > sellIdx);

const countCommercialShowcase = (src.match(/<CommercialShowcase/g) || []).length;
console.log('CommercialShowcase instances in codebase:', countCommercialShowcase);
