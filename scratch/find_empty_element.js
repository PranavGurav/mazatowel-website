const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('react/src/admin.jsx', 'utf8');
const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

// Let's find SettingsEditor declaration and inspect its JSX return
traverse(ast, {
  FunctionDeclaration(path) {
    if (path.node.id && (path.node.id.name === 'SettingsEditor' || path.node.id.name === 'ContentEditor' || path.node.id.name === 'StatsEditor' || path.node.id.name === 'Admin')) {
      console.log(`\n=== Function ${path.node.id.name} ===`);
      path.traverse({
        ReturnStatement(rPath) {
          if (rPath.node.argument && rPath.node.argument.type === 'JSXElement') {
            console.log('Top JSX tag in return: <' + rPath.node.argument.openingElement.name.name + '>');
            rPath.node.argument.openingElement.attributes.forEach(attr => {
              if (attr.name) {
                console.log('  attr:', attr.name.name, attr.value ? (attr.value.value || 'expr') : '');
              }
            });
            // First children
            rPath.node.argument.children.forEach(child => {
              if (child.type === 'JSXElement') {
                console.log('  child: <' + child.openingElement.name.name + '>');
                child.openingElement.attributes.forEach(attr => {
                  if (attr.name) console.log('    attr:', attr.name.name, attr.value ? (attr.value.value || 'expr') : '');
                });
              }
            });
          }
        }
      });
    }
  }
});

