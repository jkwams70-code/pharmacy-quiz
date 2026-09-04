const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'www', 'engine.js'),
  path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public', 'engine.js'),
];

const CP1252_MAP = new Map([
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
      continue;
    }
    if (CP1252_MAP.has(code)) {
      bytes.push(CP1252_MAP.get(code));
      continue;
    }
    bytes.push(0x3f);
  }
  return Uint8Array.from(bytes);
}

function repairPass(value = '') {
  return new TextDecoder('utf-8', { fatal: false }).decode(encodeWindows1252(value));
}

function score(value = '') {
  const text = String(value ?? '');
  const suspicious = (text.match(/[ÃÂâðŸ�]/g) || []).length;
  const replacement = (text.match(/\uFFFD/g) || []).length;
  return suspicious * 100 + replacement * 250 + text.length;
}

function repairValue(value = '') {
  const original = String(value ?? '');
  let current = original;
  let best = original;
  let bestScore = score(original);
  for (let i = 0; i < 5; i++) {
    const next = repairPass(current);
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

const helperBlock = `const MOJIBAKE_SUSPECT_RE = /[ÃÂâðŸ�]/;

function repairMojibakePass(value = "") {
  return repairPass(value);
}

function scoreMojibakeCandidate(value = "") {
  return score(value);
}

function normalizeMojibake(value = "") {
  let text = String(value ?? "");
  try {
    text = text.normalize("NFC");
  } catch {
    // ignore
  }
  if (!MOJIBAKE_SUSPECT_RE.test(text)) return text;
  let best = text;
  let bestScore = scoreMojibakeCandidate(text);
  let current = text;
  for (let i = 0; i < 5; i++) {
    const next = repairMojibakePass(current);
    if (next === current) break;
    const nextScore = scoreMojibakeCandidate(next);
    if (nextScore < bestScore) {
      best = next;
      bestScore = nextScore;
    }
    current = next;
  }
  return best;
}
`;

const blockSpecs = [
  {
    start: 'const COMMUNITY_EMOJI_SKIN_TONES = [',
    end: '];',
  },
  {
    start: 'const COMMUNITY_CHAT_EMOJI_CATEGORIES = [',
    end: '];',
  },
  {
    start: 'const CONTACT_COUNTRY_VISUALS = {',
    end: '};',
  },
  {
    start: 'function getCommunityEmojiCategoriesForPanel()',
    end: 'function getCommunityEmojiCategoryById(',
  },
];

function replaceRange(source, startMarker, endMarker, transform) {
  const start = source.indexOf(startMarker);
  if (start === -1) return source;
  const end = source.indexOf(endMarker, start);
  if (end === -1) return source;
  const block = source.slice(start, end);
  const next = transform(block);
  return source.slice(0, start) + next + source.slice(end);
}

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  const helperPattern = /const MOJIBAKE_SUSPECT_RE = [\s\S]*?function normalizeMojibake\(value = ""\) \{[\s\S]*?\n\}\n(?=function sanitizeMojibakeNode)/;
  if (!helperPattern.test(source)) {
    throw new Error(`Could not find current mojibake helper block in ${file}`);
  }
  source = source.replace(helperPattern, helperBlock + '\n');
  for (const spec of blockSpecs) {
    source = replaceRange(source, spec.start, spec.end, repairQuotedStrings);
  }
  fs.writeFileSync(file, source, 'utf8');
}
