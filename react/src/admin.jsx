import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { api, money } from './api';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, CloseIcon } from './icons';
import '../../public/assets/admin.css';

const DEFAULT_DESIGN_CATEGORIES = [
  'Names & Initials',
  'Kids',
  'Couples',
  'Flowers',
  'Sports',
  'Photo Portrait Embroidery',
  'Corporate & Hospitality'
];

const STANDARD_SIZES = [
  {
    group: 'Bath Towels (Everyday & Luxury)',
    sizes: [
      { value: '27 × 52 inch', label: '27 × 52 inch — Compact Bath Towel' },
      { value: '27 × 54 inch', label: '27 × 54 inch — Standard Bath Towel' },
      { value: '28 × 58 inch', label: '28 × 58 inch — Solapur Cotton Bath Towel' },
      { value: '30 × 56 inch', label: '30 × 56 inch — Large Bath Towel' },
      { value: '30 × 60 inch', label: '30 × 60 inch — Royal Luxury Bath Towel' }
    ]
  },
  {
    group: 'Bath Sheets & Beach Towels (Oversized)',
    sizes: [
      { value: '35 × 60 inch', label: '35 × 60 inch — Spa Bath Sheet' },
      { value: '35 × 70 inch', label: '35 × 70 inch — Jumbo Beach Towel' },
      { value: '36 × 72 inch', label: '36 × 72 inch — Grand Suite Bath Towel XXXL' },
      { value: '40 × 70 inch', label: '40 × 70 inch — Luxury Pool & Resort Towel' }
    ]
  },
  {
    group: 'Hand Towels (Bathroom & Basin)',
    sizes: [
      { value: '14 × 21 inch', label: '14 × 21 inch — Everyday Hand Towel' },
      { value: '16 × 24 inch', label: '16 × 24 inch — Medium Hand Towel' },
      { value: '16 × 28 inch', label: '16 × 28 inch — Standard Hand Towel' },
      { value: '16 × 30 inch', label: '16 × 30 inch — Large Hand Towel' },
      { value: '18 × 30 inch', label: '18 × 30 inch — Luxury Hand Towel' }
    ]
  },
  {
    group: 'Face Towels & Washcloths',
    sizes: [
      { value: '12 × 12 inch', label: '12 × 12 inch — Washcloth / Face Towel' },
      { value: '13 × 13 inch', label: '13 × 13 inch — Deluxe Washcloth' },
      { value: '16 × 24 inch', label: '16 × 24 inch — Petite Luxury Face Towel' },
      { value: '20 × 36 inch', label: '20 × 36 inch — Spa & Salon Face Towel' }
    ]
  },
  {
    group: 'Kids & Baby Towels',
    sizes: [
      { value: '24 × 48 inch', label: '24 × 48 inch — Kids Bath Towel' },
      { value: '30 × 30 inch', label: '30 × 30 inch — Baby / Hooded Towel' }
    ]
  },
  {
    group: 'Kitchen, Gym & Fitness Towels',
    sizes: [
      { value: '12 × 44 inch', label: '12 × 44 inch — Fitness / Gym Towel' },
      { value: '18 × 28 inch', label: '18 × 28 inch — Kitchen / Tea Towel' }
    ]
  },
  {
    group: 'Custom T-Shirts & Apparel (Chest Sizes)',
    sizes: [
      { value: '38 to 46 inch', label: '38 to 46 inch — All Chest Sizes (S–XXL)' },
      { value: '36 inch', label: '36 inch — Small (S)' },
      { value: '38 inch', label: '38 inch — Medium (M)' },
      { value: '40 inch', label: '40 inch — Large (L)' },
      { value: '42 inch', label: '42 inch — Extra Large (XL)' },
      { value: '44 inch', label: '44 inch — Double XL (2XL)' },
      { value: '46 inch', label: '46 inch — Triple XL (3XL)' }
    ]
  }
];

const COLLECTIONS = ['products', 'colors', /* 'threads', -- THREADS PAUSED */ 'designs', 'gallery', 'customers', 'reviews', 'enquiries', 'faqs', 'offers'];
const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  colors: 'Towel Colors & Stock',
  /* threads: 'Embroidery Threads', -- THREADS PAUSED */
  designs: 'Design Library',
  gallery: 'Gallery',
  customers: 'Our Customers',
  reviews: 'Reviews',
  enquiries: 'Customer Enquiries',
  faqs: 'FAQ',
  offers: 'Offers',
  content: 'Homepage Content',
  settings: 'Settings',
  stats: 'Business Counts'
};

const SECTION_SUBTITLES = {
  dashboard: 'Real-time store overview, workshop inventory & live customer orders',
  products: 'Egyptian cotton towel & apparel product catalog management',
  colors: 'Workshop fabric palette, dye shades & inventory stock status',
  designs: 'Bespoke embroidery motif library & theme collections',
  gallery: 'Showcase portfolio of personalized towels & finished client work',
  customers: 'Client logos, corporate accounts & hospitality partners',
  reviews: 'Verified customer feedback, ratings & testimonials',
  enquiries: 'Customer WhatsApp orders, quotation pipeline & production stages',
  faqs: 'Frequently asked questions & ordering guidance',
  offers: 'Promotional discount codes & customer banner announcements',
  content: 'Homepage hero banners, storytelling copy & value propositions',
  stats: 'Delivered towels counter & public milestones',
  settings: 'Store configuration, contact information & SEO metadata'
};

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: ['dashboard']
  },
  {
    title: 'Products & Designs',
    items: ['products', 'colors', /* 'threads', -- THREADS PAUSED */ 'designs', 'gallery']
  },
  {
    title: 'Orders & Clients',
    items: ['enquiries', 'customers', 'reviews', 'offers']
  },
  {
    title: 'Site & Preferences',
    items: ['content', 'faqs', 'stats', 'settings']
  }
];

const singular = type => ({
  products: 'Product',
  colors: 'Towel Color',
  /* threads: 'Thread Color', -- THREADS PAUSED */
  designs: 'Design',
  gallery: 'Photo',
  customers: 'Customer',
  reviews: 'Review',
  enquiries: 'Enquiry',
  faqs: 'FAQ',
  offers: 'Offer'
})[type] || 'Item';

const initialItem = type => {
  switch (type) {
    case 'products':
      return { name: '', category: 'Hand Towels', size: '14 × 21 inch', price: 90, desc: '', badge: 'Personalized', image: '', published: true, featured: false, bestSeller: false };
    case 'colors':
      return { name: '', hex: '#2F7F82', image: '', sizes: ['All Sizes'], inStock: true, published: true, desc: '' };
    /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
    case 'threads':
      return { name: '', hex: '#D4AF37', finish: 'Metallic Sheen', inStock: true, published: true, desc: '' };
    */
    case 'designs':
      return { designId: 'MT-' + String(Math.floor(100 + Math.random() * 900)), name: '', category: 'Names & Initials', desc: '', image: '', published: true, featured: false };
    case 'gallery':
      return { image: '', alt: 'MazaTowel custom embroidery', published: true };
    case 'customers':
      return { name: '', category: 'Heritage Luxury Hotel', tagline: '', image: '', website: '', published: true };
    case 'reviews':
      return { name: '', rating: 5, text: '', source: 'WhatsApp Verified', date: new Date().toISOString().slice(0, 10), published: true, featured: false };
    case 'enquiries':
      return { customerName: '', phone: '', category: 'Towels', product: 'Personalized Bath Towel', size: '30 × 60 inch', placement: '', quantity: 1, embroideryName: '', thread: 'Teal', design: '', notes: '', source: 'Manual', status: 'New' };
    case 'faqs':
      return { q: '', a: '', published: true };
    case 'offers':
      return { title: '', desc: '', code: '', discount: '', active: true };
    default:
      return { published: true };
  }
};

export const isTShirtItem = (item) => {
  if (!item) return false;
  if (item.category === 'Custom T-Shirts') return true;
  if (item.placement) return true;
  const prod = String(item.product || item.name || '').toLowerCase();
  return prod.includes('t-shirt') || prod.includes('tshirt') || prod.includes('polo') || prod.includes('tee');
};

export const formatRelativeTime = (val) => {
  if (!val) return '';
  const date = val instanceof Date ? val : new Date(val);
  const time = date.getTime();
  if (isNaN(time)) return String(val);
  const now = Date.now();
  const diffSec = Math.floor((now - time) / 1000);
  if (diffSec < 0 && diffSec > -10) return 'Just now';
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}w ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}y ago`;
};

// Two-tone Web Audio chime for real-time order alerts (Zero external audio assets required)
export const playNewOrderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.14);
    gain2.gain.setValueAtTime(0.15, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.65);
  } catch {}
};


export const getWhatsAppConfirmLink = (enq) => {
  if (!enq) return '#';
  let rawPhone = String(enq.phone || '').replace(/\D/g, '');
  if (rawPhone.length === 11 && rawPhone.startsWith('0')) {
    rawPhone = rawPhone.slice(1);
  }
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const isShirt = isTShirtItem(enq);

  let namesDetail = '';
  if (Array.isArray(enq.embroideryNames) && enq.embroideryNames.length > 1) {
    namesDetail = `• Names to Embroider (${enq.quantity || enq.embroideryNames.length} ${isShirt ? 'shirts' : 'towels'}):\n` +
      enq.embroideryNames.map((nm, idx) => {
        const itemSz = enq.sizesPerItem?.[idx] ? ` [Size: ${enq.sizesPerItem[idx]}]` : '';
        return `   ${idx + 1}. ${nm || 'Custom'}${itemSz}`;
      }).join('\n') + '\n';
  } else {
    namesDetail = `• Name to Embroider: "${enq.embroideryName || 'Custom'}"${enq.quantity > 1 ? ` (All ${enq.quantity} pcs)` : ''}\n`;
  }

  const statusClosing = enq.status === 'In Production'
    ? '✨ Status Update: Your order is now in production on our precision embroidery machines! We will share dispatch details shortly.'
    : enq.status === 'Shipped'
    ? '📦 Status Update: Your customized order has been shipped and is on its way to you! Let us know once received.'
    : enq.status === 'Closed'
    ? '✅ Status Update: Your order has been completed. Thank you for choosing MazaTowel!'
    : isShirt
    ? 'We are preparing your digital embroidery preview. Please confirm if these details are correct or let us know if you would like any changes!'
    : 'We are preparing your custom embroidery. Please confirm if everything looks good or if you would like to adjust font/color!';

  const greeting = isShirt
    ? `Hello ${enq.customerName || 'there'}! 👋 This is MazaTowel regarding your custom T-shirt enquiry for "${enq.product || 'Custom Embroidered T-Shirt'}".\n\n` +
      `📋 Order Details:\n` +
      namesDetail +
      `• Garment Colour: ${enq.towelColor || 'Standard'}\n` +
      /* THREADS FEATURE PAUSED: `• Thread Colour: ${enq.thread || 'Standard'}\n` + */
      `• Placement: ${enq.placement || 'Left Chest Crest'}\n` +
      `• Quantity & Size: ${enq.quantity || 1} pcs (${enq.size || '40 inch'})\n` +
      (enq.design ? `• Design Motif: ${enq.design}\n` : '') +
      (enq.logoAttachment ? `• Attached Logo / Artwork: Received ✓\n` : '') +
      (enq.notes ? `• Special Notes: "${enq.notes}"\n\n` : '\n') +
      statusClosing
    : `Hello ${enq.customerName || 'there'}! This is MazaTowel Personalized Boutique regarding your enquiry for "${enq.product || 'Personalized Towel'}".\n\n` +
      `📋 Order Details:\n` +
      namesDetail +
      /* THREADS FEATURE PAUSED: `• Thread Colour: ${enq.thread || 'Teal'}\n` + */
      `• Towel Colour: ${enq.towelColor || 'Standard'}\n` +
      `• Quantity: ${enq.quantity || 1} pcs (${enq.size || ''})\n` +
      (enq.design ? `• Design Motif: ${enq.design}\n` : '') +
      (enq.logoAttachment ? `• Attached Logo / Artwork: Received ✓\n` : '') +
      (enq.notes ? `• Notes: "${enq.notes}"\n\n` : '\n') +
      statusClosing;

  return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
};

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

function FormField({ label, required, error, children, className = '' }) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <label>
        {label} {required && <span style={{ color: 'var(--rose)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <span className="field-error-msg">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

function CheckboxCard({ label, description, checked, onChange }) {
  return (
    <label className={`check-card ${checked ? 'is-checked' : ''}`}>
      <input type="checkbox" checked={Boolean(checked)} onChange={e => onChange(e.target.checked)} />
      <div className="check-card-info">
        <strong>{label}</strong>
        {description && <p>{description}</p>}
      </div>
    </label>
  );
}

function ImagePicker({ label = 'Photo / Image', currentImage, file, onFileChange, onRemove }) {
  const previewUrl = file ? URL.createObjectURL(file) : currentImage;
  const fileName = file ? file.name : (currentImage ? currentImage.split('/').pop() : 'Uploaded Image');
  return (
    <div className="field" style={{ marginTop: 14 }}>
      <label>{label}</label>
      {previewUrl ? (
        <div className="image-preview-box">
          <img src={previewUrl} alt="Preview" className="image-preview-thumb" />
          <div className="image-preview-meta">
            <div className="image-preview-header">
              <strong title={fileName}>{fileName}</strong>
              <span className="image-status-pill">
                <span className="status-dot"></span>
                {file ? 'Ready to upload' : 'Active photo'}
              </span>
            </div>
            {file && <span className="image-size-sub">{(file.size / 1024).toFixed(0)} KB ready to upload</span>}
            <div className="image-actions">
              <label
                className="image-action-btn image-action-change"
                title="Change Image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Change Image</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onFileChange(e.target.files[0])} />
              </label>
              <button
                type="button"
                className="image-action-btn image-action-remove"
                onClick={onRemove}
                title="Remove current image"
                aria-label="Remove current image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="image-uploader">
          <div className="image-uploader-icon">📷</div>
          <strong className="image-uploader-title">Click to upload image</strong>
          <span className="image-uploader-sub">Supports JPG, PNG, WEBP (Max 15MB)</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onFileChange(e.target.files[0])} />
        </label>
      )}
    </div>
  );
}

// Utility helper to strictly block any non-digit character (letters, spaces, punctuation, symbols) in numeric fields
const blockNonDigits = (e) => {
  if (
    [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ].includes(e.key)
  ) {
    return;
  }
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
    return;
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};
const blockNonIntegerKeys = blockNonDigits;

function validateItem(type, item, file) {
  const errors = {};
  if (type === 'products') {
    if (!item.name || !item.name.trim()) {
      errors.name = 'Product name is required (e.g. Personalized Bath Towel).';
    } else if (item.name.trim().length > 100) {
      errors.name = 'Product name must not exceed 100 characters.';
    }
    if (!item.category || !item.category.trim()) errors.category = 'Category is required.';
    if (!item.size || !item.size.trim()) {
      errors.size = 'Please select a standard size.';
    }
    const numPrice = Number(item.price);
    if (item.price === '' || item.price === undefined || item.price === null || isNaN(numPrice) || numPrice <= 0 || !Number.isFinite(numPrice)) {
      errors.price = 'Please enter a valid price in rupees (greater than 0, numbers only).';
    } else if (numPrice > 999999) {
      errors.price = 'Price cannot exceed ₹999,999.';
    }
    if (!item.desc || !item.desc.trim()) {
      errors.desc = 'Brief product description is required.';
    } else if (item.desc.trim().length > 1000) {
      errors.desc = 'Description must not exceed 1000 characters.';
    }
    if (item.badge && item.badge.trim().length > 30) {
      errors.badge = 'Badge text must not exceed 30 characters.';
    }
  } else if (type === 'colors') {
    if (!item.name || !item.name.trim()) {
      errors.name = 'Color name is required (e.g. Ocean Teal).';
    } else if (item.name.trim().length > 50) {
      errors.name = 'Color name must not exceed 50 characters.';
    } else if (!/^[A-Za-z\s\-']+$/.test(item.name.trim())) {
      errors.name = 'Color name can only contain letters, spaces, and hyphens.';
    }
    if (!item.hex || !item.hex.trim()) {
      errors.hex = 'Hex color code is required (e.g. #2F7F82).';
    } else if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(item.hex.trim())) {
      errors.hex = 'Invalid hex color format. Must be #RGB or #RRGGBB (e.g. #2F7F82).';
    }
    if (item.desc && item.desc.trim().length > 500) {
      errors.desc = 'Description must not exceed 500 characters.';
    }
  /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
  } else if (type === 'threads') {
    if (!item.name || !item.name.trim()) errors.name = 'Thread color name is required (e.g. Metallic Gold).';
    if (!item.hex || !item.hex.trim()) errors.hex = 'Hex color code is required (e.g. #D4AF37).';
  */
  } else if (type === 'designs') {
    if (!item.designId || !item.designId.trim()) {
      errors.designId = 'Design Code is required (e.g. MT-001).';
    } else if (!/^[A-Za-z0-9_\-]+$/.test(item.designId.trim())) {
      errors.designId = 'Design Code must contain only letters, numbers, and hyphens without spaces (e.g. MT-001).';
    } else if (item.designId.trim().length > 20) {
      errors.designId = 'Design Code must not exceed 20 characters.';
    }
    if (!item.name || !item.name.trim()) {
      errors.name = 'Design name is required.';
    } else if (item.name.trim().length > 80) {
      errors.name = 'Design name must not exceed 80 characters.';
    }
    if (!item.category || !item.category.trim()) {
      errors.category = 'Category is required.';
    } else if (item.category.trim().length > 50) {
      errors.category = 'Category must not exceed 50 characters.';
    }
    if (item.desc && item.desc.trim().length > 600) {
      errors.desc = 'Description must not exceed 600 characters.';
    }
  } else if (type === 'gallery') {
    if (!item.alt || !item.alt.trim()) {
      errors.alt = 'Caption / photo description is required.';
    } else if (item.alt.trim().length > 200) {
      errors.alt = 'Caption must not exceed 200 characters.';
    }
    if (!item.image && !file) errors.image = 'Please select a photo to upload.';
  } else if (type === 'customers') {
    if (!item.name || !item.name.trim()) {
      errors.name = 'Customer / business name is required.';
    } else if (item.name.trim().length > 100) {
      errors.name = 'Customer name must not exceed 100 characters.';
    }
    if (item.category && item.category.trim().length > 60) {
      errors.category = 'Category must not exceed 60 characters.';
    }
    if (item.website && item.website.trim()) {
      const urlStr = item.website.trim();
      if (urlStr.length > 255) {
        errors.website = 'Website URL must not exceed 255 characters.';
      } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(urlStr)) {
        errors.website = 'Please enter a valid website URL (e.g. https://hotelboutique.com).';
      }
    }
    if (!item.tagline || !item.tagline.trim()) {
      errors.tagline = 'Tagline or summary is required.';
    } else if (item.tagline.trim().length > 300) {
      errors.tagline = 'Tagline must not exceed 300 characters.';
    }
  } else if (type === 'reviews') {
    if (!item.name || !item.name.trim()) {
      errors.name = 'Customer name is required.';
    } else if (item.name.trim().length > 60) {
      errors.name = 'Customer name must not exceed 60 characters.';
    } else if (!/^[A-Za-z\s.\-']+$/.test(item.name.trim())) {
      errors.name = 'Customer name should only contain letters, dots, and hyphens.';
    }
    if (!item.text || !item.text.trim()) {
      errors.text = 'Review text is required.';
    } else if (item.text.trim().length > 1000) {
      errors.text = 'Review text must not exceed 1000 characters.';
    }
    const numRating = Number(item.rating);
    if (!item.rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      errors.rating = 'Rating must be an integer between 1 and 5.';
    }
    if (item.date) {
      const today = new Date().toISOString().slice(0, 10);
      if (item.date > today) {
        errors.date = 'Review date cannot be in the future.';
      }
    }
  } else if (type === 'enquiries') {
    if (!item.customerName || !item.customerName.trim()) {
      errors.customerName = 'Customer name is required.';
    } else if (item.customerName.trim().length > 80) {
      errors.customerName = 'Customer name must not exceed 80 characters.';
    }
    if (!item.phone || !item.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else {
      const digits = item.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        errors.phone = 'Please enter a valid phone number with at least 10 digits (numbers only).';
      } else if (item.phone.trim().length > 16) {
        errors.phone = 'Phone number must not exceed 16 characters.';
      }
    }
    if (item.quantity !== undefined && item.quantity !== null && item.quantity !== '') {
      const q = Number(item.quantity);
      if (isNaN(q) || q < 1 || !Number.isInteger(q)) {
        errors.quantity = 'Quantity must be a positive whole number (at least 1).';
      } else if (q > 99999) {
        errors.quantity = 'Quantity cannot exceed 99,999.';
      }
    }
    if (item.notes && item.notes.trim().length > 1000) {
      errors.notes = 'Notes must not exceed 1000 characters.';
    }
  } else if (type === 'faqs') {
    if (!item.q || !item.q.trim()) {
      errors.q = 'Question is required.';
    } else if (item.q.trim().length > 250) {
      errors.q = 'Question must not exceed 250 characters.';
    }
    if (!item.a || !item.a.trim()) {
      errors.a = 'Answer is required.';
    } else if (item.a.trim().length > 2000) {
      errors.a = 'Answer must not exceed 2000 characters.';
    }
  } else if (type === 'offers') {
    if (!item.title || !item.title.trim()) {
      errors.title = 'Offer title is required.';
    } else if (item.title.trim().length > 100) {
      errors.title = 'Offer title must not exceed 100 characters.';
    }
    if (!item.code || !item.code.trim()) {
      errors.code = 'Promo code is required.';
    } else if (!/^[A-Za-z0-9_\-]+$/.test(item.code.trim())) {
      errors.code = 'Promo code must only contain letters, numbers, and hyphens without spaces (e.g. FESTIVE10).';
    } else if (item.code.trim().length > 20) {
      errors.code = 'Promo code must not exceed 20 characters.';
    }
    if (!item.discount || !item.discount.trim()) {
      errors.discount = 'Discount description is required.';
    } else if (item.discount.trim().length > 80) {
      errors.discount = 'Discount description must not exceed 80 characters.';
    }
    if (item.desc && item.desc.trim().length > 500) {
      errors.desc = 'Offer description must not exceed 500 characters.';
    }
  }
  return errors;
}

function ItemEditor({ type, item, data = {}, onClose, onSave, onSaveSettings }) {
  const [form, setForm] = useState({ ...item });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [rawMode, setRawMode] = useState(false);
  const [rawJson, setRawJson] = useState(JSON.stringify(item, null, 2));
  const [saving, setSaving] = useState(false);

  const allDesignCategories = useMemo(() => {
    const list = [...DEFAULT_DESIGN_CATEGORIES];
    if (Array.isArray(data?.settings?.customDesignCategories)) {
      data.settings.customDesignCategories.forEach(c => {
        if (c && !list.includes(c)) list.push(c);
      });
    }
    if (Array.isArray(data?.designs)) {
      data.designs.forEach(d => {
        if (d?.category && !list.includes(d.category)) list.push(d.category);
      });
    }
    if (form.category && !list.includes(form.category)) {
      list.push(form.category);
    }
    return list;
  }, [data?.settings?.customDesignCategories, data?.designs, form.category]);

  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(
    () => type === 'designs' && Boolean(form.category && !DEFAULT_DESIGN_CATEGORIES.includes(form.category))
  );
  const [customCatInput, setCustomCatInput] = useState(
    () => (type === 'designs' && form.category && !DEFAULT_DESIGN_CATEGORIES.includes(form.category) ? form.category : '')
  );

  const selectedSizeLabel = useMemo(() => {
    for (const group of STANDARD_SIZES) {
      const found = group.sizes.find(s => s.value === form.size);
      if (found) return found.label;
    }
    return form.size || 'Select standard size (in inches)...';
  }, [form.size]);

  const setVal = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: null }));
  };

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalData;
      if (rawMode) {
        finalData = JSON.parse(rawJson);
      } else {
        const validationErrors = validateItem(type, form, file);
        if (Object.keys(validationErrors).length > 0) {
          setErrors({ ...validationErrors, form: 'Please check the required fields highlighted below.' });
          setSaving(false);
          return;
        }
        finalData = { ...form };
      }

      if (file) {
        finalData.imageData = await readFile(file);
        finalData.imageName = file.name;
      }

      if (type === 'products' && finalData.price !== undefined) {
        finalData.price = Number(finalData.price) || 0;
      }
      if (type === 'reviews' && finalData.rating !== undefined) {
        finalData.rating = Number(finalData.rating) || 5;
      }

      if (type === 'designs' && finalData.category) {
        const catTrimmed = finalData.category.trim();
        finalData.category = catTrimmed;
        const currentCustom = Array.isArray(data?.settings?.customDesignCategories) ? data.settings.customDesignCategories : [];
        if (!DEFAULT_DESIGN_CATEGORIES.includes(catTrimmed) && !currentCustom.includes(catTrimmed)) {
          if (typeof onSaveSettings === 'function') {
            onSaveSettings({
              ...data.settings,
              customDesignCategories: [...currentCustom, catTrimmed]
            }).catch(() => {});
          }
        }
      }

      await onSave(type, item.id, finalData);
    } catch (err) {
      setErrors({ form: err.message || 'Error saving. Please check fields.' });
      setSaving(false);
    }
  }

  const categoryOptions = {
    products: ['Hand Towels', 'Face Towels', 'Bath Towels', 'Kids Towels', 'Custom T-Shirts'],
    designs: allDesignCategories
  };

  return (
    <div className="admin-modal">
      <form className="modal-card" onSubmit={submit} style={{ maxWidth: 760 }}>
        <div className="modal-head">
          <div>
            <h2>{item.id ? `Edit ${singular(type)}` : `Add New ${singular(type)}`}</h2>
            <span className="muted" style={{ fontSize: 12 }}>{item.id ? `ID: ${item.id}` : 'Fill in the details below'}</span>
          </div>
          <button className="icon-btn-close" type="button" onClick={onClose} title="Close" aria-label="Close form">
            <CloseIcon size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="modal-body">
          {errors.form && <div className="health-error" style={{ marginBottom: 16 }}>{errors.form}</div>}

          {rawMode ? (
            <div>
              <p className="muted">Direct JSON Mode. Edit values carefully to match schema.</p>
              <textarea
                className="json-editor"
                value={rawJson}
                onChange={e => setRawJson(e.target.value)}
                spellCheck="false"
              />
            </div>
          ) : (
            <div>
              {/* PRODUCTS FORM */}
              {type === 'products' && (
                <>
                  <div className="form-row">
                    <FormField label="Product Title" required error={errors.name}>
                      <input
                        type="text"
                        maxLength={100}
                        value={form.name || ''}
                        onChange={e => setVal('name', e.target.value.slice(0, 100))}
                        placeholder="Enter product title"
                      />
                    </FormField>
                    <FormField label="Category" required error={errors.category}>
                      <select value={form.category || 'Hand Towels'} onChange={e => setVal('category', e.target.value)}>
                        {categoryOptions.products.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Size (Inches Only)" required error={errors.size}>
                      <select
                        value={form.size || ''}
                        onChange={e => setVal('size', e.target.value)}
                        title={selectedSizeLabel}
                      >
                        <option value="">Select standard size (in inches)...</option>
                        {STANDARD_SIZES.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.sizes.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </optgroup>
                        ))}
                        {form.size && !STANDARD_SIZES.some(g => g.sizes.some(s => s.value === form.size)) && (
                          <option value={form.size}>{form.size} (Current)</option>
                        )}
                      </select>
                    </FormField>
                    <div className="price-badge-subgrid">
                      <FormField label="Price (₹)" required error={errors.price}>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={form.price === '' ? '' : (form.price ?? 90)}
                          onKeyDown={blockNonDigits}
                          onPaste={e => {
                            e.preventDefault();
                            const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                            const digits = pasted.replace(/\D/g, '').slice(0, 6);
                            setVal('price', digits === '' ? '' : parseInt(digits, 10));
                          }}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setVal('price', raw === '' ? '' : parseInt(raw, 10));
                          }}
                          placeholder="Price in ₹"
                        />
                      </FormField>
                      <FormField label="Badge / Ribbon" error={errors.badge}>
                        <input
                          type="text"
                          maxLength={30}
                          value={form.badge || ''}
                          onChange={e => setVal('badge', e.target.value.slice(0, 30))}
                          placeholder="e.g. Personalized"
                        />
                      </FormField>
                    </div>
                  </div>

                  <FormField label="Product Description" required error={errors.desc}>
                    <textarea
                      rows="3"
                      maxLength={1000}
                      value={form.desc || ''}
                      onChange={e => setVal('desc', e.target.value.slice(0, 1000))}
                      placeholder="Enter product description"
                    />
                  </FormField>

                  <ImagePicker
                    label="Towel Photograph"
                    currentImage={form.image}
                    file={file}
                    onFileChange={setFile}
                    onRemove={() => { setFile(null); setVal('image', ''); }}
                  />


                  <div className="form-section-title">Visibility & Badging</div>
                  <div className="form-row-3">
                    <CheckboxCard
                      label="Published"
                      description="Visible on live website"
                      checked={form.published !== false}
                      onChange={v => setVal('published', v)}
                    />
                    <CheckboxCard
                      label="Featured"
                      description="Showcase in featured highlights"
                      checked={form.featured === true}
                      onChange={v => setVal('featured', v)}
                    />
                    <CheckboxCard
                      label="Best Seller"
                      description="Highlight with bestseller badge"
                      checked={form.bestSeller === true}
                      onChange={v => setVal('bestSeller', v)}
                    />
                  </div>
                </>
              )}

              {/* COLORS FORM */}
              {type === 'colors' && (
                <>
                  <div className="form-row">
                    <FormField label="Color Name" required error={errors.name}>
                      <input
                        type="text"
                        maxLength={50}
                        value={form.name || ''}
                        onChange={e => {
                          const lettersOnly = e.target.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50);
                          setVal('name', lettersOnly);
                        }}
                        placeholder="Enter color name"
                      />
                    </FormField>
                    <FormField label="Swatch Hex Code" required error={errors.hex}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="color"
                          value={form.hex?.startsWith('#') && form.hex.length === 7 ? form.hex : '#2F7F82'}
                          onChange={e => setVal('hex', e.target.value.toUpperCase())}
                          style={{ width: 44, height: 44, padding: 2, borderRadius: 10, border: '1px solid var(--line)', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={form.hex || ''}
                          onChange={e => {
                            let val = e.target.value.toUpperCase().replace(/[^0-9A-F#]/g, '');
                            if (val && !val.startsWith('#')) val = '#' + val;
                            val = val.slice(0, 7);
                            setVal('hex', val);
                          }}
                          placeholder="#2F7F82"
                          style={{ flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                        />
                      </div>
                    </FormField>
                  </div>

                  <FormField label="Applicable Product Categories">
                    <div className="form-choice-grid">
                      {['Bath Towels', 'Hand Towels', 'Face Towels', 'Kids Towels', 'Custom T-Shirts'].map(cat => {
                        const currentCats = Array.isArray(form.categories) ? form.categories : ['Bath Towels', 'Hand Towels', 'Face Towels', 'Kids Towels'];
                        const isChecked = currentCats.includes(cat);
                        return (
                          <label key={cat} className={`form-choice-card ${isChecked ? 'is-checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const next = e.target.checked ? [...currentCats, cat] : currentCats.filter(c => c !== cat);
                                setVal('categories', next);
                              }}
                            />
                            <span className="form-choice-label">{cat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormField>

                  <FormField label="Applicable Towel Sizes">
                    <div className="form-choice-grid">
                      {['All Sizes', '12 × 12 inch', '14 × 21 inch', '16 × 24 inch', '20 × 36 inch', '24 × 48 inch', '27 × 54 inch', '30 × 60 inch', '36 × 72 inch', '38 inch', '40 inch', '42 inch', '44 inch', '46 inch'].map(s => {
                        const currentSizes = Array.isArray(form.sizes) ? form.sizes : (form.sizes ? [form.sizes] : ['All Sizes']);
                        const isChecked = currentSizes.includes(s);
                        return (
                          <label key={s} className={`form-choice-card ${isChecked ? 'is-checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                let next;
                                if (s === 'All Sizes') {
                                  next = e.target.checked ? ['All Sizes'] : [];
                                } else {
                                  const withoutAll = currentSizes.filter(x => x !== 'All Sizes');
                                  next = e.target.checked ? [...withoutAll, s] : withoutAll.filter(x => x !== s);
                                  if (next.length === 0) next = ['All Sizes'];
                                }
                                setVal('sizes', next);
                              }}
                            />
                            <span className="form-choice-label">{s}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormField>

                  <FormField label="Size-Specific Stock Availability">
                    <div className="form-choice-grid">
                      {['12 × 12 inch', '14 × 21 inch', '16 × 24 inch', '20 × 36 inch', '24 × 48 inch', '27 × 54 inch', '30 × 60 inch', '36 × 72 inch', '38 inch', '40 inch', '42 inch', '44 inch', '46 inch'].map(s => {
                        const oosSizes = Array.isArray(form.outOfStockSizes) ? form.outOfStockSizes : [];
                        const isOos = oosSizes.includes(s);
                        return (
                          <label key={s} className={`form-choice-card is-oos ${isOos ? 'is-checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isOos}
                              onChange={e => {
                                const next = e.target.checked ? [...oosSizes, s] : oosSizes.filter(x => x !== s);
                                setVal('outOfStockSizes', next);
                              }}
                            />
                            <span className="form-choice-label">{s} {isOos ? '(Sold Out)' : ''}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormField>

                  <FormField label="Description / Fabric Shade Details" error={errors.desc}>
                    <textarea
                      rows="2"
                      maxLength={500}
                      value={form.desc || ''}
                      onChange={e => setVal('desc', e.target.value.slice(0, 500))}
                      placeholder="Enter fabric notes"
                    />
                  </FormField>

                  <ImagePicker
                    label="Towel Color Photograph / Fabric Swatch Photo"
                    currentImage={form.image}
                    file={file}
                    onFileChange={setFile}
                    onRemove={() => { setFile(null); setVal('image', ''); }}
                  />

                  <div className="form-section-title">Stock Availability & Visibility</div>
                  <div className="form-row">
                    <CheckboxCard
                      label="Master In Stock"
                      description="General availability flag. Uncheck to disable for all sizes and show Out of Stock."
                      checked={form.inStock !== false}
                      onChange={v => setVal('inStock', v)}
                    />
                    <CheckboxCard
                      label="Published on Website"
                      description="Visible in customer color palette on site."
                      checked={form.published !== false}
                      onChange={v => setVal('published', v)}
                    />
                  </div>
                </>
              )}

              {/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
              {type === 'threads' && (
                <>
                  <div className="form-row">
                    <FormField label="Thread Color Name" required error={errors.name}>
                      <input value={form.name || ''} onChange={e => setVal('name', e.target.value)} placeholder="Enter thread color name" />
                    </FormField>
                    <FormField label="Hex Color Code" required error={errors.hex}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="color"
                          value={form.hex?.startsWith('#') && form.hex.length === 7 ? form.hex : '#D4AF37'}
                          onChange={e => setVal('hex', e.target.value.toUpperCase())}
                          style={{ width: 44, height: 38, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--line)' }}
                          title="Pick thread color"
                        />
                        <input
                          value={form.hex || ''}
                          onChange={e => setVal('hex', e.target.value)}
                          placeholder="Enter hex code"
                          style={{ flex: 1 }}
                        />
                      </div>
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Thread Finish / Luster">
                      <select value={form.finish || 'Silk Luster'} onChange={e => setVal('finish', e.target.value)}>
                        {['Metallic Sheen', 'Silk Luster', 'Classic Cotton', 'Matte Finish', 'Neon / High-Vis', 'Custom Consultation'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Description / Thread Details">
                    <textarea rows="2" value={form.desc || ''} onChange={e => setVal('desc', e.target.value)} placeholder="Enter thread notes" />
                  </FormField>

                  <div className="form-section-title">Stock Availability & Visibility</div>
                  <div className="form-row">
                    <CheckboxCard
                      label="In Stock"
                      description="Thread spool available in workshop for immediate embroidery."
                      checked={form.inStock !== false}
                      onChange={v => setVal('inStock', v)}
                    />
                    <CheckboxCard
                      label="Published on Website"
                      description="Visible in customer thread palette on order form."
                      checked={form.published !== false}
                      onChange={v => setVal('published', v)}
                    />
                  </div>
                </>
              )}
              */}

              {/* DESIGNS FORM */}
              {type === 'designs' && (
                <>
                  <div className="form-row">
                    <FormField label="Design Code" required error={errors.designId}>
                      <input
                        type="text"
                        maxLength={20}
                        value={form.designId || ''}
                        onChange={e => {
                          const code = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, '').slice(0, 20);
                          setVal('designId', code);
                        }}
                        placeholder="Enter design code"
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      />
                    </FormField>
                    <FormField label="Design Name" required error={errors.name}>
                      <input
                        type="text"
                        maxLength={80}
                        value={form.name || ''}
                        onChange={e => setVal('name', e.target.value.slice(0, 80))}
                        placeholder="Enter design name"
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField
                      label={
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>Design Category <span className="req-star">*</span></span>
                          <button
                            type="button"
                            className="link-action-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--teal2)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              padding: 0
                            }}
                            onClick={() => {
                              const next = !isCustomCategoryMode;
                              setIsCustomCategoryMode(next);
                              if (next) {
                                setCustomCatInput(form.category || '');
                              } else {
                                setVal('category', form.category && allDesignCategories.includes(form.category) ? form.category : allDesignCategories[0]);
                              }
                            }}
                          >
                            {isCustomCategoryMode ? '← Choose from Existing Categories' : '+ Add New / Custom Category'}
                          </button>
                        </span>
                      }
                      required
                      error={errors.category}
                    >
                      {isCustomCategoryMode ? (
                        <div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              autoFocus
                              type="text"
                              maxLength={50}
                              value={customCatInput}
                              onChange={e => {
                                const val = e.target.value.slice(0, 50);
                                setCustomCatInput(val);
                                setVal('category', val);
                              }}
                              placeholder="Enter category name"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ minHeight: 38, padding: '0 12px', fontSize: 12 }}
                              onClick={() => {
                                setIsCustomCategoryMode(false);
                                setVal('category', allDesignCategories[0] || 'Names & Initials');
                              }}
                            >
                              Existing List
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>Suggestions:</span>
                            {['Festive & Wedding', 'Spiritual & Religious', 'Monograms & Crests', 'Gym & Fitness', 'Baby Shower', 'Zodiac & Astrology', 'Minimalist Typography'].map(sug => (
                              <button
                                key={sug}
                                type="button"
                                style={{
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  background: 'var(--soft)',
                                  border: '1px solid var(--line)',
                                  cursor: 'pointer',
                                  color: 'var(--teal2)',
                                  fontWeight: 500
                                }}
                                onClick={() => {
                                  setCustomCatInput(sug);
                                  setVal('category', sug);
                                }}
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <select
                            value={form.category || allDesignCategories[0] || 'Names & Initials'}
                            onChange={e => {
                              if (e.target.value === '__NEW_CUSTOM__') {
                                setIsCustomCategoryMode(true);
                                setCustomCatInput('');
                                setVal('category', '');
                              } else {
                                setVal('category', e.target.value);
                              }
                            }}
                            style={{ flex: 1 }}
                          >
                            <optgroup label="Standard Categories">
                              {DEFAULT_DESIGN_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </optgroup>
                            {allDesignCategories.filter(c => !DEFAULT_DESIGN_CATEGORIES.includes(c)).length > 0 && (
                              <optgroup label="Customized Categories">
                                {allDesignCategories.filter(c => !DEFAULT_DESIGN_CATEGORIES.includes(c)).map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </optgroup>
                            )}
                            <option value="__NEW_CUSTOM__">✨ + Add New Customized Category...</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            title="Add customized category"
                            style={{ minHeight: 38, padding: '0 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                            onClick={() => {
                              setIsCustomCategoryMode(true);
                              setCustomCatInput('');
                              setVal('category', '');
                            }}
                          >
                            + Custom
                          </button>
                        </div>
                      )}
                    </FormField>
                  </div>

                  <FormField label="Embroidery Description" error={errors.desc}>
                    <textarea
                      rows="3"
                      maxLength={600}
                      value={form.desc || ''}
                      onChange={e => setVal('desc', e.target.value.slice(0, 600))}
                      placeholder="Enter embroidery description"
                    />
                  </FormField>

                  <ImagePicker
                    label="Embroidery Photo Sample"
                    currentImage={form.image}
                    file={file}
                    onFileChange={setFile}
                    onRemove={() => { setFile(null); setVal('image', ''); }}
                  />

                  <div className="form-section-title">Visibility</div>
                  <div className="form-row">
                    <CheckboxCard
                      label="Published"
                      description="Visible in Design Library"
                      checked={form.published !== false}
                      onChange={v => setVal('published', v)}
                    />
                    <CheckboxCard
                      label="Featured"
                      description="Prioritized in library previews"
                      checked={form.featured === true}
                      onChange={v => setVal('featured', v)}
                    />
                  </div>
                </>
              )}

              {/* GALLERY FORM */}
              {type === 'gallery' && (
                <>
                  <FormField label="Caption / Description" required error={errors.alt}>
                    <input
                      type="text"
                      maxLength={200}
                      value={form.alt || ''}
                      onChange={e => setVal('alt', e.target.value.slice(0, 200))}
                      placeholder="Enter photo description"
                    />
                  </FormField>

                  <ImagePicker
                    label="Gallery Photograph"
                    currentImage={form.image}
                    file={file}
                    onFileChange={setFile}
                    onRemove={() => { setFile(null); setVal('image', ''); }}
                  />
                  {errors.image && <span className="field-error-msg">{errors.image}</span>}

                  <div className="form-section-title">Visibility</div>
                  <CheckboxCard
                    label="Published in Gallery"
                    description="Display in the 'Real MazaTowel Moments' grid"
                    checked={form.published !== false}
                    onChange={v => setVal('published', v)}
                  />
                </>
              )}

              {/* CUSTOMERS FORM */}
              {type === 'customers' && (
                <>
                  <div className="form-row">
                    <FormField label="Client / Business Name" required error={errors.name}>
                      <input
                        type="text"
                        maxLength={100}
                        value={form.name || ''}
                        onChange={e => setVal('name', e.target.value.slice(0, 100))}
                        placeholder="Enter client or business name"
                      />
                    </FormField>
                    <FormField label="Business Category / Industry" error={errors.category}>
                      <input
                        type="text"
                        maxLength={60}
                        value={form.category || ''}
                        onChange={e => setVal('category', e.target.value.slice(0, 60))}
                        placeholder="Enter business category or industry"
                      />
                    </FormField>
                  </div>

                  <FormField label="Website URL" error={errors.website}>
                    <input
                      type="url"
                      maxLength={255}
                      value={form.website || ''}
                      onChange={e => setVal('website', e.target.value.trim().slice(0, 255))}
                      placeholder="https://example.com"
                    />
                  </FormField>

                  <FormField label="Tagline / Order Details" required error={errors.tagline}>
                    <textarea
                      rows="2"
                      maxLength={300}
                      value={form.tagline || ''}
                      onChange={e => setVal('tagline', e.target.value.slice(0, 300))}
                      placeholder="Enter tagline or order details"
                    />
                  </FormField>

                  <ImagePicker
                    label="Client Logo / Embroidered Towel Photo"
                    currentImage={form.image}
                    file={file}
                    onFileChange={setFile}
                    onRemove={() => { setFile(null); setVal('image', ''); }}
                  />

                  <div className="form-section-title">Visibility</div>
                  <CheckboxCard
                    label="Published"
                    description="Display in 'Our Customers & Hospitality' section"
                    checked={form.published !== false}
                    onChange={v => setVal('published', v)}
                  />
                </>
              )}

              {/* REVIEWS FORM */}
              {type === 'reviews' && (
                <>
                  <div className="form-row-3">
                    <FormField label="Customer Name" required error={errors.name}>
                      <input
                        type="text"
                        maxLength={60}
                        value={form.name || ''}
                        onChange={e => {
                          const lettersOnly = e.target.value.replace(/[^a-zA-Z\s.\-']/g, '').slice(0, 60);
                          setVal('name', lettersOnly);
                        }}
                        placeholder="Enter customer name (letters only)"
                      />
                    </FormField>
                    <FormField label="Rating" required error={errors.rating}>
                      <select value={form.rating ?? 5} onChange={e => setVal('rating', Number(e.target.value))}>
                        <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                        <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                        <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                        <option value={2}>★★☆☆☆ (2 Stars - Fair)</option>
                        <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                      </select>
                    </FormField>
                    <FormField label="Source Tag">
                      <select value={form.source || 'WhatsApp Verified'} onChange={e => setVal('source', e.target.value)}>
                        <option value="WhatsApp Verified">WhatsApp Verified</option>
                        <option value="Verified Buyer">Verified Buyer</option>
                        <option value="Google">Google</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Review Date" error={errors.date}>
                      <input
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={form.date || new Date().toISOString().slice(0, 10)}
                        onChange={e => setVal('date', e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField label="Review Message" required error={errors.text}>
                    <textarea
                      rows="4"
                      maxLength={1000}
                      value={form.text || ''}
                      onChange={e => setVal('text', e.target.value.slice(0, 1000))}
                      placeholder="Enter customer review"
                    />
                  </FormField>

                  <div className="form-section-title">Visibility</div>
                  <div className="form-row">
                    <CheckboxCard
                      label="Published"
                      description="Visible on homepage reviews section"
                      checked={form.published !== false}
                      onChange={v => setVal('published', v)}
                    />
                    <CheckboxCard
                      label="Featured"
                      description="Highlight in top review carousel"
                      checked={form.featured === true}
                      onChange={v => setVal('featured', v)}
                    />
                  </div>
                </>
              )}

              {/* ENQUIRIES FORM */}
              {type === 'enquiries' && (
                <>
                  <div className="form-row">
                    <FormField label="Order Category">
                      <select
                        value={(form.category === 'Custom T-Shirts' || isTShirtItem(form)) ? 'Custom T-Shirts' : 'Towels'}
                        onChange={e => {
                          const isShirt = e.target.value === 'Custom T-Shirts';
                          setVal('category', isShirt ? 'Custom T-Shirts' : 'Towels');
                          if (isShirt && !form.placement) setVal('placement', 'Left Chest Crest');
                          if (isShirt && (!form.size || form.size.includes('×'))) setVal('size', '40 inch');
                          if (!isShirt && (!form.size || (form.size.includes('inch') && !form.size.includes('×')))) setVal('size', '30 × 60 inch');
                        }}
                      >
                        <option value="Towels">Towels</option>
                        <option value="Custom T-Shirts">Custom T-Shirts & Apparel</option>
                      </select>
                    </FormField>
                    {(form.category === 'Custom T-Shirts' || isTShirtItem(form)) ? (
                      <FormField label="Embroidery Placement">
                        <select value={form.placement || 'Left Chest Crest'} onChange={e => setVal('placement', e.target.value)}>
                          <option value="Left Chest Crest">Left Chest Crest (Over Heart)</option>
                          <option value="Center Chest">Center Chest (Statement)</option>
                          <option value="Left Sleeve">Left Sleeve / Badge</option>
                          <option value="Upper Back / Collar">Upper Back / Collar</option>
                        </select>
                      </FormField>
                    ) : (
                      <FormField label="Towel Type / Collection">
                        <input
                          type="text"
                          maxLength={50}
                          value={form.category || 'Towels'}
                          onChange={e => setVal('category', e.target.value.slice(0, 50))}
                          placeholder="Enter towel type"
                        />
                      </FormField>
                    )}
                  </div>

                  <div className="form-row">
                    <FormField label="Customer Name" required error={errors.customerName}>
                      <input
                        type="text"
                        maxLength={80}
                        value={form.customerName || ''}
                        onChange={e => {
                          const lettersOnly = e.target.value.replace(/[^a-zA-Z\s.\-']/g, '').slice(0, 80);
                          setVal('customerName', lettersOnly);
                        }}
                        placeholder="Enter customer name"
                      />
                    </FormField>
                    <FormField label="Mobile Phone" required error={errors.phone}>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15}
                        value={form.phone || ''}
                        onKeyDown={blockNonDigits}
                        onPaste={e => {
                          e.preventDefault();
                          const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                          const digits = pasted.replace(/\D/g, '').slice(0, 15);
                          setVal('phone', digits);
                        }}
                        onChange={e => {
                          const clean = e.target.value.replace(/\D/g, '').slice(0, 15);
                          setVal('phone', clean);
                        }}
                        placeholder="Enter mobile number (numbers only)"
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label={(form.category === 'Custom T-Shirts' || isTShirtItem(form)) ? "T-Shirt Product / Style" : "Towel Product"}>
                      <input
                        type="text"
                        maxLength={100}
                        value={form.product || ''}
                        onChange={e => setVal('product', e.target.value.slice(0, 100))}
                        placeholder={(form.category === 'Custom T-Shirts' || isTShirtItem(form)) ? "Enter t-shirt product" : "Enter towel product"}
                      />
                    </FormField>
                    <div className="size-qty-subgrid">
                      <FormField label="Size (Inches Only)">
                        <select
                          value={form.size || ''}
                          onChange={e => setVal('size', e.target.value)}
                          title={selectedSizeLabel}
                        >
                          <option value="">Select standard size (in inches)...</option>
                          {STANDARD_SIZES.map(group => (
                            <optgroup key={group.group} label={group.group}>
                              {group.sizes.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </optgroup>
                          ))}
                          {form.size && !STANDARD_SIZES.some(g => g.sizes.some(s => s.value === form.size)) && (
                            <option value={form.size}>{form.size}</option>
                          )}
                        </select>
                      </FormField>
                      <FormField label="Quantity" error={errors.quantity}>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          value={form.quantity === '' ? '' : (form.quantity || 1)}
                          onKeyDown={blockNonDigits}
                          onPaste={e => {
                            e.preventDefault();
                            const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                            const digits = pasted.replace(/\D/g, '').slice(0, 5);
                            setVal('quantity', digits === '' ? '' : Math.max(1, parseInt(digits, 10)));
                          }}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
                            setVal('quantity', raw === '' ? '' : Math.max(1, parseInt(raw, 10)));
                          }}
                          placeholder="1"
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="form-row">
                    <FormField label={(form.category === 'Custom T-Shirts' || isTShirtItem(form)) ? "Garment / T-Shirt Color" : "Towel Fabric Color"}>
                      <input
                        type="text"
                        maxLength={50}
                        value={form.towelColor || ''}
                        onChange={e => setVal('towelColor', e.target.value.slice(0, 50))}
                        placeholder="Enter fabric color"
                      />
                    </FormField>
                    {/* THREADS FEATURE PAUSED:
                    <FormField label="Thread Color">
                      <input value={form.thread || 'Teal'} onChange={e => setVal('thread', e.target.value)} placeholder="Enter thread color" />
                    </FormField>
                    */}
                  </div>

                  <div className="form-row">
                    <FormField
                      label="Name(s) to Embroider"
                    >
                      <input
                        type="text"
                        maxLength={150}
                        value={form.embroideryName || ''}
                        onChange={e => setVal('embroideryName', e.target.value.slice(0, 150))}
                        placeholder="Enter name to embroider"
                      />
                      {Array.isArray(form.embroideryNames) && form.embroideryNames.length > 1 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                          {form.embroideryNames.map((nm, idx) => (
                            <span key={idx} className="thread-pill" style={{ fontSize: 11, padding: '2px 8px' }}>
                              #{idx + 1}: <strong>{nm}</strong>
                              {form.sizesPerItem?.[idx] && <span style={{ opacity: 0.75, marginLeft: 3 }}>({form.sizesPerItem[idx]})</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </FormField>
                    <FormField label="Design Code or Motif Reference">
                      <input
                        type="text"
                        maxLength={60}
                        value={form.design || ''}
                        onChange={e => setVal('design', e.target.value.slice(0, 60))}
                        placeholder="Enter design code or motif"
                      />
                    </FormField>
                  </div>

                  <FormField label="Customer Notes" error={errors.notes}>
                    <textarea
                      rows="3"
                      maxLength={1000}
                      value={form.notes || ''}
                      onChange={e => setVal('notes', e.target.value.slice(0, 1000))}
                      placeholder="Enter customer notes"
                    />
                  </FormField>

                  <FormField label="Internal Production & Stitching Notes (Admin Only)" error={errors.adminNotes}>
                    <textarea
                      rows="2"
                      maxLength={1000}
                      value={form.adminNotes || ''}
                      onChange={e => setVal('adminNotes', e.target.value.slice(0, 1000))}
                      placeholder="e.g. Approved WhatsApp proof, using Gold Thread #402, express packing requested"
                    />
                  </FormField>


                  <div className="form-section-title">Customer Logo / Reference Artwork</div>
                  {form.logoAttachment ? (
                    <div style={{ margin: '8px 0 16px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {/\.(png|jpe?g|webp|svg)$/i.test(form.logoAttachment) ? (
                          <img src={form.logoAttachment} alt="Customer Logo" style={{ width: 48, height: 48, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', padding: 2 }} />
                        ) : (
                          <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: '#e0f2fe', borderRadius: 6, fontSize: 20 }}>📄</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Customer Attached File</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all' }}>{form.logoAttachment}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <a
                          href={form.logoAttachment}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '5px 12px', textDecoration: 'none' }}
                        >
                          View File ↗
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '5px 8px', color: '#b42318' }}
                          onClick={() => setVal('logoAttachment', '')}
                          title="Remove attachment"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ margin: '8px 0 16px', padding: '10px 14px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>No logo or artwork attached by customer (optional).</span>
                      <label className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 9px', cursor: 'pointer', margin: 0 }}>
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await readFile(file);
                              const res = await api('/api/upload-logo', {
                                method: 'POST',
                                body: JSON.stringify({ dataUrl, name: file.name })
                              });
                              if (res.url) setVal('logoAttachment', res.url);
                            } catch (err) {
                              alert(err.message || 'Failed to upload logo');
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  <div className="form-section-title">Order Status</div>
                  <div className="form-row">
                    <FormField label="Current Status">
                      <select value={form.status || 'New'} onChange={e => setVal('status', e.target.value)}>
                        <option value="New">New (Needs Response)</option>
                        <option value="Contacted">Contacted on WhatsApp</option>
                        <option value="In Production">In Production (Embroidering)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </FormField>
                  </div>
                </>
              )}

              {/* FAQS FORM */}
              {type === 'faqs' && (
                <>
                  <FormField label="Question" required error={errors.q}>
                    <input
                      type="text"
                      maxLength={250}
                      value={form.q || ''}
                      onChange={e => setVal('q', e.target.value.slice(0, 250))}
                      placeholder="Enter question"
                    />
                  </FormField>

                  <FormField label="Answer" required error={errors.a}>
                    <textarea
                      rows="4"
                      maxLength={2000}
                      value={form.a || ''}
                      onChange={e => setVal('a', e.target.value.slice(0, 2000))}
                      placeholder="Enter answer"
                    />
                  </FormField>

                  <div className="form-section-title">Visibility</div>
                  <CheckboxCard
                    label="Published in FAQ"
                    description="Visible in website FAQ accordion"
                    checked={form.published !== false}
                    onChange={v => setVal('published', v)}
                  />
                </>
              )}

              {/* OFFERS FORM */}
              {type === 'offers' && (
                <>
                  <div className="form-row">
                    <FormField label="Offer Title" required error={errors.title}>
                      <input
                        type="text"
                        maxLength={100}
                        value={form.title || ''}
                        onChange={e => setVal('title', e.target.value.slice(0, 100))}
                        placeholder="Enter offer title"
                      />
                    </FormField>
                    <FormField label="Promo Code" required error={errors.code}>
                      <input
                        type="text"
                        maxLength={20}
                        value={form.code || ''}
                        onChange={e => {
                          const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, '').slice(0, 20);
                          setVal('code', clean);
                        }}
                        placeholder="Enter promo code"
                        style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Discount Text" required error={errors.discount}>
                      <input
                        type="text"
                        maxLength={80}
                        value={form.discount || ''}
                        onChange={e => setVal('discount', e.target.value.slice(0, 80))}
                        placeholder="Enter discount text"
                      />
                    </FormField>
                  </div>

                  <FormField label="Offer Description" error={errors.desc}>
                    <textarea
                      rows="3"
                      maxLength={500}
                      value={form.desc || ''}
                      onChange={e => setVal('desc', e.target.value.slice(0, 500))}
                      placeholder="Enter offer description"
                    />
                  </FormField>

                  <div className="form-section-title">Status</div>
                  <CheckboxCard
                    label="Offer Active"
                    description="Enable promo code on the website"
                    checked={form.active !== false}
                    onChange={v => setVal('active', v)}
                  />
                </>
              )}
            </div>
          )}

        </div>

        <div className="modal-actions">
          <div className="modal-actions-left">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => {
                if (!rawMode) setRawJson(JSON.stringify(form, null, 2));
                setRawMode(!rawMode);
              }}
              title="Switch between visual form and direct JSON editor"
            >
              🛠 {rawMode ? 'Visual Form' : 'Edit Raw JSON'}
            </button>
          </div>
          <div className="modal-actions-right">
            <button type="button" className="btn btn-secondary" onClick={onClose} title="Cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} title="Save">
              {saving ? 'Saving…' : `Save ${singular(type)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function getAuditBadge(event) {
  switch (event) {
    case 'LOGIN_SUCCESS':
      return <span className="audit-badge badge-success">✓ Sign In</span>;
    case 'LOGIN_FAILED':
      return <span className="audit-badge badge-danger">✗ Failed Sign In</span>;
    case 'LOGIN_BLOCKED':
      return <span className="audit-badge badge-danger">🚫 Brute Force Blocked</span>;
    case 'LOGOUT':
      return <span className="audit-badge badge-info">Sign Out</span>;
    case 'CREDENTIALS_UPDATED':
      return <span className="audit-badge badge-warning">🔑 Credentials Changed</span>;
    case 'SETTINGS_UPDATED':
      return <span className="audit-badge badge-teal">⚙️ Settings Updated</span>;
    case 'BACKUP_EXPORT':
    case 'BACKUP_EXPORTED':
      return <span className="audit-badge badge-purple">📦 Backup Export</span>;
    case 'BACKUP_IMPORT':
    case 'BACKUP_IMPORTED':
      return <span className="audit-badge badge-purple">📥 Backup Restore</span>;
    case 'ORDER_STATUS_CHANGED':
      return <span className="audit-badge badge-info">📝 Order Updated</span>;
    case 'ITEM_DELETED':
      return <span className="audit-badge badge-warning">🗑️ Item Deleted</span>;
    default:
      return <span className="audit-badge badge-info">{event}</span>;
  }
}

function formatAuditDetails(details) {
  if (!details || typeof details !== 'object') return '-';
  const parts = [];
  if (details.email) parts.push(`User: ${details.email}`);
  if (details.reason) parts.push(details.reason);
  if (details.remainingSecs) parts.push(`Retry in ${Math.ceil(details.remainingSecs / 60)}m`);
  if (details.section) parts.push(`Section: ${details.section}`);
  if (details.type) parts.push(`Type: ${details.type}`);
  if (details.id) parts.push(`ID: ${details.id}`);
  if (details.status) parts.push(`Status: ${details.status}`);
  if (details.orderNumber) parts.push(`Order #${details.orderNumber}`);
  if (details.customer) parts.push(`Customer: ${details.customer}`);
  if (details.itemCount !== undefined) parts.push(`${details.itemCount} items`);
  if (details.passwordChanged) parts.push('Password updated');
  return parts.length ? parts.join(' • ') : JSON.stringify(details);
}

function SettingsEditor({ settings = {}, adminEmail = '', onSave, onRefresh, onNotice }) {
  const [settingsTab, setSettingsTab] = useState('general');
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Live Google Reviews Testing State
  const [googleTesting, setGoogleTesting] = useState(false);
  const [googleDiag, setGoogleDiag] = useState(null);

  // Admin Security State
  const [credForm, setCredForm] = useState({ currentPassword: '', email: adminEmail || 'admin@mazatowel.in', newPassword: '' });
  const [credSaving, setCredSaving] = useState(false);
  const [credNotice, setCredNotice] = useState('');
  const [credError, setCredError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Security Audit Trail State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const res = await api('/api/admin/audit-log');
      if (res && Array.isArray(res.logs)) {
        setAuditLogs(res.logs);
      }
    } catch (e) {
      setAuditError(e.message || 'Failed to load audit logs.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Backup & Restore State
  const [importing, setImporting] = useState(false);
  const [backupNotice, setBackupNotice] = useState('');
  const [backupError, setBackupError] = useState('');

  // Custom Design Categories State
  const [newCatInput, setNewCatInput] = useState('');
  const handleAddCustomCategoryInSettings = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    const current = Array.isArray(form.customDesignCategories) ? form.customDesignCategories : [];
    if (!current.includes(trimmed)) {
      setVal('customDesignCategories', [...current, trimmed]);
      setNewCatInput('');
    }
  };

  useEffect(() => {
    if (adminEmail) setCredForm(f => ({ ...f, email: adminEmail }));
  }, [adminEmail]);

  const setVal = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  async function submit(e) {
    e.preventDefault();
    if (!form.brand || !form.brand.trim()) return setError('Brand name is required.');
    if (!form.whatsapp || !form.whatsapp.trim()) return setError('WhatsApp number is required.');
    setError('');
    setSaving(true);
    try {
      const clean = {
        ...form,
        shipping: Math.max(0, Number(form.shipping) || 0),
        cod: Boolean(form.cod),
        googleReviewsEnabled: Boolean(form.googleReviewsEnabled),
        showDemoCredentials: form.showDemoCredentials !== false,
        customDesignCategories: Array.isArray(form.customDesignCategories) ? form.customDesignCategories : []
      };
      await onSave(clean);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Error saving settings.');
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2>Store Settings</h2>
            <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>Configure brand information, WhatsApp ordering contact, shipping, and integrations.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saved && <span className="status live">✓ Saved</span>}
            <button type="submit" form="settings-form" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="settings-tabs-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <button
            type="button"
            className={`btn ${settingsTab === 'general' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSettingsTab('general')}
          >
            🏢 Brand & WhatsApp
          </button>
          <button
            type="button"
            className={`btn ${settingsTab === 'shipping' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSettingsTab('shipping')}
          >
            🚚 Shipping & Social
          </button>
          <button
            type="button"
            className={`btn ${settingsTab === 'reviews' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSettingsTab('reviews')}
          >
            ⭐ Reviews & Categories
          </button>
          <button
            type="button"
            className={`btn ${settingsTab === 'security' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSettingsTab('security')}
          >
            🔒 Password & Security
          </button>
        </div>
      </div>

      <form id="settings-form" className="panel-body" onSubmit={submit}>
        {error && <div className="health-error" style={{ marginBottom: 16 }}>{error}</div>}

        {settingsTab === 'general' && (
          <>
            <div className="form-section-title">1. Brand & Store Identity</div>
            <div className="form-row-3">
              <FormField label="Brand Name" required>
                <input
                  type="text"
                  maxLength={60}
                  value={form.brand || ''}
                  onChange={e => setVal('brand', e.target.value.slice(0, 60))}
                />
              </FormField>
              <FormField label="Brand Tagline">
                <input
                  type="text"
                  maxLength={100}
                  value={form.tagline || ''}
                  onChange={e => setVal('tagline', e.target.value.slice(0, 100))}
                />
              </FormField>
              <FormField label="Established Date">
                <input
                  type="text"
                  maxLength={40}
                  value={form.established || ''}
                  onChange={e => setVal('established', e.target.value.slice(0, 40))}
                />
              </FormField>
            </div>

            <FormField label="Workshop Location">
              <input
                type="text"
                maxLength={200}
                value={form.address || ''}
                onChange={e => setVal('address', e.target.value.slice(0, 200))}
                placeholder="Enter workshop address"
              />
            </FormField>

            <div className="form-section-title">2. Customer Support & WhatsApp Ordering</div>
            <div className="form-row">
              <FormField label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><WhatsAppIcon size={16} style={{ color: '#25D366' }} /> WhatsApp Number</span>} required>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={form.whatsapp || ''}
                  onKeyDown={blockNonDigits}
                  onPaste={e => {
                    e.preventDefault();
                    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                    const digits = pasted.replace(/\D/g, '').slice(0, 15);
                    setVal('whatsapp', digits);
                  }}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setVal('whatsapp', digits);
                  }}
                  placeholder="Enter WhatsApp phone number (numbers only)"
                />
              </FormField>
              <FormField label="Contact Email">
                <input
                  type="email"
                  maxLength={100}
                  value={form.email || ''}
                  onChange={e => setVal('email', e.target.value.slice(0, 100))}
                  placeholder="Enter contact email"
                />
              </FormField>
            </div>
          </>
        )}

        {settingsTab === 'shipping' && (
          <>
            <div className="form-section-title">3. Shipping & Payments</div>
            <div className="form-row">
              <FormField label="Standard Flat Shipping Fee (₹)">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={form.shipping === '' ? '' : (form.shipping ?? 80)}
                  onKeyDown={blockNonDigits}
                  onPaste={e => {
                    e.preventDefault();
                    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                    const digits = pasted.replace(/\D/g, '').slice(0, 4);
                    setVal('shipping', digits === '' ? '' : parseInt(digits, 10));
                  }}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setVal('shipping', raw === '' ? '' : parseInt(raw, 10));
                  }}
                  placeholder="0"
                />
              </FormField>
            </div>

            <FormField label="Payment Policy Terms">
              <textarea
                rows="2"
                maxLength={500}
                value={form.payment || ''}
                onChange={e => setVal('payment', e.target.value.slice(0, 500))}
              />
            </FormField>

            <div style={{ marginTop: 12 }}>
              <CheckboxCard
                label="Cash on Delivery (COD) Allowed"
                description="Since all products are custom embroidered with personal names, COD is disabled by default."
                checked={form.cod}
                onChange={v => setVal('cod', v)}
              />
            </div>

            <div className="form-section-title">4. Social Media Links</div>
            <div className="form-row">
              <FormField label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><InstagramIcon size={16} style={{ color: '#E1306C' }} /> Instagram Profile URL</span>}>
                <input
                  type="url"
                  maxLength={200}
                  value={form.instagram || ''}
                  onChange={e => setVal('instagram', e.target.value.slice(0, 200))}
                  placeholder="https://instagram.com/mazatowel"
                />
              </FormField>
              <FormField label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FacebookIcon size={16} style={{ color: '#1877F2' }} /> Facebook Page URL</span>}>
                <input
                  type="url"
                  maxLength={200}
                  value={form.facebook || ''}
                  onChange={e => setVal('facebook', e.target.value.slice(0, 200))}
                  placeholder="https://facebook.com/mazatowel"
                />
              </FormField>
            </div>
          </>
        )}

        {settingsTab === 'reviews' && (
          <>
            <div className="form-section-title">5. Google Places & Live Reviews</div>
            <FormField label="Google Place ID">
              <input
                type="text"
                maxLength={100}
                value={form.googlePlaceId || ''}
                onChange={e => setVal('googlePlaceId', e.target.value.slice(0, 100))}
                placeholder="Enter Google Place ID"
              />
            </FormField>
            <div style={{ marginTop: 12 }}>
              <CheckboxCard
                label="Enable Live Google Reviews"
                description="Requires GOOGLE_PLACES_API_KEY on the server and a valid Place ID."
                checked={form.googleReviewsEnabled}
                onChange={v => setVal('googleReviewsEnabled', v)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ minHeight: 34, padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                disabled={googleTesting}
                onClick={async () => {
                  setGoogleTesting(true);
                  setGoogleDiag(null);
                  try {
                    const res = await api('/api/google-reviews/status');
                    if (!res.configured) {
                      setGoogleDiag({ ok: false, msg: res.message });
                    } else {
                      const testRes = await api('/api/google-reviews/test');
                      setGoogleDiag({
                        ok: true,
                        msg: `Connected! Place: "${testRes.placeName || res.placeId}", Rating: ${testRes.rating || 'N/A'}★ (${testRes.userRatingCount || 0} reviews)`
                      });
                    }
                  } catch (err) {
                    setGoogleDiag({ ok: false, msg: err.message || 'Connection test failed.' });
                  } finally {
                    setGoogleTesting(false);
                  }
                }}
              >
                {googleTesting ? 'Testing Connection…' : 'Test Google Places Connection'}
              </button>
              {googleDiag && (
                <div className={`diagnostics-result ${googleDiag.ok ? 'success' : 'error'}`}>
                  {googleDiag.ok ? '✓ ' : '⚠ '}{googleDiag.msg}
                </div>
              )}
            </div>

            <div className="form-section-title">6. Customized Design Categories</div>
            <p className="muted" style={{ margin: '4px 0 12px', fontSize: 13 }}>
              Create and manage custom categories for organizing designs in your Design Library and the online order form.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', alignSelf: 'center', marginRight: 4 }}>Standard Categories:</span>
              {DEFAULT_DESIGN_CATEGORIES.map(c => (
                <span key={c} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: 'var(--soft)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
                  🔒 {c}
                </span>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Your Customized Categories:</span>
              {Array.isArray(form.customDesignCategories) && form.customDesignCategories.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {form.customDesignCategories.map(cat => (
                    <span
                      key={cat}
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 14,
                        background: '#fff',
                        border: '1.5px solid var(--teal2)',
                        color: 'var(--teal2)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      🏷 {cat}
                      <button
                        type="button"
                        title={`Remove category "${cat}"`}
                        onClick={() => {
                          const updated = form.customDesignCategories.filter(c => c !== cat);
                          setVal('customDesignCategories', updated);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#b42318',
                          fontWeight: 700,
                          fontSize: 13,
                          lineHeight: 1,
                          padding: '0 2px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>
                  No custom categories added yet. Add one below or create them on the fly in Design Library.
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, maxWidth: 460 }}>
                <input
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  placeholder="Enter category name"
                  style={{ flex: 1 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCategoryInSettings();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddCustomCategoryInSettings}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add Category
                </button>
              </div>
            </div>
          </>
        )}

        {settingsTab === 'security' && (
          <div style={{ padding: '8px 0 16px' }}>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Manage admin password, review the cryptographic audit trail, and create or restore disaster recovery backups below.
            </p>
          </div>
        )}

        {settingsTab !== 'security' && (
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className="muted" style={{ fontSize: 12 }}>Settings apply live across the store & WhatsApp checkout</span>
            {saved && <span className="status live">✓ Saved</span>}
          </div>
        )}
      </form>

      {settingsTab === 'security' && (
        <div className="panel-body" style={{ borderTop: '1px solid var(--line)', background: '#fafdfd' }}>
        {/* Section 7: Admin Security & Authentication */}
        <div className="settings-tool-box" style={{ marginTop: 0 }}>
          <div className="form-section-title" style={{ marginTop: 0 }}>7. Admin Security & Authentication Engine</div>
          <p>Cryptographic protection, brute-force rate-limiting, and credentials for administrative store control.</p>

          <div className="security-chips-row">
            <span className="security-chip active" title="Passwords hashed with scrypt and unique 16-byte random salt">
              🔐 Salted scrypt Hash (Active)
            </span>
            <span className="security-chip active" title="5 consecutive failed sign-ins locks IP for 15 minutes">
              🛡️ Brute-Force Rate Limiter (5 attempts / 15m)
            </span>
            <span className="security-chip active" title="Constant-time comparisons prevent timing side-channel attacks">
              ⏱️ Timing-Safe Comparison (Active)
            </span>
            <span className="security-chip active" title="Session cookies with HttpOnly and SameSite=Lax flags">
              🍪 HttpOnly Secure Cookies (Active)
            </span>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={form.showDemoCredentials !== false}
                onChange={e => setVal('showDemoCredentials', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--teal2)' }}
              />
              <span>Display quick-fill demo credentials on the Admin login screen</span>
            </label>
            <span className="muted" style={{ display: 'block', fontSize: 11.5, marginLeft: 26, marginTop: 4 }}>
              Enable during development or portfolio demonstration. Uncheck this box when launching in production to hide the demo password.
            </span>
          </div>

          {credError && <div className="health-error" style={{ marginBottom: 12 }}>{credError}</div>}
          {credNotice && <div className="diagnostics-result success" style={{ marginBottom: 12 }}>{credNotice}</div>}
          <div className="form-row-3">
            <FormField label="Current Password" required>
              <div className="password-field-wrap">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  maxLength={128}
                  value={credForm.currentPassword}
                  onChange={e => setCredForm(f => ({ ...f, currentPassword: e.target.value.slice(0, 128) }))}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowCurrentPassword(v => !v)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  title={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>
            <FormField label="Admin Login Email" required>
              <input
                type="email"
                maxLength={100}
                value={credForm.email}
                onChange={e => setCredForm(f => ({ ...f, email: e.target.value.slice(0, 100) }))}
                placeholder="Enter admin email"
                autoComplete="username"
              />
            </FormField>
            <FormField label="New Password">
              <div className="password-field-wrap">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  maxLength={128}
                  value={credForm.newPassword}
                  onChange={e => setCredForm(f => ({ ...f, newPassword: e.target.value.slice(0, 128) }))}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowNewPassword(v => !v)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  title={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ minHeight: 36, padding: '7px 16px', fontSize: 12, marginTop: 8 }}
            disabled={credSaving || !credForm.currentPassword}
            onClick={async () => {
              setCredError('');
              setCredNotice('');
              setCredSaving(true);
              try {
                const res = await api('/api/admin/credentials', {
                  method: 'PUT',
                  body: JSON.stringify(credForm)
                });
                setCredNotice(res.message || 'Credentials updated successfully.');
                setCredForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
                if (onNotice) onNotice('Admin credentials updated.');
                fetchAuditLogs();
              } catch (err) {
                setCredError(err.message || 'Failed to update credentials.');
              } finally {
                setCredSaving(false);
              }
            }}
          >
            {credSaving ? 'Updating Credentials…' : 'Update Sign-In Credentials'}
          </button>
        </div>

        {/* Section 8: Security Audit Trail & Activity Log */}
        <div className="settings-tool-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
            <div>
              <div className="form-section-title" style={{ marginTop: 0, marginBottom: 4 }}>8. Security Audit Trail & Activity Log</div>
              <p style={{ margin: 0 }}>Real-time activity ledger tracking sign-ins, lockouts, credential modifications, and backups.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: 34, padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              disabled={auditLoading}
              onClick={fetchAuditLogs}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: auditLoading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {auditLoading ? 'Refreshing…' : 'Refresh Logs'}
            </button>
          </div>

          {auditError && <div className="health-error" style={{ marginBottom: 12 }}>{auditError}</div>}

          <div className="audit-table-wrap">
            {auditLoading && auditLogs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading audit events…</div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No security events logged yet. Activity like logins, lockouts, and credential updates will appear here automatically.
              </div>
            ) : (
              <table className="audit-table">
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Timestamp</th>
                    <th style={{ width: 160 }}>Security Event</th>
                    <th style={{ width: 120 }}>Client IP</th>
                    <th>Activity Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 11.5 }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                          {formatRelativeTime(log.timestamp)}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'monospace' }} title={new Date(log.timestamp).toISOString()}>
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td>{getAuditBadge(log.event)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11.5 }}>
                        <code>{log.ip || '127.0.0.1'}</code>
                      </td>
                      <td style={{ color: 'var(--ink)', fontSize: 12 }}>
                        {formatAuditDetails(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>
            <span>Audit log automatically retains the last 300 security events with tamper-evident JSON records.</span>
            <span>Total records: <strong>{auditLogs.length}</strong></span>
          </div>
        </div>

        {/* Section 9: Store Data Backup & Restore */}
        <div className="settings-tool-box">
          <div className="form-section-title" style={{ marginTop: 0 }}>9. Store Data Backup & Restore</div>
          <p>Export a full JSON snapshot of your products, designs, reviews, customers, FAQs, and enquiries, or restore a backup.</p>
          {backupError && <div className="health-error" style={{ marginBottom: 12 }}>{backupError}</div>}
          {backupNotice && <div className="diagnostics-result success" style={{ marginBottom: 12 }}>{backupNotice}</div>}
          <div className="backup-grid">
            <div style={{ background: '#fff', padding: 14, borderRadius: 10, border: '1px solid var(--line)' }}>
              <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Download Backup</strong>
              <span className="muted" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>
                Save all store catalogs, enquiries, and settings to a JSON file.
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ minHeight: 34, padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={async () => {
                  try {
                    const data = await api('/api/export');
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mazatowel-store-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setBackupNotice('Backup downloaded successfully.');
                    fetchAuditLogs();
                  } catch (err) {
                    setBackupError(err.message || 'Failed to download backup.');
                  }
                }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download JSON Backup
              </button>
            </div>

            <div style={{ background: '#fff', padding: 14, borderRadius: 10, border: '1px solid var(--line)' }}>
              <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Restore From Backup</strong>
              <span className="muted" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>
                Select a previously exported MazaTowel JSON file to restore data.
              </span>
              <label
                className="btn btn-secondary"
                style={{ minHeight: 34, padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: importing ? 'wait' : 'pointer' }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {importing ? 'Restoring…' : 'Upload & Restore Backup'}
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  disabled={importing}
                  onChange={async e => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    if (!confirm(`Warning: Restoring "${file.name}" will overwrite existing store items with the backup contents. Do you want to proceed?`)) {
                      e.target.value = '';
                      return;
                    }
                    setBackupError('');
                    setBackupNotice('');
                    setImporting(true);
                    try {
                      const text = await file.text();
                      const parsed = JSON.parse(text);
                      const res = await api('/api/import', {
                        method: 'POST',
                        body: JSON.stringify(parsed)
                      });
                      setBackupNotice(res.message || 'Backup restored successfully.');
                      if (onNotice) onNotice('Store data restored from backup.');
                      fetchAuditLogs();
                      if (onRefresh) await onRefresh();
                    } catch (err) {
                      setBackupError(err.message || 'Failed to restore backup.');
                    } finally {
                      setImporting(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function StatsEditor({ stats = {}, onSave }) {
  const [towelsSold, setTowelsSold] = useState(stats.towelsSold ?? 0);
  const [designsMade, setDesignsMade] = useState(stats.designsMade ?? 0);
  const [note, setNote] = useState(stats.note || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      towelsSold: Math.max(0, Number(towelsSold) || 0),
      designsMade: Math.max(0, Number(designsMade) || 0),
      note
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Business Counts & Proof Metrics</h2>
          <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>These verified counts are displayed on the public website's statistics strip.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span className="status live">✓ Saved</span>}
          <button type="submit" form="stats-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Metrics'}
          </button>
        </div>
      </div>

      <form id="stats-form" className="panel-body" onSubmit={submit}>
        <div className="form-row">
          <FormField label="Total Towels Sold">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={7}
              value={towelsSold === '' ? '' : towelsSold}
              onKeyDown={blockNonDigits}
              onPaste={e => {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                const digits = pasted.replace(/\D/g, '').slice(0, 7);
                setTowelsSold(digits === '' ? '' : parseInt(digits, 10));
              }}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 7);
                setTowelsSold(raw === '' ? '' : parseInt(raw, 10));
              }}
            />
          </FormField>
          <FormField label="Personalized Designs Created">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={7}
              value={designsMade === '' ? '' : designsMade}
              onKeyDown={blockNonDigits}
              onPaste={e => {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                const digits = pasted.replace(/\D/g, '').slice(0, 7);
                setDesignsMade(digits === '' ? '' : parseInt(digits, 10));
              }}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 7);
                setDesignsMade(raw === '' ? '' : parseInt(raw, 10));
              }}
            />
          </FormField>
        </div>

        <FormField label="Internal Audit Note">
          <textarea
            rows="2"
            maxLength={500}
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 500))}
            placeholder="Enter internal audit note"
          />
        </FormField>

        <div className="notice" style={{ marginTop: 16 }}>
          <strong>Live Preview on Website:</strong>
          <div style={{ display: 'flex', gap: 28, marginTop: 8 }}>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal2)' }}>{Number(towelsSold || 0).toLocaleString('en-IN')}+</span>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)' }}>Towels Sold</div>
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal2)' }}>{Number(designsMade || 0).toLocaleString('en-IN')}+</span>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)' }}>Designs Made</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span className="muted" style={{ fontSize: 12 }}>Updates statistics counter on public website header & showcase</span>
          {saved && <span className="status live">✓ Saved</span>}
        </div>
      </form>
    </div>
  );
}

function ContentEditor({ content = {}, onSave }) {
  const [form, setForm] = useState({ ...content });
  const [tab, setTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setVal = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const updateWhyPoint = (idx, field, val) => {
    const list = [...(form.whyPoints || [])];
    if (!list[idx]) list[idx] = { title: '', text: '' };
    list[idx][field] = val;
    setVal('whyPoints', list);
  };

  const updateHygienePoint = (idx, field, val) => {
    const list = [...(form.hygienePoints || [])];
    if (!list[idx]) list[idx] = { title: '', text: '' };
    list[idx][field] = val;
    setVal('hygienePoints', list);
  };

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Homepage Content & Storytelling</h2>
          <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>Edit marketing copy, educational sections, and calls to action without touching code.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span className="status live">✓ Saved</span>}
          <button type="submit" form="content-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Copy'}
          </button>
        </div>
      </div>

      <div className="panel-body">
        <div className="tabs-header">
          <button type="button" className={`tab-btn ${tab === 'hero' ? 'active' : ''}`} onClick={() => setTab('hero')}>Hero Section</button>
          <button type="button" className={`tab-btn ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>About Us</button>
          <button type="button" className={`tab-btn ${tab === 'why' ? 'active' : ''}`} onClick={() => setTab('why')}>Why Personalize</button>
          <button type="button" className={`tab-btn ${tab === 'hygiene' ? 'active' : ''}`} onClick={() => setTab('hygiene')}>Hygiene Habits</button>
          <button type="button" className={`tab-btn ${tab === 'cta' ? 'active' : ''}`} onClick={() => setTab('cta')}>Final Banner</button>
        </div>

        <form id="content-form" onSubmit={submit}>
          {tab === 'hero' && (
            <div>
              <FormField label="Hero Eyebrow Badge">
                <input
                  type="text"
                  maxLength={60}
                  value={form.heroBadge || ''}
                  onChange={e => setVal('heroBadge', e.target.value.slice(0, 60))}
                />
              </FormField>
              <FormField label="Main Heading" required>
                <input
                  type="text"
                  maxLength={120}
                  value={form.heroHeading || ''}
                  onChange={e => setVal('heroHeading', e.target.value.slice(0, 120))}
                />
              </FormField>
              <FormField label="Hero Subtext">
                <textarea
                  rows="3"
                  maxLength={500}
                  value={form.heroText || ''}
                  onChange={e => setVal('heroText', e.target.value.slice(0, 500))}
                />
              </FormField>
            </div>
          )}

          {tab === 'about' && (
            <div>
              <FormField label="About Section Title">
                <input
                  type="text"
                  maxLength={120}
                  value={form.aboutTitle || ''}
                  onChange={e => setVal('aboutTitle', e.target.value.slice(0, 120))}
                />
              </FormField>
              <FormField label="About MazaTowel Story & History">
                <textarea
                  rows="4"
                  maxLength={2000}
                  value={form.aboutText || ''}
                  onChange={e => setVal('aboutText', e.target.value.slice(0, 2000))}
                />
              </FormField>
            </div>
          )}

          {tab === 'why' && (
            <div>
              <FormField label="Section Title">
                <input
                  type="text"
                  maxLength={120}
                  value={form.whyTitle || ''}
                  onChange={e => setVal('whyTitle', e.target.value.slice(0, 120))}
                />
              </FormField>
              <FormField label="Section Intro Paragraph">
                <textarea
                  rows="2"
                  maxLength={600}
                  value={form.whyText || ''}
                  onChange={e => setVal('whyText', e.target.value.slice(0, 600))}
                />
              </FormField>

              <div className="form-section-title">Value Points (4 Pillars)</div>
              <div className="points-list">
                {(form.whyPoints || []).map((point, idx) => (
                  <div key={idx} className="point-card">
                    <div className="point-head">
                      <span>Pillar #{idx + 1}</span>
                    </div>
                    <div className="form-row">
                      <FormField label="Point Title">
                        <input
                          type="text"
                          maxLength={80}
                          value={point.title || ''}
                          onChange={e => updateWhyPoint(idx, 'title', e.target.value.slice(0, 80))}
                        />
                      </FormField>
                    </div>
                    <FormField label="Point Explanation">
                      <textarea
                        rows="2"
                        maxLength={400}
                        value={point.text || ''}
                        onChange={e => updateWhyPoint(idx, 'text', e.target.value.slice(0, 400))}
                      />
                    </FormField>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'hygiene' && (
            <div>
              <FormField label="Hygiene Section Title">
                <input
                  type="text"
                  maxLength={120}
                  value={form.hygieneTitle || ''}
                  onChange={e => setVal('hygieneTitle', e.target.value.slice(0, 120))}
                />
              </FormField>
              <FormField label="Hygiene Section Intro">
                <textarea
                  rows="2"
                  maxLength={600}
                  value={form.hygieneText || ''}
                  onChange={e => setVal('hygieneText', e.target.value.slice(0, 600))}
                />
              </FormField>

              <div className="form-section-title">Care & Hygiene Guidelines</div>
              <div className="points-list">
                {(form.hygienePoints || []).map((point, idx) => (
                  <div key={idx} className="point-card">
                    <div className="point-head">
                      <span>Rule #{idx + 1}</span>
                    </div>
                    <div className="form-row">
                      <FormField label="Rule Title">
                        <input
                          type="text"
                          maxLength={80}
                          value={point.title || ''}
                          onChange={e => updateHygienePoint(idx, 'title', e.target.value.slice(0, 80))}
                        />
                      </FormField>
                    </div>
                    <FormField label="Guidance">
                      <textarea
                        rows="2"
                        maxLength={400}
                        value={point.text || ''}
                        onChange={e => updateHygienePoint(idx, 'text', e.target.value.slice(0, 400))}
                      />
                    </FormField>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <FormField label="Important Hygiene Note">
                  <textarea
                    rows="2"
                    maxLength={500}
                    value={form.hygieneNote || ''}
                    onChange={e => setVal('hygieneNote', e.target.value.slice(0, 500))}
                  />
                </FormField>
              </div>
            </div>
          )}

          {tab === 'cta' && (
            <div>
              <FormField label="Final Banner Heading">
                <input
                  type="text"
                  maxLength={120}
                  value={form.finalTitle || ''}
                  onChange={e => setVal('finalTitle', e.target.value.slice(0, 120))}
                />
              </FormField>
              <FormField label="Banner Subtitle">
                <textarea
                  rows="2"
                  maxLength={500}
                  value={form.finalText || ''}
                  onChange={e => setVal('finalText', e.target.value.slice(0, 500))}
                />
              </FormField>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className="muted" style={{ fontSize: 12 }}>Content changes reflect instantly on the public website</span>
            {saved && <span className="status live">✓ Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

function ObjectEditor({ label, value, onSave }) {
  const [text, setText] = useState(JSON.stringify(value || {}, null, 2));
  const [error, setError] = useState('');

  useEffect(() => setText(JSON.stringify(value || {}, null, 2)), [value]);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{label}</h2>
      </div>
      <form className="panel-body" onSubmit={e => {
        e.preventDefault();
        try {
          onSave(JSON.parse(text));
        } catch {
          setError('Please enter valid JSON.');
        }
      }}>
        <p className="muted">Raw data editor.</p>
        <textarea className="json-editor" value={text} onChange={e => setText(e.target.value)} spellCheck="false" />
        {error && <div className="health-error">{error}</div>}
        <button className="btn btn-primary" style={{ marginTop: 14 }}>Save {label}</button>
      </form>
    </div>
  );
}

function Details({ type, item }) {
  if (type === 'products') {
    return (
      <>
        {item.size} · {money(item.price)}
        <div className="muted">{item.desc}</div>
      </>
    );
  }
  if (type === 'colors') {
    const sizeStr = Array.isArray(item.sizes) ? item.sizes.join(', ') : (item.sizes || 'All Sizes');
    const catStr = Array.isArray(item.categories) && item.categories.length > 0 ? item.categories.join(', ') : 'All Towel Types';
    const oosStr = Array.isArray(item.outOfStockSizes) && item.outOfStockSizes.length > 0 ? item.outOfStockSizes.join(', ') : null;
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: item.hex, border: '1.5px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
          <code style={{ fontSize: 11, background: 'var(--soft)', padding: '2px 5px', borderRadius: 4 }}>{item.hex}</code>
          <span className="muted">·</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-dark)' }}>{catStr}</span>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Sizes: {sizeStr}</div>
        {oosStr && (
          <div style={{ fontSize: 11, color: '#b42318', fontWeight: 700, marginTop: 2 }}>
            Sold out in: {oosStr}
          </div>
        )}
      </>
    );
  }
  /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
  if (type === 'threads') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: item.hex || '#D4AF37', border: item.hex?.toUpperCase() === '#FFFFFF' ? '1.5px solid #CCD8D8' : '1.5px solid rgba(0,0,0,0.15)', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
          <code style={{ fontSize: 11, background: 'var(--soft)', padding: '2px 5px', borderRadius: 4 }}>{item.hex}</code>
          <span className="muted">·</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-dark)' }}>{item.finish || 'Classic'}</span>
        </div>
        {item.desc && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{item.desc}</div>}
      </>
    );
  }
  */
  if (type === 'enquiries') {
    const isShirt = isTShirtItem(item);
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            padding: '1px 7px',
            borderRadius: 8,
            background: isShirt ? '#eff6ff' : '#eaf7f6',
            color: isShirt ? '#1d4ed8' : 'var(--teal2)',
            border: isShirt ? '1px solid #bfdbfe' : '1px solid #c8e6e5'
          }}>
            {isShirt ? '👕 Custom T-Shirt' : '🏷 Towel'}
          </span>
          {isShirt && item.placement && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 8,
              background: '#fdf4ff',
              color: '#86198f',
              border: '1px solid #f5d0fe'
            }}>
              📍 {item.placement}
            </span>
          )}
        </div>
        {Array.isArray(item.embroideryNames) && item.embroideryNames.length > 1 ? (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
            {item.embroideryNames.map((nm, idx) => (
              <span key={idx} className="thread-pill" style={{ fontSize: 11, padding: '1px 7px' }}>
                #{idx + 1}: <strong>{nm}</strong>
                {item.sizesPerItem?.[idx] && <span style={{ opacity: 0.75, marginLeft: 3 }}>({item.sizesPerItem[idx]})</span>}
              </span>
            ))}
          </div>
        ) : (
          <strong>{item.embroideryName}</strong>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {item.createdAt && (
            <span
              className="relative-timestamp-chip"
              title={`Enquiry received: ${new Date(item.createdAt).toLocaleString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`}
            >
              🕒 {formatRelativeTime(item.createdAt)}
            </span>
          )}
          <span className="muted" style={{ fontSize: 11.5 }}>
            {item.phone} · {item.size} × {item.quantity}
          </span>
          {item.towelColor && (
            <span className="muted" style={{ fontSize: 11.5 }}>
              · {isShirt ? 'Garment' : 'Color'}: <strong style={{ color: 'var(--teal2)' }}>{item.towelColor}</strong>
            </span>
          )}
        </div>
        {item.notes && (
          <div className="muted" style={{ fontSize: 11, fontStyle: 'italic', marginTop: 3 }}>
            📝 "{item.notes}"
          </div>
        )}
        {item.adminNotes && (
          <div className="admin-internal-note" title="Internal production note (Admin only)">
            <span>📌</span>
            <span><strong>Internal:</strong> {item.adminNotes}</span>
          </div>
        )}

        {item.logoAttachment && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <a
              href={item.logoAttachment}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 6,
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #6ee7b7',
                textDecoration: 'none'
              }}
              title="Click to view customer attached logo or artwork in full resolution"
            >
              {/\.(png|jpe?g|webp|svg)$/i.test(item.logoAttachment) ? (
                <img
                  src={item.logoAttachment}
                  alt="Customer Logo"
                  style={{ width: 16, height: 16, objectFit: 'contain', borderRadius: 3, background: '#fff', border: '1px solid #a7f3d0' }}
                />
              ) : (
                <span>📄</span>
              )}
              <span>📎 View Logo File ↗</span>
            </a>
            <a
              href={item.logoAttachment}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: 4,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: 10,
                textDecoration: 'none'
              }}
              title="Download file to computer"
            >
              ⬇
            </a>
          </div>
        )}
      </>
    );
  }
  if (type === 'reviews') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ color: '#d97706', letterSpacing: 1.5, fontSize: 13 }}>
            {'★'.repeat(item.rating || 5)}{'☆'.repeat(Math.max(0, 5 - (item.rating || 5)))}
          </span>
          {item.date && (
            <span className="relative-timestamp-chip" title={`Review date: ${item.date}`}>
              📅 {formatRelativeTime(item.date)}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>({item.source || 'Verified Buyer'})</span>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>"{item.text}"</div>
      </>
    );
  }
  if (type === 'offers') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          {item.code ? (
            <code className="promo-code-badge" title="Promotional coupon code">
              🏷️ {item.code}
            </code>
          ) : (
            <span className="muted" style={{ fontSize: 11 }}>No promo code required</span>
          )}
          {item.discount && (
            <span className="discount-tag" title="Discount value">
              {item.discount}
            </span>
          )}
        </div>
        {item.desc && <div className="muted" style={{ fontSize: 12 }}>{item.desc}</div>}
      </>
    );
  }
  if (type === 'designs') {
    return (
      <>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--soft)', color: 'var(--teal-dark)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--line)' }}>
            🏷 {item.category || 'Uncategorized'}
          </span>
          {item.featured && <span style={{ fontSize: 10, fontWeight: 700, background: '#FFF8E6', color: '#B54708', padding: '1px 6px', borderRadius: 8, border: '1px solid #FEDF89' }}>★ Featured</span>}
        </div>
        {item.desc && <div className="muted" style={{ fontSize: 12 }}>{item.desc}</div>}
      </>
    );
  }
  return <span className="muted">{item.desc || item.description || item.a || item.tagline || item.website || item.alt || ''}</span>;
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function Pagination({
  totalItems,
  totalUnfiltered,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records'
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="pagination-wrap">
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> {itemLabel}
        {totalUnfiltered > totalItems && (
          <span className="muted" style={{ marginLeft: 6 }}>
            (filtered from {totalUnfiltered} total)
          </span>
        )}
      </div>

      <div className="pagination-controls">
        <div className="pagination-page-size">
          <label htmlFor="admin-page-size" className="muted" style={{ marginRight: 4, fontSize: 12 }}>Per page:</label>
          <select
            id="admin-page-size"
            className="page-size-select"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <nav className="pagination-nav" aria-label="Table pagination">
          <button
            type="button"
            className="pagination-btn pagination-btn-prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous page"
            aria-label="Go to previous page"
          >
            ‹ Prev
          </button>

          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className="pagination-btn pagination-btn-next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next page"
            aria-label="Go to next page"
          >
            Next ›
          </button>
        </nav>
      </div>
    </div>
  );
}

function AddDesignCategoryModal({ isOpen, onClose, onAddCategory, onAddAndCreateDesign, existingCategories = [] }) {
  const [catName, setCatName] = useState('');
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (createDesignAfter = false) => {
    const trimmed = catName.trim();
    if (!trimmed) {
      setErr('Please enter a category name.');
      return;
    }
    if (trimmed.length > 50) {
      setErr('Category name must not exceed 50 characters.');
      return;
    }

    const lower = trimmed.toLowerCase();
    const alreadyExists = (existingCategories || []).some(c => c && c.toLowerCase() === lower);

    if (alreadyExists && !createDesignAfter) {
      setErr(`Category "${trimmed}" already exists in your library.`);
      return;
    }

    setErr('');
    if (createDesignAfter) {
      onAddAndCreateDesign(trimmed);
    } else {
      onAddCategory(trimmed);
    }
    setCatName('');
    onClose();
  };

  const suggestions = [
    'Festive & Wedding',
    'Spiritual & Religious',
    'Monograms & Crests',
    'Gym & Fitness',
    'Baby Shower',
    'Zodiac & Astrology',
    'Minimalist Typography',
    'Wildlife & Nature'
  ];

  return (
    <div className="admin-modal" style={{ zIndex: 1100 }}>
      <div className="category-modal-card">
        {/* Modal Header */}
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              Add Customized Design Category
            </h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
              Create a new category for your design library
            </p>
          </div>
          <button className="icon-btn-close" type="button" onClick={onClose} title="Close" aria-label="Close modal" style={{ flexShrink: 0 }}>
            <CloseIcon size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
              <span>
                Category Name <span style={{ color: '#d9383a' }}>*</span>
              </span>
              {catName.trim() && (
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
                  {catName.trim().length}/50 chars
                </span>
              )}
            </label>
            <input
              autoFocus
              type="text"
              maxLength={50}
              value={catName}
              onChange={e => {
                setCatName(e.target.value.slice(0, 50));
                if (err) setErr('');
              }}
              placeholder="Enter category name"
              style={{
                width: '100%',
                height: 46,
                padding: '0 14px',
                borderRadius: 12,
                border: err ? '1.5px solid #d9383a' : '1.5px solid var(--line)',
                background: err ? '#fffaf9' : '#fff',
                fontSize: 14,
                color: 'var(--ink)',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                if (!err) {
                  e.target.style.borderColor = 'var(--teal2)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(47,127,130,0.12)';
                }
              }}
              onBlur={e => {
                if (!err) {
                  e.target.style.borderColor = 'var(--line)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(false);
                }
              }}
            />
            {err ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d9383a', fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                <span>⚠</span> {err}
              </div>
            ) : (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>
                This category will appear as an interactive filter tab in your store's Design Library.
              </p>
            )}
          </div>

          {/* Popular category ideas card */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#f7fafb', border: '1px solid #e2ecec', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--teal2)' }}>
                Popular Category Ideas
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
                Click to select
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {suggestions.map(sug => {
                const isSelected = catName.trim().toLowerCase() === sug.toLowerCase();
                return (
                  <button
                    key={sug}
                    type="button"
                    className={`category-idea-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setCatName(sug);
                      if (err) setErr('');
                    }}
                  >
                    <span style={{ opacity: isSelected ? 0.95 : 0.6, fontWeight: 700 }}>
                      {isSelected ? '✓' : '+'}
                    </span>
                    {sug}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with generous margins and padding */}
        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              minHeight: 42,
              padding: '0 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              background: '#fff'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit(true)}
            title="Save category and immediately open design creator with this category"
            style={{
              minHeight: 42,
              padding: '0 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--teal2)',
              border: '1px solid #bcdcdc',
              background: '#f0f7f7'
            }}
          >
            Save & Add Design
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit(false)}
            style={{
              minHeight: 42,
              padding: '0 22px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              background: 'var(--teal2)',
              color: '#ffffff',
              border: '0',
              boxShadow: '0 4px 14px rgba(47,127,130,0.28)'
            }}
          >
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
}

export const formatPhone = (phone) => {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) clean = clean.slice(2);
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.slice(1);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean.length ? `+${clean}` : '';
};

export const extractCity = (item) => {
  if (item?.city && typeof item.city === 'string' && item.city.trim()) return item.city.trim();
  if (!item?.notes || typeof item.notes !== 'string') return '';
  const match = item.notes.match(/City:\s*([^\n.,]+)/i);
  return match ? match[1].trim() : '';
};

function EnquiryRow({ item, colors = [], onEdit, onDelete, onQuickUpdate, onNotice }) {
  const isShirt = isTShirtItem(item);
  const status = item.status || 'New';
  const statusKey = status.toLowerCase().replace(/\s+/g, '');
  const city = extractCity(item);
  const isB2B = (item.notes && item.notes.includes('[B2B')) || (item.product && item.product.includes('Sample Kit'));
  const cleanPhone = String(item.phone || '').replace(/\D/g, '');
  const formattedPhone = formatPhone(item.phone);

  const colorObj = (colors || []).find(c => c.name?.toLowerCase().trim() === item.towelColor?.toLowerCase().trim());
  const colorHex = colorObj?.hex || (
    item.towelColor?.toLowerCase().includes('white') ? '#ffffff' :
    item.towelColor?.toLowerCase().includes('black') ? '#0f172a' :
    item.towelColor?.toLowerCase().includes('grey') || item.towelColor?.toLowerCase().includes('gray') ? '#64748b' :
    item.towelColor?.toLowerCase().includes('navy') || item.towelColor?.toLowerCase().includes('blue') ? '#1e3a8a' :
    '#2f7f82'
  );

  const handleCopyCourier = () => {
    const courierCity = city || 'Standard Shipping';
    const courierText = [
      `Recipient: ${item.customerName || 'Customer'}`,
      `Phone: ${formattedPhone || item.phone || ''}`,
      `Delivery Destination: ${courierCity}`,
      `Order: ${item.quantity || 1}x ${item.product || 'Towel'} (${item.size || ''})`,
      `Custom Embroidery: ${item.embroideryName || (Array.isArray(item.embroideryNames) ? item.embroideryNames.join(', ') : 'Monogram')}`,
      item.notes ? `Customer Notes: ${item.notes}` : '',
      `Order ID: #${item.id}`
    ].filter(Boolean).join('\n');

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(courierText);
    }
    if (onNotice) onNotice(`📋 Courier details for #${item.id} copied to clipboard!`);
  };

  return (
    <tr className={`enquiry-row enquiry-row-${statusKey}`}>
      {/* 1. Order & Customer */}
      <td>
        <div className="enquiry-cell-customer">
          <div className="enquiry-customer-title-row">
            <span className="enquiry-customer-name">{item.customerName || 'Customer'}</span>
            <span className="enquiry-id-chip" title={`Order ID: ${item.id}`}>
              #{item.id?.slice(-8) || item.id}
            </span>
          </div>

          <div className="enquiry-phone-row">
            {formattedPhone ? (
              <a href={`tel:${cleanPhone}`} className="enquiry-phone-link" title="Click to call customer">
                <span>📞</span>
                <span>{formattedPhone}</span>
              </a>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>No phone</span>
            )}
            {city && (
              <span className="enquiry-city-pill" title={`Delivery City: ${city}`}>
                <span>📍</span>
                <span>{city}</span>
              </span>
            )}
            {isB2B && (
              <span className="enquiry-b2b-pill" title="Commercial Sample Kit Request">
                🏢 B2B
              </span>
            )}
          </div>

          <div className="enquiry-meta-row">
            {item.createdAt && (
              <span
                className="relative-timestamp-chip"
                title={`Created: ${new Date(item.createdAt).toLocaleString('en-IN')}`}
              >
                🕒 {formatRelativeTime(item.createdAt)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 2. Product & Garment */}
      <td>
        <div className="enquiry-cell-product">
          <div className="enquiry-prod-name">{item.product || (isShirt ? 'Custom T-Shirt' : 'Personalized Towel')}</div>

          <div className="enquiry-prod-meta-line">
            <span className={`enquiry-type-badge ${isShirt ? 'tshirt' : 'towel'}`}>
              {isShirt ? '👕 Apparel' : '🏷️ Towel'}
            </span>
            {item.size && (
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                📏 {item.size}
              </span>
            )}
            <span className={`enquiry-qty-tag ${(Number(item.quantity) || 1) >= 3 ? 'bulk' : ''}`}>
              {(Number(item.quantity) || 1) >= 3 ? `💎 ${item.quantity} pcs` : `Qty: ${item.quantity || 1}`}
            </span>
            {item.towelColor && (
              <span className="enquiry-color-line" title={`Color: ${item.towelColor}`}>
                <span
                  className="enquiry-color-swatch-dot"
                  style={{
                    backgroundColor: colorHex,
                    border: colorHex?.toLowerCase() === '#ffffff' ? '1.5px solid #cbd5e1' : '1px solid rgba(0,0,0,0.18)'
                  }}
                />
                <span>{item.towelColor}</span>
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 3. Personalization & Embroidery */}
      <td>
        <div className="enquiry-cell-embroidery">
          {Array.isArray(item.embroideryNames) && item.embroideryNames.length > 1 ? (
            <div className="enquiry-multi-names-container">
              {item.embroideryNames.map((nm, idx) => (
                <span key={idx} className="enquiry-multi-name-item" title={`Item #${idx + 1} personalization`}>
                  <span style={{ opacity: 0.7 }}>#{idx + 1}</span>
                  <strong>"{nm}"</strong>
                  {item.sizesPerItem?.[idx] && <span className="size-tag">({item.sizesPerItem[idx]})</span>}
                </span>
              ))}
            </div>
          ) : (
            <div className="enquiry-stitched-card" title="Name to embroider">
              <span>🧵</span>
              <span>"{item.embroideryName || 'Custom Monogram'}"</span>
            </div>
          )}

          {item.placement && (
            <div className="enquiry-placement-pill" title="Embroidery placement position">
              <span>📍</span>
              <span>{item.placement}</span>
            </div>
          )}

          {item.logoAttachment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <a
                href={item.logoAttachment}
                target="_blank"
                rel="noreferrer"
                className="enquiry-logo-button"
                title="View customer logo / artwork file"
              >
                {/\.(png|jpe?g|webp|svg)$/i.test(item.logoAttachment) ? (
                  <img
                    src={item.logoAttachment}
                    alt="Logo"
                    style={{ width: 15, height: 15, objectFit: 'contain', borderRadius: 3, background: '#fff' }}
                  />
                ) : (
                  <span>📄</span>
                )}
                <span>View Logo ↗</span>
              </a>
              <a href={item.logoAttachment} download className="btn-copy-sm" style={{ padding: '1px 5px', fontSize: 10 }} title="Download logo file to computer">
                ⬇
              </a>
            </div>
          )}

          {item.notes && (
            <div className="enquiry-note-callout" title={item.notes}>
              💬 {item.notes}
            </div>
          )}

          {item.adminNotes && (
            <div className="enquiry-workshop-note" title={item.adminNotes}>
              📌 <strong>Workshop:</strong> {item.adminNotes}
            </div>
          )}
        </div>
      </td>

      {/* 4. Status Selector */}
      <td>
        <div className="enquiry-status-group">
          <select
            className={`enquiry-status-select status-${statusKey}`}
            value={status}
            onChange={(e) => onQuickUpdate('enquiries', item.id, { status: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            title="Click to update workflow status"
          >
            <option value="New">🔴 New</option>
            <option value="Contacted">📞 Contacted</option>
            <option value="In Production">🟡 In Production</option>
            <option value="Shipped">🚚 Shipped</option>
            <option value="Closed">⚪ Closed</option>
          </select>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
            {status === 'New'
              ? '⚡ Needs response'
              : status === 'In Production'
              ? '🧵 At machines'
              : status === 'Shipped'
              ? '📦 Dispatched'
              : status === 'Contacted'
              ? '💬 Quoted'
              : '✔️ Completed'}
          </span>
        </div>
      </td>

      {/* 5. Action Toolbar */}
      <td className="enquiry-actions-col">
        <div className="enquiry-actions-toolbar">
          {item.phone && (
            <a
              href={getWhatsAppConfirmLink(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-btn-whatsapp"
              title={`Open WhatsApp chat with ${item.customerName || 'customer'} with prefilled order confirmation`}
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon size={15} />
            </a>
          )}
          <button
            type="button"
            className="action-btn action-btn-courier"
            title="Copy complete packaging & courier label details to clipboard"
            onClick={handleCopyCourier}
            aria-label="Copy courier details"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            type="button"
            className="action-btn action-btn-edit"
            onClick={() => onEdit({ type: 'enquiries', item })}
            title="Edit enquiry details & workshop notes"
            aria-label="Edit enquiry"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {status !== 'Closed' && (
            <button
              type="button"
              className="action-btn action-btn-success"
              onClick={() => onQuickUpdate('enquiries', item.id, { status: 'Closed' })}
              title="Mark enquiry as Closed / Fulfilled"
              aria-label="Mark closed"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="action-btn action-btn-delete"
            onClick={() => onDelete('enquiries', item.id)}
            title="Delete enquiry"
            aria-label="Delete enquiry"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function Collection({ data, type, onEdit, onDelete, onQuickUpdate, onSaveSettings, onNotice }) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDesignCategory, setSelectedDesignCategory] = useState('All');
  const [selectedEnquiryCategory, setSelectedEnquiryCategory] = useState('All');
  const [selectedEnquiryStatus, setSelectedEnquiryStatus] = useState('All');
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const allItems = data[type] || [];

  // Reset pagination & search when collection type changes
  useEffect(() => {
    setCurrentPage(1);
    setQuery('');
    setSelectedDesignCategory('All');
    setSelectedEnquiryCategory('All');
    setSelectedEnquiryStatus('All');
    setSelectedProductCategory('All');
  }, [type]);

  const enquiryCounts = useMemo(() => {
    if (type !== 'enquiries') return { all: 0, towels: 0, tshirts: 0 };
    let towels = 0;
    let tshirts = 0;
    allItems.forEach(item => {
      if (isTShirtItem(item)) tshirts++;
      else towels++;
    });
    return { all: allItems.length, towels, tshirts };
  }, [type, allItems]);

  const enquiryStatusCounts = useMemo(() => {
    if (type !== 'enquiries') return [];
    const all = data.enquiries || [];
    const newCount = all.filter(e => (e.status || 'New').toLowerCase() === 'new').length;
    const contactedCount = all.filter(e => (e.status || '').toLowerCase() === 'contacted').length;
    const inProdCount = all.filter(e => (e.status || '').toLowerCase() === 'in production').length;
    const shippedCount = all.filter(e => (e.status || '').toLowerCase() === 'shipped').length;
    const highValCount = all.filter(e => (Number(e.quantity) || 1) >= 3).length;

    return [
      { id: 'All', label: 'All Orders', count: all.length },
      { id: 'New', label: '🔴 New', count: newCount },
      { id: 'Contacted', label: '📞 Contacted', count: contactedCount },
      { id: 'In Production', label: '🟡 In Production', count: inProdCount },
      { id: 'Shipped', label: '🚚 Shipped', count: shippedCount },
      { id: 'High Value', label: '💎 Bulk (3+ pcs)', count: highValCount }
    ];
  }, [type, data.enquiries]);


  const productCounts = useMemo(() => {
    if (type !== 'products') return { all: 0, towels: 0, tshirts: 0 };
    let towels = 0;
    let tshirts = 0;
    allItems.forEach(item => {
      if (item.category === 'Custom T-Shirts') tshirts++;
      else towels++;
    });
    return { all: allItems.length, towels, tshirts };
  }, [type, allItems]);

  const designCategoriesWithCounts = useMemo(() => {
    if (type !== 'designs') return [];
    const all = data.designs || [];
    const customList = Array.isArray(data.settings?.customDesignCategories) ? data.settings.customDesignCategories : [];
    const catSet = new Set([...DEFAULT_DESIGN_CATEGORIES, ...customList, ...all.map(d => d.category).filter(Boolean)]);
    const list = [{ name: 'All', count: all.length, isCustom: false }];
    for (const cat of catSet) {
      const count = all.filter(d => d.category === cat).length;
      list.push({
        name: cat,
        count,
        isCustom: !DEFAULT_DESIGN_CATEGORIES.includes(cat)
      });
    }
    return list;
  }, [type, data.designs, data.settings?.customDesignCategories]);

  const handleAddCategory = async (newCat) => {
    const trimmed = String(newCat || '').trim();
    if (!trimmed) return;
    const current = Array.isArray(data.settings?.customDesignCategories) ? data.settings.customDesignCategories : [];
    if (!current.includes(trimmed)) {
      const next = [...current, trimmed];
      if (typeof onSaveSettings === 'function') {
        await onSaveSettings({ ...data.settings, customDesignCategories: next });
      }
      if (typeof onNotice === 'function') {
        onNotice(`Custom category "${trimmed}" added to Design Library!`);
      }
      setSelectedDesignCategory(trimmed);
      setCurrentPage(1);
    }
  };

  const handleAddAndCreateDesign = async (newCat) => {
    await handleAddCategory(newCat);
    onEdit({ type: 'designs', item: { ...initialItem('designs'), category: newCat } });
  };

  const handleRemoveCategory = async (catToRemove) => {
    if (!window.confirm(`Remove customized category "${catToRemove}"?`)) return;
    const current = Array.isArray(data.settings?.customDesignCategories) ? data.settings.customDesignCategories : [];
    const next = current.filter(c => c !== catToRemove);
    if (typeof onSaveSettings === 'function') {
      await onSaveSettings({ ...data.settings, customDesignCategories: next });
    }
    if (typeof onNotice === 'function') {
      onNotice(`Custom category "${catToRemove}" removed.`);
    }
    if (selectedDesignCategory === catToRemove) setSelectedDesignCategory('All');
  };

  const categoryFiltered = useMemo(() => {
    if (type === 'designs' && selectedDesignCategory !== 'All') {
      return allItems.filter(item => item.category === selectedDesignCategory);
    }
    if (type === 'enquiries') {
      let filtered = allItems;
      if (selectedEnquiryCategory === 'Towels') filtered = filtered.filter(item => !isTShirtItem(item));
      if (selectedEnquiryCategory === 'T-Shirts') filtered = filtered.filter(item => isTShirtItem(item));
      if (selectedEnquiryStatus !== 'All') {
        if (selectedEnquiryStatus === 'High Value') {
          filtered = filtered.filter(item => (Number(item.quantity) || 1) >= 3);
        } else {
          filtered = filtered.filter(item => (item.status || 'New').toLowerCase() === selectedEnquiryStatus.toLowerCase());
        }
      }
      return filtered;
    }
    if (type === 'products') {
      if (selectedProductCategory === 'Towels') return allItems.filter(item => item.category !== 'Custom T-Shirts');
      if (selectedProductCategory === 'T-Shirts') return allItems.filter(item => item.category === 'Custom T-Shirts');
    }
    return allItems;
  }, [type, allItems, selectedDesignCategory, selectedEnquiryCategory, selectedEnquiryStatus, selectedProductCategory]);


  const items = query.trim()
    ? categoryFiltered.filter(item => {
        const str = JSON.stringify(item).toLowerCase();
        return str.includes(query.toLowerCase().trim());
      })
    : categoryFiltered;

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Auto-adjust page if items are filtered or deleted beyond current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(startIndex, startIndex + pageSize);

  const handleQueryChange = (val) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val) => {
    setPageSize(val);
    setCurrentPage(1);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{TITLES[type]} ({allItems.length})</h2>
          <span className="muted" style={{ fontSize: 12 }}>Manage {TITLES[type].toLowerCase()} records</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {type === 'enquiries' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const headers = ['Order ID','Date','Customer Name','Phone','Product','Category','Towel Color','Embroidery Names','Placement','Quantity','Status','Notes','Logo Attachment URL'];
                const esc = (v) => {
                  if (v === null || v === undefined) return '""';
                  let s = String(v).replace(/"/g, '""');
                  if (/^[=+@\t\r\n-]/.test(s)) s = "'" + s;
                  return `"${s}"`;
                };
                const rows = items.map(r => [
                  esc(r.id),
                  esc(r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''),
                  esc(r.customerName || ''),
                  esc(r.phone ? `'${r.phone}` : ''),
                  esc(r.product || ''),
                  esc(isTShirtItem(r) ? 'Custom T-Shirt' : 'Personalized Towel'),
                  esc(r.towelColor || ''),
                  esc(Array.isArray(r.embroideryNames) && r.embroideryNames.length ? r.embroideryNames.join('; ') : (r.embroideryName || '')),
                  esc(r.placement || ''),
                  esc(r.quantity || 1),
                  esc(r.status || 'New'),
                  esc(r.notes || ''),
                  esc(r.logoAttachment || '')
                ].join(','));
                const blob = new Blob(["\uFEFF" + [headers.join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mazatowel-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (onNotice) onNotice(`Exported ${items.length} enquiries to CSV.`);
              }}
              title="Export filtered enquiries to CSV"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>📥</span> Export CSV ({items.length})
            </button>
          )}
          {type === 'designs' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddCategoryModal(true)}
              title="Add Customized Category"
              aria-label="Add Customized Category"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              + Add Category
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onEdit({ type, item: initialItem(type) })}
            title={`Add ${singular(type)}`}
            aria-label={`Add new ${singular(type).toLowerCase()}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add {singular(type)}
          </button>
        </div>
      </div>
      <div className="panel-body">
        {type === 'designs' && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginRight: 4 }}>Categories:</span>
            {designCategoriesWithCounts.map(cat => {
              const active = selectedDesignCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setSelectedDesignCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    background: active ? 'var(--teal2)' : 'var(--soft)',
                    color: active ? '#ffffff' : 'var(--ink)',
                    border: active ? '1px solid var(--teal2)' : '1px solid var(--line)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.name}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 10,
                    background: active ? 'rgba(255,255,255,0.25)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--muted)',
                    fontWeight: 700
                  }}>
                    {cat.count}
                  </span>
                  {cat.isCustom && cat.count === 0 && (
                    <button
                      type="button"
                      title={`Remove unused custom category "${cat.name}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(cat.name);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: active ? '#fff' : '#b42318',
                        padding: '0 2px',
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddCategoryModal(true)}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              + New Category
            </button>
          </div>
        )}
        {type === 'enquiries' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginRight: 4 }}>Product Type:</span>
              {[
                { id: 'All', label: 'All Enquiries', count: enquiryCounts.all },
                { id: 'Towels', label: 'Towels', count: enquiryCounts.towels, icon: '🏷' },
                { id: 'T-Shirts', label: 'T-Shirts & Apparel', count: enquiryCounts.tshirts, icon: '👕' }
              ].map(tab => {
                const active = selectedEnquiryCategory === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setSelectedEnquiryCategory(tab.id);
                      setCurrentPage(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      background: active ? 'var(--teal2)' : 'var(--soft)',
                      color: active ? '#ffffff' : 'var(--ink)',
                      border: active ? '1px solid var(--teal2)' : '1px solid var(--line)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                    <span style={{
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 10,
                      background: active ? 'rgba(255,255,255,0.25)' : '#ffffff',
                      color: active ? '#ffffff' : 'var(--muted)',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="enquiry-filter-pills" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginRight: 4 }}>Status Pipeline:</span>
              {enquiryStatusCounts.map(st => {
                const active = selectedEnquiryStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedEnquiryStatus(st.id);
                      setCurrentPage(1);
                    }}
                    className={`status-filter-pill ${active ? 'active' : ''}`}
                  >
                    <span>{st.label}</span>
                    <span className="filter-pill-badge">{st.count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}


        {type === 'products' && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginRight: 4 }}>Filter Catalog:</span>
            {[
              { id: 'All', label: 'All Products', count: productCounts.all },
              { id: 'Towels', label: 'Towels', count: productCounts.towels, icon: '🏷' },
              { id: 'T-Shirts', label: 'T-Shirts & Apparel', count: productCounts.tshirts, icon: '👕' }
            ].map(tab => {
              const active = selectedProductCategory === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setSelectedProductCategory(tab.id);
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    background: active ? 'var(--teal2)' : 'var(--soft)',
                    color: active ? '#ffffff' : 'var(--ink)',
                    border: active ? '1px solid var(--teal2)' : '1px solid var(--line)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 10,
                    background: active ? 'rgba(255,255,255,0.25)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--muted)',
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="table-toolbar">
          <div className="table-search-wrap">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="table-search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder={`Search ${TITLES[type].toLowerCase()}…`}
              aria-label={`Search ${TITLES[type].toLowerCase()}`}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => handleQueryChange('')}
                title="Clear search"
                aria-label="Clear search query"
              >
                <CloseIcon size={12} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>

        {type === 'enquiries' ? (
          <div className="enquiries-table-wrap">
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '22%', minWidth: 190 }}>Order & Customer</th>
                  <th style={{ width: '21%', minWidth: 180 }}>Product & Garment</th>
                  <th style={{ width: '27%', minWidth: 230 }}>Embroidery & Specs</th>
                  <th style={{ width: '14%', minWidth: 140 }}>Status</th>
                  <th className="enquiry-actions-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map(item => (
                  <EnquiryRow
                    key={item.id}
                    item={item}
                    colors={data.colors || []}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onQuickUpdate={onQuickUpdate}
                    onNotice={onNotice}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['products', 'colors', /* 'threads', -- THREADS PAUSED */ 'designs', 'gallery', 'customers'].includes(type) && <th style={{ width: 68 }}>Photo</th>}
                <th>Item</th>
                <th>Details</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id}>
                  {['products', 'colors', /* 'threads', -- THREADS PAUSED */ 'designs', 'gallery', 'customers'].includes(type) && (
                    <td>
                      {item.image ? (
                        <div className="thumb">
                          <img src={item.image} alt={item.name || 'Preview'} />
                        </div>
                      /* THREADS FEATURE PAUSED:
                      ) : type === 'threads' && item.hex ? (
                        <div className="thumb" style={{ display: 'grid', placeItems: 'center', background: '#f8fcfc' }}>
                          <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: item.hex, border: item.hex?.toUpperCase() === '#FFFFFF' ? '1.5px solid #CCD8D8' : '1.5px solid rgba(0,0,0,0.15)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                        </div>
                      */
                      ) : (
                        <div className="thumb" style={{ display: 'grid', placeItems: 'center', fontSize: 18, color: 'var(--muted)' }}>
                          🏷
                        </div>
                      )}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <strong>{item.name || item.title || item.q || item.customerName || item.alt || item.id}</strong>
                      {type === 'enquiries' && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: isTShirtItem(item) ? '#eff6ff' : '#eaf7f6',
                          color: isTShirtItem(item) ? '#1d4ed8' : 'var(--teal2)',
                          border: isTShirtItem(item) ? '1px solid #bfdbfe' : '1px solid #c8e6e5'
                        }}>
                          {isTShirtItem(item) ? '👕 T-Shirt' : '🏷 Towel'}
                        </span>
                      )}
                      {type === 'products' && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: item.category === 'Custom T-Shirts' ? '#eff6ff' : '#eaf7f6',
                          color: item.category === 'Custom T-Shirts' ? '#1d4ed8' : 'var(--teal2)',
                          border: item.category === 'Custom T-Shirts' ? '1px solid #bfdbfe' : '1px solid #c8e6e5'
                        }}>
                          {item.category === 'Custom T-Shirts' ? '👕 T-Shirt' : '🏷 Towel'}
                        </span>
                      )}
                    </div>
                    <div className="muted">{item.designId || item.product || item.category || item.source || ''}</div>
                  </td>
                  <td><Details type={type} item={item} /></td>
                  <td>
                    {type === 'colors' /* || type === 'threads' */ ? (
                      <div>
                        <button
                          type="button"
                          className={`status-toggle-btn ${item.inStock !== false ? 'live' : 'danger'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdate(type, item.id, { inStock: item.inStock === false });
                          }}
                          title={item.inStock !== false ? 'In Stock — click to mark Out of Stock' : 'Out of Stock — click to mark In Stock'}
                          aria-label={item.inStock !== false ? `Mark ${item.name} out of stock` : `Mark ${item.name} in stock`}
                        >
                          <span className="status-dot" aria-hidden="true" />
                          <span>{item.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                          <span className="status-toggle-icon" aria-hidden="true">⇄</span>
                        </button>
                        {type === 'colors' && item.inStock !== false && Array.isArray(item.outOfStockSizes) && item.outOfStockSizes.length > 0 && (
                          <div style={{ fontSize: 10, color: '#b42318', marginTop: 3, fontWeight: 700 }}>
                            Sold out in {item.outOfStockSizes.length} size{item.outOfStockSizes.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ) : type === 'offers' ? (
                      <button
                        type="button"
                        className={`status-toggle-btn ${item.active ? 'live' : 'off'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickUpdate(type, item.id, { active: !item.active });
                        }}
                        title={item.active ? 'Active — click to set Inactive' : 'Inactive — click to set Active'}
                        aria-label={item.active ? `Deactivate offer ${item.title || ''}` : `Activate offer ${item.title || ''}`}
                      >
                        <span className="status-dot" aria-hidden="true" />
                        <span>{item.active ? 'Active' : 'Inactive'}</span>
                        <span className="status-toggle-icon" aria-hidden="true">⇄</span>
                      </button>
                    ) : type === 'enquiries' ? (
                      <select
                        className={`status-select ${item.status === 'Closed' ? 'off' : item.status === 'In Production' ? 'live' : item.status === 'Shipped' ? 'shipped' : item.status === 'Contacted' ? 'contacted' : 'pending'}`}
                        value={item.status || 'New'}
                        onChange={(e) => onQuickUpdate(type, item.id, { status: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        title="Click to update order status directly"
                        aria-label="Order status"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Production">In Production</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      <button
                        type="button"
                        className={`status-toggle-btn ${item.published !== false ? 'live' : 'off'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickUpdate(type, item.id, { published: item.published === false });
                        }}
                        title={item.published !== false ? 'Published on website — click to Hide' : 'Hidden from website — click to Publish'}
                        aria-label={item.published !== false ? `Hide ${item.name || item.title || item.q || singular(type)} from website` : `Publish ${item.name || item.title || item.q || singular(type)} to website`}
                      >
                        <span className="status-dot" aria-hidden="true" />
                        <span>{item.published !== false ? 'Published' : 'Hidden'}</span>
                        <span className="status-toggle-icon" aria-hidden="true">⇄</span>
                      </button>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="action-btn action-btn-edit"
                        onClick={() => onEdit({ type, item })}
                        title="Edit"
                        aria-label={`Edit ${item.name || item.title || item.q || singular(type)}`}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {['products', 'designs', 'gallery', 'reviews', 'faqs', 'customers'].includes(type) && (
                        <button
                          type="button"
                          className={`action-btn ${item.published !== false ? 'action-btn-visibility' : 'action-btn-hidden'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdate(type, item.id, { published: item.published === false });
                          }}
                          title={item.published !== false ? 'Hide from website' : 'Publish to website'}
                          aria-label={item.published !== false ? `Hide ${item.name || item.title || item.q || singular(type)}` : `Publish ${item.name || item.title || item.q || singular(type)}`}
                        >
                          {item.published !== false ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                      )}
                      {type === 'offers' && (
                        <button
                          type="button"
                          className={`action-btn ${item.active ? 'action-btn-success' : 'action-btn-delete'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdate(type, item.id, { active: !item.active });
                          }}
                          title={item.active ? 'Deactivate Offer' : 'Activate Offer'}
                          aria-label={item.active ? 'Deactivate offer' : 'Activate offer'}
                        >
                          {item.active ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          )}
                        </button>
                      )}
                      {(type === 'colors' /* || type === 'threads' */) && (
                        <button
                          type="button"
                          className={`action-btn ${item.inStock !== false ? 'action-btn-delete' : 'action-btn-success'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdate(type, item.id, { inStock: item.inStock === false });
                          }}
                          title={item.inStock !== false ? 'Disable / Mark Out of Stock' : 'Enable / Mark In Stock'}
                          aria-label={item.inStock !== false ? `Disable ${item.name} stock` : `Enable ${item.name} stock`}
                        >
                          {item.inStock !== false ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </button>
                      )}
                      {type === 'enquiries' && item.phone && (
                        <a
                          href={getWhatsAppConfirmLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn action-btn-whatsapp"
                          title="Chat on WhatsApp"
                          aria-label={`Chat with ${item.customerName || 'customer'} on WhatsApp`}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 17.07c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.3c0-4.51 3.67-8.19 8.19-8.19 2.19 0 4.25.85 5.8 2.4 1.55 1.55 2.4 3.61 2.4 5.8 0 4.52-3.67 8.2-8.24 8.2zm4.51-6.14c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.09s.9 2.43 1.03 2.6c.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.46-.3z" />
                          </svg>
                        </a>
                      )}
                      {type === 'enquiries' && (
                        <button
                          type="button"
                          className="action-btn action-btn-courier"
                          title="Copy shipping & courier label details"
                          aria-label={`Copy courier details for #${item.id}`}
                          onClick={() => {
                            const courierText = [
                              `Recipient: ${item.customerName || 'Customer'}`,
                              `Phone: +91 ${item.phone || ''}`,
                              `Delivery City: ${item.city || 'Standard Shipping'}`,
                              `Order: ${item.quantity || 1}x ${item.product || 'Towel'} (${item.size || ''})`,
                              `Custom Embroidery: ${item.embroideryName || (Array.isArray(item.embroideryNames) ? item.embroideryNames.join(', ') : 'Monogram')}`,
                              item.notes ? `Customer Notes: ${item.notes}` : '',
                              `Order ID: #${item.id}`
                            ].filter(Boolean).join('\n');
                            if (navigator.clipboard?.writeText) {
                              navigator.clipboard.writeText(courierText);
                            }
                            if (onNotice) onNotice(`📋 Courier details for #${item.id} copied to clipboard!`);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      )}

                      {type === 'enquiries' && item.status !== 'Closed' && (
                        <button
                          type="button"
                          className="action-btn action-btn-success"
                          onClick={() => onQuickUpdate(type, item.id, { status: 'Closed' })}
                          title="Close"
                          aria-label="Mark enquiry as Closed"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-btn action-btn-delete"
                        onClick={() => onDelete(type, item.id)}
                        title="Delete"
                        aria-label={`Delete ${item.name || item.title || item.q || singular(type)}`}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!items.length && (
        <div className="empty">
          {query ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                No {TITLES[type]?.toLowerCase() || 'items'} matching "{query}"
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                {type === 'enquiries'
                  ? 'Try searching with a customer name, mobile number, embroidery text, or order code.'
                  : type === 'designs'
                  ? 'Try searching by motif theme, design code (e.g. MT-101), or title.'
                  : type === 'products'
                  ? 'Try searching by product name, towel size (e.g. 30 × 60), or category.'
                  : 'Try checking for spelling mistakes or clear your search filter.'}
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                No {TITLES[type]?.toLowerCase() || 'items'} recorded yet
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                {type === 'enquiries'
                  ? 'Customer custom embroidery requests and orders will appear here automatically when submitted from your website.'
                  : type === 'products'
                  ? 'Click "+ Add Product" to publish your first personalized towel or custom apparel listing.'
                  : type === 'colors'
                  ? 'Click "+ Add Towel Color" to configure your luxury Egyptian cotton fabric palette.'
                  : type === 'designs'
                  ? 'Click "+ Add Design" to populate your interactive embroidery motif catalog.'
                  : type === 'offers'
                  ? 'Click "+ Add Offer" to activate festive discounts and promotional promo codes.'
                  : type === 'reviews'
                  ? 'Click "+ Add Review" to showcase verified client ratings and endorsements.'
                  : type === 'gallery'
                  ? 'Click "+ Add Photo" to display completed towel atelier craftsmanship.'
                  : type === 'customers'
                  ? 'Click "+ Add Customer" to highlight partner hotels and corporate buyers.'
                  : `Click "+ Add ${singular(type)}" to create your first entry.`}
              </p>
            </>
          )}
        </div>
      )}

        <Pagination
          totalItems={items.length}
          totalUnfiltered={allItems.length}
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          itemLabel={items.length === 1 ? singular(type).toLowerCase() : (TITLES[type]?.toLowerCase() || 'items')}
        />
      </div>

      {showAddCategoryModal && (
        <AddDesignCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onAddCategory={handleAddCategory}
          onAddAndCreateDesign={handleAddAndCreateDesign}
          existingCategories={designCategoriesWithCounts.map(c => c.name).filter(n => n !== 'All')}
        />
      )}
    </div>
  );
}

function VisitorAnalyticsCard({ visitors, initialRealtime }) {
  const [period, setPeriod] = useState('daily');
  const [chartType, setChartType] = useState('area');
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const [realtime, setRealtime] = useState(initialRealtime || visitors?.realtime || {
    activeNow: 0,
    sections: {},
    devices: { Mobile: 0, Desktop: 0 },
    recentActivity: []
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (initialRealtime) setRealtime(initialRealtime);
  }, [initialRealtime]);

  useEffect(() => {
    if (!autoRefresh) return;
    const poll = async () => {
      try {
        const res = await api('/api/realtime/active');
        if (res && res.activeNow !== undefined) {
          setRealtime(res);
        }
      } catch {}
    };
    const timer = setInterval(poll, 4000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const formatRelative = formatRelativeTime;

  const summary = visitors?.summary || {};
  const currentSeries = useMemo(() => {
    if (!visitors) return [];
    if (period === 'daily') return visitors.daily || [];
    if (period === 'weekly') return visitors.weekly || [];
    if (period === 'monthly') return visitors.monthly || [];
    if (period === 'yearly') return visitors.yearly || [];
    return visitors.daily || [];
  }, [visitors, period]);

  const chart = useMemo(() => {
    const dataPts = currentSeries.length > 0 ? currentSeries : [{ label: 'Today', count: 0 }];
    const W = 760;
    const H = 220;
    const padTop = 26;
    const padBottom = 34;
    const padLeft = 44;
    const padRight = 24;

    const maxVal = Math.max(...dataPts.map(d => d.count), 10);
    const chartWidth = W - padLeft - padRight;
    const chartHeight = H - padTop - padBottom;

    const pts = dataPts.map((d, i) => {
      const x = dataPts.length === 1
        ? padLeft + chartWidth / 2
        : padLeft + (i / (dataPts.length - 1)) * chartWidth;
      const y = H - padBottom - (d.count / maxVal) * chartHeight;
      return { ...d, x, y };
    });

    let linePath = '';
    let areaPath = '';
    if (pts.length > 0) {
      linePath = `M ${pts[0].x} ${pts[0].y}` + pts.slice(1).map(p => ` L ${p.x} ${p.y}`).join('');
      areaPath = `M ${pts[0].x} ${H - padBottom} L ${pts[0].x} ${pts[0].y}` +
        pts.slice(1).map(p => ` L ${p.x} ${p.y}`).join('') +
        ` L ${pts[pts.length - 1].x} ${H - padBottom} Z`;
    }

    const gridLines = [
      { val: maxVal, y: padTop },
      { val: Math.round(maxVal * 0.66), y: padTop + chartHeight * 0.34 },
      { val: Math.round(maxVal * 0.33), y: padTop + chartHeight * 0.67 },
      { val: 0, y: H - padBottom }
    ];

    const totalCount = dataPts.reduce((acc, d) => acc + d.count, 0);
    const avgCount = Math.round(totalCount / dataPts.length);
    const peakPoint = dataPts.reduce((max, d) => (d.count > (max?.count || 0) ? d : max), dataPts[0]);

    return { W, H, pts, linePath, areaPath, gridLines, chartWidth, chartHeight, padTop, padBottom, padLeft, padRight, maxVal, totalCount, avgCount, peakPoint };
  }, [currentSeries]);

  const periodLabels = {
    daily: 'Daily Traffic Breakdown (Last 30 Days)',
    weekly: 'Weekly Aggregated Traffic (Last 12 Weeks)',
    monthly: 'Monthly Performance (Last 12 Months)',
    yearly: 'Year-on-Year Growth (2023 - 2026)'
  };

  return (
    <div className="dash-visitor-card" id="card-visitor-analytics">
      {/* REAL-TIME LIVE TRAFFIC RADAR */}
      <div className="dash-realtime-card">
        <div className="dash-realtime-head">
          <div className="realtime-live-badge-wrap">
            <span className="live-pulse-indicator" />
            <div>
              <span className="realtime-live-heading">Real-Time Active Visitors</span>
              <span className="realtime-live-sub">Live sliding window · Active shopper heartbeat</span>
            </div>
          </div>
          <div className="realtime-stream-ctrls">
            <span className="realtime-polling-badge">
              {autoRefresh ? '● Live Radar Active' : '⏸ Radar Paused'}
            </span>
            <button
              type="button"
              className="realtime-toggle-btn"
              onClick={() => setAutoRefresh(v => !v)}
              title={autoRefresh ? 'Pause live radar polling' : 'Resume live radar polling'}
            >
              {autoRefresh ? 'Pause Sync' : 'Resume Sync'}
            </button>
          </div>
        </div>

        <div className="dash-realtime-grid">
          {/* Active Count KPI */}
          <div className="realtime-kpi-box">
            <div className="realtime-count-num">
              <span className="big-num">{realtime?.activeNow ?? 0}</span>
              <span className="count-label">Shoppers Active Right Now</span>
            </div>
            <div className="realtime-device-ratio">
              <span>📱 Mobile: <strong>{realtime?.devices?.Mobile || 0}</strong></span>
              <span className="ratio-sep">·</span>
              <span>💻 Desktop: <strong>{realtime?.devices?.Desktop || 0}</strong></span>
            </div>
          </div>

          {/* Active Sections Hotspots */}
          <div className="realtime-hotspots-box">
            <div className="realtime-subhead">Current Browsing Hotspots</div>
            <div className="realtime-hotspots-pills">
              {Object.entries(realtime?.sections || {}).length > 0 ? (
                Object.entries(realtime.sections).map(([sec, count]) => (
                  <span key={sec} className="realtime-hotspot-pill">
                    <span className="hotspot-dot" />
                    <span className="hotspot-name">{sec}</span>
                    <strong className="hotspot-count">{count}</strong>
                  </span>
                ))
              ) : (
                <span className="realtime-hotspot-pill">
                  <span className="hotspot-dot" />
                  <span className="hotspot-name">Home Storefront</span>
                  <strong className="hotspot-count">{realtime?.activeNow ?? 0}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="realtime-stream-box">
            <div className="realtime-subhead">Live Activity Stream</div>
            <div className="realtime-activity-stream">
              {(realtime?.recentActivity || []).length > 0 ? (
                realtime.recentActivity.slice(0, 4).map((act, i) => (
                  <div key={act.id || i} className="realtime-stream-item">
                    <span className="stream-dot" />
                    <span className="stream-type">{act.type}</span>
                    <span className="stream-section">({act.section})</span>
                    <span className="stream-device">· {act.device}</span>
                    <span className="stream-time">{formatRelative(act.timestamp)}</span>
                  </div>
                ))
              ) : (
                <div className="realtime-stream-empty">
                  <span>🟢 Heartbeat active · Waiting for shopper actions…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-visitor-header">
        <div className="dash-visitor-title-col">
          <div className="dash-graph-title-wrap">
            <span className="dash-graph-icon" style={{ background: '#e0f2fe', color: '#0284c7' }} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="dash-graph-title" style={{ margin: 0 }}>Website Visitor Traffic Analytics</h3>
                <span className="dash-tab-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>● Historical & Trends</span>
              </div>
              <p className="dash-graph-subtitle">{periodLabels[period]}</p>
            </div>
          </div>
        </div>

        <div className="dash-visitor-actions">
          <div className="dash-period-tabs" role="tablist" aria-label="Visitor Traffic Timeframe">
            <button
              type="button"
              className={`dash-period-btn ${period === 'daily' ? 'active' : ''}`}
              onClick={() => { setPeriod('daily'); setHoveredIdx(null); }}
            >
              📅 Daily
            </button>
            <button
              type="button"
              className={`dash-period-btn ${period === 'weekly' ? 'active' : ''}`}
              onClick={() => { setPeriod('weekly'); setHoveredIdx(null); }}
            >
              📆 Weekly
            </button>
            <button
              type="button"
              className={`dash-period-btn ${period === 'monthly' ? 'active' : ''}`}
              onClick={() => { setPeriod('monthly'); setHoveredIdx(null); }}
            >
              📊 Monthly
            </button>
            <button
              type="button"
              className={`dash-period-btn ${period === 'yearly' ? 'active' : ''}`}
              onClick={() => { setPeriod('yearly'); setHoveredIdx(null); }}
            >
              📈 Yearly
            </button>
          </div>

          <div className="dash-chart-toggle" role="group" aria-label="Chart Presentation Style">
            <button
              type="button"
              className={`dash-chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Smooth Wave Area Graph"
            >
              📈 Curve
            </button>
            <button
              type="button"
              className={`dash-chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Column Bar Chart"
            >
              📊 Bars
            </button>
          </div>
        </div>
      </div>

      <div className="dash-visitor-kpi-grid">
        <div className="dash-visitor-kpi-card">
          <div className="dash-visitor-kpi-label">Today's Visitors</div>
          <div className="dash-visitor-kpi-val">{(summary.today || 0).toLocaleString('en-IN')}</div>
          <div className={`dash-visitor-kpi-growth ${summary.dailyGrowth >= 0 ? 'pos' : 'neg'}`}>
            <span>{summary.dailyGrowth >= 0 ? '↗' : '↘'}</span>
            <span>{Math.abs(summary.dailyGrowth || 0)}% vs yesterday</span>
          </div>
        </div>

        <div className="dash-visitor-kpi-card">
          <div className="dash-visitor-kpi-label">This Week's Visitors</div>
          <div className="dash-visitor-kpi-val">{(summary.thisWeek || 0).toLocaleString('en-IN')}</div>
          <div className={`dash-visitor-kpi-growth ${summary.weeklyGrowth >= 0 ? 'pos' : 'neg'}`}>
            <span>{summary.weeklyGrowth >= 0 ? '↗' : '↘'}</span>
            <span>{Math.abs(summary.weeklyGrowth || 0)}% vs last week</span>
          </div>
        </div>

        <div className="dash-visitor-kpi-card">
          <div className="dash-visitor-kpi-label">This Month's Visitors</div>
          <div className="dash-visitor-kpi-val">{(summary.thisMonth || 0).toLocaleString('en-IN')}</div>
          <div className={`dash-visitor-kpi-growth ${summary.monthlyGrowth >= 0 ? 'pos' : 'neg'}`}>
            <span>{summary.monthlyGrowth >= 0 ? '↗' : '↘'}</span>
            <span>{Math.abs(summary.monthlyGrowth || 0)}% vs last month</span>
          </div>
        </div>

        <div className="dash-visitor-kpi-card">
          <div className="dash-visitor-kpi-label">This Year (2026)</div>
          <div className="dash-visitor-kpi-val">{(summary.thisYear || 0).toLocaleString('en-IN')}</div>
          <div className="dash-visitor-kpi-growth neutral">
            <span>✨ All-Time: {(summary.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="dash-visitor-chart-box">
        <svg className="dash-visitor-svg" viewBox={`0 0 ${chart.W} ${chart.H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="visitorAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="visitorBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="visitorBarGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#173B40" />
              <stop offset="100%" stopColor="#2F7F82" />
            </linearGradient>
          </defs>

          {chart.gridLines.map((grid, idx) => (
            <g key={idx}>
              <line
                x1={chart.padLeft}
                y1={grid.y}
                x2={chart.W - chart.padRight}
                y2={grid.y}
                stroke="#e5f0f3"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={chart.padLeft - 8}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#84999c"
                fontWeight="700"
              >
                {grid.val.toLocaleString('en-IN')}
              </text>
            </g>
          ))}

          {chartType === 'area' && (
            <>
              {chart.areaPath && <path d={chart.areaPath} fill="url(#visitorAreaGrad)" />}
              {chart.linePath && (
                <path
                  d={chart.linePath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chart.pts.map((pt, idx) => {
                const isHovered = hoveredIdx === idx;
                const showXLabel = currentSeries.length <= 14 || idx % Math.ceil(currentSeries.length / 10) === 0 || idx === currentSeries.length - 1;
                return (
                  <g
                    key={pt.date || pt.week || pt.month || pt.year || idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : 4.5}
                      fill={isHovered ? '#0284c7' : '#ffffff'}
                      stroke="#0284c7"
                      strokeWidth={isHovered ? 3.5 : 2.5}
                      style={{ transition: 'all .2s ease' }}
                    />
                    {showXLabel && (
                      <text
                        x={pt.x}
                        y={chart.H - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#768c8f"
                        fontWeight="700"
                      >
                        {pt.label}
                      </text>
                    )}
                    {isHovered && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect
                          x={Math.max(10, Math.min(chart.W - 120, pt.x - 55))}
                          y={Math.max(8, pt.y - 42)}
                          width="110"
                          height="32"
                          rx="8"
                          fill="#173B40"
                          filter="drop-shadow(0 4px 10px rgba(0,0,0,0.2))"
                        />
                        <text
                          x={Math.max(10, Math.min(chart.W - 120, pt.x - 55)) + 55}
                          y={Math.max(8, pt.y - 42) + 14}
                          textAnchor="middle"
                          fontSize="9.5"
                          fill="#b2dcdc"
                          fontWeight="600"
                        >
                          {pt.label}
                        </text>
                        <text
                          x={Math.max(10, Math.min(chart.W - 120, pt.x - 55)) + 55}
                          y={Math.max(8, pt.y - 42) + 26}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="800"
                          fill="#ffffff"
                        >
                          {pt.count.toLocaleString('en-IN')} visitors
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {chartType === 'bar' && (() => {
            const count = chart.pts.length;
            const availableW = chart.chartWidth;
            const slotW = availableW / count;
            const barW = Math.max(6, Math.min(36, slotW * 0.72));

            return chart.pts.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              const barH = (pt.count / chart.maxVal) * chart.chartHeight;
              const barX = pt.x - barW / 2;
              const barY = (chart.H - chart.padBottom) - barH;
              const showXLabel = currentSeries.length <= 14 || idx % Math.ceil(currentSeries.length / 10) === 0 || idx === currentSeries.length - 1;

              return (
                <g
                  key={pt.date || pt.week || pt.month || pt.year || idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={Math.max(3, barH)}
                    rx="5"
                    fill={isHovered ? 'url(#visitorBarGradHover)' : 'url(#visitorBarGrad)'}
                    style={{ transition: 'all .2s ease' }}
                  />
                  {showXLabel && (
                    <text
                      x={pt.x}
                      y={chart.H - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#768c8f"
                      fontWeight="700"
                    >
                      {pt.label}
                    </text>
                  )}
                  {isHovered && (
                    <g style={{ pointerEvents: 'none' }}>
                      <rect
                        x={Math.max(10, Math.min(chart.W - 120, pt.x - 55))}
                        y={Math.max(8, barY - 38)}
                        width="110"
                        height="32"
                        rx="8"
                        fill="#173B40"
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.2))"
                      />
                      <text
                        x={Math.max(10, Math.min(chart.W - 120, pt.x - 55)) + 55}
                        y={Math.max(8, barY - 38) + 14}
                        textAnchor="middle"
                        fontSize="9.5"
                        fill="#b2dcdc"
                        fontWeight="600"
                      >
                        {pt.label}
                      </text>
                      <text
                        x={Math.max(10, Math.min(chart.W - 120, pt.x - 55)) + 55}
                        y={Math.max(8, barY - 38) + 26}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        {pt.count.toLocaleString('en-IN')} visitors
                      </text>
                    </g>
                  )}
                </g>
              );
            });
          })()}
        </svg>
      </div>

      <div className="dash-visitor-footer">
        <div className="dash-visitor-foot-item">
          <span className="foot-icon">⚡</span>
          <div>
            <span className="foot-lbl">Peak Traffic Period</span>
            <strong>{chart.peakPoint?.label || 'N/A'}: {(chart.peakPoint?.count || 0).toLocaleString('en-IN')} visitors</strong>
          </div>
        </div>
        <div className="dash-visitor-foot-item">
          <span className="foot-icon">📊</span>
          <div>
            <span className="foot-lbl">Average Per {period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : period === 'monthly' ? 'Month' : 'Year'}</span>
            <strong>{chart.avgCount.toLocaleString('en-IN')} visitors / {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : period === 'monthly' ? 'mo' : 'yr'}</strong>
          </div>
        </div>
        <div className="dash-visitor-foot-item">
          <span className="foot-icon">🌐</span>
          <div>
            <span className="foot-lbl">Period Total Volume</span>
            <strong style={{ color: '#0284c7' }}>{chart.totalCount.toLocaleString('en-IN')} total visits</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data, onNavigate, onEdit, onQuickUpdate, onNotice }) {
  const products = data.products || [];
  const designs = data.designs || [];
  const reviews = data.reviews || [];
  const enquiries = data.enquiries || [];
  const stats = data.stats || {};
  const colors = data.colors || [];
  const visitors = data.visitors || {};
  const vSummary = visitors?.summary || {};

  // 100% Dynamic Real-Time Shopper Heartbeat (default 0, never mock 1)
  const [realtime, setRealtime] = useState(visitors?.realtime || {
    activeNow: 0,
    sections: {},
    devices: { Mobile: 0, Desktop: 0 },
    recentActivity: []
  });

  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await api('/api/realtime/active');
        if (res && res.activeNow !== undefined) {
          setRealtime(res);
        }
      } catch {}
    };
    const timer = setInterval(poll, 15000);
    return () => clearInterval(timer);
  }, []);

  // 100% Dynamic Visitor Metrics (Strict 0 fallback, zero mock numbers)
  const todayVisitors = Number(vSummary.today ?? 0);
  const weekVisitors = Number(vSummary.thisWeek ?? 0);
  const monthVisitors = Number(vSummary.thisMonth ?? 0);
  const totalVisitors = Number(vSummary.total ?? 0);
  const activeNow = Number(realtime?.activeNow ?? 0);

  // Pipeline breakdown
  const newEnquiries = enquiries.filter(e => !e.status || e.status === 'New');
  const contacted = enquiries.filter(e => e.status === 'Contacted');
  const inProduction = enquiries.filter(e => e.status === 'In Production');
  const shipped = enquiries.filter(e => e.status === 'Shipped');
  const closed = enquiries.filter(e => e.status === 'Closed');
  const completed = enquiries.filter(e => e.status === 'Shipped' || e.status === 'Closed');

  // Customer satisfaction
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '0.0';

  const inStockColors = colors.filter(c => c.inStock !== false);

  // Order Counts & Fulfillment
  const totalEnquiriesCount = enquiries.length;
  const fulfillmentRate = totalEnquiriesCount > 0 ? Math.round((completed.length / totalEnquiriesCount) * 100) : 0;
  const apparelCount = enquiries.filter(e => isTShirtItem(e)).length;
  const towelsCount = totalEnquiriesCount - apparelCount;

  // Pipeline stages & donut math
  const pipelineStages = [
    { key: 'New', label: 'New / Action Needed', color: '#B42318', count: newEnquiries.length },
    { key: 'Contacted', label: 'Contacted', color: '#2F7F82', count: contacted.length },
    { key: 'In Production', label: 'In Production', color: '#D5A45A', count: inProduction.length },
    { key: 'Shipped', label: 'Shipped / Fulfilled', color: '#24996B', count: shipped.length },
    { key: 'Closed', label: 'Completed / Closed', color: '#69777B', count: closed.length },
  ];

  const donutRadius = 48;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~301.59
  let donutAccumulatedPercent = 0;
  const donutSegments = pipelineStages.map(stage => {
    const fraction = totalEnquiriesCount > 0 ? stage.count / totalEnquiriesCount : 0;
    const strokeDasharray = `${fraction * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -donutAccumulatedPercent * donutCircumference;
    donutAccumulatedPercent += fraction;
    return {
      ...stage,
      fraction,
      strokeDasharray,
      strokeDashoffset,
      percent: Math.round(fraction * 100)
    };
  });

  // Design category breakdown
  const designCategoryStats = useMemo(() => {
    const catMap = {};
    designs.forEach(d => {
      const c = d.category || 'Other';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const totalDesigns = designs.length || 1;
    return Object.entries(catMap)
      .map(([category, count]) => ({
        category,
        count,
        percent: Math.round((count / totalDesigns) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [designs]);

  const getCategoryIcon = (cat) => {
    if (/name|initial/i.test(cat)) return '🔤';
    if (/kid/i.test(cat)) return '🧸';
    if (/couple|wedding/i.test(cat)) return '💍';
    if (/flower|botanic/i.test(cat)) return '🌸';
    if (/sport/i.test(cat)) return '⚽';
    if (/photo|portrait/i.test(cat)) return '🖼️';
    if (/corporate|hospitality|hotel/i.test(cat)) return '🏨';
    return '🏷️';
  };

  // Workshop & customer ratings breakdown
  const workshopHealth = useMemo(() => {
    const totalColors = colors.length || 1;
    const inStockCols = inStockColors.length;
    const colorsPct = Math.round((inStockCols / totalColors) * 100);

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const val = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      ratingCounts[val] = (ratingCounts[val] || 0) + 1;
    });

    const totalReviews = reviews.length || 1;
    const starHistogram = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingCounts[stars] || 0,
      percent: Math.round(((ratingCounts[stars] || 0) / totalReviews) * 100)
    }));

    return {
      colorsPct,
      inStockCols,
      totalColors: colors.length,
      starHistogram
    };
  }, [colors, inStockColors, reviews]);

  const [dashView, setDashView] = useState(() => {
    try {
      const saved = localStorage.getItem('mazatowel_admin_dash_view');
      if (saved === 'visitors') return 'visitors';
      return 'overview';
    } catch {
      return 'overview';
    }
  });

  const handleSetDashView = (v) => {
    setDashView(v);
    try {
      localStorage.setItem('mazatowel_admin_dash_view', v);
    } catch {}
  };

  // Device telemetry computation
  const mobileCount = Number(realtime?.devices?.Mobile ?? 0);
  const desktopCount = Number(realtime?.devices?.Desktop ?? 0);
  const totalDevices = mobileCount + desktopCount;
  const mobilePct = totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 50;
  const desktopPct = totalDevices > 0 ? 100 - mobilePct : 50;

  return (
    <>
      {/* 1. Prioritized Hero KPI Pillar Cards (4 High-Impact Pillars) */}
      <div className="slick-kpi-grid">
        {/* Pillar 1: Customer Orders & Workflow (Priority #1) */}
        <div
          className={`slick-kpi-card kpi-orders ${newEnquiries.length > 0 ? 'has-action' : ''}`}
          onClick={() => {
            onNavigate && onNavigate('enquiries');
          }}
          title="Click to view Customer Enquiries"
        >
          <div className="slick-kpi-top">
            <span className="slick-kpi-label">Customer Orders</span>
            {newEnquiries.length > 0 ? (
              <span className="slick-kpi-pill pill-alert">⚡ Action Needed</span>
            ) : (
              <span className="slick-kpi-pill pill-neutral">All caught up</span>
            )}
          </div>
          <div className="slick-kpi-val">{newEnquiries.length}</div>
          <div className="slick-kpi-sub">
            {inProduction.length} in workshop · {totalEnquiriesCount} total orders
          </div>
          <div className="slick-kpi-meter">
            <div className="slick-kpi-meter-bar">
              <div
                className="slick-kpi-meter-fill"
                style={{
                  width: `${fulfillmentRate}%`,
                  background: newEnquiries.length > 0 ? '#dc2626' : '#0ea5e9'
                }}
              />
            </div>
            <span className="slick-kpi-meter-text">
              Fulfillment: {fulfillmentRate}% ({completed.length}/{totalEnquiriesCount || 1} dispatched)
            </span>
          </div>
        </div>

        {/* Pillar 2: Live Shoppers & Traffic (Priority #2) */}
        <div
          className="slick-kpi-card kpi-traffic is-live"
          onClick={() => handleSetDashView('visitors')}
          title="Click to view Live Traffic & Deep Analytics Radar"
        >
          <div className="slick-kpi-top">
            <span className="slick-kpi-label">Live Shoppers</span>
            <span className="slick-kpi-pill pill-live">
              <span className="slick-pulse-dot" /> {activeNow} Online
            </span>
          </div>
          <div className="slick-kpi-val">{todayVisitors.toLocaleString('en-IN')}</div>
          <div className="slick-kpi-sub">
            Visits today · {monthVisitors.toLocaleString('en-IN')}/mo
          </div>
          <div className="slick-kpi-meter">
            <div className="slick-kpi-meter-bar">
              <div
                className="slick-kpi-meter-fill"
                style={{
                  width: `${Math.min(100, Math.round((todayVisitors / (weekVisitors || 1)) * 100))}%`,
                  background: '#10b981'
                }}
              />
            </div>
            <span className="slick-kpi-meter-text">
              {weekVisitors.toLocaleString('en-IN')} this week · {totalVisitors.toLocaleString('en-IN')} all-time
            </span>
          </div>
        </div>

        {/* Pillar 3: Workshop Production & Fabric Stock (Priority #3) */}
        <div
          className="slick-kpi-card kpi-stock"
          onClick={() => {
            onNavigate && onNavigate('colors');
          }}
          title="Click to view Towel Colors & Stock"
        >
          <div className="slick-kpi-top">
            <span className="slick-kpi-label">Fabric Stock</span>
            <span className="slick-kpi-pill pill-info">
              {workshopHealth.colorsPct}% In-Stock
            </span>
          </div>
          <div className="slick-kpi-val">{inStockColors.length}/{colors.length} Colors</div>
          <div className="slick-kpi-sub">
            {colors.length - inStockColors.length === 0
              ? 'Full fabric palette stocked & ready'
              : `${colors.length - inStockColors.length} color(s) out of stock`}
          </div>
          <div className="slick-kpi-meter">
            <div className="slick-kpi-meter-bar">
              <div
                className="slick-kpi-meter-fill"
                style={{
                  width: `${workshopHealth.colorsPct}%`,
                  background: workshopHealth.colorsPct >= 80 ? '#10b981' : '#d97706'
                }}
              />
            </div>
            <span className="slick-kpi-meter-text">
              Egyptian Cotton Palette: {inStockColors.length} shades ready
            </span>
          </div>
        </div>

        {/* Pillar 4: Catalog Offerings & Reputation (Priority #4) */}
        <div
          className="slick-kpi-card kpi-catalog"
          onClick={() => {
            onNavigate && onNavigate('products');
          }}
          title="Click to view Products & Catalog"
        >
          <div className="slick-kpi-top">
            <span className="slick-kpi-label">Catalog & Reviews</span>
            <span className="slick-kpi-pill pill-prod">
              {avgRating} ★ ({reviews.length})
            </span>
          </div>
          <div className="slick-kpi-val">{products.length} Products</div>
          <div className="slick-kpi-sub">
            {designs.length} motifs · {stats.towelsSold ? `${Number(stats.towelsSold).toLocaleString('en-IN')}+ towels sold` : 'Custom embroidery'}
          </div>
          <div className="slick-kpi-meter">
            <div className="slick-kpi-meter-bar">
              <div
                className="slick-kpi-meter-fill"
                style={{
                  width: `${Math.min(100, Math.round((Number(avgRating) / 5) * 100))}%`,
                  background: '#8b5cf6'
                }}
              />
            </div>
            <span className="slick-kpi-meter-text">
              {reviews.length} Verified Customer Reviews
            </span>
          </div>
        </div>
      </div>

      {/* 3. View Switcher Tabs: Overview vs Visitor Traffic */}
      <div className="dash-view-tabs-bar">
        <div className="dash-view-tabs">
          <button
            type="button"
            className={`dash-view-tab ${dashView === 'overview' ? 'active' : ''}`}
            onClick={() => handleSetDashView('overview')}
            id="btn-view-overview"
          >
            <span>📊</span>
            <span>Store Operations & Overview</span>
            
          </button>
          <button
            type="button"
            className={`dash-view-tab ${dashView === 'visitors' ? 'active' : ''}`}
            onClick={() => handleSetDashView('visitors')}
            id="btn-view-visitor-analytics"
          >
            <span>🌐</span>
            <span>Live Traffic & Deep Analytics</span>
            
          </button>
        </div>
      </div>

      {/* Dedicated Interactive Visitor Analytics View */}
      {dashView === 'visitors' && (
        <div style={{ marginBottom: 24 }}>
          <VisitorAnalyticsCard visitors={visitors} initialRealtime={realtime} />
        </div>
      )}

      {/* 4. Balanced 2x2 Operational & Business Grid (Rendered in 'overview' mode) */}
      {dashView === 'overview' && (
        <div className="dash-graphs-section" id="dash-graphs-section">
          <div className="dash-graphs-grid">
            {/* ROW 1 / CARD 1: Order Fulfillment Pipeline */}
            <div className="dash-graph-card" id="card-pipeline-funnel">
              <div className="dash-graph-header">
                <div className="dash-graph-title-wrap">
                  <span className="dash-graph-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                      <path d="M22 12A10 10 0 0 0 12 2v10z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="dash-graph-title">Order Fulfillment Pipeline</h3>
                    <p className="dash-graph-subtitle">Status progression from new lead to dispatch</p>
                  </div>
                </div>
                <span className="dash-graph-badge">{totalEnquiriesCount} Total Orders</span>
              </div>

              <div className="dash-donut-layout">
                {/* SVG Donut Chart */}
                <div className="dash-donut-svg-wrap">
                  <svg className="dash-donut-svg" viewBox="0 0 120 120" role="img" aria-label="Order pipeline donut chart">
                    <circle
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      fill="none"
                      stroke="#edf4f4"
                      strokeWidth="15"
                    />
                    {donutSegments.filter(s => s.count > 0).map(s => (
                      <circle
                        key={s.key}
                        cx="60"
                        cy="60"
                        r={donutRadius}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="15"
                        strokeDasharray={s.strokeDasharray}
                        strokeDashoffset={s.strokeDashoffset}
                        strokeLinecap="round"
                      >
                        <title>{`${s.label}: ${s.count} (${s.percent}%)`}</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="dash-donut-center">
                    <span className="dash-donut-center-val">{totalEnquiriesCount}</span>
                    <span className="dash-donut-center-lbl">Orders</span>
                  </div>
                </div>

                {/* Stage Progress Bars */}
                <div className="dash-funnel-list">
                  {pipelineStages.map(s => {
                    const pct = totalEnquiriesCount > 0 ? Math.round((s.count / totalEnquiriesCount) * 100) : 0;
                    return (
                      <div key={s.key} className="dash-funnel-item">
                        <div className="dash-funnel-meta">
                          <span className="dash-funnel-label">
                            <span className="dash-funnel-dot" style={{ background: s.color }} />
                            {s.label}
                          </span>
                          <span className="dash-funnel-val">{s.count} <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 500 }}>({pct}%)</span></span>
                        </div>
                        <div className="dash-funnel-bar-track">
                          <div
                            className="dash-funnel-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: s.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Mix Breakdown */}
              <div className="dash-category-pill-row" style={{ marginTop: 'auto' }}>
                <span className="dash-category-pill" title="Personalized Embroidered Towels">
                  🏷️ Towels: <strong>{towelsCount}</strong> ({totalEnquiriesCount ? Math.round((towelsCount / totalEnquiriesCount) * 100) : 0}%)
                </span>
                <span className="dash-category-pill" title="Custom Embroidered Apparel">
                  👕 Apparel: <strong>{apparelCount}</strong> ({totalEnquiriesCount ? Math.round((apparelCount / totalEnquiriesCount) * 100) : 0}%)
                </span>
                <button
                  type="button"
                  className="btn-copy-sm"
                  onClick={() => onNavigate && onNavigate('enquiries')}
                  title="View and filter all enquiries"
                >
                  View Pipeline →
                </button>
              </div>
            </div>

            {/* ROW 1 / CARD 2: Workshop Readiness & Fabric Stock */}
            <div className="dash-graph-card" id="card-workshop-inventory">
              <div className="dash-graph-header">
                <div className="dash-graph-title-wrap">
                  <span className="dash-graph-icon" style={{ background: '#ecfdf5', color: '#059669' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="dash-graph-title">Workshop Readiness & Colors</h3>
                    <p className="dash-graph-subtitle">Fabric stock readiness for custom embroidery</p>
                  </div>
                </div>
                <span className="dash-graph-badge" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                  {workshopHealth.colorsPct}% In-Stock
                </span>
              </div>

              {/* Stock Gauge & Info */}
              <div className="dash-gauges-row" style={{ gridTemplateColumns: '1fr' }}>
                <div
                  className="dash-gauge-box"
                  onClick={() => onNavigate && onNavigate('colors')}
                  style={{ cursor: 'pointer' }}
                  title="Click to manage Towel Colors & Stock"
                >
                  <div className="dash-gauge-svg-wrap">
                    <svg className="dash-gauge-svg" viewBox="0 0 54 54">
                      <circle
                        cx="27"
                        cy="27"
                        r="20"
                        fill="none"
                        stroke="#edf4f4"
                        strokeWidth="6"
                      />
                      <circle
                        cx="27"
                        cy="27"
                        r="20"
                        fill="none"
                        stroke="var(--teal2)"
                        strokeWidth="6"
                        strokeDasharray="125.66"
                        strokeDashoffset={125.66 * (1 - workshopHealth.colorsPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="dash-gauge-center-val">{workshopHealth.colorsPct}%</span>
                  </div>
                  <div className="dash-gauge-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="dash-gauge-title">Fabric Colors Availability</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal2)' }}>{workshopHealth.inStockCols}/{workshopHealth.totalColors} Ready</span>
                    </div>
                    <span className="dash-gauge-desc">
                      {colors.length - inStockColors.length === 0
                        ? 'All towel colors are stocked and available for custom embroidery'
                        : `${colors.length - inStockColors.length} color(s) out of stock — update inventory levels`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Towel Color Palette Chips Strip */}
              <div className="dash-swatches-strip" style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 6 }}>
                  <span className="dash-swatches-label">Live Fabric Palette ({colors.length} shades):</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Hover for color & stock</span>
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                  {colors.map(c => (
                    <span
                      key={c.name}
                      className="dash-swatch-bubble"
                      style={{
                        backgroundColor: c.hex || '#2f7f82',
                        opacity: c.inStock !== false ? 1 : 0.35,
                        border: c.inStock !== false ? '1.5px solid rgba(0,0,0,0.15)' : '1.5px dashed #dc2626'
                      }}
                      title={`${c.name}: ${c.inStock !== false ? 'In Stock' : 'Out of Stock'}`}
                      onClick={() => onNavigate && onNavigate('colors')}
                    />
                  ))}
                </div>
              </div>

              <div className="dash-category-pill-row" style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  🎨 In-stock shades display live on customer customizer.
                </span>
                <button
                  type="button"
                  className="btn-copy-sm"
                  onClick={() => onNavigate && onNavigate('colors')}
                  title="Manage fabric colors & inventory stock"
                >
                  Manage Colors →
                </button>
              </div>
            </div>

            {/* ROW 2 / CARD 1: Design Motif Themes */}
            <div className="dash-graph-card" id="card-design-distribution">
              <div className="dash-graph-header">
                <div className="dash-graph-title-wrap">
                  <span className="dash-graph-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="dash-graph-title">Design Motif Themes</h3>
                    <p className="dash-graph-subtitle">Embroidery catalog distribution across themes</p>
                  </div>
                </div>
                <span className="dash-graph-badge">{designs.length} Motifs</span>
              </div>

              <div className="dash-cat-bars-list">
                {designCategoryStats.length > 0 ? (
                  designCategoryStats.map(cat => (
                    <div
                      key={cat.category}
                      className="dash-cat-bar-item"
                      onClick={() => onNavigate && onNavigate('designs')}
                      title={`Click to view motifs in "${cat.category}"`}
                    >
                      <div className="dash-cat-bar-meta">
                        <span className="dash-cat-bar-name">
                          <span>{getCategoryIcon(cat.category)}</span>
                          <span>{cat.category}</span>
                        </span>
                        <span className="dash-cat-bar-val">
                          {cat.count} {cat.count === 1 ? 'motif' : 'motifs'} <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 500 }}>({cat.percent}%)</span>
                        </span>
                      </div>
                      <div className="dash-cat-bar-track">
                        <div
                          className="dash-cat-bar-fill"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="muted" style={{ padding: '14px 0', textAlign: 'center' }}>
                    No design motifs created yet.
                  </div>
                )}
              </div>

              <div className="dash-category-pill-row" style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  💡 Tip: Add new motifs to themes to showcase on front-end customizer.
                </span>
                <button
                  type="button"
                  className="btn-copy-sm"
                  onClick={() => onNavigate && onNavigate('designs')}
                  title="Open design library"
                >
                  View Library →
                </button>
              </div>
            </div>

            {/* ROW 2 / CARD 2: Customer Reviews & Ratings */}
            <div className="dash-graph-card" id="card-customer-sentiment">
              <div className="dash-graph-header">
                <div className="dash-graph-title-wrap">
                  <span className="dash-graph-icon" style={{ background: '#fef3c7', color: '#b45309' }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="dash-graph-title">Customer Reviews & Ratings</h3>
                    <p className="dash-graph-subtitle">Verified buyer satisfaction & feedback breakdown</p>
                  </div>
                </div>
                <span className="dash-graph-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                  {avgRating} ★ ({reviews.length} Reviews)
                </span>
              </div>

              {/* Customer Rating Histogram Breakdown */}
              <div className="dash-sentiment-wrap" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <div
                  className="dash-sentiment-score-box"
                  onClick={() => onNavigate && onNavigate('reviews')}
                  style={{ cursor: 'pointer' }}
                  title="Click to manage Reviews"
                >
                  <span className="dash-sentiment-score-num">{avgRating}</span>
                  <span className="dash-sentiment-stars">★★★★★</span>
                  <span className="dash-sentiment-total">{reviews.length} Verified</span>
                </div>

                <div className="dash-rating-bars">
                  {workshopHealth.starHistogram.map(item => (
                    <div key={item.stars} className="dash-rating-bar-row">
                      <span className="dash-rating-bar-label">{item.stars}★</span>
                      <div className="dash-rating-bar-track">
                        <div
                          className="dash-rating-bar-fill"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="dash-rating-bar-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-category-pill-row" style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  ⭐ {reviews.length ? '100% genuine customer reviews published on website.' : 'No reviews published yet.'}
                </span>
                <button
                  type="button"
                  className="btn-copy-sm"
                  onClick={() => onNavigate && onNavigate('reviews')}
                  title="Manage customer reviews"
                >
                  Manage Reviews →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Login({ onSuccess, onError, error, showDemo = true }) {
  const [email, setEmail] = useState('admin@mazatowel.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmail('admin@mazatowel.in');
    setPassword('MazaTowel123!');
  };

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await api('/api/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      await onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">
          <img className="brand-logo" src="/assets/mazatowel-logo-tight.png" alt="MazaTowel" />
        </div>
        <div className="login-kicker">Private Admin Portal</div>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Manage products, custom embroidery orders & store content.</p>

        {error && (
          <div className="health-error" style={{ marginBottom: 14 }}>
            {error}
          </div>
        )}

        <FormField label="Admin Email">
          <input
            type="email"
            maxLength={100}
            value={email}
            onChange={e => setEmail(e.target.value.slice(0, 100))}
            autoComplete="username"
            placeholder="Enter admin email"
            required
          />
        </FormField>

        <FormField label="Password">
          <div className="password-field-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              maxLength={128}
              value={password}
              onChange={e => setPassword(e.target.value.slice(0, 128))}
              autoComplete="current-password"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </FormField>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 14, minHeight: 46 }}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in to Admin'}
        </button>

        {showDemo !== false && (
          <div className="login-footer-note">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <span>Demo: <code>MazaTowel123!</code></span>
              <button
                type="button"
                className="login-demo-btn"
                onClick={fillDemo}
                title="Autofill default login credentials"
              >
                ⚡ Fill Password
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="/" className="login-back-link">
            ← Return to Store Website
          </a>
        </div>
      </form>
    </div>
  );
}

function Toast({ notice, error, onDismissNotice, onDismissError }) {
  if (!notice && !error) return null;
  const isNoticeObj = typeof notice === 'object' && notice !== null;
  const noticeMsg = isNoticeObj ? notice.text : notice;
  const undoAction = isNoticeObj ? notice.undoAction : null;

  return (
    <div className="toast-container" aria-live="polite">
      {notice && (
        <div className="toast-card toast-success" role="alert">
          <div className="toast-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="toast-body">
            <div className="toast-title">Success</div>
            <div className="toast-msg">{noticeMsg}</div>
          </div>
          {undoAction && (
            <button
              type="button"
              className="toast-undo-btn"
              onClick={() => {
                undoAction();
                onDismissNotice();
              }}
              title="Undo status change"
            >
              ↩ Undo
            </button>
          )}
          <button
            type="button"
            className="toast-close-btn"
            onClick={onDismissNotice}
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <CloseIcon size={14} strokeWidth={2.4} />
          </button>
        </div>
      )}
      {error && (
        <div className="toast-card toast-error" role="alert">
          <div className="toast-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="toast-body">
            <div className="toast-title">Notice</div>
            <div className="toast-msg">{error}</div>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={onDismissError}
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <CloseIcon size={14} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}

function getNavIcon(id) {
  switch (id) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'products':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'colors':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20" fill="currentColor" opacity="0.25" />
        </svg>
      );
    /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
    case 'threads':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      );
    */
    case 'designs':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'gallery':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case 'customers':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'reviews':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'enquiries':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'faqs':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'offers':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    case 'content':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'stats':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

function Admin() {
  const [data, setData] = useState(null);
  const [section, setSection] = useState('dashboard');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [showDemo, setShowDemo] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const prevEnquiriesCountRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [section]);

  useEffect(() => {
    if (!data?.enquiries) return;
    const currentCount = data.enquiries.length;
    if (prevEnquiriesCountRef.current !== null && currentCount > prevEnquiriesCountRef.current) {
      const latestOrder = data.enquiries[0];
      setNotice({
        text: `🔔 New order enquiry received from ${latestOrder?.customerName || 'customer'}!`,
        undoAction: null
      });
    }
    prevEnquiriesCountRef.current = currentCount;
  }, [data?.enquiries]);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mazatowel_admin_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('mazatowel_admin_theme', theme);
    } catch {}
  }, [theme]);

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false));
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('mazatowel_admin_sidebar_open');
      if (saved !== null) return saved === 'true';
    } catch {}
    return typeof window !== 'undefined' ? window.innerWidth > 900 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mazatowel_admin_sidebar_open', String(sidebarOpen));
    } catch {}
  }, [sidebarOpen]);

  // Support Ctrl+B / Cmd+B (Sidebar) and Ctrl+K / Cmd+K (Search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.table-search') || document.querySelector('.dash-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Esc key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && editing) {
        setEditing(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [editing]);

  const refresh = async () => {
    try {
      setData(await api('/api/admin-data'));
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e.message);
      setData(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const status = await api('/api/auth/status');
        if (status.showDemoCredentials !== undefined) {
          setShowDemo(status.showDemoCredentials);
        }
        if (!status.authenticated) return setData(false);
        await refresh();
      } catch (e) {
        setError(e.message);
        setData(false);
      }
    })();
  }, []);

  // Periodic interval ticker to keep relative time badges (e.g. "Just now", "2m ago") fresh and dynamic
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const duration = typeof notice === 'object' && notice.undoAction ? 6500 : 3800;
    const id = setTimeout(() => setNotice(''), duration);
    return () => clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(''), 7500);
    return () => clearTimeout(id);
  }, [error]);

  if (data === null) {
    return (
      <div className="boot">
        <div className="spinner" />
        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Loading admin…</div>
        {error && (
          <div className="form-error" style={{ marginTop: 14, maxWidth: 360, textAlign: 'center' }}>
            {error}
          </div>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
          onClick={() => setData(false)}
        >
          Go to Login Screen
        </button>
      </div>
    );
  }
  if (data === false) return <Login onSuccess={refresh} onError={setError} error={error} showDemo={showDemo} />;

  async function save(type, id, payload, customNotice) {
    try {
      setError('');
      const currentList = data?.[type] || [];
      const currentItem = id ? currentList.find(x => x.id === id) : null;
      const res = await api(id ? `/api/${type}/${id}` : `/api/${type}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      const savedItem = res?.item || { ...(currentItem || {}), ...payload, id: id || res?.id };
      setData(prev => {
        if (!prev) return prev;
        const list = prev[type] || [];
        const nextList = id
          ? list.map(item => item.id === id ? { ...item, ...savedItem } : item)
          : [savedItem, ...list];
        return { ...prev, [type]: nextList };
      });
      setEditing(null);
      setLastRefreshed(new Date());

      const sName = singular(type);
      const itemName = savedItem.name || savedItem.title || savedItem.customerName || savedItem.q || savedItem.designId || sName;

      // Smart context-relative feedback messages
      if (customNotice) {
        setNotice(customNotice);
      } else if (payload && Object.prototype.hasOwnProperty.call(payload, 'published')) {
        const isLive = payload.published !== false;
        setNotice({
          text: isLive
            ? `${sName} "${itemName}" is now published and live on the website.`
            : `${sName} "${itemName}" has been hidden from the website view.`,
          undoAction: () => save(type, id, { published: !isLive })
        });
      } else if (payload && Object.prototype.hasOwnProperty.call(payload, 'active')) {
        const isActive = Boolean(payload.active);
        setNotice({
          text: isActive
            ? `Offer "${itemName}" is now active and live on the storefront banner.`
            : `Offer "${itemName}" has been deactivated and hidden from storefront.`,
          undoAction: () => save(type, id, { active: !isActive })
        });
      } else if (payload && Object.prototype.hasOwnProperty.call(payload, 'inStock')) {
        const isInStock = payload.inStock !== false;
        setNotice({
          text: isInStock
            ? `Towel Color "${itemName}" marked In Stock for customer orders.`
            : `Towel Color "${itemName}" marked Out of Stock.`,
          undoAction: () => save(type, id, { inStock: !isInStock })
        });
      } else if (payload && Object.prototype.hasOwnProperty.call(payload, 'status') && Object.keys(payload).length <= 2) {
        setNotice({
          text: `Order #${id} (${savedItem.customerName || 'Customer'}) status updated to "${payload.status}".`,
          undoAction: currentItem?.status ? () => save(type, id, { status: currentItem.status }) : null
        });
      } else if (!id) {
        setNotice(`New ${sName} "${itemName}" created successfully.`);
      } else {
        setNotice(`${sName} "${itemName}" updated successfully.`);
      }
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }

  async function remove(type, id) {
    const sName = singular(type);
    const itemToDelete = data?.[type]?.find(x => x.id === id);
    const itemName = itemToDelete?.name || itemToDelete?.title || itemToDelete?.customerName || itemToDelete?.q || itemToDelete?.designId || sName;
    if (!confirm(`Are you sure you want to delete ${sName.toLowerCase()} "${itemName}"? This cannot be undone.`)) return;
    try {
      setError('');
      await api(`/api/${type}/${id}`, { method: 'DELETE' });
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, [type]: (prev[type] || []).filter(item => item.id !== id) };
      });
      setLastRefreshed(new Date());
      setNotice(`${sName} "${itemName}" deleted successfully.`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function updateObject(path, payload) {
    try {
      setError('');
      const res = await api(path, { method: 'PUT', body: JSON.stringify(payload) });
      const key = path === '/api/settings' ? 'settings' : path === '/api/stats' ? 'stats' : path === '/api/site-content' ? 'content' : path.replace('/api/', '');
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, [key]: res?.data || { ...(prev[key] || {}), ...payload } };
      });
      setLastRefreshed(new Date());
      const sectionName = path === '/api/settings'
        ? 'Store settings & WhatsApp configurations'
        : path === '/api/site-content'
        ? 'Homepage content & headings'
        : path === '/api/stats'
        ? 'Delivered towel counters & stats'
        : `${key[0].toUpperCase() + key.slice(1)} configuration`;
      setNotice(`${sectionName} saved successfully.`);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }

  async function logout() {
    try {
      await api('/api/logout', { method: 'POST' });
    } catch {}
    setData(false);
  }

  const nav = NAV_GROUPS.flatMap(g => g.items);

  return (
    <div className={`admin-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Mobile Backdrop - strictly rendered ONLY on small screens (<=900px) when drawer is open */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Animated Mini / Expanded Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'is-expanded' : 'is-collapsed sidebar-collapsed'}`} aria-label="Admin Navigation">
        <div className="sidebar-inner">
          <div className="brand-row">
            {sidebarOpen ? (
              <>
                <div className="brand">
                  <img className="brand-logo" src="/assets/mazatowel-logo-tight.png" alt="MazaTowel logo" />
                </div>
                <button
                  type="button"
                  className="sidebar-bars-btn is-expanded"
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse sidebar to icons (Ctrl+B)"
                  aria-label="Collapse sidebar to icons"
                >
                  <span className="three-bars-icon" aria-hidden="true">
                    <span className="bar bar-top"></span>
                    <span className="bar bar-mid"></span>
                    <span className="bar bar-bot"></span>
                  </span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="sidebar-bars-btn is-collapsed"
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <span className="three-bars-icon" aria-hidden="true">
                  <span className="bar bar-top"></span>
                  <span className="bar bar-mid"></span>
                  <span className="bar bar-bot"></span>
                </span>
              </button>
            )}
          </div>
          <div className="admin-menu">
            {NAV_GROUPS.map(group => (
              <div key={group.title} className="admin-menu-group">
                <div className="admin-menu-group-title">{group.title}</div>
                {group.items.map(id => {
                  const isActive = section === id;
                  const isEnquiry = id === 'enquiries';
                  const newCount = isEnquiry && Array.isArray(data?.enquiries)
                    ? data.enquiries.filter(e => e.status === 'New').length
                    : 0;

                  return (
                    <button
                      key={id}
                      type="button"
                      className={isActive ? 'active' : ''}
                      onClick={() => {
                        setSection(id);
                        if (isMobile) {
                          setSidebarOpen(false);
                        }
                      }}
                      title={TITLES[id]}
                      data-tooltip={TITLES[id]}
                      aria-label={TITLES[id]}
                    >
                      <span className="admin-menu-icon">{getNavIcon(id)}</span>
                      <b className="admin-menu-label">
                        <span>{TITLES[id]}</span>
                        {newCount > 0 && (
                          <span className="admin-nav-count-badge" title={`${newCount} new enquiries`}>
                            {newCount}
                          </span>
                        )}
                      </b>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="side-bottom" style={{ marginTop: 'auto' }}>
            <button
              type="button"
              className="side-bottom-btn"
              onClick={() => window.open('/', '_blank', 'noopener')}
              title="View live customer website in new tab"
              data-tooltip="View Live Website"
              aria-label="View Live Website"
            >
              <span className="admin-menu-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <b className="admin-menu-label">View Website</b>
            </button>
            <button
              type="button"
              className="side-bottom-btn side-logout-btn"
              onClick={logout}
              title="Sign out of admin panel"
              data-tooltip="Logout"
              aria-label="Logout"
            >
              <span className="admin-menu-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <b className="admin-menu-label">Logout</b>
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            {isMobile && (
              <button
                type="button"
                className="sidebar-toggle-btn mobile-toggle-btn is-closed"
                onClick={() => setSidebarOpen(v => !v)}
                title="Toggle menu"
                aria-label="Toggle menu"
              >
                <span className="three-bars-icon" aria-hidden="true">
                  <span className="bar bar-top"></span>
                  <span className="bar bar-mid"></span>
                  <span className="bar bar-bot"></span>
                </span>
              </button>
            )}
            <div>
              <div className="topbar-eyebrow">
                <span className="topbar-eyebrow-dot" />
                <span>MazaTowel Atelier · Executive Admin</span>
              </div>
              <h1 className="topbar-heading">{TITLES[section] || 'Dashboard'}</h1>
              <p className="topbar-sub">{SECTION_SUBTITLES[section] || 'Manage your products, designs, and store content.'}</p>
            </div>
          </div>
          <div className="topbar-right">
            {section !== 'dashboard' && (
              <span className="topbar-live-pill" title="Real-time shoppers active on storefront right now">
                <span className="topbar-live-dot" />
                <span>{data?.visitors?.realtime?.activeNow || 0} Online</span>
              </span>
            )}
            {lastRefreshed && (
              <span
                className="topbar-timestamp"
                title={`Data last synchronized: ${lastRefreshed.toLocaleString('en-IN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}`}
              >
                <span>🕒</span> Updated {formatRelativeTime(lastRefreshed)}
              </span>
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="topbar-btn topbar-btn-store"
              title="Open storefront in new tab"
            >
              <span>↗</span> Storefront
            </a>
            <button
              type="button"
              className="topbar-btn topbar-btn-icon theme-toggle-btn"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="topbar-btn refresh-btn"
              onClick={refresh}
              title="Refresh"
              aria-label="Refresh records and live stats"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <div className="content">
          {section === 'dashboard' ? (
            <Dashboard
              data={data}
              onNavigate={setSection}
              onEdit={setEditing}
              onQuickUpdate={save}
              onNotice={setNotice}
            />
          ) : COLLECTIONS.includes(section) ? (
            <Collection
              data={data}
              type={section}
              onEdit={setEditing}
              onDelete={remove}
              onQuickUpdate={save}
              onSaveSettings={val => updateObject('/api/settings', val)}
              onNotice={setNotice}
            />
          ) : section === 'settings' ? (
            <SettingsEditor settings={data.settings} adminEmail={data.adminEmail} onSave={val => updateObject('/api/settings', val)} onRefresh={refresh} onNotice={setNotice} />
          ) : section === 'stats' ? (
            <StatsEditor stats={data.stats} onSave={val => updateObject('/api/stats', val)} />
          ) : section === 'content' ? (
            <ContentEditor content={data.content} onSave={val => updateObject('/api/site-content', val)} />
          ) : (
            <ObjectEditor
              label={TITLES[section]}
              value={data[section]}
              onSave={value => updateObject(`/api/${section}`, value)}
            />
          )}
        </div>
      </main>
      {editing && (
        <ItemEditor
          type={editing.type}
          item={editing.item}
          data={data}
          onClose={() => setEditing(null)}
          onSave={save}
          onSaveSettings={val => updateObject('/api/settings', val)}
        />
      )}
      <Toast notice={notice} error={error} onDismissNotice={() => setNotice('')} onDismissError={() => setError('')} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Admin />);
