const fs = require('fs');
const path = require('path');

const files = [
  'www/index.html',
  'www/styles.css',
  'www/admin/index.html',
  'www/admin/news-studio.html',
  'www/calculator.html',
  'www/news.html',
  'android/app/src/main/assets/public/index.html',
  'android/app/src/main/assets/public/styles.css',
  'android/app/src/main/assets/public/admin/index.html',
  'android/app/src/main/assets/public/admin/news-studio.html',
  'android/app/src/main/assets/public/calculator.html',
  'android/app/src/main/assets/public/news.html',
];

const replacements = [
  ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒâ€¦Ã¢â‚¬â„¢', '✓'],
  ['ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢', '✓'],
  ['ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', '★'],
  ['ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â', '🔒'],
  ['Ãƒâ€”', '×'],
  ['âœ•', '×'],
  ['âœŽ', '✎'],
  ['ðŸ—‘', '🗑'],
  ['ðŸ‘', '👁'],
  ['â† Back', '← Back'],
  ['View all â†’', 'View all →'],
  ['Loading review queueâ€¦', 'Loading review queue…'],
  ['â†', '←'],
  ['â†’', '→'],
  ['â†‘', '↑'],
  ['â†“', '↓'],
  ['â€”', '—'],
  ['Ã·', '÷'],
  ['Ã—', '×'],
  ['âˆ’', '−'],
  ['xÊ¸', 'xʸ'],
  ['âˆš', '√'],
  ['Ajix News â€” Health News (Desktop)', 'Ajix News — Health News (Desktop)'],
];

for (const rel of files) {
  const file = path.join(process.cwd(), rel);
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    console.log(`fixed ${rel}`);
  }
}
