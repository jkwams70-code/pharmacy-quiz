const fs = require('fs');
const html = fs.readFileSync('C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html', 'utf8');
const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi), (m) => m[1]);
fs.writeFileSync('C:/Users/John_Israel/Desktop/AJIXPHARM/medlens-inline-main.js', scripts[5] || '', 'utf8');
console.log('lines', (scripts[5] || '').split(/\r?\n/).length);
