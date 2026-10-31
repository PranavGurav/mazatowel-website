const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const BROWSER_GLOBALS = new Set([
  'window', 'document', 'navigator', 'console', 'localStorage', 'sessionStorage',
  'fetch', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'alert', 'confirm', 'prompt', 'location', 'history', 'FormData', 'Blob', 'File',
  'FileReader', 'URL', 'URLSearchParams', 'AudioContext', 'webkitAudioContext',
  'Image', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
  'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Error', 'TypeError',
  'RangeError', 'SyntaxError', 'ReferenceError', 'parseInt', 'parseFloat', 'isNaN',
  'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
  'Intl', 'atob', 'btoa', 'requestAnimationFrame', 'cancelAnimationFrame',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'performance',
  'crypto', 'TextEncoder', 'TextDecoder', 'Event', 'CustomEvent', 'MouseEvent',
  'KeyboardEvent', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'HTMLCanvasElement',
  'CanvasRenderingContext2D', 'Infinity', 'NaN', 'undefined', 'null', 'globalThis'
]);

function checkFile(filePath) {
  console.log(`\n🔍 Checking unbound identifiers in: ${filePath}`);
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });

  const unbound = new Map();

  traverse(ast, {
    ReferencedIdentifier(path) {
      const name = path.node.name;
      // Skip property keys like obj.foo
      if (path.parentPath.isMemberExpression({ property: path.node }) && !path.parentPath.node.computed) {
        return;
      }
      // Skip object pattern / destructuring keys: { foo: bar } -> foo is key, bar is id
      if (path.parentPath.isObjectProperty({ key: path.node }) && !path.parentPath.node.computed) {
        return;
      }
      // Skip JSX attribute names: <Tag foo="bar" />
      if (path.parentPath.isJSXAttribute({ name: path.node })) {
        return;
      }
      // Skip type annotations or export specifiers
      if (path.parentPath.isExportSpecifier()) {
        return;
      }

      // Check scope binding
      const binding = path.scope.getBinding(name);
      if (!binding && !BROWSER_GLOBALS.has(name)) {
        if (!unbound.has(name)) {
          unbound.set(name, path.node.loc?.start?.line || 0);
        }
      }
    }
  });

  if (unbound.size === 0) {
    console.log(`✅ No unbound identifiers found in ${filePath}!`);
  } else {
    console.log(`❌ Found ${unbound.size} unbound identifier(s) in ${filePath}:`);
    for (const [name, line] of unbound.entries()) {
      console.log(`   - line ${line}: "${name}"`);
    }
  }
  return unbound;
}

const adminIssues = checkFile('react/src/admin.jsx');
const publicIssues = checkFile('react/src/public.jsx');

if (adminIssues.size > 0 || publicIssues.size > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL FILES ARE 100% CLEAN OF UNDEFINED IDENTIFIERS!');
}

