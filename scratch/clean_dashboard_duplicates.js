const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'react', 'src', 'admin.jsx');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Remove sticky action banner (dash-action-banner)
const bannerRegex = /\s*\{\/\* 0\. Sticky Action Required Banner[\s\S]*?\{newEnquiries\.length > 0 && \([\s\S]*?className="dash-action-banner"[\s\S]*?<\/div>\s*\)\}\s*/;
if (!bannerRegex.test(content)) {
  console.error('Could not find dash-action-banner in admin.jsx!');
  process.exit(1);
}
content = content.replace(bannerRegex, '\n');
console.log('1. Removed dash-action-banner');

// 2. Remove duplicate badges from dash-view-tabs
const tab1BadgeRegex = /\{newEnquiries\.length > 0 && \(\s*<span className="dash-tab-badge" style=\{\{ background: '#fee2e2', color: '#b91c1c' \}\}>\s*⚡ \{newEnquiries\.length\} New\s*<\/span>\s*\)\}/;
if (tab1BadgeRegex.test(content)) {
  content = content.replace(tab1BadgeRegex, '');
  console.log('2a. Removed newEnquiries badge from overview tab');
} else {
  console.warn('Could not find tab1BadgeRegex');
}

const tab2BadgeRegex = /<span className="dash-tab-badge" style=\{\{ background: '#dcfce7', color: '#15803d' \}\}>\s*🟢 \{activeNow\} Live · \{todayVisitors\} Today\s*<\/span>/;
if (tab2BadgeRegex.test(content)) {
  content = content.replace(tab2BadgeRegex, '');
  console.log('2b. Removed live traffic badge from visitor tab');
} else {
  console.warn('Could not find tab2BadgeRegex');
}

// 3. Remove duplicate ROW 3 telemetry card in overview mode
const telemetryRowRegex = /\s*\{\/\* ROW 3: Integrated Live Store Traffic & Telemetry Strip \*\/\}[\s\S]*?<div className="dash-telemetry-card" id="card-traffic-telemetry">[\s\S]*?<\/div>\s*<\/div>\s*(?=\s*<\/div>\s*<\/div>\s*\)\s*\}\s*\{\/\* 5)/;
if (telemetryRowRegex.test(content)) {
  content = content.replace(telemetryRowRegex, '');
  console.log('3. Removed duplicate ROW 3 telemetry card from overview');
} else {
  console.warn('Could not find telemetryRowRegex - trying alternative match');
  const altTelemetryRegex = /\{\/\* ROW 3: Integrated Live Store Traffic & Telemetry Strip \*\/\}[\s\S]*?<div className="dash-telemetry-card" id="card-traffic-telemetry">[\s\S]*?<\/div>\s*<\/div>\s*(?=\s*<\/div>\s*<\/div>)/;
  if (altTelemetryRegex.test(content)) {
    content = content.replace(altTelemetryRegex, '');
    console.log('3. Removed duplicate ROW 3 telemetry card from overview (alt)');
  } else {
    console.error('Failed to find telemetry card');
    process.exit(1);
  }
}

// 4. Remove duplicate slick-status-ribbon at bottom
const ribbonRegex = /\s*\{\/\* 5\. Clean Catalog Pulse Ribbon \(Footer Overview\) \*\/\}[\s\S]*?<div className="slick-status-ribbon"[\s\S]*?<\/div>\s*/;
if (ribbonRegex.test(content)) {
  content = content.replace(ribbonRegex, '\n');
  console.log('4. Removed duplicate slick-status-ribbon');
} else {
  console.warn('Could not find ribbonRegex');
}

// 5. Update topbar live pill so it doesn't duplicate the dashboard card
content = content.replace(
  "section === 'dashboard' && (",
  "section !== 'dashboard' && ("
);
console.log('5. Updated topbar live pill to section !== dashboard');

fs.writeFileSync(adminPath, content, 'utf8');
console.log('All duplicate information removed successfully!');

