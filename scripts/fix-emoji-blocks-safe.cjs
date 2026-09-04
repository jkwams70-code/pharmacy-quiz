const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'www', 'engine.js'),
  path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public', 'engine.js'),
];

const CP1252_REVERSE_MAP = new Map([
  [0x20AC, 0x80],
  [0x201A, 0x82],
  [0x0192, 0x83],
  [0x201E, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02C6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8A],
  [0x2039, 0x8B],
  [0x0152, 0x8C],
  [0x017D, 0x8E],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201C, 0x93],
  [0x201D, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02DC, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9A],
  [0x203A, 0x9B],
  [0x0153, 0x9C],
  [0x017E, 0x9E],
  [0x0178, 0x9F],
]);

function encodeWindows1252(text = '') {
  const bytes = [];
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
    } else if (CP1252_REVERSE_MAP.has(code)) {
      bytes.push(CP1252_REVERSE_MAP.get(code));
    } else {
      bytes.push(0x3f);
    }
  }
  return Uint8Array.from(bytes);
}

function repairValue(value = '') {
  let current = String(value ?? '');
  let best = current;
  let bestScore = score(current);
  for (let i = 0; i < 5; i++) {
    const next = new TextDecoder('utf-8', { fatal: false }).decode(encodeWindows1252(current));
    if (next === current) break;
    const nextScore = score(next);
    if (nextScore < bestScore) {
      best = next;
      bestScore = nextScore;
    }
    current = next;
  }
  return best;
}

function score(value = '') {
  const text = String(value ?? '');
  const suspicious = (text.match(/[ÃÂâðŸ�]/g) || []).length;
  const replacement = (text.match(/\uFFFD/g) || []).length;
  return suspicious * 100 + replacement * 250 + text.length;
}

function repairQuotedStrings(source) {
  return source.replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, (literal) => {
    const inner = literal.slice(1, -1);
    if (!/[ÃÂâðŸ�]/.test(inner)) return literal;
    if (inner.includes('\\')) return literal;
    const repaired = repairValue(inner);
    if (repaired === inner) return literal;
    if (score(repaired) >= score(inner)) return literal;
    return JSON.stringify(repaired);
  });
}

function findMatchingBlockEnd(source, openIndex, openChar, closeChar) {
  let depth = 0;
  let stringQuote = '';
  let escape = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i++;
      }
      continue;
    }
    if (stringQuote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === stringQuote) {
        stringQuote = '';
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      lineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      stringQuote = ch;
      continue;
    }
    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function replaceBlock(source, startMarker, openChar, closeChar) {
  const start = source.indexOf(startMarker);
  if (start === -1) return source;
  const openIndex = source.indexOf(openChar, start);
  if (openIndex === -1) return source;
  const end = findMatchingBlockEnd(source, openIndex, openChar, closeChar);
  if (end === -1) return source;
  const block = source.slice(start, end + 1);
  const repaired = repairQuotedStrings(block);
  return source.slice(0, start) + repaired + source.slice(end + 1);
}

function replaceSlice(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) return source;
  const end = source.indexOf(endMarker, start);
  if (end === -1) return source;
  const slice = source.slice(start, end);
  const repaired = repairQuotedStrings(slice);
  return source.slice(0, start) + repaired + source.slice(end);
}

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  source = replaceBlock(source, 'const COMMUNITY_EMOJI_SKIN_TONES = [', '[', ']');
  source = replaceBlock(source, 'const COMMUNITY_CHAT_EMOJI_CATEGORIES = [', '[', ']');
  source = replaceBlock(source, 'const CONTACT_COUNTRY_VISUALS = {', '{', '}');
  source = replaceSlice(source, 'function getCommunityEmojiCategoriesForPanel()', 'function getCommunityEmojiCategoryById(');
  fs.writeFileSync(file, source, 'utf8');
}

