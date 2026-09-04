const fs=require('fs');
const html=fs.readFileSync('C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html','utf8');
const scripts=Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi),m=>m[1]);
fs.writeFileSync('C:/Users/John_Israel/Desktop/AJIXPHARM/news-inline-main.js', scripts[3] || '', 'utf8');
console.log('lines', (scripts[3] || '').split(/\r?\n/).length);
