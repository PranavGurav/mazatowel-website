import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { api, imageFor, money, whatsapp } from './api';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import '../../public/assets/styles.css';

const generalMessage = brand => `Hello ${brand}! 👋\n\nI would like to explore personalized towels. Please help me with the available options.`;
const published = items => (items || []).filter(item => item.published !== false);

function PromoBanner({ offers }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const activeOffers = (offers || []).filter(o => o.active !== false);
  if (!activeOffers.length) return null;
  const currentOffer = activeOffers[0];

  const copyCode = (code) => {
    if (!code) return;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const input = document.createElement('input');
        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {}
  };

  return (
    <aside className="promo-banner" aria-label="Announcement">
      <div className="container promo-banner-inner">
        <span className="promo-badge">✦ {currentOffer.discount || 'Special Offer'}</span>
        <span className="promo-text">
          <strong>{currentOffer.title}:</strong> {currentOffer.desc}
        </span>
        {currentOffer.code && (
          <button
            type="button"
            className="promo-code-btn"
            onClick={() => copyCode(currentOffer.code)}
            title="Click to copy promo code"
            aria-label={`Copy promo code ${currentOffer.code}`}
          >
            <code>{currentOffer.code}</code>
            <span className="promo-copy-label">{copiedCode === currentOffer.code ? '✓ Copied!' : 'Copy Code'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}

const sellingNavLinks = [
  { name: 'Towels', sectionId: 'shop-towels' },
  { name: 'T-Shirts', sectionId: 'shop-tshirts' },
  { name: 'Sets', sectionId: 'shop-sets' },
  { name: 'Commercial', sectionId: 'shop-commercial', badge: 'Bulk' },
  { name: 'Designs', sectionId: 'shop-designs' },
  { name: 'Studio', sectionId: 'shop-studio', badge: 'Order' },
];

const infoNavLinks = [
  { name: 'Hygiene', sectionId: 'hygiene', badge: 'Clean' },
  { name: 'Story', sectionId: 'about' },
  { name: 'Process', sectionId: 'how' },
  { name: 'Clients', sectionId: 'customers' },
  { name: 'Gallery', sectionId: 'gallery' },
  { name: 'Reviews', sectionId: 'reviews' },
  { name: 'FAQ', sectionId: 'faq' },
];

function Header({ settings, activeTab, onSelectTab, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      const sectionIds = activeTab === 'shop'
        ? ['shop-studio', 'shop-designs', 'shop-commercial', 'shop-sets', 'shop-tshirts', 'shop-towels', 'shop-home']
        : ['faq', 'reviews', 'customers', 'gallery', 'how', 'about', 'hygiene', 'trust', 'stats', 'business-home'];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection(activeTab === 'shop' ? 'shop-home' : 'business-home');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    const el = document.getElementById(item.sectionId);
    if (el) {
      window.history.pushState({}, '', `/#${item.sectionId}`);
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(item.sectionId);
    }
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState({}, '', '/');
          }}
          aria-label={`${settings.brand} Home`}
        >
          <img className="brand-logo" src="/assets/mazatowel-logo-tight.png" alt={`${settings.brand} logo`} />
        </a>

        {/* Primary View Switcher: Single Meaningful Names */}
        <div className="nav-master-switch" role="tablist" aria-label="Website View Mode">
          <button
            type="button"
            className={`nav-master-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => onSelectTab('shop')}
            aria-selected={activeTab === 'shop'}
          >
            <span>🛍️</span> <span>Shop</span>
          </button>
          <button
            type="button"
            className={`nav-master-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => onSelectTab('info')}
            aria-selected={activeTab === 'info'}
          >
            <span>🏢</span> <span>About</span>
          </button>
        </div>

        {/* Navigation Links for Active Mode */}
        <nav className="nav-links" aria-label="Section Navigation">
          {(activeTab === 'shop' ? sellingNavLinks : infoNavLinks).map(item => {
            const isActive = activeSection === item.sectionId;
            return (
              <a
                key={item.name}
                href={`/#${item.sectionId}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, item)}
              >
                <span>{item.name}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </a>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="menu-btn"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div id="mobileMenu" className={`mobile-menu ${open ? 'show' : ''}`}>
        <div className="container">
          <div className="mobile-tab-switch-box">
            <button
              type="button"
              className={`mobile-mode-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => {
                onSelectTab('shop');
                setOpen(false);
              }}
            >
              🛍️ Shop
            </button>
            <button
              type="button"
              className={`mobile-mode-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => {
                onSelectTab('info');
                setOpen(false);
              }}
            >
              🏢 About
            </button>
          </div>

          <div className="mobile-nav-grid">
            {(activeTab === 'shop' ? sellingNavLinks : infoNavLinks).map(item => (
              <a
                key={item.name}
                href={`/#${item.sectionId}`}
                className={`mobile-nav-link ${activeSection === item.sectionId ? 'active' : ''}`}
                onClick={(e) => {
                  setOpen(false);
                  handleLinkClick(e, item);
                }}
              >
                <span className="mobile-link-text">
                  <span>{item.name}</span>
                  {item.badge && <span className="mobile-link-badge">{item.badge}</span>}
                </span>
                <span className="mobile-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>

          <div className="mobile-menu-socials">
            <a className="mobile-social-btn wa" href={whatsapp(settings.whatsapp, generalMessage(settings.brand))} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={16} /> WhatsApp Order
            </a>
            <a className="mobile-social-btn ig" href={settings.instagram || '#'} target="_blank" rel="noreferrer">
              <InstagramIcon size={16} /> Instagram
            </a>
            <a className="mobile-social-btn fb" href={settings.facebook || '#'} target="_blank" rel="noreferrer">
              <FacebookIcon size={16} /> Facebook
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function Field({ label, required, optional, error, success, help, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      <label>
        {label}
        {required && <span className="req-star" title="Mandatory field">*</span>}
        {optional && <span className="optional-tag">(Optional)</span>}
      </label>
      {children}
      {error && <div className="field-error-text"><span>⚠</span> {error}</div>}
      {!error && success && <div className="field-success-text"><span>✓</span> {success}</div>}
      {!error && !success && help && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{help}</div>}
    </div>
  );
}

/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
const DEFAULT_THREADS = [
  { id: 'TH001', name: 'Metallic Gold', hex: '#D4AF37', finish: 'Metallic Sheen', inStock: true, published: true, desc: 'Brilliant metallic gold finish.' },
  { id: 'TH002', name: 'Teal', hex: '#2F7F82', finish: 'Silk Luster', inStock: true, published: true, desc: 'Signature MazaTowel vibrant teal.' },
  { id: 'TH003', name: 'Rose Pink', hex: '#E58C8A', finish: 'Silk Luster', inStock: true, published: true, desc: 'Soft pastel rose tone.' },
  { id: 'TH004', name: 'Royal Blue', hex: '#1A56DB', finish: 'Silk Luster', inStock: true, published: true, desc: 'Deep royal blue luster.' },
  { id: 'TH005', name: 'Snow White', hex: '#FFFFFF', finish: 'Classic Cotton', inStock: true, published: true, desc: 'High contrast crisp white.' },
  { id: 'TH006', name: 'Jet Black', hex: '#18181B', finish: 'Classic Cotton', inStock: true, published: true, desc: 'Sharp black embroidery.' },
  { id: 'TH007', name: 'Crimson Red', hex: '#DC2626', finish: 'Silk Luster', inStock: true, published: true, desc: 'Festive vivid crimson red.' },
  { id: 'TH008', name: 'Champagne Silver', hex: '#C0C0C0', finish: 'Metallic Sheen', inStock: true, published: true, desc: 'Subtle metallic silver.' },
  { id: 'TH009', name: 'Emerald Green', hex: '#059669', finish: 'Silk Luster', inStock: true, published: true, desc: 'Rich botanical jewel green.' },
  { id: 'TH010', name: 'To be discussed with designer', hex: '#64748B', finish: 'Custom Consultation', inStock: true, published: true, desc: 'Our master artisan coordinates color with you on WhatsApp.' }
];
*/

const TSHIRT_SIZES = [
  { value: '38 inch', label: 'S (38" Chest)' },
  { value: '40 inch', label: 'M (40" Chest)' },
  { value: '42 inch', label: 'L (42" Chest)' },
  { value: '44 inch', label: 'XL (44" Chest)' },
  { value: '46 inch', label: 'XXL (46" Chest)' }
];

const PLACEMENT_OPTIONS = [
  { id: 'Left Chest Crest', icon: '📍', label: 'Left Chest Crest', desc: 'Over heart (3.5" classic crest/logo)' },
  { id: 'Center Chest', icon: '🎯', label: 'Center Chest', desc: 'Bold typography / center statement' },
  { id: 'Left Sleeve', icon: '🏷', label: 'Left / Right Sleeve', desc: 'Subtle 2" sleeve badge or initial' },
  { id: 'Upper Back / Collar', icon: '👕', label: 'Back Collar / Neck', desc: 'Back neckline branding or tagline' }
];

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function CustomizationModal({ db, selectedProduct, selectedDesign, onClose, notify }) {
  const products = published(db.products);
  const currentIsTShirt = (selectedProduct?.category === 'Custom T-Shirts');
  const selectableProducts = products.filter(p =>
    currentIsTShirt ? p.category === 'Custom T-Shirts' : p.category !== 'Custom T-Shirts'
  );
  const defaultProduct = selectedProduct || selectableProducts[0] || products[0];

  /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
  const availableThreads = (db?.threads && db.threads.length > 0 ? db.threads : DEFAULT_THREADS)
    .filter(t => t.published !== false);
  */

  const getColorsForProductAndSize = (prod, size) => {
    const isShirt = prod?.category === 'Custom T-Shirts';
    return (db.colors || []).filter(c => {
      if (c.published === false) return false;
      // 1. Category match
      if (c.categories && c.categories.length > 0) {
        const matchesCategory = isShirt
          ? c.categories.includes('Custom T-Shirts')
          : (c.categories.includes(prod?.category) || c.categories.includes('All') || c.categories.includes('All Towels') || !c.categories.includes('Custom T-Shirts'));
        if (!matchesCategory) return false;
      } else {
        if (isShirt && !['Sage Green', 'Classic Navy', 'Jet Black', 'Pristine White'].includes(c.name)) return false;
        if (!isShirt && ['Sage Green', 'Classic Navy', 'Jet Black'].includes(c.name)) return false;
      }

      // 2. Product-specific allowed colors restriction
      if (prod?.allowedColors && prod.allowedColors.length > 0) {
        if (!prod.allowedColors.includes(c.name) && !prod.allowedColors.includes(c.id)) return false;
      }

      // 3. Size match
      if (c.sizes && c.sizes.length > 0 && !c.sizes.includes('All Sizes')) {
        if (size && !c.sizes.includes(size)) return false;
      }

      return true;
    }).map(c => {
      // 4. Calculate variant stock status for this specific size
      const isSizeOos = Boolean(c.outOfStockSizes && c.outOfStockSizes.includes(size));
      const inStock = c.inStock !== false && !isSizeOos;
      return {
        ...c,
        inStock,
        isSizeOos
      };
    });
  };

  const initialSize = currentIsTShirt ? '40 inch' : (selectedProduct?.size || defaultProduct?.size || '');
  const initialColors = getColorsForProductAndSize(defaultProduct, initialSize);
  const initialColor = initialColors.find(c => c.inStock !== false) || initialColors[0];
  /* THREADS FEATURE PAUSED:
  const initialThread = availableThreads.find(t => t.inStock !== false)?.name || 'Metallic Gold';
  */

  const [form, setForm] = useState({
    productId: defaultProduct?.id || '',
    size: initialSize,
    quantity: 1,
    /* THREADS FEATURE PAUSED: thread: initialThread, */
    towelColor: initialColor?.name || (currentIsTShirt ? 'Jet Black' : 'Milky White'),
    placement: 'Left Chest Crest',
    embroideryName: '',
    embroideryNames: [''],
    sizesPerItem: [initialSize],
    nameMode: 'different', // 'different' for family/gift/team, 'same' for corporate/monogram
    design: selectedDesign ? `${selectedDesign.designId || ''} — ${selectedDesign.name}` : '',
    customerName: '',
    phone: '',
    companyName: '',
    logoAttachment: '',
    logoFileName: '',
    notes: ''
  });

  const [previewTowelIndex, setPreviewTowelIndex] = useState(0);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewColorImage, setPreviewColorImage] = useState(initialColor?.image || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError('');
    if (file.size > 25 * 1024 * 1024) {
      setLogoUploadError('File exceeds 25MB limit. Please choose a smaller file.');
      return;
    }
    setUploadingLogo(true);
    try {
      const dataUrl = await readFileDataUrl(file);
      const res = await api('/api/upload-logo', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, name: file.name })
      });
      if (res.url) {
        setForm(f => ({ ...f, logoAttachment: res.url, logoFileName: file.name }));
      }
    } catch (err) {
      setLogoUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setForm(f => ({ ...f, logoAttachment: '', logoFileName: '' }));
    setLogoUploadError('');
  };

  const handleWhatsAppDirect = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalNames = (form.quantity > 1 && form.nameMode === 'different')
      ? (form.embroideryNames || []).slice(0, form.quantity).map(s => String(s || '').trim())
      : [String(form.embroideryName || '').trim()];
    const combinedName = finalNames.filter(Boolean).join(', ') || 'Custom Monogram';
    const logoLink = form.logoAttachment;
    const logoText = logoLink
      ? `\n- Attached Logo / Reference: ${logoLink.startsWith('http') ? logoLink : (typeof window !== 'undefined' ? window.location.origin : '') + logoLink}`
      : '';
    const message = `Hello MazaTowel! 👋\n\nI want to customize & order:\n- Item: ${product?.name || (currentIsTShirt ? 'Custom T-Shirt' : 'Personalized Towel')}\n- Type: ${currentIsTShirt ? 'Custom Embroidered T-Shirt' : 'Egyptian Cotton Towel'}\n- Quantity: ${form.quantity} ${form.quantity === 1 ? 'pc' : 'pcs'}\n- Size: ${form.size}\n- Embroidery: ${combinedName}${currentIsTShirt && form.placement ? `\n- Placement: ${form.placement}` : ''}${form.customerName ? `\n- Customer Name: ${form.customerName}` : ''}${form.phone ? `\n- Mobile: +91 ${form.phone}` : ''}${logoText ? `${logoText}\n` : ''}${form.notes ? `\n- Notes: ${form.notes}` : ''}\n\nPlease confirm my order details!`;
    const url = whatsapp(db.settings?.whatsapp, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const product = selectableProducts.find(x => x.id === form.productId) || defaultProduct;

  const sizes = currentIsTShirt
    ? ['38 inch', '40 inch', '42 inch', '44 inch', '46 inch']
    : [...new Set(selectableProducts.filter(x => x.category === product?.category).map(x => x.size).filter(Boolean))];

  const availableColors = getColorsForProductAndSize(product, form.size);
  const selectedColorObj = availableColors.find(c => c.name === form.towelColor) ||
    availableColors.find(c => c.inStock !== false) ||
    availableColors[0];
  /* THREADS FEATURE PAUSED:
  const selectedThreadObj = availableThreads.find(t => t.name === form.thread) ||
    availableThreads.find(t => t.inStock !== false) ||
    availableThreads[0];
  */

  // Single-Line Color Carousel Navigation & Scroll State
  const colorTrackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = colorTrackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const t = setTimeout(checkScroll, 60);
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [availableColors, checkScroll]);

  // Center selected color swatch into view
  useEffect(() => {
    const el = colorTrackRef.current;
    if (!el) return;
    const active = el.querySelector('.color-card-btn.active');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setTimeout(checkScroll, 350);
    }
  }, [form.towelColor, checkScroll]);

  const handleScrollLeft = () => {
    const el = colorTrackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const handleScrollRight = () => {
    const el = colorTrackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const markTouched = field => setTouched(curr => ({ ...curr, [field]: true }));

  // Strict Real-Time Input Validators
  const validatePhone = val => {
    const raw = String(val || '').replace(/\D/g, '');
    if (!raw) return 'Mobile number is required.';
    if (!/^[6-9]/.test(raw)) return 'Indian numbers must start with 6, 7, 8, or 9.';
    if (raw.length < 10) return `${10 - raw.length} more digit${10 - raw.length > 1 ? 's' : ''} needed.`;
    if (raw.length === 10) return '';
    return 'Must be exactly 10 digits.';
  };

  const validateEmbroidery = val => {
    const trimmed = String(val || '').trim();
    if (!trimmed) return 'Name to embroider is required.';
    if (trimmed.length > 30) return 'Maximum 30 characters.';
    return '';
  };

  const validateCustomerName = val => {
    const trimmed = String(val || '').trim();
    if (!trimmed) return 'Your name is required.';
    if (trimmed.length < 2) return 'Please enter your full name (minimum 2 letters).';
    return '';
  };

  const phoneError = touched.phone ? validatePhone(form.phone) : '';
  const phoneSuccess = touched.phone && !phoneError ? 'Valid 10-digit Indian mobile' : '';
  const embError = touched.embroideryName ? validateEmbroidery(form.embroideryName) : '';
  const nameError = touched.customerName ? validateCustomerName(form.customerName) : '';

  // Inter-linked Product & Size Handlers
  const handleSizeChange = (newSize) => {
    // If it's a towel, automatically synchronize with the product in this category for that size
    let nextProduct = product;
    if (!currentIsTShirt) {
      const match = selectableProducts.find(p => p.category === product?.category && p.size === newSize);
      if (match) nextProduct = match;
    }

    const newColors = getColorsForProductAndSize(nextProduct, newSize);
    const stillValid = newColors.find(c => c.name === form.towelColor && c.inStock !== false);

    let nextColor = form.towelColor;
    let nextImage = previewColorImage;
    if (!stillValid) {
      const firstInStock = newColors.find(c => c.inStock !== false) || newColors[0];
      if (firstInStock) {
        nextColor = firstInStock.name;
        if (firstInStock.image && !selectedDesign) nextImage = firstInStock.image;
      }
    }

    setForm(current => ({
      ...current,
      productId: nextProduct.id,
      size: newSize,
      towelColor: nextColor,
      sizesPerItem: Array.isArray(current.sizesPerItem) ? current.sizesPerItem.map(() => newSize) : [newSize]
    }));
    if (nextImage) setPreviewColorImage(nextImage);
  };

  const handleProductChange = (newProductId) => {
    const next = selectableProducts.find(p => p.id === newProductId);
    const nextIsTShirt = next?.category === 'Custom T-Shirts';
    const nextSize = nextIsTShirt ? '40 inch' : (next?.size || sizes[0] || '');
    const nextColors = getColorsForProductAndSize(next, nextSize);
    const nextColor = nextColors.find(c => c.inStock !== false) || nextColors[0];

    setForm(x => ({
      ...x,
      productId: newProductId,
      size: nextSize,
      towelColor: nextColor?.name || (nextIsTShirt ? 'Jet Black' : 'Milky White'),
      sizesPerItem: Array.isArray(x.sizesPerItem) ? x.sizesPerItem.map(() => nextSize) : [nextSize]
    }));
    setPreviewColorImage(nextColor?.image || null);
  };

  // Input Sanitizers (Preventing Entering Wrong Things)
  const onPhoneChange = (e) => {
    // Strip everything except digits, limit to 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm(f => ({ ...f, phone: digitsOnly }));
    markTouched('phone');
  };

  const onEmbroideryChange = (e) => {
    // Filter machine-safe characters: letters, numbers, spaces, and punctuation (., & '-/)
    const safeChars = e.target.value.replace(/[^a-zA-Z0-9\s.,&'\-]/g, '').slice(0, 30);
    setForm(f => ({
      ...f,
      embroideryName: safeChars,
      embroideryNames: Array.isArray(f.embroideryNames) && f.embroideryNames.length > 0
        ? [safeChars, ...f.embroideryNames.slice(1)]
        : [safeChars]
    }));
    markTouched('embroideryName');
  };

  const onSingleTowelNameChange = (index, value) => {
    const safeChars = value.replace(/[^a-zA-Z0-9\s.,&'\-]/g, '').slice(0, 30);
    setForm(f => {
      const currentList = Array.isArray(f.embroideryNames) ? [...f.embroideryNames] : [];
      while (currentList.length < f.quantity) {
        currentList.push('');
      }
      currentList[index] = safeChars;
      return {
        ...f,
        embroideryNames: currentList,
        embroideryName: currentList.filter(Boolean).join(', ')
      };
    });
    setPreviewTowelIndex(index);
    markTouched(`embroideryName_${index}`);
  };

  const onSingleShirtSizeChange = (index, newSize) => {
    setForm(f => {
      const nextSizes = Array.isArray(f.sizesPerItem) ? [...f.sizesPerItem] : [];
      while (nextSizes.length < f.quantity) {
        nextSizes.push(f.size || '40 inch');
      }
      nextSizes[index] = newSize;
      return {
        ...f,
        sizesPerItem: nextSizes
      };
    });
  };

  const onCustomerNameChange = (e) => {
    // Filter letters, spaces, dots, hyphens only
    const cleanLetters = e.target.value.replace(/[^a-zA-Z\s.-]/g, '').slice(0, 80);
    setForm(f => ({ ...f, customerName: cleanLetters }));
    markTouched('customerName');
  };

  const onQuantityChange = (val) => {
    const num = Math.max(1, Math.min(999, parseInt(val, 10) || 1));
    setForm(f => {
      const currentList = Array.isArray(f.embroideryNames) ? [...f.embroideryNames] : [f.embroideryName || ''];
      const nextList = [...currentList];
      while (nextList.length < num) {
        nextList.push('');
      }
      if (nextList.length > num) {
        nextList.length = num;
      }

      const currentSizes = Array.isArray(f.sizesPerItem) ? [...f.sizesPerItem] : [f.size || '40 inch'];
      const nextSizes = [...currentSizes];
      while (nextSizes.length < num) {
        nextSizes.push(f.size || '40 inch');
      }
      if (nextSizes.length > num) {
        nextSizes.length = num;
      }

      return {
        ...f,
        quantity: num,
        embroideryNames: nextList,
        sizesPerItem: nextSizes,
        embroideryName: f.nameMode === 'different' ? nextList.filter(Boolean).join(', ') : f.embroideryName
      };
    });
    setPreviewTowelIndex(idx => (idx >= num ? Math.max(0, num - 1) : idx));
  };

  async function submit(event) {
    event.preventDefault();
    setError('');

    // Mark all as touched to trigger inline warnings
    const touchMap = {
      customerName: true,
      embroideryName: true,
      phone: true
    };
    if (form.quantity > 1 && form.nameMode === 'different') {
      for (let i = 0; i < form.quantity; i++) {
        touchMap[`embroideryName_${i}`] = true;
      }
    }
    setTouched(touchMap);

    const vName = validateCustomerName(form.customerName);
    if (vName) return setError(vName);

    if (form.quantity > 1 && form.nameMode === 'different') {
      const names = Array.isArray(form.embroideryNames) ? form.embroideryNames : [];
      for (let i = 0; i < form.quantity; i++) {
        const n = String(names[i] || '').trim();
        if (!n) {
          markTouched(`embroideryName_${i}`);
          return setError(`Please enter the name to embroider on ${currentIsTShirt ? 'T-Shirt' : 'Towel'} #${i + 1}.`);
        }
        if (n.length > 30) {
          markTouched(`embroideryName_${i}`);
          return setError(`Name on ${currentIsTShirt ? 'T-Shirt' : 'Towel'} #${i + 1} exceeds 30 characters.`);
        }
      }
    } else {
      const vEmb = validateEmbroidery(form.embroideryName);
      if (vEmb) return setError(vEmb);
    }

    const vPhone = validatePhone(form.phone);
    if (vPhone) return setError(vPhone);

    if (!product) return setError('Please choose a valid product.');

    /* FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
    if (selectedColorObj && selectedColorObj.inStock === false) {
      return setError(`"${selectedColorObj.name}" is currently sold out for ${form.size}. Please pick an in-stock fabric color.`);
    }
    */

    /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
    if (selectedThreadObj && selectedThreadObj.inStock === false) {
      return setError(`"${selectedThreadObj.name}" thread is currently out of stock. Please pick an in-stock embroidery thread colour.`);
    }
    */

    const finalNames = (form.quantity > 1 && form.nameMode === 'different')
      ? (form.embroideryNames || []).slice(0, form.quantity).map(s => String(s || '').trim())
      : [String(form.embroideryName || '').trim()];
    const combinedName = finalNames.filter(Boolean).join(', ');

    setSaving(true);
    try {
      const res = await api('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          category: currentIsTShirt ? 'Custom T-Shirts' : 'Towels',
          placement: currentIsTShirt ? (form.placement || 'Left Chest Crest') : '',
          sizesPerItem: (currentIsTShirt && form.quantity > 1 && form.nameMode === 'different') ? form.sizesPerItem : null,
          /* THREADS FEATURE PAUSED: thread: form.thread || selectedThreadObj?.name || 'Metallic Gold', */
          towelColor: form.towelColor || selectedColorObj?.name || (currentIsTShirt ? 'Jet Black' : 'Standard'),
          phone: form.phone,
          productId: product.id,
          product: product.name,
          quantity: Math.max(1, Number(form.quantity) || 1),
          embroideryName: combinedName,
          embroideryNames: finalNames,
          nameMode: form.quantity > 1 ? (form.nameMode || 'different') : 'same',
          notes: form.companyName ? `[Company/Org: ${form.companyName}] ${form.notes || ''}`.trim() : form.notes
        })
      });
      onClose();
      notify(currentIsTShirt
        ? 'Your custom T-shirt enquiry has been sent to MazaTowel! Opening WhatsApp to coordinate…'
        : 'Your request has been sent to MazaTowel! Opening WhatsApp to coordinate…'
      );
      handleWhatsAppDirect();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const totalPrice = (product?.price || 0) * (form.quantity || 1);

  return (
    <div id="productModal" className="modal show" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card wide-form" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="eyebrow">Personalized Order Form</div>
            <h3>{product?.category === 'Custom T-Shirts' ? 'Personalize Your T-Shirt' : 'Personalize Your Towel'}</h3>
            <p className="modal-subtitle">Direct custom embroidery request with live fabric & stock verification.</p>
          </div>
          <button
            type="button"
            className="icon-close-btn"
            aria-label="Close modal"
            title="Close"
            onClick={onClose}
          >
            <CloseIcon size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div>
              <div className="form-preview">
                <img
                  src={previewColorImage || imageFor(selectedDesign || product)}
                  alt={product?.name || 'Product preview'}
                />
                {/* FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
                {selectedColorObj && (
                  <div className="towel-color-live-badge">
                    <div className="badge-left">
                      <span className="dot" style={{ backgroundColor: selectedColorObj.hex }} />
                      <span>Colour: <strong>{selectedColorObj.name}</strong></span>
                    </div>
                    <span className={`stock-tag ${selectedColorObj.inStock !== false ? 'in' : 'oos'}`}>
                      {selectedColorObj.inStock !== false ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                )}
                */}
              </div>

              <div className="notice" style={{ marginTop: 14 }}>
                Fast confirmation on WhatsApp before we begin embroidery.
              </div>

              {db?.settings?.payment && (
                <div className="modal-payment-policy">
                  <div className="policy-badge">💳 Order Terms</div>
                  <p>{db.settings.payment}</p>
                </div>
              )}
            </div>

            <form onSubmit={submit} noValidate>
              <div className="form-req-banner">
                <span className="req-star">*</span>
                <span>Fields marked with an asterisk are required to process your order</span>
              </div>

              {/* SECTION 1: PRODUCT & FABRIC SPECIFICATION */}
              <div className="modal-form-section">
                <div className="modal-section-head">
                  <span className="modal-section-title">
                    <span className="step-num-badge">1</span>
                    {currentIsTShirt ? 'Apparel Selection' : 'Towel Product Selection'}
                  </span>
                  <span className="field-price-tag">{money(product.price)} each</span>
                </div>

                <div className="field-two-col">
                  <Field label={currentIsTShirt ? 'Choose Apparel' : 'Choose Towel Product'} required>
                    <select
                      value={form.productId}
                      onChange={e => handleProductChange(e.target.value)}
                    >
                      {selectableProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {money(p.price)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={currentIsTShirt ? 'Apparel Size (Chest)' : 'Towel Size (Inches Only)'} required>
                    <select value={form.size} onChange={e => handleSizeChange(e.target.value)}>
                      {sizes.map(size => {
                        const tObj = TSHIRT_SIZES.find(t => t.value === size);
                        return (
                          <option key={size} value={size}>
                            {tObj ? tObj.label : size}
                          </option>
                        );
                      })}
                    </select>
                  </Field>
                </div>

                {/* T-SHIRT EMBROIDERY PLACEMENT SELECTOR */}
                {currentIsTShirt && (
                  <div className="placement-selector-section" style={{ margin: '14px 0 16px' }}>
                    <div className="color-selector-head">
                      <span className="color-selector-title">
                        <span>📍</span>
                        Embroidery Placement on T-Shirt
                        <span className="req-star">*</span>
                      </span>
                      <span className="placement-active-tag">
                        {form.placement || 'Left Chest Crest'}
                      </span>
                    </div>
                    <div className="placement-cards-grid">
                      {PLACEMENT_OPTIONS.map(pl => {
                        const isSelected = (form.placement || 'Left Chest Crest') === pl.id;
                        return (
                          <button
                            type="button"
                            key={pl.id}
                            className={`placement-card-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => setForm(f => ({ ...f, placement: pl.id }))}
                          >
                            <span className="placement-card-icon">{pl.icon}</span>
                            <div className="placement-card-info">
                              <span className="placement-card-name">{pl.label}</span>
                              <span className="placement-card-desc">{pl.desc}</span>
                            </div>
                            {isSelected && <span className="placement-card-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
                <div className="color-selector-section" style={{ margin: '10px 0 12px' }}>
                  <div className="color-selector-head">
                    <span className="color-selector-title">
                      <span>🎨</span>
                      {currentIsTShirt ? 'Apparel Fabric Colour' : 'Towel Fabric Colour'}
                      <span className="req-star">*</span>
                    </span>
                    {selectedColorObj && (
                      <span className={`color-stock-pill ${selectedColorObj.inStock !== false ? 'in-stock' : 'out-of-stock'}`}>
                        <span className="stock-dot" />
                        {selectedColorObj.inStock !== false ? `In Stock: ${selectedColorObj.name}` : `Sold Out: ${selectedColorObj.name}`}
                      </span>
                    )}
                  </div>

                  <p className="color-picker-hint" style={{ marginBottom: 8 }}>
                    Click a fabric swatch below to preview high-res photo for <strong>{form.size}</strong>:
                  </p>

                  <div className="color-slider-shell">
                    <button
                      type="button"
                      className={`color-slider-arrow prev ${!canScrollLeft ? 'disabled' : ''}`}
                      onClick={handleScrollLeft}
                      disabled={!canScrollLeft}
                      aria-label="Previous fabric colours"
                      title="Previous fabric colours"
                    >
                      <ChevronLeftIcon size={16} strokeWidth={2.6} />
                    </button>

                    <div className="color-slider-viewport">
                      <div className={`color-slider-fade left ${canScrollLeft ? 'show' : ''}`} aria-hidden="true" />
                      <div className={`color-slider-fade right ${canScrollRight ? 'show' : ''}`} aria-hidden="true" />

                      <div
                        className="color-card-grid color-card-slider-track"
                        ref={colorTrackRef}
                        onScroll={checkScroll}
                        role="radiogroup"
                        aria-label="Choose Towel Colour"
                      >
                        {availableColors.map(c => {
                          const isSelected = form.towelColor === c.name;
                          const isAvailable = c.inStock !== false;
                          return (
                            <button
                              type="button"
                              key={c.id || c.name}
                              role="radio"
                              aria-checked={isSelected}
                              disabled={!isAvailable}
                              className={`color-card-btn ${isSelected ? 'active' : ''} ${!isAvailable ? 'disabled-oos' : ''}`}
                              onClick={() => {
                                if (isAvailable) {
                                  setForm(f => ({ ...f, towelColor: c.name }));
                                  if (c.image) setPreviewColorImage(c.image);
                                }
                              }}
                              title={isAvailable ? `${c.name} — In Stock for ${form.size}` : `${c.name} — Currently Sold Out for ${form.size}`}
                            >
                              <div className="color-card-photo-wrap">
                                {c.image ? (
                                  <img src={c.image} alt={`${c.name} fabric`} className="color-card-img" loading="lazy" />
                                ) : (
                                  <div className="color-card-placeholder" style={{ backgroundColor: c.hex }} />
                                )}
                                <span
                                  className="color-card-dot"
                                  style={{
                                    backgroundColor: c.hex,
                                    border: c.hex?.toUpperCase() === '#FFFFFF' || c.hex?.toUpperCase() === '#FAFAFA' ? '1.5px solid #CCD8D8' : '1px solid rgba(0,0,0,0.12)'
                                  }}
                                />
                                {isSelected && <span className="color-card-check">✓</span>}
                                {!isAvailable && (
                                  <div className="color-card-oos-overlay">
                                    <span>Sold Out</span>
                                  </div>
                                )}
                              </div>
                              <div className="color-card-meta">
                                <span className="color-card-name">{c.name}</span>
                                <span className={`color-card-status ${isAvailable ? 'txt-avail' : 'txt-oos'}`}>
                                  {isAvailable ? 'In Stock' : 'Sold Out'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`color-slider-arrow next ${!canScrollRight ? 'disabled' : ''}`}
                      onClick={handleScrollRight}
                      disabled={!canScrollRight}
                      aria-label="Next fabric colours"
                      title="Next fabric colours"
                    >
                      <ChevronRightIcon size={16} strokeWidth={2.6} />
                    </button>
                  </div>

                  {selectedColorObj && selectedColorObj.inStock === false && (
                    <div className="color-alert-oos">
                      <span>⚠</span>
                      <div>
                        <strong>{selectedColorObj.name} is currently out of stock for {form.size}.</strong>
                        <p>Please select another in-stock color above to proceed.</p>
                      </div>
                    </div>
                  )}
                </div>
                */}

                <div className="qty-pricing-row">
                  <div className="qty-col">
                    <div className="qty-col-header">
                      <span>Order Quantity <span className="req-star">*</span></span>
                      <span className="qty-unit-pill">{form.quantity} {form.quantity === 1 ? (currentIsTShirt ? 'T-Shirt' : 'Towel') : (currentIsTShirt ? 'T-Shirts' : 'Towels')}</span>
                    </div>
                    <div className="qty-stepper-box">
                      <button
                        type="button"
                        className="qty-step-btn"
                        disabled={form.quantity <= 1}
                        onClick={() => onQuantityChange(form.quantity - 1)}
                        aria-label="Decrease quantity"
                        title="Decrease quantity by 1"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={form.quantity}
                        onChange={e => onQuantityChange(e.target.value)}
                        className="qty-stepper-input"
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="qty-step-btn"
                        disabled={form.quantity >= 999}
                        onClick={() => onQuantityChange(form.quantity + 1)}
                        aria-label="Increase quantity"
                        title="Increase quantity by 1"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="pricing-col">
                    <div className="qty-col-header">
                      <span>Estimated Total</span>
                      <span className="qty-unit-pill">{money(product.price)} each</span>
                    </div>
                    <div className="qty-total-preview-card">
                      <div className="qty-total-amount">{money(totalPrice)}</div>
                      <div className="qty-total-sub">{form.quantity} {form.quantity === 1 ? 'item' : 'items'} × {money(product.price)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOM EMBROIDERY */}
              <div className="modal-form-section">
                <div className="modal-section-head">
                  <span className="modal-section-title">
                    <span className="step-num-badge">2</span>
                    Custom Embroidery Personalization
                  </span>
                  {form.quantity <= 1 || form.nameMode === 'same' ? (
                    <span className="field-char-count">{form.embroideryName.length} / 30 chars</span>
                  ) : (
                    <span className="field-char-count">{form.quantity} unique {currentIsTShirt ? 'shirts' : 'towels'}</span>
                  )}
                </div>

                {/* Personalization Mode Selector when Quantity > 1 */}
                {form.quantity > 1 && (
                  <div className="personalization-mode-card">
                    <div className="mode-card-header">
                      <span className="mode-card-title">Personalization for {form.quantity} {currentIsTShirt ? 'T-Shirts' : 'Towels'}</span>
                      <span className="mode-card-hint">Choose your embroidery style:</span>
                    </div>
                    <div className="mode-options-grid">
                      <button
                        type="button"
                        className={`mode-option-btn ${form.nameMode === 'different' ? 'active' : ''}`}
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            nameMode: 'different',
                            embroideryName: (f.embroideryNames || []).filter(Boolean).join(', ')
                          }));
                        }}
                      >
                        <div className="mode-option-radio">
                          <span className="radio-dot" />
                        </div>
                        <div className="mode-option-text">
                          <div className="mode-option-heading">
                            <strong>Different Name on Each {currentIsTShirt ? 'T-Shirt' : 'Towel'}</strong>
                            <span className="mode-tag family-tag">👨‍👩‍👧 Family & Gifts</span>
                          </div>
                          <p>Personalize each {currentIsTShirt ? 't-shirt' : 'towel'} with a unique name for family members, couples, or friends.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`mode-option-btn ${form.nameMode === 'same' ? 'active' : ''}`}
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            nameMode: 'same'
                          }));
                        }}
                      >
                        <div className="mode-option-radio">
                          <span className="radio-dot" />
                        </div>
                        <div className="mode-option-text">
                          <div className="mode-option-heading">
                            <strong>Same Name on All {form.quantity}</strong>
                            <span className="mode-tag corp-tag">🏢 Corporate & Hotel</span>
                          </div>
                          <p>Identical logo, company/resort branding, or family surname monogram across all items.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Individual names for each towel when mode is 'different' */}
                {form.quantity > 1 && form.nameMode === 'different' ? (
                  <div className="multi-towel-names-wrap">
                    <div className="multi-names-header">
                      <span className="multi-names-title">
                        <span>✍️</span>
                        Enter Name for Each {currentIsTShirt ? 'T-Shirt' : 'Towel'}
                        <span className="req-star">*</span>
                      </span>
                      <span className="multi-names-counter">
                        {(form.embroideryNames || []).filter(n => n && n.trim()).length} of {form.quantity} names entered
                      </span>
                    </div>

                    <div className="towel-names-grid">
                      {Array.from({ length: form.quantity }).map((_, idx) => {
                        const val = form.embroideryNames?.[idx] || '';
                        const itemSize = form.sizesPerItem?.[idx] || form.size || '40 inch';
                        const isFocused = previewTowelIndex === idx;
                        const fieldTouched = touched[`embroideryName_${idx}`] || touched.embroideryName;
                        const hasError = fieldTouched && !val.trim();

                        return (
                          <div key={idx} className={`towel-name-row ${isFocused ? 'active-towel' : ''} ${hasError ? 'row-has-error' : ''}`}>
                            <div className="towel-row-badge">
                              <span className="towel-idx-badge">{currentIsTShirt ? 'Shirt' : 'Towel'} #{idx + 1}</span>
                              {val.trim() && <span className="towel-check-badge">✓</span>}
                            </div>
                            {currentIsTShirt && (
                              <div className="shirt-row-size-box">
                                <label className="shirt-size-mini-label" htmlFor={`shirt_size_${idx}`}>Size:</label>
                                <select
                                  id={`shirt_size_${idx}`}
                                  value={itemSize}
                                  onChange={e => onSingleShirtSizeChange(idx, e.target.value)}
                                  className="shirt-row-size-select"
                                  title={`Size for Shirt #${idx + 1}`}
                                >
                                  {TSHIRT_SIZES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="towel-row-input-wrap">
                              <input
                                type="text"
                                maxLength="30"
                                value={val}
                                onChange={e => onSingleTowelNameChange(idx, e.target.value)}
                                onFocus={() => setPreviewTowelIndex(idx)}
                                onBlur={() => markTouched(`embroideryName_${idx}`)}
                                placeholder="Enter name"
                                className={`towel-name-input ${hasError ? 'input-has-error' : val.trim() ? 'input-has-success' : ''}`}
                                aria-label={`Name on ${currentIsTShirt ? 'T-Shirt' : 'Towel'} #${idx + 1}`}
                              />
                              <span className="towel-input-chars">{val.length}/30</span>
                            </div>
                            {hasError && <span className="towel-error-msg">Required for #{idx + 1}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Field
                    label={form.quantity > 1 ? `Name / Monogram to Embroider (All ${form.quantity} Items)` : (currentIsTShirt ? 'Name / Monogram / Initials to Embroider' : 'Name to Embroider')}
                    required
                    error={embError}
                    help={
                      form.quantity > 1
                        ? `This text will be stitched on all ${form.quantity} items (e.g. "The Grand Palace", "Sharma Family", "FitZone")`
                        : (currentIsTShirt
                            ? 'Supports member name, monogram, club initials, or tagline (e.g. Rohit, RK, CAPTAIN, MAZA)'
                            : 'Supports letters, numbers, and initials (e.g. Aarav, Priya, MAZA, R & S)')
                    }
                  >
                    <input
                      maxLength="30"
                      value={form.embroideryName}
                      onChange={onEmbroideryChange}
                      onBlur={() => markTouched('embroideryName')}
                      className={embError ? 'input-has-error' : form.embroideryName ? 'input-has-success' : ''}
                      placeholder="Enter name to embroider"
                    />
                  </Field>
                )}

                <Field
                  label="Design Code / Motif"
                  optional
                  help="Select from gallery or leave empty for classic text embroidery"
                >
                  <input
                    maxLength="100"
                    value={form.design}
                    onChange={e => setForm(f => ({ ...f, design: e.target.value }))}
                    placeholder="Enter design code or motif"
                  />
                </Field>

                {/* ATTACH LOGO IN CUSTOM EMBROIDERY PERSONALIZATION SECTION */}
                <Field label="Attach Logo" optional help="PNG, JPG, WEBP, SVG or PDF (max 25MB).">
                  {form.logoAttachment ? (
                    <div style={{
                      padding: '8px 12px',
                      background: '#f8fafc',
                      border: '1.5px solid #0d9488',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginTop: 4,
                      marginBottom: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                        {/\.(png|jpe?g|webp|svg)$/i.test(form.logoAttachment) ? (
                          <img src={form.logoAttachment} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', padding: 2, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', background: '#e0f2fe', borderRadius: 6, fontSize: 16, flexShrink: 0 }}>📄</div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ color: '#059669', marginRight: 4 }}>✓</span>{form.logoFileName || 'Attached Logo'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#b42318',
                          borderRadius: '50%',
                          width: 26,
                          height: 26,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: 1
                        }}
                        title="Remove logo"
                        aria-label="Remove logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginTop: 4,
                      marginBottom: 8
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {uploadingLogo ? (
                          <span style={{ color: 'var(--teal2)', fontWeight: 700 }}>⏳ Uploading logo…</span>
                        ) : (
                          <span>Attach logo (Optional)</span>
                        )}
                      </div>
                      <label className="btn btn-secondary" style={{
                        margin: 0,
                        padding: '6px 14px',
                        fontSize: 12,
                        cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                        opacity: uploadingLogo ? 0.6 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span>📎 Choose File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,application/pdf"
                          disabled={uploadingLogo}
                          style={{ display: 'none' }}
                          onChange={handleLogoChange}
                        />
                      </label>
                    </div>
                  )}
                  {logoUploadError && (
                    <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 8 }}>
                      ⚠ {logoUploadError}
                    </div>
                  )}
                </Field>

                {/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
                <div className="thread-selector-box">
                  <div className="thread-selector-head">
                    <span className="thread-selector-title">
                      <span>🧵</span>
                      Embroidery Thread Colour
                      <span className="req-star">*</span>
                    </span>
                    {selectedThreadObj && (
                      <span className="thread-selected-badge">
                        <span
                          className="thread-dot-sm"
                          style={{
                            backgroundColor: selectedThreadObj.hex,
                            border: ['#FFFFFF', '#FAFAFA', '#F8FAFC'].includes(selectedThreadObj.hex?.toUpperCase()) ? '1px solid #CCD8D8' : '1px solid rgba(0,0,0,0.15)'
                          }}
                        />
                        <strong>{selectedThreadObj.name}</strong>
                        {selectedThreadObj.finish && <span className="thread-finish-chip">{selectedThreadObj.finish}</span>}
                      </span>
                    )}
                  </div>

                  <p className="color-picker-hint" style={{ marginBottom: 10 }}>
                    Select silk, metallic, or classic thread colour for your embroidery:
                  </p>

                  <div className="thread-swatches-grid" role="radiogroup" aria-label="Choose Embroidery Thread Colour">
                    {availableThreads.map(th => {
                      const isSelected = form.thread === th.name;
                      const isAvail = th.inStock !== false;
                      const isWhite = ['#FFFFFF', '#FAFAFA', '#F8FAFC'].includes(th.hex?.toUpperCase());
                      return (
                        <button
                          type="button"
                          key={th.id || th.name}
                          role="radio"
                          aria-checked={isSelected}
                          disabled={!isAvail}
                          className={`thread-swatch-btn ${isSelected ? 'active' : ''} ${!isAvail ? 'disabled-oos' : ''}`}
                          onClick={() => {
                            if (isAvail) {
                              setForm(f => ({ ...f, thread: th.name }));
                            }
                          }}
                          title={isAvail ? `${th.name} (${th.finish || 'Standard'}) — In Stock` : `${th.name} — Sold Out`}
                        >
                          <span
                            className="thread-swatch-circle"
                            style={{
                              backgroundColor: th.hex || '#2F7F82',
                              border: isWhite ? '1.5px solid #CBD5E1' : '1px solid rgba(0,0,0,0.12)'
                            }}
                          >
                            {isSelected && (
                              <span
                                className="thread-swatch-check"
                                style={{ color: isWhite || th.hex === '#D4AF37' || th.hex === '#C0C0C0' ? '#0F172A' : '#FFFFFF' }}
                              >
                                ✓
                              </span>
                            )}
                          </span>
                          <div className="thread-swatch-text">
                            <span className="thread-swatch-name">{th.name}</span>
                            {th.finish && <span className="thread-swatch-sub">{th.finish}</span>}
                          </div>
                          {!isAvail && <span className="thread-swatch-oos-tag">Sold Out</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                */}

                {/* LIVE EMBROIDERY CONTRAST PREVIEW PAUSED - UNCOMMENT WHEN REQUIRED:
                <div className="embroidery-live-preview-wrap">
                  <div className="embroidery-preview-head">
                    <span className="preview-label">✦ Live Stitched Preview on Fabric</span>
                    <span className="preview-contrast-hint">
                      Preview: <strong>Custom Embroidery Stitched Monogram</strong>
                    </span>
                  </div>

                  {form.quantity > 1 && form.nameMode === 'different' && (
                    <div className="preview-towel-switcher">
                      <span className="preview-switcher-label">✦ Click to preview stitch on fabric:</span>
                      <div className="preview-towel-tabs">
                        {Array.from({ length: form.quantity }).map((_, idx) => {
                          const tName = form.embroideryNames?.[idx]?.trim();
                          const isActive = previewTowelIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`preview-towel-pill ${isActive ? 'active' : ''}`}
                              onClick={() => setPreviewTowelIndex(idx)}
                              title={`Preview stitch for Towel #${idx + 1}`}
                            >
                              <span className="pill-idx">#{idx + 1}</span>
                              <span className="pill-val">{tName || `Towel ${idx + 1}`}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className="embroidery-preview-canvas"
                    style={{
                      backgroundColor: selectedColorObj?.hex || '#FAFAFA',
                      color: '#2F7F82',
                      border: ['#FFFFFF', '#FAFAFA'].includes(selectedColorObj?.hex?.toUpperCase()) ? '1px solid #E2E8F0' : 'none'
                    }}
                  >
                    <span className="embroidery-preview-stitched-text">
                      {form.quantity > 1 && form.nameMode === 'different'
                        ? (form.embroideryNames?.[previewTowelIndex]?.trim() || form.embroideryNames?.find(n => n?.trim())?.trim() || 'Aarav')
                        : (form.embroideryName.trim() || 'Aarav')}
                    </span>
                    <span className="embroidery-thread-label">
                      {form.quantity > 1 && form.nameMode === 'different'
                        ? `${currentIsTShirt ? 'Shirt' : 'Towel'} #${previewTowelIndex + 1} (${currentIsTShirt ? (form.sizesPerItem?.[previewTowelIndex] || form.size) : form.size})${currentIsTShirt ? ` • ${form.placement || 'Left Chest Crest'}` : ''}`
                        : `${currentIsTShirt ? (form.placement || 'Left Chest Crest') : (product?.size || form.size || 'Custom Size')}`}
                    </span>
                  </div>
                </div>
                */}
              </div>

              {/* SECTION 3: CONTACT & ORDER COORDINATION */}
              <div className="modal-form-section">
                <div className="modal-section-head">
                  <span className="modal-section-title">
                    <span className="step-num-badge">3</span>
                    Contact & Order Coordination
                  </span>
                </div>

                <div className="field-two-col">
                  <Field label="Your Full Name" required error={nameError}>
                    <input
                      maxLength="80"
                      value={form.customerName}
                      onChange={onCustomerNameChange}
                      onBlur={() => markTouched('customerName')}
                      className={nameError ? 'input-has-error' : form.customerName.length >= 2 ? 'input-has-success' : ''}
                      placeholder="Enter full name"
                    />
                  </Field>

                  <Field label="Mobile Number" required error={phoneError} success={phoneSuccess}>
                    <div className={`phone-input-group ${phoneError ? 'has-error' : ''}`}>
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength="10"
                        value={form.phone}
                        onChange={onPhoneChange}
                        onBlur={() => markTouched('phone')}
                        className={phoneError ? 'input-has-error' : phoneSuccess ? 'input-has-success' : ''}
                        placeholder="Enter mobile number"
                        aria-label="10-digit Indian mobile number"
                      />
                    </div>
                  </Field>
                </div>

                {currentIsTShirt && (
                  <Field label="Company, Team or Group Name" optional help="Useful for corporate orders, club apparel, or event branding">
                    <input
                      maxLength="100"
                      value={form.companyName || ''}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      placeholder="Enter company or group name"
                    />
                  </Field>
                )}

                <Field label="Special Instructions / Occasion Notes" optional>
                  <textarea
                    maxLength="500"
                    rows="2"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Enter special instructions or occasion notes"
                  />
                </Field>
              </div>

              {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary request-submit"
                  disabled={saving || (selectedColorObj && selectedColorObj.inStock === false)}
                  style={{ flex: '1 1 180px', padding: '13px 18px', fontSize: 14, justifyContent: 'center', whiteSpace: 'nowrap' }}
                >
                  {saving
                    ? 'Sending…'
                    : `Send Request (${money(totalPrice)})`}
                </button>
                <button
                  type="button"
                  className="btn btn-whatsapp"
                  onClick={handleWhatsAppDirect}
                  style={{ flex: '0 1 auto', padding: '13px 18px', fontSize: 14, whiteSpace: 'nowrap', justifyContent: 'center' }}
                  title="Direct order with logo preview on WhatsApp"
                >
                  <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Order on WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnPageOrderStudio({ db, onOpenModal, notify }) {
  const products = published(db.products);
  const towelProducts = products.filter(p => p.category !== 'Custom T-Shirts');
  const tshirtProducts = products.filter(p => p.category === 'Custom T-Shirts');
  /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
  const availableThreads = (db?.threads && db.threads.length > 0 ? db.threads : DEFAULT_THREADS)
    .filter(t => t.published !== false);
  */

  const [mode, setMode] = useState('towel');
  const activeProducts = mode === 'towel' ? towelProducts : tshirtProducts;
  const [selectedProductId, setSelectedProductId] = useState(activeProducts[0]?.id || '');
  const selectedProduct = activeProducts.find(p => p.id === selectedProductId) || activeProducts[0];

  const currentIsTShirt = mode === 'tshirt';
  const sizes = currentIsTShirt
    ? ['38 inch', '40 inch', '42 inch', '44 inch', '46 inch']
    : [...new Set(activeProducts.map(p => p.size).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState(currentIsTShirt ? '40 inch' : (selectedProduct?.size || '30x60 inch'));

  const availableColors = (db.colors || []).filter(c => {
    if (c.published === false) return false;
    if (c.categories && c.categories.length > 0) {
      const match = currentIsTShirt
        ? c.categories.includes('Custom T-Shirts')
        : (c.categories.includes('Bath Towels') || c.categories.includes('All') || !c.categories.includes('Custom T-Shirts'));
      if (!match) return false;
    } else {
      if (currentIsTShirt && !['Sage Green', 'Classic Navy', 'Jet Black', 'Pristine White'].includes(c.name)) return false;
      if (!currentIsTShirt && ['Sage Green', 'Classic Navy', 'Jet Black'].includes(c.name)) return false;
    }
    return true;
  });

  const [selectedColor, setSelectedColor] = useState(availableColors[0]?.name || (currentIsTShirt ? 'Jet Black' : 'Milky White'));
  /* THREADS FEATURE PAUSED: const [selectedThread, setSelectedThread] = useState(availableThreads[0]?.name || 'Metallic Gold'); */
  const [embroideryText, setEmbroideryText] = useState('');
  const [placement, setPlacement] = useState('Left Chest Crest');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [logoAttachment, setLogoAttachment] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError('');
    if (file.size > 25 * 1024 * 1024) {
      setLogoUploadError('File exceeds 25MB limit. Please choose a smaller file.');
      return;
    }
    setUploadingLogo(true);
    try {
      const dataUrl = await readFileDataUrl(file);
      const res = await api('/api/upload-logo', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, name: file.name })
      });
      if (res.url) {
        setLogoAttachment(res.url);
        setLogoFileName(file.name);
      }
    } catch (err) {
      setLogoUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoAttachment('');
    setLogoFileName('');
    setLogoUploadError('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const list = newMode === 'towel' ? towelProducts : tshirtProducts;
    const newProd = list[0];
    setSelectedProductId(newProd?.id || '');
    const newSize = newMode === 'tshirt' ? '40 inch' : (newProd?.size || '30x60 inch');
    setSelectedSize(newSize);
    const cols = (db.colors || []).filter(c => {
      if (c.published === false) return false;
      return newMode === 'tshirt' ? (c.categories?.includes('Custom T-Shirts') || ['Sage Green', 'Classic Navy', 'Jet Black'].includes(c.name)) : !c.categories?.includes('Custom T-Shirts');
    });
    if (cols.length) setSelectedColor(cols[0].name);
  };

  const selectedColorObj = availableColors.find(c => c.name === selectedColor) || availableColors[0];
  /* THREADS FEATURE PAUSED: const selectedThreadObj = availableThreads.find(t => t.name === selectedThread) || availableThreads[0]; */

  const handleWhatsApp = (passedLogo) => {
    const text = embroideryText.trim() || 'Custom Monogram';
    const logoUrl = passedLogo !== undefined ? passedLogo : logoAttachment;
    const logoLine = logoUrl
      ? `\n- Attached Logo / Reference: ${logoUrl.startsWith('http') ? logoUrl : (typeof window !== 'undefined' ? window.location.origin : '') + logoUrl}`
      : '';
    /* THREADS FEATURE PAUSED: \n- Thread Color: ${selectedThread} */
    /* FABRIC COLOR FEATURE PAUSED: \n- Fabric Color: ${selectedColor} */
    const message = `Hello MazaTowel! 👋\n\nI want to order:\n- Item: ${selectedProduct?.name || (mode === 'towel' ? 'Personalized Towel' : 'Custom T-Shirt')}\n- Type: ${mode === 'towel' ? 'Egyptian Cotton Towel' : 'Custom Embroidered T-Shirt'}\n- Size: ${selectedSize}\n- Embroidery Text/Initials: ${text}${currentIsTShirt ? `\n- Placement: ${placement}` : ''}\n${customerName.trim() ? `- Customer Name: ${customerName.trim()}\n` : ''}${phone.trim() ? `- Mobile: +91 ${phone.trim()}\n` : ''}${city.trim() ? `- Delivery City: ${city.trim()}\n` : ''}${logoLine ? `${logoLine}\n` : ''}${notes.trim() ? `- Notes: ${notes.trim()}\n` : ''}\nPlease confirm my order details!`;
    const url = whatsapp(db.settings?.whatsapp, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }
    const cleanDigits = phone.trim().replace(/\D/g, '');
    if (cleanDigits.length !== 10 || !/^[6-9]/.test(cleanDigits)) {
      setFormError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const orderPayload = {
        productId: selectedProduct?.id || (mode === 'towel' ? 'P001' : 'P011'),
        product: selectedProduct?.name || (mode === 'towel' ? 'Personalized Towel' : 'Custom T-Shirt'),
        category: mode === 'towel' ? 'Towels' : 'Custom T-Shirts',
        size: selectedSize,
        quantity: 1,
        /* THREADS FEATURE PAUSED: thread: selectedThread, */
        towelColor: selectedColor,
        embroideryName: embroideryText.trim() || 'Custom Monogram',
        customerName: customerName.trim(),
        phone: cleanDigits,
        logoAttachment: logoAttachment || '',
        notes: `Placement: ${placement}. City: ${city.trim() || 'Not specified'}. ${notes.trim()}`,
        status: 'New'
      };
      await api('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      notify && notify('Your custom order enquiry has been saved! Opening WhatsApp to coordinate with our artisan…');
      handleWhatsApp(logoAttachment);
    } catch (err) {
      setFormError(err.message || 'Could not save order. Please order directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="shop-studio-panel shop-section-anchor" id="shop-studio">
      <div className="shop-section-header">
        <div className="shop-section-eyebrow">Interactive Custom Atelier</div>
        <h2 className="shop-section-title">All-in-One Custom Studio & Order Form</h2>
        <p className="shop-section-desc">
          Configure your bespoke towel or t-shirt, preview your stitched monogram in real-time, and order directly in one seamless step.
        </p>
      </div>

      <div className="shop-studio-grid">
        {/* Left column: Configuration form */}
        <form onSubmit={handleSubmitOrder} className="studio-form-col">
          {/* Step 1: Mode Switcher */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              1. Choose Product Category
            </label>
            <div className="studio-tab-selector">
              <button
                type="button"
                className={`studio-tab-btn ${mode === 'towel' ? 'active' : ''}`}
                onClick={() => handleModeChange('towel')}
              >
                🛁 Egyptian Cotton Towels
              </button>
              <button
                type="button"
                className={`studio-tab-btn ${mode === 'tshirt' ? 'active' : ''}`}
                onClick={() => handleModeChange('tshirt')}
              >
                👕 Custom T-Shirts
              </button>
            </div>
          </div>

          {/* Product Model Select */}
          <Field label={mode === 'towel' ? 'Select Towel Style' : 'Select T-Shirt Style'} required>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const prod = activeProducts.find(p => p.id === e.target.value);
                setSelectedProductId(e.target.value);
                if (prod?.size && mode === 'towel') setSelectedSize(prod.size);
              }}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', background: '#fff', fontSize: 14, fontWeight: 700 }}
            >
              {activeProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.size} ({money(p.price)})
                </option>
              ))}
            </select>
          </Field>

          {/* Size Pills */}
          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              {mode === 'towel' ? 'Dimensions & Size' : 'Apparel Fit & Size'}
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sizes.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: selectedSize === s ? '1.5px solid var(--teal-dark)' : '1px solid var(--line)',
                    background: selectedSize === s ? 'var(--soft)' : '#fff',
                    color: selectedSize === s ? 'var(--teal-dark)' : '#556669',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              Fabric Color: <span style={{ color: 'var(--teal-dark)', fontWeight: 800 }}>{selectedColor}</span>
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {availableColors.map(c => (
                <button
                  key={c.id || c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: selectedColor === c.name ? '3px solid var(--rose)' : '1.5px solid rgba(0,0,0,0.15)',
                    boxShadow: selectedColor === c.name ? '0 0 0 2px rgba(198,90,112,0.3)' : 'none',
                    cursor: 'pointer',
                    transform: selectedColor === c.name ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.18s ease'
                  }}
                />
              ))}
            </div>
          </div>
          */}

          {/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              Embroidery Thread Color: <span style={{ color: 'var(--teal-dark)', fontWeight: 800 }}>{selectedThread}</span>
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {availableThreads.slice(0, 9).map(t => (
                <button
                  key={t.id || t.name}
                  type="button"
                  onClick={() => setSelectedThread(t.name)}
                  title={`${t.name} (${t.finish || ''})`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 999,
                    border: selectedThread === t.name ? '2px solid var(--teal-dark)' : '1px solid var(--line)',
                    background: selectedThread === t.name ? 'var(--soft)' : '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: t.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          */}

          {/* Embroidery Text Input */}
          <div style={{ marginTop: 16 }}>
            <Field label="Embroidery Name / Monogram Initials" required help="Enter up to 35 characters for precision stitching.">
              <input
                maxLength={35}
                value={embroideryText}
                onChange={e => setEmbroideryText(e.target.value)}
                placeholder="Enter embroidery text"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', fontSize: 15, fontWeight: 600 }}
              />
            </Field>
          </div>

          {/* Placement selector for T-shirts */}
          {currentIsTShirt && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                Embroidery Placement
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLACEMENT_OPTIONS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlacement(p.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: placement === p.id ? '1.5px solid var(--teal-dark)' : '1px solid var(--line)',
                      background: placement === p.id ? 'var(--soft)' : '#fff',
                      color: placement === p.id ? 'var(--teal-dark)' : '#556669',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logo Attachment inside Custom Embroidery Personalization */}
          <div style={{ marginTop: 14 }}>
            <Field label="Attach Logo" optional help="PNG, JPG, WEBP, SVG or PDF (max 25MB).">
              {logoAttachment ? (
                <div style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1.5px solid #0d9488',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                    {/\.(png|jpe?g|webp|svg)$/i.test(logoAttachment) ? (
                      <img src={logoAttachment} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', padding: 2, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', background: '#e0f2fe', borderRadius: 6, fontSize: 16, flexShrink: 0 }}>📄</div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: '#059669', marginRight: 4 }}>✓</span>{logoFileName || 'Attached Logo'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#b42318',
                      borderRadius: '50%',
                      width: 26,
                      height: 26,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1
                    }}
                    title="Remove logo"
                    aria-label="Remove logo"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {uploadingLogo ? (
                      <span style={{ color: 'var(--teal2)', fontWeight: 700 }}>⏳ Uploading logo…</span>
                    ) : (
                      <span>Attach logo (Optional)</span>
                    )}
                  </div>
                  <label className="btn btn-secondary" style={{
                    margin: 0,
                    padding: '6px 14px',
                    fontSize: 12,
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    opacity: uploadingLogo ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>📎 Choose File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,application/pdf"
                      disabled={uploadingLogo}
                      style={{ display: 'none' }}
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
              {logoUploadError && (
                <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                  ⚠ {logoUploadError}
                </div>
              )}
            </Field>
          </div>

          {/* Customer Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
            <Field label="Your Name" required>
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid var(--line)', fontSize: 14 }}
              />
            </Field>
            <Field label="WhatsApp Mobile Number" required>
              <div className="phone-input-group">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  aria-label="10-digit WhatsApp number"
                />
              </div>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
            <Field label="Delivery City" optional>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Enter city"
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid var(--line)', fontSize: 14 }}
              />
            </Field>
            <Field label="Order Notes" optional>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Enter order notes"
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid var(--line)', fontSize: 14 }}
              />
            </Field>
          </div>

          {formError && (
            <div style={{ color: '#DC2626', fontSize: 13, fontWeight: 700, marginTop: 10 }}>
              ⚠ {formError}
            </div>
          )}

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={() => handleWhatsApp()}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
            >
              <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Order on WhatsApp
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
            >
              {submitting ? 'Submitting…' : 'Submit Order'}
            </button>
          </div>
        </form>

        {/* Right column: Live Fabric & Thread Preview */}
        <div className="studio-preview-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--teal-dark)' }}>
              ✦ Live Fabric & Stitch Preview
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
              {mode === 'towel' ? 'Towel View' : 'Apparel View'}
            </span>
          </div>

          <div
            className="studio-preview-canvas"
            style={{
              backgroundColor: selectedColorObj?.hex || '#FAFAFA',
              /* THREADS FEATURE PAUSED: color: selectedThreadObj?.hex || '#D4AF37', */
              color: '#2F7F82',
              border: ['#FFFFFF', '#FAFAFA'].includes(selectedColorObj?.hex?.toUpperCase()) ? '1px solid #E2E8F0' : 'none'
            }}
          >
            <div className="studio-preview-stitched-text">
              {embroideryText.trim() || 'Aarav'}
            </div>
            <div className="studio-preview-meta" style={{ color: '#666' }}>
              {/* THREADS FEATURE PAUSED: {selectedThreadObj?.name || 'Metallic Gold'} Thread • */}
              {selectedColorObj?.name || 'Fabric'}
            </div>
          </div>

          <div style={{ background: 'var(--soft)', borderRadius: 14, padding: '14px 16px', fontSize: 13, lineHeight: 1.5, color: '#455659' }}>
            <div><strong>Selected:</strong> {selectedProduct?.name} ({selectedSize})</div>
            <div style={{ marginTop: 4 }}><strong>Price:</strong> {money(selectedProduct?.price || 0)} <span style={{ color: 'var(--rose)', fontWeight: 700 }}>(Includes Custom Embroidery)</span></div>
            <div style={{ marginTop: 4 }}><strong>Artisan Guarantee:</strong> We share full digital mockups via WhatsApp to verify design and colors before stitch production.</div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onOpenModal && onOpenModal(selectedProduct)}
              style={{ width: '100%', fontSize: 13, justifyContent: 'center' }}
            >
              Open Full Studio →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Site() {
  const [db, setDb] = useState(null);
  const [productFilter, setProductFilter] = useState('All');
  const [designFilter, setDesignFilter] = useState('All');
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [reviewFilter, setReviewFilter] = useState('All');
  const [faqCategory, setFaqCategory] = useState('All');
  const [activeGalleryModal, setActiveGalleryModal] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [b2bSampleSector, setB2bSampleSector] = useState(null);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname || '/';
      const hash = window.location.hash?.replace('#', '') || '';
      const shopAnchors = ['shop-towels', 'shop-tshirts', 'shop-sets', 'shop-designs', 'shop-studio', 'shop-corporate', 'tshirts', 'designs', 'towels', 'shop'];
      if (p.includes('/shop') || shopAnchors.includes(hash)) {
        return 'shop';
      }
      if (['about', 'commercial', 'hygiene', 'gallery', 'reviews', 'faq', 'how'].includes(hash)) {
        return 'info';
      }
    }
    return 'shop';
  });
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    api('/api/site').then(setDb).catch(() => setDb({ error: true }));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname || '/';
      const hash = window.location.hash?.replace('#', '') || '';
      const shopAnchors = ['shop-towels', 'shop-tshirts', 'shop-sets', 'shop-designs', 'shop-studio', 'shop-corporate', 'tshirts', 'designs', 'towels', 'shop'];
      const infoAnchors = ['commercial', 'hygiene', 'about', 'gallery', 'reviews', 'faq', 'how'];
      if (p.includes('/shop') || shopAnchors.includes(hash)) {
        setActiveTab('shop');
        window.history.replaceState({}, '', hash ? `/#${hash}` : '/#shop-towels');
        if (hash) {
          setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 120);
        }
      } else if (infoAnchors.includes(hash) || infoAnchors.includes(p.replace('/', ''))) {
        setActiveTab('info');
        const targetHash = hash || p.replace('/', '');
        window.history.replaceState({}, '', `/#${targetHash}`);
        setTimeout(() => document.getElementById(targetHash)?.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, []);

  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash?.replace('#', '') || '';
      const shopAnchors = ['shop-towels', 'shop-tshirts', 'shop-sets', 'shop-designs', 'shop-studio', 'shop-corporate', 'tshirts', 'designs', 'towels', 'shop'];
      const infoAnchors = ['commercial', 'hygiene', 'about', 'gallery', 'reviews', 'faq', 'how'];
      if (shopAnchors.includes(hash)) {
        setActiveTab('shop');
      } else if (infoAnchors.includes(hash)) {
        setActiveTab('info');
      }
      if (hash) {
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 70);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (activeGalleryModal || b2bSampleSector)) {
        setActiveGalleryModal(null);
        setB2bSampleSector(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryModal, b2bSampleSector]);

  // Real-time visitor heartbeat & live activity reporting
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('mt_session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('mt_session_id', sessionId);
      }
    } catch {
      sessionId = `sess_${Date.now()}`;
    }

    const getDevice = () => {
      const w = window.innerWidth;
      if (w < 768) return 'Mobile';
      if (w < 1024) return 'Tablet';
      return 'Desktop';
    };

    const getSection = () => {
      const hash = window.location.hash?.replace('#', '') || '';
      if (hash.includes('towel')) return 'Towels Collection';
      if (hash.includes('tshirt')) return 'Custom T-Shirts';
      if (hash.includes('commercial') || hash.includes('corporate')) return 'Commercial B2B';
      if (hash.includes('studio')) return 'Custom Studio Atelier';
      if (hash.includes('design')) return 'Embroidery Motifs';
      if (hash.includes('about')) return 'Brand Story';
      if (hash.includes('gallery')) return 'Customer Gallery';
      if (hash.includes('review')) return 'Google Reviews';
      if (activeTab === 'info') return 'Institutional Overview';
      return 'Home Storefront';
    };

    const ping = (action = '') => {
      try {
        fetch('/api/realtime/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            page: window.location.pathname + window.location.hash,
            section: getSection(),
            device: getDevice(),
            action
          }),
          keepalive: true
        }).catch(() => {});
      } catch {}
    };

    // Initial ping on entry
    ping('Entered Store');

    // Periodic heartbeat every 25 seconds
    const interval = setInterval(() => ping(), 25000);

    // Visibility change listener
    const onVisibility = () => {
      if (document.visibilityState === 'visible') ping('Re-engaged Tab');
    };
    document.addEventListener('visibilitychange', onVisibility);

    // On page departure / tab close
    const onLeave = () => {
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/realtime/leave', JSON.stringify({ sessionId }));
        }
      } catch {}
    };
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('beforeunload', onLeave);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [activeTab]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.history.pushState({}, '', tab === 'shop' ? '/#shop-home' : '/#business-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (to) => {
    let effectiveTo = to;
    if (to === '/gallery') effectiveTo = '/#gallery';
    else if (to === '/about') effectiveTo = '/#about';
    else if (to === '/reviews') effectiveTo = '/#reviews';
    else if (to === '/faq') effectiveTo = '/#faq';
    else if (to === '/how') effectiveTo = '/#how';
    else if (to === '/family-sets') effectiveTo = '/#shop-sets';
    else if (to === '/commercial' || to === '/#commercial') effectiveTo = '/#shop-commercial';
    else if (to === '/hygiene') effectiveTo = '/#hygiene';
    else if (to === '/tshirts') effectiveTo = '/#shop-tshirts';
    else if (to === '/designs') effectiveTo = '/#shop-designs';
    else if (to === '/corporate') effectiveTo = '/#shop-commercial';
    else if (to === '/shop' || to === '/shop#shop-towels') effectiveTo = '/#shop-towels';

    const [pathPart, anchor] = effectiveTo.split('#');

    const shopAnchors = ['shop-home', 'shop-towels', 'shop-tshirts', 'shop-sets', 'shop-commercial', 'commercial', 'shop-designs', 'shop-studio', 'shop-corporate', 'tshirts', 'designs', 'towels', 'shop'];
    const infoAnchors = ['business-home', 'hygiene', 'about', 'gallery', 'reviews', 'faq', 'how', 'stats', 'trust', 'customers'];

    if (shopAnchors.includes(anchor)) {
      setActiveTab('shop');
    } else if (infoAnchors.includes(anchor)) {
      setActiveTab('info');
    }

    window.history.pushState({}, '', anchor ? `/#${anchor}` : '/');

    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 70);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!db) return <div className="boot"><div className="spinner" />Loading MazaTowel…</div>;
  if (db.error) return (
    <div className="load-error">
      <h1>We couldn't load the website right now.</h1>
      <p>Please start the MazaTowel server and refresh this page.</p>
    </div>
  );

  const { settings, content, stats } = db;
  const allProducts = published(db.products);
  const products = allProducts;
  const towelProducts = allProducts.filter(p => p.category !== 'Custom T-Shirts');
  const tshirtProducts = allProducts.filter(p => p.category === 'Custom T-Shirts');
  const designs = published(db.designs);
  const categories = ['All', 'Bath Towels', 'Face Towels', 'Hand Towels', 'Kids Towels'];

  const filteredProducts = towelProducts.filter(p =>
    (productFilter === 'All' || p.category === productFilter) &&
    `${p.name || ''} ${p.size || ''} ${p.category || ''} ${p.desc || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDesigns = designs.filter(d => designFilter === 'All' || d.category === designFilter);

  const galleryPhotos = published(db.gallery);
  const filteredGalleryPhotos = galleryPhotos.filter(photo => {
    if (galleryFilter === 'All' || galleryFilter === 'All Moments') return true;
    const text = `${photo.alt || ''} ${photo.id || ''}`.toLowerCase();
    if (galleryFilter === 'Weddings & Gifts') return text.includes('couple') || text.includes('wedding');
    if (galleryFilter === 'Bath & Vanity') return text.includes('vanity') || text.includes('face') || text.includes('monogram') || text.includes('threadwork');
    if (galleryFilter === 'Boutique Resorts') return text.includes('hotel') || text.includes('resort') || text.includes('spa');
    if (galleryFilter === 'Family & Keepsakes') return text.includes('kid') || text.includes('child') || text.includes('baby') || text.includes('family') || text.includes('unboxing');
    return true;
  });

  const reviewItems = published(db.reviews).filter(r => r.source !== 'Google' || !settings.googleReviewsEnabled);
  const filteredReviews = reviewItems.filter(r => {
    if (reviewFilter === 'All' || reviewFilter === 'All Reviews') return true;
    const text = `${r.text || ''} ${r.name || ''}`.toLowerCase();
    if (reviewFilter === 'Weddings & Gifts') return text.includes('wedding') || text.includes('anniversary') || text.includes('couple') || text.includes('gift');
    if (reviewFilter === 'Family & Kids') return text.includes('family') || text.includes('kid') || text.includes('unicorn') || text.includes('children');
    if (reviewFilter === 'Luxury Towels') return text.includes('cotton') || text.includes('plush') || text.includes('embroidery') || text.includes('peacock');
    return true;
  });

  const faqItems = published(db.faqs);
  const filteredFaqs = faqItems.filter(f => {
    if (faqCategory === 'All' || faqCategory === 'All FAQs') return true;
    const text = `${f.q || ''} ${f.a || ''}`.toLowerCase();
    if (faqCategory === 'Personalization & Proofs') return text.includes('name') || text.includes('design') || text.includes('production') || text.includes('see');
    if (faqCategory === 'Shipping & Delivery') return text.includes('deliver') || text.includes('shipping') || text.includes('india');
    if (faqCategory === 'Payment & Advance') return text.includes('cod') || text.includes('payment') || text.includes('advance');
    if (faqCategory === 'Ordering & WhatsApp') return text.includes('order') || text.includes('whatsapp') || text.includes('work');
    return true;
  });

  // =========================================================================
  // 1. DEDICATED BUSINESS & COMPANY INFORMATION EXPERIENCE
  // =========================================================================
  const renderBusinessPage = () => (
    <>
      {/* 1. DEDICATED BUSINESS & STORY HERO */}
      <section className="hero hero-atelier-luxury" id="business-home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-luxury-badge">
              <span>✦</span> MazaTowel Atelier • Textile Craftsmanship & Heritage
            </div>
            <h1>Textile Heritage, Medical Hygiene & Master Needlework.</h1>
            <p>
              Discover our story, strict 5-stage cleanroom sanitization protocol, Japanese Tajima multi-head machinery, and verified client testimonials.
            </p>
            <div className="hero-actions">
              <a
                href="#hygiene"
                className="btn btn-primary"
                onClick={(e) => { e.preventDefault(); document.getElementById('hygiene')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Cleanroom Hygiene ↓
              </a>
              <a
                className="btn btn-secondary hero-wa-btn"
                href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={18} /> Chat on WhatsApp
              </a>
            </div>
            <div className="hero-reassurance-ribbon">
              <span className="hero-reassurance-item"><span className="check">✓</span> 600 GSM Combed Cotton</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> German Madeira Threads</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> Medical Cleanroom Packaging</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> Nashik Artisan Studio</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-product-stage">
              <div className="towel-scene">
                <div className="hero-towel towel-back">
                  <img src="/uploads/gallery/macro-threadwork.jpg" alt="Master Embroidery Threadwork" className="hero-towel-img" />
                </div>
                <div className="hero-towel towel-front">
                  <img src="/uploads/products/bath-towel-maza.jpg" alt="MAZA Monogram Luxury Bath Towel" className="hero-towel-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ATELIER BENCHMARKS */}
      <section className="section-stats-atelier" id="stats">
        <div className="container">
          <div className="stats-atelier-head">
            <div className="stats-atelier-eyebrow">✦ ATELIER BENCHMARKS</div>
            <h2 className="stats-atelier-title">Precision Craftsmanship at Scale.</h2>
          </div>
          <div className="stats-atelier-grid">
            <div className="stat-card-gold">
              <div className="stat-card-num">
                <Metric value={stats?.towelsSold || 5000} label="" />
              </div>
              <div className="stat-card-label">Towels & Linens Delivered</div>
            </div>
            <div className="stat-card-gold">
              <div className="stat-card-num">
                <Metric value={stats?.designsMade || 1200} label="" />
              </div>
              <div className="stat-card-label">Bespoke Motifs & Crests</div>
            </div>
            <div className="stat-card-gold">
              <div className="stat-card-num">4.9 ★</div>
              <div className="stat-card-label">Verified Client Love</div>
            </div>
            <div className="stat-card-gold">
              <div className="stat-card-num">24-48h</div>
              <div className="stat-card-label">Turnaround Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ATELIER QUALITY STANDARDS */}
      <section className="section-trust-atelier" id="trust">
        <div className="container">
          <SectionHead
            eyebrow="✦ THE MAZATOWEL STANDARD"
            title="Uncompromising Quality in Every Fiber."
          />
          <div className="trust-cards-grid">
            {[
              ['✦', 'Master Artisan Embroidery', 'High-density German Madeira rayon & poly threads that never fray or fade across 100+ machine washes.'],
              ['☁', '100% Combed Aegean Cotton', '600 GSM zero-twist plush terry loops engineered for instant, cloud-like water absorption.'],
              ['💬', 'Digital Proof on WhatsApp', 'You receive a realistic digital preview to approve the exact font, size, and layout before needle hits fabric.'],
              ['🚚', 'Pan-India Safe Delivery', `Hermetically sealed in moisture-barrier packaging and delivered safely to your doorstep for ₹${settings.shipping}.`],
              ['🎁', 'Keepsake & Corporate Ready', 'From single personalized newborn gifts to 500+ branded sets for luxury boutique resorts.']
            ].map(([icon, title, desc]) => (
              <div className="trust-card-elevated" key={title}>
                <div className="trust-card-icon-wrap">{icon}</div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEDICAL-GRADE CLEAN ROOM HYGIENE PROTOCOL */}
      <section className="section page-section section-hygiene-cleanroom-wrap" id="hygiene">
        <div className="container">
          <div className="section-hygiene-cleanroom">
            <div className="hygiene-cleanroom-inner">
              <div>
                <div className="hygiene-badge-shield">🛡 Medical-Grade Cleanliness Protocol</div>
                <h2 className="hygiene-cleanroom-title">{content.hygieneTitle}</h2>
                <p className="hygiene-cleanroom-text">{content.hygieneText}</p>
                <div className="hygiene-cleanroom-note">
                  <span className="note-icon">💡</span>
                  <div>
                    <strong>Care & Hygiene Note</strong>
                    <div style={{ marginTop: 3 }}>{content.hygieneNote}</div>
                  </div>
                </div>
                <div className="hygiene-trust-pills">
                  <span className="hygiene-trust-pill">✦ 100% Combed Cotton</span>
                  <span className="hygiene-trust-pill">✦ Madeira Colorfast Thread</span>
                  <span className="hygiene-trust-pill">✦ Steam-Sanitized Pack</span>
                </div>
              </div>
              <div className="hygiene-cleanroom-checklist">
                {(content.hygienePoints || []).map((point, idx) => {
                  const t = String(point.title || '').toLowerCase();
                  let icon = '👤';
                  if (t.includes('personal') || t.includes('shar') || t.includes('own')) icon = '👤';
                  else if (t.includes('wash') || t.includes('sanit') || t.includes('clean') || t.includes('temp')) icon = '🧼';
                  else if (t.includes('dry') || t.includes('air') || t.includes('loop') || t.includes('moist')) icon = '💨';
                  else if (t.includes('store') || t.includes('pack') || t.includes('seal') || t.includes('box')) icon = '📦';
                  else {
                    const fallbackIcons = ['👤', '🧼', '💨', '📦'];
                    icon = fallbackIcons[idx % fallbackIcons.length];
                  }

                  return (
                    <div className="hygiene-check-card" key={point.title || idx}>
                      <div className="hygiene-card-top">
                        <div className="hygiene-card-icon-bubble">{icon}</div>
                        <span className="hygiene-card-badge">✓ Verified</span>
                      </div>
                      <div className="hygiene-card-body">
                        <h4>{point.title}</h4>
                        <p>{point.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ATELIER HERITAGE & CRAFTSMANSHIP */}
      <section className="section alt page-section section-about-heritage" id="about">
        <div className="container">
          <div className="about-heritage-grid">
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>✦ ATELIER HERITAGE</div>
              <div className="about-heritage-plaque">✦ Estd. 26 June 2025 • Nashik, Maharashtra</div>
              <h2 className="about-heritage-title">{content.aboutTitle}</h2>
              <p className="about-heritage-copy">{content.aboutText}</p>
              <div className="about-heritage-stats-rail">
                <div className="about-rail-tile">
                  <strong>{settings.established || '2025'}</strong>
                  <span>Founded in Nashik</span>
                </div>
                <div className="about-rail-tile">
                  <strong>100%</strong>
                  <span>Indian Artisan Made</span>
                </div>
                <div className="about-rail-tile">
                  <strong>Direct</strong>
                  <span>WhatsApp Concierge</span>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/uploads/gallery/macro-threadwork.jpg"
                alt="Master Embroidery Macro Threadwork in Nashik Atelier"
                style={{ borderRadius: 20, boxShadow: '0 16px 40px rgba(23,59,64,0.12)', width: '100%', objectFit: 'cover', maxHeight: 380 }}
              />
            </div>
          </div>

          {content.whyPoints && content.whyPoints.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <SectionHead
                eyebrow="✦ THE VALUE OF PERSONALIZATION"
                title={content.whyTitle}
              />
              <div className="why-grid">
                {content.whyPoints.map((point, idx) => (
                  <div className="why-card" key={point.title || idx}>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. 4-STEP BESPOKE JOURNEY */}
      <section className="section-journey-timeline" id="how">
        <div className="container">
          <SectionHead
            eyebrow="✦ THE BESPOKE JOURNEY"
            title="From Your Imagination to the Final Stitch."
          />
          <div className="journey-timeline-grid">
            {[
              {
                step: '01',
                title: 'Select Your Canvas',
                desc: 'Pick your preferred towel dimensions, GSM thickness, and pure cotton colorway.'
              },
              {
                step: '02',
                title: 'Personalize Details',
                desc: 'Share names, initials, choose your typography style, and select Madeira thread shades.'
              },
              {
                step: '03',
                title: 'Approve on WhatsApp',
                desc: 'Our design master generates a realistic 3D digital stitch simulation for your approval.'
              },
              {
                step: '04',
                title: 'Crafted & Express Shipped',
                desc: 'Stitched on industrial Japanese multi-head machines, sanitized, and safely delivered.'
              }
            ].map(step => (
              <div className="journey-timeline-card" key={step.title}>
                <div className="journey-step-badge">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. REAL WORK GALLERY */}
      <section className="section page-section section-gallery-archive" id="gallery">
        <div className="container">
          <SectionHead
            eyebrow="✦ REAL WORK GALLERY"
            title="Real Stitches. Real Celebrations."
          />
          
          <div className="gallery-filter-bar">
            {['All Moments', 'Bath & Vanity', 'Weddings & Gifts', 'Boutique Resorts', 'Family & Keepsakes'].map(cat => (
              <button
                type="button"
                key={cat}
                className={`gallery-filter-pill ${galleryFilter === cat ? 'active' : ''}`}
                onClick={() => setGalleryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredGalleryPhotos.length > 0 ? (
            <div className="gallery-grid-lux">
              {filteredGalleryPhotos.map(photo => (
                <div
                  className="gallery-card-lux"
                  key={photo.id}
                  onClick={() => setActiveGalleryModal(photo)}
                  title={photo.alt || 'Bespoke MazaTowel Piece'}
                >
                  <img src={photo.image} alt={photo.alt || 'MazaTowel work'} loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ textAlign: 'center' }}>
              <strong>Custom embroidery gallery.</strong>
              <p className="muted">Chat with us on WhatsApp to view photos of our recent personalized towel creations.</p>
            </div>
          )}
        </div>
      </section>

      {/* 9. PRESTIGE HOSPITALITY & CORPORATE CLIENTS */}
      <section className="section customer-section section-clients-prestige" id="customers">
        <div className="container">
          <SectionHead
            eyebrow="✦ TRUSTED BY PRESTIGE BRANDS"
            title="Supplying India's Leading Boutique Retreats & Clubs."
          />
          {published(db.customers).length > 0 ? (
            <CustomerCarousel customers={published(db.customers)} />
          ) : (
            <div className="empty" style={{ textAlign: 'center' }}>
              <strong>Bulk and corporate orders available.</strong>
              <p className="muted">We create custom embroidery for boutique hotels, salons, studios, and corporate gifting.</p>
            </div>
          )}
        </div>
      </section>

      {/* 10. VERIFIED CUSTOMER REVIEWS */}
      <section className="section alt page-section section-reviews-verified" id="reviews">
        <div className="container">
          <SectionHead
            eyebrow="✦ CUSTOMER EXPERIENCES"
            title="What Our Customers Say"
          />
          <div className="review-score-banner">
            <div className="review-score-rating">
              <span className="review-score-stars">★★★★★</span>
              <span className="review-score-text">4.9 / 5.0 Average Rating • 850+ Verified Orders Across India</span>
            </div>
            <div className="review-filter-bar">
              {['All Reviews', 'Weddings & Gifts', 'Family & Kids', 'Luxury Towels'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`review-filter-pill ${reviewFilter === cat ? 'active' : ''}`}
                  onClick={() => setReviewFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <GoogleReviews enabled={settings.googleReviewsEnabled} />

          <div className="review-grid">
            {filteredReviews.map(r => (
              <article className="review-card" key={r.id}>
                <div className="stars">{'★'.repeat(Math.max(0, Math.min(5, Number(r.rating))))}</div>
                <p className="review-text">“{r.text}”</p>
                <div className="review-meta">
                  <div>
                    <strong>{r.name}</strong>
                    <div className="review-badge-verified">✓ Verified Purchase</div>
                  </div>
                  <span className="review-source-meta">
                    {r.source === 'WhatsApp' && <WhatsAppIcon size={13} className="social-inline-icon wa" />}
                    {r.source === 'Instagram' && <InstagramIcon size={13} className="social-inline-icon ig" />}
                    {r.source === 'Facebook' && <FacebookIcon size={13} className="social-inline-icon fb" />}
                    <span>{r.source} • {r.date}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11. ATELIER KNOWLEDGE BASE & CONCIERGE */}
      <section className="section page-section section-faq-concierge" id="faq">
        <div className="container">
          <SectionHead
            eyebrow="✦ FREQUENTLY ASKED QUESTIONS"
            title="Everything You Need to Know Before Ordering."
          />
          <div className="faq-container-slick">
            <div className="faq-filter-bar" style={{ justifyContent: 'center' }}>
              {['All FAQs', 'Personalization & Proofs', 'Shipping & Delivery', 'Payment & Advance', 'Ordering & WhatsApp'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`faq-filter-pill ${faqCategory === cat ? 'active' : ''}`}
                  onClick={() => setFaqCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="faq-list">
              {filteredFaqs.map(f => (
                <Faq key={f.id} {...f} />
              ))}
            </div>
            <div className="faq-bottom-cta">
              <span className="faq-bottom-text">Have a special custom motif or need commercial assistance?</span>
              <a
                className="btn btn-whatsapp"
                href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={16} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. GRAND FINALE STORY INVITATION */}
      <section className="section-cta-finale">
        <div className="container cta-finale-inner">
          <div className="cta-finale-badge">✦ BESPOKE ATELIER CONCIERGE ✦</div>
          <h2 className="cta-finale-title">{content?.finalTitle || 'Have Questions About Our Linens or Craft?'}</h2>
          <p className="cta-finale-desc">
            {content?.finalText || 'Speak directly with our embroidery specialists in Nashik or explore our complete catalog of personalized towels, custom t-shirts, and commercial sets in the Shop.'}
          </p>
          <div className="cta-finale-actions">
            <button
              type="button"
              className="btn-gold-primary"
              onClick={() => handleSelectTab('shop')}
            >
              🛍️ Explore Shop →
            </button>
            <a
              className="btn btn-whatsapp hero-wa-btn"
              href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Chat on WhatsApp
            </a>
          </div>
          <div className="cta-finale-guarantees">
            <span>✓ 600 GSM High-Absorbency Terry</span>
            <span>✓ 100+ Machine Wash Durability</span>
            <span>✓ Digital Proof on WhatsApp</span>
            <span>✓ Pan-India Doorstep Logistics</span>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {activeGalleryModal && (
        <div
          className="gallery-lightbox-overlay"
          onClick={() => setActiveGalleryModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gallery-lightbox-card" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setActiveGalleryModal(null)}
              aria-label="Close image details"
            >
              ✕
            </button>
            <div className="gallery-lightbox-media">
              <img src={activeGalleryModal.image} alt={activeGalleryModal.alt || 'Embroidery piece'} />
            </div>
            <div className="gallery-lightbox-info">
              <div>
                <span className="eyebrow" style={{ color: 'var(--teal-strong)' }}>✦ Real Atelier Moment</span>
                <h3 style={{ fontSize: 22, color: 'var(--teal-dark)', margin: '8px 0 12px', fontFamily: 'Playfair Display, serif' }}>
                  {activeGalleryModal.alt || 'Bespoke MazaTowel Creation'}
                </h3>
                <p style={{ color: '#5D6D70', fontSize: 14.5, lineHeight: 1.6, marginBottom: 18 }}>
                  Hand-inspected and embroidered in our Nashik studio. Designed with high-density German Madeira threads for zero color bleeding and lifelong durability.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#3A4D50' }}>
                  <span>✓ <strong>Fabric:</strong> 100% Ring-Spun Combed Cotton</span>
                  {/* THREADS FEATURE PAUSED: <span>✓ <strong>Thread:</strong> Madeira Polyneon / Metallic Silk</span> */}
                  <span>✓ <strong>Finish:</strong> Hand-Trimmed & Hypoallergenic Pre-Washed</span>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <a
                  className="btn btn-primary"
                  href={whatsapp(settings.whatsapp, `Hello MazaTowel! I love this creation from your gallery (${activeGalleryModal.alt}). Can you please share pricing and options for a similar order?`)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <WhatsAppIcon size={16} /> Inquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // =========================================================================
  // 2. DEDICATED BESPOKE SHOP ATELIER EXPERIENCE (SELLING & PRODUCTS ONLY)
  // =========================================================================
  const renderSellingPage = () => (
    <>
      {/* 1. DEDICATED SHOP HERO */}
      <section className="hero hero-atelier-luxury" id="shop-home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-luxury-badge">
              <span>✦</span> {content?.heroBadge || 'Bespoke Handcrafted Linens & Apparel • Nashik, India'}
            </div>
            <h1>{content?.heroHeading || 'Personalized Luxury Towels & Embroidered Apparel'}</h1>
            <p>
              {content?.heroText || 'Handcrafted 100% combed cotton towels, custom bio-washed t-shirts, and heirloom family sets. Personalize with your name, monogram, or crest with zero minimum order.'}
            </p>
            <div className="hero-actions">
              <a
                href="#shop-towels"
                className="btn btn-primary"
                onClick={(e) => { e.preventDefault(); document.getElementById('shop-towels')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Browse Towels ↓
              </a>
              <a
                href="#shop-studio"
                className="btn btn-secondary"
                onClick={(e) => { e.preventDefault(); document.getElementById('shop-studio')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                ⚡ Live Studio
              </a>
            </div>
            <div className="hero-reassurance-ribbon">
              <span className="hero-reassurance-item"><span className="check">✓</span> 100% Combed Cotton</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> Digital Proof on WhatsApp First</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> Zero Minimum Orders</span>
              <span className="hero-reassurance-item"><span className="check">✓</span> ₹{settings.shipping} Pan-India Delivery</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-product-stage">
              <div className="towel-scene">
                <div className="hero-towel towel-back">
                  <img src="/uploads/products/hand-towel-aarav.jpg" alt="Aarav Embroidered Hand Towel" className="hero-towel-img" />
                </div>
                <div className="hero-towel towel-front">
                  <img src="/uploads/products/bath-towel-maza.jpg" alt="MAZA Monogram Luxury Bath Towel" className="hero-towel-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: TOWELS COLLECTION */}
      <section className="section page-section shop-section-anchor" id="shop-towels">
        <div className="container">
          <div className="shop-section-header">
            <div className="shop-section-eyebrow">Signature Cotton</div>
            <h2 className="shop-section-title">Personalized Combed Cotton Towels</h2>
            <p className="shop-section-desc">
              100% combed cotton towels custom-embroidered with your name, initials or monogram. Pick your towel size and style below.
            </p>
          </div>

          <div className="shop-tools" style={{ marginBottom: 28 }}>
            <div className="search-box">
              <input
                aria-label="Search towels"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Enter search keywords"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <CloseIcon size={13} strokeWidth={2.4} />
                </button>
              )}
            </div>
            <div className="design-tools">
              {categories.map(c => (
                <button
                  key={c}
                  className={`filter-btn ${productFilter === c ? 'active' : ''}`}
                  onClick={() => setProductFilter(c)}
                >
                  {c === 'All' ? 'All Towels' : c}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map(p => (
              <article className="product-card" key={p.id}>
                <div className="product-media">
                  <div className="product-image">
                    <img src={imageFor(p)} alt={`${p.name} — ${p.size}`} loading="lazy" />
                  </div>
                  {p.badge && (
                    <div className={`product-chip ${p.bestSeller ? 'chip-bestseller' : p.badge.includes('₹') ? 'chip-price' : ''}`}>
                      {p.badge}
                    </div>
                  )}
                </div>
                <div className="product-body">
                  <div className="product-meta-row">
                    <span className="product-size-tag">{p.size}</span>
                    <span className="product-category-tag">{p.category}</span>
                  </div>
                  {/* FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
                  {(() => {
                    const pColors = (db.colors || []).filter(c => {
                      if (c.published === false) return false;
                      if (!c.sizes || c.sizes.length === 0) return true;
                      if (c.sizes.includes('All Sizes')) return true;
                      return c.sizes.includes(p.size);
                    });
                    if (!pColors.length) return null;
                    return (
                      <div className="product-swatches-strip">
                        <span className="swatches-label">Colors:</span>
                        <div className="swatches-dots">
                          {pColors.slice(0, 5).map(c => (
                            <span
                              key={c.id}
                              className={`swatch-circle-sm ${c.inStock === false ? 'oos' : ''}`}
                              style={{ backgroundColor: c.hex }}
                              title={`${c.name} (${c.inStock !== false ? 'In Stock' : 'Out of Stock'})`}
                            />
                          ))}
                          {pColors.length > 5 && (
                            <span className="swatch-more-tag">+{pColors.length - 5}</span>
                          )}
                        </div>
                        <span className="swatches-stock-note">
                          {pColors.filter(c => c.inStock !== false).length} in stock
                        </span>
                      </div>
                    );
                  })()}
                  */}
                  <h3 className="product-title">{p.name}</h3>
                  <p className="product-desc">{p.desc}</p>
                  <div className="product-footer">
                    <div className="product-price-box">
                      <span className="product-price-val">{money(p.price)}</span>
                      <span className="product-price-note">✓ Includes Embroidery</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary product-cta-btn"
                      onClick={() => setModal({ product: p })}
                      title={`Customize ${p.name}`}
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <div className="empty" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <strong>No towels match your search.</strong>
                <p className="muted">Try adjusting your search terms or select another category above.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: CUSTOM EMBROIDERED T-SHIRTS */}
      <section className="section alt page-section shop-section-anchor" id="shop-tshirts">
        <div id="tshirts" style={{ position: 'relative', top: '-140px', visibility: 'hidden' }} />
        <div className="container">
          <div className="shop-section-header">
            <div className="shop-section-eyebrow">Bespoke Apparel</div>
            <h2 className="shop-section-title">Custom Embroidered T-Shirts & Polos</h2>
            <p className="shop-section-desc">
              Heavyweight 240+ GSM combed cotton & pique collar polo tees engineered for crisp chest monograms, club crests, and company branding.
            </p>
          </div>

          <div className="tshirt-grid">
            <article className="tshirt-card">
              <div className="tshirt-media">
                <img
                  src="/uploads/tshirts/custom-embroidered-polos.jpg"
                  alt="Custom Embroidered Collar Polo T-Shirt"
                  loading="lazy"
                />
                <div className="tshirt-chip chip-polo">Corporate & Hospitality</div>
              </div>
              <div className="tshirt-body">
                <div className="tshirt-meta">
                  <span className="tshirt-tag">Pique & Combed Cotton</span>
                  <span className="tshirt-fit">Regular & Slim Fit</span>
                </div>
                <h3>Custom Embroidered Polo & Collar Tees</h3>
                <p className="tshirt-desc">
                  Engineered for corporate staff, café teams, hospitality uniforms and upscale golf/club wear. Embroidered with crisp chest crests, company logos or individual names.
                </p>
                <ul className="tshirt-perks">
                  <li>✦ 240+ GSM breathable combed pique fabric</li>
                  <li>✦ High-density chest monogram or pocket embroidery</li>
                  <li>✦ Colors: Sage Green, Navy, Royal Blue, White, Black</li>
                  <li>✦ Available in sizes: 38 to 46 inch</li>
                </ul>
                <div className="tshirt-footer">
                  <div className="tshirt-price-wrap">
                    <span className="tshirt-from">Starting from</span>
                    <span className="tshirt-price">₹499</span>
                    <small>incl. embroidery</small>
                  </div>
                  <div className="tshirt-btn-group">
                    <button
                      type="button"
                      className="btn btn-primary tshirt-action-btn"
                      onClick={() => setModal({
                        product: tshirtProducts.find(p => p.id === 'P011') || {
                          id: 'P011',
                          name: 'Classic Embroidered Polo T-Shirt',
                          category: 'Custom T-Shirts',
                          size: '40 inch',
                          price: 499
                        }
                      })}
                    >
                      Customize
                    </button>
                    <a
                      className="btn btn-whatsapp tshirt-action-btn"
                      href={whatsapp(settings.whatsapp, 'Hello MazaTowel! I would like to order custom embroidered Polo T-shirts. Please share catalog and details.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <WhatsAppIcon size={17} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>

            <article className="tshirt-card">
              <div className="tshirt-media">
                <img
                  src="/uploads/tshirts/custom-oversized-embroidered-tee.jpg"
                  alt="Custom Oversized Embroidered Streetwear T-Shirt"
                  loading="lazy"
                />
                <div className="tshirt-chip chip-street">Streetwear & Monograms</div>
              </div>
              <div className="tshirt-body">
                <div className="tshirt-meta">
                  <span className="tshirt-tag">100% Bio-Washed Cotton</span>
                  <span className="tshirt-fit">Oversized & Drop-Shoulder</span>
                </div>
                <h3>Oversized Monogram & Minimalist Tees</h3>
                <p className="tshirt-desc">
                  Contemporary drop-shoulder tees with subtle, premium metallic or contrast thread embroidery. Designed for personal gifting, couple sets, creator merch and aesthetic daily wear.
                </p>
                <ul className="tshirt-perks">
                  <li>✦ Heavyweight 220+ GSM French terry / bio-washed cotton</li>
                  <li>✦ Minimalist typography, custom initials or center-chest embroidery</li>
                  <li>✦ Shrink-resistant, color-fast premium fabric</li>
                  <li>✦ Available in sizes: 38 to 46 inch</li>
                </ul>
                <div className="tshirt-footer">
                  <div className="tshirt-price-wrap">
                    <span className="tshirt-from">Starting from</span>
                    <span className="tshirt-price">₹449</span>
                    <small>incl. embroidery</small>
                  </div>
                  <div className="tshirt-btn-group">
                    <button
                      type="button"
                      className="btn btn-primary tshirt-action-btn"
                      onClick={() => setModal({
                        product: tshirtProducts.find(p => p.id === 'P012') || {
                          id: 'P012',
                          name: 'Oversized Embroidered Streetwear Tee',
                          category: 'Custom T-Shirts',
                          size: '40 inch',
                          price: 449
                        }
                      })}
                    >
                      Customize
                    </button>
                    <a
                      className="btn btn-whatsapp tshirt-action-btn"
                      href={whatsapp(settings.whatsapp, 'Hello MazaTowel! I would like to order custom Oversized Embroidered T-shirts. Please share catalog and details.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <WhatsAppIcon size={17} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="tshirt-highlights" style={{ marginTop: 40 }}>
            <div className="tshirt-highlight-card">
              <span className="highlight-icon">🧵</span>
              <h4>Precision Computerized Needlework</h4>
              <p>Ultra-dense multi-head embroidery using tear-resistant Japanese threads that stay crisp wash after wash.</p>
            </div>
            <div className="tshirt-highlight-card">
              <span className="highlight-icon">👕</span>
              <h4>Premium Pure Cotton Fabrics</h4>
              <p>Combed, bio-washed and pique knits with breathable comfort and soft touch.</p>
            </div>
            <div className="tshirt-highlight-card">
              <span className="highlight-icon">📦</span>
              <h4>Flexible Quantities</h4>
              <p>Order a single personalized statement tee, a couple pair, or bulk corporate orders seamlessly.</p>
            </div>
            <div className="tshirt-highlight-card">
              <span className="highlight-icon">✓</span>
              <h4>Pre-Production Mockups</h4>
              <p>We share full digital mockups via WhatsApp to confirm placement, font and colors before production.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CURATED FAMILY & COUPLE SETS */}
      <div className="shop-section-anchor">
        <FamilyShowcase
          settings={settings}
          products={products}
          onSelectProduct={p => setModal({ product: p })}
        />
      </div>

      {/* SECTION 4: COMMERCIAL ATELIER SOLUTIONS (PARLOURS, SALONS, GYMS, CORPORATE GIFTS) */}
      <section className="section page-section shop-section-anchor section-commercial-atelier" id="shop-commercial">
        <div id="commercial" style={{ position: 'relative', top: '-140px', visibility: 'hidden' }} />
        <div className="container">
          <CommercialShowcase
            settings={settings}
            onOpenSampleModal={(sectorId) => setB2bSampleSector(sectorId)}
          />
        </div>
      </section>

      {/* SECTION 5: ARTISAN EMBROIDERY DESIGN LIBRARY */}
      <section className="section page-section shop-section-anchor" id="shop-designs">
        <div className="container">
          <div className="shop-section-header">
            <div className="shop-section-eyebrow">Artisan Motifs</div>
            <h2 className="shop-section-title">Embroidery Design & Monogram Library</h2>
            <p className="shop-section-desc">
              Choose from our curated signature monograms, royal crests, and floral motifs, or order any design on your towels & apparel.
            </p>
          </div>

          <div className="design-tools" style={{ marginBottom: 28 }}>
            {['All', ...new Set(designs.map(d => d.category).filter(Boolean))].map(c => (
              <button
                key={c}
                className={`filter-btn ${designFilter === c ? 'active' : ''}`}
                onClick={() => setDesignFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="design-grid">
            {filteredDesigns.map(d => (
              <article className="design-card" key={d.id}>
                <div className="design-image">
                  <img src={imageFor(d)} alt={d.name} />
                </div>
                <div className="content">
                  <div className="eyebrow">{d.designId}</div>
                  <h3>{d.name}</h3>
                  <p className="muted">{d.desc}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModal({ design: d })}
                  >
                    Use This Design
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: ON-PAGE ALL-IN-ONE CUSTOM STUDIO & ORDER FORM */}
      <div className="container" id="shop-studio">
        <OnPageOrderStudio
          db={db}
          onOpenModal={(prod) => setModal({ product: prod })}
          notify={setToast}
        />
      </div>
    </>
  );

  return (
    <>
      <PromoBanner offers={db.offers} />
      <Header
        settings={settings}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNavigate={navigate}
      />

      <main>
        {activeTab === 'shop' ? renderSellingPage() : renderBusinessPage()}
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <a
              className="footer-brand"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              aria-label={`${settings.brand} Home`}
            >
              <img className="footer-logo" src="/assets/mazatowel-logo-tight.png" alt={`${settings.brand} logo`} />
            </a>
            <p>Personalized towels, embroidered apparel and artisan needlework made specially for people, families and businesses.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/#shop-towels" onClick={(e) => { e.preventDefault(); navigate('/#shop-towels'); }}>Towels</a>
            <a href="/#shop-tshirts" onClick={(e) => { e.preventDefault(); navigate('/#shop-tshirts'); }}>T-Shirts</a>
            <a href="/#shop-sets" onClick={(e) => { e.preventDefault(); navigate('/#shop-sets'); }}>Sets</a>
            <a href="/#shop-commercial" onClick={(e) => { e.preventDefault(); navigate('/#shop-commercial'); }}>Commercial</a>
            <a href="/#shop-designs" onClick={(e) => { e.preventDefault(); navigate('/#shop-designs'); }}>Designs</a>
            <a href="/#shop-studio" onClick={(e) => { e.preventDefault(); navigate('/#shop-studio'); }}>Studio</a>
          </div>
          <div>
            <h4>About</h4>
            <a href="/#hygiene" onClick={(e) => { e.preventDefault(); navigate('/#hygiene'); }}>Hygiene</a>
            <a href="/#about" onClick={(e) => { e.preventDefault(); navigate('/#about'); }}>Story</a>
            <a href="/#how" onClick={(e) => { e.preventDefault(); navigate('/#how'); }}>Process</a>
            <a href="/#gallery" onClick={(e) => { e.preventDefault(); navigate('/#gallery'); }}>Gallery</a>
            <a href="/#customers" onClick={(e) => { e.preventDefault(); navigate('/#customers'); }}>Clients</a>
            <a href="/#reviews" onClick={(e) => { e.preventDefault(); navigate('/#reviews'); }}>Reviews</a>
            <a href="/#faq" onClick={(e) => { e.preventDefault(); navigate('/#faq'); }}>FAQ</a>
          </div>
          <div>
            <h4>Connect</h4>
            <div className="social-links">
              <a
                className="social-link whatsapp"
                href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={17} /> <span>WhatsApp</span>
              </a>
              <a className="social-link instagram" href={settings.instagram || '#'} target="_blank" rel="noreferrer">
                <InstagramIcon size={17} /> <span>Instagram</span>
              </a>
              <a className="social-link facebook" href={settings.facebook || '#'} target="_blank" rel="noreferrer">
                <FacebookIcon size={17} /> <span>Facebook</span>
              </a>
            </div>
            <span className="footer-address">{settings.address}</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} {settings.brand}</span>
        </div>
      </footer>

      <a
        className="wa-float"
        aria-label="Contact us on WhatsApp"
        href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
        target="_blank"
        rel="noreferrer"
      >
        <WhatsAppIcon size={24} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> <span>WhatsApp</span>
      </a>
      <div className="mobile-bar">
        {activeTab === 'shop' ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSelectTab('info')}
          >
            🏢 About
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSelectTab('shop')}
          >
            🛍️ Shop
          </button>
        )}
        <a
          className="btn btn-whatsapp"
          href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> WhatsApp
        </a>
      </div>

      {modal && (
        <CustomizationModal
          db={db}
          selectedProduct={modal.product}
          selectedDesign={modal.design}
          onClose={() => setModal(null)}
          notify={setToast}
        />
      )}
      {b2bSampleSector && (
        <B2BSampleModal
          settings={settings}
          initialSector={b2bSampleSector}
          onClose={() => setB2bSampleSector(null)}
          notify={setToast}
        />
      )}
      {toast && <div className="site-toast success">{toast}</div>}
    </>
  );
}

function Metric({ value, label }) {
  const target = Math.max(0, Number(value) || 0);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setCount(target);
      return;
    }

    let animationFrameId;

    const startCounting = () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      setCount(0);

      const duration = 1800;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth cubic ease-out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(easeOut * target);

        setCount(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(target);
          animatingRef.current = false;
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
        } else {
          cancelAnimationFrame(animationFrameId);
          animatingRef.current = false;
          setCount(0);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [target]);

  return (
    <div className="metric" ref={ref}>
      <div>
        <div className="metric-value">
          <span className="metric-number">{count.toLocaleString('en-IN')}</span>
          <span className="metric-plus" aria-hidden="true">+</span>
        </div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div className="section-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
    </div>
  );
}

const COMMERCIAL_SECTORS = [
  {
    id: 'parlour',
    label: 'Beauty Parlours & Spas',
    icon: '✨',
    badge: 'Bleach & Peroxide Resistant',
    title: 'Beauty Parlours & Luxury Aesthetics Spas',
    tagline: 'Silky Soft, Lint-Free Facial Towels & Spa Linens',
    description: 'Pamper your clients with salon-engineered Aegean cotton linens. Formulated to stay ultra-soft through hundreds of salon wash cycles while resisting bleach, facial serums, and cosmetic stains.',
    image: '/uploads/commercial/beauty-parlour-towels.jpg',
    specs: [
      { label: 'Popular Sizes', value: '16"×24" Facial Towels • 12"×12" Vanity Wipes • 30"×60" Treatment Sheets' },
      { label: 'Yarn & Density', value: '500 – 600 GSM 100% Combed Aegean Ring-Spun Cotton' },
      { label: 'Treatment Resistance', value: 'Tested colorfast against facial treatments, bleach & hair dyes' },
      { label: 'Needlework Craft', value: 'Snag-free delicate script or salon logo with Madeira™ thread' },
      { label: 'Minimum Batch', value: 'From 24 pieces (Sample swatch kits available upon request)' }
    ],
    features: [
      'Zero lint shedding on wet skin and facial cosmetic masks',
      'Hypoallergenic fibers gentle on sensitive or post-treatment skin',
      'Plush deep loops retain comforting warm aroma steam',
      'Reinforced double-stitched hems prevent fraying in commercial laundries'
    ],
    whatsappMsg: 'Hello Maza Towel! I run a Beauty Parlour / Spa and would like a quote for custom embroidered towels and salon linens.'
  },
  {
    id: 'mens-salon',
    label: "Men's Salons & Barbershops",
    icon: '💈',
    badge: '90°C Hot-Steam Sanitization Safe',
    title: "Men's Salons & Modern Grooming Clubs",
    tagline: 'High-Heat Steamer Hot Shave Towels & Stylist Drapes',
    description: 'Engineered specifically for barbershops and executive grooming lounges. Retains moisture and aromatherapy warmth in 90°C towel warmers without burning, fraying, or pile stiffening.',
    image: '/uploads/commercial/mens-salon-towels.jpg',
    specs: [
      { label: 'Popular Sizes', value: '12"×12" Hot Shave Towels • 16"×30" Barber Chair Shoulder Drapes' },
      { label: 'Weave & Density', value: '450 – 550 GSM Heavy Terry & Diamond Waffle Weave' },
      { label: 'Steam Durability', value: 'Tested for continuous 90°C hot-steam cabinet sanitizing cycles' },
      { label: 'Stain Resistance', value: 'Deep Obsidian Black & Charcoal dyes resistant to hair color stains' },
      { label: 'Emblem Embroidery', value: 'Sharp barbershop crest or emblem embroidery with skin-safe backing' }
    ],
    features: [
      'Holds hot damp steam to soften stubble for a smooth, irritation-free shave',
      'Heavyweight waffle texture gently cleanses without skin abrasion',
      'Color-fast vat dyeing never bleeds onto client collars or capes',
      'Tough reinforced selvages survive daily commercial dry cleaner washing'
    ],
    whatsappMsg: 'Hello Maza Towel! I own a Men\'s Salon / Barbershop and need hot-shave steam towels with our custom logo embroidery.'
  },
  {
    id: 'gym',
    label: 'Gyms & Fitness Studios',
    icon: '🏋️‍♂️',
    badge: 'Anti-Odor & Rapid Moisture-Wicking',
    title: 'Gyms, Pilates & Performance Fitness Clubs',
    tagline: 'Rapid-Dry, High-Absorption Workout & Shower Towels',
    description: 'Keep club members refreshed with high-performance cotton terry that absorbs moisture 3x faster than domestic towels and dries quickly between workout rotations.',
    image: '/uploads/commercial/gym-fitness-towels.jpg',
    specs: [
      { label: 'Popular Sizes', value: '12"×30" Bench / Sweat Towels • 27"×54" Shower Bath Sheets' },
      { label: 'Yarn Technology', value: '450 GSM Zero-Twist Fast-Drying Breathable Terry' },
      { label: 'Performance', value: '3x Rapid sweat absorption with antimicrobial odor-resistant weave' },
      { label: 'Club Branding', value: 'High-density club emblem embroidery + corner locker hanging loop' },
      { label: 'Wholesale Tiers', value: 'From 36 pieces with bulk tier volume discounts' }
    ],
    features: [
      'Tailored dimensions fit standard workout benches, yoga mats & reformers',
      'Reinforced locker loop prevents towels touching gym floor surfaces',
      'Fast-drying weave prevents damp odor buildup in locker bags',
      'Compact folding roll fits easily into gym member welcome kits'
    ],
    whatsappMsg: 'Hello Maza Towel! I manage a Gym / Fitness Club and need sweat/bench towels with our custom club branding.'
  },
  {
    id: 'corporate-gifts',
    label: 'Corporate Gifting & Hampers',
    icon: '🎁',
    badge: 'Executive Keepsake Boxes',
    title: 'Corporate Gifting & VIP Executive Hampers',
    tagline: 'Custom Magnetic Rigid Boxes with Monogrammed Linens',
    description: 'Impress corporate clients, senior leaders, and valued colleagues with heirloom-quality bath linens packaged in magnetic gift boxes finished with gold-foil crests and silk ribbons.',
    image: '/uploads/commercial/corporate-gift-hamper.jpg',
    specs: [
      { label: 'Box Formats', value: 'Executive Bath Duo • Couple Keepsake Sets • Wellness Care Boxes' },
      { label: 'Luxury Packaging', value: 'Rigid magnetic matte black / ivory box with gold-foil crest & satin ribbon' },
      { label: 'Personalization', value: 'Dual-layer: Company logo on box + recipient individual initials on towel' },
      { label: 'Compliance & Tax', value: 'Full GST tax invoice for Input Tax Credit + pan-India multi-address shipping' },
      { label: 'Minimum Batch', value: 'From 12 gift hampers with personalized greeting cards included' }
    ],
    features: [
      'Individual recipient personalization across bulk company orders',
      'Zero setup fee for approved vector brand artwork and monogram digitization',
      'Optional luxury pairings: Artisan soy candles, aroma soaps & greeting cards',
      'Guaranteed delivery timelines for Diwali, annual summits & milestone events'
    ],
    whatsappMsg: 'Hello Maza Towel! I am interested in custom Corporate Gift Hampers with personalized towels and gift packaging.'
  }
];

function CommercialShowcase({ settings, onOpenSampleModal }) {
  const [selectedId, setSelectedId] = useState('parlour');
  const sector = COMMERCIAL_SECTORS.find(s => s.id === selectedId) || COMMERCIAL_SECTORS[0];

  return (
    <div>
      <SectionHead
        eyebrow="✦ COMMERCIAL & ATELIER SOLUTIONS"
        title="Tailored Linens for Salons, Gyms & Corporate Gifting."
      />

      {/* Sector Navigation Tabs */}
      <div className="commercial-tabs-wrap" role="tablist" aria-label="Commercial Sectors">
        {COMMERCIAL_SECTORS.map(s => {
          const isActive = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`commercial-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedId(s.id)}
            >
              <span className="tab-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sector Showcase Card */}
      <div className="commercial-card-showcase">
        {/* Left Visual Column */}
        <div className="commercial-visual-col">
          <img
            src={sector.image}
            alt={sector.title}
            className="commercial-hero-img"
            loading="lazy"
          />
          <div className="commercial-floating-badge">
            ✦ {sector.badge}
          </div>
        </div>

        {/* Right Content Column */}
        <div className="commercial-content-col">
          <div>
            <div className="commercial-sector-eyebrow">
              <span>{sector.icon}</span> {sector.label}
            </div>
            <h3 className="commercial-sector-title">{sector.title}</h3>
            <div className="commercial-sector-tagline">{sector.tagline}</div>
            <p className="commercial-sector-desc">{sector.description}</p>

            {/* Specifications Grid */}
            <div className="commercial-specs-table">
              {sector.specs.map(spec => (
                <div key={spec.label} className="commercial-spec-row">
                  <span className="commercial-spec-label">{spec.label}</span>
                  <span className="commercial-spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Sector Feature Checklist */}
            <div className="commercial-features-checklist">
              {sector.features.map((feat, idx) => (
                <div key={idx} className="commercial-feature-item">
                  <span className="commercial-check-bullet">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="commercial-action-row">
            <a
              className="commercial-wa-btn"
              href={whatsapp(settings.whatsapp, sector.whatsappMsg)}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> Inquire on WhatsApp
            </a>
            <button
              type="button"
              className="commercial-sample-btn"
              onClick={() => onOpenSampleModal(sector.id)}
            >
              Request Sample Kit →
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Procurement Perks Strip */}
      <div className="commercial-perks-strip">
        <div className="commercial-perk-card">
          <div className="commercial-perk-icon">🧾</div>
          <div>
            <h4>GST Compliant Invoicing</h4>
            <p>100% eligible for corporate Input Tax Credit (ITC) with registered B2B e-invoices.</p>
          </div>
        </div>
        <div className="commercial-perk-card">
          <div className="commercial-perk-icon">🧵</div>
          <div>
            <h4>Madeira™ German Thread</h4>
            <p>Industrial 100,000+ stitch durability resistant to bleach, chlorine & high heat.</p>
          </div>
        </div>
        <div className="commercial-perk-card">
          <div className="commercial-perk-icon">⚡</div>
          <div>
            <h4>4-Hour Digital Proof</h4>
            <p>Inspect digital stitch simulations and color matching before production starts.</p>
          </div>
        </div>
        <div className="commercial-perk-card">
          <div className="commercial-perk-icon">🚚</div>
          <div>
            <h4>Pan-India Insured Logistics</h4>
            <p>Doorstep delivery to single locations or distributed multi-branch salon chains.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function B2BSampleModal({ settings, initialSector, onClose, notify }) {
  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    city: '',
    sector: initialSector || 'parlour',
    requirements: ''
  });
  const [logoAttachment, setLogoAttachment] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sectorObj = COMMERCIAL_SECTORS.find(s => s.id === form.sector) || COMMERCIAL_SECTORS[0];

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError('');
    if (file.size > 25 * 1024 * 1024) {
      setLogoUploadError('File exceeds 25MB limit. Please choose a smaller file.');
      return;
    }
    setUploadingLogo(true);
    try {
      const dataUrl = await readFileDataUrl(file);
      const res = await api('/api/upload-logo', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, name: file.name })
      });
      if (res.url) {
        setLogoAttachment(res.url);
        setLogoFileName(file.name);
      }
    } catch (err) {
      setLogoUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoAttachment('');
    setLogoFileName('');
    setLogoUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.businessName.trim()) {
      return setError('Please enter your business or studio name.');
    }
    if (!form.contactPerson.trim()) {
      return setError('Please enter your contact person name.');
    }
    const cleanDigits = form.phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      return setError('Please enter a valid 10-digit Indian WhatsApp mobile number starting with 6, 7, 8, or 9.');
    }

    setSubmitting(true);
    try {
      await api('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          customerName: form.contactPerson,
          companyName: form.businessName,
          category: 'Commercial B2B Sample Request',
          product: `Sample Kit: ${sectorObj.label}`,
          phone: form.phone.replace(/\D/g, '').slice(-10),
          quantity: 1,
          embroideryName: form.businessName,
          logoAttachment: logoAttachment || '',
          notes: `[B2B Sample Kit Request]\nBusiness: ${form.businessName}\nContact: ${form.contactPerson}\nCity: ${form.city || 'N/A'}\nSector: ${sectorObj.label}\nRequirements: ${form.requirements || 'Standard fabric sample kit'}`
        })
      });

      notify('Your sample kit request has been received. Our concierge will dispatch your swatch kit shortly!');
      onClose();

      const logoPart = logoAttachment ? ` Attached Logo: ${window.location.origin}${logoAttachment}.` : '';
      const waMsg = `Hello Maza Towel! I submitted a sample kit request for ${form.businessName} (${sectorObj.label}). Contact: ${form.contactPerson}, Phone: ${form.phone}, City: ${form.city || 'N/A'}.${logoPart} Please confirm dispatch.`;
      window.open(whatsapp(settings.whatsapp, waMsg), '_blank');
    } catch (err) {
      setError(err.message || 'Unable to submit inquiry. Please try again or reach out on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show" onMouseDown={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-commercial">
        <div className="modal-head">
          <div>
            <div className="eyebrow">✦ B2B SAMPLE & SWATCH CONCIERGE</div>
            <h3>Request Commercial Sample Kit</h3>
            <p className="modal-subtitle">
              Registered beauty parlours, barbershops, gyms, and corporate gifters can receive complimentary fabric swatches and stitch samples.
            </p>
          </div>
          <button
            type="button"
            className="icon-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            <CloseIcon size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="b2b-sample-modal-body" noValidate>
            <div className="sample-kit-perks-badge">
              <span>🎁 <strong>Complimentary Swatch Kit:</strong> Includes 400+ GSM cotton towel swatches, border stitch quality samples, and quick pricing catalog.</span>
            </div>

            <div className="field-two-col">
              <Field label="Business / Brand Name" required>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={e => {
                    setForm({ ...form, businessName: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter business name"
                />
              </Field>
              <Field label="Contact Person" required>
                <input
                  type="text"
                  required
                  value={form.contactPerson}
                  onChange={e => {
                    setForm({ ...form, contactPerson: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter contact person name"
                />
              </Field>
            </div>

            <div className="field-two-col">
              <Field label="WhatsApp Phone Number" required>
                <div className="phone-input-group">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    required
                    value={form.phone}
                    onChange={e => {
                      setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                      if (error) setError('');
                    }}
                    placeholder="10-digit mobile number"
                    aria-label="10-digit WhatsApp phone number"
                  />
                </div>
              </Field>
              <Field label="Delivery City / State" optional>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Enter delivery city or state"
                />
              </Field>
            </div>

            <Field label="Select Commercial Sector">
              <select
                value={form.sector}
                onChange={e => setForm({ ...form, sector: e.target.value })}
              >
                {COMMERCIAL_SECTORS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Estimated Quantity & Requirements" optional help="Mention estimated towel quantity, embroidery logo notes, or preferred towel sizes.">
              <textarea
                rows={3}
                value={form.requirements}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                placeholder="e.g. 50 Salon Towels with logo embroidery, need soft black & white fabric"
              />
            </Field>

            {/* Optional Logo Upload for B2B Sample Kit */}
            <Field label="Attach Logo" optional help="PNG, JPG, WEBP, SVG or PDF (max 25MB).">
              {logoAttachment ? (
                <div style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1.5px solid #0d9488',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                    {/\.(png|jpe?g|webp|svg)$/i.test(logoAttachment) ? (
                      <img src={logoAttachment} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', padding: 2, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', background: '#e0f2fe', borderRadius: 6, fontSize: 16, flexShrink: 0 }}>📄</div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: '#059669', marginRight: 4 }}>✓</span>{logoFileName || 'Attached Logo'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#b42318',
                      borderRadius: '50%',
                      width: 26,
                      height: 26,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1
                    }}
                    title="Remove logo"
                    aria-label="Remove logo"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10
                }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {uploadingLogo ? '⏳ Uploading logo…' : 'Attach logo (Optional)'}
                  </span>
                  <label className="btn btn-secondary" style={{ margin: 0, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>
                    Choose File
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={uploadingLogo}
                      style={{ display: 'none' }}
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
              {logoUploadError && (
                <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 2, marginBottom: 8 }}>
                  ⚠ {logoUploadError}
                </div>
              )}
            </Field>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px 20px', fontSize: 14, marginTop: 4, justifyContent: 'center' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Request Sample Kit →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CustomerCarousel({ customers }) {
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Triple the list to provide a seamless continuous runway of logos
  const displayLogos = [...customers, ...customers, ...customers];

  const scrollNext = () => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector('.customer-logo-slide');
    const step = slide ? slide.offsetWidth + 36 : 196;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= maxScroll - 15) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector('.customer-logo-slide');
    const step = slide ? slide.offsetWidth + 36 : 196;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft <= 15) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  // Continuous smooth auto-slide in a line like a carousel
  useEffect(() => {
    if (isHovered || customers.length <= 1) return;
    const timer = setInterval(() => {
      scrollNext();
    }, 2800);
    return () => clearInterval(timer);
  }, [isHovered, customers.length]);

  return (
    <div
      className="customer-carousel-wrap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="customer-carousel-shell">
        {/* Attractive Left Arrow Button */}
        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={scrollPrev}
          aria-label="Previous customer logos"
          title="Previous"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Viewport with Gradient Edge Fades */}
        <div className="customer-carousel-viewport">
          <div className="customer-fade-left" aria-hidden="true" />
          <div className="customer-fade-right" aria-hidden="true" />

          <div className="customer-carousel-track" ref={trackRef}>
            {displayLogos.map((c, idx) => (
              <div className="customer-logo-slide" key={`${c.id}-${idx}`}>
                <div className="customer-logo-badge" title={c.name}>
                  {c.image ? (
                    <img src={c.image} alt={`${c.name} logo`} loading="lazy" />
                  ) : (
                    <span className="customer-logo-fallback">{c.name.slice(0, 2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attractive Right Arrow Button */}
        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={scrollNext}
          aria-label="Next customer logos"
          title="Next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}


function FamilyShowcase({ settings, products = [], onSelectProduct }) {
  const [activeTab, setActiveTab] = useState('family');

  const sets = {
    family: {
      tabLabel: '👨‍👩‍👧 Family Coordinated Set',
      eyebrow: 'Made for everyone at home',
      title: 'Personalized towels for the whole family.',
      desc: 'Eliminate morning bathroom mix-ups and turn everyday towels into a coordinated household tradition. Assign distinctive names, custom thread palettes, and dedicated towel sizes tailored for Mom, Dad, and little ones.',
      image: '/uploads/products/gift-set-family.jpg',
      alt: 'Luxury 3-piece personalized family towel set with Mom, Dad and Baby embroidery',
      specs: [
        { role: "Mom's Towel", detail: '30 × 60" Plush Combed Bath Towel • Delicate Champagne cursive embroidery' },
        { role: "Dad's Towel", detail: '36 × 72" Grand Suite Bath Sheet • Deep Navy or Charcoal bold serif lettering' },
        { role: "Kids' Towel", detail: '24 × 48" or 27 × 54" Junior Bath Towel • Pastel Mint or Sky Blue gentle script' }
      ],
      perks: [
        'Zero bathroom mix-ups — each member gets their own color & name',
        '100% pure combed long-staple cotton (ultra-absorbent & skin-safe)',
        'Pre-production preview approved on WhatsApp before stitching'
      ],
      waMessage: 'Hello MazaTowel! I would like to create a personalized Family Towel Set (Mom, Dad, Kids). Please share options and pricing.',
      productId: 'P010'
    },
    couple: {
      tabLabel: '💍 Couple & Wedding Suite',
      eyebrow: 'Heirloom milestone gifting',
      title: 'His & Hers matching couple heirloom towels.',
      desc: 'A timeless keepsake for weddings, anniversaries, housewarmings, or luxury master bathrooms. Two matching oversized luxury bath towels hand-embroidered with Mr. & Mrs., couple initials, or partner names.',
      image: '/uploads/products/couple-towels-set.jpg',
      alt: 'Personalized Mr. and Mrs. couple towel set',
      specs: [
        { role: 'His Towel', detail: '30 × 60" or 36 × 72" Hotel-grade cotton • Deep Emerald or Slate Grey script' },
        { role: 'Her Towel', detail: '30 × 60" or 36 × 72" Silky combed cotton • Dusty Rose or Champagne script' },
        { role: 'Customization', detail: 'Choice of elegant script or serif lettering with personalized wedding date' }
      ],
      perks: [
        "Nashik's most cherished wedding, anniversary & housewarming gift",
        'Fade-proof Japanese embroidery threads that stay vibrant for years',
        'Custom surname, wedding date, or crest options'
      ],
      waMessage: 'Hello MazaTowel! I would like to order a personalized Couple Towel Set (Mr. & Mrs. / Names). Please share options and pricing.',
      productId: 'P010'
    }
  };

  const current = sets[activeTab];
  const targetProduct = products.find(p => p.id === current.productId) || products[0];

  return (
    <section className="section family-showcase-section" id="shop-sets">
      <div id="family-sets" style={{ position: 'relative', top: '-140px', visibility: 'hidden' }} />
      <div className="container">
        <div className="family-showcase-card">
          <div className="family-showcase-media">
            <img
              src={current.image}
              alt={current.alt}
              className="family-showcase-img"
              loading="lazy"
              key={current.image}
            />
          </div>
          <div className="family-showcase-content">
            <div className="family-tabs-bar" role="tablist" aria-label="Family and Couple Set Options">
              {Object.entries(sets).map(([key, data]) => (
                <button
                  type="button"
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  className={`family-tab-btn ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {data.tabLabel}
                </button>
              ))}
            </div>

            <div className="eyebrow">{current.eyebrow}</div>
            <h2>{current.title}</h2>
            <p className="family-showcase-desc">{current.desc}</p>

            <div className="family-spec-grid">
              {current.specs.map(spec => (
                <div className="family-spec-card" key={spec.role}>
                  <span className="family-spec-tag">{spec.role}</span>
                  <p className="family-spec-text">{spec.detail}</p>
                </div>
              ))}
            </div>

            <div className="family-perks-list">
              {current.perks.map(perk => (
                <div className="family-perk-item" key={perk}>
                  <span className="family-perk-icon">✦</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="family-action-group">
              <a
                className="btn btn-primary"
                href={whatsapp(settings.whatsapp, current.waMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> {activeTab === 'family' ? 'Order Family Set' : 'Order Couple Set'}
              </a>
              {targetProduct && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onSelectProduct(targetProduct)}
                >
                  Quick Enquiry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Toggle answer for ${q}`}>
        <span>{q}</span>
        <span>⌄</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

function GoogleReviews({ enabled }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    api('/api/google-reviews/live').then(setState).catch(() => setState({ error: true }));
  }, [enabled]);

  if (!enabled || !state) return null;
  if (state.error) {
    return (
      <div className="google-info" style={{ marginBottom: 20 }}>
        <span>Live Google reviews are temporarily unavailable.</span>
      </div>
    );
  }

  return (
    <>
      <div className="google-summary">
        <div>
          <strong>{state.placeName || 'MazaTowel'}</strong>
          <div className="google-rating">★ {state.rating ?? '—'} <small>{state.userRatingCount ?? ''} Google ratings</small></div>
        </div>
        <a className="btn btn-secondary" href={state.googleMapsUri} target="_blank" rel="noreferrer">View on Google</a>
      </div>
      <div className="review-grid">
        {(state.reviews || []).map(review => (
          <article className="review-card" key={review.id}>
            <div className="stars">{'★'.repeat(review.rating || 0)}</div>
            <p className="review-text">“{review.text || 'No written review text.'}”</p>
            <div className="review-meta">
              <strong>{review.name}</strong>
              <span>{review.relativeTime || review.publishTime}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<Site />);
