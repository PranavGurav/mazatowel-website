const fs = require('fs');
const content = fs.readFileSync('react/src/admin.jsx', 'utf8');

// Find function SettingsEditor to end of function
const startIdx = content.indexOf('function SettingsEditor');
const endIdx = content.indexOf('function StatsEditor');

const settingsFn = content.slice(startIdx, endIdx);
console.log(settingsFn.slice(settingsFn.indexOf('return ('), settingsFn.indexOf('return (') + 600));

