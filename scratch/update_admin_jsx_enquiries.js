const fs = require('fs');

const path = 'react/src/admin.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update EnquiryRow
const oldEnquiryRowStart = 'function EnquiryRow({ item, colors = [], onEdit, onDelete, onQuickUpdate, onNotice }) {';
const oldEnquiryRowEnd = 'function Collection({ data, type, onEdit, onDelete, onQuickUpdate, onSaveSettings, onNotice }) {';

const startIdx = code.indexOf(oldEnquiryRowStart);
const endIdx = code.indexOf(oldEnquiryRowEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find EnquiryRow boundaries!');
  process.exit(1);
}

const newEnquiryRow = `function EnquiryRow({ item, colors = [], onEdit, onDelete, onQuickUpdate, onNotice }) {
  const isShirt = isTShirtItem(item);
  const status = item.status || 'New';
  const statusKey = status.toLowerCase().replace(/\\s+/g, '');
  const city = extractCity(item);
  const isB2B = (item.notes && item.notes.includes('[B2B')) || (item.product && item.product.includes('Sample Kit'));
  const cleanPhone = String(item.phone || '').replace(/\\D/g, '');
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
      \`Recipient: \${item.customerName || 'Customer'}\`,
      \`Phone: \${formattedPhone || item.phone || ''}\`,
      \`Delivery Destination: \${courierCity}\`,
      \`Order: \${item.quantity || 1}x \${item.product || 'Towel'} (\${item.size || ''})\`,
      \`Custom Embroidery: \${item.embroideryName || (Array.isArray(item.embroideryNames) ? item.embroideryNames.join(', ') : 'Monogram')}\`,
      item.notes ? \`Customer Notes: \${item.notes}\` : '',
      \`Order ID: #\${item.id}\`
    ].filter(Boolean).join('\\n');

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(courierText);
    }
    if (onNotice) onNotice(\`📋 Courier details for #\${item.id} copied to clipboard!\`);
  };

  return (
    <tr className={\`enquiry-row enquiry-row-\${statusKey}\`}>
      {/* 1. Order & Customer */}
      <td>
        <div className="enquiry-cell-customer">
          <div className="enquiry-customer-title-row">
            <span className="enquiry-customer-name">{item.customerName || 'Customer'}</span>
            <span className="enquiry-id-chip" title={\`Order ID: \${item.id}\`}>
              #{item.id?.slice(-8) || item.id}
            </span>
          </div>

          <div className="enquiry-phone-row">
            {formattedPhone ? (
              <a href={\`tel:\${cleanPhone}\`} className="enquiry-phone-link" title="Click to call customer">
                <span>📞</span>
                <span>{formattedPhone}</span>
              </a>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>No phone</span>
            )}
            {city && (
              <span className="enquiry-city-pill" title={\`Delivery City: \${city}\`}>
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
                title={\`Created: \${new Date(item.createdAt).toLocaleString('en-IN')}\`}
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
            <span className={\`enquiry-type-badge \${isShirt ? 'tshirt' : 'towel'}\`}>
              {isShirt ? '👕 Apparel' : '🏷️ Towel'}
            </span>
            {item.size && (
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                📏 {item.size}
              </span>
            )}
            <span className={\`enquiry-qty-tag \${(Number(item.quantity) || 1) >= 3 ? 'bulk' : ''}\`}>
              {(Number(item.quantity) || 1) >= 3 ? \`💎 \${item.quantity} pcs\` : \`Qty: \${item.quantity || 1}\`}
            </span>
            {item.towelColor && (
              <span className="enquiry-color-line" title={\`Color: \${item.towelColor}\`}>
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
                <span key={idx} className="enquiry-multi-name-item" title={\`Item #\${idx + 1} personalization\`}>
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
                {/\\.(png|jpe?g|webp|svg)$/i.test(item.logoAttachment) ? (
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
            className={\`enquiry-status-select status-\${statusKey}\`}
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
              title={\`Open WhatsApp chat with \${item.customerName || 'customer'} with prefilled order confirmation\`}
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

`;

code = code.slice(0, startIdx) + newEnquiryRow + code.slice(endIdx);

// 2. Update thead in Collection
code = code.replace(
  '<th className="th-actions" style={{ width: \'16%\', minWidth: 190 }}>Actions</th>',
  '<th className="enquiry-actions-th">Actions</th>'
);

fs.writeFileSync(path, code, 'utf8');
console.log('✅ admin.jsx updated successfully with compact horizontal EnquiryRow!');

