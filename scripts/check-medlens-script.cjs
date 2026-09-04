const fs = require('fs');
const file = 'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html';
const html = fs.readFileSync(file, 'utf8');
const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi), (m) => m[1]);
console.log('scripts', scripts.length);
scripts.forEach((script, index) => {
  try {
    new Function(script);
    console.log('ok', index);
  } catch (error) {
    console.log('bad', index, error.message);
    const match = String(error.stack).match(/<anonymous>:(\d+):(\d+)/);
    console.log('loc', match ? match.slice(1).join(':') : 'unknown');
    if (match) {
      const lines = script.split(/\r?\n/);
      const line = Number(match[1]);
      for (let i = Math.max(1, line - 4); i <= Math.min(lines.length, line + 4); i += 1) {
        console.log(i + ': ' + lines[i - 1]);
      }
    }
  }
});
