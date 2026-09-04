const fs = require('fs');
const path = require('path');
const iconv = require('../iconv-lite');
const file = path.join(process.cwd(), 'www', 'engine.js');
const raw = fs.readFileSync(file, 'utf8');
const start = raw.indexOf('const COMMUNITY_CHAT_EMOJI_CATEGORIES = [');
const end = raw.indexOf('function getCommunityEmojiCategoriesForPanel()', start);
const block = raw.slice(start, end);
const match = block.match(/"([^"\n]*Ã[^"\n]*)"/);
const sample = match && match[1];
console.log('SAMPLE', sample);
function cycle(s, rounds) {
  let out = s;
  for (let i = 0; i < rounds; i++) {
    out = iconv.decode(iconv.encode(out, 'win1252'), 'utf8');
  }
  return out;
}
for (let i = 0; i <= 4; i++) {
  try {
    console.log('PASS', i, cycle(sample, i));
  } catch (e) {
    console.log('PASS', i, 'ERR', e.message);
  }
}
