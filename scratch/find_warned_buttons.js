const fs = require('fs');
const pub = fs.readFileSync('react/src/public.jsx', 'utf8');
const adm = fs.readFileSync('react/src/admin.jsx', 'utf8');

const pubMatches = [...pub.matchAll(/<button[^>]*>/g)];
pubMatches.forEach((m, idx) => {
  const content = m[0];
  if (!content.includes('onClick') && !content.includes('type="submit"')) {
    const lineNum = pub.slice(0, m.index).split('\n').length;
    console.log(`Public Button #${idx} at line ${lineNum}:`);
    console.log(pub.slice(Math.max(0, m.index - 50), Math.min(pub.length, m.index + 250)));
    console.log('--------------------------------------------------');
  }
});

const admMatches = [...adm.matchAll(/<button[^>]*>/g)];
admMatches.forEach((m, idx) => {
  const content = m[0];
  if (!content.includes('onClick') && !content.includes('type="submit"')) {
    const lineNum = adm.slice(0, m.index).split('\n').length;
    console.log(`Admin Button #${idx} at line ${lineNum}:`);
    console.log(adm.slice(Math.max(0, m.index - 50), Math.min(adm.length, m.index + 250)));
    console.log('--------------------------------------------------');
  }
});

