const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/medlens.html',
];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replace(/\.replace\(\/<div class="contra-item-icon">x<\/div>\/g, '<div class="contra-item-icon">&#x1F6AB;<\/div>'\)\)/g,
    `.replace(/<div class="contra-item-icon">x<\\/div>/g, '<div class="contra-item-icon">&#x1F6AB;<\\/div>'))`);
  text = text.replace(/ajix-app-shell-v89-news-feed/g, 'ajix-app-shell-v90-medlens-script-fix');
  text = text.replace(/ajix-app-shell-v88-medlens-brand/g, 'ajix-app-shell-v90-medlens-script-fix');
  text = text.replace(/20260901-news-feed/g, '20260901-medlens-script-fix');
  text = text.replace(/20260901-medlens-brand/g, '20260901-medlens-script-fix');
  if (text === before) throw new Error('No replacement made in ' + file);
  fs.writeFileSync(file, text, 'utf8');
  console.log('fixed', file);
}
