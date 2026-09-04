const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/medlens.html',
];
const marker = `
    function renderAlphaGroupedList(list, getName, renderItem) {
`;
const helper = `
    function getAlphaGroupLabel(value) {
        const first = String(value || '').trim().charAt(0).toUpperCase();
        return /^[A-Z]$/.test(first) ? first : '#';
    }
`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) throw new Error('Missing renderAlphaGroupedList marker in ' + file);
  if (!text.includes('function getAlphaGroupLabel(value)')) {
    text = text.replace(marker, helper + marker);
  }
  fs.writeFileSync(file, text, 'utf8');
  console.log('fixed', file);
}
