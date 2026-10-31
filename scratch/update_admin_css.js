const fs = require('fs');

const cssPath = 'public/assets/admin.css';
let css = fs.readFileSync(cssPath, 'utf8');

const marker = '/* =========================================================\n   DEDICATED CUSTOMER ENQUIRIES TABLE & PIPELINE UI';
let markerIdx = css.indexOf(marker);
if (markerIdx === -1) {
  const markerCRLF = '/* =========================================================\r\n   DEDICATED CUSTOMER ENQUIRIES TABLE & PIPELINE UI';
  markerIdx = css.indexOf(markerCRLF);
}

if (markerIdx === -1) {
  console.error('Marker not found in admin.css');
  process.exit(1);
}

const newCss = `/* =========================================================
   DEDICATED CUSTOMER ENQUIRIES TABLE & PIPELINE UI
   ========================================================= */

.enquiries-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(23, 59, 64, 0.04);
  margin-top: 6px;
}

.enquiries-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 960px;
  text-align: left;
}

.enquiries-table th {
  background: #f8fafc;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  padding: 10px 14px;
  border-bottom: 1.5px solid var(--line);
  white-space: nowrap;
}

.enquiry-row td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
  font-size: 13px;
  background: #ffffff;
  transition: background 0.15s ease;
}

.enquiry-row:hover td {
  background: #f8fbfb;
}

/* Row-level Pipeline Highlights */
.enquiry-row.enquiry-row-new td {
  background: #fffcfc;
}
.enquiry-row.enquiry-row-new:hover td {
  background: #fff7f7;
}
.enquiry-row.enquiry-row-new td:first-child {
  border-left: 3.5px solid #ef4444;
}

.enquiry-row.enquiry-row-inproduction td:first-child {
  border-left: 3.5px solid #f59e0b;
}

.enquiry-row.enquiry-row-shipped td:first-child {
  border-left: 3.5px solid #10b981;
}

.enquiry-row.enquiry-row-contacted td:first-child {
  border-left: 3.5px solid #0284c7;
}

.enquiry-row.enquiry-row-closed td {
  background: #fafbfb;
  opacity: 0.85;
}
.enquiry-row.enquiry-row-closed td:first-child {
  border-left: 3.5px solid #94a3b8;
}

/* Column 1: Customer Card */
.enquiry-cell-customer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 170px;
}
.enquiry-customer-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.enquiry-customer-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.25;
}
.enquiry-id-chip {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}
.enquiry-phone-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  line-height: 1.2;
}
.enquiry-phone-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--teal2);
  text-decoration: none;
}
.enquiry-phone-link:hover {
  text-decoration: underline;
  color: var(--teal-dark);
}
.enquiry-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 10.5px;
  color: var(--muted);
}
.enquiry-city-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f1f5f9;
  color: #334155;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10.5px;
}
.enquiry-b2b-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

/* Column 2: Product & Garment Card */
.enquiry-cell-product {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 170px;
}
.enquiry-prod-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.25;
}
.enquiry-prod-meta-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
}
.enquiry-type-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.enquiry-type-badge.towel {
  background: #eaf7f6;
  color: var(--teal2);
  border: 1px solid #c8e6e5;
}
.enquiry-type-badge.tshirt {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.enquiry-qty-tag {
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f8fafc;
  color: var(--ink);
  border: 1px solid var(--line);
}
.enquiry-qty-tag.bulk {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}
.enquiry-color-line {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink);
}
.enquiry-color-swatch-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Column 3: Personalization & Embroidery Card */
.enquiry-cell-embroidery {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 320px;
}
.enquiry-stitched-card {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px dashed #86efac;
  color: #15803d;
  font-size: 12.5px;
  font-weight: 800;
  line-height: 1.25;
  width: fit-content;
}
.enquiry-multi-names-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.enquiry-multi-name-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 700;
}
.enquiry-multi-name-item .size-tag {
  font-size: 9.5px;
  color: #15803d;
  opacity: 0.8;
}
.enquiry-placement-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #7c3aed;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  padding: 1px 6px;
  border-radius: 4px;
  width: fit-content;
}
.enquiry-note-callout {
  background: #fffdf5;
  border: 1px solid #fef08a;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: #854d0e;
  line-height: 1.35;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}
.enquiry-workshop-note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 10.5px;
  color: #1e40af;
  line-height: 1.3;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.enquiry-logo-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 800;
  color: #047857;
  text-decoration: none;
  width: fit-content;
  transition: all 0.15s ease;
}
.enquiry-logo-button:hover {
  background: #d1fae5;
  color: #065f46;
}

/* Column 4: Interactive Status Dropdown */
.enquiry-status-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 125px;
}
.enquiry-status-select {
  appearance: none;
  -webkit-appearance: none;
  padding: 4px 24px 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  outline: 0;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  font-family: inherit;
  background-repeat: no-repeat;
  background-position: right 7px center;
  background-size: 10px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
}
.enquiry-status-select.status-new {
  background-color: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}
.enquiry-status-select.status-contacted {
  background-color: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}
.enquiry-status-select.status-inproduction {
  background-color: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}
.enquiry-status-select.status-shipped {
  background-color: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.enquiry-status-select.status-closed {
  background-color: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

/* Column 5: Action Toolbar - STRICTLY HORIZONTAL ROW */
.enquiries-table .enquiry-actions-th,
.enquiries-table .enquiry-actions-col {
  width: 175px !important;
  min-width: 175px !important;
  max-width: 185px !important;
  text-align: right !important;
  white-space: nowrap !important;
  vertical-align: middle !important;
  padding: 10px 14px !important;
}

.enquiry-actions-toolbar {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 5px !important;
  flex-wrap: nowrap !important;
  white-space: nowrap !important;
}

.enquiry-actions-toolbar .action-btn {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  flex: 0 0 30px !important;
  border-radius: 8px !important;
}

/* Dark Theme Overrides for Enquiries Table */
[data-theme="dark"] .enquiries-table-wrap {
  background: #111a22;
  border-color: #243545;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
}
[data-theme="dark"] .enquiries-table th {
  background: #15222e;
  border-bottom-color: #243545;
  color: #8fa6b9;
}
[data-theme="dark"] .enquiry-row td {
  background: #111a22;
  border-bottom-color: #1e2c3a;
  color: #d1dde6;
}
[data-theme="dark"] .enquiry-row:hover td {
  background: #162432;
}
[data-theme="dark"] .enquiry-row.enquiry-row-new td {
  background: #1b1c24;
}
[data-theme="dark"] .enquiry-row.enquiry-row-new:hover td {
  background: #222230;
}
[data-theme="dark"] .enquiry-customer-name {
  color: #f1f5f9;
}
[data-theme="dark"] .enquiry-prod-name {
  color: #f1f5f9;
}
[data-theme="dark"] .enquiry-id-chip {
  background: #1e293b;
  color: #94a3b8;
  border-color: #334155;
}
[data-theme="dark"] .enquiry-city-pill {
  background: #1e293b;
  color: #cbd5e1;
}
[data-theme="dark"] .enquiry-qty-tag {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}
[data-theme="dark"] .enquiry-stitched-card {
  background: rgba(22, 101, 52, 0.2);
  border-color: #15803d;
  color: #86efac;
}
[data-theme="dark"] .enquiry-multi-name-item {
  background: rgba(22, 101, 52, 0.2);
  border-color: #15803d;
  color: #86efac;
}
[data-theme="dark"] .enquiry-note-callout {
  background: #241c0c;
  border-color: #78350f;
  color: #fde68a;
}
[data-theme="dark"] .enquiry-workshop-note {
  background: #132238;
  border-color: #1e3a8a;
  color: #93c5fd;
}
`;

css = css.slice(0, markerIdx) + newCss;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('✅ admin.css updated with compact, horizontal styles!');

