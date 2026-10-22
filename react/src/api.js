export function escapeXml(unsafe) {
  return String(unsafe ?? '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

const CATEGORY_IMAGES = {
  'bath towels': '/uploads/products/bath-towel-maza.jpg',
  'hand towels': '/uploads/products/hand-towel-aarav.jpg',
  'face towels': '/uploads/products/face-towel-vanity.jpg',
  'kids towels': '/uploads/products/kids-towel-anaya.jpg',
  'custom t-shirts': '/uploads/tshirts/custom-embroidered-polos.jpg',
  'couples': '/uploads/products/couple-towels-set.jpg',
  'flowers': '/uploads/designs/peacock-crest.jpg',
  'names & initials': '/uploads/designs/elegant-name.jpg',
  'corporate & hospitality': '/uploads/customers/serenia-resort.jpg'
};

export const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
export const imageFor = (item, label = 'MazaTowel') => {
  if (item?.image) return item.image;
  const key = String(item?.name || item?.category || label).toLowerCase().trim();
  if (CATEGORY_IMAGES[key]) return CATEGORY_IMAGES[key];
  const text = escapeXml(String(item?.name || label).slice(0, 26));
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><rect width="900" height="700" fill="#eaf7f6"/><rect x="255" y="95" width="390" height="500" rx="36" fill="#fff" stroke="#2f7f82" stroke-width="8"/><text x="450" y="330" text-anchor="middle" font-size="46" font-family="Georgia" fill="#2f7f82">MazaTowel</text><text x="450" y="390" text-anchor="middle" font-size="27" font-family="Arial" fill="#2f7f82">${text}</text></svg>`)}`;
};
export const whatsapp = (number, message) => `https://wa.me/${String(number || '919922597666').replace(/\D/g, '') || '919922597666'}?text=${encodeURIComponent(message)}`;
