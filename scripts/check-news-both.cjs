const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi), (m) => m[1]);
  let ok = true;
  scripts.forEach((script, index) => {
    try { new Function(script); }
    catch (error) { ok = false; console.log('bad', file, 'script', index, error.message); }
  });
  console.log(ok ? 'ok' : 'failed', file, 'scripts:', scripts.length);
}
