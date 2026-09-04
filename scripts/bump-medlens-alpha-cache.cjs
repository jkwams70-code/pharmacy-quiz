const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/sw.js',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/sw.js',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/index.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/index.html',
];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replace(/ajix-app-shell-v\d+[-\w]*/g, 'ajix-app-shell-v91-medlens-alpha-fix');
  text = text.replace(/20260901[-\w]*/g, '20260901-medlens-alpha-fix');
  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('bumped', file);
  }
}
