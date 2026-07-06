const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'dist', 'custom-tab-bar', 'index.json');
fs.writeFileSync(target, JSON.stringify({ component: true, usingComponents: {} }));
