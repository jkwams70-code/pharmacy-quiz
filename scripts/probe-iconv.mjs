import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
const file = path.join(process.cwd(), 'AjixPharmacy-mainmerge', 'www', 'engine.js');
const raw = fs.readFileSync(file, 'utf8');
const start = raw.indexOf('const COMMUNITY_CHAT_EMOJI_CATEGORIES = [');
const end = raw.indexOf('function getCommunityEmojiCategoriesForPanel()', start);
const block = raw.slice(start, end);
const match = block.match(/"([^"\n]*Ã[^"\n]*)"/);
const sample = match && match[1];
console.log('SAMPLE', sample);
const decoders = [
  s => s,
  s => iconv.decode(iconv.encode(s, 'win1252'), 'utf8'),
  s => iconv.decode(iconv.encode(iconv.decode(iconv.encode(s, 'win1252'), 'utf8'), 'win1252'), 'utf8'),
  s => iconv.decode(iconv.encode(iconv.decode(iconv.encode(iconv.decode(iconv.encode(s, 'win1252'), 'utf8'), 'win1252'), 'utf8'), 'win1252'), 'utf8'),
];
for (const [i, fn] of decoders.entries()) {
  try {
    const out = fn(sample);
    console.log('PASS', i, out);
  } catch (e) {
    console.log('PASS', i, 'ERR', e.message);
  }
}
