const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'react', 'src', 'public.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Cut obsolete page render functions and old router
const startMarker = '\n  // 3. T-SHIRTS & APPAREL PAGE';
const endMarker = '{(currentPath === \'/\' || ![\'/shop\', \'/tshirts\', \'/designs\', \'/corporate\', \'/gallery\', \'/about\', \'/faq\', \'/reviews\', \'/how\'].includes(currentPath)) && renderHomePage()}\n      </main>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacement = `\n  return (
    <>
      <PromoBanner offers={db.offers} />
      <Header
        settings={settings}
        currentPath={currentPath}
        onNavigate={navigate}
        onCustomize={() => setModal({ product: towelProducts[0] || allProducts[0] })}
      />

      <main>
        {currentPath === '/shop' ? renderShopPage() : renderHomePage()}
      </main>`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex + endMarker.length);

// 2. Update Footer column for About & Story
const oldFooterCol = `          <div>
            <h4>About & Help</h4>
            <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About Studio</a>
            <a href="/gallery" onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}>Work Gallery</a>
            <a href="/reviews" onClick={(e) => { e.preventDefault(); navigate('/reviews'); }}>Customer Reviews</a>
            <a href="/faq" onClick={(e) => { e.preventDefault(); navigate('/faq'); }}>Help & FAQ</a>
            <a href="/how" onClick={(e) => { e.preventDefault(); navigate('/how'); }}>How It Works</a>
            <a href="/about#hygiene" onClick={(e) => { e.preventDefault(); navigate('/about#hygiene'); }}>Hygiene & Care</a>
          </div>`;

const newFooterCol = `          <div>
            <h4>About & Story</h4>
            <a href="/#gallery" onClick={(e) => { e.preventDefault(); navigate('/#gallery'); }}>Work Gallery</a>
            <a href="/#about" onClick={(e) => { e.preventDefault(); navigate('/#about'); }}>About Studio</a>
            <a href="/#reviews" onClick={(e) => { e.preventDefault(); navigate('/#reviews'); }}>Customer Reviews</a>
            <a href="/#faq" onClick={(e) => { e.preventDefault(); navigate('/#faq'); }}>Help & FAQ</a>
            <a href="/#how" onClick={(e) => { e.preventDefault(); navigate('/#how'); }}>How It Works</a>
            <a href="/#hygiene" onClick={(e) => { e.preventDefault(); navigate('/#hygiene'); }}>Hygiene & Care</a>
          </div>`;

content = content.replace(oldFooterCol, newFooterCol);

// 3. Update Mobile bar
const oldMobileBar = `      <div className="mobile-bar">
        <a
          className="btn btn-secondary"
          href="/shop"
          onClick={(e) => {
            e.preventDefault();
            navigate('/shop');
          }}
        >
          Shop Atelier
        </a>
        <a
          className="btn btn-whatsapp"
          href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> WhatsApp
        </a>
      </div>`;

const newMobileBar = `      <div className="mobile-bar">
        {currentPath === '/shop' ? (
          <a
            className="btn btn-secondary"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            ← Home & Story
          </a>
        ) : (
          <a
            className="btn btn-primary"
            href="/shop"
            onClick={(e) => {
              e.preventDefault();
              navigate('/shop');
            }}
          >
            🛍️ Shop Atelier
          </a>
        )}
        <a
          className="btn btn-whatsapp"
          href={whatsapp(settings.whatsapp, generalMessage(settings.brand))}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={18} color="#FFFFFF" style={{ color: '#FFFFFF' }} /> WhatsApp
        </a>
      </div>`;

content = content.replace(oldMobileBar, newMobileBar);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated public.jsx!');
