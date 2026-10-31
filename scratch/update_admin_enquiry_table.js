const fs = require('fs');

const adminPath = 'react/src/admin.jsx';
let code = fs.readFileSync(adminPath, 'utf8');

// Find boundary of table rendering inside Collection
const targetStart = '        <div className="table-wrap">\n          <table>\n            <thead>\n              <tr>\n                {[\'products\', \'colors\',';
// If line endings are CRLF:
const targetStartCRLF = '        <div className="table-wrap">\r\n          <table>\r\n            <thead>\r\n              <tr>\r\n                {[\'products\', \'colors\',';

let startIdx = code.indexOf(targetStart);
let isCRLF = false;
if (startIdx === -1) {
  startIdx = code.indexOf(targetStartCRLF);
  isCRLF = true;
}

if (startIdx === -1) {
  // Let's find by substring
  startIdx = code.indexOf('        <div className="table-wrap">');
  console.log('Found via simple search at:', startIdx);
}

const endMarker = '{!items.length && (';
const endIdx = code.indexOf(endMarker, startIdx);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);
if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate boundaries!');
  process.exit(1);
}

const existingTableBlock = code.slice(startIdx, endIdx);
console.log('Found block of length:', existingTableBlock.length);

const replacement = `        {type === 'enquiries' ? (
          <div className="enquiries-table-wrap">
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '22%', minWidth: 190 }}>Order & Customer</th>
                  <th style={{ width: '21%', minWidth: 180 }}>Product & Garment</th>
                  <th style={{ width: '27%', minWidth: 230 }}>Embroidery & Specs</th>
                  <th style={{ width: '14%', minWidth: 140 }}>Status</th>
                  <th className="th-actions" style={{ width: '16%', minWidth: 190 }}>Actions</th>
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
` + existingTableBlock + `        )}\n          `;

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync(adminPath, code, 'utf8');
console.log('✅ admin.jsx successfully updated with EnquiriesTable!');

