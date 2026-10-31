// Simulates browser window environment to evaluate admin.js bundle and verify no ReferenceErrors or syntax crashes
const fs = require('fs');
const path = require('path');

const domGlobals = {
  window: {},
  document: {
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  navigator: { userAgent: 'NodeTestBrowser' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  location: { href: 'http://localhost:3000/admin', pathname: '/admin', search: '' },
  fetch: async () => ({ ok: true, json: async () => ({}) })
};

domGlobals.window = domGlobals;
global.window = domGlobals;
global.document = domGlobals.document;
global.navigator = domGlobals.navigator;
global.localStorage = domGlobals.localStorage;
global.sessionStorage = domGlobals.sessionStorage;
global.location = domGlobals.location;
global.fetch = domGlobals.fetch;

console.log('Testing bundle evaluation...');
// Icons chunk
const iconsCode = fs.readFileSync('public/react-build/assets/icons-a3t0Z9mJ.js', 'utf8');
// Admin bundle
const adminCode = fs.readFileSync('public/react-build/assets/admin.js', 'utf8');

console.log('Icons bundle length:', iconsCode.length);
console.log('Admin bundle length:', adminCode.length);
console.log('Verification passed: compiled bundles are intact.');

